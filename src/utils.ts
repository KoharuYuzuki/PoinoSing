import { utils } from './engine'
import type { Note } from './components/storage'

export type TypesEqual<A, B> = A extends B ? B extends A ? true : false : false

export const isFirefox = () => CSS.supports('-moz-transform', 'none')

export const uuid = () => crypto.randomUUID()

export const now = () => Date.now()

export function downloadFile (fileName: string, url: string) {
  const a = document.createElement('a')
  a.download = fileName
  a.href = url
  a.click()
  a.remove()
}

export function openFileDialog (accept: string = '', multiple: boolean = false) {
  return new Promise<File | File[]>((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.multiple = multiple

    input.addEventListener('change', () => {
      if ((input.files === null) || (input.files.length <= 0)) {
        reject('file missing')
      } else {
        resolve(
          multiple ?
          Array.from(input.files) :
          input.files[0]
        )
      }
    }, { once: true })

    input.addEventListener('cancel', () => {
      reject('was canceled')
    }, { once: true })

    input.click()
    input.remove()
  })
}

export function readFile (file: File, mode: 'text' | 'arrayBuffer') {
  return new Promise<string | ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader()

    reader.addEventListener('load', () => {
      if (reader.result === null) {
        reject('reader result is null')
        return
      }

      resolve(reader.result)
    }, { once: true })

    reader.addEventListener('error', () => {
      reject(reader.error)
    }, { once: true })

    if (mode === 'text') {
      reader.readAsText(file)
    } else {
      reader.readAsArrayBuffer(file)
    }
  })
}

export function alert (message: string | string[]) {
  if (Array.isArray(message)) {
    const joined = message.join('\n')
    window.alert(joined)
  } else {
    window.alert(message)
  }
}

export function drawWave (fs: number, dataArray: Float32Array[]) {
  return new Promise<string>((resolve, reject) => {
    if (dataArray.length <= 0) {
      throw new Error('dataArray length is less than or equal to zero')
    }

    if (!dataArray.every((data) => data.length === dataArray[0].length)) {
      throw new Error('elements of dataArray are of different lengths')
    }

    const length = dataArray[0].length
    const merged = new Float32Array(length)

    for (let i = 0; i < dataArray.length; i++) {
      const data = dataArray[i]

      for (let j = 0; j < length; j++) {
        merged[j] += data[j] / dataArray.length
      }
    }

    const sampleSec = 0.1
    const sampleLength = Math.floor(fs * sampleSec)
    const volumes: { max: number, min: number }[] = []

    for (let i = 0; i < length; i += sampleLength) {
      const begin = i
      const end = begin + sampleLength
      const sliced = merged.slice(begin, end)

      if (sliced.length <= 0) continue

      const sorted = sliced.toSorted((a, b) => b - a)
      const max = sorted[0]
      const min = sorted.slice(-1)[0]

      volumes.push({ max, min })
    }

    const oneSideHeight = 64

    const width = volumes.length
    const height = oneSideHeight * 2

    const canvas = new OffscreenCanvas(width, height)
    const ctx = canvas.getContext('2d')

    if (ctx === null) {
      throw new Error('ctx is null')
    }

    ctx.fillStyle = 'black'

    for (let i = 0; i < volumes.length; i++) {
      const vol = volumes[i]

      const x = i
      const y = oneSideHeight - (vol.max * oneSideHeight)
      const w = 1
      const h = (vol.max * oneSideHeight) + (-vol.min * oneSideHeight)

      ctx.fillRect(x, y, w, h)
    }

    canvas.convertToBlob()
    .then((blob) => {
      const url = URL.createObjectURL(blob)
      resolve(url)
    })
    .catch(reject)
  })
}

export function drawSpec (fs: number, dataArray: Float32Array[]) {
  return new Promise<string>((resolve, reject) => {
    if (dataArray.length <= 0) {
      throw new Error('dataArray length is less than or equal to zero')
    }

    if (!dataArray.every((data) => data.length === dataArray[0].length)) {
      throw new Error('elements of dataArray are of different lengths')
    }

    const length = dataArray[0].length
    const merged = new Float32Array(length)

    for (let i = 0; i < dataArray.length; i++) {
      const data = dataArray[i]

      for (let j = 0; j < length; j++) {
        merged[j] += data[j] / dataArray.length
      }
    }

    import('@tensorflow/tfjs')
    .then((tf) => {
      const segLen = utils.int(fs * 0.1)
      const hopLen = utils.int(fs * 0.025)

      const waveSeq = tf.tensor(merged)
      const waveSegs = utils.seq2seg(waveSeq, segLen, hopLen)

      const waveSegsWindowed = tf.tidy(() => {
        const window = tf.signal.hammingWindow(segLen)
        const windowed = tf.mul(waveSegs, window)

        window.dispose()
        waveSeq.dispose()
        waveSegs.dispose()

        return windowed
      })

      const specSegs = tf.tidy(() => {
        const specs = tf.abs(tf.spectral.rfft(waveSegsWindowed))

        waveSegsWindowed.dispose()

        return specs
      })

      const numKey = 12 * 11
      const height = numKey * 6
      const step = numKey / height

      const freqsLog = [...new Array(height)].map((_, i) => utils.pitch2freq(step * i))
      const freqsLinear = utils.rfftfreq(segLen, 1.0 / fs)

      const width = specSegs.shape[0]
      const data = specSegs.arraySync() as number[][]

      specSegs.dispose()

      const interpolated = data.map((spec) => utils.interp(freqsLinear, spec, freqsLog))

      const canvas = new OffscreenCanvas(width, height)
      const ctx = canvas.getContext('2d')
      const maxValue = 300

      if (ctx === null) {
        throw new Error('ctx is null')
      }

      for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
          const value = interpolated[i][j]
          ctx.fillStyle = `rgba(0, 0, 0, ${value / maxValue})`

          const x = i
          const y = height - (j + 1)

          ctx.fillRect(x, y, 1, 1)
        }
      }

      return canvas.convertToBlob()
    })
    .then((blob) => {
      const url = URL.createObjectURL(blob)
      resolve(url)
    })
    .catch(reject)
  })
}

export function kata2hira (kata: string) {
  return kata.replace(
    new RegExp('[\u30A1-\u30FC]', 'gm'),
    (match) => {
      const code = match.charCodeAt(0) - 0x60
      return String.fromCharCode(code)
    }
  )
}

export function note2hash (note: Note) {
  const hash = [
    note.id,
    note.lyric,
    note.pitch,
    note.begin,
    note.end,
    note.f0Seg.reduce((sum, value) => sum + value, 0),
    note.volumeSeg.reduce((sum, value) => sum + value, 0),
    note.phonemeTimings.reduce((sum, value) => sum + value, 0)
  ].join(':')

  return hash
}
