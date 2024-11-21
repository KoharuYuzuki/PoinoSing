import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import { mapState, mapWritableState } from 'pinia'
import { useStore } from './storage'
import type { StorageInstance } from './storage'
import { alert, openFileDialog } from '../utils'

const component =  defineComponent({
  data(): {
    menuProjectId: string | null
    renamingProjectId: string | null
    removingProjectId: string | null
    adderDisplayed: boolean
  } {
    return {
      menuProjectId: null,
      renamingProjectId: null,
      removingProjectId: null,
      adderDisplayed: false
    }
  },
  props: {
    storage: {
      type: [Object, null] as PropType<StorageInstance | null>,
      required: true
    }
  },
  methods: {
    handleNewProject() {
      if (this.page !== 'projects') return
      this.menuProjectId = null
      this.adderDisplayed = true
    },
    handleImportProject() {
      if (this.page !== 'projects') return

      openFileDialog('.json')
      .then((file) => this.storage?.importProject(file as File))
      .catch(console.error)
    },
    getProjectName(projectId: string | null) {
      const unknown = '不明なプロジェクト'

      if (projectId === null) {
        return unknown
      }

      const found = this.settings.projectsInfo.find((info) => info.id === projectId)

      if (found === undefined) {
        return unknown
      } else {
        return found.name
      }
    },
    openProjectNamer() {
      const dialogElement = this.$refs.projectNamerDialog as HTMLDialogElement
      dialogElement.showModal()
    },
    closeProjectNamer() {
      const dialogElement = this.$refs.projectNamerDialog as HTMLDialogElement
      dialogElement.close()
    },
    openProjectRemover() {
      const dialogElement = this.$refs.projectRemoverDialog as HTMLDialogElement
      dialogElement.showModal()
    },
    closeProjectRemover() {
      const dialogElement = this.$refs.projectRemoverDialog as HTMLDialogElement
      dialogElement.close()
    }
  },
  computed: {
    ...mapState(useStore, ['settings']),
    ...mapWritableState(useStore, ['page'])
  },
  watch: {
    page() {
      if (this.page === 'projects') {
        this.storage?.unloadProject()
      }
    },
    renamingProjectId() {
      if (this.renamingProjectId === null) {
        this.closeProjectNamer()
      } else {
        this.openProjectNamer()
      }
    },
    removingProjectId() {
      if (this.removingProjectId === null) {
        this.closeProjectRemover()
      } else {
        this.openProjectRemover()
      }
    },
    adderDisplayed() {
      if (this.adderDisplayed) {
        this.openProjectNamer()
      } else {
        this.closeProjectNamer()
      }
    }
  },
  render() {
    return (
      <div
        id="projects"
        class={`
          h-full p-2 bg-theme rounded-[1.25rem]
          ${(this.page === 'projects') ? 'block' : 'hidden'}
        `}
      >
        <div class="h-full px-2 py-8 bg-main rounded-[0.75rem]">
          <div class="h-full overflow-y-scroll scrollbar-dark">
            <div class="h-fit min-h-full flex flex-col grow gap-8">
              <p class="text-xl text-accent mx-8">プロジェクト一覧</p>
              {
                (this.settings.projectsInfo.length <= 0) ?
                (
                  <div class="flex flex-col justify-center items-center grow gap-4">
                    <p class="text-accent">
                      まだプロジェクトがありません
                      </p>
                    <p class="text-accent">
                      メニューの "新規プロジェクト" から作成できます
                      </p>
                  </div>
                ) : (
                  <></>
                )
              }
              {
                this.settings.projectsInfo
                .toSorted((a, b) => b.date - a.date)
                .map((info) => (
                  <div
                    key={ `project-${info.id}` }
                    class="h-24 relative bg-main-light mx-6 rounded-xl flex flex-col justify-center gap-2"
                  >
                    <div class="mx-4 flex justify-between items-center">
                      <div class="w-4/5 h-fit">
                        <p class="text-xl text-accent w-full truncate">
                          { info.name }
                        </p>
                      </div>
                      <button
                        class="w-20 h-fit py-1 bg-theme rounded-lg"
                        onClick={() => {
                          this.menuProjectId = null

                          this.storage?.loadProject(info.id)
                          .then(() => this.page = 'editor')
                          .catch((e) => {
                            console.error(e)

                            alert([
                              'プロジェクトの読み込みに失敗しました',
                              '繰り返し表示される場合はページを再読み込みしてください',
                              String(e)
                            ])
                          })
                        }}
                      >
                        <p class="text-main">
                          開く
                        </p>
                      </button>
                    </div>
                    <div class="mx-4 flex justify-between items-center">
                      <div class="w-4/5 h-fit">
                        <p class="text-accent w-full truncate tracking-wider">
                          { new Date(info.date).toLocaleString() }
                        </p>
                      </div>
                      <button
                        class="w-20 h-6 flex justify-center items-center gap-[4px]"
                        onClick={() => {
                          if (this.menuProjectId === info.id) {
                            this.menuProjectId = null
                          } else {
                            this.menuProjectId = info.id
                          }
                        }}
                      >
                        <div class="w-1 h-1 bg-accent rounded-[2px]"></div>
                        <div class="w-1 h-1 bg-accent rounded-[2px]"></div>
                        <div class="w-1 h-1 bg-accent rounded-[2px]"></div>
                      </button>
                    </div>
                    <div class={`
                      w-fit h-fit absolute m-auto top-[5rem] right-0 p-4 rounded-xl
                      bg-main-mid flex-col gap-4 z-10 drop-shadow-xl transform-gpu
                      ${(this.menuProjectId === info.id) ? 'flex' : 'hidden'}
                    `}>
                      <button
                        class="w-32 h-fit py-1 bg-main-light rounded-lg"
                        onClick={() => this.storage?.exportProject(info.id)}
                      >
                        <p class="text-accent">
                          エクスポート
                        </p>
                      </button>
                      <button
                        class="w-32 h-fit py-1 bg-main-light rounded-lg"
                        onClick={() => {
                          const inputElement = this.$refs.projectNameInput as HTMLInputElement
                          inputElement.value = info.name
                          this.renamingProjectId = info.id
                          this.menuProjectId = null
                        }}
                      >
                        <p class="text-accent">
                          名称変更
                        </p>
                      </button>
                      <button
                        class="w-32 h-fit py-1 bg-main-light rounded-lg"
                        onClick={() => {
                          this.removingProjectId = info.id
                          this.menuProjectId = null
                        }}
                      >
                        <p class="text-accent">
                          削除
                        </p>
                      </button>
                    </div>
                  </div>
                ))
              }
              {
                (this.settings.projectsInfo.length > 0) ?
                (
                  <div class="h-24"></div>
                ) : (
                  <></>
                )
              }
            </div>
          </div>
        </div>
        <dialog
          ref="projectNamerDialog"
          class="w-[500px] h-fit p-2 bg-theme rounded-[1.25rem] drop-shadow-xl transform-gpu"
          // @ts-ignore
          onCancel={(event: Event) => event.preventDefault()}
        >
          <div class="h-fit p-4 bg-main rounded-[0.75rem] flex flex-col gap-8">
            <p class="text-lg text-accent text-center">
              { this.adderDisplayed ? '新規プロジェクト' : 'プロジェクト名称変更' }
            </p>
            <div class="flex items-center gap-4">
              <p class="text-accent">
                名称
              </p>
              <input
                ref="projectNameInput"
                class="h-10 px-2 bg-main-light rounded-lg grow text-accent"
                type="text"
                placeholder="名称未設定"
                autofocus
              ></input>
            </div>
            <div class="flex justify-center items-center gap-4">
              <button
                class="w-32 py-2 bg-main-light rounded-lg"
                onClick={() => {
                  const inputElement = this.$refs.projectNameInput as HTMLInputElement
                  const projectName = (inputElement.value === '') ? '名称未設定' : inputElement.value
                  inputElement.value = ''

                  if (this.adderDisplayed) {
                    this.storage?.newProject(projectName)
                    this.adderDisplayed = false
                    this.page = 'editor'
                  } else {
                    if (this.renamingProjectId !== null) {
                      this.storage?.renameProject(this.renamingProjectId, projectName)
                    }
                    this.renamingProjectId = null
                  }
                }}
              >
                <p class="text-accent">
                  { this.adderDisplayed ? '作成' : '変更' }
                </p>
              </button>
              <button
                class="w-32 py-2 bg-main-light rounded-lg"
                onClick={() => {
                  const inputElement = this.$refs.projectNameInput as HTMLInputElement
                  inputElement.value = ''

                  if (this.adderDisplayed) {
                    this.adderDisplayed = false
                  } else {
                    this.renamingProjectId = null
                  }
                }}
              >
                <p class="text-accent">
                  キャンセル
                </p>
              </button>
            </div>
          </div>
        </dialog>
        <dialog
          ref="projectRemoverDialog"
          class="w-[500px] h-fit p-2 bg-theme rounded-[1.25rem] drop-shadow-xl transform-gpu"
          // @ts-ignore
          onCancel={(event: Event) => event.preventDefault()}
        >
          <div class="h-fit p-4 bg-main rounded-[0.75rem] flex flex-col gap-8">
            <p class="text-lg text-accent text-center">
              プロジェクト削除
            </p>
            <div class="flex flex-col gap-2">
              <div class="flex justify-center items-center">
                <p class="text-accent shrink-0">"</p>
                <p class="text-accent truncate">{ this.getProjectName(this.removingProjectId) }</p>
                <p class="text-accent shrink-0">" を削除します</p>
              </div>
              <p class="text-accent text-center">この操作は取り消しできません</p>
              <p class="text-accent text-center">本当によろしいですか?</p>
            </div>
            <div class="flex justify-center items-center gap-4">
              <button
                class="w-32 py-2 bg-main-light rounded-lg"
                onClick={() => {
                  if (this.removingProjectId !== null) {
                    this.storage?.removeProject(this.removingProjectId)
                    .catch((e) => {
                      console.error(e)

                      alert([
                        'プロジェクトの削除に失敗しました',
                        '繰り返し表示される場合はページを再読み込みしてください',
                        String(e)
                      ])
                    })
                  }

                  this.removingProjectId = null
                }}
              >
                <p class="text-accent">
                  削除
                </p>
              </button>
              <button
                class="w-32 py-2 bg-main-light rounded-lg"
                onClick={() => {
                  this.removingProjectId = null
                }}
                autofocus
              >
                <p class="text-accent">
                  キャンセル
                </p>
              </button>
            </div>
          </div>
        </dialog>
      </div>
    )
  }
})

export default component
export type ProjectsInstance = InstanceType<typeof component>
