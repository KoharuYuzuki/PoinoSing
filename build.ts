import { $, argv } from 'bun'
import { join } from 'path'

const buildDir = './build'
const watchMode = argv.includes('--watch')
const minifyMode = argv.includes('--minify')

// clean
await $`rm -rf ${buildDir}`
await $`mkdir -p ${buildDir}`

// copy index.html
await $`cp -f ./src/index.html ${join(buildDir, 'index.html')}`

// copy assets
await $`mkdir -p ${join(buildDir, 'assets')}`
await $`cp -f ./assets/*.svg ${join(buildDir, 'assets')}`
await $`cp -f ./assets/*.png ${join(buildDir, 'assets')}`

await Promise.all([
  // build css
  $`bunx tailwindcss -i ./src/style.css -o ${join(buildDir, 'style.css')} ${watchMode ? '--watch' : ''}`,

  // build typescript
  $`bun build ./src/app.tsx ./src/worker.ts --outdir ${buildDir} ${watchMode ? '--watch' : ''} ${minifyMode ? '--minify' : ''}`
])
