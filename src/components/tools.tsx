import { defineComponent } from 'vue'
import { mapWritableState } from 'pinia'
import { useStore, snap4, snap8, snap16, snap32, snap64 } from './storage'

export default defineComponent({
  methods: {
    reset() {
      const store = useStore()
      store.resetToolMode()
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
        'toolMode'
      ]
    )
  },
  emits: {
    newVocalTrack: () => {
      return true
    },
    playOrPause: () => {
      return true
    },
    newBpm: (bpm: number) => {
      return true
    }
  },
  watch: {
    page() {
      if (this.page === 'projects') {
        this.reset()
      }
    }
  },
  render() {
    return (
      <div
        id="tools"
        class="w-full h-10 rounded-[1.25rem] bg-theme flex justify-between items-center gap-4 shrink-0"
        onClick={(event) => {
          if (!event.target) return

          const target = event.target as HTMLElement
          const button = target.closest('button')

          if (button) {
            button.blur()
          }
        }}
      >
        <div class="ml-4 flex items-center gap-2">
          <button
            title="ボーカルトラックを追加"
            onClick={() => this.$emit('newVocalTrack')}
          >
            <div class="w-6 h-6 bg-main [mask-image:url('./assets/add.svg')]"></div>
          </button>
          <button
            title="再生/一時停止"
            onClick={() => this.$emit('playOrPause')}
          >
            <div class={`
              w-6 h-6 bg-main
              ${
                this.tracksInfo.playing ?
                '[mask-image:url("./assets/pause.svg")]' :
                '[mask-image:url("./assets/play.svg")]'
              }
            `}></div>
          </button>
          <button
            title="選択ツール"
            onClick={() => this.toolMode = 'selector'}
          >
            <div class={`
              w-6 h-6 [mask-image:url('./assets/cursor.svg')]
              ${(this.toolMode === 'selector') ? 'bg-accent' : 'bg-main'}
            `}></div>
          </button>
          <button
            title="ペンツール"
            onClick={() => this.toolMode = 'pen'}
          >
            <div class={`
              w-6 h-6 [mask-image:url('./assets/pen.svg')]
              ${(this.toolMode === 'pen') ? 'bg-accent' : 'bg-main'}
            `}></div>
          </button>
          <button
            title="ビブラートツール"
            onClick={() => this.toolMode = 'vibrato'}
          >
            <div class={`
              w-6 h-6 [mask-image:url('./assets/vibrato.svg')]
              ${(this.toolMode === 'vibrato') ? 'bg-accent' : 'bg-main'}
            `}></div>
          </button>
          <button
            title="フェードインツール"
            onClick={() => this.toolMode = 'fade-in'}
          >
            <div class={`
              w-6 h-6 [mask-image:url('./assets/fade-in.svg')]
              ${(this.toolMode === 'fade-in') ? 'bg-accent' : 'bg-main'}
            `}></div>
          </button>
          <button
            title="フェードアウトツール"
            onClick={() => this.toolMode = 'fade-out'}
          >
            <div class={`
              w-6 h-6 [mask-image:url('./assets/fade-out.svg')]
              ${(this.toolMode === 'fade-out') ? 'bg-accent' : 'bg-main'}
            `}></div>
          </button>
        </div>
        <div class="mr-4 flex items-center gap-4">
          <div class="flex gap-1">
            <p class="text-sm text-main">
              BPM :
            </p>
            <input
              ref="bpmInputter"
              class="w-8 text-sm text-main text-center bg-transparent"
              type="number"
              value={ this.project?.bpm }
              onChange={(event) => {
                if (event.target === null) return

                const target = event.target as HTMLSelectElement
                const value = Math.round(Number(target.value) * 10) / 10

                if (Number.isFinite(value)) {
                  this.$emit('newBpm', value)
                }
              }}
            ></input>
          </div>
          <div class="flex gap-1">
            <p class="text-sm text-main">
              スナップ :
            </p>
            <select
              ref="snappingSelector"
              class="w-14 text-sm text-main bg-transparent"
              value={ this.settings.snap.note }
              onChange={(event) => {
                if (event.target === null) return

                const target = event.target as HTMLSelectElement
                const value = target.value

                switch (value) {
                  case '4':
                    this.settings.snap = structuredClone(snap4)
                    break
                  case '8':
                    this.settings.snap = structuredClone(snap8)
                    break
                  case '16':
                    this.settings.snap = structuredClone(snap16)
                    break
                  case '32':
                    this.settings.snap = structuredClone(snap32)
                    break
                  case '64':
                    this.settings.snap = structuredClone(snap64)
                    break
                  default:
                    this.settings.snap = structuredClone(snap16)
                    break
                }
              }}
            >
              <option value="4">4分音符</option>
              <option value="8">8分音符</option>
              <option value="16">16分音符</option>
              <option value="32">32分音符</option>
              <option value="64">64分音符</option>
            </select>
          </div>
          <button
            class="text-sm text-main flex"
            onClick={() => this.tracksInfo.folded = !this.tracksInfo.folded}
          >
            トラックリスト :
            <span class="w-9 text-center block">
              { this.tracksInfo.folded ? 'OFF' : 'ON' }
            </span>
          </button>
        </div>
      </div>
    )
  }
})
