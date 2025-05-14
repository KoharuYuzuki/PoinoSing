import {
  kanas, envKeys, phonemeMixPattern,
  bpmSchema, noteSchema, speakerVoiceComputedSchema,
} from './schemata'
import type {
  KanaEnum, EnvKeyEnum, Note, SpeakerVoiceComputed
} from './schemata'
import {
  int, tick2sec, pitch2freq, computeSpeakerVoice
} from './utils'
import { laychieVoice } from './speakers/laychie'
import { layneyVoice } from './speakers/layney'

export function synthesizeNote(
  bpm: number,
  note: Note,
  speakerVoice: SpeakerVoiceComputed
) {
  bpmSchema.parse(bpm)
  noteSchema.parse(note)
  speakerVoiceComputedSchema.parse(speakerVoice)

  const voice = speakerVoice
  const fs    = speakerVoice.fs

  const lyric = note.lyric
  const phonemeTimingsLen = note.phonemeTimings.length

  const phonemes: (EnvKeyEnum | string)[] = []
  const volumes: number[] = []

  const phonemeTimings: number[] = []

  if ((kanas as unknown as string[]).includes(lyric)) {
    const kana = voice.kanas[lyric as KanaEnum]!
    const envsLen = kana.length || 0

    if (phonemeTimingsLen !== envsLen) {
      throw new Error(
        `number of elements in "phonemeTimingsLen" and "envsLen" do not match. expect ${envsLen}, but got ${phonemeTimingsLen}.`
      )
    }

    kana.forEach(({envKey}) => phonemes.push(envKey))
    kana.forEach(({vol}) => volumes.push(vol))
    note.phonemeTimings.toSorted((a, b) => a - b).forEach((tick) => phonemeTimings.push(tick))
  } else {
    const expect = 1

    if (phonemeTimingsLen !== expect) {
      throw new Error(
        `value of "phonemeTimingsLen" is invalid. expect ${expect}, but got ${phonemeTimingsLen}.`
      )
    }

    phonemes.push(lyric as EnvKeyEnum | string)
    volumes.push(1)
    phonemeTimings.push(note.phonemeTimings[0])
  }

  const offsetTick = phonemeTimings[0]
  const durationTick = Math.max(note.end - note.begin, 0) + Math.max(-offsetTick, 0)
  const duration = tick2sec(durationTick, bpm)
  const waveLen = int(fs * duration)

  if (waveLen <= 0) {
    const raw = new Float32Array()
    return {
      wave: raw,
      offset: 0
    }
  }

  if (['、', 'q'].includes(lyric)) {
    const raw = new Float32Array(waveLen)
    return {
      wave: raw,
      offset: 0
    }
  }

  const pitch = note.pitch
  const f0Seg = note.f0Seg
  const volumeSeg = note.volumeSeg
  const phonemeTimingPercent = phonemeTimings.map((tick) => tick2sec(tick + -offsetTick, bpm) / duration)

  const wave = synthWave(
    duration,
    pitch,
    f0Seg,
    volumeSeg,
    phonemeTimingPercent,
    phonemes,
    volumes,
    voice
  )

  const raw = Float32Array.from(wave)

  return {
    wave: raw,
    offset: offsetTick
  }
}

export function getSpeakers() {
  return {
    laychie: laychieVoice,
    layney:  layneyVoice
  }
}

export function getComputedSpeakers() {
  return {
    laychie: computeSpeakerVoice(laychieVoice),
    layney:  computeSpeakerVoice(layneyVoice)
  }
}

function synthWave(
  duration: number,
  pitch: number,
  f0Seg: number[],
  volSeg: number[],
  timingPercent: number[],
  phonemes: (EnvKeyEnum | string)[],
  volumes: number[],
  voice: SpeakerVoiceComputed
) {
  const fs      = voice.fs
  const segLen  = voice.segLen
  const waveLen = int(fs * duration)
  const freq    = pitch2freq(pitch)

  const wave: number[] = new Array(waveLen).fill(0)
  let position = 0

  while (position < waveLen) {
    const percent = position / waveLen
    const f0 = f0Seg[Math.floor(f0Seg.length * percent)] * freq

    const indexApproximate = timingPercent.findLastIndex((_percent) => _percent <= percent)
    if (indexApproximate === -1) break

    const phoneme = phonemes[indexApproximate]
    let phonemeVolume = volumes[indexApproximate]

    let segment: number[]

    if (envKeys.includes(phoneme as EnvKeyEnum)) {
      const waves = voice.waves[phoneme as EnvKeyEnum]
      if (!waves) break

      const waveIndex = Math.floor(Math.random() * waves.length)
      segment = waves[waveIndex]
    } else {
      const split = phoneme.replaceAll(' ', '').split(',')
      const segmentSummed = [...new Array(segLen)].fill(0)
      let phonemeVolumeSummed = 0

      for (let i = 0; i < split.length; i++) {
        const result = phonemeMixPattern.exec(split[i])
        if (!result || !result.groups) continue

        const envKey = result.groups.phoneme as EnvKeyEnum
        const value = Number(result.groups.value)

        const waves = voice.waves[envKey]
        if (!waves) continue

        const waveIndex = Math.floor(Math.random() * waves.length)
        const segment = waves[waveIndex].map((x) => x * value)

        for (let j = 0; j < segLen; j++) {
          segmentSummed[j] += segment[j]
        }

        phonemeVolumeSummed += value
      }

      segment = segmentSummed
      phonemeVolume *= phonemeVolumeSummed
    }

    const volume = (
      phonemeVolume *
      (0.5 + (Math.sin(Math.PI * (Math.log10(percent * 9 + 1) / Math.log10(10))) * 0.5))
    )

    const max = segment.map((x) => Math.abs(x)).reduce((a, b) => Math.max(a, b))
    const adjuster = (max != 0) ? volume / max : 0
    const adjusted = segment.map((x) => x * adjuster)

    const begin = Math.round(position)
    const end = begin + adjusted.length

    if (end >= waveLen) break

    for (let i = 0; i < adjusted.length; i++) {
      wave[begin + i] += adjusted[i]
    }

    position += Math.min(fs / f0, fs)
  }

  const adjusted = wave.map((x, i) => x * volSeg[Math.floor(volSeg.length * (i / waveLen))])

  return adjusted
}
