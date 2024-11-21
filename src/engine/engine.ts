import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgpu'
import { WebGPUBackend } from '@tensorflow/tfjs-backend-webgpu/dist/backend_webgpu'
import {
  synthFs, kanas, envKeyVolumes, bpmSchema, noteSchema, speakerVoiceSchema
} from './schemata'
import type {
  KanaEnum, EnvKeyEnum, Note, SpeakerVoice
} from './schemata'
import {
  canUseWebGPU, rfftfreq, argMin, avg, resample,
  int, linspace, interp, tick2sec, pitch2freq
} from './utils'
import { laychieVoice } from './speakers/laychie'
import { layneyVoice } from './speakers/layney'

export class PoinoSingEngine {
  constructor() {}

  init() {
    return (
      Promise.resolve()
      .then(() => {
        if (!canUseWebGPU) {
          return Promise.reject('WebGPU is not available in this environment')
        }

        return tf.setBackend('webgpu')
      })
      .then(() => tf.ready())
      .then(() => {
        const backend = tf.backend() as WebGPUBackend
        (backend.bufferManager as any)._releaseBuffer = backend.bufferManager.releaseBuffer

        function releaseBuffer (buffer: GPUBuffer, reuse: boolean = false) {
          // @ts-ignore
          return this._releaseBuffer(buffer, reuse)
        }

        backend.bufferManager.releaseBuffer = releaseBuffer
      })
    )
  }

  synthesizeNote(
    bpm: number,
    note: Note,
    speakerVoice: SpeakerVoice
  ) {
    return new Promise<{
      wave: Float32Array
      offset: number
    }>((resolve, reject) => {
      tf.tidy(() => {
        this._synthesizeNote(
          bpm,
          note,
          speakerVoice
        )
        .then(resolve)
        .catch(reject)
      })
    })
  }

  static getSpeakers() {
    return {
      laychie: laychieVoice,
      layney:  layneyVoice
    }
  }

  private _synthesizeNote(
    bpm: number,
    note: Note,
    speakerVoice: SpeakerVoice
  ) {
    bpmSchema.parse(bpm)
    noteSchema.parse(note)
    speakerVoiceSchema.parse(speakerVoice)

    const voice = speakerVoice
    const fs    = speakerVoice.fs

    const lyric = note.lyric
    const phonemeTimingsLen = note.phonemeTimings.length

    const phonemes: EnvKeyEnum[] = []
    const phonemeTimings: number[] = []

    if ((kanas as unknown as string[]).includes(lyric)) {
      const kana = voice.kanas[lyric as KanaEnum]
      const envsLen = kana?.length || 0

      if (phonemeTimingsLen !== envsLen) {
        throw new Error(
          `number of elements in "phonemeTimingsLen" and "envsLen" do not match. expect ${envsLen}, but got ${phonemeTimingsLen}.`
        )
      }

      kana?.forEach(({envKey}) => phonemes.push(envKey))
      note.phonemeTimings.toSorted((a, b) => a - b).forEach((tick) => phonemeTimings.push(tick))
    } else {
      const expect = 1

      if (phonemeTimingsLen !== expect) {
        throw new Error(
          `value of "phonemeTimingsLen" is invalid. expect ${expect}, but got ${phonemeTimingsLen}.`
        )
      }

      phonemes.push(lyric as EnvKeyEnum)
      phonemeTimings.push(note.phonemeTimings[0])
    }

    const offsetTick = phonemeTimings[0]
    const durationTick = Math.max(note.end - note.begin, 0) + Math.max(-offsetTick, 0)
    const duration = tick2sec(durationTick, bpm)
    const waveLen = int(fs * duration)

    if (waveLen <= 0) {
      const raw = new Float32Array()
      return Promise.resolve({
        wave: raw,
        offset: 0
      })
    }

    if (['、', 'q'].includes(lyric)) {
      const raw = new Float32Array(waveLen)
      return Promise.resolve({
        wave: raw,
        offset: 0
      })
    }

    const pitch = note.pitch
    const f0Seg = note.f0Seg
    const volumeSeg = note.volumeSeg
    const phonemeTimingPercent = phonemeTimings.map((tick) => tick2sec(tick + -offsetTick, bpm) / duration)

    const wave = tf.tidy(() => {
      return this.synthWave(
        duration,
        pitch,
        f0Seg,
        volumeSeg,
        phonemeTimingPercent,
        phonemes,
        voice
      )
    })

    return new Promise<{
      wave: Float32Array
      offset: number
    }>((resolve, reject) => {
      try {
        const raw = wave.dataSync<'float32'>()
        resolve({
          wave: raw,
          offset: offsetTick
        })
      } catch (e) {
        reject(e)
      }

      wave.dispose()
    })
  }

  private synthWave(
    duration: number,
    pitch: number,
    f0Seg: number[],
    volSeg: number[],
    timingPercent: number[],
    phonemes: EnvKeyEnum[],
    voice: SpeakerVoice
  ) {
    const fsMag    = synthFs / voice.fs
    const fs       = int(voice.fs * fsMag)
    const segLen   = int(voice.segLen * fsMag)
    const specLen  = ((segLen % 2) === 0) ? ((segLen / 2) + 1) : ((segLen + 1) / 2)
    const shiftLen = int(voice.shiftLen * fsMag)
    const shiftNum = voice.shiftNum
    const waveLen  = int(fs * duration)
    const freq     = pitch2freq(pitch)

    const specs = Object.fromEntries(
      Object.keys(voice.envelopes)
      .filter((key) => phonemes.includes(key as EnvKeyEnum))
      .map((key) => {
        const envKey = key as EnvKeyEnum
        const env = voice.envelopes[envKey]

        if (env === undefined) {
          return [
            envKey,
            linspace(0, 0, specLen)
          ]
        }

        const x: number[] = []
        const y: number[] = []
        const z = linspace(0, fs / 2, specLen)

        env.forEach((point) => {
          x.push(point[0])
          y.push(Math.pow(10, point[1]) - 1)
        })

        const interpolated = interp(x, y, z)

        return [
          envKey,
          interpolated
        ]
      })
    ) as { [key in EnvKeyEnum]: number[] }

    const voicedAp = (f0: number) => {
      const f0Mag = 20
      const ratio = (f0 * f0Mag) / (fs / 2)
      const tanhMag = 10
      const apMag = 0.6

      return tf.tidy(() => {
        return tf.mul(
          tf.div(
            tf.add(
              tf.tanh(
                tf.linspace(
                  -ratio * tanhMag,
                  (1 - ratio) * tanhMag,
                  specLen
                )
              ),
              1
            ),
            2
          ),
          apMag
        )
      })
    }

    const unvoicedAp = () => {
      const apMag = 0.6
      return tf.fill([specLen], apMag)
    }

    let wave = tf.zeros([waveLen])
    let position = 0

    let prevEnvKey: EnvKeyEnum | null = null
    let prevSegment: tf.Tensor | null = null
    let prevSegmentPosition = 0

    const a4Pitch = 69
    const a4Freq = pitch2freq(a4Pitch)
    const segmentDisposingThreshold = Math.round(fs / a4Freq)

    const rfftFreqs = rfftfreq(segLen, 1.0 / fs)
    const specSplitFrerq = 1000
    const specSplitFrerqIndex = argMin(rfftFreqs.map((rfftFreq) => Math.abs(rfftFreq - specSplitFrerq)))

    const window = tf.signal.hammingWindow(segLen)

    while ((position + segLen + (shiftLen * shiftNum)) < waveLen) {
      const percent = position / waveLen
      const f0 = f0Seg[int(f0Seg.length * percent)] * freq

      const indexApproximate = timingPercent.findLastIndex((_percent) => _percent <= percent)
      if (indexApproximate === -1) break

      const envKey = phonemes[indexApproximate]

      let disposeSegment: boolean

      if (envKey !== prevEnvKey) {
        disposeSegment = true
      } else if ((position - prevSegmentPosition) < segmentDisposingThreshold) {
        disposeSegment = false
      } else {
        disposeSegment = true
      }

      let segment: tf.Tensor

      if (disposeSegment) {
        if (prevSegment !== null) {
          prevSegment.dispose()
        }

        const spec = specs[envKey]

        const specLowAvg = avg(spec.slice(0, specSplitFrerqIndex))
        const specHighAvg = avg(spec.slice(specSplitFrerqIndex))

        const ap = (specHighAvg > specLowAvg) ? unvoicedAp() : voicedAp(f0)

        const phase = tf.tidy(() => {
          const phase = tf.mul(
            tf.randomUniform([specLen], 0, 2 * Math.PI),
            ap
          )

          ap.dispose()

          return phase
        })

        segment = tf.tidy(() => {
          const ifft = tf.reshape(
            tf.spectral.irfft(
              tf.mul(
                tf.complex(tf.zerosLike(spec), spec),
                tf.complex(tf.cos(phase), tf.sin(phase))
              )
            ),
            [segLen]
          )

          const leftBegin = segLen / 2
          const leftLen = segLen / 2

          const rightBegin = 0
          const rightLen = segLen / 2

          const edited = tf.mul(
            tf.concat([
              ifft.slice(leftBegin, leftLen),
              ifft.slice(rightBegin, rightLen)
            ]),
            window
          )

          const reverbed = tf.tidy(() => {
            let reverbed = tf.zeros([segLen + (shiftLen * shiftNum)])

            for (let i = 0; i < (shiftNum + 1); i++) {
              const sliced = reverbed.slice(shiftLen * i, segLen)
              const added = tf.add(
                sliced,
                edited
              )

              const indices = tf.tensor2d(
                [...new Array(segLen)].map((_, j) => (shiftNum * i) + j),
                [segLen, 1],
                'int32'
              )

              const updated = tf.tensorScatterUpdate(
                reverbed,
                indices,
                added
              )

              sliced.dispose()
              added.dispose()
              indices.dispose()
              reverbed.dispose()

              reverbed = updated
            }

            return reverbed
          })

          phase.dispose()
          ifft.dispose()
          edited.dispose()

          return reverbed
        })

        prevEnvKey = envKey
        prevSegment = segment
        prevSegmentPosition = position
      } else {
        segment = prevSegment as tf.Tensor
      }

      wave = tf.tidy(() => {
        const volume = (
          envKeyVolumes[envKey] *
          (0.5 + (Math.sin(Math.PI * (Math.log10(percent * 9 + 1) / Math.log10(10))) * 0.5))
        )
        const max = tf.max(tf.abs(segment))
        const adjuster = tf.divNoNan([volume], max)
        const adjusted = tf.mul(segment, adjuster)

        const begin = position
        const end = begin + segLen + (shiftLen * shiftNum)
        const padBefore = tf.zeros([begin])
        const padAfter = tf.zeros([waveLen - end])
        const merged = tf.add(
          wave,
          tf.concat([
            padBefore,
            adjusted,
            padAfter
          ])
        )

        wave.dispose()
        max.dispose()
        adjuster.dispose()
        adjusted.dispose()
        padBefore.dispose()
        padAfter.dispose()

        return merged
      })

      position += Math.min(
        Math.round(fs / f0),
        fs
      )
    }

    prevSegment?.dispose()
    window.dispose()

    wave = tf.tidy(() => {
      const indices = [...new Array(int(waveLen / fsMag))].map((_, i) => int(i * fsMag))
      const resampled = tf.gather(wave, indices)

      wave.dispose()

      return resampled
    })

    const volSegResampled = resample(volSeg, wave.shape[0])

    wave = tf.tidy(() => {
      const adjusted = tf.mul(
        wave,
        volSegResampled
      )

      wave.dispose()

      return adjusted
    })

    return wave
  }
}
