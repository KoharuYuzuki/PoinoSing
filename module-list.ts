import { Glob, $ } from 'bun'

const glob = new Glob('./build/**.js')
const moduleNamePattern = new RegExp('^\/\/ node_modules\/((?:@.+?\/.+?)|(?:.+?))\/', 'gm')
const moduleNames: string[] = []

for await (const file of glob.scan('.')) {
  const grepResult = await $`cat ${file} | grep "// node_modules"`.text()
  const matched = [...grepResult.matchAll(moduleNamePattern)]
  moduleNames.push(...matched.filter((item) => item.length > 1).map((item) => item[1]))
}

const moduleNamesNoDuplicates = [...new Set(moduleNames)]
const moduleNamesSorted = moduleNamesNoDuplicates.sort()

for (const moduleName of moduleNamesSorted) {
  console.log(moduleName)
}
