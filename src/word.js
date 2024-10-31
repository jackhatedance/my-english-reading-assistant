'use strict';

import { getWordParts } from './language.js';
import {  TOKEN_TAG } from './html.js';

function buildAnnotationParameters(searchResult) {
    
    let baseWord = searchResult.word;
    let definition = searchResult.definition;
    let shortDefinition = searchResult.shortDefinition;

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

    let annotationParameters = {
        definition, shortDefinition, baseWord, parts
    };
    return annotationParameters;
}

function annotateWord(token, searchResult, sentenceId, sentenceNumber, tokenNumber) {
    let annotationParameters = buildAnnotationParameters(searchResult);
    let { definition, shortDefinition, baseWord, parts } = annotationParameters;
    let formatted = format(token, definition, shortDefinition, baseWord, parts, sentenceId, sentenceNumber, tokenNumber);
    //console.log('formatted:'+formatted);

    return formatted;
}

function updateWordAnnotation(textElement, searchResult){
    let annotationParameters = buildAnnotationParameters(searchResult);
    let { definition, shortDefinition, baseWord, parts } = annotationParameters;

    let escapedBaseWord = baseWord.replace(/&/g, "&amp;");

    textElement.classList.remove('mea-nonword');
    textElement.classList.add('mea-word');

    textElement.setAttribute('data-base-word', escapedBaseWord);
    textElement.setAttribute('data-parts', `${parts}`);
    textElement.setAttribute('data-footnote', definition);
    textElement.setAttribute('data-footnote-short', shortDefinition);
}

function annotateNonword(text, sentenceId, sentenceNumber, tokenNumber) {
    let definition = '';
    let shortDefinition = '';
    let baseWord = '';
    let parts = '';

    let result = format(text, definition, shortDefinition, baseWord, parts, sentenceId, sentenceNumber, tokenNumber);

    return result;
}

function format(word, definition, shortDefinition, baseWord, parts, sentenceId, sentenceNumber, tokenNumber) {
    let escapedBaseWord = baseWord.replace(/&/g, "&amp;");
    let escapedWord = word.replace(/&/g, "&amp;");

    let type = baseWord ? 'mea-word' : 'mea-nonword';

    let s = `<${TOKEN_TAG} class="mea-element mea-highlight mea-hide ${type}" data-base-word="${escapedBaseWord}" data-parts="${parts}" data-footnote="${definition}" data-footnote-short="${shortDefinition}" data-sentence-id="${sentenceId}" data-sentence-number="${sentenceNumber}" data-token-number="${tokenNumber}">${escapedWord}</${TOKEN_TAG}>`;
    return s;
}


function getBaseWordFromElement(element) {
    return element.getAttribute('data-base-word');
}

export { annotateWord, annotateNonword, updateWordAnnotation, getBaseWordFromElement };