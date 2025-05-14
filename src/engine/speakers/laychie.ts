import { int } from '../utils'
import type { SpeakerVoice } from '../schemata'

const fs = 48000

export const laychieVoice: Readonly<SpeakerVoice> = {
  id:       'laychie',
  name:     'レイチー',
  fs:       fs,
  segLen:   int(fs * 0.01),
  shiftLen: 10,
  shiftNum: 1,
  envelopes: {
    a: [[0,0],[1,0.1],[100,0.1],[300,0.25],[400,0.62],[800,0.75],[1200,1],[1600,0.88],[2000,0.31],[2400,0.08],[2800,0.03],[3200,0.03],[3600,0.08],[4000,0.24],[5100,0.3],[6400,0.27],[8000,0.1],[10600,0.05],[12000,0]],
    i: [[0,0],[1,0.1],[100,0.1],[300,0.25],[400,1],[800,0.13],[1200,0.06],[2000,0.06],[2800,0.13],[3700,0.27],[4600,0.75],[5900,0.26],[7000,0.15],[8500,0.07],[9300,0.07],[10600,0.1],[11700,0.05],[12000,0]],
    u: [[0,0],[1,0.1],[100,0.1],[300,0.25],[400,1],[800,0.5],[1200,0.19],[1600,0.19],[2000,0.63],[2400,0.18],[2800,0.09],[3200,0.05],[3600,0.05],[4000,0.09],[4600,0.25],[5500,0.75],[6800,0.25],[7600,0.15],[9300,0.06],[10500,0.1],[11700,0.06],[12000,0]],
    e: [[0,0],[1,0.1],[100,0.1],[300,0.25],[400,0.62],[800,1],[1200,0.32],[1600,0.12],[2000,0.06],[2400,0.06],[2800,0.12],[3500,0.33],[4100,0.75],[5000,0.32],[5800,0.18],[7900,0.11],[10700,0.07],[12000,0]],
    o: [[0,0],[1,0.1],[100,0.1],[300,0.25],[400,0.94],[800,1],[1200,0.88],[1600,0.38],[2000,0.19],[2400,0.08],[3000,0.04],[3600,0.08],[4000,0.25],[5200,0.29],[6700,0.25],[7600,0.1],[9000,0.06],[10500,0.1],[11700,0.05],[12000,0]],
    k: [[0,0],[800,0.18],[1600,0.25],[2000,0.44],[2400,1],[2800,0.37],[3200,0.16],[3600,0.08],[4300,0.06],[5200,0.09],[5800,0.28],[6400,0.36],[7000,0.28],[7300,0.13],[7800,0.4],[8400,0.5],[9100,0.39],[10000,0.1],[10800,0.04],[12000,0]],
    s: [[0,0],[400,0.06],[2800,0.14],[4900,0.31],[6000,0.48],[7100,0.76],[8400,1],[9300,0.76],[9900,0.37],[10900,0.13],[12000,0]],
    t: [[0,0],[1,0.1],[100,0.1],[300,0.25],[400,0.56],[800,0.62],[1200,1],[1600,0.33],[2000,0.18],[3800,0.08],[6200,0.2],[7400,0.76],[9700,0.93],[11300,0.23],[12000,0]],
    n: [[0,0],[1,0.1],[100,0.1],[300,0.25],[400,1],[800,0.25],[1200,0.16],[1600,0.1],[3000,0.04],[12000,0]],
    h: [[0,0],[800,0.18],[1200,0.69],[1600,0.9],[2800,1],[4400,0.9],[5600,0.69],[7500,0.25],[9300,0.07],[12000,0]],
    m: [[0,0],[1,0.1],[100,0.1],[300,0.25],[400,1],[800,0.25],[1200,0.5],[1600,0.09],[3200,0.04],[12000,0]],
    y: [[0,0],[1,0.1],[100,0.1],[300,0.25],[400,1],[800,0.53],[1200,0.34],[2000,0.09],[2800,0.24],[3200,0.48],[4400,0.45],[5600,0.25],[6400,0.05],[12000,0]],
    r: [[0,0],[1,0.1],[100,0.1],[300,0.25],[400,1],[1200,0.62],[1600,0.12],[2000,0.12],[2400,0.32],[2800,0.13],[3600,0.06],[4000,0.13],[4400,0.29],[7100,0.08],[8300,0.12],[12000,0]],
    w: [[0,0],[1,0.1],[100,0.1],[300,0.25],[400,1],[800,0.5],[1200,0.75],[1600,0.25],[2000,0.5],[2800,0.12],[3600,0.38],[5200,0.06],[6800,0.25],[8900,0],[10300,0.14],[12000,0]],
    g: [[0,0],[1,0.1],[100,0.1],[300,0.25],[400,1],[800,0.62],[1200,0.56],[2000,0.62],[2400,1],[2800,0.37],[3200,0.16],[3600,0.08],[4300,0.06],[5200,0.09],[5800,0.28],[6400,0.36],[7000,0.28],[7300,0.13],[7800,0.4],[8400,0.5],[9100,0.39],[10000,0.1],[10800,0.04],[12000,0]],
    z: [[0,0],[1,0.1],[100,0.1],[300,0.25],[400,0.75],[800,0.06],[2000,0.1],[2800,0.25],[3600,0.12],[5900,0.24],[7500,0.56],[9000,1],[10500,0.35],[12000,0]],
    d: [[0,0],[1,0.1],[100,0.1],[300,0.25],[400,1],[800,0.25],[1600,0.06],[5200,0.06],[6300,0.13],[8300,1],[10300,0.3],[12000,0]],
    b: [[0,0],[1,0.1],[100,0.1],[300,0.25],[400,1],[1600,0.38],[2400,0.25],[3600,0.21],[4800,0.21],[7000,0.31],[7800,0.63],[8600,0.31],[12000,0]],
    p: [[0,0],[2000,0.06],[2400,1],[2800,0.06],[12000,0]],
    v: [[0,0],[1,0.1],[100,0.1],[300,0.25],[400,1],[800,0.5],[1600,0.31],[2000,0.31],[2400,0.75],[3200,0.25],[3600,0.21],[4800,0.21],[7000,0.31],[8600,0.31],[12000,0]],
    q: [[0,0],[12000,0]]
  },
  kanas: {
    'あ': [
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'い': [
      { envKey: 'i', len: null,  vol: 1.00 }
    ],
    'う': [
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'え': [
      { envKey: 'e', len: null,  vol: 1.00 }
    ],
    'お': [
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'か': [
      { envKey: 'q', len: 0.060, vol: 0.00 },
      { envKey: 'k', len: 0.015, vol: 0.20 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'き': [
      { envKey: 'q', len: 0.060, vol: 0.00 },
      { envKey: 'k', len: 0.025, vol: 0.20 },
      { envKey: 'i', len: null,  vol: 1.00 }
    ],
    'く': [
      { envKey: 'q', len: 0.060, vol: 0.00 },
      { envKey: 'k', len: 0.025, vol: 0.20 },
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'け': [
      { envKey: 'q', len: 0.060, vol: 0.00 },
      { envKey: 'k', len: 0.025, vol: 0.20 },
      { envKey: 'e', len: null,  vol: 1.00 }
    ],
    'こ': [
      { envKey: 'q', len: 0.060, vol: 0.00 },
      { envKey: 'k', len: 0.015, vol: 0.20 },
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'さ': [
      { envKey: 's', len: 0.100, vol: 0.20 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'し': [
      { envKey: 's', len: 0.100, vol: 0.20 },
      { envKey: 'i', len: null,  vol: 1.00 }
    ],
    'す': [
      { envKey: 's', len: 0.100, vol: 0.20 },
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'せ': [
      { envKey: 's', len: 0.100, vol: 0.20 },
      { envKey: 'e', len: null,  vol: 1.00 }
    ],
    'そ': [
      { envKey: 's', len: 0.100, vol: 0.20 },
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'た': [
      { envKey: 'q', len: 0.080, vol: 0.00 },
      { envKey: 't', len: 0.020, vol: 0.10 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'ち': [
      { envKey: 'q', len: 0.050, vol: 0.00 },
      { envKey: 't', len: 0.070, vol: 0.30 },
      { envKey: 'i', len: null,  vol: 1.00 }
    ],
    'つ': [
      { envKey: 'q', len: 0.050, vol: 0.00 },
      { envKey: 't', len: 0.070, vol: 0.30 },
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'て': [
      { envKey: 'q', len: 0.080, vol: 0.00 },
      { envKey: 't', len: 0.020, vol: 0.10 },
      { envKey: 'e', len: null,  vol: 1.00 }
    ],
    'と': [
      { envKey: 'q', len: 0.080, vol: 0.00 },
      { envKey: 't', len: 0.020, vol: 0.10 },
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'な': [
      { envKey: 'n', len: 0.070, vol: 0.70 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'に': [
      { envKey: 'n', len: 0.070, vol: 0.70 },
      { envKey: 'i', len: null,  vol: 1.00 }
    ],
    'ぬ': [
      { envKey: 'n', len: 0.070, vol: 0.70 },
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'ね': [
      { envKey: 'n', len: 0.070, vol: 0.70 },
      { envKey: 'e', len: null,  vol: 1.00 }
    ],
    'の': [
      { envKey: 'n', len: 0.070, vol: 0.70 },
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'は': [
      { envKey: 'h', len: 0.070, vol: 0.10 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'ひ': [
      { envKey: 'h', len: 0.070, vol: 0.10 },
      { envKey: 'i', len: null,  vol: 1.00 }
    ],
    'ふ': [
      { envKey: 'h', len: 0.070, vol: 0.10 },
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'へ': [
      { envKey: 'h', len: 0.070, vol: 0.10 },
      { envKey: 'e', len: null,  vol: 1.00 }
    ],
    'ほ': [
      { envKey: 'h', len: 0.070, vol: 0.10 },
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'ま': [
      { envKey: 'm', len: 0.070, vol: 0.70 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'み': [
      { envKey: 'm', len: 0.070, vol: 0.70 },
      { envKey: 'i', len: null,  vol: 1.00 }
    ],
    'む': [
      { envKey: 'm', len: 0.070, vol: 0.70 },
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'め': [
      { envKey: 'm', len: 0.070, vol: 0.70 },
      { envKey: 'e', len: null,  vol: 1.00 }
    ],
    'も': [
      { envKey: 'm', len: 0.070, vol: 0.70 },
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'や': [
      { envKey: 'y', len: 0.080, vol: 0.30 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'ゆ': [
      { envKey: 'y', len: 0.080, vol: 0.30 },
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'よ': [
      { envKey: 'y', len: 0.080, vol: 0.30 },
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'ら': [
      { envKey: 'r', len: 0.050, vol: 0.30 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'り': [
      { envKey: 'r', len: 0.050, vol: 0.30 },
      { envKey: 'i', len: null,  vol: 1.00 }
    ],
    'る': [
      { envKey: 'r', len: 0.050, vol: 0.30 },
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'れ': [
      { envKey: 'r', len: 0.050, vol: 0.30 },
      { envKey: 'e', len: null,  vol: 1.00 }
    ],
    'ろ': [
      { envKey: 'r', len: 0.050, vol: 0.30 },
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'わ': [
      { envKey: 'w', len: 0.100, vol: 0.50 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'うぃ': [
      { envKey: 'w', len: 0.100, vol: 0.50 },
      { envKey: 'i', len: null,  vol: 1.00 }
    ],
    'うぅ': [
      { envKey: 'w', len: 0.100, vol: 0.50 },
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'うぇ': [
      { envKey: 'w', len: 0.100, vol: 0.50 },
      { envKey: 'e', len: null,  vol: 1.00 }
    ],
    'うぉ': [
      { envKey: 'w', len: 0.100, vol: 0.50 },
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'ん': [
      { envKey: 'n', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'が': [
      { envKey: 'g', len: 0.030, vol: 0.20 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'ぎ': [
      { envKey: 'g', len: 0.050, vol: 0.20 },
      { envKey: 'i', len: null,  vol: 1.00 }
    ],
    'ぐ': [
      { envKey: 'g', len: 0.050, vol: 0.20 },
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'げ': [
      { envKey: 'g', len: 0.050, vol: 0.20 },
      { envKey: 'e', len: null,  vol: 1.00 }
    ],
    'ご': [
      { envKey: 'g', len: 0.030, vol: 0.20 },
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'ざ': [
      { envKey: 'z', len: 0.080, vol: 0.20 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'じ': [
      { envKey: 'z', len: 0.080, vol: 0.20 },
      { envKey: 'i', len: null,  vol: 1.00 }
    ],
    'ず': [
      { envKey: 'z', len: 0.080, vol: 0.20 },
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'ぜ': [
      { envKey: 'z', len: 0.080, vol: 0.20 },
      { envKey: 'e', len: null,  vol: 1.00 }
    ],
    'ぞ': [
      { envKey: 'z', len: 0.080, vol: 0.20 },
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'だ': [
      { envKey: 'd', len: 0.060, vol: 0.10 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'でぃ': [
      { envKey: 'd', len: 0.060, vol: 0.10 },
      { envKey: 'i', len: null,  vol: 1.00 }
    ],
    'どぅ': [
      { envKey: 'd', len: 0.060, vol: 0.10 },
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'で': [
      { envKey: 'd', len: 0.060, vol: 0.10 },
      { envKey: 'e', len: null,  vol: 1.00 }
    ],
    'ど': [
      { envKey: 'd', len: 0.060, vol: 0.10 },
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'ば': [
      { envKey: 'b', len: 0.060, vol: 0.10 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'び': [
      { envKey: 'b', len: 0.060, vol: 0.10 },
      { envKey: 'i', len: null,  vol: 1.00 }
    ],
    'ぶ': [
      { envKey: 'b', len: 0.060, vol: 0.10 },
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'べ': [
      { envKey: 'b', len: 0.060, vol: 0.10 },
      { envKey: 'e', len: null,  vol: 1.00 }
    ],
    'ぼ': [
      { envKey: 'b', len: 0.060, vol: 0.10 },
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'ぱ': [
      { envKey: 'p', len: 0.030, vol: 0.10 },
      { envKey: 'q', len: 0.080, vol: 0.00 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'ぴ': [
      { envKey: 'p', len: 0.030, vol: 0.10 },
      { envKey: 'q', len: 0.080, vol: 0.00 },
      { envKey: 'i', len: null,  vol: 1.00 }
    ],
    'ぷ': [
      { envKey: 'p', len: 0.030, vol: 0.10 },
      { envKey: 'q', len: 0.080, vol: 0.00 },
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'ぺ': [
      { envKey: 'p', len: 0.030, vol: 0.10 },
      { envKey: 'q', len: 0.080, vol: 0.00 },
      { envKey: 'e', len: null,  vol: 1.00 }
    ],
    'ぽ': [
      { envKey: 'p', len: 0.030, vol: 0.10 },
      { envKey: 'q', len: 0.080, vol: 0.00 },
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'ゔぁ': [
      { envKey: 'v', len: 0.060, vol: 0.10 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'ゔぃ': [
      { envKey: 'v', len: 0.060, vol: 0.10 },
      { envKey: 'i', len: null,  vol: 1.00 }
    ],
    'ゔ': [
      { envKey: 'v', len: 0.060, vol: 0.10 },
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'ゔぇ': [
      { envKey: 'v', len: 0.060, vol: 0.10 },
      { envKey: 'e', len: null,  vol: 1.00 }
    ],
    'ゔぉ': [
      { envKey: 'v', len: 0.060, vol: 0.10 },
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'きゃ': [
      { envKey: 'q', len: 0.080, vol: 0.00 },
      { envKey: 'k', len: 0.030, vol: 0.20 },
      { envKey: 'y', len: 0.020, vol: 0.30 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'きぃ': [
      { envKey: 'q', len: 0.080, vol: 0.00 },
      { envKey: 'k', len: 0.030, vol: 0.20 },
      { envKey: 'y', len: 0.020, vol: 0.30 },
      { envKey: 'i', len: null,  vol: 1.00 }
    ],
    'きゅ': [
      { envKey: 'q', len: 0.080, vol: 0.00 },
      { envKey: 'k', len: 0.030, vol: 0.20 },
      { envKey: 'y', len: 0.020, vol: 0.30 },
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'きぇ': [
      { envKey: 'q', len: 0.080, vol: 0.00 },
      { envKey: 'k', len: 0.030, vol: 0.20 },
      { envKey: 'y', len: 0.020, vol: 0.30 },
      { envKey: 'e', len: null,  vol: 1.00 }
    ],
    'きょ': [
      { envKey: 'q', len: 0.080, vol: 0.00 },
      { envKey: 'k', len: 0.030, vol: 0.20 },
      { envKey: 'y', len: 0.020, vol: 0.30 },
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'しゃ': [
      { envKey: 's', len: 0.100, vol: 0.20 },
      { envKey: 'y', len: 0.020, vol: 0.30 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'しぃ': [
      { envKey: 's', len: 0.100, vol: 0.20 },
      { envKey: 'y', len: 0.020, vol: 0.30 },
      { envKey: 'i', len: null,  vol: 1.00 }
    ],
    'しゅ': [
      { envKey: 's', len: 0.100, vol: 0.20 },
      { envKey: 'y', len: 0.020, vol: 0.30 },
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'しぇ': [
      { envKey: 's', len: 0.100, vol: 0.20 },
      { envKey: 'y', len: 0.020, vol: 0.30 },
      { envKey: 'e', len: null,  vol: 1.00 }
    ],
    'しょ': [
      { envKey: 's', len: 0.100, vol: 0.20 },
      { envKey: 'y', len: 0.020, vol: 0.30 },
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'ちゃ': [
      { envKey: 'q', len: 0.050, vol: 0.00 },
      { envKey: 't', len: 0.050, vol: 0.30 },
      { envKey: 'y', len: 0.020, vol: 0.40 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'ちぃ': [
      { envKey: 'q', len: 0.050, vol: 0.00 },
      { envKey: 't', len: 0.050, vol: 0.30 },
      { envKey: 'y', len: 0.020, vol: 0.40 },
      { envKey: 'i', len: null,  vol: 1.00 }
    ],
    'ちゅ': [
      { envKey: 'q', len: 0.050, vol: 0.00 },
      { envKey: 't', len: 0.050, vol: 0.30 },
      { envKey: 'y', len: 0.020, vol: 0.40 },
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'ちぇ': [
      { envKey: 'q', len: 0.050, vol: 0.00 },
      { envKey: 't', len: 0.050, vol: 0.30 },
      { envKey: 'y', len: 0.020, vol: 0.40 },
      { envKey: 'e', len: null,  vol: 1.00 }
    ],
    'ちょ': [
      { envKey: 'q', len: 0.050, vol: 0.00 },
      { envKey: 't', len: 0.050, vol: 0.30 },
      { envKey: 'y', len: 0.020, vol: 0.40 },
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'つぁ': [
      { envKey: 'q', len: 0.050, vol: 0.00 },
      { envKey: 't', len: 0.050, vol: 0.30 },
      { envKey: 'u', len: 0.020, vol: 0.40 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'つぃ': [
      { envKey: 'q', len: 0.050, vol: 0.00 },
      { envKey: 't', len: 0.050, vol: 0.30 },
      { envKey: 'u', len: 0.020, vol: 0.40 },
      { envKey: 'i', len: null,  vol: 1.00 }
    ],
    'とぅ': [
      { envKey: 'q', len: 0.050, vol: 0.00 },
      { envKey: 't', len: 0.050, vol: 0.30 },
      { envKey: 'u', len: 0.020, vol: 0.40 },
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'つぇ': [
      { envKey: 'q', len: 0.050, vol: 0.00 },
      { envKey: 't', len: 0.050, vol: 0.30 },
      { envKey: 'u', len: 0.020, vol: 0.40 },
      { envKey: 'e', len: null,  vol: 1.00 }
    ],
    'つぉ': [
      { envKey: 'q', len: 0.050, vol: 0.00 },
      { envKey: 't', len: 0.050, vol: 0.30 },
      { envKey: 'u', len: 0.020, vol: 0.40 },
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'てゃ': [
      { envKey: 'q', len: 0.030, vol: 0.00 },
      { envKey: 't', len: 0.030, vol: 0.30 },
      { envKey: 'e', len: 0.020, vol: 0.30 },
      { envKey: 'y', len: 0.020, vol: 0.40 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'てぃ': [
      { envKey: 'q', len: 0.030, vol: 0.00 },
      { envKey: 't', len: 0.030, vol: 0.30 },
      { envKey: 'e', len: 0.020, vol: 0.30 },
      { envKey: 'y', len: 0.020, vol: 0.40 },
      { envKey: 'i', len: null,  vol: 1.00 }
    ],
    'てゅ': [
      { envKey: 'q', len: 0.030, vol: 0.00 },
      { envKey: 't', len: 0.030, vol: 0.30 },
      { envKey: 'e', len: 0.020, vol: 0.30 },
      { envKey: 'y', len: 0.020, vol: 0.40 },
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'てぇ': [
      { envKey: 'q', len: 0.030, vol: 0.00 },
      { envKey: 't', len: 0.030, vol: 0.30 },
      { envKey: 'e', len: 0.020, vol: 0.30 },
      { envKey: 'y', len: 0.020, vol: 0.40 },
      { envKey: 'e', len: null,  vol: 1.00 }
    ],
    'てょ': [
      { envKey: 'q', len: 0.030, vol: 0.00 },
      { envKey: 't', len: 0.030, vol: 0.30 },
      { envKey: 'e', len: 0.020, vol: 0.30 },
      { envKey: 'y', len: 0.020, vol: 0.40 },
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'にゃ': [
      { envKey: 'n', len: 0.060, vol: 0.50 },
      { envKey: 'y', len: 0.020, vol: 0.50 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'にぃ': [
      { envKey: 'n', len: 0.060, vol: 0.50 },
      { envKey: 'y', len: 0.020, vol: 0.50 },
      { envKey: 'i', len: null,  vol: 1.00 }
    ],
    'にゅ': [
      { envKey: 'n', len: 0.060, vol: 0.50 },
      { envKey: 'y', len: 0.020, vol: 0.50 },
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'にぇ': [
      { envKey: 'n', len: 0.060, vol: 0.50 },
      { envKey: 'y', len: 0.020, vol: 0.50 },
      { envKey: 'e', len: null,  vol: 1.00 }
    ],
    'にょ': [
      { envKey: 'n', len: 0.060, vol: 0.50 },
      { envKey: 'y', len: 0.020, vol: 0.50 },
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'ひゃ': [
      { envKey: 'h', len: 0.100, vol: 0.10 },
      { envKey: 'y', len: 0.100, vol: 0.50 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'ひぃ': [
      { envKey: 'h', len: 0.100, vol: 0.10 },
      { envKey: 'y', len: 0.100, vol: 0.50 },
      { envKey: 'i', len: null,  vol: 1.00 }
    ],
    'ひゅ': [
      { envKey: 'h', len: 0.100, vol: 0.10 },
      { envKey: 'y', len: 0.100, vol: 0.50 },
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'ひぇ': [
      { envKey: 'h', len: 0.100, vol: 0.10 },
      { envKey: 'y', len: 0.100, vol: 0.50 },
      { envKey: 'e', len: null,  vol: 1.00 }
    ],
    'ひょ': [
      { envKey: 'h', len: 0.100, vol: 0.10 },
      { envKey: 'y', len: 0.100, vol: 0.50 },
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'みゃ': [
      { envKey: 'm', len: 0.080, vol: 0.50 },
      { envKey: 'y', len: 0.070, vol: 0.50 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'みぃ': [
      { envKey: 'm', len: 0.080, vol: 0.50 },
      { envKey: 'y', len: 0.070, vol: 0.50 },
      { envKey: 'i', len: null,  vol: 1.00 }
    ],
    'みゅ': [
      { envKey: 'm', len: 0.080, vol: 0.50 },
      { envKey: 'y', len: 0.070, vol: 0.50 },
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'みぇ': [
      { envKey: 'm', len: 0.080, vol: 0.50 },
      { envKey: 'y', len: 0.070, vol: 0.50 },
      { envKey: 'e', len: null,  vol: 1.00 }
    ],
    'みょ': [
      { envKey: 'm', len: 0.080, vol: 0.50 },
      { envKey: 'y', len: 0.070, vol: 0.50 },
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'りゃ': [
      { envKey: 'r', len: 0.050, vol: 0.50 },
      { envKey: 'y', len: 0.050, vol: 0.50 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'りぃ': [
      { envKey: 'r', len: 0.050, vol: 0.50 },
      { envKey: 'y', len: 0.050, vol: 0.50 },
      { envKey: 'i', len: null,  vol: 1.00 }
    ],
    'りゅ': [
      { envKey: 'r', len: 0.050, vol: 0.50 },
      { envKey: 'y', len: 0.050, vol: 0.50 },
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'りぇ': [
      { envKey: 'r', len: 0.050, vol: 0.50 },
      { envKey: 'y', len: 0.050, vol: 0.50 },
      { envKey: 'e', len: null,  vol: 1.00 }
    ],
    'りょ': [
      { envKey: 'r', len: 0.050, vol: 0.50 },
      { envKey: 'y', len: 0.050, vol: 0.50 },
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'ぎゃ': [
      { envKey: 'g', len: 0.050, vol: 0.20 },
      { envKey: 'y', len: 0.050, vol: 0.30 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'ぎぃ': [
      { envKey: 'g', len: 0.050, vol: 0.20 },
      { envKey: 'y', len: 0.050, vol: 0.30 },
      { envKey: 'i', len: null,  vol: 1.00 }
    ],
    'ぎゅ': [
      { envKey: 'g', len: 0.050, vol: 0.20 },
      { envKey: 'y', len: 0.050, vol: 0.30 },
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'ぎぇ': [
      { envKey: 'g', len: 0.050, vol: 0.20 },
      { envKey: 'y', len: 0.050, vol: 0.30 },
      { envKey: 'e', len: null,  vol: 1.00 }
    ],
    'ぎょ': [
      { envKey: 'g', len: 0.050, vol: 0.20 },
      { envKey: 'y', len: 0.050, vol: 0.30 },
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'じゃ': [
      { envKey: 'z', len: 0.100, vol: 0.50 },
      { envKey: 'y', len: 0.100, vol: 0.50 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'じぃ': [
      { envKey: 'z', len: 0.100, vol: 0.50 },
      { envKey: 'y', len: 0.100, vol: 0.50 },
      { envKey: 'i', len: null,  vol: 1.00 }
    ],
    'じゅ': [
      { envKey: 'z', len: 0.100, vol: 0.50 },
      { envKey: 'y', len: 0.100, vol: 0.50 },
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'じぇ': [
      { envKey: 'z', len: 0.100, vol: 0.50 },
      { envKey: 'y', len: 0.100, vol: 0.50 },
      { envKey: 'e', len: null,  vol: 1.00 }
    ],
    'じょ': [
      { envKey: 'z', len: 0.100, vol: 0.50 },
      { envKey: 'y', len: 0.100, vol: 0.50 },
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'でゃ': [
      { envKey: 'd', len: 0.030, vol: 0.20 },
      { envKey: 'y', len: 0.020, vol: 0.30 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'でゅ': [
      { envKey: 'd', len: 0.030, vol: 0.20 },
      { envKey: 'y', len: 0.020, vol: 0.30 },
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'でょ': [
      { envKey: 'd', len: 0.030, vol: 0.20 },
      { envKey: 'y', len: 0.020, vol: 0.30 },
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'びゃ': [
      { envKey: 'b', len: 0.040, vol: 0.20 },
      { envKey: 'y', len: 0.030, vol: 0.30 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'びぃ': [
      { envKey: 'b', len: 0.040, vol: 0.20 },
      { envKey: 'y', len: 0.030, vol: 0.30 },
      { envKey: 'i', len: null,  vol: 1.00 }
    ],
    'びゅ': [
      { envKey: 'b', len: 0.040, vol: 0.20 },
      { envKey: 'y', len: 0.030, vol: 0.30 },
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'びぇ': [
      { envKey: 'b', len: 0.040, vol: 0.20 },
      { envKey: 'y', len: 0.030, vol: 0.30 },
      { envKey: 'e', len: null,  vol: 1.00 }
    ],
    'びょ': [
      { envKey: 'b', len: 0.040, vol: 0.20 },
      { envKey: 'y', len: 0.030, vol: 0.30 },
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'ぴゃ': [
      { envKey: 'p', len: 0.020, vol: 0.10 },
      { envKey: 'q', len: 0.060, vol: 0.00 },
      { envKey: 'y', len: 0.020, vol: 0.20 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'ぴぃ': [
      { envKey: 'p', len: 0.020, vol: 0.10 },
      { envKey: 'q', len: 0.060, vol: 0.00 },
      { envKey: 'y', len: 0.020, vol: 0.20 },
      { envKey: 'i', len: null,  vol: 1.00 }
    ],
    'ぴゅ': [
      { envKey: 'p', len: 0.020, vol: 0.10 },
      { envKey: 'q', len: 0.060, vol: 0.00 },
      { envKey: 'y', len: 0.020, vol: 0.20 },
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'ぴぇ': [
      { envKey: 'p', len: 0.020, vol: 0.10 },
      { envKey: 'q', len: 0.060, vol: 0.00 },
      { envKey: 'y', len: 0.020, vol: 0.20 },
      { envKey: 'e', len: null,  vol: 1.00 }
    ],
    'ぴょ': [
      { envKey: 'p', len: 0.020, vol: 0.10 },
      { envKey: 'q', len: 0.060, vol: 0.00 },
      { envKey: 'y', len: 0.020, vol: 0.20 },
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'ふぁ': [
      { envKey: 'h', len: 0.060, vol: 0.10 },
      { envKey: 'u', len: 0.020, vol: 0.30 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'ふぃ': [
      { envKey: 'h', len: 0.060, vol: 0.10 },
      { envKey: 'u', len: 0.020, vol: 0.30 },
      { envKey: 'i', len: null,  vol: 1.00 }
    ],
    'ふぅ': [
      { envKey: 'h', len: 0.060, vol: 0.10 },
      { envKey: 'u', len: 0.020, vol: 0.30 },
      { envKey: 'u', len: null,  vol: 1.00 }
    ],
    'ふぇ': [
      { envKey: 'h', len: 0.060, vol: 0.10 },
      { envKey: 'u', len: 0.020, vol: 0.30 },
      { envKey: 'e', len: null,  vol: 1.00 }
    ],
    'ふぉ': [
      { envKey: 'h', len: 0.060, vol: 0.10 },
      { envKey: 'u', len: 0.020, vol: 0.30 },
      { envKey: 'o', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'すぃ': [
      { envKey: 's', len: 0.100, vol: 0.20 },
      { envKey: 'y', len: 0.030, vol: 0.30 },
      { envKey: 'i', len: null,  vol: 1.00 }
    ],
    'ずぃ': [
      { envKey: 'z', len: 0.100, vol: 0.20 },
      { envKey: 'y', len: 0.030, vol: 0.30 },
      { envKey: 'i', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'いぇ': [
      { envKey: 'y', len: 0.100, vol: 0.50 },
      { envKey: 'e', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'くゎ': [
      { envKey: 'k', len: 0.030, vol: 0.20 },
      { envKey: 'w', len: 0.080, vol: 0.20 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],
    'ぐゎ': [
      { envKey: 'g', len: 0.030, vol: 0.20 },
      { envKey: 'w', len: 0.080, vol: 0.20 },
      { envKey: 'a', len: null,  vol: 1.00 }
    ],

    /* ================ */

    'っ': [
      { envKey: 'q', len: null,  vol: 1.00 }
    ],
    '、': [
      { envKey: 'q', len: null,  vol: 1.00 }
    ]
  }
}
