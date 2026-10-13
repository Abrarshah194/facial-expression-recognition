/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Bilingual English and Urdu (اردو) Translation Dictionary.
 * Provides accurate affective computing and facial expression terminology.
 */

import { ExpressionCategory, ActionUnitId } from '../types/fer';

export type Language = 'en' | 'ur' | 'bilingual';

export interface ExpressionTranslation {
  en: string;
  ur: string; // Nastaliq / Urdu text
  romanUrdu: string;
  descriptionUr: string;
}

export const EXPRESSION_TRANSLATIONS: Record<ExpressionCategory | 'Uncertain', ExpressionTranslation> = {
  Happy: {
    en: 'Happy',
    ur: 'خوش',
    romanUrdu: 'Khush',
    descriptionUr: 'چہرے پر مسکراہٹ، گالوں کا ابھار اور ہونٹوں کے کونوں میں کھنچاؤ'
  },
  Sad: {
    en: 'Sad',
    ur: 'اداس',
    romanUrdu: 'Udaas',
    descriptionUr: 'ہونٹوں کے کونوں کا جھکاؤ اور اندرونی بھنوؤں کا کھنچاؤ'
  },
  Angry: {
    en: 'Angry',
    ur: 'غصہ',
    romanUrdu: 'Ghusah',
    descriptionUr: 'بھنوئیں دبی ہوئی اور آپس میں جڑی ہوئی، تنے ہوئے ہونٹ'
  },
  Surprise: {
    en: 'Surprise',
    ur: 'حیران',
    romanUrdu: 'Hairaan',
    descriptionUr: 'اوپر اٹھی ہوئی بھنوئیں، کھلی آنکھیں اور گرا ہوا جبڑا'
  },
  Fear: {
    en: 'Fear',
    ur: 'خوفزدہ',
    romanUrdu: 'Khoufzada',
    descriptionUr: 'آنکھیں پھیلی ہوئی اور ہونٹ پیچھے کی طرف کھنچے ہوئے'
  },
  Disgust: {
    en: 'Disgust',
    ur: 'بیزار / ناگواری',
    romanUrdu: 'Na-gawari',
    descriptionUr: 'ناک پر جھریاں اور اوپری ہونٹ کا اوپر اٹھنا'
  },
  Neutral: {
    en: 'Neutral',
    ur: 'پُرسکون / نارمل',
    romanUrdu: 'Pursukoon',
    descriptionUr: 'چہرے کے پٹھے پرسکون حالت میں، کوئی غیر معمولی کھنچاؤ نہیں'
  },
  Uncertain: {
    en: 'Uncertain',
    ur: 'غیر یقینی',
    romanUrdu: 'Ghair Yaqeeni',
    descriptionUr: 'چہرے کے تاثرات کی تصدیق کے لیے مزید واضح تصویر درکار ہے'
  }
};

export const ACTION_UNIT_TRANSLATIONS_UR: Record<ActionUnitId, { nameUr: string; descUr: string }> = {
  AU1: {
    nameUr: 'اندرونی ابرو کا ابھار',
    descUr: 'پیشانی کے پٹھے اندرونی بھنوؤں کو اوپر اٹھاتے ہیں'
  },
  AU2: {
    nameUr: 'بیرونی ابرو کا ابھار',
    descUr: 'بیرونی بھنوؤں کا اوپر اٹھنا'
  },
  AU4: {
    nameUr: 'بھنوئیں سکیڑنا',
    descUr: 'بھنوؤں کو نیچے اور ایک دوسرے کے قریب لانا'
  },
  AU6: {
    nameUr: 'گالوں کا ابھار (مسکراہٹ)',
    descUr: 'آنکھوں کے گرد پٹھے گالوں کو اوپر اٹھاتے ہیں'
  },
  AU9: {
    nameUr: 'ناک کی جھری',
    descUr: 'ناک کی ہڈی کے گرد جھریاں بننا'
  },
  AU12: {
    nameUr: 'ہونٹوں کے کونوں کا کھنچاؤ',
    descUr: 'مسکراہٹ کے دوران ہونٹوں کے کونوں کا ترچھا کھنچاؤ'
  },
  AU15: {
    nameUr: 'ہونٹوں کے کونوں کا جھکاؤ',
    descUr: 'اداسی کے دوران ہونٹوں کے کونوں کا نیچے کی طرف جھکاؤ'
  },
  AU25: {
    nameUr: 'ہونٹ کھلنا',
    descUr: 'ہونٹوں کا الگ ہونا بغیر جبڑا ہلائے'
  },
  AU26: {
    nameUr: 'جبڑا گرنا (کھلا منہ)',
    descUr: 'حیرت میں منہ کا کھلا رہ جانا اور جبڑے کا گرنا'
  }
};

export const UI_TRANSLATIONS_UR = {
  liveFeed: 'براہ راست کیمرہ',
  videoAnalysis: 'ویڈیو تجزیہ',
  imageAnalysis: 'تصویر کا تجزیہ',
  evaluationLab: 'ماڈل لیب',
  confidence: 'یقین / اعتماد',
  inputQuality: 'تصویر کا معیار',
  sharp: 'واضح / صاف',
  blurry: 'دھندلا',
  optimal: 'بہترین',
  underexposed: 'کم روشنی',
  overexposed: 'زیادہ تیز روشنی',
  dominantExpression: 'نمایاں تاثر',
  faceDetected: 'چہرہ شناخت شدہ',
  noFaceDetected: 'کوئی چہرہ نہیں ملا'
};

/**
 * Returns formatted bilingual or localized text
 */
export function formatExpression(
  expression: ExpressionCategory | 'Uncertain',
  mode: Language = 'bilingual'
): string {
  const t = EXPRESSION_TRANSLATIONS[expression] || EXPRESSION_TRANSLATIONS.Neutral;
  if (mode === 'ur') {
    return t.ur;
  }
  if (mode === 'en') {
    return t.en;
  }
  // Bilingual: e.g. "خوش · Happy"
  return `${t.ur} · ${t.en}`;
}
