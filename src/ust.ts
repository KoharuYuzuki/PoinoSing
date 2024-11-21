export interface USTNote {
  lyric: string
  pitch: number
  begin: number
  end: number
}

function readFile (file: File) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader()

    reader.addEventListener('load', () => {
      if (reader.result === null) {
        reject('reader result is null')
        return
      }

      resolve(reader.result as ArrayBuffer)
    }, { once: true })

    reader.addEventListener('error', () => {
      reject(reader.error)
    }, { once: true })

    reader.readAsArrayBuffer(file)
  })
}

export function parseUST (
  file: File,
  encoding: 'shift-jis' | 'utf-8' = 'shift-jis',
  checkReplaced: boolean = true
) {
  return new Promise<{
    bpm: number
    ustNotes: USTNote[]
  }>((resolve, reject) => {
    readFile(file)
    .then((arrayBuffer) => {
      const decoder = new TextDecoder(encoding)
      const decoded = decoder.decode(arrayBuffer)

      const notes = decoded.split(new RegExp('\[#[0-9]+\]'))

      if (notes.length <= 1) {
        throw new Error('UST: no note information found')
      }

      const regexpBpm    = new RegExp('^Tempo=([0-9]+\.*[0-9]*)', 'g')
      const regexpLyric  = new RegExp('^Lyric=(.+)', 'g')
      const regexpPitch  = new RegExp('^NoteNum=([0-9]+)', 'g')
      const regexpLength = new RegExp('^Length=([0-9]+)', 'g')

      const entries = notes[0].split(new RegExp('(\r\n|\n|\r)'))
      let bpm = -1

      for (const entry of entries) {
        const found = [...entry.matchAll(regexpBpm)]

        if (found.length > 0) {
          bpm = Number(found[0][1])
          break
        }
      }

      if (bpm === -1) {
        throw new Error('UST: tempo information not found')
      }

      const ustNotes: USTNote[] = []
      let prevEnd = 0

      for (const [i, note] of notes.slice(1).entries()) {
        const entries = note.split(new RegExp('(\r\n|\n|\r)'))

        let lyric: string | null = null
        let pitch: number | null = null
        let length: number | null = null

        for (const entry of entries) {
          if (![lyric, pitch, length].includes(null)) break

          if (lyric === null) {
            const found = [...entry.matchAll(regexpLyric)]

            if (found.length > 0) {
              lyric = found[0][1]
            }
          }

          if (pitch === null) {
            const found = [...entry.matchAll(regexpPitch)]

            if (found.length > 0) {
              pitch = Number(found[0][1])
            }
          }

          if (length === null) {
            const found = [...entry.matchAll(regexpLength)]

            if (found.length > 0) {
              length = Number(found[0][1])
            }
          }
        }

        if ([lyric, pitch, length].includes(null)) {
          throw new Error(`UST: missing information in ${i + 1}th note`)
        }

        const rests = ['R']

        if (!rests.includes(lyric as string)) {
          ustNotes.push({
            lyric: lyric as string,
            pitch: pitch as number,
            begin: prevEnd,
            end : prevEnd + (length as number),
          })
        }

        prevEnd += length as number
      }

      if (checkReplaced) {
        const replacementChar = '\uFFFD'
        const replacedLength =
          ustNotes.filter((note) => note.lyric.includes(replacementChar)).length

        if (replacedLength > 0) {
          console.log('UST: one or more replacement characters found')
          console.log('UST: reparse with utf-8')

          return parseUST(file, 'utf-8', false)
        }
      }

      return {
        bpm,
        ustNotes
      }
    })
    .then(resolve)
    .catch(reject)
  })
}
