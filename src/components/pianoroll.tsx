import { defineComponent, toRaw, withDirectives, resolveDirective } from 'vue'
import type { PropType } from 'vue'
import { mapWritableState } from 'pinia'
import { utils } from '../engine'
import { useStore, quarterNoteTick } from './storage'
import type { StorageInstance, VocalTrack, Note } from './storage'
import type { TracksInstance } from './tracks'
import { now } from '../utils'

const sequencerMagMax = 5.0
const sequencerMagMin = 0.05
const tickPxCoef = 0.25
const noteHeight = 24
const numOneOctave = 12
const numOctaves = 11
const durationAdj = 4
const f0Default = 1.0
const f0Max = 2.0
const f0Min = 0.5
const volumeDefault = 0.5
const volumeMax = 1.0
const volumeMin = 0.0
const volumeDrawingHeight = 160
const vibratoFreqTickDefault = quarterNoteTick / 3
const vibratoFreqTickMax = quarterNoteTick
const vibratoFreqTickMin = quarterNoteTick / 20
const overlappingNoteColor = '#D6D6D680'

const component = defineComponent({
  data(): {
    selectedNoteIds: string[]
    lastSelectedNoteId: string | null
    pointerMovement: {
      enabled: boolean
      x: number
      y: number
      offsetX: number
      offsetY: number
      scrollTop: number
      scrollLeft: number
      origX: number
      origY: number
    }
    noteResizingInfo: {
      type: 'begin' | 'end'
      sizesOrig: {
        [key: string]: {
          begin: number
          end: number
        }
      }
      resized: boolean
    }
    noteMovingInfo: {
      positionsOrig: {
        [key: string]: {
          pitch: number
          begin: number
          end: number
        }
      }
      moved: boolean
    }
    rectSelectionInfo: {
      enabled: boolean
      x: number
      y: number
      width: number
      height: number
    }
    copiedNotes: Note[]
    doubleClickTime: number
    f0Drawing: {
      points: {
        x: number
        y: number
      }[]
      noteIds: string[]
    }
    vibrato: {
      begin: {
        x: number
        y: number
      } | null
      end: {
        x: number
        y: number
      } | null
      noteIds: string[]
      freqTick: number
    },
    fade: {
      begin: {
        x: number
        y: number
      } | null
      end: {
        x: number
        y: number
      } | null
      noteIds: string[]
    }
    typedLyrics: {
      [key: string]: string
    }
    drewF0Segs: {
      [key: string]: number[]
    }
    drewVibratos: {
      [key: string]: number[]
    }
    drewFades: {
      [key: string]: number[]
    }
    volumeDrawing: {
      points: {
        x: number
        y: number
      }[]
      noteIds: string[]
    }
    drewVolumeSegs: {
      [key: string]: number[]
    }
    pianoRollScrollTop: number
    pianoRollScrollLeft: number
  } {
    return {
      selectedNoteIds: [],
      lastSelectedNoteId: null,
      pointerMovement: {
        enabled: false,
        x: 0,
        y: 0,
        offsetX: 0,
        offsetY: 0,
        scrollTop: 0,
        scrollLeft: 0,
        origX: 0,
        origY: 0
      },
      noteResizingInfo: {
        type: 'begin',
        sizesOrig: {},
        resized: false
      },
      noteMovingInfo: {
        positionsOrig: {},
        moved: false
      },
      rectSelectionInfo: {
        enabled: false,
        x: 0,
        y: 0,
        width: 0,
        height: 0
      },
      copiedNotes: [],
      doubleClickTime: 0,
      f0Drawing: {
        points: [],
        noteIds: []
      },
      vibrato: {
        begin: null,
        end: null,
        noteIds: [],
        freqTick: vibratoFreqTickDefault
      },
      fade: {
        begin: null,
        end: null,
        noteIds: []
      },
      typedLyrics: {},
      drewF0Segs: {},
      drewVibratos: {},
      drewFades: {},
      volumeDrawing: {
        points: [],
        noteIds: []
      },
      drewVolumeSegs: {},
      pianoRollScrollTop: 0,
      pianoRollScrollLeft: 0
    }
  },
  methods: {
    applyDurationToSequencer(duration: number) {
      const sequencer = this.$refs.sequencer as HTMLElement
      const width = this.computeSequencerWidth(duration)
      sequencer.style.width = `${width}px`
    },
    scrollToC4() {
      const pianoRoll = this.$refs.pianoRoll as HTMLElement
      const key = this.$refs.pianoKeyC4 as HTMLElement
      key.scrollIntoView({
        behavior: 'instant',
        block: 'end'
      })
      pianoRoll.scrollBy({
        top: 200,
        left: 0,
        behavior: 'instant'
      })
    },
    movePlaybackHead(time: number) {
      const head = this.$refs.playbackHead as HTMLElement
      head.style.left = `${this.sec2px(time)}px`
    },
    scrollToPlaybackHead() {
      const pianoRoll = this.$refs.pianoRoll as HTMLElement
      const keyboard = this.$refs.keyboard as HTMLElement
      const playbackHead = this.$refs.playbackHead as HTMLElement
      const keyboardWidth = keyboard.clientWidth

      playbackHead.scrollIntoView({
        behavior: 'instant',
        block: 'nearest',
        inline: 'start'
      })

      pianoRoll.scrollBy({
        top: 0,
        left: -keyboardWidth,
        behavior: 'instant'
      })
    },
    scrollToTick(tick: number) {
      const pianoRoll = this.$refs.pianoRoll as HTMLElement
      const px = this.tick2px(tick)

      pianoRoll.scrollTo({
        left: px,
        behavior: 'instant'
      })
    },
    getMousePosInElement(event: MouseEvent, element: HTMLElement) {
      const rect = element.getBoundingClientRect()

      const viewportX = event.clientX
      const viewportY = event.clientY

      const top = rect.top
      const left = rect.left

      const x = viewportX - left
      const y = viewportY - top

      return { x, y }
    },
    updateDurationMin() {
      const pianoRoll = document.querySelector<HTMLElement>('#piano-roll')
      const keyboard = this.$refs.keyboard as HTMLElement

      if (pianoRoll === null) return

      const pianoRollWidth = pianoRoll.clientWidth
      const keyboardWidth = keyboard.clientWidth

      this.pianoRollInfo.durationMin = this.px2sec(pianoRollWidth - keyboardWidth)
    },
    setNoteResizingInfo(track: VocalTrack, type: 'begin' | 'end') {
      const sizesOrig = Object.fromEntries(
        this.selectedNoteIds
        .map((noteId) => {
          const note = track.notes.find((note) => note.id === noteId)
          if (note === undefined) return null

          return [
            noteId,
            {
              begin: note.begin,
              end: note.end
            }
          ]
        })
        .filter((value) => value !== null)
      )

      this.noteResizingInfo = {
        type: type,
        sizesOrig: sizesOrig,
        resized: false
      }
    },
    setNoteMovingInfo(track: VocalTrack) {
      const positionsOrig = Object.fromEntries(
        this.selectedNoteIds
        .map((noteId) => {
          const note = track.notes.find((note) => note.id === noteId)
          if (note === undefined) return null

          return [
            noteId,
            {
              pitch: note.pitch,
              begin: note.begin,
              end: note.end
            }
          ]
        })
        .filter((value) => value !== null)
      )

      this.noteMovingInfo = {
        positionsOrig: positionsOrig,
        moved: false
      }
    },
    setPointerMovement(
      offsetX: number, offsetY: number,
      scrollTop: number, scrollLeft: number,
      origX: number = 0, origY: number = 0
    ) {
      this.pointerMovement = {
        enabled: true,
        x: 0,
        y: 0,
        offsetX: offsetX,
        offsetY: offsetY,
        scrollTop: scrollTop,
        scrollLeft: scrollLeft,
        origX: origX,
        origY: origY
      }
    },
    selectNotes(track: VocalTrack, noteId: string, ctrlOrMeta: boolean, shift: boolean) {
      if (shift && (this.lastSelectedNoteId !== null)) {
        const beginIndex = track.notes.findIndex((note) => note.id === this.lastSelectedNoteId)
        const endIndex = track.notes.findIndex((note) => note.id === noteId)

        if (![beginIndex, endIndex].includes(-1)) {
          track.notes
          .slice(
            Math.min(beginIndex, endIndex),
            Math.max(beginIndex, endIndex) + 1
          )
          .forEach((note) => {
            if (!this.selectedNoteIds.includes(note.id)) {
              this.selectedNoteIds.push(note.id)
            }
          })
        }
      } else if (ctrlOrMeta) {
        if (!this.selectedNoteIds.includes(noteId)) {
          this.selectedNoteIds.push(noteId)
        }
      } else {
        if (!this.selectedNoteIds.includes(noteId)) {
          this.selectedNoteIds = [noteId]
        }
      }
    },
    selectNotesAll() {
      const trackId = this.tracksInfo.selectedTrackId
      const track = this.tracks?.getTrack(trackId)

      if (!track || (track.type !== 'vocal')) return

      track.notes.forEach((note) => {
        if (!this.selectedNoteIds.includes(note.id)) {
          this.selectedNoteIds.push(note.id)
        }
      })
    },
    resizeNotes() {
      if (!this.pointerMovement.enabled) return

      const trackId = this.tracksInfo.selectedTrackId
      const noteIds = this.selectedNoteIds

      if ((trackId === null) || (noteIds.length <= 0)) return

      const type = this.noteResizingInfo.type
      const sizes = this.noteResizingInfo.sizesOrig

      const pianoRoll = this.$refs.pianoRoll as HTMLElement
      const scrollLeft = pianoRoll.scrollLeft - this.pointerMovement.scrollLeft

      noteIds.forEach((noteId) => {
        if (!(noteId in sizes)) return

        const { begin, end } = sizes[noteId]
        const value = (type === 'begin') ? begin : end
        const px = this.pointerMovement.x + scrollLeft
        const tick = value + this.px2tick(px)
        const snap = true
        const snapTick = this.settings.snap.tick

        this.tracks?.resizeNote(
          trackId,
          noteId,
          type,
          tick,
          snap,
          snapTick
        )
      })

      const track = this.tracks?.getTrack(trackId)
      if (track?.type !== 'vocal') return

      this.noteResizingInfo.resized = noteIds.some((noteId) => {
        const note = track.notes.find((note) => note.id === noteId)
        if ((note === undefined) || !(noteId in sizes)) return false
        const { begin, end } = sizes[noteId]
        return (note.begin !== begin) || (note.end !== end)
      })
    },
    moveNotes() {
      if (!this.pointerMovement.enabled) return

      const trackId = this.tracksInfo.selectedTrackId
      const noteIds = this.selectedNoteIds

      if ((trackId === null) || (noteIds.length <= 0)) return

      const positions = this.noteMovingInfo.positionsOrig

      const pianoRoll = this.$refs.pianoRoll as HTMLElement
      const scrollTop = -(pianoRoll.scrollTop - this.pointerMovement.scrollTop)
      const scrollLeft = pianoRoll.scrollLeft - this.pointerMovement.scrollLeft

      noteIds.forEach((noteId) => {
        if (!(noteId in positions)) return

        {
          const position = positions[noteId]
          const value = this.pitch2px(position.pitch)
          const px = value - (-this.pointerMovement.y + scrollTop)
          const pitch = this.px2pitch(px)
          const snap = true

          this.tracks?.scaleNote(
            trackId,
            noteId,
            pitch,
            snap
          )
        }

        {
          const { begin } = positions[noteId]
          const type = 'begin'
          const value = begin
          const px = this.pointerMovement.x + scrollLeft
          const tick = value + this.px2tick(px)
          const snap = true
          const snapTick = this.settings.snap.tick

          this.tracks?.resizeNote(
            trackId,
            noteId,
            type,
            tick,
            snap,
            snapTick
          )
        }

        {
          const { end } = positions[noteId]
          const type = 'end'
          const value = end
          const px = this.pointerMovement.x + scrollLeft
          const tick = value + this.px2tick(px)
          const snap = true
          const snapTick = this.settings.snap.tick

          this.tracks?.resizeNote(
            trackId,
            noteId,
            type,
            tick,
            snap,
            snapTick
          )
        }
      })

      const track = this.tracks?.getTrack(trackId)
      if (track?.type !== 'vocal') return

      this.noteMovingInfo.moved = noteIds.some((noteId) => {
        const note = track.notes.find((note) => note.id === noteId)
        if ((note === undefined) || !(noteId in positions)) return false
        const { pitch, begin, end } = positions[noteId]
        return (note.pitch !== pitch) || (note.begin !== begin) || (note.end !== end)
      })
    },
    rectSelection() {
      if (
        !this.pointerMovement.enabled ||
        !this.rectSelectionInfo.enabled ||
        (
          (Object.keys(this.noteResizingInfo.sizesOrig).length > 0) &&
          (Object.keys(this.noteMovingInfo.positionsOrig).length > 0)
        )
      ) return

      const pianoRoll = this.$refs.pianoRoll as HTMLElement
      const scrollTop = pianoRoll.scrollTop - this.pointerMovement.scrollTop
      const scrollLeft = pianoRoll.scrollLeft - this.pointerMovement.scrollLeft

      const x1 = this.pointerMovement.origX
      const y1 = this.pointerMovement.origY

      const x2 = x1 + (this.pointerMovement.x + scrollLeft)
      const y2 = y1 + (this.pointerMovement.y + scrollTop)

      const { x, y, width, height } = this.computeRect(x1, y1, x2, y2)

      this.rectSelectionInfo = {
        enabled: true,
        x: x,
        y: y,
        width: width,
        height: height
      }

      this.applyRect()
    },
    applyRect() {
      const rectSelector = this.$refs.rectSelector as HTMLElement
      rectSelector.style.width = `${this.rectSelectionInfo.width}px`
      rectSelector.style.height = `${this.rectSelectionInfo.height}px`
      rectSelector.style.top = `${this.rectSelectionInfo.y}px`
      rectSelector.style.left = `${this.rectSelectionInfo.x}px`
      rectSelector.style.display = this.rectSelectionInfo.enabled ? 'block' : 'none'
    },
    checkRectSelectorAndNoteOverlapping(rectSelectionInfo: typeof this.rectSelectionInfo, note: Note) {
      const noteTop = this.pitch2px(note.pitch) - (noteHeight / 2)
      const noteLeft = this.tick2px(note.begin)

      const a = {
        top: rectSelectionInfo.y,
        left: rectSelectionInfo.x,
        right: rectSelectionInfo.x + rectSelectionInfo.width,
        bottom: rectSelectionInfo.y + rectSelectionInfo.height
      }

      const b = {
        top: noteTop,
        left: noteLeft,
        right: noteLeft + this.tick2px(note.end - note.begin),
        bottom: noteTop + noteHeight
      }

      const x = ((a.left < b.left) && (b.left < a.right)) || ((a.left < b.right) && (b.right < a.right))
      const y = ((a.top < b.top) && (b.top < a.bottom)) || ((a.top < b.bottom) && (b.bottom < a.bottom))

      return x && y
    },
    updateF0(
      currentTarget: HTMLElement, target: HTMLElement,
      offsetX: number, offsetY: number,
      button: 'left' | 'right'
    ) {
      const currentTargetRect = currentTarget.getBoundingClientRect()
      let x: number
      let y: number

      if (target === currentTarget) {
        x = offsetX
        y = offsetY
      } else {
        const targetRect = target.getBoundingClientRect()
        const top = targetRect.top - currentTargetRect.top
        const left = targetRect.left - currentTargetRect.left

        x = left + offsetX
        y = top + offsetY
      }

      if (this.f0Drawing.points.length > 1) {
        const a = this.f0Drawing.points[0]
        const b = this.f0Drawing.points.slice(-1)[0]
        const prevDiff = (a.x - b.x)
        const diff = (b.x - x)

        const prevDirection = (prevDiff > 0) ? 'front' : (prevDiff < 0) ? 'back' : 'none'
        const direction = (diff > 0) ? 'front' : (diff < 0) ? 'back' : 'none'

        if (
          ![prevDirection, direction].includes('none') &&
          (prevDirection !== direction)
        ) {
          this.f0Drawing.points = []
        }
      }

      const numAvg = 3
      const sliced = this.f0Drawing.points.slice(-(numAvg - 1))

      x = utils.avg([...sliced.map(({x}) => x), x])
      y = utils.avg([...sliced.map(({y}) => y), y])

      this.f0Drawing.points.push({x, y})

      const sortedPoints = this.f0Drawing.points.toSorted((a, b) => a.x - b.x)

      const xMin = sortedPoints[0].x
      const xMax = sortedPoints.slice(-1)[0].x

      const xList = sortedPoints.map(({x}) => x)
      const yList = sortedPoints.map(({y}) => y)

      const num = Math.round(this.px2tick(xMax - xMin))
      if (num <= 0) return

      const newXList = utils.linspace(xMin, xMax, num)
      const interpolated = utils.interp(xList, yList, newXList)

      this.f0Drawing.noteIds.forEach((noteId) => {
        const trackId = this.tracksInfo.selectedTrackId
        if (trackId === null) return

        const noteElement = document.querySelector<HTMLElement>(`.sequencer-note[noteid="${noteId}"]`)
        if (noteElement === null) return

        const svgElement = noteElement.querySelector<SVGSVGElement>('.f0')
        if (svgElement === null) return

        const svgRect = svgElement.getBoundingClientRect()

        const left = svgRect.left - currentTargetRect.left
        const right = left + svgRect.width

        const track = this.tracks?.getTrack(trackId)
        if (track?.type !== 'vocal') return

        const note = track.notes.find((note) => note.id === noteId)
        if (note === undefined) return

        const begin = utils.int(this.px2tick(Math.max(left - xMin, 0)))
        const num = utils.int(this.px2tick((right - left) + Math.min(left - xMin, 0))) + 1

        const sliced = interpolated.slice(begin, begin + num)
        const offset = utils.int(this.px2tick(Math.max(xMin - left, 0)))

        if (!(note.id in this.drewF0Segs)) {
          this.drewF0Segs[note.id] = structuredClone(toRaw(note.f0Seg))
        }

        for (let i = 0; i < sliced.length; i++) {
          const index = offset + i
          if (index >= this.drewF0Segs[note.id].length) break

          if (button === 'right') {
            this.drewF0Segs[note.id][index] = f0Default
            continue
          }

          let value = utils.pitch2freq(this.px2pitch(sliced[i])) / utils.pitch2freq(note.pitch)
          value = Math.min(value, f0Max)
          value = Math.max(value, f0Min)
          this.drewF0Segs[note.id][index] = value
        }

        const polylineElement = svgElement.querySelector<SVGPolylineElement>('polyline')
        if (polylineElement === null) return

        this.drawF0(
          svgElement,
          polylineElement,
          note.pitch,
          this.drewF0Segs[note.id]
        )
      })
    },
    applyF0() {
      const track = this.tracks?.getTrack(this.tracksInfo.selectedTrackId)

      if (track?.type === 'vocal') {
        this.f0Drawing.noteIds.forEach((noteId) => {
          const note = track.notes.find((note) => note.id === noteId)
          if (note && (note.id in this.drewF0Segs)) {
            note.f0Seg = structuredClone(toRaw(this.drewF0Segs[note.id]))
            delete this.drewF0Segs[note.id]
          }
          this.tracks?.updateNote(track.id, noteId, false)
        })

        if (this.f0Drawing.noteIds.length > 0) {
          this.tracks?.synthVocalTrack(track.id)
        }
      }

      this.f0Drawing.points = []
      this.f0Drawing.noteIds = []
    },
    drawF0(svgElement: SVGSVGElement, polylineElement: SVGPolylineElement, pitch: number, f0Seg: number[]) {
      polylineElement.points.clear()

      this.f0ToPoints(pitch, f0Seg).forEach(({x, y}) => {
        const point = svgElement.createSVGPoint()
        point.x = x
        point.y = y
        polylineElement.points.appendItem(point)
      })
    },
    reDrawF0(trackId: string, noteIds: string[]) {
      noteIds.forEach((noteId) => {
        const noteElement = document.querySelector<HTMLElement>(`.sequencer-note[noteid="${noteId}"]`)
        if (!noteElement) return

        const track = this.tracks?.getTrack(trackId)
        if (track?.type !== 'vocal') return

        const note = track.notes.find((note) => note.id === noteId)
        if (!note) return

        const svgElement = noteElement.querySelector<SVGSVGElement>('.f0')
        if (svgElement === null) return

        const polylineElement = svgElement.querySelector<SVGPolylineElement>('polyline')
        if (polylineElement === null) return

        this.drawF0(
          svgElement,
          polylineElement,
          note.pitch,
          note.f0Seg
        )
      })
    },
    makeVibrato(
      currentTarget: HTMLElement, target: HTMLElement,
      offsetX: number, offsetY: number,
      button: 'left' | 'right'
    ) {
      const currentTargetRect = currentTarget.getBoundingClientRect()

      let x: number
      let y: number

      if (target === currentTarget) {
        x = offsetX
        y = offsetY
      } else {
        const targetRect = target.getBoundingClientRect()
        const top = targetRect.top - currentTargetRect.top
        const left = targetRect.left - currentTargetRect.left

        x = left + offsetX
        y = top + offsetY
      }

      if (!this.vibrato.begin) {
        this.vibrato.begin = { x, y }
      }

      this.vibrato.end = { x, y }

      const x1 = this.vibrato.begin.x
      const y1 = this.vibrato.begin.y

      const x2 = this.vibrato.end.x
      const y2 = this.vibrato.end.y

      const rect = this.computeRect(x1, y1, x2, y2)

      const sampleRate = quarterNoteTick
      const freq = sampleRate / this.vibrato.freqTick
      const amp = rect.height
      const numSamples = utils.int(this.px2tick(rect.width))
      const vibratoWave = new Array(numSamples) as number[]
      const angularFreq = 2 * Math.PI * freq
      const direction = (this.vibrato.begin.y <= this.vibrato.end.y) ? 1 : -1

      for (let i = 0; i < numSamples; i++) {
        vibratoWave[i] = (amp * Math.sin(angularFreq * i / sampleRate) * direction) + this.vibrato.begin.y
      }

      this.vibrato.noteIds.forEach((noteId) => {
        const trackId = this.tracksInfo.selectedTrackId
        if (trackId === null) return

        const noteElement = document.querySelector<HTMLElement>(`.sequencer-note[noteid="${noteId}"]`)
        if (noteElement === null) return

        const svgElement = noteElement.querySelector<SVGSVGElement>('.f0')
        if (svgElement === null) return

        const svgRect = svgElement.getBoundingClientRect()

        const left = svgRect.left - currentTargetRect.left
        const right = left + svgRect.width

        const track = this.tracks?.getTrack(trackId)
        if (track?.type !== 'vocal') return

        const note = track.notes.find((note) => note.id === noteId)
        if (note === undefined) return

        const begin = utils.int(this.px2tick(Math.max(left - rect.x, 0)))
        const num = utils.int(this.px2tick((right - left) + Math.min(left - rect.x, 0))) + 1

        const sliced = vibratoWave.slice(begin, begin + num)
        const offset = utils.int(this.px2tick(Math.max(rect.x - left, 0)))

        this.drewVibratos[note.id] = structuredClone(toRaw(note.f0Seg))

        for (let i = 0; i < sliced.length; i++) {
          const index = offset + i
          if (index >= this.drewVibratos[note.id].length) break

          if (button === 'right') {
            this.drewVibratos[note.id][index] = f0Default
            continue
          }

          let value = utils.pitch2freq(this.px2pitch(sliced[i])) / utils.pitch2freq(note.pitch)
          value = Math.min(value, f0Max)
          value = Math.max(value, f0Min)
          this.drewVibratos[note.id][index] = value
        }

        const polylineElement = svgElement.querySelector<SVGPolylineElement>('polyline')
        if (polylineElement === null) return

        this.drawF0(
          svgElement,
          polylineElement,
          note.pitch,
          this.drewVibratos[note.id]
        )
      })
    },
    applyVibrato() {
      const track = this.tracks?.getTrack(this.tracksInfo.selectedTrackId)

      if (track?.type === 'vocal') {
        this.vibrato.noteIds.forEach((noteId) => {
          const note = track.notes.find((note) => note.id === noteId)
          if (note && (note.id in this.drewVibratos)) {
            note.f0Seg = structuredClone(toRaw(this.drewVibratos[note.id]))
            delete this.drewVibratos[note.id]
          }
          this.tracks?.updateNote(track.id, noteId, false)
        })

        if (this.vibrato.noteIds.length > 0) {
          this.tracks?.synthVocalTrack(track.id)
        }
      }

      this.vibrato.begin = null
      this.vibrato.end = null
      this.vibrato.noteIds = []
    },
    makeFade(
      currentTarget: HTMLElement, target: HTMLElement,
      offsetX: number, offsetY: number,
      button: 'left' | 'right',
      type: 'in' | 'out'
    ) {
      const currentTargetRect = currentTarget.getBoundingClientRect()

      let x: number
      let y: number

      if (target === currentTarget) {
        x = offsetX
        y = offsetY
      } else {
        const targetRect = target.getBoundingClientRect()
        const top = targetRect.top - currentTargetRect.top
        const left = targetRect.left - currentTargetRect.left

        x = left + offsetX
        y = top + offsetY
      }

      if (!this.fade.begin) {
        this.fade.begin = { x, y }
      }

      this.fade.end = { x, y }

      const x1 = this.fade.begin.x
      const y1 = this.fade.begin.y

      const x2 = this.fade.end.x
      const y2 = this.fade.end.y

      const rect = this.computeRect(x1, y1, x2, y2)

      const numSamples = utils.int(this.px2tick(rect.width))
      const fade = (
        (numSamples <= 0) ?
        [] :
        (type === 'in') ?
        utils.linspace(0, 1, numSamples) :
        utils.linspace(1, 0, numSamples)
      )

      this.fade.noteIds.forEach((noteId) => {
        const trackId = this.tracksInfo.selectedTrackId
        if (trackId === null) return

        const noteElement = document.querySelector<HTMLElement>(`.sequencer-note[noteid="${noteId}"]`)
        if (noteElement === null) return

        const svgElement = noteElement.querySelector<SVGSVGElement>('.f0')
        if (svgElement === null) return

        const svgRect = svgElement.getBoundingClientRect()

        const left = svgRect.left - currentTargetRect.left
        const right = left + svgRect.width

        const track = this.tracks?.getTrack(trackId)
        if (track?.type !== 'vocal') return

        const note = track.notes.find((note) => note.id === noteId)
        if (note === undefined) return

        const begin = utils.int(this.px2tick(Math.max(left - rect.x, 0)))
        const num = utils.int(this.px2tick((right - left) + Math.min(left - rect.x, 0))) + 1

        const sliced = fade.slice(begin, begin + num)
        const offset = utils.int(this.px2tick(Math.max(rect.x - left, 0)))

        this.drewFades[note.id] = structuredClone(toRaw(note.f0Seg))

        for (let i = 0; i < sliced.length; i++) {
          const index = offset + i
          if (index >= this.drewFades[note.id].length) break

          if (button === 'right') {
            this.drewFades[note.id][index] = f0Default
            continue
          }

          let value = (this.drewFades[note.id][index] - f0Default) * sliced[i] + f0Default
          value = Math.min(value, f0Max)
          value = Math.max(value, f0Min)
          this.drewFades[note.id][index] = value
        }

        const polylineElement = svgElement.querySelector<SVGPolylineElement>('polyline')
        if (polylineElement === null) return

        this.drawF0(
          svgElement,
          polylineElement,
          note.pitch,
          this.drewFades[note.id]
        )
      })
    },
    applyFade() {
      const track = this.tracks?.getTrack(this.tracksInfo.selectedTrackId)

      if (track?.type === 'vocal') {
        this.fade.noteIds.forEach((noteId) => {
          const note = track.notes.find((note) => note.id === noteId)
          if (note && (note.id in this.drewFades)) {
            note.f0Seg = structuredClone(toRaw(this.drewFades[note.id]))
            delete this.drewFades[note.id]
          }
          this.tracks?.updateNote(track.id, noteId, false)
        })

        if (this.fade.noteIds.length > 0) {
          this.tracks?.synthVocalTrack(track.id)
        }
      }

      this.fade.begin = null
      this.fade.end = null
      this.fade.noteIds = []
    },
    computeRect(x1: number, y1: number, x2: number, y2: number) {
      let x = 0
      let y = 0
      let width = 0
      let height = 0

      if ((x1 === x2) || (y1 === y2)) return { x, y, width, height }

      if ((x1 < x2) && (y1 < y2)) {
        x = x1
        y = y1
        width = x2 - x1
        height = y2 - y1
      } else if ((x2 < x1) && (y2 < y1)) {
        x = x2
        y = y2
        width = x1 - x2
        height = y1 - y2
      } else if ((x2 < x1) && (y1 < y2)) {
        x = x2
        y = y1
        width = x1 - x2
        height = y2 - y1
      } else if ((x1 < x2) && (y2 < y1)) {
        x = x1
        y = y2
        width = x2 - x1
        height = y1 - y2
      }

      return { x, y, width, height }
    },
    f0ToPoints(pitch: number, f0Seg: number[]) {
      const freq = utils.pitch2freq(pitch)

      const f0ToPx = (f0: number) => {
        const pitchPx = this.pitch2px(pitch)
        const f0Px = this.pitch2px(utils.freq2pitch(freq * f0))
        return f0Px - pitchPx
      }

      const h = noteHeight * (12 * 2)
      const centerY = h / 2

      const points = f0Seg.map((f0, i) => {
        const x = i + 1
        const y = centerY + f0ToPx(f0)

        return { x, y }
      })

      return points
    },
    updateVolume(
      currentTarget: HTMLElement, target: HTMLElement,
      offsetX: number, offsetY: number,
      button: 'left' | 'right'
    ) {
      const currentTargetRect = currentTarget.getBoundingClientRect()
      let x: number
      let y: number

      if (target === currentTarget) {
        x = offsetX
        y = offsetY
      } else {
        const targetRect = target.getBoundingClientRect()
        const top = targetRect.top - currentTargetRect.top
        const left = targetRect.left - currentTargetRect.left

        x = left + offsetX
        y = top + offsetY
      }

      if (this.volumeDrawing.points.length > 1) {
        const a = this.volumeDrawing.points[0]
        const b = this.volumeDrawing.points.slice(-1)[0]
        const prevDiff = (a.x - b.x)
        const diff = (b.x - x)

        const prevDirection = (prevDiff > 0) ? 'front' : (prevDiff < 0) ? 'back' : 'none'
        const direction = (diff > 0) ? 'front' : (diff < 0) ? 'back' : 'none'

        if (
          ![prevDirection, direction].includes('none') &&
          (prevDirection !== direction)
        ) {
          this.volumeDrawing.points = []
        }
      }

      const numAvg = 3
      const sliced = this.volumeDrawing.points.slice(-(numAvg - 1))

      x = utils.avg([...sliced.map(({x}) => x), x])
      y = utils.avg([...sliced.map(({y}) => y), y])

      this.volumeDrawing.points.push({x, y})

      const sortedPoints = this.volumeDrawing.points.toSorted((a, b) => a.x - b.x)

      const xMin = sortedPoints[0].x
      const xMax = sortedPoints.slice(-1)[0].x

      const xList = sortedPoints.map(({x}) => x)
      const yList = sortedPoints.map(({y}) => y)

      const num = Math.round(this.px2tick(xMax - xMin))
      if (num <= 0) return

      const newXList = utils.linspace(xMin, xMax, num)
      const interpolated = utils.interp(xList, yList, newXList)

      this.volumeDrawing.noteIds.forEach((noteId) => {
        const trackId = this.tracksInfo.selectedTrackId
        if (trackId === null) return

        const noteElement = document.querySelector<HTMLElement>(`.sequencer-note[noteid="${noteId}"]`)
        if (noteElement === null) return

        const svgElement = noteElement.querySelector<SVGSVGElement>('.volume')
        if (svgElement === null) return

        const svgRect = svgElement.getBoundingClientRect()

        const top = svgRect.top - currentTargetRect.top

        const left = svgRect.left - currentTargetRect.left
        const right = left + svgRect.width

        const track = this.tracks?.getTrack(trackId)
        if (track?.type !== 'vocal') return

        const note = track.notes.find((note) => note.id === noteId)
        if (note === undefined) return

        const begin = utils.int(this.px2tick(Math.max(left - xMin, 0)))
        const num = utils.int(this.px2tick((right - left) + Math.min(left - xMin, 0))) + 1

        const sliced = interpolated.slice(begin, begin + num)
        const offset = utils.int(this.px2tick(Math.max(xMin - left, 0)))

        if (!(note.id in this.drewVolumeSegs)) {
          this.drewVolumeSegs[note.id] = structuredClone(toRaw(note.volumeSeg))
        }

        for (let i = 0; i < sliced.length; i++) {
          const index = offset + i
          if (index >= this.drewVolumeSegs[note.id].length) break

          if (button === 'right') {
            this.drewVolumeSegs[note.id][index] = volumeDefault
            continue
          }

          let value = 1 - ((sliced[i] - top) / volumeDrawingHeight)
          value = Math.min(value, volumeMax)
          value = Math.max(value, volumeMin)
          this.drewVolumeSegs[note.id][index] = value
        }

        const polylineElement = svgElement.querySelector<SVGPolylineElement>('polyline')
        if (polylineElement === null) return

        this.drawVolume(
          svgElement,
          polylineElement,
          this.drewVolumeSegs[note.id]
        )
      })
    },
    applyVolume() {
      const track = this.tracks?.getTrack(this.tracksInfo.selectedTrackId)

      if (track?.type === 'vocal') {
        this.volumeDrawing.noteIds.forEach((noteId) => {
          const note = track.notes.find((note) => note.id === noteId)
          if (note && (note.id in this.drewVolumeSegs)) {
            note.volumeSeg = structuredClone(toRaw(this.drewVolumeSegs[note.id]))
            delete this.drewVolumeSegs[note.id]
          }
          this.tracks?.updateNote(track.id, noteId, false)
        })

        if (this.volumeDrawing.noteIds.length > 0) {
          this.tracks?.synthVocalTrack(track.id)
        }
      }

      this.volumeDrawing.points = []
      this.volumeDrawing.noteIds = []
    },
    drawVolume(svgElement: SVGSVGElement, polylineElement: SVGPolylineElement, volumeSeg: number[]) {
      polylineElement.points.clear()

      this.volumeToPoints(volumeSeg).forEach(({x, y}) => {
        const point = svgElement.createSVGPoint()
        point.x = x
        point.y = y
        polylineElement.points.appendItem(point)
      })
    },
    reDrawVolume(trackId: string, noteIds: string[]) {
      noteIds.forEach((noteId) => {
        const noteElement = document.querySelector<HTMLElement>(`.sequencer-note[noteid="${noteId}"]`)
        if (!noteElement) return

        const track = this.tracks?.getTrack(trackId)
        if (track?.type !== 'vocal') return

        const note = track.notes.find((note) => note.id === noteId)
        if (!note) return

        const svgElement = noteElement.querySelector<SVGSVGElement>('.volume')
        if (svgElement === null) return

        const polylineElement = svgElement.querySelector<SVGPolylineElement>('polyline')
        if (polylineElement === null) return

        this.drawVolume(
          svgElement,
          polylineElement,
          note.volumeSeg
        )
      })
    },
    volumeToPoints(volumeSeg: number[]) {
      const h = volumeDrawingHeight

      const points = volumeSeg.map((volume, i) => {
        const x = i + 1
        const y = h - (h * volume)

        return { x, y }
      })

      return points
    },
    observePlaybackHead() {
      const playbackHead = this.$refs.playbackHead as HTMLElement
      const playbackHeadObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && this.tracksInfo.playing) {
            this.scrollToPlaybackHead()
          }
        })
      })
      playbackHeadObserver.observe(playbackHead)
    },
    copyNotes() {
      this.copiedNotes =
        this.selectedNoteIds
        .map((noteId) => {
          const track = this.tracks?.getTrack(this.tracksInfo.selectedTrackId)
          if (track?.type !== 'vocal') return null

          const note = track.notes.find((note) => note.id === noteId)
          if (note === undefined) return null

          return structuredClone(toRaw(note))
        })
        .filter((value) => value !== null)
    },
    pasteNotes() {
      if ((this.copiedNotes.length <= 0) || (this.tracks === null)) return

      this.tracks.pauseTrackAll()

      const playbackCurrentTime = this.tracksInfo.playbackCurrentTime
      const bpm = this.tracks.getBpm()
      const tick = utils.sec2tick(playbackCurrentTime, bpm)
      const begin = this.copiedNotes.toSorted((a, b) => a.begin - b.begin)[0].begin
      const shift = Math.round((tick - begin) / this.settings.snap.tick) * this.settings.snap.tick

      this.copiedNotes.forEach((note) => {
        this.tracks?.addNote(
          note.pitch,
          note.begin + shift,
          note.end + shift,
          note.lyric,
          true,
          true,
          this.settings.snap.tick,
          note.f0Seg,
          note.volumeSeg,
          false
        )
      })

      if (this.tracksInfo.selectedTrackId) {
        this.tracks?.synthVocalTrack(this.tracksInfo.selectedTrackId)
      }
    },
    removeSelectedNotes() {
      if (this.selectedNoteIds.length <= 0) return
      this.tracks?.pauseTrackAll()

      this.selectedNoteIds.forEach((noteId) => {
        const trackId = this.tracksInfo.selectedTrackId
        if (trackId !== null) {
          this.tracks?.removeNote(trackId, noteId)
        }
      })

      this.selectedNoteIds = []
    },
    computeClipPath(track: VocalTrack, note: Note, noteIndex: number) {
      const nextNote = track.notes[noteIndex + 1]
      const hiddenTick = note.end - (nextNote.begin - Math.max(-nextNote.phonemeTimings[0], 0))
      const totalTick = note.end - (note.begin - Math.max(-note.phonemeTimings[0], 0))
      const percentage = (totalTick - hiddenTick) / totalTick * 100

      return `0% 0%, ${percentage}% 0%, ${percentage}% 100%, 0% 100%`
    },
    computeBottom(note: Note) {
      const pianoRoll = this.$refs.pianoRoll as HTMLElement
      const px = this.pitch2px(note.pitch)
      const height = pianoRoll.clientHeight
      const adj = noteHeight

      return -(this.pianoRollScrollTop - px) - height + adj
    },
    handleKeyDown(event: KeyboardEvent) {
      if (this.page !== 'editor') return
      if (document.activeElement !== document.body) return
      if (!['Backspace', 'Delete'].includes(event.code)) return

      event.preventDefault()
      this.removeSelectedNotes()
    },
    handlePointerMove(event: PointerEvent) {
      if (this.pointerMovement.enabled) {
        this.pointerMovement.x = event.pageX + this.pointerMovement.offsetX
        this.pointerMovement.y = event.pageY + this.pointerMovement.offsetY
      }

      this.resizeNotes()
      this.moveNotes()
      this.rectSelection()
    },
    handlePointerDown(event: PointerEvent) {
      if (
        this.checkF0DrawingMode() ||
        (event.buttons !== 1)
      ) return

      const intervalMs = 300
      const _now = now()
      const pianoRoll = this.$refs.pianoRoll as HTMLElement
      const ctrlOrMeta = event.ctrlKey || event.metaKey
      const shift = event.shiftKey

      if (!ctrlOrMeta && !shift) {
        this.selectedNoteIds = []
      }

      this.lastSelectedNoteId = null

      this.noteResizingInfo.sizesOrig = {}
      this.noteMovingInfo.positionsOrig = {}

      this.rectSelectionInfo = {
        enabled: true,
        x: 0,
        y: 0,
        width: 0,
        height: 0
      }

      this.applyRect()

      this.setPointerMovement(
        -event.pageX,
        -event.pageY,
        pianoRoll.scrollTop,
        pianoRoll.scrollLeft,
        event.offsetX,
        event.offsetY
      )

      if ((_now - this.doubleClickTime) <= intervalMs) {
        this.doubleClickTime = _now

        this.rectSelectionInfo = {
          enabled: false,
          x: 0,
          y: 0,
          width: 0,
          height: 0
        }

        this.applyRect()

        const pitch = this.px2pitch(event.offsetY)
        const begin = this.px2tick(event.offsetX)

        const noteId = this.tracks?.addNote(
          pitch,
          begin,
          undefined,
          undefined,
          true,
          true,
          this.settings.snap.tick,
          undefined,
          undefined,
          true
        )

        if (!noteId) return

        const trackId = this.tracksInfo.selectedTrackId
        if (trackId === undefined) return

        const track = this.tracks?.getTrack(trackId)
        if (track?.type !== 'vocal') return

        if (!this.selectedNoteIds.includes(noteId)) {
          this.selectedNoteIds.push(noteId)
        }

        this.setNoteResizingInfo(track, 'end')
        this.setPointerMovement(
          -event.pageX,
          -event.pageY,
          pianoRoll.scrollTop,
          pianoRoll.scrollLeft
        )

        this.noteMovingInfo.positionsOrig = {}
      } else {
        this.doubleClickTime = _now
      }
    },
    handlePointerUp() {
      if (this.noteResizingInfo.resized || this.noteMovingInfo.moved) {
        const trackId = this.tracksInfo.selectedTrackId
        const track = this.tracks?.getTrack(trackId)

        this.selectedNoteIds.forEach((noteId) => {
          if (trackId === null) return

          const isResized = (this.noteResizingInfo.resized && (noteId in this.noteResizingInfo.sizesOrig))
          const isMoved = (this.noteMovingInfo.moved && (noteId in this.noteMovingInfo.positionsOrig))

          if ((track?.type === 'vocal') && (isResized || isMoved)) {
            const note = track.notes.find((note) => note.id === noteId)

            if (note) {
              const orig = (
                isResized ?
                this.noteResizingInfo.sizesOrig[noteId] :
                this.noteMovingInfo.positionsOrig[noteId]
              )

              const beginOrig = orig.begin
              const endOrig = orig.end

              const begin = note.begin
              const end = note.end

              let type: 'begin' | 'end' | null = null

              if (isResized) {
                if (begin !== beginOrig) {
                  type = 'begin'
                } else if (end !== endOrig) {
                  type = 'end'
                }
              } else if ((end - begin) !== (endOrig - beginOrig)) {
                if (begin < beginOrig) {
                  type = 'begin'
                } else {
                  type = 'end'
                }
              }

              if (type !== null) {
                this.tracks?.updateNoteSegs(note, type)
              }
            }
          }

          this.tracks?.updateNote(trackId, noteId, false)
        })

        if (trackId && (this.selectedNoteIds.length > 0)) {
          this.tracks?.synthVocalTrack(trackId)
        }

        this.storage?.addProjectHistory()
      }

      this.noteResizingInfo = {
        type: 'begin',
        sizesOrig: {},
        resized: false
      }

      this.noteMovingInfo = {
        positionsOrig: {},
        moved: false
      }

      if (this.rectSelectionInfo.enabled) {
        const trackId = this.tracksInfo.selectedTrackId
        const track = this.tracks?.getTrack(trackId)

        if (track?.type === 'vocal') {
          track.notes.forEach((note) => {
            const isOverlapping = this.checkRectSelectorAndNoteOverlapping(this.rectSelectionInfo, note)
            if (!isOverlapping) return

            if (!this.selectedNoteIds.includes(note.id)) {
              this.selectedNoteIds.push(note.id)
            }
          })
        }
      }

      this.rectSelectionInfo = {
        enabled: false,
        x: 0,
        y: 0,
        width: 0,
        height: 0
      }

      this.applyRect()

      if (this.pointerMovement.enabled) {
        this.pointerMovement = {
          enabled: false,
          x: 0,
          y: 0,
          offsetX: 0,
          offsetY: 0,
          scrollTop: 0,
          scrollLeft: 0,
          origX: 0,
          origY: 0
        }
      }
    },
    handleWheel(event: WheelEvent) {
      if (this.vibrato.begin) {
        event.preventDefault()

        if ((event.buttons !== 1) && (event.buttons !== 2)) return

        const deltaCoef = -0.04

        let value = this.vibrato.freqTick + (event.deltaY * deltaCoef)
        value = Math.min(value, vibratoFreqTickMax)
        value = Math.max(value, vibratoFreqTickMin)

        this.vibrato.freqTick = value

        const currentTarget = event.currentTarget as HTMLElement
        const target = event.target as HTMLElement
        const button = (event.buttons === 1) ? 'left' : 'right'

        this.makeVibrato(
          currentTarget,
          target,
          event.offsetX,
          event.offsetY,
          button
        )

        return
      }

      const ctrlOrMeta = event.ctrlKey || event.metaKey
      if (!ctrlOrMeta) return

      event.preventDefault()

      const duration = this.tracksInfo.duration
      const time = this.tracksInfo.playbackCurrentTime
      const deltaCoef = -0.001

      const pianoRoll = this.$refs.pianoRoll as HTMLElement
      const sequencer = this.$refs.sequencer as HTMLElement

      const px = this.getMousePosInElement(event, sequencer).x
      const tick = this.px2tick(px)

      this.pianoRollInfo.sequencerMag = Math.min(
        Math.max(
          this.pianoRollInfo.sequencerMag + (event.deltaY * deltaCoef),
          sequencerMagMin
        ),
        sequencerMagMax
      )

      this.applyDurationToSequencer(duration)
      this.movePlaybackHead(Math.min(time, duration))

      const newPx = this.tick2px(tick)
      const scrollLeft = newPx - px

      pianoRoll.scrollBy({
        left: scrollLeft,
        behavior: 'instant'
      })
    },
    checkF0DrawingMode() {
      return (
        (this.toolMode === 'pen') ||
        (this.toolMode === 'vibrato') ||
        (this.toolMode === 'fade-in') ||
        (this.toolMode === 'fade-out')
      )
    },
    checkNoteInView(note: Note) {
      const pianoRoll = this.$refs.pianoRoll as HTMLElement
      const keyboard = this.$refs.keyboard as HTMLElement

      const pianoRollWidth = pianoRoll.clientWidth
      const keyboardWidth = keyboard.clientWidth

      const left = this.pianoRollScrollLeft
      const right = left + pianoRollWidth - keyboardWidth

      const beginPx = this.tick2px(note.begin)
      const endPx = this.tick2px(note.end)

      return ((endPx > left) && (beginPx < right))
    },
    reset() {
      this.pianoRollInfo.sequencerMag = 1.0
      this.movePlaybackHead(this.tracksInfo.playbackCurrentTime)
      this.applyDurationToSequencer(this.tracksInfo.duration)
      this.scrollToC4()

      const pianoRoll = this.$refs.pianoRoll as HTMLElement
      pianoRoll.scroll({
        left: 0,
        behavior: 'instant'
      })

      this.selectedNoteIds = []
      this.copiedNotes = []
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
        'pianoRollInfo',
        'specImages',
        'toolMode'
      ]
    ),
    tick2px() {
      return (tick: number) => tick * tickPxCoef * this.pianoRollInfo.sequencerMag
    },
    px2tick() {
      return (px: number) => px / tickPxCoef / this.pianoRollInfo.sequencerMag
    },
    px2pitch() {
      return (px: number) => ((noteHeight * (numOneOctave * numOctaves)) - px) / noteHeight - 0.5
    },
    pitch2px() {
      return (pitch: number) => (noteHeight * (numOneOctave * numOctaves)) - (noteHeight * pitch) - (noteHeight / 2)
    },
    px2sec() {
      return (px: number) => {
        if (this.tracks === null) return 0
        return utils.tick2sec(this.px2tick(px), this.tracks.getBpm())
      }
    },
    sec2px() {
      return (sec: number) => {
        if (this.tracks === null) return 0
        return this.tick2px(utils.sec2tick(sec, this.tracks.getBpm()))
      }
    },
    computeSequencerWidth() {
      return (duration: number) => {
        this.updateDurationMin()
        return this.sec2px(Math.max(duration, this.pianoRollInfo.durationMin) + durationAdj)
      }
    },
    computeNumVerticalLines() {
      return (type: 'snap' | 'whole') => {
        if (this.tracks === null) return 0

        this.updateDurationMin()

        const duration = Math.max(this.tracksInfo.duration, this.pianoRollInfo.durationMin) + durationAdj
        const bpm = this.tracks.getBpm()
        const tick = utils.sec2tick(duration, bpm)
        const divTick = ((type === 'snap') ? this.settings.snap.tick : (quarterNoteTick * 4))

        return Math.floor(tick / divTick)
      }
    }
  },
  props: {
    storage: {
      type: [Object, null] as PropType<StorageInstance | null>,
      required: true
    },
    tracks: {
      type: [Object, null] as PropType<TracksInstance | null>,
      required: true
    }
  },
  directives: {
    mount: {
      mounted(element, binding) {
        const callback = binding.value

        if (typeof callback === 'function') {
          callback(element)
        }
      }
    }
  },
  watch: {
    page() {
      if (this.page === 'editor') {
        this.reset()
      }
    },
    toolMode() {
      if (this.checkF0DrawingMode()) {
        this.selectedNoteIds = []
      }
    },
    'tracksInfo.duration'() {
      this.applyDurationToSequencer(this.tracksInfo.duration)
    },
    'tracksInfo.playbackCurrentTime'() {
      this.movePlaybackHead(this.tracksInfo.playbackCurrentTime)
    }
  },
  mounted() {
    window.addEventListener('keydown', (event) => this.handleKeyDown(event))
    window.addEventListener('resize', () => this.applyDurationToSequencer(this.tracksInfo.duration))
    window.addEventListener('pointermove', (event) => this.handlePointerMove(event))
    window.addEventListener('pointerup', () => this.handlePointerUp())
    this.observePlaybackHead()
  },
  render() {
    return (
      <div
        id="piano-roll"
        class="w-full h-full bg-main-mid rounded-md overflow-hidden"
      >
        <div
          ref="pianoRoll"
          class="w-full h-full relative flex overflow-scroll scrollbar-light"
          onFocus={(event) => {
            if (event.currentTarget) {
              (event.currentTarget as HTMLElement).blur()
            }
          }}
          onScroll={(event) => {
            if (event.currentTarget) {
              const target = event.currentTarget as HTMLElement
              this.pianoRollScrollTop = target.scrollTop
              this.pianoRollScrollLeft = target.scrollLeft
            }
          }}
        >
          {/* keyboard */}
          <div
            ref="keyboard"
            class="w-fit h-fit sticky left-0 bg-main flex flex-col-reverse z-50"
          >
            {
              [...new Array(numOctaves)].flatMap((_, i, array) => (
                <div
                  class="w-[5.125rem] h-[24rem] relative"
                  style={{
                    height: `${
                      (noteHeight * 2 * 3) +
                      (noteHeight * 1.5 * 4)
                    }px`
                  }}
                >
                  {/* white keys */}
                  <div class="w-fit h-fit absolute m-auto inset-0 pr-0.5 flex flex-col-reverse">
                    {
                      [...new Array(7)].map((_, j) => (
                        <div
                          class="w-20 relative bg-accent flex justify-end items-center"
                          style={{
                            height: `${noteHeight * ([1, 4, 5].includes(j) ? 2 : 1.5)}px`
                          }}
                        >
                          {
                            (j === 0) ?
                            <p class="mr-2 select-none">
                              { `C${i - 1}` }
                            </p> :
                            <></>
                          }
                          {
                            ((i === 5) && (j === 0)) ?
                            <div ref="pianoKeyC4" class="h-full"></div> :
                            <></>
                          }
                          {
                            ((j === 2) || ((j === 6) && (i < (array.length - 1)))) ?
                            <div class="w-full h-0.5 absolute m-auto top-[-1px] left-0 bg-main z-10">
                            </div> :
                            <></>
                          }
                        </div>
                      ))
                    }
                  </div>
                  {/* black keys */}
                  <div class="w-fit h-fit absolute m-auto bottom-0 left-0 pr-0.5 flex flex-col-reverse">
                    {
                      [...new Array(numOneOctave)].map((_, j) => (
                        <div
                          class={`
                            w-10 relative bg-main
                            ${[0, 2, 4, 5, 7, 9, 11].includes(j) ? 'opacity-0' : ''}
                          `}
                          style={{
                            height: `${noteHeight}px`
                          }}
                        >
                          {
                            ![0, 2, 4, 5, 7, 9, 11].includes(j) ?
                            <div class="w-20 h-0.5 absolute m-auto inset-y-0 left-0 bg-main z-10">
                            </div> :
                            <></>
                          }
                        </div>
                      ))
                    }
                  </div>
                </div>
              ))
            }
          </div>
          {/* sequencer */}
          <div
            ref="sequencer"
            class={`
              w-0 h-fit relative flex flex-col-reverse shrink-0
              ${
                (
                  this.pointerMovement.enabled &&
                  (Object.keys(this.noteResizingInfo.sizesOrig).length > 0)
                ) ?
                'cursor-col-resize' :
                ''
              }
            `}
            onPointerdown={(event) => {
              this.handlePointerDown(event)
            }}
            onPointerup={() => {
              if (this.toolMode === 'pen') {
                this.applyF0()
                this.applyVolume()
              }

              if (this.toolMode === 'vibrato') {
                this.applyVibrato()
              }

              if ((this.toolMode === 'fade-in') || (this.toolMode === 'fade-out')) {
                this.applyFade()
              }
            }}
            onMouseleave={(event) => {
              if ((event.buttons !== 1) && (event.buttons !== 2)) return

              if (this.toolMode === 'pen') {
                this.applyF0()
                this.applyVolume()
              }

              if (this.toolMode === 'vibrato') {
                this.applyVibrato()
              }

              if ((this.toolMode === 'fade-in') || (this.toolMode === 'fade-out')) {
                this.applyFade()
              }
            }}
            onPointermove={(event) => {
              if (
                !this.checkF0DrawingMode() ||
                ((event.buttons !== 1) && (event.buttons !== 2))
              ) return

              if (
                (event.currentTarget === null) ||
                (event.target === null)
              ) return

              const currentTarget = event.currentTarget as HTMLElement
              const target = event.target as HTMLElement
              const button = (event.buttons === 1) ? 'left' : 'right'

              if (this.toolMode === 'pen') {
                this.updateF0(
                  currentTarget,
                  target,
                  event.offsetX,
                  event.offsetY,
                  button
                )

                this.updateVolume(
                  currentTarget,
                  target,
                  event.offsetX,
                  event.offsetY,
                  button
                )
              }

              if (this.toolMode === 'vibrato') {
                this.makeVibrato(
                  currentTarget,
                  target,
                  event.offsetX,
                  event.offsetY,
                  button
                )
              }

              if (this.toolMode === 'fade-in') {
                this.makeFade(
                  currentTarget,
                  target,
                  event.offsetX,
                  event.offsetY,
                  button,
                  'in'
                )
              }

              if (this.toolMode === 'fade-out') {
                this.makeFade(
                  currentTarget,
                  target,
                  event.offsetX,
                  event.offsetY,
                  button,
                  'out'
                )
              }
            }}
            onWheel={(event) => {
              this.handleWheel(event)
            }}
            onDragstart={(event) => {
              const currentTarget = event.currentTarget
              const target = event.target

              if ((currentTarget !== null) && (target === currentTarget)) {
                event.preventDefault()
              }
            }}
            onContextmenu={(event) => {
              if (
                (event.currentTarget !== null) &&
                (event.target === event.currentTarget)
              ) {
                event.preventDefault()
              }
            }}
          >
            {/* horizontal lines */}
            {
              [...new Array(numOctaves)].flatMap((_, i) => (
                [...new Array(numOneOctave)].map((_, j) => (
                  <div
                    class={`
                      w-full relative pointer-events-none
                      ${
                        [1, 3, 6, 8, 10].includes(j) ?
                        'bg-main-mid' :
                        'bg-main-light'
                      }
                    `}
                    style={{
                      height: `${noteHeight}px`
                    }}
                  >
                    {
                      !((i === 0) && (j === 0)) ?
                      <div class="w-full h-0.5 absolute m-auto left-0 bottom-[-1px] bg-main z-10">
                      </div> :
                      <></>
                    }
                  </div>
                ))
              ))
            }
            {/* vertical lines */}
            {
              [...new Array(this.computeNumVerticalLines('snap'))].map((_, i) => {
                const tick = this.settings.snap.tick * (i + 1)
                const isQuarter = (tick % quarterNoteTick) === 0

                return (
                  <div
                    class={`
                      w-0.5 h-full absolute m-auto inset-y-0 bg-main pointer-events-none
                      ${isQuarter ? 'opacity-100' : 'opacity-30'}
                    `}
                    style={{
                      left: `${this.tick2px(tick) - 1}px`
                    }}
                  ></div>
                )
              })
            }
            {/* spectrogram images */}
            {
              Object.keys(this.specImages).flatMap((key) => {
                const images = this.specImages[key]
                return images.map((image) => (
                  <img
                    class="
                      h-full absolute m-auto top-0 bg-accent pointer-events-none select-none
                      [image-rendering:pixelated]
                    "
                    style={{
                      width: `${this.sec2px(image.duration)}px`,
                      left: `${this.sec2px(image.offset)}px`,
                      '-webkit-mask-image': `url(${image.url})`,
                      maskImage: `url(${image.url})`,
                      maskSize: '100% 100%',
                      maskRepeat: 'no-repeat',
                      maskPosition: 'center',
                      display: image.hidden ? 'none' : 'block'
                    }}
                  ></img>
                ))
              })
            }
            {/* timeline */}
            <div class="w-full h-full absolute m-auto inset-0 z-40 pointer-events-none">
              <div
                class="
                  w-full h-8 sticky m-auto top-0 bg-main border-y-4 border-main-mid pointer-events-auto
                "
                onClick={(event) => {
                  if (this.tracksInfo.playing) return
                  const time = this.px2sec(event.offsetX)
                  this.tracksInfo.playbackCurrentTime = time
                }}
                onDblclick={(event) => event.stopPropagation()}
                onPointerdown={(event) => event.stopPropagation()}
              >
                {
                  [... new Array(this.computeNumVerticalLines('whole'))].map((_, i) => {
                    const tick = (quarterNoteTick * 4) * i
                    const number = i + 1

                    return (
                      <div
                        class="
                          w-16 h-full absolute m-auto inset-y-0 pl-1 border-l-2 border-accent
                          flex items-center opacity-50 pointer-events-none
                        "
                        style={{
                          left: `${this.tick2px(tick)}px`
                        }}
                      >
                        <p class="text-sm text-accent selection-clear">
                          { number }
                        </p>
                      </div>
                    )
                  })
                }
              </div>
            </div>
            {/* notes */}
            {
              this.project?.tracks
              .filter((track) => track.type === 'vocal')
              .flatMap((track) => (
                track.notes.map((note, noteIndex) => (
                  !this.checkNoteInView(note) ?
                  null :
                  (track.id === this.tracksInfo.selectedTrackId) ?
                  <div
                    key={ `sequencer-note-${note.id}` }
                    class={`
                      absolute m-auto flex justify-start items-center z-30 sequencer-note
                      ${this.checkF0DrawingMode() ? 'pointer-events-none' : ''}
                    `}
                    style={{
                      width: `${this.tick2px(note.end - note.begin)}px`,
                      height: `${noteHeight}px`,
                      top: `${this.pitch2px(note.pitch) - (noteHeight / 2)}px`,
                      left: `${this.tick2px(note.begin)}px`
                    }}
                    onDblclick={(event) => {
                      if (this.toolMode !== 'selector') return
                      event.stopPropagation()

                      if (event.currentTarget === null) return
                      const target = event.currentTarget as HTMLElement

                      const input = target.querySelector<HTMLInputElement>('input[type="text"]')
                      if (input === null) return

                      input.style.pointerEvents = 'auto'
                      input.focus()
                    }}
                    onPointerdown={(event) => {
                      if (this.checkF0DrawingMode() || (event.buttons !== 1)) return

                      event.stopPropagation()

                      const pianoRoll = this.$refs.pianoRoll as HTMLElement

                      this.selectNotes(
                        track,
                        note.id,
                        event.ctrlKey || event.metaKey,
                        event.shiftKey
                      )
                      this.setNoteMovingInfo(track)
                      this.setPointerMovement(
                        -event.pageX,
                        -event.pageY,
                        pianoRoll.scrollTop,
                        pianoRoll.scrollLeft
                      )

                      this.lastSelectedNoteId = note.id
                      this.noteResizingInfo.sizesOrig = {}
                    }}
                    // @ts-ignore
                    noteid={ note.id }
                  >
                    {
                      (() => {
                        const isOverlapping = (
                          !this.pointerMovement.enabled ?
                          this.tracks?.checkNoteOverlapping(track.id, note.id) :
                          false
                        )
                        const isF0DrawingMode = this.checkF0DrawingMode()

                        return (
                          <>
                            <div
                              class={`
                                absolute m-auto top-[-2px] left-[-2px] rounded brightness-50
                                [width:calc(100%+4px)] [height:calc(100%+4px)]
                                ${isF0DrawingMode ? 'opacity-30' : ''}
                              `}
                              style={{
                                backgroundColor: (isOverlapping ? overlappingNoteColor : track.color)
                              }}
                            ></div>
                            <div
                              class={`
                                w-full h-full absolute m-auto inset-0 rounded-sm
                                ${this.selectedNoteIds.includes(note.id) ? 'brightness-150' : ''}
                                ${isF0DrawingMode ? 'opacity-30' : ''}
                              `}
                              style={{
                                backgroundColor: (isOverlapping ? overlappingNoteColor : track.color)
                              }}
                            ></div>
                          </>
                        )
                      })()
                    }
                    <input
                      class={`
                        min-w-10 absolute m-auto inset-y-0 left-2 bg-transparent
                        text-sm text-main z-10 pointer-events-none
                        w-[calc(100%-1rem)] selection-clear
                        ${this.checkF0DrawingMode() ? 'opacity-30' : ''}
                      `}
                      type="text"
                      value={ note.lyric }
                      disabled={ this.checkF0DrawingMode() }
                      onInput={(event) => {
                        if (event.target === null) return

                        const target = event.currentTarget as HTMLInputElement
                        const newLyric = target.value

                        this.typedLyrics[note.id] = newLyric
                      }}
                      onKeydown={(event) => {
                        if (event.code === 'Tab') {
                          const destNoteIndex = noteIndex + (event.shiftKey ? -1 : 1)

                          if ((0 <= destNoteIndex) && (destNoteIndex < track.notes.length)) {
                            event.preventDefault()

                            const destNote = track.notes[destNoteIndex]
                            const inView = this.checkNoteInView(destNote)
                            const waitMs = 100
                            let promise = Promise.resolve()

                            if (!inView) {
                              this.scrollToTick(destNote.begin)
                              promise = new Promise((resolve) => setTimeout(() => resolve(), waitMs))
                            }

                            promise
                            .then(() => {
                              const query = `.sequencer-note[noteid="${destNote.id}"] > input[type="text"]`
                              const element = document.querySelector<HTMLInputElement>(query)
                              element?.focus()
                            })
                            .catch(console.error)
                          }
                        } else if (event.code === 'Escape') {
                          (event.currentTarget as HTMLInputElement | null)?.blur()
                        }
                      }}
                      onFocus={(event) => {
                        if (event.currentTarget === null) return
                        const target = event.currentTarget as HTMLInputElement
                        target.classList.remove('selection-clear')
                        target.select()
                      }}
                      onBlur={(event) => {
                        if (event.currentTarget === null) return
                        const target = event.currentTarget as HTMLInputElement

                        if (note.id in this.typedLyrics) {
                          const newLyric = this.typedLyrics[note.id]
                          this.tracks?.setLyric(note.id, newLyric)
                          delete this.typedLyrics[note.id]
                        }

                        target.classList.add('selection-clear')
                        target.style.pointerEvents = 'none'
                      }}
                      onPointerdown={(event) => event.stopPropagation()}
                      onPointermove={(event) => event.stopPropagation()}
                      onPointerup={(event) => event.stopPropagation()}
                    ></input>
                    <div
                      class={`
                        w-2 h-full absolute m-auto inset-y-0 left-0 cursor-col-resize z-20
                        ${this.checkF0DrawingMode() ? 'pointer-events-none' : ''}
                      `}
                      onPointerdown={(event) => {
                        event.stopPropagation()

                        const pianoRoll = this.$refs.pianoRoll as HTMLElement

                        if (this.selectedNoteIds.length === 1) {
                          this.selectedNoteIds = []
                        }

                        if (!this.selectedNoteIds.includes(note.id)) {
                          this.selectedNoteIds.push(note.id)
                        }

                        this.setNoteResizingInfo(track, 'begin')
                        this.setPointerMovement(
                          -event.pageX,
                          -event.pageY,
                          pianoRoll.scrollTop,
                          pianoRoll.scrollLeft
                        )

                        this.noteMovingInfo.positionsOrig = {}
                      }}
                    ></div>
                    <div
                      class={`
                        w-2 h-full absolute m-auto inset-y-0 right-0 cursor-col-resize z-20
                        ${this.checkF0DrawingMode() ? 'pointer-events-none' : ''}
                      `}
                      onPointerdown={(event) => {
                        event.stopPropagation()

                        const pianoRoll = this.$refs.pianoRoll as HTMLElement

                        if (this.selectedNoteIds.length === 1) {
                          this.selectedNoteIds = []
                        }

                        if (!this.selectedNoteIds.includes(note.id)) {
                          this.selectedNoteIds.push(note.id)
                        }

                        this.setNoteResizingInfo(track, 'end')
                        this.setPointerMovement(
                          -event.pageX,
                          -event.pageY,
                          pianoRoll.scrollTop,
                          pianoRoll.scrollLeft
                        )

                        this.noteMovingInfo.positionsOrig = {}
                      }}
                    ></div>
                    {
                      this.checkF0DrawingMode() ?
                      <>
                        <div
                          class="h-6 absolute m-auto top-6 right-0 pointer-events-none"
                          style={{
                            width: `${this.tick2px((note.end - note.begin) + Math.max(-note.phonemeTimings[0], 0))}px`
                          }}
                        >
                          {
                            this.tracks?.lyric2phonemes(note.lyric, track.speakerId).map((phoneme, i) => (
                              <div
                                class="w-12 h-full absolute m-auto pl-1 inset-y-0 border-l-2 border-accent flex items-center opacity-50"
                                style={{
                                  left: `${this.tick2px(note.phonemeTimings[i] - note.phonemeTimings[0])}px`
                                }}
                              >
                                <p class="text-sm text-accent selection-clear">
                                  { phoneme }
                                </p>
                              </div>
                            ))
                          }
                        </div>
                        <svg
                          class="absolute m-auto inset-y-0 right-0 z-30 pointer-events-auto f0"
                          style={{
                            width: `${this.tick2px((note.end - note.begin) + Math.max(-note.phonemeTimings[0], 0))}px`,
                            height: `${noteHeight * (12 * 2)}px`,
                            clipPath: `polygon(
                              ${
                                ((noteIndex + 1) < track.notes.length) ?
                                this.computeClipPath(track, note, noteIndex) :
                                '0% 0%, 100% 0%, 100% 100%, 0% 100%'
                              }
                            )`
                          }}
                          preserveAspectRatio="none"
                          viewBox={`
                            0
                            0
                            ${note.f0Seg.length}
                            ${noteHeight * (12 * 2)}
                          `}
                          onPointerdown={(event) => event.preventDefault()}
                          onPointerup={(event) => event.preventDefault()}
                          onContextmenu={(event) => event.preventDefault()}
                          onPointermove={() => {
                            if (
                              (this.f0Drawing.points.length > 0) &&
                              (this.volumeDrawing.noteIds.length <= 0)
                            ) {
                              if (!this.f0Drawing.noteIds.includes(note.id)) {
                                this.f0Drawing.noteIds.push(note.id)
                              }
                            }

                            if (this.vibrato.begin) {
                              if (!this.vibrato.noteIds.includes(note.id)) {
                                this.vibrato.noteIds.push(note.id)
                              }
                            }

                            if (this.fade.begin) {
                              if (!this.fade.noteIds.includes(note.id)) {
                                this.fade.noteIds.push(note.id)
                              }
                            }
                          }}
                        >
                          {
                            withDirectives(
                              <polyline
                                class="pointer-events-none"
                                stroke="#F96250"
                                stroke-width="2"
                                fill="none"
                                vector-effect="non-scaling-stroke"
                              ></polyline>,
                              [
                                [
                                  resolveDirective('mount'),
                                  (element: SVGPolylineElement) => {
                                    this.drawF0(
                                      element.parentElement as unknown as SVGSVGElement,
                                      element,
                                      note.pitch,
                                      note.f0Seg
                                    )
                                  }
                                ]
                              ]
                            )
                          }
                        </svg>
                        <svg
                          class="absolute m-auto right-0 z-40 border-y-[1px] border-accent border-dashed pointer-events-auto volume"
                          style={{
                            width: `${this.tick2px((note.end - note.begin) + Math.max(-note.phonemeTimings[0], 0))}px`,
                            height: `${volumeDrawingHeight}px`,
                            bottom: `${this.computeBottom(note)}px`,
                            clipPath: `polygon(
                              ${
                                ((noteIndex + 1) < track.notes.length) ?
                                this.computeClipPath(track, note, noteIndex) :
                                '0% 0%, 100% 0%, 100% 100%, 0% 100%'
                              }
                            )`
                          }}
                          preserveAspectRatio="none"
                          viewBox={`
                            0
                            0
                            ${note.volumeSeg.length}
                            ${volumeDrawingHeight}
                          `}
                          onPointerdown={(event) => event.preventDefault()}
                          onPointerup={(event) => event.preventDefault()}
                          onContextmenu={(event) => event.preventDefault()}
                          onPointermove={() => {
                            if (
                              (this.volumeDrawing.points.length > 0) &&
                              (this.f0Drawing.noteIds.length <= 0)
                            ) {
                              if (!this.volumeDrawing.noteIds.includes(note.id)) {
                                this.volumeDrawing.noteIds.push(note.id)
                              }
                            }
                          }}
                        >
                          {
                            withDirectives(
                              <polyline
                                class="pointer-events-none"
                                stroke="#51A4F7"
                                stroke-width="2"
                                fill="none"
                                vector-effect="non-scaling-stroke"
                              ></polyline>,
                              [
                                [
                                  resolveDirective('mount'),
                                  (element: SVGPolylineElement) => {
                                    this.drawVolume(
                                      element.parentElement as unknown as SVGSVGElement,
                                      element,
                                      note.volumeSeg
                                    )
                                  }
                                ]
                              ]
                            )
                          }
                        </svg>
                      </> :
                      <></>
                    }
                  </div> :
                  <div
                    key={ `sequencer-note-${note.id}` }
                    class="h-1 absolute m-auto z-20 opacity-50 pointer-events-none"
                    style={{
                      width: `${this.tick2px(note.end - note.begin)}px`,
                      top: `${noteHeight * ((numOneOctave * numOctaves) - (note.pitch + 1) + 0.5) - 2}px`,
                      left: `${this.tick2px(note.begin)}px`,
                      backgroundColor: track.color
                    }}
                  >
                  </div>
                ))
              ))
            }
            {/* playback head */}
            <div
              ref="playbackHead"
              class="w-0.5 h-full absolute m-auto top-0 bg-accent z-30 pointer-events-none"
            ></div>
            {/* rect selector */}
            <div
              ref="rectSelector"
              class="absolute m-auto rounded bg-accent z-40 opacity-30"
            ></div>
          </div>
        </div>
      </div>
    )
  }
})

export default component
export type PianoRollInstance = InstanceType<typeof component>
