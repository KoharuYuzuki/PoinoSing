import { defineComponent, toRaw } from 'vue'
import type { PropType } from 'vue'
import { mapWritableState } from 'pinia'
import { getSpeakers, schemata, utils } from '../engine'
import { uuid, downloadFile, readFile, alert, openFileDialog, kata2hira, note2hash } from '../utils'
import { parseUST } from '../ust'
import type { WorkerResult, Message, SynthData } from '../worker'
import { useStore, bpmDefault, bpmMin, quarterNoteTick } from './storage'
import type { StorageInstance, Lyric, Note, VocalTrack, AudioTrack, Track } from './storage'
import { basename, extname } from 'pathe'

export type NoteCacheData = {
  hash: string
  wave: Float32Array
  offset: number
}

const speakers = getSpeakers()
const noteCaches: { [key: string]: NoteCacheData } = {}
const players: { [key: string]: HTMLAudioElement } = {}

const trackNameDefault = '名称未設定'
const trackColors = [
  '#75C6C3',
  '#C47579',
  '#89C475',
  '#7599C4',
  '#C4B075',
  '#C49175',
  '#A175C4',
] as const
const lyricDefault: Lyric = 'ら'
const speakerDefaultId: schemata.SpeakerIdEnum = 'laychie'
const volumeDefault = 0.5

const component = defineComponent({
  data(): {
    worker: Worker
    synthPromise: Promise<void>
    specImgState: {
      state: 'disabled' | 'enabled' | 'switching'
      trackId: string | null
    }
  } {
    return {
      worker: new Worker('./worker.js', { type: 'module' }),
      synthPromise: Promise.resolve(),
      specImgState: {
        state: 'disabled',
        trackId: null
      }
    }
  },
  props: {
    storage: {
      type: [Object, null] as PropType<StorageInstance | null>,
      required: true
    }
  },
  methods: {
    postMessageToWorker(message: Message) {
      this.worker.postMessage(message)
    },
    initEngine() {
      return new Promise<void>((resolve, reject) => {
        const id = uuid()

        window.addEventListener(id, (event) => {
          const result = (event as CustomEvent).detail as WorkerResult

          if (result.type === 'success') {
            console.log('engine:ready')
            resolve()
          } else {
            alert([
              '合成エンジンの初期化に失敗しました',
              'ページを再読み込みしてください',
              String(result.data)
            ])
            reject(result.data)
          }
        }, { once: true })

        this.postMessageToWorker({
          id:   id,
          type: 'engine:init',
          data: null
        })
      })
    },
    synthNote(data: SynthData) {
      return new Promise<{
        wave: Float32Array
        offset: number
      }>((resolve, reject) => {
        const id = uuid()

        window.addEventListener(id, (event) => {
          const result = (event as CustomEvent).detail as WorkerResult

          if (result.type === 'success') {
            console.log('note:synth')
            const { wave, offset } = result.data as { wave: Float32Array, offset: number }
            resolve({ wave, offset })
          } else {
            alert([
              '音声の合成に失敗しました',
              '繰り返し表示される場合はページを再読み込みしてください',
              String(result.data)
            ])
            reject(result.data)
          }
        }, { once: true })

        this.postMessageToWorker({
          id:   id,
          type: 'engine:synth',
          data: {
            bpm:       data.bpm,
            note:      data.note,
            speakerId: data.speakerId,
          }
        })
      })
    },
    drawWave(url: string) {
      return new Promise<string>((resolve, reject) => {
        const id = uuid()

        window.addEventListener(id, (event) => {
          const result = (event as CustomEvent).detail as WorkerResult

          if (result.type === 'success') {
            resolve(result.data)
          } else {
            alert([
              '波形のレンダリングに失敗しました',
              String(result.data)
            ])
            reject(result.data)
          }
        }, { once: true })

        const ctx = new AudioContext()

        fetch(url)
        .then((res) => res.arrayBuffer())
        .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer))
        .then((audioBuffer) => {
          const fs = audioBuffer.sampleRate
          const numChannels = audioBuffer.numberOfChannels
          const dataArray: Float32Array[] = []

          for (let i = 0; i < numChannels; i++) {
            dataArray.push(audioBuffer.getChannelData(i))
          }

          this.postMessageToWorker({
            id:   id,
            type: 'wave:draw',
            data: {
              fs,
              dataArray
            }
          })
        })
        .catch(reject)
      })
    },
    drawSpec(trackId: string, url: string) {
      return new Promise<void>((resolve, reject) => {
        const ctx = new AudioContext()
        const segmentDuration = 4

        fetch(url)
        .then((res) => res.arrayBuffer())
        .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer))
        .then((audioBuffer) => {
          const fs = audioBuffer.sampleRate
          const duration = audioBuffer.duration
          const numChannels = audioBuffer.numberOfChannels
          const numSegment = Math.ceil(duration / segmentDuration)
          let promise: Promise<void> = Promise.resolve()

          for (let i = 0; i < numSegment; i++) {
            const begin = segmentDuration * i
            const end = Math.min(begin + segmentDuration, duration)

            const beginIndex = utils.int(fs * begin)
            const endIndex = utils.int(fs * end)

            const dataArray: Float32Array[] = []

            for (let j = 0; j < numChannels; j++) {
              const data = audioBuffer.getChannelData(j)
              const sliced = data.slice(beginIndex, endIndex)
              dataArray.push(sliced)
            }

            promise =
              promise
              .then(() => {
                if (this.specImgState.state !== 'switching') {
                  return Promise.resolve()
                }

                return new Promise<void>((resolve, reject) => {
                  const id = uuid()

                  window.addEventListener(id, (event) => {
                    const result = (event as CustomEvent).detail as WorkerResult

                    if (result.type === 'success') {
                      const img = {
                        url: result.data,
                        offset: begin,
                        duration: end - begin
                      }

                      if (this.specImgState.state === 'switching') {
                        if (!(trackId in this.specImages)) {
                          this.specImages[trackId] = []
                        }

                        this.specImages[trackId].push({
                          url: img.url,
                          offset: img.offset,
                          duration: img.duration,
                          hidden: false
                        })
                      }

                      resolve()
                    } else {
                      alert([
                        'スペクトログラムのレンダリングに失敗しました',
                        String(result.data)
                      ])
                      reject(result.data)
                    }
                  }, { once: true })

                  this.postMessageToWorker({
                    id:   id,
                    type: 'spec:draw',
                    data: {
                      fs,
                      dataArray
                    }
                  })
                })
              })
          }

          return promise
        })
        .then(resolve)
        .catch(reject)
      })
    },
    synthVocalTrack(trackId: string) {
      const vocalTracks = this.getTracks().filter((track) => track.type === 'vocal')
      const total =
        vocalTracks
        .flatMap((track) => track.notes)
        .filter((note) => !this.hasNoteCache(note.id))
        .length

      this.$emit('updateProgressTotal', total)

      this.synthPromise =
        this.synthPromise
        .then(() => {
          return new Promise<void>((resolve, reject) => {
            const track = this.getTracks().find((track) => track.id === trackId)
            if (track === undefined) {
              throw new Error(`invalid trackId => ${trackId}`)
            }
            if (track.type !== 'vocal') {
              throw new Error(`track.type must be vocal => ${track.type}`)
            }

            const bpm = this.getBpm()
            const speakerId = track.speakerId
            const speaker = speakers[speakerId]
            const fs = speaker.fs
            const notes = track.notes

            let raw: Float32Array

            if (track.notes.length <= 0) {
              raw = new Float32Array(0)
            } else {
              const lastNote = notes.reduce((a, b) => (a.end > b.end) ? a : b)
              const adjSec = 0.1
              const rawLen = utils.int(fs * (utils.tick2sec(lastNote.end, bpm) + adjSec))
              raw = new Float32Array(rawLen)
            }

            const sorted = notes.toSorted((a, b) => b.begin - a.begin)
            const hashes = sorted.map((note) => note2hash(note))
            let promise: Promise<number | null> = Promise.resolve(null)

            const adjSec = 0.01
            const adjTick = utils.sec2tick(adjSec, bpm)

            for (let i = 0; i < sorted.length; i++) {
              const note = sorted[i]
              const notesHash = hashes.slice(Math.max(i - 2, 0), i + 1).join(',')

              if (this.checkNoteOverlapping(trackId, note.id)) {
                if (!this.hasNoteCache(note.id)) {
                  this.$emit('updateProgressCurrentRelative', 1)
                }

                continue
              }

              promise =
                promise
                .then((prevBegin) => {
                  if (this.hasNoteCache(note.id)) {
                    const { hash, wave, offset } = this.getNoteCache(note.id)

                    if (hash === notesHash) {
                      return { wave, offset }
                    } else {
                      this.removeNoteCache(track.id, note.id)
                    }
                  }

                  const cloned = structuredClone(toRaw(note))

                  if ((prevBegin !== null) && (prevBegin < cloned.end)) {
                    const newEnd = Math.floor(prevBegin + adjTick)
                    const sub = Math.max(cloned.end - newEnd, 0)

                    cloned.end = newEnd
                    cloned.f0Seg = cloned.f0Seg.slice(0, (sub === 0) ? undefined : -sub)
                    cloned.volumeSeg = cloned.volumeSeg.slice(0, (sub === 0) ? undefined : -sub)
                  } else {
                    cloned.end += Math.floor(adjTick)
                  }

                  return (
                    this.synthNote({
                      bpm:       bpm,
                      note:      cloned,
                      speakerId: speakerId
                    })
                    .then(({wave, offset}) => {
                      this.$emit('updateProgressCurrentRelative', 1)
                      const hash = notesHash
                      this.setNoteCache(note.id, { hash, wave, offset })
                      return { wave, offset }
                    })
                  )
                })
                .then(({ wave, offset }) => {
                  let rawBegin = utils.int(fs * utils.tick2sec(note.begin + offset, bpm))
                  let waveBegin = 0

                  if (rawBegin < 0) {
                    waveBegin += -rawBegin
                    rawBegin = 0
                  }

                  for (let i = waveBegin; i < wave.length; i++) {
                    raw[rawBegin + i] += wave[i]
                  }

                  return note.begin + offset
                })
            }

            promise
            .then(() => {
              const wav = utils.raw2wav<Float32Array>(
                raw,
                fs,
                1,
                Float32Array
              )

              const blob = new Blob([wav], { type: 'audio/wav' })
              const url = URL.createObjectURL(blob)
              const player = players[track.id]

              if (player) {
                URL.revokeObjectURL(player.src)
                player.src = url
              }

              resolve()
            })
            .catch(reject)
          })
        })
        .catch(console.error)
        .finally(() => this.synthPromise = Promise.resolve())
    },
    synthVocalTrackAll() {
      this.getTracks()
      .filter((track) => track.type === 'vocal')
      .forEach((track) => this.synthVocalTrack(track.id))

      return new Promise<void>((resolve, reject) => {
        this.synthPromise
        .then(() => resolve())
        .catch(reject)
      })
    },
    checkNoteOverlapping(trackId: string, noteId: string) {
      const track = this.getTrack(trackId)
      if (track?.type !== 'vocal') return false

      const notes = track.notes
      if (notes.length <= 1) return false

      const index = notes.findIndex((note) => note.id === noteId)
      if (index === -1) return false

      const note = notes[index]

      if (index === 0) {
        const nextNote = notes[index + 1]
        return !(note.end <= nextNote.begin)
      } else if (index === (notes.length - 1)) {
        const prevNote = notes[index - 1]
        return !(prevNote.end <= note.begin)
      } else {
        const nextNote = notes[index + 1]
        const prevNote = notes[index - 1]
        return !((prevNote.end <= note.begin) && (note.end <= nextNote.begin))
      }
    },
    addVoiceTrack(name?: string) {
      const track: VocalTrack = {
        id: uuid(),
        type: 'vocal',
        name: (name !== undefined) ? name : null,
        notes: [],
        speakerId: speakerDefaultId,
        volume: volumeDefault,
        muted: false,
        color: trackColors[this.getTracks().length % trackColors.length]
      }

      this.addPlayer(track)
      if (this.project) this.project.tracks.push(track)
      this.tracksInfo.selectedTrackId = track.id
    },
    addAudioTrack(file: File, name?: string) {
      const track: AudioTrack = {
        id: uuid(),
        type: 'audio',
        name: (name !== undefined) ? name : null,
        volume: volumeDefault,
        muted: false,
        color: trackColors[this.getTracks().length % trackColors.length],
        waveImgUrl: null,
        duration: 0
      }

      this.addPlayer(track)

      readFile(file, 'arrayBuffer')
      .then((arrayBuffer) => {
        const player = players[track.id]

        player.addEventListener('loadedmetadata', () => {
          track.duration = player.duration
          if (this.project) this.project.tracks.push(track)
          this.tracksInfo.selectedTrackId = track.id
          this.updateDuration()
        }, { once: true })

        const blob = new Blob([arrayBuffer], { type: 'audio/wave' })
        const url = URL.createObjectURL(blob)

        player.src = url
        player.load()

        return this.drawWave(url)
      })
      .then((url) => {
        const _track = this.getTrack(track.id)
        if (_track?.type !== 'audio') return

        _track.waveImgUrl = url
        this.updatePlaybackHead()
      })
      .catch(console.error)
    },
    getTrackDuration(track: Track) {
      if (track.type === 'vocal') {
        if (track.notes.length <= 0) {
          return 0
        } else {
          const lastNote = track.notes.toSorted((a, b) => b.end - a.end)[0]
          return utils.tick2sec(lastNote.end, this.getBpm())
        }
      } else {
        return track.duration
      }
    },
    getTrackDurationMax() {
      const tracks = this.project?.tracks
      if (!tracks || (tracks.length <= 0)) return 0

      return (
        tracks
        .map((track) => this.getTrackDuration(track))
        .toSorted((a, b) => b - a)[0]
      )
    },
    getDurationMaxTrack(enabledSrcFilter: boolean = false) {
      const tracks =
        this.getTracks()
        .filter((track) => {
          if (enabledSrcFilter) {
            const player = players[track.id]
            return (player.src !== '')
          } else {
            return true
          }
        })

      if (tracks.length <= 0) return null

      const durations = tracks.map((track) => this.getTrackDuration(track))
      const max = durations.toSorted((a, b) => b - a)[0]
      const index = durations.indexOf(max)

      if (index === -1) return null

      return tracks[index]
    },
    addNote(
      pitch: number, begin: number, end?: number, lyric?: Lyric,
      snapX?: boolean, snapY?: boolean, snapTick?: number,
      f0Seg?: number[], volumeSeg?: number[], synth?: boolean
    ) {
      const track = this.getTrack(this.tracksInfo.selectedTrackId)
      if (track?.type !== 'vocal') return null

      if (snapX && snapTick) {
        begin = Math.floor(begin / snapTick) * snapTick
      }

      const beginMin = 0
      begin = Math.max(begin, beginMin)

      if (snapY) {
        pitch = Math.round(pitch)
      }

      const pitchMax = 127
      const pitchMin = 0

      pitch = Math.min(pitch, pitchMax)
      pitch = Math.max(pitch, pitchMin)

      if (end === undefined) {
        end = begin + quarterNoteTick
      }

      if (snapX && snapTick) {
        end = Math.floor(end / snapTick) * snapTick
      }

      const endMin = 0
      end = Math.max(end, endMin)

      if (lyric === undefined) {
        lyric = lyricDefault
      }

      const tickMax = quarterNoteTick * 8
      const tickMin = this.settings.snap.tick

      if ((end - begin) > tickMax) {
        end = begin + tickMax
      } else if ((end - begin) < tickMin) {
        end = begin + tickMin
      }

      if (f0Seg === undefined) {
        f0Seg = [1.0]
      }

      if (volumeSeg === undefined) {
        volumeSeg = [0.5]
      }

      const id = uuid()
      const speakerId = track.speakerId
      const speaker = speakers[speakerId]
      const phonemeTimings = this.computePhonemeTimings(lyric, speaker)
      const numSamples = utils.int((end - begin) + Math.max(-phonemeTimings[0], 0))

      f0Seg = utils.resample(f0Seg, numSamples)
      volumeSeg = utils.resample(volumeSeg, numSamples)

      track.notes.push({
        id,
        lyric,
        pitch,
        begin,
        end,
        f0Seg,
        volumeSeg,
        phonemeTimings
      })

      this.sortNotes(track.notes)
      this.updateDuration()

      if (synth) {
        this.synthVocalTrack(track.id)
      }

      return id as string
    },
    updateNote(trackId: string, noteId: string, synth: boolean = true) {
      const track = this.getTrack(trackId)
      if (track?.type !== 'vocal') return

      this.sortNotes(track.notes)
      this.updateDuration()
      this.removeNoteCache(trackId, noteId)

      if (synth) {
        this.synthVocalTrack(trackId)
      }
    },
    resizeNote(
      trackId: string, noteId: string,
      type: 'begin' | 'end', value: number,
      snap: boolean, snapTick: number
    ) {
      const track = this.getTrack(trackId)
      if (track?.type !== 'vocal') return

      const note = track.notes.find((note) => note.id === noteId)
      if (note === undefined) return

      if (snap) {
        value = Math.round(value / snapTick) * snapTick
      }

      const valueMin = 0
      value = Math.max(value, valueMin)

      const tickMax = Math.round(quarterNoteTick * 8)
      const tickMin = this.settings.snap.tick

      this.storage?.skipProjectHistory()

      if (type === 'begin') {
        if (note.begin === value) return
        note.begin = value
      } else {
        if (note.end === value) return
        note.end = value
      }

      if ((note.end - note.begin) > tickMax) {
        this.storage?.skipProjectHistory()

        if (type === 'begin') {
          note.begin = note.end - tickMax
        } else {
          note.end = note.begin + tickMax
        }
      } else if ((note.end - note.begin) < tickMin) {
        this.storage?.skipProjectHistory()

        if (type === 'begin') {
          note.begin = note.end - tickMin
        } else {
          note.end = note.begin + tickMin
        }
      }

      this.updateDuration()
    },
    scaleNote(trackId: string, noteId: string, pitch: number, snap: boolean) {
      const track = this.getTrack(trackId)
      if (track?.type !== 'vocal') return

      const note = track.notes.find((note) => note.id === noteId)
      if (note === undefined) return

      if (snap) {
        pitch = Math.round(pitch)
      }

      const pitchMax = 127
      const pitchMin = 0

      pitch = Math.min(pitch, pitchMax)
      pitch = Math.max(pitch, pitchMin)

      if (note.pitch === pitch) return

      this.storage?.skipProjectHistory()
      note.pitch = pitch
    },
    removeNote(trackId: string, noteId: string) {
      const track = this.getTrack(trackId)
      if (track?.type !== 'vocal') return

      track.notes = track.notes.filter((note) => note.id !== noteId).map((x) => toRaw(x))
      this.updateNote(trackId, noteId)
    },
    sortNotes(notes: Note[]) {
      notes.sort((a, b) => a.begin - b.begin)
    },
    updateNoteSegs(note: Note, type: 'begin' | 'end') {
      const numSamples = utils.int((note.end - note.begin) + Math.max(-note.phonemeTimings[0], 0))
      const numIncr = utils.int(Math.max(numSamples - note.f0Seg.length, 0))

      const numBefore = (type === 'begin') ? numIncr : 0
      const numAfter = (type === 'end') ? numIncr : 0

      note.f0Seg = [
        ...[...new Array(numBefore)].map(() => 1.0),
        ...(
          (type === 'begin') ?
          note.f0Seg.slice(-numSamples) :
          note.f0Seg.slice(0, numSamples)
        ),
        ...[...new Array(numAfter)].map(() => 1.0)
      ]

      note.volumeSeg = [
        ...[...new Array(numBefore)].map(() => 0.5),
        ...(
          (type === 'begin') ?
          note.volumeSeg.slice(-numSamples) :
          note.volumeSeg.slice(0, numSamples)
        ),
        ...[...new Array(numAfter)].map(() => 0.5)
      ]
    },
    getNoteCache(noteId: string) {
      return noteCaches[noteId]
    },
    setNoteCache(noteId: string, data: NoteCacheData) {
      noteCaches[noteId] = data
    },
    hasNoteCache(noteId: string) {
      return (noteId in noteCaches)
    },
    removeNoteCache(trackId: string, noteId: string) {
      const track = this.getTrack(trackId)
      if (track?.type !== 'vocal') return

      const index = track.notes.findIndex((note) => note.id === noteId)

      if (index > 0) {
        const prevNoteId = track.notes[index - 1].id
        delete noteCaches[prevNoteId]
      }

      delete noteCaches[noteId]
    },
    removeNoteCaches(trackId: string, noteIds: string[]) {
      noteIds.forEach((noteId) => this.removeNoteCache(trackId, noteId))
    },
    removeNoteCachesAll(trackId: string) {
      const track = this.getTrack(trackId)
      if (track?.type !== 'vocal') return

      const noteIds = track.notes.map((note) => note.id)
      this.removeNoteCaches(trackId, noteIds)
    },
    setLyric(noteId: string, lyric: string) {
      const track = this.getTrack(this.tracksInfo.selectedTrackId)
      if (track?.type !== 'vocal') return

      const note = track.notes.find((note) => note.id === noteId)
      if (note === undefined) return

      if (schemata.kanas.includes(lyric as schemata.KanaEnum)) {
        note.lyric = lyric as schemata.KanaEnum
      } else if (schemata.envKeys.includes(lyric as schemata.EnvKeyEnum)) {
        note.lyric = lyric as schemata.EnvKeyEnum
      } else {
        if (schemata.phonemeMixSchema.safeParse(lyric).success) {
          note.lyric = lyric
        } else {
          note.lyric = '、'
        }
      }

      const speakerId = track.speakerId
      const speaker = speakers[speakerId]

      this.updatePhonemeTimings(note, speaker)
      this.updateNote(track.id, noteId)

      this.$emit('updateF0', track.id, [noteId])
      this.$emit('updateVolume', track.id, [noteId])
    },
    lyric2phonemes(lyric: Lyric, speakerId: schemata.SpeakerIdEnum) {
      if (schemata.kanas.includes(lyric as schemata.KanaEnum)) {
        const speaker = speakers[speakerId]
        const envLengths = speaker.kanas[lyric as schemata.KanaEnum]

        if (envLengths === undefined) {
          return []
        } else {
          return envLengths.map(({envKey}) => envKey)
        }
      } else {
        return [lyric as schemata.EnvKeyEnum | string]
      }
    },
    updatePhonemeTimings(note: Note, speaker: schemata.SpeakerVoice) {
      const phonemeTimings = this.computePhonemeTimings(note.lyric, speaker)
      const isEqual = phonemeTimings.every((value, i) => value === note.phonemeTimings[i])

      if (isEqual) return

      note.phonemeTimings = phonemeTimings
      this.updateNoteSegs(note, 'begin')
    },
    computePhonemeTimings(lyric: string, speaker: schemata.SpeakerVoice) {
      let phonemeTimings: number[]

      if (schemata.kanas.includes(lyric as schemata.KanaEnum)) {
        phonemeTimings = this.computeKanaPhonemeTimings(
          lyric as schemata.KanaEnum,
          speaker,
          this.getBpm()
        )
      } else  {
        phonemeTimings = [0]
      }

      return phonemeTimings
    },
    computeKanaPhonemeTimings(kana: schemata.KanaEnum, speaker: schemata.SpeakerVoice, bpm: number) {
      const envLengths = speaker.kanas[kana]
      const timings: number[] = []
      let summed = 0

      envLengths
      ?.toReversed()
      .forEach(({len}) => {
        if (len !== null) {
          summed -= len
        }

        timings.push(summed)
      })

      return (
        timings
        .toReversed()
        .map((value) => utils.sec2tick(value, bpm))
      )
    },
    playTrackAll() {
      console.log('tracks:play:all')

      Promise.all(
        this.getTracks()
        .filter((track) => {
          const player = players[track.id]
          return (player.src !== '')
        })
        .map((track) => {
          const player = players[track.id]

          const currentTime = this.tracksInfo.playbackCurrentTime
          const duration = this.getTrackDuration(track)

          player.currentTime = currentTime

          return (currentTime < duration) ? player.play() : Promise.resolve()
        })
      )
      .catch((e) => {
        console.error(e)
        this.pauseTrackAll()
      })
    },
    pauseTrackAll() {
      console.log('tracks:pause:all')

      Object.keys(players).forEach((key) => {
        const player = players[key]
        player.pause()
      })
    },
    saveVocalTrackAsWav(trackId: string | null = null) {
      if (trackId === null) {
        trackId = this.tracksInfo.selectedTrackId
      }

      if (trackId === null) {
        alert('トラックが選択されていません')
        return false
      }

      const track = this.getTrack(trackId)

      if (track?.type !== 'vocal') {
        alert('選択されたトラックはボーカルトラックではありません')
        return false
      }

      const player = players[track.id]

      if (player.src === '') {
        alert('選択されたトラックにレンダリング済み音声が存在しません')
        return false
      }

      downloadFile(
        `${(track.name !== null) ? track.name : trackNameDefault}.wav`,
        player.src
      )

      return true
    },
    saveVocalTrackAsWavAll() {
      const tracks = this.getTracks()

      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i]
        if (track.type !== 'vocal') continue
        const result = this.saveVocalTrackAsWav(track.id)
        if (!result) break
      }
    },
    updatePlaybackHead() {
      const heads = Array.from(document.querySelectorAll<HTMLElement>('.tracks-playback-head'))
      const left = `${Math.min(this.tracksInfo.playbackCurrentTime / this.tracksInfo.duration * 100, 100)}%`
      heads.forEach((head) => head.style.left = left)
    },
    moveUpTrack(trackId: string) {
      const tracks = this.project?.tracks
      if (!tracks) return

      const newTracks =
        tracks
        .map((track, i) => {
          return {
            track: track,
            index: (track.id === trackId) ? (i - 1.5) : i
          }
        })
        .toSorted((a, b) => a.index - b.index)
        .map(({track}) => toRaw(track))

      if (
        this.project &&
        (newTracks.some((track, i) => track.id !== tracks[i].id))
      ) {
        this.project.tracks = newTracks
      }
    },
    moveDownTrack(trackId: string) {
      const tracks = this.project?.tracks
      if (!tracks) return

      const newTracks =
        tracks
        .map((track, i) => {
          return {
            track: track,
            index: (track.id === trackId) ? (i + 1.5) : i
          }
        })
        .toSorted((a, b) => a.index - b.index)
        .map(({track}) => toRaw(track))

      if (
        this.project &&
        (newTracks.some((track, i) => track.id !== tracks[i].id))
      ) {
        this.project.tracks = newTracks
      }
    },
    removeTrack(trackId: string) {
      if (!this.project) return

      this.pauseTrackAll()

      const index = this.project.tracks.findIndex((track) => track.id === trackId)
      if (index === -1) return

      const track = this.project.tracks[index]

      if (track.type === 'audio') {
        if (this.specImgState.trackId === trackId) {
          this.specImgState.state = 'disabled'
          this.specImgState.trackId = null
        }

        this.removeSpecImages(trackId)
      }

      this.project.tracks.splice(index, 1)

      if (this.project.tracks.length <= 0) {
        this.addVoiceTrack()
      }

      this.updateDuration()
    },
    loadUST(file: File, snap: boolean) {
      parseUST(file)
      .then((parsed) => {
        if (parsed.bpm < bpmMin) {
          throw new Error(`Invalid BPM => ${parsed.bpm}`)
        }

        if (this.project === null) return

        const fileNameWithoutExt = basename(file.name, extname(file.name))

        if (this.project.tracks.length > 1) {
          this.addVoiceTrack(fileNameWithoutExt)
        } else {
          const selectedTrack = this.getTrack(this.tracksInfo.selectedTrackId)

          if (selectedTrack?.type === 'vocal') {
            if (selectedTrack.notes.length > 0) {
              this.addVoiceTrack(fileNameWithoutExt)
            } else {
              this.setBpm(parsed.bpm)
              selectedTrack.name = fileNameWithoutExt
            }
          } else {
            this.addVoiceTrack(fileNameWithoutExt)
          }
        }

        const trackId = this.tracksInfo.selectedTrackId
        if (trackId === null) return

        const kanasSorted = schemata.kanas.toSorted((a, b) => b.length - a.length)

        parsed.ustNotes.forEach((ustNote) => {
          let lyric: Lyric | null = null

          if (schemata.kanas.includes(ustNote.lyric as schemata.KanaEnum)) {
            lyric = ustNote.lyric as schemata.KanaEnum
          } else if (schemata.envKeys.includes(ustNote.lyric as schemata.EnvKeyEnum)) {
            lyric = ustNote.lyric as schemata.EnvKeyEnum
          } else {
            ustNote.lyric = kata2hira(ustNote.lyric)

            if (ustNote.lyric.includes('を')) {
              lyric = 'お'
            }

            if (lyric === null) {
              for (let i = 0; i < kanasSorted.length; i++) {
                const kana = kanasSorted[i]

                if (ustNote.lyric.includes(kana)) {
                  lyric = kana
                  break
                }
              }
            }

            if (lyric === null) {
              for (let i = 0; i < schemata.envKeys.length; i++) {
                const envKey = schemata.envKeys[i]

                if (ustNote.lyric.includes(envKey)) {
                  lyric = envKey
                  break
                }
              }
            }

            if (lyric === null) {
              lyric = '、'
            }
          }

          const track = this.getTrack(trackId)
          if (track?.type !== 'vocal') return

          const lastNoteEnd = (track.notes.length > 0) ? track.notes.slice(-1)[0].end : 0

          const pitch = ustNote.pitch
          const begin = snap ? Math.max(ustNote.begin, lastNoteEnd) : ustNote.begin
          const end = ustNote.end

          const snapX = snap
          const snapY = snap
          const snapTick = snap ? this.settings.snap.tick : undefined

          this.addNote(
            pitch,
            begin,
            end,
            lyric,
            snapX,
            snapY,
            snapTick
          )
        })

        this.synthVocalTrack(trackId)
      })
      .catch((e) => {
        console.error(e)
        alert('USTファイルの読み込みに失敗しました')
      })
    },
    getBpm() {
      return (this.project !== null) ? this.project.bpm : bpmDefault
    },
    setBpm(bpm: number) {
      if (this.project) {
        this.project.bpm = bpm

        this.project.tracks.forEach((track) => {
          if (track.type !== 'vocal') return

          const speakerId = track.speakerId
          const speaker = speakers[speakerId]
          const synth = false

          track.notes.forEach((note) => {
            this.updatePhonemeTimings(note, speaker)
            this.updateNote(track.id, note.id, synth)
          })

          const noteIds = track.notes.map((note) => note.id)
          this.$emit('updateF0', track.id, noteIds)
          this.$emit('updateVolume', track.id, noteIds)

          this.removeNoteCachesAll(track.id)
          this.synthVocalTrack(track.id)
        })
      }
    },
    getTracks() {
      return this.project ? this.project.tracks : []
    },
    getTrack(trackId: string | null) {
      if ((trackId === null) || (!this.project)) return null
      const track = this.project.tracks.find((track) => track.id === trackId)
      return (track !== undefined) ? track : null
    },
    addPlayer(track: Track) {
      const player = new Audio()
      const intervalMs = 1000 / 60
      let intervalId: Timer | null = null

      player.addEventListener('play', () => {
        const trackId = this.getDurationMaxTrack(true)?.id

        if (trackId !== track.id) {
          intervalId = null
          return
        }

        this.tracksInfo.playing = true

        intervalId = setInterval(() => {
          if (player.paused && (intervalId !== null)) {
            this.tracksInfo.playing = false
            clearInterval(intervalId)
          }

          this.tracksInfo.playbackCurrentTime = player.currentTime
        }, intervalMs)
      })

      player.addEventListener('pause', () => {
        if (intervalId !== null) {
          this.tracksInfo.playing = false
          clearInterval(intervalId)
        }
      })

      player.volume = track.volume
      player.muted = track.muted
      players[track.id] = player
    },
    reSelectAudio(track: AudioTrack) {
      const player = players[track.id]

      openFileDialog('audio/*')
      .then((file) => readFile(file as File, 'arrayBuffer'))
      .then((arrayBuffer) => {
        this.storage?.skipProjectHistory()
        track.waveImgUrl = null

        if (
          (this.specImgState.trackId === track.id) &&
          (this.specImgState.state !== 'switching')
        ) {
          this.removeSpecImages(track.id)
          this.specImgState.state = 'disabled'
          this.specImgState.trackId = null
        }

        const blob = new Blob([arrayBuffer], { type: 'audio/wave' })
        const url = URL.createObjectURL(blob)

        player.src = url
        player.load()

        return this.drawWave(url)
      })
      .then((url) => {
        track.duration = player.duration
        track.waveImgUrl = url
        this.updateDuration()
        this.updatePlaybackHead()
      })
      .catch(console.error)
    },
    swicthSpecImgState(track: AudioTrack) {
      const state = this.specImgState.state
      const trackId = this.specImgState.trackId

      if (state === 'switching') {
        return
      } else if (trackId !== track.id) {
        const player = players[track.id]

        if (player.src === '') {
          alert('オーディオファイルを再選択してください')
          return
        }

        this.specImgState.state = 'switching'
        this.specImgState.trackId = track.id

        this.hideSpecImages()

        if (track.id in this.specImages) {
          const images = this.specImages[track.id]
          images.forEach((img) => img.hidden = false)
          this.specImgState.state = 'enabled'
        } else {
          this.drawSpec(track.id, player.src)
          .then(() => {
            if (this.specImgState.state === 'switching') {
              this.specImgState.state = 'enabled'
            }
          })
          .catch(console.error)
        }
      } else {
        this.hideSpecImages()
        this.specImgState.state = 'disabled'
        this.specImgState.trackId = null
      }
    },
    hideSpecImages(trackId: string | null = null) {
      if (trackId) {
        if (trackId in this.specImages) {
          this.specImages[trackId].forEach((img) => img.hidden = true)
        }
      } else {
        Object.keys(this.specImages).forEach((key) => {
          this.specImages[key].forEach((img) => img.hidden = true)
        })
      }
    },
    removeSpecImages(trackId: string | null = null) {
      if (trackId) {
        if (trackId in this.specImages) {
          delete this.specImages[trackId]
        } else {
          Object.keys(this.specImages).forEach((key) => {
            delete this.specImages[key]
          })
        }
      }
    },
    updateDuration() {
      this.tracksInfo.duration = this.getTrackDurationMax()

      this.tracksInfo.playbackCurrentTime = Math.min(
        this.tracksInfo.playbackCurrentTime,
        this.tracksInfo.duration
      )
    },
    playOrPause() {
      if (this.tracksInfo.playing) {
        this.pauseTrackAll()
      } else {
        this.synthVocalTrackAll()
        .then(() => this.playTrackAll())
        .catch(console.error)
      }
    },
    openFileDialog() {
      openFileDialog('.ust,audio/*', true)
      .then((files) => {
        let ustSnap: boolean | null = null

        ;(files as File[]).forEach((file) => {
          const extension = extname(file.name)
          const ustRegexp = new RegExp('\\.ust', 'i')

          if ((extension !== null) && (ustRegexp.test(extension))) {
            if (ustSnap === null) {
              ustSnap = confirm('ノートを自動的にスナップしますか?')
            }

            this.loadUST(file, ustSnap)
          } else {
            const fileNameWithoutExt = basename(file.name, extname(file.name))
            this.addAudioTrack(file, fileNameWithoutExt)
          }
        })
      })
      .catch(console.error)
    },
    undo() {
      this.pauseTrackAll()
      this.storage?.undo()
      this.updateDuration()
      const delayMs = 100
      setTimeout(() => this.updatePlaybackHead(), delayMs)
    },
    redo() {
      this.pauseTrackAll()
      this.storage?.redo()
      this.updateDuration()
      const delayMs = 100
      setTimeout(() => this.updatePlaybackHead(), delayMs)
    },
    startMessenger() {
      this.worker.addEventListener('message', (event) => {
        if (event.data.id === null) {
          console.error(event.data.data)
          return
        }

        const customEvent = new CustomEvent(event.data.id, { detail: event.data })
        window.dispatchEvent(customEvent)
      })
    },
    startEngine() {
      this.initEngine()
      .then(() => this.engineIsReady = true)
      .catch(console.error)
    },
    reset() {
      this.pauseTrackAll()

      Object.keys(noteCaches).forEach((key) => {
        delete noteCaches[key]
      })

      Object.keys(players).forEach((key) => {
        URL.revokeObjectURL(players[key].src)
        delete players[key]
      })

      this.specImgState.state = 'disabled'
      this.specImgState.trackId = null
      Object.keys(this.specImages).forEach((key) => {
        this.specImages[key].forEach(({url}) => {
          URL.revokeObjectURL(url)
        })
      })

      const store = useStore()
      store.resetTracksInfo()
      store.resetSpecImages()
    }
  },
  computed: {
    ...mapWritableState(
      useStore,
      [
        'page',
        'project',
        'settings',
        'tracksInfo',
        'specImages',
        'engineIsReady'
      ]
    ),
    trackNumberZeroPadding() {
      return (x: number) => {
        const minLen = 3
        const maxLen = String(this.getTracks().length).length
        const len = Math.max(minLen, maxLen)
        const zeros = [...new Array(len)].fill(0).join('')
        return `${zeros}${x}`.slice(-len)
      }
    }
  },
  mounted() {
    this.startMessenger()
    this.startEngine()
  },
  emits: {
    updateProgressTotal: (total: number) => {
      return true
    },
    updateProgressCurrentRelative: (relative: number) => {
      return true
    },
    updatePlaybackHead: () => {
      return true
    },
    updateF0: (trackId: string, noteIds: string[]) => {
      return true
    },
    updateVolume: (trackId: string, noteIds: string[]) => {
      return true
    }
  },
  watch: {
    page() {
      if (this.page === 'projects') {
        this.reset()
      } else if (this.page === 'editor') {
        const tracks = this.project?.tracks
        if (!tracks) return

        if (tracks.length <= 0) {
          this.addVoiceTrack()
        }

        tracks.forEach((track) => this.addPlayer(track))

        tracks
        .filter((track) => track.type === 'audio')
        .forEach((track) => track.waveImgUrl = '')

        this.storage?.resetProjectHistory(this.project)
        this.tracksInfo.selectedTrackId = tracks[0].id
        this.updateDuration()
      }
    },
    'tracksInfo.duration'() {
      this.updatePlaybackHead()
    },
    'tracksInfo.playbackCurrentTime'() {
      this.updatePlaybackHead()
    }
  },
  render() {
    return (
      <div
        id="tracks"
        class={`
          w-full h-fit max-h-80 pr-2 flex flex-col gap-2 shrink-0 overflow-y-scroll scrollbar-light
          ${this.tracksInfo.folded ? 'hidden' : ''}
        `}
      >
        {
          this.project?.tracks.map((track, index) => (
            <div
              key={ `track-${track.id}` }
              class="w-full h-16 border-2 border-solid border-accent rounded-md overflow-hidden flex shrink-0"
            >
              {/* info */}
              <div class={`
                w-72 h-full border-r-2 border-solid border-accent flex items-center shrink-0
                ${(this.tracksInfo.selectedTrackId === track.id) ? 'bg-main-light' : 'bg-main'}
              `}>
                <div
                  class="w-4 h-full shrink-0"
                  style={{
                    backgroundColor: track.color
                  }}
                  onClick={() => this.tracksInfo.selectedTrackId = track.id}
                  onDblclick={(event) => {
                    if (event.currentTarget === null) return

                    const target = event.currentTarget as HTMLElement
                    const colorInput = target.querySelector<HTMLInputElement>('input[type="color"]')

                    if (colorInput === null) return

                    colorInput.click()
                  }}
                >
                  <input
                    class="w-full h-full opacity-0 pointer-events-none"
                    type="color"
                    value={ track.color }
                    onChange={(event) => {
                      if (event.target === null) return

                      const target = event.target as HTMLInputElement
                      const newColor = target.value

                      target.value = newColor
                      track.color = newColor
                    }}
                  ></input>
                </div>
                <div class="w-full h-full px-2 flex flex-col justify-center gap-2">
                  <div class="w-full h-4 flex items-center">
                    <p class="text-xs text-accent shrink-0">
                      { `${this.trackNumberZeroPadding(index + 1)} :` }
                    </p>
                    <input
                      class="w-full h-full px-1 text-xs text-accent bg-transparent"
                      type="text"
                      value={ (track.name !== null) ? track.name : trackNameDefault }
                      onChange={(event) => {
                        if (event.target === null) return

                        const target = event.target as HTMLInputElement
                        const newName = target.value

                        track.name = (newName !== '') ? newName : null
                        target.value = (track.name !== null) ? track.name : trackNameDefault
                      }}
                    ></input>
                  </div>
                  <div class={`
                    w-full h-4 flex items-center
                    ${(track.type === 'vocal') ? 'gap-1' : 'gap-2'}
                  `}>
                    {
                      (track.type === 'vocal') ?
                      <>
                        <p class="text-xs text-accent shrink-0">
                          歌声 :
                        </p>
                        <select
                          class="w-full h-full text-xs text-accent bg-transparent"
                          value={ track.speakerId }
                          onChange={(event) => {
                            if (event.target === null) return

                            const target = event.target as HTMLSelectElement
                            const speakerId = target.value as schemata.SpeakerIdEnum
                            const speaker = speakers[speakerId]
                            const synth = false

                            if (speakerId === track.speakerId) return

                            track.speakerId = speakerId

                            track.notes.forEach((note) => {
                              this.updatePhonemeTimings(note, speaker)
                              this.updateNote(track.id, note.id, synth)
                            })

                            const noteIds = track.notes.map((note) => note.id)
                            this.$emit('updateF0', track.id, noteIds)
                            this.$emit('updateVolume', track.id, noteIds)

                            this.removeNoteCachesAll(track.id)
                            this.synthVocalTrack(track.id)
                          }}
                        >
                          {
                            Object.entries(speakers).map(([key, speaker]) => (
                              <option value={ key }>
                                { speaker.name }
                              </option>
                            ))
                          }
                        </select>
                      </> :
                      <>
                        <button
                          class="w-14 h-5 text-xs text-accent bg-main-mid rounded-sm"
                          onClick={() => this.reSelectAudio(track)}
                        >
                          再選択
                        </button>
                        <button
                          class={`
                            w-32 h-5 text-xs text-accent bg-main-mid rounded-sm
                            ${(this.specImgState.state === 'switching') ? 'cursor-not-allowed' : 'cursor-pointer'}
                          `}
                          onClick={() => this.swicthSpecImgState(track)}
                        >
                          {
                            (this.specImgState.trackId !== track.id) ?
                            '耳コピ支援を有効化' :
                            (
                              (this.specImgState.state === 'disabled') ?
                              '耳コピ支援を有効化' :
                              (this.specImgState.state === 'enabled') ?
                              '耳コピ支援を無効化' :
                              '耳コピ支援を準備中'
                            )
                          }
                        </button>
                      </>
                    }
                  </div>
                </div>
                <div class="w-6 h-full flex flex-col justify-center items-center gap-2 shrink-0">
                  <input
                    class="w-10 rotate-[-90deg]"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={ track.volume }
                    onInput={(event) => {
                      if (event.target === null) return

                      const target = event.target as HTMLInputElement
                      const newVolume = Number(target.value)
                      const player = players[track.id]

                      if (Number.isFinite(newVolume)) {
                        player.volume = newVolume
                      }

                      target.value = String(newVolume)
                    }}
                    onChange={(event) => {
                      if (event.target === null) return

                      const target = event.target as HTMLInputElement
                      const newVolume = Number(target.value)
                      const player = players[track.id]

                      if (Number.isFinite(newVolume)) {
                        track.volume = Math.round(newVolume * 100) / 100
                      } else {
                        track.volume = volumeDefault
                      }

                      target.value = String(track.volume)
                      player.volume = track.volume
                    }}
                  ></input>
                </div>
                <div class="w-6 h-full flex flex-col justify-center items-center gap-2 shrink-0">
                  <button
                    class={`
                      w-4 h-4 text-xs rounded-sm
                      ${track.muted ? 'text-main bg-accent' : 'text-accent bg-transparent'}
                    `}
                    onClick={() => {
                      const player = players[track.id]
                      track.muted = !track.muted
                      player.muted = track.muted
                    }}
                  >
                    M
                  </button>
                  <button
                    class={`
                      w-4 h-4 text-xs rounded-sm
                      ${
                        this.project?.tracks.every((_track) => {
                          return (_track === track) ? !_track.muted : _track.muted
                        }) ?
                        'text-main bg-accent' :
                        'text-accent bg-transparent'
                      }
                    `}
                    onClick={() => {
                      const isSolo = this.project?.tracks.every((_track) => {
                        return (_track === track) ? !_track.muted : _track.muted
                      })

                      if (isSolo) {
                        this.project?.tracks.forEach((track) => {
                          const player = players[track.id]
                          track.muted = false
                          player.muted = track.muted
                        })
                      } else {
                        this.project?.tracks.forEach((_track) => {
                          const player = players[_track.id]
                          _track.muted = (_track.id === track.id) ? false : true
                          player.muted = _track.muted
                        })
                      }
                    }}
                  >
                    S
                  </button>
                </div>
              </div>
              {/* sequencer */}
              <div
                class="w-full h-full relative flex items-center"
                onClick={(event) => {
                  if (event.currentTarget === null) return

                  const target = event.currentTarget as HTMLElement
                  this.tracksInfo.playbackCurrentTime = this.tracksInfo.duration * (event.offsetX / target.clientWidth)

                  if (this.tracksInfo.playing) {
                    this.pauseTrackAll()
                    this.playTrackAll()
                  } else {
                    this.$emit('updatePlaybackHead')
                  }
                }}
              >
                {
                  (track.type === 'vocal') ?
                  (() => {
                    const tick = utils.sec2tick(this.tracksInfo.duration, this.getBpm())
                    let pitchMax: number
                    let pitchMin: number

                    if (track.notes.length <= 0) {
                      pitchMax = 1
                      pitchMin = 0
                    } else {
                      const pitches = track.notes.map((note) => note.pitch)
                      pitchMax = pitches.reduce((a, b) => Math.max(a, b)) + 1
                      pitchMin = pitches.reduce((a, b) => Math.min(a, b))
                    }

                    return track.notes.map((note) => {
                      return (
                        <div
                          key={ `track-note-${note.id}` }
                          class="h-1 absolute m-auto rounded-sm pointer-events-none"
                          style={{
                            width: `${(note.end - note.begin) / tick * 100}%`,
                            left: `${note.begin / tick * 100}%`,
                            bottom: `${(note.pitch - pitchMin) / (pitchMax - pitchMin) * 100}%`,
                            backgroundColor: track.color
                          }}
                        ></div>
                      )
                    })
                  })() :
                  ((track.waveImgUrl === null) || (track.waveImgUrl === '')) ?
                  <div class="w-full h-full flex justify-center items-center pointer-events-none">
                    <p class="text-sm text-accent">
                      {
                        (track.waveImgUrl === null) ?
                        '波形をレンダリング中...' :
                        'オーディオファイルを再選択してください'
                      }
                    </p>
                  </div> :
                  <div
                    class="h-full pointer-events-none"
                    style={{
                      width: `${track.duration / this.tracksInfo.duration * 100}%`,
                      backgroundColor: track.color,
                      '-webkit-mask-image': `url(${track.waveImgUrl})`,
                      maskImage: `url(${track.waveImgUrl})`,
                      maskSize: '100% 100%',
                      maskRepeat: 'no-repeat',
                      maskPosition: 'center'
                    }}
                  ></div>
                }
                {
                  <div class="
                    w-0.5 h-full absolute m-auto inset-y-0 left-0 bg-accent pointer-events-none tracks-playback-head
                  "></div>
                }
              </div>
              {/* mover & remover */}
              <div class="
                w-6 h-full border-l-2 border-solid border-accent
                flex flex-col justify-center items-center gap-1.5 shrink-0
              ">
                <div
                  class="w-3 h-3 bg-accent [mask-image:url(./assets/triangle.svg)]"
                  onClick={() => this.moveUpTrack(track.id)}
                ></div>
                <div
                  class="w-3 h-3 bg-accent [mask-image:url(./assets/remove.svg)]"
                  onClick={() => this.removeTrack(track.id)}
                ></div>
                <div
                  class="w-3 h-3 bg-accent rotate-180 [mask-image:url(./assets/triangle.svg)]"
                  onClick={() => this.moveDownTrack(track.id)}
                ></div>
              </div>
            </div>
          ))
        }
      </div>
    )
  }
})

export default component
export type TracksInstance = InstanceType<typeof component>
