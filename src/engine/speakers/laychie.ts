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
      { envKey: 'a', len: null  }
    ],
    'い': [
      { envKey: 'i', len: null  }
    ],
    'う': [
      { envKey: 'u', len: null  }
    ],
    'え': [
      { envKey: 'e', len: null  }
    ],
    'お': [
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'か': [
      { envKey: 'k', len: 0.015 },
      { envKey: 'a', len: null  }
    ],
    'き': [
      { envKey: 'k', len: 0.025 },
      { envKey: 'i', len: null  }
    ],
    'く': [
      { envKey: 'k', len: 0.025 },
      { envKey: 'u', len: null  }
    ],
    'け': [
      { envKey: 'k', len: 0.025 },
      { envKey: 'e', len: null  }
    ],
    'こ': [
      { envKey: 'k', len: 0.015 },
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'さ': [
      { envKey: 's', len: 0.04  },
      { envKey: 'a', len: null  }
    ],
    'し': [
      { envKey: 's', len: 0.04  },
      { envKey: 'i', len: null  }
    ],
    'す': [
      { envKey: 's', len: 0.04  },
      { envKey: 'u', len: null  }
    ],
    'せ': [
      { envKey: 's', len: 0.04  },
      { envKey: 'e', len: null  }
    ],
    'そ': [
      { envKey: 's', len: 0.04  },
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'た': [
      { envKey: 't', len: 0.01  },
      { envKey: 'a', len: null  }
    ],
    'ち': [
      { envKey: 't', len: 0.04  },
      { envKey: 'i', len: null  }
    ],
    'つ': [
      { envKey: 't', len: 0.04  },
      { envKey: 'u', len: null  }
    ],
    'て': [
      { envKey: 't', len: 0.01  },
      { envKey: 'e', len: null  }
    ],
    'と': [
      { envKey: 't', len: 0.01  },
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'な': [
      { envKey: 'n', len: 0.025 },
      { envKey: 'a', len: null  }
    ],
    'に': [
      { envKey: 'n', len: 0.025 },
      { envKey: 'i', len: null  }
    ],
    'ぬ': [
      { envKey: 'n', len: 0.025 },
      { envKey: 'u', len: null  }
    ],
    'ね': [
      { envKey: 'n', len: 0.025 },
      { envKey: 'e', len: null  }
    ],
    'の': [
      { envKey: 'n', len: 0.025 },
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'は': [
      { envKey: 'h', len: 0.025 },
      { envKey: 'a', len: null  }
    ],
    'ひ': [
      { envKey: 'h', len: 0.025 },
      { envKey: 'i', len: null  }
    ],
    'ふ': [
      { envKey: 'h', len: 0.025 },
      { envKey: 'u', len: null  }
    ],
    'へ': [
      { envKey: 'h', len: 0.025 },
      { envKey: 'e', len: null  }
    ],
    'ほ': [
      { envKey: 'h', len: 0.025 },
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'ま': [
      { envKey: 'm', len: 0.015 },
      { envKey: 'a', len: null  }
    ],
    'み': [
      { envKey: 'm', len: 0.015 },
      { envKey: 'i', len: null  }
    ],
    'む': [
      { envKey: 'm', len: 0.01  },
      { envKey: 'u', len: null  }
    ],
    'め': [
      { envKey: 'm', len: 0.03  },
      { envKey: 'e', len: null  }
    ],
    'も': [
      { envKey: 'm', len: 0.03  },
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'や': [
      { envKey: 'y', len: 0.03  },
      { envKey: 'a', len: null  }
    ],
    'ゆ': [
      { envKey: 'y', len: 0.03  },
      { envKey: 'u', len: null  }
    ],
    'よ': [
      { envKey: 'y', len: 0.03  },
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'ら': [
      { envKey: 'r', len: 0.025 },
      { envKey: 'a', len: null  }
    ],
    'り': [
      { envKey: 'r', len: 0.025 },
      { envKey: 'i', len: null  }
    ],
    'る': [
      { envKey: 'r', len: 0.025 },
      { envKey: 'u', len: null  }
    ],
    'れ': [
      { envKey: 'r', len: 0.025 },
      { envKey: 'e', len: null  }
    ],
    'ろ': [
      { envKey: 'r', len: 0.025 },
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'わ': [
      { envKey: 'w', len: 0.025 },
      { envKey: 'a', len: null  }
    ],
    'うぃ': [
      { envKey: 'w', len: 0.025 },
      { envKey: 'i', len: null  }
    ],
    'うぇ': [
      { envKey: 'w', len: 0.025 },
      { envKey: 'e', len: null  }
    ],
    'うぉ': [
      { envKey: 'w', len: 0.025 },
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'ん': [
      { envKey: 'n', len: null  }
    ],

    /* ================ */

    'が': [
      { envKey: 'g', len: 0.015 },
      { envKey: 'a', len: null  }
    ],
    'ぎ': [
      { envKey: 'g', len: 0.025 },
      { envKey: 'i', len: null  }
    ],
    'ぐ': [
      { envKey: 'g', len: 0.025 },
      { envKey: 'u', len: null  }
    ],
    'げ': [
      { envKey: 'g', len: 0.025 },
      { envKey: 'e', len: null  }
    ],
    'ご': [
      { envKey: 'g', len: 0.015 },
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'ざ': [
      { envKey: 'z', len: 0.04  },
      { envKey: 'a', len: null  }
    ],
    'じ': [
      { envKey: 'z', len: 0.04  },
      { envKey: 'i', len: null  }
    ],
    'ず': [
      { envKey: 'z', len: 0.04  },
      { envKey: 'u', len: null  }
    ],
    'ぜ': [
      { envKey: 'z', len: 0.04  },
      { envKey: 'e', len: null  }
    ],
    'ぞ': [
      { envKey: 'z', len: 0.04  },
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'だ': [
      { envKey: 'd', len: 0.01  },
      { envKey: 'a', len: null  }
    ],
    'でぃ': [
      { envKey: 'd', len: 0.04  },
      { envKey: 'i', len: null  }
    ],
    'どぅ': [
      { envKey: 'd', len: 0.04  },
      { envKey: 'u', len: null  }
    ],
    'で': [
      { envKey: 'd', len: 0.01  },
      { envKey: 'e', len: null  }
    ],
    'ど': [
      { envKey: 'd', len: 0.01  },
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'ば': [
      { envKey: 'b', len: 0.025 },
      { envKey: 'a', len: null  }
    ],
    'び': [
      { envKey: 'b', len: 0.025 },
      { envKey: 'i', len: null  }
    ],
    'ぶ': [
      { envKey: 'b', len: 0.025 },
      { envKey: 'u', len: null  }
    ],
    'べ': [
      { envKey: 'b', len: 0.025 },
      { envKey: 'e', len: null  }
    ],
    'ぼ': [
      { envKey: 'b', len: 0.025 },
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'ぱ': [
      { envKey: 'p', len: 0.005 },
      { envKey: 'a', len: null  }
    ],
    'ぴ': [
      { envKey: 'p', len: 0.005 },
      { envKey: 'i', len: null  }
    ],
    'ぷ': [
      { envKey: 'p', len: 0.005 },
      { envKey: 'u', len: null  }
    ],
    'ぺ': [
      { envKey: 'p', len: 0.005 },
      { envKey: 'e', len: null  }
    ],
    'ぽ': [
      { envKey: 'p', len: 0.005 },
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'ゔぁ': [
      { envKey: 'v', len: 0.03  },
      { envKey: 'a', len: null  }
    ],
    'ゔぃ': [
      { envKey: 'v', len: 0.03  },
      { envKey: 'i', len: null  }
    ],
    'ゔ': [
      { envKey: 'v', len: 0.03  },
      { envKey: 'u', len: null  }
    ],
    'ゔぇ': [
      { envKey: 'v', len: 0.03  },
      { envKey: 'e', len: null  }
    ],
    'ゔぉ': [
      { envKey: 'v', len: 0.03  },
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'きゃ': [
      { envKey: 'k', len: 0.03  },
      { envKey: 'y', len: 0.02  },
      { envKey: 'a', len: null  }
    ],
    'きゅ': [
      { envKey: 'k', len: 0.03  },
      { envKey: 'y', len: 0.02  },
      { envKey: 'u', len: null  }
    ],
    'きぇ': [
      { envKey: 'k', len: 0.03  },
      { envKey: 'y', len: 0.02  },
      { envKey: 'e', len: null  }
    ],
    'きょ': [
      { envKey: 'k', len: 0.03  },
      { envKey: 'y', len: 0.02  },
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'しゃ': [
      { envKey: 's', len: 0.03  },
      { envKey: 'y', len: 0.02  },
      { envKey: 'a', len: null  }
    ],
    'すぃ': [
      { envKey: 's', len: 0.03  },
      { envKey: 'y', len: 0.02  },
      { envKey: 'i', len: null  }
    ],
    'しゅ': [
      { envKey: 's', len: 0.03  },
      { envKey: 'y', len: 0.02  },
      { envKey: 'u', len: null  }
    ],
    'しぇ': [
      { envKey: 's', len: 0.03  },
      { envKey: 'y', len: 0.02  },
      { envKey: 'e', len: null  }
    ],
    'しょ': [
      { envKey: 's', len: 0.03  },
      { envKey: 'y', len: 0.02  },
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'ちゃ': [
      { envKey: 't', len: 0.03  },
      { envKey: 'y', len: 0.02  },
      { envKey: 'a', len: null  }
    ],
    'ちゅ': [
      { envKey: 't', len: 0.03  },
      { envKey: 'y', len: 0.02  },
      { envKey: 'u', len: null  }
    ],
    'ちぇ': [
      { envKey: 't', len: 0.03  },
      { envKey: 'y', len: 0.02  },
      { envKey: 'e', len: null  }
    ],
    'ちょ': [
      { envKey: 't', len: 0.03  },
      { envKey: 'y', len: 0.02  },
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'つぁ': [
      { envKey: 't', len: 0.03  },
      { envKey: 'u', len: 0.02  },
      { envKey: 'a', len: null  }
    ],
    'つぃ': [
      { envKey: 't', len: 0.03  },
      { envKey: 'u', len: 0.02  },
      { envKey: 'i', len: null  }
    ],
    'とぅ': [
      { envKey: 't', len: 0.03  },
      { envKey: 'u', len: 0.02  },
      { envKey: 'u', len: null  }
    ],
    'つぇ': [
      { envKey: 't', len: 0.03  },
      { envKey: 'u', len: 0.02  },
      { envKey: 'e', len: null  }
    ],
    'つぉ': [
      { envKey: 't', len: 0.03  },
      { envKey: 'u', len: 0.02  },
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'てゃ': [
      { envKey: 't', len: 0.03  },
      { envKey: 'e', len: 0.01  },
      { envKey: 'y', len: 0.01  },
      { envKey: 'a', len: null  }
    ],
    'てぃ': [
      { envKey: 't', len: 0.03  },
      { envKey: 'e', len: 0.01  },
      { envKey: 'y', len: 0.01  },
      { envKey: 'i', len: null  }
    ],
    'てゅ': [
      { envKey: 't', len: 0.03  },
      { envKey: 'e', len: 0.01  },
      { envKey: 'y', len: 0.01  },
      { envKey: 'u', len: null  }
    ],
    'てょ': [
      { envKey: 't', len: 0.03  },
      { envKey: 'e', len: 0.01  },
      { envKey: 'y', len: 0.01  },
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'にゃ': [
      { envKey: 'n', len: 0.03  },
      { envKey: 'y', len: 0.02  },
      { envKey: 'a', len: null  }
    ],
    'にゅ': [
      { envKey: 'n', len: 0.03  },
      { envKey: 'y', len: 0.02  },
      { envKey: 'u', len: null  }
    ],
    'にぇ': [
      { envKey: 'n', len: 0.03  },
      { envKey: 'y', len: 0.02  },
      { envKey: 'e', len: null  }
    ],
    'にょ': [
      { envKey: 'n', len: 0.03  },
      { envKey: 'y', len: 0.02  },
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'ひゃ': [
      { envKey: 'h', len: 0.015 },
      { envKey: 'y', len: 0.02  },
      { envKey: 'a', len: null  }
    ],
    'ひゅ': [
      { envKey: 'h', len: 0.015 },
      { envKey: 'y', len: 0.02  },
      { envKey: 'u', len: null  }
    ],
    'ひぇ': [
      { envKey: 'h', len: 0.015 },
      { envKey: 'y', len: 0.02  },
      { envKey: 'e', len: null  }
    ],
    'ひょ': [
      { envKey: 'h', len: 0.015 },
      { envKey: 'y', len: 0.02  },
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'みゃ': [
      { envKey: 'm', len: 0.015 },
      { envKey: 'y', len: 0.02  },
      { envKey: 'a', len: null  }
    ],
    'みゅ': [
      { envKey: 'm', len: 0.015 },
      { envKey: 'y', len: 0.02  },
      { envKey: 'u', len: null  }
    ],
    'みぇ': [
      { envKey: 'm', len: 0.015 },
      { envKey: 'y', len: 0.02  },
      { envKey: 'e', len: null  }
    ],
    'みょ': [
      { envKey: 'm', len: 0.015 },
      { envKey: 'y', len: 0.02  },
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'りゃ': [
      { envKey: 'r', len: 0.015 },
      { envKey: 'y', len: 0.02  },
      { envKey: 'a', len: null  }
    ],
    'りゅ': [
      { envKey: 'r', len: 0.015 },
      { envKey: 'y', len: 0.02  },
      { envKey: 'u', len: null  }
    ],
    'りぇ': [
      { envKey: 'r', len: 0.015 },
      { envKey: 'y', len: 0.02  },
      { envKey: 'e', len: null  }
    ],
    'りょ': [
      { envKey: 'r', len: 0.015 },
      { envKey: 'y', len: 0.02  },
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'ぎゃ': [
      { envKey: 'g', len: 0.015 },
      { envKey: 'y', len: 0.02  },
      { envKey: 'a', len: null  }
    ],
    'ぎゅ': [
      { envKey: 'g', len: 0.015 },
      { envKey: 'y', len: 0.02  },
      { envKey: 'u', len: null  }
    ],
    'ぎぇ': [
      { envKey: 'g', len: 0.015 },
      { envKey: 'y', len: 0.02  },
      { envKey: 'e', len: null  }
    ],
    'ぎょ': [
      { envKey: 'g', len: 0.015 },
      { envKey: 'y', len: 0.02  },
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'じゃ': [
      { envKey: 'z', len: 0.03  },
      { envKey: 'y', len: 0.02  },
      { envKey: 'a', len: null  }
    ],
    'ずぃ': [
      { envKey: 'z', len: 0.03  },
      { envKey: 'y', len: 0.02  },
      { envKey: 'i', len: null  }
    ],
    'じゅ': [
      { envKey: 'z', len: 0.03  },
      { envKey: 'y', len: 0.02  },
      { envKey: 'u', len: null  }
    ],
    'じぇ': [
      { envKey: 'z', len: 0.03  },
      { envKey: 'i', len: 0.02  },
      { envKey: 'e', len: null  }
    ],
    'じょ': [
      { envKey: 'z', len: 0.03  },
      { envKey: 'y', len: 0.02  },
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'でゃ': [
      { envKey: 'd', len: 0.025 },
      { envKey: 'y', len: 0.02  },
      { envKey: 'a', len: null  }
    ],
    'でゅ': [
      { envKey: 'd', len: 0.025 },
      { envKey: 'y', len: 0.02  },
      { envKey: 'u', len: null  }
    ],
    'でょ': [
      { envKey: 'd', len: 0.025 },
      { envKey: 'y', len: 0.02  },
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'びゃ': [
      { envKey: 'b', len: 0.03  },
      { envKey: 'y', len: 0.02  },
      { envKey: 'a', len: null  }
    ],
    'びゅ': [
      { envKey: 'b', len: 0.03  },
      { envKey: 'y', len: 0.02  },
      { envKey: 'u', len: null  }
    ],
    'びぇ': [
      { envKey: 'b', len: 0.03  },
      { envKey: 'y', len: 0.02  },
      { envKey: 'e', len: null  }
    ],
    'びょ': [
      { envKey: 'b', len: 0.03  },
      { envKey: 'y', len: 0.02  },
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'ぴゃ': [
      { envKey: 'p', len: 0.015 },
      { envKey: 'y', len: 0.02  },
      { envKey: 'a', len: null  }
    ],
    'ぴゅ': [
      { envKey: 'p', len: 0.015 },
      { envKey: 'y', len: 0.02  },
      { envKey: 'u', len: null  }
    ],
    'ぴぇ': [
      { envKey: 'p', len: 0.015 },
      { envKey: 'y', len: 0.02  },
      { envKey: 'e', len: null  }
    ],
    'ぴょ': [
      { envKey: 'p', len: 0.015 },
      { envKey: 'y', len: 0.02  },
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'ふぁ': [
      { envKey: 'h', len: 0.015 },
      { envKey: 'u', len: 0.02  },
      { envKey: 'a', len: null  }
    ],
    'ふぃ': [
      { envKey: 'h', len: 0.015 },
      { envKey: 'u', len: 0.02  },
      { envKey: 'i', len: null  }
    ],
    'ふぇ': [
      { envKey: 'h', len: 0.015 },
      { envKey: 'u', len: 0.02  },
      { envKey: 'e', len: null  }
    ],
    'ふぉ': [
      { envKey: 'h', len: 0.015 },
      { envKey: 'u', len: 0.02  },
      { envKey: 'o', len: null  }
    ],

    /* ================ */

    'いぇ': [
      { envKey: 'i', len: 0.03  },
      { envKey: 'y', len: 0.02  },
      { envKey: 'e', len: null  }
    ],

    /* ================ */

    'くゎ': [
      { envKey: 'k', len: 0.03  },
      { envKey: 'w', len: 0.02  },
      { envKey: 'a', len: null  }
    ],
    'ぐゎ': [
      { envKey: 'g', len: 0.03  },
      { envKey: 'w', len: 0.02  },
      { envKey: 'a', len: null  }
    ],

    /* ================ */

    'っ': [
      { envKey: 'q', len: null  }
    ],
    '、': [
      { envKey: 'q', len: null  }
    ]
  }
}
