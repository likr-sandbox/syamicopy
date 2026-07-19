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
    notes: [
      { id: 'kaeru-1', pitch: 60, step: 0, length: 4 }, // C4
      { id: 'kaeru-2', pitch: 62, step: 4, length: 4 }, // D4
      { id: 'kaeru-3', pitch: 64, step: 8, length: 4 }, // E4
      { id: 'kaeru-4', pitch: 65, step: 12, length: 4 }, // F4
      { id: 'kaeru-5', pitch: 64, step: 16, length: 4 }, // E4
      { id: 'kaeru-6', pitch: 62, step: 20, length: 4 }, // D4
      { id: 'kaeru-7', pitch: 60, step: 24, length: 4 }, // C4
      // rest step 28-31

      { id: 'kaeru-8', pitch: 64, step: 32, length: 4 }, // E4
      { id: 'kaeru-9', pitch: 65, step: 36, length: 4 }, // F4
      { id: 'kaeru-10', pitch: 67, step: 40, length: 4 }, // G4
      { id: 'kaeru-11', pitch: 69, step: 44, length: 4 }, // A4
      { id: 'kaeru-12', pitch: 67, step: 48, length: 4 }, // G4
      { id: 'kaeru-13', pitch: 65, step: 52, length: 4 }, // F4
      { id: 'kaeru-14', pitch: 64, step: 56, length: 4 }, // E4
      // rest step 60-63

      { id: 'kaeru-15', pitch: 60, step: 64, length: 4 }, // C4
      { id: 'kaeru-16', pitch: 60, step: 72, length: 4 }, // C4
      { id: 'kaeru-17', pitch: 60, step: 80, length: 4 }, // C4
      { id: 'kaeru-18', pitch: 60, step: 88, length: 4 }, // C4

      { id: 'kaeru-19', pitch: 60, step: 96, length: 2 }, // C4 (8th)
      { id: 'kaeru-20', pitch: 60, step: 98, length: 2 }, // C4
      { id: 'kaeru-21', pitch: 62, step: 100, length: 2 }, // D4
      { id: 'kaeru-22', pitch: 62, step: 102, length: 2 }, // D4
      { id: 'kaeru-23', pitch: 64, step: 104, length: 2 }, // E4
      { id: 'kaeru-24', pitch: 64, step: 106, length: 2 }, // E4
      { id: 'kaeru-25', pitch: 65, step: 108, length: 2 }, // F4
      { id: 'kaeru-26', pitch: 65, step: 110, length: 2 }, // F4

      { id: 'kaeru-27', pitch: 64, step: 112, length: 4 }, // E4
      { id: 'kaeru-28', pitch: 62, step: 116, length: 4 }, // D4
      { id: 'kaeru-29', pitch: 60, step: 120, length: 4 } // C4
    ]
  },
  sakura: {
    name: 'さくらさくら',
    composer: '日本古謡',
    memo: '日本の代表的な歌曲です。本調子のチューニングで美しく響きます。',
    tuning: 'honchoshi',
    basePitch: 48,
    timeSignature: { numerator: 4, denominator: 4 },
    bpm: 80,
    measureCount: 14,
    notes: [
      { id: 'sakura-1', pitch: 69, step: 0, length: 4 }, // A4
      { id: 'sakura-2', pitch: 69, step: 4, length: 4 }, // A4
      { id: 'sakura-3', pitch: 71, step: 8, length: 8 }, // B4
      { id: 'sakura-4', pitch: 69, step: 16, length: 4 }, // A4
      { id: 'sakura-5', pitch: 69, step: 20, length: 4 }, // A4
      { id: 'sakura-6', pitch: 71, step: 24, length: 8 }, // B4

      { id: 'sakura-7', pitch: 69, step: 32, length: 4 }, // A4
      { id: 'sakura-8', pitch: 71, step: 36, length: 4 }, // B4
      { id: 'sakura-9', pitch: 72, step: 40, length: 4 }, // C5
      { id: 'sakura-10', pitch: 71, step: 44, length: 4 }, // B4
      { id: 'sakura-11', pitch: 69, step: 48, length: 4 }, // A4
      { id: 'sakura-12', pitch: 65, step: 52, length: 4 }, // F4
      { id: 'sakura-13', pitch: 64, step: 56, length: 8 }, // E4

      { id: 'sakura-14', pitch: 60, step: 64, length: 4 }, // C4
      { id: 'sakura-15', pitch: 64, step: 68, length: 4 }, // E4
      { id: 'sakura-16', pitch: 65, step: 72, length: 8 }, // F4
      { id: 'sakura-17', pitch: 64, step: 80, length: 4 }, // E4
      { id: 'sakura-18', pitch: 60, step: 84, length: 4 }, // C4
      { id: 'sakura-19', pitch: 59, step: 88, length: 8 }, // B3

      { id: 'sakura-20', pitch: 69, step: 96, length: 4 }, // A4
      { id: 'sakura-21', pitch: 69, step: 100, length: 4 }, // A4
      { id: 'sakura-22', pitch: 71, step: 104, length: 8 }, // B4
      { id: 'sakura-23', pitch: 69, step: 112, length: 4 }, // A4
      { id: 'sakura-24', pitch: 69, step: 116, length: 4 }, // A4
      { id: 'sakura-25', pitch: 71, step: 120, length: 8 }, // B4

      { id: 'sakura-26', pitch: 64, step: 128, length: 4 }, // E4
      { id: 'sakura-27', pitch: 65, step: 132, length: 4 }, // F4
      { id: 'sakura-28', pitch: 69, step: 136, length: 4 }, // A4
      { id: 'sakura-29', pitch: 71, step: 140, length: 4 }, // B4
      { id: 'sakura-30', pitch: 69, step: 144, length: 4 }, // A4
      { id: 'sakura-31', pitch: 65, step: 148, length: 4 }, // F4
      { id: 'sakura-32', pitch: 64, step: 152, length: 8 }, // E4

      { id: 'sakura-33', pitch: 60, step: 160, length: 4 }, // C4
      { id: 'sakura-34', pitch: 64, step: 164, length: 4 }, // E4
      { id: 'sakura-35', pitch: 65, step: 168, length: 8 }, // F4
      { id: 'sakura-36', pitch: 64, step: 176, length: 4 }, // E4
      { id: 'sakura-37', pitch: 60, step: 180, length: 4 }, // C4
      { id: 'sakura-38', pitch: 59, step: 184, length: 8 }, // B3

      { id: 'sakura-39', pitch: 69, step: 192, length: 4 }, // A4
      { id: 'sakura-40', pitch: 69, step: 196, length: 4 }, // A4
      { id: 'sakura-41', pitch: 71, step: 200, length: 8 }, // B4
      { id: 'sakura-42', pitch: 69, step: 208, length: 4 }, // A4
      { id: 'sakura-43', pitch: 69, step: 212, length: 4 }, // A4
      { id: 'sakura-44', pitch: 71, step: 216, length: 8 } // B4
    ]
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
    notes: [
      { id: 'tulip-1', pitch: 60, step: 0, length: 4 }, // C4
      { id: 'tulip-2', pitch: 62, step: 4, length: 4 }, // D4
      { id: 'tulip-3', pitch: 64, step: 8, length: 8 }, // E4

      { id: 'tulip-4', pitch: 60, step: 16, length: 4 }, // C4
      { id: 'tulip-5', pitch: 62, step: 20, length: 4 }, // D4
      { id: 'tulip-6', pitch: 64, step: 24, length: 8 }, // E4

      { id: 'tulip-7', pitch: 67, step: 32, length: 4 }, // G4
      { id: 'tulip-8', pitch: 64, step: 36, length: 4 }, // E4
      { id: 'tulip-9', pitch: 62, step: 40, length: 4 }, // D4
      { id: 'tulip-10', pitch: 60, step: 44, length: 4 }, // C4

      { id: 'tulip-11', pitch: 62, step: 48, length: 4 }, // D4
      { id: 'tulip-12', pitch: 64, step: 52, length: 4 }, // E4
      { id: 'tulip-13', pitch: 62, step: 56, length: 8 }, // D4

      { id: 'tulip-14', pitch: 60, step: 64, length: 4 }, // C4
      { id: 'tulip-15', pitch: 62, step: 68, length: 4 }, // D4
      { id: 'tulip-16', pitch: 64, step: 72, length: 8 }, // E4

      { id: 'tulip-17', pitch: 60, step: 80, length: 4 }, // C4
      { id: 'tulip-18', pitch: 62, step: 84, length: 4 }, // D4
      { id: 'tulip-19', pitch: 64, step: 88, length: 8 }, // E4

      { id: 'tulip-20', pitch: 67, step: 96, length: 4 }, // G4
      { id: 'tulip-21', pitch: 64, step: 100, length: 4 }, // E4
      { id: 'tulip-22', pitch: 62, step: 104, length: 4 }, // D4
      { id: 'tulip-23', pitch: 60, step: 108, length: 4 }, // C4

      { id: 'tulip-24', pitch: 62, step: 112, length: 4 }, // D4
      { id: 'tulip-25', pitch: 64, step: 116, length: 4 }, // E4
      { id: 'tulip-26', pitch: 60, step: 120, length: 8 }, // C4

      { id: 'tulip-27', pitch: 67, step: 128, length: 4 }, // G4
      { id: 'tulip-28', pitch: 67, step: 132, length: 4 }, // G4
      { id: 'tulip-29', pitch: 64, step: 136, length: 4 }, // E4
      { id: 'tulip-30', pitch: 67, step: 140, length: 4 }, // G4

      { id: 'tulip-31', pitch: 69, step: 144, length: 4 }, // A4
      { id: 'tulip-32', pitch: 69, step: 148, length: 4 }, // A4
      { id: 'tulip-33', pitch: 67, step: 152, length: 8 }, // G4

      { id: 'tulip-34', pitch: 64, step: 160, length: 4 }, // E4
      { id: 'tulip-35', pitch: 64, step: 164, length: 4 }, // E4
      { id: 'tulip-36', pitch: 62, step: 168, length: 4 }, // D4
      { id: 'tulip-37', pitch: 62, step: 172, length: 4 }, // D4

      { id: 'tulip-38', pitch: 60, step: 176, length: 16 } // C4
    ]
  },
  kirakira: {
    name: 'きらきら星',
    composer: 'フランス民謡',
    memo: '世界中で親しまれている童謡です。ピアノロールでの編集の基本として最適です。',
    tuning: 'honchoshi',
    basePitch: 48,
    timeSignature: { numerator: 4, denominator: 4 },
    bpm: 100,
    measureCount: 8,
    notes: [
      { id: 'kirakira-1', pitch: 60, step: 0, length: 4 }, // C4
      { id: 'kirakira-2', pitch: 60, step: 4, length: 4 }, // C4
      { id: 'kirakira-3', pitch: 67, step: 8, length: 4 }, // G4
      { id: 'kirakira-4', pitch: 67, step: 12, length: 4 }, // G4
      { id: 'kirakira-5', pitch: 69, step: 16, length: 4 }, // A4
      { id: 'kirakira-6', pitch: 69, step: 20, length: 4 }, // A4
      { id: 'kirakira-7', pitch: 67, step: 24, length: 8 }, // G4

      { id: 'kirakira-8', pitch: 65, step: 32, length: 4 }, // F4
      { id: 'kirakira-9', pitch: 65, step: 36, length: 4 }, // F4
      { id: 'kirakira-10', pitch: 64, step: 40, length: 4 }, // E4
      { id: 'kirakira-11', pitch: 64, step: 44, length: 4 }, // E4
      { id: 'kirakira-12', pitch: 62, step: 48, length: 4 }, // D4
      { id: 'kirakira-13', pitch: 62, step: 52, length: 4 }, // D4
      { id: 'kirakira-14', pitch: 60, step: 56, length: 8 }, // C4

      { id: 'kirakira-15', pitch: 67, step: 64, length: 4 }, // G4
      { id: 'kirakira-16', pitch: 67, step: 68, length: 4 }, // G4
      { id: 'kirakira-17', pitch: 65, step: 72, length: 4 }, // F4
      { id: 'kirakira-18', pitch: 65, step: 76, length: 4 }, // F4
      { id: 'kirakira-19', pitch: 64, step: 80, length: 4 }, // E4
      { id: 'kirakira-20', pitch: 64, step: 84, length: 4 }, // E4
      { id: 'kirakira-21', pitch: 62, step: 88, length: 8 }, // D4

      { id: 'kirakira-22', pitch: 67, step: 96, length: 4 }, // G4
      { id: 'kirakira-23', pitch: 67, step: 100, length: 4 }, // G4
      { id: 'kirakira-24', pitch: 65, step: 104, length: 4 }, // F4
      { id: 'kirakira-25', pitch: 65, step: 108, length: 4 }, // F4
      { id: 'kirakira-26', pitch: 64, step: 112, length: 4 }, // E4
      { id: 'kirakira-27', pitch: 64, step: 116, length: 4 }, // E4
      { id: 'kirakira-28', pitch: 62, step: 120, length: 8 } // D4
    ]
  },
  kojounotsuki: {
    name: '荒城の月',
    composer: '滝廉太郎',
    memo: '哀愁を帯びたメロディを、伝統的な都節音階（ミヤコブシ）で三味線向けにアレンジしています。',
    tuning: 'honchoshi',
    basePitch: 48,
    timeSignature: { numerator: 4, denominator: 4 },
    bpm: 72,
    measureCount: 8,
    notes: [
      { id: 'kojo-1', pitch: 59, step: 0, length: 4 }, // B3 (String 1, Tsubo '5')
      { id: 'kojo-2', pitch: 64, step: 4, length: 4 }, // E4 (String 2, Tsubo '#')
      { id: 'kojo-3', pitch: 66, step: 8, length: 4 }, // F#4 (String 2, Tsubo '5')
      { id: 'kojo-4', pitch: 67, step: 12, length: 4 }, // G4 (String 2, Tsubo '6')
      { id: 'kojo-5', pitch: 60, step: 16, length: 4 }, // C4 (String 2, Tsubo '0')
      { id: 'kojo-6', pitch: 55, step: 20, length: 4 }, // G3 (String 1, Tsubo '2')
      { id: 'kojo-7', pitch: 54, step: 24, length: 8 }, // F#3 (String 1, Tsubo '1')

      { id: 'kojo-8', pitch: 54, step: 32, length: 4 }, // F#3
      { id: 'kojo-9', pitch: 55, step: 36, length: 4 }, // G3
      { id: 'kojo-10', pitch: 52, step: 40, length: 4 }, // E3 (String 0, Tsubo '#')
      { id: 'kojo-11', pitch: 48, step: 44, length: 4 }, // C3 (String 0, Tsubo '0')
      { id: 'kojo-12', pitch: 52, step: 48, length: 8 }, // E3
      // rest step 56-63

      { id: 'kojo-13', pitch: 59, step: 64, length: 4 }, // B3
      { id: 'kojo-14', pitch: 64, step: 68, length: 4 }, // E4
      { id: 'kojo-15', pitch: 66, step: 72, length: 4 }, // F#4
      { id: 'kojo-16', pitch: 67, step: 76, length: 4 }, // G4
      { id: 'kojo-17', pitch: 60, step: 80, length: 4 }, // C4
      { id: 'kojo-18', pitch: 55, step: 84, length: 4 }, // G3
      { id: 'kojo-19', pitch: 54, step: 88, length: 8 }, // F#3

      { id: 'kojo-20', pitch: 54, step: 96, length: 4 }, // F#3
      { id: 'kojo-21', pitch: 55, step: 100, length: 4 }, // G3
      { id: 'kojo-22', pitch: 52, step: 104, length: 4 }, // E3
      { id: 'kojo-23', pitch: 48, step: 108, length: 4 }, // C3
      { id: 'kojo-24', pitch: 52, step: 112, length: 8 } // E3
    ]
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
    notes: [
      { id: 'furu-1', pitch: 60, step: 0, length: 4 }, // C4
      { id: 'furu-2', pitch: 60, step: 4, length: 4 }, // C4
      { id: 'furu-3', pitch: 60, step: 8, length: 4 }, // C4
      { id: 'furu-4', pitch: 62, step: 12, length: 8 }, // D4
      { id: 'furu-5', pitch: 62, step: 20, length: 4 }, // D4
      { id: 'furu-6', pitch: 64, step: 24, length: 4 }, // E4
      { id: 'furu-7', pitch: 62, step: 28, length: 4 }, // D4
      { id: 'furu-8', pitch: 64, step: 32, length: 4 }, // E4
      { id: 'furu-9', pitch: 65, step: 36, length: 12 }, // F4

      { id: 'furu-10', pitch: 64, step: 48, length: 4 }, // E4
      { id: 'furu-11', pitch: 64, step: 52, length: 4 }, // E4
      { id: 'furu-12', pitch: 64, step: 56, length: 4 }, // E4
      { id: 'furu-13', pitch: 65, step: 60, length: 8 }, // F4
      { id: 'furu-14', pitch: 65, step: 68, length: 4 }, // F4
      { id: 'furu-15', pitch: 67, step: 72, length: 4 }, // G4
      { id: 'furu-16', pitch: 65, step: 76, length: 4 }, // F4
      { id: 'furu-17', pitch: 67, step: 80, length: 4 }, // G4
      { id: 'furu-18', pitch: 69, step: 84, length: 12 }, // A4

      { id: 'furu-19', pitch: 69, step: 96, length: 4 }, // A4
      { id: 'furu-20', pitch: 69, step: 100, length: 4 }, // A4
      { id: 'furu-21', pitch: 67, step: 104, length: 4 }, // G4
      { id: 'furu-22', pitch: 69, step: 108, length: 8 }, // A4
      { id: 'furu-23', pitch: 69, step: 116, length: 4 }, // A4
      { id: 'furu-24', pitch: 67, step: 120, length: 4 }, // G4
      { id: 'furu-25', pitch: 64, step: 124, length: 4 }, // E4
      { id: 'furu-26', pitch: 60, step: 128, length: 4 }, // C4
      { id: 'furu-27', pitch: 62, step: 132, length: 12 }, // D4

      { id: 'furu-28', pitch: 67, step: 144, length: 4 }, // G4
      { id: 'furu-29', pitch: 67, step: 148, length: 4 }, // G4
      { id: 'furu-30', pitch: 64, step: 152, length: 4 }, // E4
      { id: 'furu-31', pitch: 65, step: 156, length: 8 }, // F4
      { id: 'furu-32', pitch: 65, step: 164, length: 4 }, // F4
      { id: 'furu-33', pitch: 64, step: 168, length: 4 }, // E4
      { id: 'furu-34', pitch: 62, step: 172, length: 4 }, // D4
      { id: 'furu-35', pitch: 64, step: 176, length: 4 }, // E4
      { id: 'furu-36', pitch: 60, step: 180, length: 12 } // C4
    ]
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
    notes: [
      { id: 'momo-1', pitch: 67, step: 0, length: 2 }, // G4
      { id: 'momo-2', pitch: 67, step: 2, length: 2 }, // G4
      { id: 'momo-3', pitch: 64, step: 4, length: 2 }, // E4
      { id: 'momo-4', pitch: 67, step: 6, length: 2 }, // G4
      { id: 'momo-5', pitch: 69, step: 8, length: 2 }, // A4
      { id: 'momo-6', pitch: 69, step: 10, length: 2 }, // A4
      { id: 'momo-7', pitch: 67, step: 12, length: 4 }, // G4

      { id: 'momo-8', pitch: 64, step: 16, length: 2 }, // E4
      { id: 'momo-9', pitch: 64, step: 18, length: 2 }, // E4
      { id: 'momo-10', pitch: 60, step: 20, length: 2 }, // C4
      { id: 'momo-11', pitch: 64, step: 22, length: 2 }, // E4
      { id: 'momo-12', pitch: 62, step: 24, length: 2 }, // D4
      { id: 'momo-13', pitch: 62, step: 26, length: 2 }, // D4
      { id: 'momo-14', pitch: 62, step: 28, length: 4 }, // D4

      { id: 'momo-15', pitch: 67, step: 32, length: 2 }, // G4
      { id: 'momo-16', pitch: 64, step: 34, length: 2 }, // E4
      { id: 'momo-17', pitch: 67, step: 36, length: 2 }, // G4
      { id: 'momo-18', pitch: 69, step: 38, length: 2 }, // A4
      { id: 'momo-19', pitch: 67, step: 40, length: 2 }, // G4
      { id: 'momo-20', pitch: 64, step: 42, length: 2 }, // E4
      { id: 'momo-21', pitch: 62, step: 44, length: 4 }, // D4

      { id: 'momo-22', pitch: 60, step: 48, length: 2 }, // C4
      { id: 'momo-23', pitch: 62, step: 50, length: 2 }, // D4
      { id: 'momo-24', pitch: 64, step: 52, length: 2 }, // E4
      { id: 'momo-25', pitch: 62, step: 54, length: 2 }, // D4
      { id: 'momo-26', pitch: 60, step: 56, length: 8 } // C4
    ]
  },
  zousan: {
    name: 'ぞうさん',
    composer: '團伊玖磨',
    memo: '「ぞうさん ぞうさん お鼻がいたいのね...」2/4拍子のやさしい童謡です。',
    tuning: 'honchoshi',
    basePitch: 48,
    timeSignature: { numerator: 2, denominator: 4 },
    bpm: 90,
    measureCount: 6,
    notes: [
      { id: 'zou-1', pitch: 60, step: 0, length: 2 }, // C4
      { id: 'zou-2', pitch: 60, step: 2, length: 2 }, // C4
      { id: 'zou-3', pitch: 62, step: 4, length: 4 }, // D4

      { id: 'zou-4', pitch: 64, step: 8, length: 2 }, // E4
      { id: 'zou-5', pitch: 64, step: 10, length: 2 }, // E4
      { id: 'zou-6', pitch: 67, step: 12, length: 4 }, // G4

      { id: 'zou-7', pitch: 69, step: 16, length: 2 }, // A4
      { id: 'zou-8', pitch: 69, step: 18, length: 2 }, // A4
      { id: 'zou-9', pitch: 69, step: 20, length: 2 }, // A4
      { id: 'zou-10', pitch: 67, step: 22, length: 2 }, // G4

      { id: 'zou-11', pitch: 65, step: 24, length: 2 }, // F4
      { id: 'zou-12', pitch: 64, step: 26, length: 2 }, // E4
      { id: 'zou-13', pitch: 62, step: 28, length: 4 }, // D4

      { id: 'zou-14', pitch: 67, step: 32, length: 2 }, // G4
      { id: 'zou-15', pitch: 67, step: 34, length: 2 }, // G4
      { id: 'zou-16', pitch: 65, step: 36, length: 2 }, // F4
      { id: 'zou-17', pitch: 64, step: 38, length: 2 }, // E4

      { id: 'zou-18', pitch: 62, step: 40, length: 2 }, // D4
      { id: 'zou-19', pitch: 62, step: 42, length: 2 }, // D4
      { id: 'zou-20', pitch: 64, step: 44, length: 2 }, // E4
      { id: 'zou-21', pitch: 60, step: 46, length: 2 } // C4
    ]
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
    notes: [
      { id: 'michi-1', pitch: 55, step: 0, length: 12 }, // G3 (String 1, Tsubo '2')
      { id: 'michi-2', pitch: 55, step: 12, length: 4 }, // G3

      { id: 'michi-3', pitch: 60, step: 16, length: 4 }, // C4
      { id: 'michi-4', pitch: 60, step: 20, length: 4 }, // C4
      { id: 'michi-5', pitch: 60, step: 24, length: 4 }, // C4
      { id: 'michi-6', pitch: 62, step: 28, length: 4 }, // D4

      { id: 'michi-7', pitch: 64, step: 32, length: 4 }, // E4
      { id: 'michi-8', pitch: 64, step: 36, length: 4 }, // E4
      { id: 'michi-9', pitch: 64, step: 40, length: 4 }, // E4
      { id: 'michi-10', pitch: 67, step: 44, length: 4 }, // G4

      { id: 'michi-11', pitch: 69, step: 48, length: 4 }, // A4
      { id: 'michi-12', pitch: 69, step: 52, length: 4 }, // A4
      { id: 'michi-13', pitch: 67, step: 56, length: 4 }, // G4
      { id: 'michi-14', pitch: 64, step: 60, length: 4 }, // E4

      { id: 'michi-15', pitch: 62, step: 64, length: 12 }, // D4
      // rest step 76-79

      { id: 'michi-16', pitch: 55, step: 80, length: 4 }, // G3
      { id: 'michi-17', pitch: 57, step: 84, length: 4 }, // A3
      { id: 'michi-18', pitch: 60, step: 88, length: 4 }, // C4
      { id: 'michi-19', pitch: 62, step: 92, length: 4 }, // D4

      { id: 'michi-20', pitch: 64, step: 96, length: 4 }, // E4
      { id: 'michi-21', pitch: 62, step: 100, length: 4 }, // D4
      { id: 'michi-22', pitch: 60, step: 104, length: 8 }, // C4

      { id: 'michi-23', pitch: 60, step: 112, length: 16 } // C4
    ]
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
    notes: [
      { id: 'tombo-1', pitch: 55, step: 0, length: 8 }, // G3
      { id: 'tombo-2', pitch: 60, step: 8, length: 4 }, // C4

      { id: 'tombo-3', pitch: 60, step: 12, length: 4 }, // C4
      { id: 'tombo-4', pitch: 62, step: 16, length: 4 }, // D4
      { id: 'tombo-5', pitch: 60, step: 20, length: 4 }, // C4

      { id: 'tombo-6', pitch: 57, step: 24, length: 4 }, // A3
      { id: 'tombo-7', pitch: 55, step: 28, length: 4 }, // G3
      { id: 'tombo-8', pitch: 52, step: 32, length: 4 }, // E3

      { id: 'tombo-9', pitch: 55, step: 36, length: 12 }, // G3
      // rest step 48

      { id: 'tombo-10', pitch: 57, step: 48, length: 4 }, // A3
      { id: 'tombo-11', pitch: 60, step: 52, length: 4 }, // C4
      { id: 'tombo-12', pitch: 62, step: 56, length: 4 }, // D4

      { id: 'tombo-13', pitch: 64, step: 60, length: 8 }, // E4
      { id: 'tombo-14', pitch: 62, step: 68, length: 4 }, // D4

      { id: 'tombo-15', pitch: 62, step: 72, length: 12 }, // D4
      // rest step 84-95

      { id: 'tombo-16', pitch: 64, step: 96, length: 8 }, // E4
      { id: 'tombo-17', pitch: 67, step: 104, length: 4 }, // G4

      { id: 'tombo-18', pitch: 69, step: 108, length: 8 }, // A4
      { id: 'tombo-19', pitch: 69, step: 116, length: 4 }, // A4

      { id: 'tombo-20', pitch: 67, step: 120, length: 4 }, // G4
      { id: 'tombo-21', pitch: 64, step: 124, length: 4 }, // E4
      { id: 'tombo-22', pitch: 62, step: 128, length: 4 }, // D4

      { id: 'tombo-23', pitch: 60, step: 132, length: 12 }, // C4

      { id: 'tombo-24', pitch: 57, step: 144, length: 8 }, // A3
      { id: 'tombo-25', pitch: 55, step: 152, length: 4 }, // G3

      { id: 'tombo-26', pitch: 57, step: 156, length: 4 }, // A3
      { id: 'tombo-27', pitch: 60, step: 160, length: 8 }, // C4

      { id: 'tombo-28', pitch: 60, step: 168, length: 12 } // C4
    ]
  }
};
