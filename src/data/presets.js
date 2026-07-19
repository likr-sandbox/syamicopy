import kaeruNotes from './presets/kaeru.json';
import sakuraNotes from './presets/sakura.json';
import tulipNotes from './presets/tulip.json';
import kirakiraNotes from './presets/kirakira.json';
import kojounotsukiNotes from './presets/kojounotsuki.json';
import furusatoNotes from './presets/furusato.json';
import momotaroNotes from './presets/momotaro.json';
import zousanNotes from './presets/zousan.json';
import konomichiNotes from './presets/konomichi.json';
import akatomboNotes from './presets/akatombo.json';

export const PRESETS = {
  kaeru: {
    name: 'かえるの合唱',
    composer: 'ドイツ民謡',
    memo: 'かえるのうたが きこえてくるよ。輪唱で演奏するのもおすすめです。',
    tuning: 'honchoshi',
    basePitch: 48,
    timeSignature: { numerator: 4, denominator: 4 },
    bpm: 120,
    measureCount: 8,
    notes: kaeruNotes.map((note, index) => ({ id: `kaeru-${index + 1}`, ...note }))
  },
  sakura: {
    name: 'さくらさくら',
    composer: '日本古謡',
    memo: '日本の代表的な歌曲です。本調子のチューニングで美しく響きます。',
    tuning: 'honchoshi',
    basePitch: 48,
    timeSignature: { numerator: 4, denominator: 4 },
    bpm: 72,
    measureCount: 14,
    notes: sakuraNotes.map((note, index) => ({ id: `sakura-${index + 1}`, ...note }))
  },
  tulip: {
    name: 'チューリップ',
    composer: '井上武士',
    memo: '「さいた さいた チューリップの花が...」有名な童謡です。',
    tuning: 'honchoshi',
    basePitch: 48,
    timeSignature: { numerator: 4, denominator: 4 },
    bpm: 110,
    measureCount: 12,
    notes: tulipNotes.map((note, index) => ({ id: `tulip-${index + 1}`, ...note }))
  },
  kirakira: {
    name: 'きらきら星',
    composer: 'フランス民謡',
    memo: '世界中で親しまれている童謡です。ピアノロールでの編集の基本として最適です。',
    tuning: 'honchoshi',
    basePitch: 48,
    timeSignature: { numerator: 4, denominator: 4 },
    bpm: 100,
    measureCount: 12,
    notes: kirakiraNotes.map((note, index) => ({ id: `kirakira-${index + 1}`, ...note }))
  },
  kojounotsuki: {
    name: '荒城の月',
    composer: '滝廉太郎',
    memo: '哀愁を帯びたメロディを、伝統的な都節音階（ミヤコブシ）で三味線向けにアレンジしています。',
    tuning: 'honchoshi',
    basePitch: 48,
    timeSignature: { numerator: 4, denominator: 4 },
    bpm: 72,
    measureCount: 16,
    notes: kojounotsukiNotes.map((note, index) => ({ id: `kojo-${index + 1}`, ...note }))
  },
  furusato: {
    name: 'ふるさと',
    composer: '岡野貞一',
    memo: '「兎追いし かの山...」3/4拍子の穏やかな伝統曲です。',
    tuning: 'honchoshi',
    basePitch: 48,
    timeSignature: { numerator: 3, denominator: 4 },
    bpm: 88,
    measureCount: 16,
    notes: furusatoNotes.map((note, index) => ({ id: `furu-${index + 1}`, ...note }))
  },
  momotaro: {
    name: '桃太郎',
    composer: '岡野貞一',
    memo: '「桃太郎さん、桃太郎さん、お腰につけたきびだんご...」2/4拍子の活気ある童謡です。',
    tuning: 'honchoshi',
    basePitch: 48,
    timeSignature: { numerator: 2, denominator: 4 },
    bpm: 110,
    measureCount: 8,
    notes: momotaroNotes.map((note, index) => ({ id: `momo-${index + 1}`, ...note }))
  },
  zousan: {
    name: 'ぞうさん',
    composer: '團伊玖磨',
    memo: '「ぞうさん ぞうさん お鼻が長いのね...」2/4拍子のやさしい童謡です。',
    tuning: 'honchoshi',
    basePitch: 48,
    timeSignature: { numerator: 2, denominator: 4 },
    bpm: 90,
    measureCount: 6,
    notes: zousanNotes.map((note, index) => ({ id: `zou-${index + 1}`, ...note }))
  },
  konomichi: {
    name: 'この道',
    composer: '山田耕筰',
    memo: '北原白秋作詞、山田耕筰作曲の有名な歌曲です。テンポをゆったり弾いてください。',
    tuning: 'honchoshi',
    basePitch: 48,
    timeSignature: { numerator: 4, denominator: 4 },
    bpm: 76,
    measureCount: 8,
    notes: konomichiNotes.map((note, index) => ({ id: `michi-${index + 1}`, ...note }))
  },
  akatombo: {
    name: '赤とんぼ',
    composer: '山田耕筰',
    memo: '「夕焼小焼の 赤とんぼ...」懐かしい日本の秋を歌った情緒あふれる3/4拍子の童謡です。',
    tuning: 'honchoshi',
    basePitch: 48,
    timeSignature: { numerator: 3, denominator: 4 },
    bpm: 80,
    measureCount: 16,
    notes: akatomboNotes.map((note, index) => ({ id: `tombo-${index + 1}`, ...note }))
  }
};
