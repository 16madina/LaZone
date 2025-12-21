// Content filtering utility for inappropriate words
// This list covers French inappropriate content relevant to African markets

const inappropriateWords = [
  // Insultes et vulgarités (French)
  'merde', 'putain', 'connard', 'connasse', 'salope', 'enculé', 'nique', 'niquer',
  'bordel', 'foutre', 'baiser', 'pute', 'cul', 'bite', 'couille', 'chier',
  'enfoiré', 'bâtard', 'abruti', 'crétin', 'débile', 'con', 'conne', 'idiot',
  'imbécile', 'taré', 'tarlouze', 'pd', 'pédé', 'gouine', 'tantouze',
  
  // Termes racistes et discriminatoires
  'négro', 'nègre', 'bougnoule', 'bamboula', 'macaque', 'singe',
  
  // Arnaques et fraudes
  'arnaque', 'escroquerie', 'faux papiers', 'documents falsifiés',
  
  // Contenu adulte
  'xxx', 'porno', 'pornographie', 'sexe', 'escort', 'prostitution',
  'massage érotique', 'rencontre coquine', 'plan cul',
  
  // Drogues
  'drogue', 'cannabis', 'cocaïne', 'héroïne', 'dealer', 'shit', 'weed',
  
  // Violence
  'tuer', 'assassiner', 'meurtre', 'violence', 'terroriste', 'bombe',
  
  // Spam indicators
  'gagnez argent facile', 'devenir riche', 'bitcoin gratuit', 'crypto gratuit',
  'cliquez ici', 'offre limitée', 'urgent',
];

// Variations and leetspeak patterns
const leetSpeakMap: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '8': 'b',
  '@': 'a',
  '$': 's',
};

function normalizeLeetSpeak(text: string): string {
  let normalized = text.toLowerCase();
  for (const [leet, letter] of Object.entries(leetSpeakMap)) {
    normalized = normalized.split(leet).join(letter);
  }
  return normalized;
}

function removeAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizeText(text: string): string {
  let normalized = text.toLowerCase();
  normalized = removeAccents(normalized);
  normalized = normalizeLeetSpeak(normalized);
  // Remove repeated characters (e.g., "meeeerde" -> "merde")
  normalized = normalized.replace(/(.)\1{2,}/g, '$1$1');
  // Remove spaces between letters (e.g., "m e r d e" -> "merde")
  normalized = normalized.replace(/\s+/g, ' ');
  return normalized;
}

export interface ContentFilterResult {
  isClean: boolean;
  flaggedWords: string[];
  originalText: string;
  cleanedText?: string;
}

// Phrases autorisées (contexte légitime, comme les restrictions d'hébergement)
const allowedPhrases = [
  'pas de drogue',
  'pas d\'alcool',
  'non fumeur',
  'pas de fête',
  'pas de violence',
  'interdit drogue',
  'drogue interdite',
  'alcool interdit',
  'sans drogue',
  'sans alcool',
];

/**
 * Remove allowed phrases from text before filtering
 */
function removeAllowedPhrases(text: string): string {
  let cleanedText = text.toLowerCase();
  for (const phrase of allowedPhrases) {
    const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    cleanedText = cleanedText.replace(regex, '');
  }
  return cleanedText;
}

/**
 * Check if text contains inappropriate content
 */
export function filterContent(text: string): ContentFilterResult {
  if (!text || typeof text !== 'string') {
    return { isClean: true, flaggedWords: [], originalText: text };
  }

  // Remove allowed phrases before checking for inappropriate content
  const textWithoutAllowedPhrases = removeAllowedPhrases(text);
  const normalizedText = normalizeText(textWithoutAllowedPhrases);
  const flaggedWords: string[] = [];

  for (const word of inappropriateWords) {
    const normalizedWord = normalizeText(word);
    // Check for whole word match or as part of compound words
    const regex = new RegExp(`\\b${normalizedWord}\\b|${normalizedWord}`, 'gi');
    if (regex.test(normalizedText)) {
      flaggedWords.push(word);
    }
  }

  return {
    isClean: flaggedWords.length === 0,
    flaggedWords: [...new Set(flaggedWords)], // Remove duplicates
    originalText: text,
  };
}

/**
 * Check multiple text fields at once
 */
export function filterMultipleFields(fields: Record<string, string>): {
  isClean: boolean;
  results: Record<string, ContentFilterResult>;
  allFlaggedWords: string[];
} {
  const results: Record<string, ContentFilterResult> = {};
  const allFlaggedWords: string[] = [];

  for (const [fieldName, text] of Object.entries(fields)) {
    const result = filterContent(text);
    results[fieldName] = result;
    allFlaggedWords.push(...result.flaggedWords);
  }

  return {
    isClean: allFlaggedWords.length === 0,
    results,
    allFlaggedWords: [...new Set(allFlaggedWords)],
  };
}

/**
 * Get a user-friendly message for content violations
 */
export function getContentViolationMessage(flaggedWords: string[]): string {
  if (flaggedWords.length === 0) return '';
  
  return `Votre contenu contient des termes inappropriés et ne peut pas être publié. Veuillez modifier votre texte et réessayer.`;
}
