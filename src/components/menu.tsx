import { defineComponent } from 'vue'
import { mapWritableState } from 'pinia'
import { useStore } from './storage'
import appInfo from '../info'

export default defineComponent({
  computed: {
    ...mapWritableState(useStore, ['page'])
  },
  emits: {
    newProject: () => {
      return true
    },
    importProject: () => {
      return true
    },
    openSettings: () => {
      return true
    },
    openFile: () => {
      return true
    },
    saveTrack: () => {
      return true
    },
    saveTrackAll: () => {
      return true
    },
    undo: () => {
      return true
    },
    redo: () => {
      return true
    },
    openHelp: () => {
      return true
    },
  },
  render() {
    return (
      <div
        id="menu"
        class="w-full h-10 rounded-[1.25rem] bg-theme flex justify-between items-center gap-4 shrink-0"
      >
        <div class="flex items-center gap-4">
          <div class="ml-1 flex items-center gap-0.5">
            <div class="w-10 h-10 bg-main [mask-image:url(./assets/icon.svg)]"></div>
            <p class="text-main">{ appInfo.appName }</p>
          </div>
          {
            (this.page === 'projects') ? (
              <>
                <button onClick={() => this.$emit('newProject')}>
                  <p class="text-main text-sm">新規プロジェクト</p>
                </button>
                <button onClick={() => this.$emit('importProject')}>
                  <p class="text-main text-sm">インポート</p>
                </button>
                <button onClick={() => this.$emit('openSettings')}>
                  <p class="text-main text-sm">設定</p>
                </button>
              </>
            ) : (
              <>
                <button onClick={() => this.page = 'projects'}>
                  <p class="text-main text-sm">プロジェクト一覧</p>
                </button>
                <button onClick={() => this.$emit('openFile')}>
                  <p class="text-main text-sm">ファイルを開く</p>
                </button>
              </>
            )
          }
          {
            (this.page === 'editor') ? (
              <>
                <button onClick={() => this.$emit('saveTrack')}>
                  <p class="text-main text-sm">書き出し</p>
                </button>
                <button onClick={() => this.$emit('saveTrackAll')}>
                  <p class="text-main text-sm">一括書き出し</p>
                </button>
                <button onClick={() => this.$emit('undo')}>
                  <p class="text-main text-sm">元に戻す</p>
                </button>
                <button onClick={() => this.$emit('redo')}>
                  <p class="text-main text-sm">やり直す</p>
                </button>
              </>
            ) : (
              <></>
            )
          }
          <button onClick={() => this.$emit('openHelp')}>
            <p class="text-main text-sm">ヘルプ</p>
          </button>
        </div>
        <div class="mr-4 flex items-center gap-4">
          <p class="text-main">{ appInfo.version }</p>
        </div>
      </div>
    )
  }
})
