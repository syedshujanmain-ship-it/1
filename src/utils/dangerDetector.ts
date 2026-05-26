// Dangerous question detector - identifies edgy / dangerous queries
// Used for visual effects (beep alarm + red border), NOT for censorship

const DANGER_KEYWORDS: string[] = [
  'hack', 'hacking', 'hacker',
  'exploit', 'exploitation',
  'bypass', 'bypassing',
  'crack', 'cracking', 'cracked',
  'criminal', 'crime',
  'weapon', 'weapons', 'gun', 'guns', 'bomb', 'bombs',
  'poison', 'poisonous',
  'kill', 'murder', 'assassinate',
  'steal', 'theft', 'robbery',
  'fraud', 'scam', 'phishing',
  'virus', 'malware', 'trojan', 'ransomware',
  'ddos', 'dos attack',
  'sql injection', 'xss', 'csrf',
  'keylogger', 'spyware',
  'dark web', 'deep web',
  'illegal', 'unlawful',
  'attack', 'attacking',
  'breach', 'breaching',
  'penetrate', 'penetration',
  'loophole',
  'vulnerability exploit',
  'backdoor',
  'brute force',
  'password crack',
  'identity theft',
  'carding',
  'swatting',
  'doxxing', 'dox',
  'extortion',
  'blackmail',
];

export function isDangerousQuestion(text: string): boolean {
  if (!text || text.trim().length === 0) return false;
  const lower = text.toLowerCase();
  return DANGER_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()));
}

export function getDangerKeywords(text: string): string[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  return DANGER_KEYWORDS.filter(kw => lower.includes(kw.toLowerCase()));
}
