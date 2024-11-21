import { defineComponent, createApp } from 'vue'
import './vue-flag'
import { isFirefox, alert } from './utils'
import { createPinia, mapWritableState } from 'pinia'
import { useStore } from './components/storage'
import Storage from './components/storage'
import type { StorageInstance } from './components/storage'
import Menu from './components/menu'
import Projects from './components/projects'
import type { ProjectsInstance } from './components/projects'
import Editor from './components/editor'
import type { EditorInstance } from './components/editor'
import Settings from './components/settings'
import type { SettingsInstance } from './components/settings'
import Help from './components/help'
import type { HelpInstance } from './components/help'
import LicenseConfirmer from './components/license-confirmer'
import type { LicenseConfirmerInstance } from './components/license-confirmer'
import KeyboardShortcuts from './components/keyboard-shortcuts'
import Title from './components/title'
import BodySizeChecker from './components/body-size-checker'

const component = defineComponent({
  data(): {
    storage: StorageInstance | null
    projects: ProjectsInstance | null
    editor: EditorInstance | null
    settings: SettingsInstance | null
    help: HelpInstance | null
    licenseConfirmer: LicenseConfirmerInstance | null
  } {
    return {
      storage: null,
      projects: null,
      editor: null,
      settings: null,
      help: null,
      licenseConfirmer: null
    }
  },
  methods: {
    addFirefoxClass() {
      if (isFirefox()) {
        document.body.classList.add('is-firefox')
      }
    },
    startDialogEscapeBlocker() {
      window.addEventListener('keydown', (event) => {
        if (event.code !== 'Escape') return

        if (document.querySelectorAll('dialog[open]').length > 0) {
          event.preventDefault()
        }
      })
    },
    loadSettings() {
      return (
        this.storage?.loadSettings()
        .catch((e) => {
          console.error(e)

          alert([
            '設定の読み込みに失敗しました',
            'ページを再読み込みしてください',
            '繰り返し表示される場合は設定データが破損している可能性があります',
            String(e)
          ])
        })
      )
    }
  },
  computed: {
    ...mapWritableState(useStore, ['page'])
  },
  mounted() {
    this.addFirefoxClass()
    this.startDialogEscapeBlocker()

    this.storage = this.$refs.storage as StorageInstance
    this.projects = this.$refs.projects as ProjectsInstance
    this.editor = this.$refs.editor as EditorInstance
    this.settings = this.$refs.settings as SettingsInstance
    this.help = this.$refs.help as HelpInstance
    this.licenseConfirmer = this.$refs.licenseConfirmer as LicenseConfirmerInstance

    this.loadSettings()?.finally(() => {
      this.licenseConfirmer?.handleOpenLicenseConfirmer()
    })
  },
  render() {
    return (
      <>
        <Storage
          ref="storage"
          onNotesChanged={(trackId, noteIds) => {
            this.editor?.handleNotesChanged(trackId, noteIds)
          }}
          onAllNotesChanged={(trackId) => {
            this.editor?.handleAllNotesChanged(trackId)
          }}
        ></Storage>
        <Menu
          onNewProject={() => this.projects?.handleNewProject()}
          onImportProject={() => this.projects?.handleImportProject()}
          onOpenSettings={() => this.settings?.handleOpenSettings()}
          onOpenFile={() => this.editor?.handleOpenFile()}
          onSaveTrack={() => this.editor?.handleSaveTrack()}
          onSaveTrackAll={() => this.editor?.handleSaveTrackAll()}
          onUndo={() => this.editor?.handleUndo()}
          onRedo={() => this.editor?.handleRedo()}
          onOpenHelp={() => this.help?.handleOpenHelp()}
        ></Menu>
        <Projects ref="projects" storage={ this.storage }></Projects>
        <Editor ref="editor" storage={ this.storage }></Editor>
        <Settings ref="settings" storage={ this.storage }></Settings>
        <Help ref="help"></Help>
        <LicenseConfirmer ref="licenseConfirmer"></LicenseConfirmer>
        <KeyboardShortcuts
          onShortcut={(func) => {
            switch (func) {
              case 'new':
                if (this.page === 'projects') {
                  this.projects?.handleNewProject()
                } else {
                  this.editor?.handleNewVocalTrack()
                }
                break
              case 'settings':
                this.settings?.handleOpenSettings()
                break
              case 'help':
                this.help?.handleOpenHelp()
                break
              case 'undo':
                this.editor?.handleUndo()
                break
              case 'redo':
                this.editor?.handleRedo()
                break
              case 'select':
                this.editor?.handleSelect()
                break
              case 'copy':
                this.editor?.handleCopy()
                break
              case 'paste':
                this.editor?.handlePaste()
                break
              case 'projects':
                this.page = 'projects'
                break
              case 'save':
                this.editor?.handleSaveTrack()
                break
              case 'save:all':
                this.editor?.handleSaveTrackAll()
                break
              case 'file':
                this.editor?.handleOpenFile()
                break
            }
          }}
        ></KeyboardShortcuts>
        <Title></Title>
        <BodySizeChecker></BodySizeChecker>
      </>
    )
  }
})

const app = createApp(component)
const pinia = createPinia()
app.use(pinia)
app.mount('#app')
