declare global {
  interface Window {
    __VUE_OPTIONS_API__:                     boolean
    __VUE_PROD_DEVTOOLS__:                   boolean
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: boolean
  }
}

window.__VUE_OPTIONS_API__                     = true
window.__VUE_PROD_DEVTOOLS__                   = false
window.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false
