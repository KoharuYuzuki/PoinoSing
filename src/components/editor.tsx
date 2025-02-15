import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import { mapState } from 'pinia'
import { useStore } from './storage'
import type { StorageInstance } from './storage'
import Tracks from './tracks'
import type { TracksInstance } from './tracks'
import Tools from './tools'
import PianoRoll from './pianoroll'
import type { PianoRollInstance } from './pianoroll'
import ProgressBar from './progressbar'
import type { ProgressBarInstance } from './progressbar'

const component = defineComponent({
  data(): {
    tracks: TracksInstance | null
    pianoRoll: PianoRollInstance | null
    progressBar: ProgressBarInstance | null
  } {
    return {
      tracks: null,
      pianoRoll: null,
      progressBar: null
    }
  },
  props: {
    storage: {
      type: [Object, null] as PropType<StorageInstance | null>,
      required: true
    }
  },
  methods: {
    handleNotesChanged(trackId: string, noteIds: string[]) {
      if (this.page !== 'editor') return
      this.tracks?.removeNoteCaches(trackId, noteIds)
      this.pianoRoll?.reDrawF0(trackId, noteIds)
      this.pianoRoll?.reDrawVolume(trackId, noteIds)
    },
    handleAllNotesChanged(trackId: string) {
      if (this.page !== 'editor') return
      this.tracks?.removeNoteCachesAll(trackId)
    },
    handleOpenFile() {
      if (this.page !== 'editor') return
      this.tracks?.openFileDialog()
    },
    handleNewVocalTrack() {
      if (this.page !== 'editor') return
      this.tracks?.addVoiceTrack()
    },
    handleSaveTrack() {
      if (this.page !== 'editor') return
      this.tracks?.saveVocalTrackAsWav()
    },
    handleSaveTrackAll() {
      if (this.page !== 'editor') return
      this.tracks?.saveVocalTrackAsWavAll()
    },
    handleUndo() {
      if (this.page !== 'editor') return
      this.tracks?.undo()
    },
    handleRedo() {
      if (this.page !== 'editor') return
      this.tracks?.redo()
    },
    handleSelect() {
      if (this.page !== 'editor') return
      this.pianoRoll?.selectNotesAll()
    },
    handleCopy() {
      if (this.page !== 'editor') return
      this.pianoRoll?.copyNotes()
    },
    handlePaste() {
      if (this.page !== 'editor') return
      this.pianoRoll?.pasteNotes()
    }
  },
  computed: {
    ...mapState(
      useStore,
      [
        'page',
        'tracksInfo'
      ]
    )
  },
  emits: {
    playOrPause: () => {
      return true
    }
  },
  mounted() {
    this.tracks = this.$refs.tracks as TracksInstance
    this.pianoRoll = this.$refs.pianoRoll as PianoRollInstance
    this.progressBar = this.$refs.progressBar as ProgressBarInstance

    document.body.addEventListener('keydown', (event) => {
      if (this.page !== 'editor') return
      if (document.activeElement !== document.body) return
      if (event.code !== 'Space') return

      event.preventDefault()
      this.tracks?.playOrPause()
    })
  },
  render() {
    return (
      <div
        id="editor"
        class={`
          h-[calc(100%-3.5rem)] flex flex-col gap-4
          ${(this.page === 'editor') ? 'block' : 'hidden'}
        `}
      >
        <Tracks
          ref="tracks"
          storage={ this.storage }
          onUpdateProgressTotal={(total) => {
            this.progressBar?.updateTotal(total)
          }}
          onUpdateProgressCurrentRelative={(relative) => {
            this.progressBar?.updateCurrentRelative(relative)
          }}
          onUpdatePlaybackHead={() => {
            this.pianoRoll?.movePlaybackHead(this.tracksInfo.playbackCurrentTime)
            this.pianoRoll?.scrollToPlaybackHead()
          }}
          onUpdateF0={(trackId, noteIds) => {
            this.pianoRoll?.reDrawF0(trackId, noteIds)
          }}
          onUpdateVolume={(trackId, noteIds) => {
            this.pianoRoll?.reDrawVolume(trackId, noteIds)
          }}
        ></Tracks>
        <Tools
          ref="tools"
          onNewVocalTrack={() => this.tracks?.addVoiceTrack()}
          onPlayOrPause={() => this.tracks?.playOrPause()}
          onNewBpm={(bpm) => this.tracks?.setBpm(bpm)}
        ></Tools>
        <PianoRoll
          ref="pianoRoll"
          storage={ this.storage }
          tracks={ this.tracks }
        ></PianoRoll>
        <ProgressBar
          ref="progressBar"
        ></ProgressBar>
      </div>
    )
  }
})

export default component
export type EditorInstance = InstanceType<typeof component>
