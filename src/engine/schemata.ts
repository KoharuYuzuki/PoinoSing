import { z } from 'zod'

export type TypesEqual<A, B> = A extends B ? B extends A ? true : false : false

const checkEven = (value: number) => (value % 2) === 0
const evenMsg   = (value: number) => ({ message: `${value} is not an even number` })

export const kanas = [
  '、',
  'きゃ',
  'きゅ',
  'きぇ',
  'きょ',
  'ぎゃ',
  'ぎゅ',
  'ぎぇ',
  'ぎょ',
  'くゎ',
  'ぐゎ',
  'しゃ',
  'し',
  'しゅ',
  'しぇ',
  'しょ',
  'ちゃ',
  'ち',
  'ちゅ',
  'ちぇ',
  'ちょ',
  'つぁ',
  'つぃ',
  'つ',
  'つぇ',
  'つぉ',
  'てゃ',
  'てゅ',
  'てょ',
  'でゃ',
  'でゅ',
  'でょ',
  'にゃ',
  'にゅ',
  'にぇ',
  'にょ',
  'ひゃ',
  'ひゅ',
  'ひぇ',
  'ひょ',
  'びゃ',
  'びゅ',
  'びぇ',
  'びょ',
  'ぴゃ',
  'ぴゅ',
  'ぴぇ',
  'ぴょ',
  'みゃ',
  'みゅ',
  'みぇ',
  'みょ',
  'りゃ',
  'りゅ',
  'りぇ',
  'りょ',
  'っ',
  'いぇ',
  'か',
  'き',
  'く',
  'け',
  'こ',
  'さ',
  'すぃ',
  'す',
  'せ',
  'そ',
  'た',
  'てぃ',
  'とぅ',
  'て',
  'と',
  'な',
  'に',
  'ぬ',
  'ね',
  'の',
  'は',
  'ひ',
  'へ',
  'ほ',
  'ま',
  'み',
  'む',
  'め',
  'も',
  'や',
  'ゆ',
  'よ',
  'ら',
  'り',
  'る',
  'れ',
  'ろ',
  'わ',
  'うぃ',
  'うぇ',
  'うぉ',
  'ふぁ',
  'ふぃ',
  'ふ',
  'ふぇ',
  'ふぉ',
  'ゔぁ',
  'ゔぃ',
  'ゔ',
  'ゔぇ',
  'ゔぉ',
  'が',
  'ぎ',
  'ぐ',
  'げ',
  'ご',
  'ざ',
  'ずぃ',
  'ず',
  'ぜ',
  'ぞ',
  'じゃ',
  'じ',
  'じゅ',
  'じぇ',
  'じょ',
  'だ',
  'でぃ',
  'どぅ',
  'で',
  'ど',
  'ば',
  'び',
  'ぶ',
  'べ',
  'ぼ',
  'ぱ',
  'ぴ',
  'ぷ',
  'ぺ',
  'ぽ',
  'あ',
  'い',
  'う',
  'え',
  'お',
  'ん'
] as const

export const envKeys = [
  'a',
  'i',
  'u',
  'e',
  'o',
  'k',
  's',
  't',
  'n',
  'h',
  'm',
  'y',
  'r',
  'w',
  'g',
  'z',
  'd',
  'b',
  'p',
  'v',
  'q'
] as const

export const envKeyVolumes: Readonly<{
  [key in typeof envKeys[number]]: number
}> = {
  'a': 1.0,
  'i': 1.0,
  'u': 1.0,
  'e': 1.0,
  'o': 1.0,
  'k': 0.8,
  's': 0.8,
  't': 0.8,
  'n': 0.8,
  'h': 0.8,
  'm': 0.8,
  'y': 0.8,
  'r': 0.8,
  'w': 0.8,
  'g': 0.8,
  'z': 0.8,
  'd': 0.8,
  'b': 0.8,
  'p': 0.8,
  'v': 0.8,
  'q': 0.0
}

export const speakerIds = [
  'laychie',
  'layney'
] as const

export type KanaEnum      = typeof kanas[number]
export type EnvKeyEnum    = typeof envKeys[number]
export type SpeakerIdEnum = typeof speakerIds[number]

export const kanaEnumSchema      = z.enum(kanas)
export const envKeyEnumSchema    = z.enum(envKeys)
export const speakerIdEnumSchema = z.enum(speakerIds)

export const pointXSchema = z.number().min(0).max(48000)
export const pointYSchema = z.number().min(0).max(1)
export const pointSchema  = z.tuple([pointXSchema, pointYSchema])
export const pointsSchema = z.array(pointSchema)

export const envRecordSchema  = z.record(envKeyEnumSchema, pointsSchema)
export const envLenSchema     = z.object({ envKey: envKeyEnumSchema, len: z.number().min(0).nullable() })
export const kanaRecordSchema = z.record(kanaEnumSchema, z.array(envLenSchema))

export type BPM = number

export interface Note {
  lyric: KanaEnum | EnvKeyEnum
  pitch: number
  begin: number
  end: number
  f0Seg: number[]
  volumeSeg: number[]
  phonemeTimings: number[]
}

export interface SpeakerVoice {
  id:        SpeakerIdEnum
  name:      string
  fs:        48000
  segLen:    number
  shiftLen:  number
  shiftNum:  number
  envelopes: z.infer<typeof envRecordSchema>
  kanas:     z.infer<typeof kanaRecordSchema>
}

export type SpeakerVoices = {
  [key in SpeakerIdEnum]: SpeakerVoice
}

export const bpmSchema = z.number().min(1)

export const noteSchema = z.object({
  lyric:          z.enum([...kanas, ...envKeys]),
  pitch:          z.number().int().min(0).max(127),
  begin:          z.number().int().min(0),
  end:            z.number().int().min(0),
  f0Seg:          z.number().min(0.1).max(10).array(),
  volumeSeg:      z.number().min(0).max(1).array(),
  phonemeTimings: z.number().array()
})

export const speakerVoiceSchema = z.object({
  id:        speakerIdEnumSchema,
  name:      z.string(),
  fs:        z.literal(48000),
  segLen:    z.number().int().min(120).refine(checkEven, evenMsg),
  shiftLen:  z.number().int().min(1),
  shiftNum:  z.number().int().min(0),
  envelopes: envRecordSchema,
  kanas:     kanaRecordSchema
})

{ const _: TypesEqual<KanaEnum,      z.infer<typeof kanaEnumSchema>>      = true }
{ const _: TypesEqual<EnvKeyEnum,    z.infer<typeof envKeyEnumSchema>>    = true }
{ const _: TypesEqual<SpeakerIdEnum, z.infer<typeof speakerIdEnumSchema>> = true }
{ const _: TypesEqual<BPM,           z.infer<typeof bpmSchema>>           = true }
{ const _: TypesEqual<Note,          z.infer<typeof noteSchema>>          = true }
{ const _: TypesEqual<SpeakerVoice,  z.infer<typeof speakerVoiceSchema>>  = true }
