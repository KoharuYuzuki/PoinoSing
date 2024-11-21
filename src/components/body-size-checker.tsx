import { defineComponent } from 'vue'
import appInfo from '../info'

export default defineComponent({
  data(): {
    minWidthPx: number
    minHeightPx: number
  } {
    return {
      minWidthPx: appInfo.minWidthPx,
      minHeightPx: appInfo.minHeightPx
    }
  },
  methods: {
    open() {
      const dialogElement = this.$refs.bodySizeChecker as HTMLDialogElement
      dialogElement.showModal()
    },
    close() {
      const dialogElement = this.$refs.bodySizeChecker as HTMLDialogElement
      dialogElement.close()
    },
    checkSize() {
      if (
        (document.body.clientWidth < this.minWidthPx) ||
        (document.body.clientHeight < this.minHeightPx)
      ) {
        this.open()
      } else {
        this.close()
      }
    }
  },
  mounted() {
    window.addEventListener('resize', () => {
      this.checkSize()
    })

    window.addEventListener('orientationchange', () => {
      this.checkSize()
    })

    this.checkSize()
  },
  render() {
    return (
      <dialog
        ref="bodySizeChecker"
        id="body-size-checker"
        class="w-dvw h-dvh max-w-[100dvw] max-h-dvh m-0 bg-main outline-none"
        // @ts-ignore
        onCancel={(event: Event) => event.preventDefault()}
      >
        <div class="w-full h-full flex flex-col justify-center items-center gap-2 [&_*]:text-accent">
          <p>表示領域が不足しています</p>
          <p>幅 { this.minWidthPx }px 以上かつ高さ { this.minHeightPx }px 以上の表示領域でご利用ください</p>
        </div>
      </dialog>
    )
  }
})
