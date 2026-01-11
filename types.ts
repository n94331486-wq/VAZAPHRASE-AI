
export enum ParaphraseTone {
  FORMAL = 'Formal',
  CASUAL = 'Santai',
  ACADEMIC = 'Akademik',
  CREATIVE = 'Kreatif',
  PROFESSIONAL = 'Profesional',
  SIMPLE = 'Sederhana'
}

export enum ParaphraseLength {
  SHORT = 'Lebih Pendek',
  MEDIUM = 'Sama Panjang',
  LONG = 'Lebih Panjang'
}

export interface ParaphraseResult {
  original: string;
  paraphrased: string;
  tone: ParaphraseTone;
  timestamp: number;
}
