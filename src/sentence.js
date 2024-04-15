
'use strict';

import { md5 } from 'js-md5';
import { tranverseNode } from './dom.js';

function purifySentence(sentence) {
    return sentence.replaceAll(/[^\w]+/g, '').toLowerCase();
}

function getSentenceContentHash(sentenceContent) {
    let pureSentence = purifySentence(sentenceContent);
    let sentenceId = md5(pureSentence);
    return sentenceId;
}


function getSentenceInstancePositionFromNodePosition(node, offset) {
    let tokenElement = node.parentElement;
    let offsetInToken = offset;


    let sentenceElement = tokenElement.closest('.mea-sentence');

    if (!sentenceElement) {
        //cursor could be at the space between sentences. the space belongs to no sentence.
        if (!tokenElement.classList.contains('mea-sentence')
            &&
            (node.nextElementSibling && node.nextElementSibling.classList.contains('mea-sentence'))
            &&
            (node.previousElementSibling && node.previousElementSibling?.classList.contains('mea-sentence'))
        ) {
            sentenceElement = node.nextElementSibling;
        }
    }

    if (!sentenceElement) {
        return null;
    }

    let sentenceId = sentenceElement.getAttribute('data-sentence-id');
    let sentenceNumber = parseInt(sentenceElement.getAttribute('data-sentence-number'));


    let sentenceBuffer = '';
    let offsetInSentence = 0;

    let done = false;

    tranverseNode(sentenceElement, (node2) => {
        if (done) {
            return;
        }

        if (node2.nodeName === '#text') {
            if (node2 === node) {
                offsetInSentence = sentenceBuffer.length + offsetInToken;

                done = true;
            }
            sentenceBuffer = sentenceBuffer + node2.textContent;
        }
    });
    let result = {
        sentenceId: sentenceId,
        offset: offsetInSentence,
        sentenceNumber: sentenceNumber,
    };
    return result;
}


function getSentenceInstanceSelectionFromNodeSelection(nodeSelection) {

    let anchorSentenceInstancePosition = getSentenceInstancePositionFromNodePosition(nodeSelection.anchorNode, nodeSelection.anchorOffset);
    let focusSentenceInstancePosition = getSentenceInstancePositionFromNodePosition(nodeSelection.focusNode, nodeSelection.focusOffset);
    if (!anchorSentenceInstancePosition || !focusSentenceInstancePosition) {
        return null;
    }

    //find the start and end position.
    let startSentenceInstancePosition, endSentenceInstancePosition;
    if (anchorSentenceInstancePosition.sentenceNumber < focusSentenceInstancePosition.sentenceNumber) {
        startSentenceInstancePosition = anchorSentenceInstancePosition;
    } else if (anchorSentenceInstancePosition.sentenceNumber == focusSentenceInstancePosition.sentenceNumber) {
        startSentenceInstancePosition = anchorSentenceInstancePosition.offset < focusSentenceInstancePosition.offset ? anchorSentenceInstancePosition : focusSentenceInstancePosition;
    } else {
        startSentenceInstancePosition = focusSentenceInstancePosition;
    }
    endSentenceInstancePosition = (startSentenceInstancePosition === anchorSentenceInstancePosition) ? focusSentenceInstancePosition : anchorSentenceInstancePosition;

    let startSentenceNumber = startSentenceInstancePosition.sentenceNumber;
    let endSentenceNumber = endSentenceInstancePosition.sentenceNumber;
    let sentenceOffset = endSentenceNumber - startSentenceNumber;
    let middleSentenceNumbers = generateMiddleSetenceNumbers(startSentenceNumber, sentenceOffset);

    return {
        start: startSentenceInstancePosition,
        middle: middleSentenceNumbers,
        end: endSentenceInstancePosition,
        endOffset: sentenceOffset,
    };
}

function getSentenceHashSelectionFromInstanceSelection(sentenceInstanceSelection, getSentenceIdByNumber){
    
    let sentenceHashSelection = Object.assign({}, sentenceInstanceSelection);

    let start = Object.assign({}, sentenceInstanceSelection.start);
    start.sentenceNumber = null;
    start.sentenceId = getSentenceIdByNumber(sentenceInstanceSelection.start.sentenceNumber);
    
    let end = Object.assign({}, sentenceInstanceSelection.end);
    end.sentenceNumber = null;
    end.sentenceId = getSentenceIdByNumber(sentenceInstanceSelection.end.sentenceNumber);

    

    let middleSentenceIds = [];
    for(let middleSentenceNumber of sentenceInstanceSelection.middle){
        let middleSentenceId = getSentenceIdByNumber(middleSentenceNumber);
        middleSentenceIds.push(middleSentenceId);
    }

    sentenceHashSelection.start = start;
    sentenceHashSelection.end = end;
    sentenceHashSelection.middle = middleSentenceIds;

    return sentenceHashSelection;
}

function hashPositionToInstancePosition(hashPosition, sentenceNumber) {
    let instancePosition = Object.assign({}, hashPosition, { sentenceNumber: sentenceNumber });
    return instancePosition;
}


function getSentenceOffset(sentenceHashSelection) {
    let sentenceOffset;
    if (!sentenceHashSelection.endOffset) {
        if (sentenceHashSelection.start.sentenceId === sentenceHashSelection.end.sentenceId) {
            sentenceOffset = 0;
        } else {
            sentenceOffset = 1;
        }
    } else {
        sentenceOffset = sentenceHashSelection.endOffset;
    }
    return sentenceOffset;
}

function getSentenceIds(sentenceHashSelection) {
    let sentenceIds = [sentenceHashSelection.start.sentenceId];

    let sentenceOffset = getSentenceOffset(sentenceHashSelection);

    if (sentenceHashSelection.middle) {
        for (let sentenceId of sentenceHashSelection.middle) {
            sentenceIds.push(sentenceId);
        }
    }

    if (sentenceOffset > 0) {
        sentenceIds.push(sentenceHashSelection.end.sentenceId);
    }

    //final check
    if (sentenceIds.length !== (sentenceOffset + 1)) {
        sentenceIds = null;//intend to return wrong result
        console.log('invalid selection, sentenceIds and endOffset mismatch');
    }
    return sentenceIds;
}

function generateMiddleSetenceNumbers(startSentenceNumber, endOffset){
    let middleSentenceNumbers = [];
    for (let i = 1; i < endOffset; i++) {
      let sentenceNumber = startSentenceNumber + i;
      middleSentenceNumbers.push(sentenceNumber);
    }
    return middleSentenceNumbers;
}

function containsSentenceInstancePosition(sentenceInstanceSelection, sentenceInstancePosition) {
    
    
    let { start, middle, end, endOffset } = sentenceInstanceSelection;

    
    let position = sentenceInstancePosition;

    let result = false;
    //single sentence
    if(start.sentenceNumber === position.sentenceNumber 
        && end.sentenceNumber === position.sentenceNumber
        && endOffset === 0){
        if(start.offset <= position.offset
            && end.offset >= position.offset){
                result = true;
            }
    } else if (
        //more than one sentences
        (start.sentenceNumber === position.sentenceNumber
            && start.offset <= position.offset)
        ||
        middle.includes(position.sentenceNumber)
        ||
        (end.sentenceNumber === position.sentenceNumber
            && end.offset >= position.offset)
    ) {
        result= true;
    }

    console.log('contains sentence instance position:'+ JSON.stringify(sentenceInstanceSelection)
    +'; sentence instance position:'+JSON.stringify(sentenceInstancePosition)
    +'; result:'+result);

    return result;
    
}

export { getSentenceContentHash, getSentenceOffset, getSentenceIds, generateMiddleSetenceNumbers, getSentenceInstanceSelectionFromNodeSelection, hashPositionToInstancePosition, getSentenceHashSelectionFromInstanceSelection, containsSentenceInstancePosition };