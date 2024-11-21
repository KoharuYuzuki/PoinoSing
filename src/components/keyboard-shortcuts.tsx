import { defineComponent } from 'vue'
import { mapState } from 'pinia'
import { useStore, keyboardShortcutFunctions } from './storage'
import type { KeyboardShortcutFunctions } from './storage'

export default defineComponent({
  computed: {
    ...mapState(useStore, ['settings'])
  },
  emits: {
    shortcut(func: KeyboardShortcutFunctions) {
      return true
    }
  },
  mounted() {
    window.addEventListener('keydown', (event) => {
      const keyboardShortcuts = this.settings.keyboardShortcuts
      const filtered = keyboardShortcutFunctions.filter((func) => {
        return (keyboardShortcuts[func].code === event.code)
      })

      filtered.forEach((func) => {
        const shortcut = keyboardShortcuts[func]

        const ctrlOrMeta = event.ctrlKey || event.metaKey
        const alt        = event.altKey
        const shift      = event.shiftKey

        if (
          (ctrlOrMeta === false) ||
          (alt !== shortcut.alt) ||
          (shift !== shortcut.shift)
        ) return

        if (['select', 'copy', 'paste'].includes(func)) {
          if (document.activeElement !== document.body) return
        }

        event.preventDefault()

        if (document.querySelectorAll('dialog[open]').length <= 0) {
          console.log(`shortcut:${func}`)
          this.$emit('shortcut', func)
        }
      })
    })
  },
  render() {
    return <></>
  }
})
