import { defineComponent } from 'vue'

const component = defineComponent({
  data(): {
    current: number
    total: number
  } {
    return {
      current: 0,
      total: 0
    }
  },
  methods: {
    reset() {
      this.current = 0
      this.total = 0
    },
    updateTotal(total: number) {
      this.reset()
      this.total = total
    },
    updateCurrentRelative(relative: number) {
      this.current += relative

      if (this.current >= this.total) {
        this.reset()
      }
    }
  },
  render() {
    return (
      <div
        id="progress-bar"
        class="
          w-full h-[6px] rounded-[3px] bg-main-mid flex justify-start items-center overflow-hidden shrink-0
        "
      >
        <div
          class="h-full bg-theme"
          style={{
            width: `${(this.total === 0) ? 0 : (this.current / this.total * 100)}%`
          }}
        ></div>
      </div>
    )
  }
})

export default component
export type ProgressBarInstance = InstanceType<typeof component>
