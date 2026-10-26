// Nickname rules: 2–20 characters of letters (any alphabet), numbers, spaces, _ - and ., and no
// offensive words in English or Spanish.

export const NICKNAME_MIN = 2;
export const NICKNAME_MAX = 20;

export type NicknameProblem = 'length' | 'characters' | 'offensive';

// Words blocked anywhere inside a nickname, even when glued to other letters.
const BLOCKED_ANYWHERE = [
  // English
  'fuck', 'shit', 'bitch', 'cunt', 'asshole', 'bastard', 'whore', 'slut', 'faggot', 'nigger',
  'nigga', 'retard', 'rapist', 'pussy', 'penis', 'vagina', 'porn', 'dildo', 'wank', 'jizz',
  'hitler', 'kike', 'tranny', 'motherf', 'blowjob', 'handjob', 'boner', 'twat', 'prick',
  // Spanish
  'puta', 'puto', 'pendej', 'mierd', 'cabron', 'verga', 'chinga', 'cojon', 'maric', 'gilipolla',
  'malparid', 'hijueput', 'hijodeput', 'culiao', 'culero', 'pinche', 'panocha', 'follar',
  'mamaguevo', 'mamahuevo', 'sudaca', 'negrata', 'concha',
];

// Short words blocked only on their own, since they appear inside harmless words
// (peacock, cucumber, Sussex, title, pijama, conocer...).
const BLOCKED_WORDS = [
  'ass', 'dick', 'cock', 'cum', 'anal', 'sex', 'tit', 'tits', 'boob', 'boobs', 'fag', 'nazi',
  'rape', 'coon', 'spic', 'chink', 'dyke', 'hoe', 'culo', 'cono', 'zorra', 'perra', 'polla',
  'pija', 'joto', 'mamon', 'teta', 'tetas', 'pene',
];

// Letters and digits people swap in to sneak words past filters.
const LOOKALIKES: Record<string, string> = {
  '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '@': 'a', '$': 's', '!': 'i',
};

// Words split at capitals ("BigDick" -> "Big Dick"), lower case, no accents, look-alikes replaced.
function normalize(text: string): string {
  return text
    .replace(/(\p{Ll})(\p{Lu})/gu, '$1 $2')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[0134578@$!]/g, (c) => LOOKALIKES[c]);
}

// Lets each letter of a blocked word repeat ("fuuuck"), without letting "boob" match "bob".
const pattern = (word: string) => word.replace(/(.)\1*/g, (run) => `${run[0]}{${run.length},}`);

const ANYWHERE = BLOCKED_ANYWHERE.map((w) => new RegExp(pattern(w)));
const WHOLE_WORD = BLOCKED_WORDS.map((w) => new RegExp(`^${pattern(w)}$`));

export function isOffensive(nickname: string): boolean {
  const text = normalize(nickname);
  // Letters only, so spaced or dotted spellings ("f u c k", "s.h.i.t") are caught too.
  const lettersOnly = text.replace(/[^a-z]/g, '');
  if (ANYWHERE.some((re) => re.test(lettersOnly))) return true;
  const words = text.split(/[^a-z]+/).filter(Boolean);
  return words.some((word) => WHOLE_WORD.some((re) => re.test(word)));
}

export function nicknameProblem(nickname: string): NicknameProblem | null {
  const name = nickname.trim();
  if (name.length < NICKNAME_MIN || name.length > NICKNAME_MAX) return 'length';
  if (!/^[\p{L}\p{N}_.\- ]+$/u.test(name) || /\s{2,}/.test(name)) return 'characters';
  if (isOffensive(name)) return 'offensive';
  return null;
}

// Maya-inspired suggestions for players who don't know what to pick.
const SUGGESTIONS = ['Jaguar', 'Quetzal', 'Ceiba', 'Cacao', 'Kukulkan', 'Ixchel', 'Itzamna', 'Balam', 'Maize', 'Obsidian', 'Jade', 'Chaak'];

export function suggestNickname(): string {
  const name = SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)];
  return `${name}${Math.floor(10 + Math.random() * 990)}`;
}
