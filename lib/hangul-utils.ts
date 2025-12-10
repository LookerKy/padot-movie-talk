export const CHO_HANGUL = [
    'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

export const JUNG_HANGUL = [
    'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
];

export const JONG_HANGUL = [
    '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'rrh', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

export const CHO_PERIOD = Math.floor("까".charCodeAt(0) - "가".charCodeAt(0));
export const JUNG_PERIOD = Math.floor("개".charCodeAt(0) - "가".charCodeAt(0));

export const QWERTY_MAP: { [key: string]: string } = {
    // Consonants (Ja-eum)
    'ㄱ': 'r', 'ㄲ': 'R', 'ㄴ': 's', 'ㄷ': 'e', 'ㄸ': 'E', 'ㄹ': 'f',
    'ㅁ': 'a', 'ㅂ': 'q', 'ㅃ': 'Q', 'ㅅ': 't', 'ㅆ': 'T', 'ㅇ': 'd',
    'ㅈ': 'w', 'ㅉ': 'W', 'ㅊ': 'c', 'ㅋ': 'z', 'ㅌ': 'x', 'ㅍ': 'v', 'ㅎ': 'g',
    // Vowels (Mo-eum)
    'ㅏ': 'k', 'ㅐ': 'o', 'ㅑ': 'i', 'ㅒ': 'O', 'ㅓ': 'j', 'ㅔ': 'p',
    'ㅕ': 'u', 'ㅖ': 'P', 'ㅗ': 'h', 'ㅘ': 'hk', 'ㅙ': 'ho', 'ㅚ': 'hl',
    'ㅛ': 'y', 'ㅜ': 'n', 'ㅝ': 'nj', 'ㅞ': 'np', 'ㅟ': 'nl', 'ㅠ': 'b',
    'ㅡ': 'm', 'ㅢ': 'ml', 'ㅣ': 'l',
    // Double Consonants (Jong-seum specific mapping if needed, generally composed)
    'ㄳ': 'rt', 'ㄵ': 'sw', 'ㄶ': 'sg', 'ㄺ': 'fr', 'ㄻ': 'fa', 'ㄼ': 'fq',
    'ls': 'ft', 'ㄾ': 'fx', 'ㄿ': 'fv', 'rrh': 'fg', 'ㅄ': 'qt'
};

/**
 * Decomposes a Hangul syllable into its constituent Jamos (Cho, Jung, Jong)
 * and maps them to their corresponding English QWERTY keys.
 */
export function convertHangulToEnglish(text: string): string {
    let result = "";

    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        const char = text[i];

        // Check if it's a Hangul Syllable
        if (charCode >= 0xAC00 && charCode <= 0xD7A3) {
            const hangulIndex = charCode - 0xAC00;
            const choIndex = Math.floor(hangulIndex / (21 * 28));
            const jungIndex = Math.floor((hangulIndex % (21 * 28)) / 28);
            const jongIndex = hangulIndex % 28;

            const cho = CHO_HANGUL[choIndex];
            const jung = JUNG_HANGUL[jungIndex];
            const jong = JONG_HANGUL[jongIndex];

            result += (QWERTY_MAP[cho] || cho);
            result += (QWERTY_MAP[jung] || jung);
            if (jongIndex > 0) {
                // Handle complex Jong-seung mappings if they exist in map, else standard
                // Often Jong-seung can be single keys, but some are combinations (like ㄳ -> rt)
                // For simplicity, we map standard Jamo. 
                // Wait, JONG_HANGUL contains complex ones like ㄳ. We need to map ㄳ -> rt
                // Let's ensure QWERTY_MAP handles them or fallback to分解 logic if needed.
                // Actually, standard typing logic: ㄳ is typed as r -> t.
                // Our map handles ㄳ -> rt.
                result += (QWERTY_MAP[jong] || jong);
            }
        }
        // Check if it's a standalone Jamo (Consonant/Vowel)
        else if ((charCode >= 0x3131 && charCode <= 0x3163)) {
            result += (QWERTY_MAP[char] || char);
        }
        else {
            result += char;
        }
    }

    return result;
}
