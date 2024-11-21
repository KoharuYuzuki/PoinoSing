import { defineComponent } from 'vue'
import { mapState } from 'pinia'
import { useStore } from './storage'
import appInfo from '../info'

export default defineComponent({
  methods: {
    updateTitle() {
      if (!this.project) {
        document.title = `${appInfo.appName} | プロジェクト一覧`
      } else {
        const id = this.project.id
        const info = this.settings.projectsInfo.find((info) => info.id === id)
        const name = info ? info.name : '不明なプロジェクト'

        document.title = `${appInfo.appName} | ${name}`
      }
    }
  },
  computed: {
    ...mapState(
      useStore,
      [
        'project',
        'settings'
      ]
    )
  },
  watch: {
    project() {
      this.updateTitle()
    }
  },
  mounted() {
    this.updateTitle()
  },
  render() {
    return <></>
  }
})
