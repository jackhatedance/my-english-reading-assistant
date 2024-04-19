'use strict';

import { getWordParts } from './language.js';

function annotateWord(searchResult, sentenceId, sentenceNumber, tokenNumber) {
    let query = searchResult.query;
    let baseWord = searchResult.word;
    let definition = searchResult.definition;

    if (searchResult.searchType === 'stem') {
        definition = '根' + searchResult.word + ':' + definition;
    }
    if (searchResult.searchType === 'removeSuffixOrPrefix') {
        definition = '源' + searchResult.word + ':' + definition;
    }
    if (searchResult.searchType === 'lemma' && searchResult.lemmaType === 'irregular') {
        definition = '原' + searchResult.word + ':' + definition;
    }
    if (searchResult.searchType === 'compounding') {
        definition = '复' + searchResult.word + ':' + definition;
    }

    let wordPartObjs = getWordParts(baseWord);
    let parts = '';
    if (wordPartObjs) {
        let partArray = [];
        for (let partObj of wordPartObjs) {
            partArray.push(partObj.word);
        }
        parts = partArray.join(' ');
    }
    let formatted = format(query, definition, baseWord, parts, sentenceId, sentenceNumber, tokenNumber);
    //console.log('formatted:'+formatted);

    return formatted;
}

function annotateNonword(text, sentenceId, sentenceNumber, tokenNumber) {
    let definition = '';
    let baseWord = '';
    let parts = '';

    let result = format(text, definition, baseWord, parts, sentenceId, sentenceNumber, tokenNumber);

    return result;
}

function format(word, annotation, baseWord, parts, sentenceId, sentenceNumber, tokenNumber) {
    let escapedBaseWord = baseWord.replace(/&/g, "&amp;");
    let escapedWord = word.replace(/&/g, "&amp;");

    let type = baseWord ? 'mea-word' : 'mea-nonword';

    let s = `<span class="mea-container mea-highlight hide ${type}" data-base-word="${escapedBaseWord}" data-parts="${parts}" data-footnote="${annotation}" data-sentence-id="${sentenceId}" data-sentence-number="${sentenceNumber}" data-token-number="${tokenNumber}">${escapedWord}</span>`;
    return s;
}

export { annotateWord, annotateNonword };