import { z } from 'zod'

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
  'k': 0.4,
  's': 0.4,
  't': 0.4,
  'n': 0.4,
  'h': 0.4,
  'm': 0.4,
  'y': 0.4,
  'r': 0.4,
  'w': 0.4,
  'g': 0.4,
  'z': 0.4,
  'd': 0.4,
  'b': 0.4,
  'p': 0.4,
  'v': 0.4,
  'q': 0.0
}

export const speakerIds = [
  'laychie',
  'layney'
] as const

export const phonemeMixPattern = new RegExp(`(?<phoneme>${envKeys.join('|')}):(?<value>\\d+\\.*\\d*)`)

export type KanaEnum      = typeof kanas[number]
export type EnvKeyEnum    = typeof envKeys[number]
export type SpeakerIdEnum = typeof speakerIds[number]

export const kanaEnumSchema      = z.enum(kanas) satisfies z.ZodType<KanaEnum>
export const envKeyEnumSchema    = z.enum(envKeys) satisfies z.ZodType<EnvKeyEnum>
export const speakerIdEnumSchema = z.enum(speakerIds) satisfies z.ZodType<SpeakerIdEnum>

export const pointXSchema = z.number().min(0).max(48000)
export const pointYSchema = z.number().min(0).max(1)
export const pointSchema  = z.tuple([pointXSchema, pointYSchema])
export const pointsSchema = z.array(pointSchema)
export const wavesSchema  = z.number().array().array()

export const envRecordSchema  = z.record(envKeyEnumSchema, pointsSchema)
export const waveRecordSchema = z.record(envKeyEnumSchema, wavesSchema)

export const envLenSchema     = z.object({ envKey: envKeyEnumSchema, len: z.number().min(0).nullable() })
export const kanaRecordSchema = z.record(kanaEnumSchema, z.array(envLenSchema))

export type BPM = number

export interface Note {
  lyric: KanaEnum | EnvKeyEnum | string
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

export interface SpeakerVoiceComputed {
  id:       SpeakerIdEnum
  name:     string
  fs:       48000
  segLen:   number
  waves:    z.infer<typeof waveRecordSchema>
  kanas:    z.infer<typeof kanaRecordSchema>
}

export type SpeakerVoices = {
  [key in SpeakerIdEnum]: SpeakerVoiceComputed
}

export const bpmSchema = z.number().min(1) satisfies z.ZodType<BPM>

export const phonemeMixSchema = z.string().refine((x: string) => {
  const split = x.replaceAll(' ', '').split(',')

  for (let i = 0; i < split.length; i++) {
    if (!phonemeMixPattern.test(split[i])) return false
  }

  return true
})

export const noteSchema = z.object({
  lyric:          z.enum([...kanas, ...envKeys]).or(phonemeMixSchema),
  pitch:          z.number().int().min(0).max(127),
  begin:          z.number().int().min(0),
  end:            z.number().int().min(0),
  f0Seg:          z.number().min(0.1).max(10).array(),
  volumeSeg:      z.number().min(0).max(1).array(),
  phonemeTimings: z.number().array()
}) satisfies z.ZodType<Note>

export const speakerVoiceSchema = z.object({
  id:        speakerIdEnumSchema,
  name:      z.string(),
  fs:        z.literal(48000),
  segLen:    z.number().int().min(120).refine(checkEven, evenMsg),
  shiftLen:  z.number().int().min(1),
  shiftNum:  z.number().int().min(0),
  envelopes: envRecordSchema,
  kanas:     kanaRecordSchema
}) satisfies z.ZodType<SpeakerVoice>

export const speakerVoiceComputedSchema = z.object({
  id:       speakerIdEnumSchema,
  name:     z.string(),
  fs:       z.literal(48000),
  segLen:   z.number().int().min(120).refine(checkEven, evenMsg),
  waves:    waveRecordSchema,
  kanas:    kanaRecordSchema
}) satisfies z.ZodType<SpeakerVoiceComputed>
