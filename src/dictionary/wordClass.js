
const wordClassMap = {
    "abbreviation": "abbr.",
    "article": "art.",
    "definite article": "art.",
    "noun": "n.",
    "plural noun": "n.",
    "verb": "v.",
    "auxiliary verb": "aux.",
    "adjective": "adj.",
    "adverb": "adv.",
    "interrogative adverb":"int-adv.",
    "pronoun": "pron.",
    "interrogative pronoun": "pron.",
    "relative pronoun": "pron.",
    "preposition": "prep.",
    "conjunction": "conj.",
    "contraction": "cont.",
    "determiner": "det.",
    "possessive determiner": "pos-det.",
    "interjection": "int.",
    "cardinal number": "num.",
};

function getWordClassAbbreviation(wordClass) {
    if(wordClass.includes('&')){
        let wordClassArray = wordClass.split('&');
        wordClassArray = wordClassArray.map(item => item.trim());
        wordClassArray = wordClassArray.filter(item => item.length>0);
        wordClassArray = wordClassArray.map(item => getSingleWordClassAbbreviation(item));
        return wordClassArray.join('&');
    }else{
        return getSingleWordClassAbbreviation(wordClass);
    }
}

function getSingleWordClassAbbreviation(wordClass) {
    if (wordClassMap.hasOwnProperty(wordClass)) {
        var abbreviation = wordClassMap[wordClass];
    }

    let result = abbreviation ? abbreviation : wordClass;
    return result;
}

export { getWordClassAbbreviation }