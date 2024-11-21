import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import { mapWritableState } from 'pinia'
import { useStore } from './storage'
import type { KeyboardShortcutFunctions, StorageInstance } from './storage'
import { openFileDialog } from '../utils'

const component = defineComponent({
  methods: {
    handleOpenSettings() {
      if (this.page !== 'projects') return
      this.openSettings()
    },
    openSettings() {
      const dialogElement = this.$refs.settingsDialog as HTMLDialogElement
      dialogElement.showModal()
    },
    closeSettings() {
      const dialogElement = this.$refs.settingsDialog as HTMLDialogElement
      dialogElement.close()
    },
    openOverwriteWarner() {
      const dialogElement = this.$refs.overwriteWarnDialog as HTMLDialogElement
      dialogElement.showModal()
    },
    closeOverwriteWarner() {
      const dialogElement = this.$refs.overwriteWarnDialog as HTMLDialogElement
      dialogElement.close()
    }
  },
  props: {
    storage: {
      type: [Object, null] as PropType<StorageInstance | null>,
      required: true
    }
  },
  computed: {
    ...mapWritableState(
      useStore,
      [
        'page',
        'settings'
      ]
    )
  },
  render() {
    return (
      <dialog
        ref="settingsDialog"
        id="settings"
        class="w-[700px] h-[500px] p-2 bg-theme rounded-[1.25rem] drop-shadow-xl transform-gpu [&_*]:text-accent"
        // @ts-ignore
        onCancel={(event: Event) => event.preventDefault()}
      >
        <div class="h-full px-2 py-4 bg-main rounded-[0.75rem] flex flex-col gap-8">
          <p class="text-xl text-center">設定</p>
          <div class="px-2 flex flex-col gap-4 grow overflow-y-scroll scrollbar-dark">
            <div class="h-fit flex flex-col p-4 bg-main-light rounded-xl gap-4">
              <p class="text-center">キーボードショートカット</p>
              {
                 Object.keys(this.settings.keyboardShortcuts).map((_key) => {
                  const key = _key as KeyboardShortcutFunctions
                  const shortcut = this.settings.keyboardShortcuts[key]

                  return (
                    <div
                      key={ `keyboard-shortcut-${key}` }
                      class="h-fit flex justify-between items-center"
                    >
                      <p class="text-sm">{ shortcut.desc }</p>
                      <div class="h-fit flex items-center gap-1">
                        <div class="w-fit h-fit px-3 py-2 bg-theme rounded-xl">
                          <p class="!text-main text-sm">Ctrl or Cmd</p>
                        </div>
                        <p>+</p>
                        <button
                          class={`
                            w-fit h-fit px-3 py-2 rounded-xl
                            ${shortcut.alt ? 'bg-theme' : 'bg-main'}
                          `}
                          onClick={() => shortcut.alt = !shortcut.alt}
                        >
                          <p class={`text-sm ${shortcut.alt ? '!text-main' : ''}`}>
                            Alt
                          </p>
                        </button>
                        <p>+</p>
                        <button
                          class={`
                            w-fit h-fit px-3 py-2 rounded-xl
                            ${shortcut.shift ? 'bg-theme' : 'bg-main'}
                          `}
                          onClick={() => shortcut.shift = !shortcut.shift}
                        >
                          <p class={`text-sm ${shortcut.shift ? '!text-main' : ''}`}>
                            Shift
                          </p>
                        </button>
                        <p>+</p>
                        <input
                          class="w-20 h-fit py-2 bg-theme rounded-xl text-sm text-center !text-main"
                          value={ shortcut.code }
                          onKeydown={(event) => {
                            event.preventDefault()
                            shortcut.code = event.code
                          }}
                          onInput={(event) => {
                            if (event.target === null) return
                            const target = event.target as HTMLInputElement
                            target.value = shortcut.code
                          }}
                        ></input>
                      </div>
                    </div>
                  )
                })
              }
            </div>
            <div class="h-fit flex p-4 bg-main-light rounded-xl justify-between items-center">
              <p>設定データ</p>
              <div class="w-fit h-fit flex gap-4">
                <button
                  class="w-32 h-fit py-2 bg-theme rounded-lg"
                  onClick={() => this.storage?.exportSettings()}
                >
                  <p class="!text-main">エクスポート</p>
                </button>
                <button
                  class="w-32 h-fit py-2 bg-theme rounded-lg"
                  onClick={() => this.openOverwriteWarner()}
                >
                  <p class="!text-main">インポート</p>
                </button>
              </div>
            </div>
          </div>
          <div class="flex justify-center items-center gap-4">
            <button
              class="w-32 py-2 bg-theme rounded-lg"
              onClick={() => this.closeSettings()}
              autofocus
            >
              <p class="!text-main">閉じる</p>
            </button>
          </div>
        </div>
        <dialog
          ref="overwriteWarnDialog"
          class="w-[500px] h-fit p-2 bg-theme rounded-[1.25rem] drop-shadow-xl transform-gpu"
          // @ts-ignore
          onCancel={(event: Event) => event.preventDefault()}
        >
          <div class="h-fit p-4 bg-main rounded-[0.75rem] flex flex-col gap-8">
            <p class="text-lg text-center !text-red-400">!!! 警告 !!!</p>
            <div class="flex flex-col gap-2">
              <p class="text-center">インポートされたデータで既存の設定データを上書きします</p>
              <p class="text-center">エクスポートされていない設定データは消失します</p>
              <p class="text-center">この操作は取り消しできません</p>
              <p class="text-center">本当によろしいですか?</p>
            </div>
            <div class="flex justify-center items-center gap-4">
              <button
                class="w-32 py-2 bg-theme rounded-lg"
                onClick={() => {
                  openFileDialog('.json')
                  .then((file) => this.storage?.importSettings(file as File))
                  .finally(() => this.closeOverwriteWarner())
                }}
              >
                <p class="!text-main">OK</p>
              </button>
              <button
                class="w-32 py-2 bg-main-light rounded-lg"
                onClick={() => this.closeOverwriteWarner()}
                autofocus
              >
                <p>キャンセル</p>
              </button>
            </div>
          </div>
        </dialog>
      </dialog>
    )
  }
})

export default component
export type SettingsInstance = InstanceType<typeof component>
