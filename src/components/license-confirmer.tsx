import { defineComponent } from 'vue'
import { mapWritableState } from 'pinia'
import { useStore } from './storage'
import Link from './link'
import appInfo from '../info'

const component = defineComponent({
  methods: {
    handleOpenLicenseConfirmer() {
      if (this.settings.licenseAgreed) return
      this.open()
    },
    open() {
      const dialogElement = this.$refs.licenseConfirmerDialog as HTMLDialogElement
      dialogElement.showModal()
    },
    close() {
      const dialogElement = this.$refs.licenseConfirmerDialog as HTMLDialogElement
      dialogElement.close()
    },
    agree() {
      this.settings.licenseAgreed = true
    }
  },
  computed: {
    ...mapWritableState(
      useStore,
      [
        'settings'
      ]
    )
  },
  render() {
    return (
      <dialog
        ref="licenseConfirmerDialog"
        id="license-confirmer"
        class="w-[700px] h-[500px] p-2 bg-theme rounded-[1.25rem] drop-shadow-xl transform-gpu"
        // @ts-ignore
        onCancel={(event: Event) => event.preventDefault()}
      >
        <div class="h-full px-2 py-4 bg-main rounded-[0.75rem] flex flex-col gap-4">
          <p class="text-xl text-center text-accent">ライセンス</p>
          <div class="px-4 overflow-y-scroll grow scrollbar-dark">
            <div class="h-fit min-h-full flex flex-col gap-8 [&_*]:text-accent">
              <div class="flex flex-col gap-1">
                <p class="text-center">{ appInfo.appName } { appInfo.version } にアクセスいただきありがとうございます。</p>
                <p class="text-center">{ appInfo.appName } { appInfo.version } を利用するにはライセンス (利用規約) に同意する必要があります。</p>
                <p class="text-center">
                  また、不明な点については
                  <Link
                    newTab={ true }
                    href={ appInfo.licenseQAUrl }
                  >
                    {() => 'ライセンスQ&A'}
                  </Link>
                  や
                  <Link
                    newTab={ true }
                    href={ appInfo.qaUrl }
                  >
                    {() => 'PoinoSing Q&A'}
                  </Link>
                  をご参照ください。
                </p>
              </div>
              <div class="flex flex-col gap-1">
                {
                  appInfo.license.split('\n').map((line, index) => (
                    <p
                      key={ `license-confirmer-line-${index}` }
                      class="text-sm"
                    >
                      { line }
                    </p>
                  ))
                }
              </div>
            </div>
          </div>
          <div class="flex justify-center items-center gap-4">
            <button
              class="w-32 py-2 bg-theme rounded-lg"
              onClick={() => {
                this.agree()
                this.close()
              }}
              autofocus
            >
              <p class="text-light">同意する</p>
            </button>
          </div>
        </div>
      </dialog>
    )
  }
})

export default component
export type LicenseConfirmerInstance = InstanceType<typeof component>
