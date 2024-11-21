import { defineComponent, toRaw } from 'vue'
import { defineStore, mapWritableState } from 'pinia'
import { createStorage } from 'unstorage'
import indexedDbDriver from 'unstorage/drivers/indexedb'
import { now, uuid, downloadFile, readFile, alert } from '../utils'
import type { TypesEqual } from '../utils'
import { schemata } from '../engine'
import appInfo from '../info'
import { z } from 'zod'
import { basename, extname } from 'pathe'

export type Lyric = schemata.KanaEnum | schemata.EnvKeyEnum

export interface Note extends schemata.Note {
  id: string
}

export interface VocalTrack {
  id: string
  type: 'vocal'
  name: string | null
  notes: Note[]
  speakerId: schemata.SpeakerIdEnum
  volume: number
  muted: boolean
  color: string
}

export interface AudioTrack {
  id: string
  type: 'audio'
  name: string | null
  volume: number
  muted: boolean
  color: string
  waveImgUrl: string | null
  duration: number
}

export type Track = VocalTrack | AudioTrack

export interface Project {
  id:     string
  bpm:    number
  tracks: Track[]
}

export interface ProjectInfo {
  id:   string
  name: string
  date: number
}

export interface ProjectHistory {
  projects: Project[]
  index: number
}

export const keyboardShortcutFunctions = [
  'new',
  'settings',
  'help',
  'undo',
  'redo',
  'select',
  'copy',
  'paste',
  'projects',
  'save',
  'save:all',
  'file'
] as const

export type KeyboardShortcutFunctions = typeof keyboardShortcutFunctions[number]

export interface KeyboardShortcut {
  code:  string
  alt:   boolean
  shift: boolean
  desc:  string
}

export type KeyboardShortcuts = {
  [key in KeyboardShortcutFunctions]: KeyboardShortcut
}

export const snapNotes = ['4', '8', '16', '32', '64'] as const

export interface Snap {
  note: typeof snapNotes[number]
  tick: number
}

export interface Settings {
  projectsInfo:      ProjectInfo[]
  keyboardShortcuts: KeyboardShortcuts
  snap:              Snap
  licenseAgreed:     boolean
}

export interface SettingsForExport {
  keyboardShortcuts: KeyboardShortcuts
}

export interface ChangedTrackItems {
  notes?: { [key: string]: true }
  speakerId?: true
  other?: true
}

export interface ChangedProjectItems {
  tracks?: { [key: string]: ChangedTrackItems }
  other?: true
}

export const bpmDefault = 120
export const bpmMin = 1
export const quarterNoteTick = 480

export const keyboardShortcutsDefault: KeyboardShortcuts = {
  'new': {
    code:  'KeyJ',
    alt:   false,
    shift: false,
    desc:  'プロジェクト又はボーカルトラックを追加'
  },
  'settings':      {
    code:  'KeyI',
    alt:   false,
    shift: false,
    desc:  '設定を開く'
  },
  'help': {
    code:  'KeyH',
    alt:   false,
    shift: false,
    desc:  'ヘルプを開く'
  },
  'undo': {
    code:  'KeyZ',
    alt:   false,
    shift: false,
    desc:  '元に戻す'
  },
  'redo': {
    code:  'KeyY',
    alt:   false,
    shift: false,
    desc:  'やり直す'
  },
  'select': {
    code:  'KeyA',
    alt:   false,
    shift: false,
    desc:  '全選択'
  },
  'copy': {
    code:  'KeyC',
    alt:   false,
    shift: false,
    desc:  'コピー'
  },
  'paste': {
    code:  'KeyV',
    alt:   false,
    shift: false,
    desc:  'ペースト'
  },
  'projects': {
    code:  'KeyL',
    alt:   false,
    shift: false,
    desc:  'プロジェクト一覧に戻る'
  },
  'save': {
    code:  'KeyS',
    alt:   false,
    shift: false,
    desc:  'ボーカルトラックを書き出し'
  },
  'save:all': {
    code:  'KeyS',
    alt:   false,
    shift: true,
    desc:  'ボーカルトラックを一括書き出し'
  },
  'file': {
    code:  'KeyK',
    alt:   false,
    shift: false,
    desc:  'ファイルを開く'
  }
} as const

export const snap4: Snap = {
  note: '4',
  tick: Math.round(quarterNoteTick / 1)
} as const

export const snap8: Snap = {
  note: '8',
  tick: Math.round(quarterNoteTick / 2)
} as const

export const snap16: Snap = {
  note: '16',
  tick: Math.round(quarterNoteTick / 4)
} as const

export const snap32: Snap = {
  note: '32',
  tick: Math.round(quarterNoteTick / 8)
} as const

export const snap64: Snap = {
  note: '64',
  tick: Math.round(quarterNoteTick / 16)
} as const

export const settingsDefault: Settings = {
  projectsInfo:      [],
  keyboardShortcuts: keyboardShortcutsDefault,
  snap:              snap16,
  licenseAgreed:     false
} as const

export const projectHistoryDefault: ProjectHistory = {
  projects: [],
  index: -1
} as const

export const noteSchema = schemata.noteSchema.extend({
  id: z.string().uuid()
})

export const vocalTrackSchema = z.object({
  id:        z.string().uuid(),
  type:      z.literal('vocal'),
  name:      z.string().nullable(),
  notes:     noteSchema.array(),
  speakerId: schemata.speakerIdEnumSchema,
  volume:    z.number().min(0).max(1),
  muted:     z.boolean(),
  color:     z.string()
})

export const audioTrackSchema = z.object({
  id:         z.string().uuid(),
  type:       z.literal('audio'),
  name:       z.string().nullable(),
  volume:     z.number().min(0).max(1),
  muted:      z.boolean(),
  color:      z.string(),
  waveImgUrl: z.string().nullable(),
  duration:   z.number().min(0)
})

export const trackSchema = vocalTrackSchema.or(audioTrackSchema)

export const projectSchema = z.object({
  id:     z.string().uuid(),
  bpm:    z.number().min(bpmMin),
  tracks: trackSchema.array()
})

export const projectInfoSchema = z.object({
  id:   z.string().uuid(),
  name: z.string(),
  date: z.number().int().positive()
})

export const keyboardShortcutSchema = z.object({
  code:  z.string(),
  alt:   z.boolean(),
  shift: z.boolean(),
  desc:  z.string()
})

export const keyboardShortcutsSchema = z.record(
  z.enum(keyboardShortcutFunctions),
  keyboardShortcutSchema
).transform((x) => x as typeof x extends Partial<infer T> ? T: never)

export const snapSchema = z.object({
  note: z.enum(snapNotes),
  tick: z.number().int().min(1)
})

export const settingsSchema = z.object({
  projectsInfo:      projectInfoSchema.array(),
  keyboardShortcuts: keyboardShortcutsSchema,
  snap:              snapSchema,
  licenseAgreed:     z.boolean()
})

export const settingsForExportSchema = z.object({
  keyboardShortcuts: keyboardShortcutsSchema
})

{ const _: TypesEqual<Note,              z.infer<typeof noteSchema>>              = true }
{ const _: TypesEqual<VocalTrack,        z.infer<typeof vocalTrackSchema>>        = true }
{ const _: TypesEqual<AudioTrack,        z.infer<typeof audioTrackSchema>>        = true }
{ const _: TypesEqual<Track,             z.infer<typeof trackSchema>>             = true }
{ const _: TypesEqual<Project,           z.infer<typeof projectSchema>>           = true }
{ const _: TypesEqual<ProjectInfo,       z.infer<typeof projectInfoSchema>>       = true }
{ const _: TypesEqual<KeyboardShortcut,  z.infer<typeof keyboardShortcutSchema>>  = true }
{ const _: TypesEqual<KeyboardShortcuts, z.infer<typeof keyboardShortcutsSchema>> = true }
{ const _: TypesEqual<Settings,          z.infer<typeof settingsSchema>>          = true }
{ const _: TypesEqual<SettingsForExport, z.infer<typeof settingsForExportSchema>> = true }

export const useStore = defineStore('store', {
  state(): {
    page: 'projects' | 'editor'
    project: Project | null
    settings: Settings
    tracksInfo: {
      duration: number
      selectedTrackId: string | null
      playing: boolean
      playbackCurrentTime: number
      folded: boolean
    }
    pianoRollInfo: {
      sequencerMag: number
      durationMin: number
    }
    specImages: {
      [key: string]: {
        url: string
        offset: number
        duration: number
        hidden: boolean
      }[]
    }
    toolMode: 'selector' | 'pen' | 'vibrato' | 'fade-in' | 'fade-out'
    engineIsReady: boolean
  } {
    return {
      page: 'projects',
      project: null,
      settings: structuredClone(settingsDefault),
      tracksInfo: {
        duration: 0,
        selectedTrackId: null,
        playing: false,
        playbackCurrentTime: 0,
        folded: false
      },
      pianoRollInfo: {
        sequencerMag: 1.0,
        durationMin: 10,
      },
      specImages: {},
      toolMode: 'selector',
      engineIsReady: false
    }
  },
  actions: {
    resetTracksInfo() {
      this.tracksInfo = {
        duration: 0,
        selectedTrackId: null,
        playing: false,
        playbackCurrentTime: 0,
        folded: false
      }
    },
    resetSpecImages() {
      this.specImages = {}
    },
    resetToolMode() {
      this.toolMode = 'selector'
    }
  }
})

const storage = createStorage({
  driver: indexedDbDriver({
    dbName: `${appInfo.appName}-${appInfo.version}`,
    storeName: 'kvs'
  })
})

const settingsKey = 'settings'
const projectsLenMax = 32

const component = defineComponent({
  data(): {
    projectHistory: ProjectHistory
    settingsSaved: boolean
    projectSaved: boolean
    skipHistory: boolean
  } {
    return {
      projectHistory: structuredClone(projectHistoryDefault),
      settingsSaved: true,
      projectSaved: true,
      skipHistory: false
    }
  },
  computed: {
    ...mapWritableState(
      useStore,
      [
        'project',
        'settings'
      ]
    )
  },
  methods: {
    loadSettings() {
      return new Promise<void>((resolve, reject) => {
        storage.getItem<Settings>(settingsKey)
        .then((settings) => {
          if (settings !== null) {
            settingsSchema.parse(settings)
            this.settings = settings
          }

          resolve()
        })
        .catch(reject)
      })
    },
    loadProject(projectId: string) {
      return new Promise<void>((resolve, reject) => {
        storage.getItem<Project>(projectId)
        .then((project) => {
          if (project !== null) {
            projectSchema.parse(project)

            this.skipProjectHistory()
            this.project = project
            this.resetProjectHistory(this.project)

            this.settings.projectsInfo
            .filter((info) => info.id === projectId)
            .forEach((info) => info.date = now())
          }

          resolve()
        })
        .catch(reject)
      })
    },
    unloadProject() {
      this.skipProjectHistory()
      this.project = null
      this.resetProjectHistory()
    },
    saveSettings() {
      return new Promise<void>((resolve, reject) => {
        const raw = toRaw(this.settings)

        Promise.resolve()
        .then(() => settingsSchema.parse(raw))
        .then(() => storage.setItem<Settings>(settingsKey, raw))
        .then(() => {
          this.settingsSaved = true
          console.log('settings:save')
          resolve()
        })
        .catch(reject)
      })
    },
    saveProject() {
      return new Promise<void>((resolve, reject) => {
        if (this.project === null) {
          this.projectSaved = true
          resolve()
          return
        }

        const raw = toRaw(this.project)

        Promise.resolve()
        .then(() => projectSchema.parse(raw))
        .then(() => storage.setItem<Project>(raw.id, raw))
        .then(() => {
          this.projectSaved = true
          console.log('project:save')
          resolve()
        })
        .catch(reject)
      })
    },
    newProject(projectName: string) {
      const projectId = uuid()

      this.settings.projectsInfo.push({
        id:   projectId,
        name: projectName,
        date: now()
      })

      this.project = {
        id:     projectId,
        bpm:    bpmDefault,
        tracks: []
      }

      this.resetProjectHistory(this.project)
    },
    removeProject(projectId: string) {
      const filtered = this.settings.projectsInfo.filter((info) => info.id !== projectId)
      this.settings.projectsInfo = filtered

      if (this.project?.id === projectId) {
        this.unloadProject()
      }

      return new Promise<void>((resolve, reject) => {
        storage.removeItem(projectId)
        .then(() => resolve())
        .catch(reject)
      })
    },
    renameProject(projectId: string, newName: string) {
      this.settings.projectsInfo
      .filter((info) => info.id === projectId)
      .forEach((info) => info.name = newName)
    },
    changedProjectItems(a: Project, b: Project) {
      const changedProjectItems: ChangedProjectItems = {}

      if (a.bpm !== b.bpm) {
        changedProjectItems.other = true
      }

      changedProjectItems.tracks = {}

      const trackIds = [
        ...new Set([
          ...a.tracks.map(({id}) => id),
          ...b.tracks.map(({id}) => id)
        ])
      ]

      trackIds
      .forEach((trackId) => {
        const aTrack = a.tracks.find(({id}) => id === trackId)
        const bTrack = b.tracks.find(({id}) => id === trackId)

        if (!aTrack && !bTrack) return

        if (!aTrack || !bTrack) {
          const changedNotes: { [key: string]: true } = {}
          let isVocalTrack = false

          if (aTrack && !bTrack) {
            if (aTrack?.type === 'vocal') {
              aTrack.notes.forEach((note) => changedNotes[note.id] = true)
              isVocalTrack = true
            }
          } else {
            if (bTrack?.type === 'vocal') {
              bTrack.notes.forEach((note) => changedNotes[note.id] = true)
              isVocalTrack = true
            }
          }

          if (changedProjectItems.tracks) {
            changedProjectItems.tracks[trackId] = {
              other: true
            }

            if (isVocalTrack) {
              changedProjectItems.tracks[trackId].notes = changedNotes
              changedProjectItems.tracks[trackId].speakerId = true
            }
          }

          return
        }

        if (changedProjectItems.tracks) {
          changedProjectItems.tracks[trackId] = {}

          if (
            (aTrack.name !== bTrack.name) ||
            (aTrack.volume !== bTrack.volume) ||
            (aTrack.muted !== bTrack.muted) ||
            (aTrack.color !== bTrack.color)
          ) {
            changedProjectItems.tracks[trackId].other = true
          }

          if ((aTrack.type === 'vocal') && (bTrack.type === 'vocal')) {
            if (aTrack.speakerId !== bTrack.speakerId) {
              changedProjectItems.tracks[trackId].speakerId = true
            }

            const noteIds = [
              ...new Set([
                ...aTrack.notes.map(({id}) => id),
                ...bTrack.notes.map(({id}) => id)
              ])
            ]

            const changedNotes: { [key: string]: true } = {}

            noteIds.forEach((noteId) => {
              const aNote = aTrack.notes.find(({id}) => id === noteId)
              const bNote = bTrack.notes.find(({id}) => id === noteId)

              if (!aNote || !bNote) {
                changedNotes[noteId] = true
                return
              }

              if (
                (aNote.lyric !== bNote.lyric) ||
                (aNote.pitch !== bNote.pitch) ||
                (aNote.begin !== bNote.begin) ||
                (aNote.end !== bNote.end) ||
                (aNote.f0Seg.length !== bNote.f0Seg.length) ||
                (aNote.volumeSeg.length !== bNote.volumeSeg.length) ||
                (aNote.phonemeTimings.length !== bNote.phonemeTimings.length) ||
                aNote.f0Seg.some((f0, i) => f0 !== bNote.f0Seg[i]) ||
                aNote.volumeSeg.some((vol, i) => vol !== bNote.volumeSeg[i]) ||
                aNote.phonemeTimings.some((timing, i) => timing !== bNote.phonemeTimings[i])
              ) {
                changedNotes[noteId] = true
              }
            })

            changedProjectItems.tracks[trackId].notes = changedNotes
          }

          if ((aTrack.type === 'audio') && (bTrack.type === 'audio')) {
            if (
              (aTrack.waveImgUrl !== bTrack.waveImgUrl) ||
              (aTrack.duration !== bTrack.duration)
            ) {
              changedProjectItems.tracks[trackId].other = true
            }
          }
        }
      })

      return changedProjectItems
    },
    emitNoteIds(changedProjectItems: ChangedProjectItems) {
      if (changedProjectItems.tracks) {
        const changedTracks = changedProjectItems.tracks

        Object.keys(changedTracks).forEach((trackId) => {
          if (changedTracks[trackId].speakerId) {
            this.$emit('allNotesChanged', trackId)
            return
          }

          const changedNotes = changedTracks[trackId].notes
          if (!changedNotes) return

          const changedNoteIds = Object.keys(changedNotes)
          this.$emit('notesChanged', trackId, changedNoteIds)
        })
      }
    },
    undo() {
      if (
        (this.project === null) ||
        (this.projectHistory.index <= 0)
      ) return

      this.projectHistory.index--

      const prevProject = structuredClone(toRaw(this.projectHistory.projects[this.projectHistory.index]))
      const changedProjectItems = this.changedProjectItems(this.project, prevProject)

      if (changedProjectItems.other) {
        this.skipProjectHistory()
        this.project.bpm = prevProject.bpm
      }

      if (changedProjectItems.tracks) {
        const changedTracks = changedProjectItems.tracks

        Object.keys(changedTracks).forEach((trackId) => {
          if (this.project === null) return

          const trackIndex = this.project.tracks.findIndex((track) => track.id === trackId)
          const prevTrackIndex = prevProject.tracks.findIndex((track) => track.id === trackId)

          if ((trackIndex === -1) && (prevTrackIndex === -1)) return

          if ((trackIndex !== -1) && (prevTrackIndex === -1)) {
            this.skipProjectHistory()
            this.project.tracks.splice(trackIndex, 1)
            return
          } else if ((trackIndex === -1) && (prevTrackIndex !== -1)) {
            const prevTrack = prevProject.tracks[prevTrackIndex]
            this.skipProjectHistory()
            this.project.tracks.splice(prevTrackIndex, 0, prevTrack)
            return
          }

          const changedTrack = changedTracks[trackId]
          const track = this.project.tracks[trackIndex]
          const prevTrack = prevProject.tracks[prevTrackIndex]

          if (changedTrack.other) {
            this.skipProjectHistory()
            track.name = prevTrack.name

            this.skipProjectHistory()
            track.volume = prevTrack.volume

            this.skipProjectHistory()
            track.muted = prevTrack.muted

            this.skipProjectHistory()
            track.color = prevTrack.color

            if ((track.type === 'audio') && (prevTrack.type === 'audio')) {
              this.skipProjectHistory()
              track.waveImgUrl = prevTrack.waveImgUrl

              this.skipProjectHistory()
              track.duration = prevTrack.duration
            }
          }

          if (changedTrack.notes) {
            Object.keys(changedTrack.notes).forEach((noteId) => {
              if ((track.type !== 'vocal') || (prevTrack.type !== 'vocal')) return
              if (!changedTrack.notes) return

              const noteIndex = track.notes.findIndex((note) => note.id === noteId)
              const prevNoteIndex = prevTrack.notes.findIndex((note) => note.id === noteId)

              if ((noteIndex === -1) && (prevNoteIndex === -1)) return

              if ((noteIndex !== -1) && (prevNoteIndex === -1)) {
                this.skipProjectHistory()
                track.notes.splice(noteIndex, 1)
                return
              } else if ((noteIndex === -1) && (prevNoteIndex !== -1)) {
                const prevNote = prevTrack.notes[prevNoteIndex]
                this.skipProjectHistory()
                track.notes.splice(prevNoteIndex, 0, prevNote)
                return
              }

              if (changedTrack.notes[noteId]) {
                this.skipProjectHistory()
                track.notes[noteIndex] = prevTrack.notes[prevNoteIndex]
              }
            })
          }

          if (changedTrack.speakerId) {
            if ((track.type === 'vocal') && (prevTrack.type === 'vocal')) {
              this.skipProjectHistory()
              track.speakerId = prevTrack.speakerId
            }
          }
        })
      }

      this.emitNoteIds(changedProjectItems)

      console.log('project:undo')
    },
    redo() {
      if (
        (this.project === null) ||
        (this.projectHistory.index >= (this.projectHistory.projects.length - 1))
      ) return

      this.projectHistory.index++

      const nextProject = structuredClone(toRaw(this.projectHistory.projects[this.projectHistory.index]))
      const changedProjectItems = this.changedProjectItems(this.project, nextProject)

      if (changedProjectItems.other) {
        this.skipProjectHistory()
        this.project.bpm = nextProject.bpm
      }

      if (changedProjectItems.tracks) {
        const changedTracks = changedProjectItems.tracks

        Object.keys(changedTracks).forEach((trackId) => {
          if (this.project === null) return

          const trackIndex = this.project.tracks.findIndex((track) => track.id === trackId)
          const nextTrackIndex = nextProject.tracks.findIndex((track) => track.id === trackId)

          if ((trackIndex === -1) && (nextTrackIndex === -1)) return

          if ((trackIndex !== -1) && (nextTrackIndex === -1)) {
            this.skipProjectHistory()
            this.project.tracks.splice(trackIndex, 1)
            return
          } else if ((trackIndex === -1) && (nextTrackIndex !== -1)) {
            const nextTrack = nextProject.tracks[nextTrackIndex]
            this.skipProjectHistory()
            this.project.tracks.splice(nextTrackIndex, 0, nextTrack)
            return
          }

          const changedTrack = changedTracks[trackId]
          const track = this.project.tracks[trackIndex]
          const nextTrack = nextProject.tracks[nextTrackIndex]

          if (changedTrack.other) {
            this.skipProjectHistory()
            track.name = nextTrack.name

            this.skipProjectHistory()
            track.volume = nextTrack.volume

            this.skipProjectHistory()
            track.muted = nextTrack.muted

            this.skipProjectHistory()
            track.color = nextTrack.color

            if ((track.type === 'audio') && (nextTrack.type === 'audio')) {
              this.skipProjectHistory()
              track.waveImgUrl = nextTrack.waveImgUrl

              this.skipProjectHistory()
              track.duration = nextTrack.duration
            }
          }

          if (changedTrack.notes) {
            Object.keys(changedTrack.notes).forEach((noteId) => {
              if ((track.type !== 'vocal') || (nextTrack.type !== 'vocal')) return
              if (!changedTrack.notes) return

              const noteIndex = track.notes.findIndex((note) => note.id === noteId)
              const nextNoteIndex = nextTrack.notes.findIndex((note) => note.id === noteId)

              if ((noteIndex === -1) && (nextNoteIndex === -1)) return

              if ((noteIndex !== -1) && (nextNoteIndex === -1)) {
                this.skipProjectHistory()
                track.notes.splice(noteIndex, 1)
                return
              } else if ((noteIndex === -1) && (nextNoteIndex !== -1)) {
                const nextNote = nextTrack.notes[nextNoteIndex]
                this.skipProjectHistory()
                track.notes.splice(nextNoteIndex, 0, nextNote)
                return
              }

              if (changedTrack.notes[noteId]) {
                this.skipProjectHistory()
                track.notes[noteIndex] = nextTrack.notes[nextNoteIndex]
              }
            })
          }

          if (changedTrack.speakerId) {
            if ((track.type === 'vocal') && (nextTrack.type === 'vocal')) {
              this.skipProjectHistory()
              track.speakerId = nextTrack.speakerId
            }
          }
        })
      }

      this.emitNoteIds(changedProjectItems)

      console.log('project:redo')
    },
    exportSettings() {
      const settings: SettingsForExport = {
        keyboardShortcuts: structuredClone(toRaw(this.settings.keyboardShortcuts))
      }

      const json = JSON.stringify(settings, undefined, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const fileName = `${appInfo.appName}_settings.json`

      downloadFile(fileName, url)
      setTimeout(() => URL.revokeObjectURL(url), 1000 * 10)
    },
    exportProject(projectId: string) {
      storage.getItem<Project>(projectId)
      .then((project) => {
        if (project === null) return

        projectSchema.parse(project)

        const projectInfo = this.settings.projectsInfo.find((info) => info.id === project.id)
        if (projectInfo === undefined) return

        const json = JSON.stringify(project, undefined, 2)
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const fileName = `${projectInfo.name}.json`

        downloadFile(fileName, url)
        setTimeout(() => URL.revokeObjectURL(url), 1000 * 10)
      })
      .catch(console.error)
    },
    importSettings(file: File) {
      readFile(file, 'text')
      .then((json) => {
        const parsed = JSON.parse(json as string)
        settingsForExportSchema.parse(parsed)

        this.unloadProject()

        const settings = parsed as SettingsForExport
        this.settings.keyboardShortcuts = settings.keyboardShortcuts
      })
      .catch((e) => {
        console.error(e)

        alert([
          '設定データのインポートに失敗しました',
          '繰り返し表示される場合はファイルが破損している可能性があります',
          String(e)
        ])
      })
    },
    importProject(file: File) {
      readFile(file, 'text')
      .then((json) => {
        const parsed = JSON.parse(json as string)
        projectSchema.parse(parsed)

        this.unloadProject()

        const project = parsed as Project
        const fileNameWithoutExt = basename(file.name, extname(file.name))

        project.id = uuid()

        this.settings.projectsInfo.push({
          id:   project.id,
          name: fileNameWithoutExt,
          date: now()
        })

        this.project = project
        this.resetProjectHistory(this.project)
      })
      .catch((e) => {
        console.error(e)

        alert([
          'プロジェクトデータのインポートに失敗しました',
          '繰り返し表示される場合はファイルが破損している可能性があります',
          String(e)
        ])
      })
    },
    startUnloadBlocker() {
      window.addEventListener('beforeunload', (event) => {
        if (!this.settingsSaved || !this.projectSaved) {
          event.preventDefault()
        }
      })
    },
    resetProjectHistory(project: Project | null = null) {
      if (project === null) {
        this.projectHistory = structuredClone(projectHistoryDefault)
      } else {
        this.projectHistory = {
          projects: [structuredClone(toRaw(project))],
          index: 0
        }
      }
    },
    addProjectHistory() {
      if (this.project === null) return

      const clone = structuredClone(toRaw(this.project))
      this.projectHistory.projects.splice(this.projectHistory.index + 1)
      this.projectHistory.projects.push(clone)
      this.projectHistory.index++

      const projectsLen = this.projectHistory.projects.length

      if (projectsLen >= projectsLenMax) {
        const diff = projectsLen - projectsLenMax

        this.projectHistory.projects = this.projectHistory.projects.slice(-projectsLenMax)
        this.projectHistory.index -= diff
      }

      console.log('project:history:add')
    },
    skipProjectHistory() {
      this.skipHistory = true
    }
  },
  emits: {
    notesChanged(trackId: string, noteIds: string[]) {
      return true
    },
    allNotesChanged(trackId: string) {
      return true
    }
  },
  watch: {
    settings: {
      handler() {
        this.settingsSaved = false

        this.saveSettings()
        .catch((e) => {
          console.error(e)

          alert([
            '設定の保存に失敗しました',
            '繰り返し表示される場合はページを再読み込みしてください',
            String(e)
          ])
        })
      },
      deep: true
    },
    project: {
      handler() {
        this.projectSaved = false

        this.saveProject()
        .catch((e) => {
          console.error(e)

          alert([
            'プロジェクトの保存に失敗しました',
            '繰り返し表示される場合はページを再読み込みしてください',
            String(e)
          ])
        })

        if (this.skipHistory) {
          this.skipHistory = false
          return
        }

        this.addProjectHistory()
      },
      deep: true
    }
  },
  mounted() {
    this.startUnloadBlocker()
  },
  render() {
    return <></>
  }
})

export default component
export type StorageInstance = InstanceType<typeof component>
