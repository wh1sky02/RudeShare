// Politeness detection system for RudeShare
// Automatically detects and flags overly polite content

const POLITE_WORDS = [
  'please', 'thank you', 'thanks', 'appreciate', 'grateful', 'kindly',
  'wonderful', 'amazing', 'fantastic', 'lovely', 'beautiful', 'sweet',
  'sorry', 'apologize', 'excuse me', 'pardon', 'bless', 'blessed',
  'hope you have a', 'have a great', 'best wishes', 'good luck',
  'you\'re welcome', 'no problem', 'my pleasure', 'happy to help',
  'respectfully', 'humbly', 'gently', 'softly', 'kindness', 'gentle',
  'wholesome', 'positive', 'uplifting', 'encouraging', 'supportive',
  'compliment', 'praise', 'admire', 'respect', 'honor', 'cherish'
];

const POLITE_PHRASES = [
  'i hope you',
  'wish you the best',
  'sending love',
  'thoughts and prayers',
  'you\'re doing great',
  'keep up the good work',
  'proud of you',
  'you got this',
  'believe in you',
  'here for you',
  'much love',
  'stay positive',
  'good vibes',
  'virtual hug'
];

const DEATH_THREAT_WORDS = [
  'kill', 'murder', 'die', 'death', 'suicide', 'hang', 'shoot', 'stab',
  'poison', 'torture', 'hurt', 'harm', 'violence', 'weapon', 'gun',
  'knife', 'bomb', 'explosion', 'assault', 'attack'
];

const HARASSMENT_WORDS = [
  'address', 'phone number', 'home', 'workplace', 'school', 'family',
  'children', 'kids', 'personal info', 'doxx', 'dox', 'real name'
];

export interface ModerationResult {
  isTooPolite: boolean;
  isDeathThreat: boolean;
  isHarassment: boolean;
  flaggedWords: string[];
  severity: 'allowed' | 'banned_polite' | 'banned_illegal';
}

export function moderateContent(content: string): ModerationResult {
  const normalizedContent = content.toLowerCase();
  const flaggedWords: string[] = [];
  
  // Check for death threats and harassment (still banned)
  const deathThreats = DEATH_THREAT_WORDS.filter(word => 
    normalizedContent.includes(word)
  );
  const harassment = HARASSMENT_WORDS.filter(word => 
    normalizedContent.includes(word)
  );
  
  if (deathThreats.length > 0 || harassment.length > 0) {
    return {
      isTooPolite: false,
      isDeathThreat: deathThreats.length > 0,
      isHarassment: harassment.length > 0,
      flaggedWords: [...deathThreats, ...harassment],
      severity: 'banned_illegal'
    };
  }
  
  // Check for polite words
  const politeWords = POLITE_WORDS.filter(word => 
    normalizedContent.includes(word)
  );
  
  // Check for polite phrases
  const politePhrasesFound = POLITE_PHRASES.filter(phrase => 
    normalizedContent.includes(phrase)
  );
  
  flaggedWords.push(...politeWords, ...politePhrasesFound);
  
  // Determine if too polite (ban threshold: 2+ polite words/phrases)
  const politenessScore = politeWords.length + politePhrasesFound.length;
  const isTooPolite = politenessScore >= 2;
  
  return {
    isTooPolite,
    isDeathThreat: false,
    isHarassment: false,
    flaggedWords,
    severity: isTooPolite ? 'banned_polite' : 'allowed'
  };
}

export function generateRudeResponse(flaggedWords: string[]): string {
  const responses = [
    `Cut the ${flaggedWords[0]} crap. This isn't kindergarten.`,
    `Nobody wants your fake ${flaggedWords[0]} BS here.`,
    `Save your ${flaggedWords[0]} garbage for Facebook.`,
    `This is RudeShare, not your grandmother's tea party.`,
    `Keep your soft ${flaggedWords[0]} nonsense to yourself.`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}