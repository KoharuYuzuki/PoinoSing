import { PoinoSingEngine, schemata, utils } from './engine'
import { z } from 'zod'
import { drawWave as _drawWave, drawSpec as _drawSpec } from './utils'

const engine = new PoinoSingEngine()
let speakers: schemata.SpeakerVoices

export interface WorkerResult {
  id:   string | null
  type: 'success' | 'error'
  data: any
}

export interface SynthData {
  bpm:       schemata.BPM
  note:      schemata.Note
  speakerId: schemata.SpeakerIdEnum
}

export interface WaveDrawData {
  fs:        number
  dataArray: Float32Array[]
}

export interface SpecDrawData {
  fs:        number
  dataArray: Float32Array[]
}

export type Message = {
  id:   string
  type: 'engine:backend:check'
  data: null
} | {
  id:   string
  type: 'engine:init'
  data: null
} | {
  id:   string
  type: 'engine:synth'
  data: SynthData
} | {
  id:   string
  type: 'wave:draw'
  data: WaveDrawData
} | {
  id:   string
  type: 'spec:draw'
  data: SpecDrawData
}

const synthDataSchema = z.object({
  bpm:       schemata.bpmSchema,
  note:      schemata.noteSchema,
  speakerId: schemata.speakerIdEnumSchema
}) satisfies z.ZodType<SynthData>

const waveDrawDataSchema = z.object({
  fs:        z.number().min(1),
  dataArray: z.instanceof(Float32Array).array()
}) satisfies z.ZodType<WaveDrawData>

const specDrawDataSchema = z.object({
  fs:        z.number().min(1),
  dataArray: z.instanceof(Float32Array).array()
}) satisfies z.ZodType<SpecDrawData>

const messageSchema = z.union([
  z.object({
    id:   z.string(),
    type: z.literal('engine:backend:check'),
    data: z.null()
  }),
  z.object({
    id:   z.string(),
    type: z.literal('engine:init'),
    data: z.null()
  }),
  z.object({
    id:   z.string(),
    type: z.literal('engine:synth'),
    data: synthDataSchema
  }),
  z.object({
    id:   z.string(),
    type: z.literal('wave:draw'),
    data: waveDrawDataSchema
  }),
  z.object({
    id:   z.string(),
    type: z.literal('spec:draw'),
    data: specDrawDataSchema
  })
]) satisfies z.ZodType<Message>

function checkBackend (id: string) {
  try {
    const result = utils.canUseWebGPU
    postMessage(id, true, result)
  } catch (e) {
    console.error(e)
    postMessage(id, false, e)
  }
}

function init (id: string) {
  engine.init()
  .then(() => {
    speakers = PoinoSingEngine.getComputedSpeakers()
    postMessage(id, true, null)
  })
  .catch((e) => {
    console.error(e)
    postMessage(id, false, e)
  })
}

function synthNote (id: string, data: SynthData) {
  try {
    const result = engine.synthesizeNote(
      data.bpm,
      data.note,
      speakers[data.speakerId],
    )
    postMessage(id, true, result)
  } catch (e) {
    console.error(e)
    postMessage(id, false, e)
  }
}

function drawWave (id: string, data: WaveDrawData) {
  _drawWave(
    data.fs,
    data.dataArray
  )
  .then((url) => {
    postMessage(id, true, url)
  })
  .catch((e) => {
    console.error(e)
    postMessage(id, false, e)
  })
}

function drawSpec (id: string, data: SpecDrawData) {
  _drawSpec(
    data.fs,
    data.dataArray
  )
  .then((url) => {
    postMessage(id, true, url)
  })
  .catch((e) => {
    console.error(e)
    postMessage(id, false, e)
  })
}

function postMessage (id: string | null, success: boolean, data: any) {
  const result: WorkerResult = {
    id:   id,
    type: success ? 'success' : 'error',
    data: data
  }

  self.postMessage(result)
}

self.addEventListener('message', (event) => {
  const result = messageSchema.safeParse(event.data)

  if (!result.success) {
    postMessage(null, false, result.error)
    return
  }

  const message = event.data as Message

  switch (message.type) {
    case 'engine:backend:check':
      checkBackend(message.id)
      break
    case 'engine:init':
      init(message.id)
      break
    case 'engine:synth':
      synthNote(message.id, message.data)
      break
    case 'wave:draw':
      drawWave(message.id, message.data)
      break
    case 'spec:draw':
      drawSpec(message.id, message.data)
      break
  }
})

export default {}
