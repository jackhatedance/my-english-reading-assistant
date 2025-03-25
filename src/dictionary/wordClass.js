
const wordClassMap = {
    "noun": "n.",
    "verb": "v.",
    "auxiliary verb": "aux.",
    "adjective": "adj.",
    "adverb": "adv.",
    "interrogative adverb":"int-adv.",
    "pronoun": "pron.",
    "preposition": "prep.",
    "conjunction": "conj.",
    "determiner": "det.",
    "possessive determiner": "pos-det.",
    "interjection": "int.",
    "cardinal number": "num.",
};

function getWordClassAbbreviation(wordClass) {
    if (wordClassMap.hasOwnProperty(wordClass)) {
        var abbreviation = wordClassMap[wordClass];
    }

    let result = abbreviation ? abbreviation : wordClass;
    return result;
}

export { getWordClassAbbreviation }