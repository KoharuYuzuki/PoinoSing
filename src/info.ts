import { version } from '../package.json'
// @ts-ignore
import license from '../LICENSE' with { type: 'text' }
// @ts-ignore
import thirdPartyNotices from '../ThirdPartyNotices.txt'
// @ts-ignore
import qa from '../Q&A.txt'

export default {
  appName: 'PoinoSing',
  version: `v${version}`,
  license: license as string,
  licenseQAUrl: 'https://github.com/KoharuYuzuki/PoinoTalkLicence?tab=readme-ov-file#qa',
  thirdPartyNotices: thirdPartyNotices as string,
  qa: qa as string,
  qaUrl: 'https://github.com/KoharuYuzuki/PoinoSing/blob/main/Q&A.txt',
  minWidthPx: 900,
  minHeightPx: 700
}
