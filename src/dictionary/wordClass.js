
const wordClassMap = {
    "noun": "n",
    "verb": "v",
    "auxiliary verb": "aux",
    "adjective": "adj",
    "adverb": "adv",
    "pronoun": "pron",
    "preposition": "prep",
    "conjunction": "conj",
    "determiner": "det",
    "possessive determiner": "det",
    "interjection": "int",
    "cardinal number": "num",
};

function getWordClassAbbreviation(wordClass) {
    if (wordClassMap.hasOwnProperty(wordClass)) {
        var abbreviation = wordClassMap[wordClass];
    }

    let result = abbreviation ? abbreviation + '.' : wordClass;
    return result;
}

export { getWordClassAbbreviation }