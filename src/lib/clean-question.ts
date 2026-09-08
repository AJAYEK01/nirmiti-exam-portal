/**
 * Strips any internal question bank numbering prefixes
 * e.g. "Science Concept 264: What is...", "ശാസ്ത്ര ചോദ്യം 264: ...", "Digital Concept 252: ..."
 * Returns clean, natural question text.
 */
const PREFIX_REGEX =
  /^(?:(?:Science Concept|Digital Concept|Math Problem|Logic Puzzle|Concept|Question|Q\.?)\s*\d+\s*:\s*|(?:ശാസ്ത്ര ചോദ്യം|ഡിജിറ്റൽ സാങ്കേതിക ചോദ്യം|ഗണിത ചോദ്യം|യുക്തി ചോദ്യം|ചോദ്യം|സയൻസ് ചോദ്യം|ഐ\.?ടി\.? ചോദ്യം)\s*\d+\s*:\s*)/i;

export function cleanQuestionText(text?: string | null): string {
  if (!text) return "";
  return text.replace(PREFIX_REGEX, "").trim();
}
