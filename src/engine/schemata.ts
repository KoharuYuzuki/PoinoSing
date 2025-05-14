import { z } from 'zod'

const checkEven = (value: number) => (value % 2) === 0
const evenMsg   = (value: number) => ({ message: `${value} is not an even number` })

export const kanas = [
  'あ',
  'い',
  'う',
  'え',
  'お',
  'か',
  'き',
  'く',
  'け',
  'こ',
  'さ',
  'し',
  'す',
  'せ',
  'そ',
  'た',
  'ち',
  'つ',
  'て',
  'と',
  'な',
  'に',
  'ぬ',
  'ね',
  'の',
  'は',
  'ひ',
  'ふ',
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
  'うぅ',
  'うぇ',
  'うぉ',
  'ん',
  'が',
  'ぎ',
  'ぐ',
  'げ',
  'ご',
  'ざ',
  'じ',
  'ず',
  'ぜ',
  'ぞ',
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
  'ゔぁ',
  'ゔぃ',
  'ゔ',
  'ゔぇ',
  'ゔぉ',
  'きゃ',
  'きぃ',
  'きゅ',
  'きぇ',
  'きょ',
  'しゃ',
  'しぃ',
  'しゅ',
  'しぇ',
  'しょ',
  'ちゃ',
  'ちぃ',
  'ちゅ',
  'ちぇ',
  'ちょ',
  'つぁ',
  'つぃ',
  'とぅ',
  'つぇ',
  'つぉ',
  'てゃ',
  'てぃ',
  'てゅ',
  'てぇ',
  'てょ',
  'にゃ',
  'にぃ',
  'にゅ',
  'にぇ',
  'にょ',
  'ひゃ',
  'ひぃ',
  'ひゅ',
  'ひぇ',
  'ひょ',
  'みゃ',
  'みぃ',
  'みゅ',
  'みぇ',
  'みょ',
  'りゃ',
  'りぃ',
  'りゅ',
  'りぇ',
  'りょ',
  'ぎゃ',
  'ぎぃ',
  'ぎゅ',
  'ぎぇ',
  'ぎょ',
  'じゃ',
  'じぃ',
  'じゅ',
  'じぇ',
  'じょ',
  'でゃ',
  'でゅ',
  'でょ',
  'びゃ',
  'びぃ',
  'びゅ',
  'びぇ',
  'びょ',
  'ぴゃ',
  'ぴぃ',
  'ぴゅ',
  'ぴぇ',
  'ぴょ',
  'ふぁ',
  'ふぃ',
  'ふぅ',
  'ふぇ',
  'ふぉ',
  'すぃ',
  'ずぃ',
  'いぇ',
  'くゎ',
  'ぐゎ',
  'っ',
  '、',
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

export const envLenSchema = z.object({
  envKey: envKeyEnumSchema,
  len: z.number().min(0).nullable(),
  vol: z.number().min(0)
})
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
