import akatomboNotes from './presets/akatombo.json';
import furusatoNotes from './presets/furusato.json';
import kaeruNotes from './presets/kaeru.json';
import kirakiraNotes from './presets/kirakira.json';
import kojounotsukiNotes from './presets/kojounotsuki.json';
import konomichiNotes from './presets/konomichi.json';
import momotaroNotes from './presets/momotaro.json';
import sakuraNotes from './presets/sakura.json';
import tulipNotes from './presets/tulip.json';
import zousanNotes from './presets/zousan.json';

export const PRESETS = {
  kaeru: {
    name: 'かえるの合唱',
    composer: 'ドイツ民謡 / 岡本敏明',
    memo: 'ドイツの輪唱歌曲（原題: Der Froschgesang）をもとに岡本敏明が日本語詞をつけた文部省唱歌。',
    tuning: 'honchoshi',
    basePitch: 60,
    timeSignature: { numerator: 4, denominator: 4 },
    bpm: 120,
    measureCount: 8,
    notes: kaeruNotes.map((note, index) => ({
      id: `kaeru-${index + 1}`,
      ...note
    }))
  },
  sakura: {
    name: 'さくらさくら',
    composer: '日本古謡',
    memo: '幕末の江戸で成立した箏曲をもとに明治時代に唱歌として編纂された代表的日本古謡。都節音階（陰旋法）により三味線の三本の糸を横断して開放弦と2・3のツボで美しく奏でられます。',
    tuning: 'honchoshi',
    basePitch: 57,
    timeSignature: { numerator: 4, denominator: 4 },
    bpm: 72,
    measureCount: 14,
    notes: sakuraNotes.map((note, index) => ({
      id: `sakura-${index + 1}`,
      ...note
    }))
  },
  tulip: {
    name: 'チューリップ',
    composer: '井上武士 / 近藤宮子',
    memo: '昭和7年に『エホンショウガ（二）』に掲載された童謡。明るく素朴なペンタトニック旋律が特徴です。',
    tuning: 'honchoshi',
    basePitch: 60,
    timeSignature: { numerator: 4, denominator: 4 },
    bpm: 110,
    measureCount: 12,
    notes: tulipNotes.map((note, index) => ({
      id: `tulip-${index + 1}`,
      ...note
    }))
  },
  kirakira: {
    name: 'きらきら星',
    composer: 'フランス民謡 / 武鹿悦子',
    memo: '18世紀のフランス民謡「ああ、お母さん聞いて」をもとに世界中で愛唱される童謡。三部形式（A-B-A）の明快な構成です。',
    tuning: 'honchoshi',
    basePitch: 60,
    timeSignature: { numerator: 4, denominator: 4 },
    bpm: 100,
    measureCount: 12,
    notes: kirakiraNotes.map((note, index) => ({
      id: `kirakira-${index + 1}`,
      ...note
    }))
  },
  kojounotsuki: {
    name: '荒城の月',
    composer: '滝廉太郎 / 山田耕筰 / 土井晩翠',
    memo: '明治34年に滝廉太郎が作曲し、のちに山田耕筰が伝統的な都節音階（ミヤコブシ）の16小節歌曲に編曲・補作した名曲。一の糸・二の糸・三の糸の豊かな響きを活かして演奏します。',
    tuning: 'honchoshi',
    basePitch: 57,
    timeSignature: { numerator: 4, denominator: 4 },
    bpm: 72,
    measureCount: 16,
    notes: kojounotsukiNotes.map((note, index) => ({
      id: `kojo-${index + 1}`,
      ...note
    }))
  },
  furusato: {
    name: '故郷',
    composer: '岡野貞一 / 高野辰之',
    memo: '大正3年に『尋常小学唱歌（第六学年用）』で発表された文部省唱歌。優美な3拍子のリズムと情感あふれる旋律が郷愁を誘います。',
    tuning: 'honchoshi',
    basePitch: 60,
    timeSignature: { numerator: 3, denominator: 4 },
    bpm: 80,
    measureCount: 16,
    notes: furusatoNotes.map((note, index) => ({
      id: `furu-${index + 1}`,
      ...note
    }))
  },
  momotaro: {
    name: '桃太郎',
    composer: '岡野貞一 / 文部省唱歌',
    memo: '明治44年に『尋常小学唱歌（第一学年用）』に収載された唱歌。「桃太郎さん」「お腰につけた」「一つわたしに」の全3節（12小節）の公式原曲譜です。',
    tuning: 'niagari',
    basePitch: 60,
    timeSignature: { numerator: 2, denominator: 4 },
    bpm: 110,
    measureCount: 12,
    notes: momotaroNotes.map((note, index) => ({
      id: `momo-${index + 1}`,
      ...note
    }))
  },
  zousan: {
    name: 'ぞうさん',
    composer: '團伊玖磨 / まど・みちお',
    memo: '昭和27年に團伊玖磨がNHKラジオ『幼児の時間』のために作曲した3拍子（ワルツ）の代表的童謡。三味線の全開放弦（G-C-G）が響く開放的な記譜構成です。',
    tuning: 'honchoshi',
    basePitch: 55,
    timeSignature: { numerator: 3, denominator: 4 },
    bpm: 95,
    measureCount: 8,
    notes: zousanNotes.map((note, index) => ({
      id: `zou-${index + 1}`,
      ...note
    }))
  },
  akatombo: {
    name: '赤とんぼ',
    composer: '山田耕筰 / 三木露風',
    memo: '三木露風の詩に山田耕筰が大正時代に曲をつけた日本歌曲の至宝。3拍子の全16小節（1番・2番の通し構成）で三味線向けに美しく奏でられます。',
    tuning: 'honchoshi',
    basePitch: 55,
    timeSignature: { numerator: 3, denominator: 4 },
    bpm: 72,
    measureCount: 16,
    notes: akatomboNotes.map((note, index) => ({
      id: `tombo-${index + 1}`,
      ...note
    }))
  },
  konomichi: {
    name: 'この道',
    composer: '山田耕筰 / 北原白秋',
    memo: '北原白秋の詩に山田耕筰が作曲した歌曲。3拍子（弱起）による全10小節の構成で「あかしやの花が咲いてる」の結びまで忠実に採譜されています。',
    tuning: 'honchoshi',
    basePitch: 55,
    timeSignature: { numerator: 3, denominator: 4 },
    bpm: 60,
    measureCount: 10,
    notes: konomichiNotes.map((note, index) => ({
      id: `michi-${index + 1}`,
      ...note
    }))
  }
};
