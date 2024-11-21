import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    newTab: {
      type: Boolean,
      default: false
    },
    underline: {
      type: Boolean,
      default: true
    },
    href: {
      type: String,
      required: true
    }
  },
  render() {
    return (
      <a
        class={`${this.underline ? 'underline' : ''}`}
        target={ this.newTab ? '_blank' : undefined }
        rel={`
          ${this.newTab ? 'noopener' : ''}
          ${this.newTab ? 'noreferrer' : ''}
        `}
        href={ this.href }
      >
        { this.$slots.default ? this.$slots.default() : undefined }
      </a>
    )
  }
})
