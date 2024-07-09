
'use strict';

import { md5 } from 'js-md5';
import { getSegmentOffset } from './segment.js';

function purifyParagraph(paragraph) {
    return paragraph.replaceAll(/[^\w]+/g, '').toLowerCase();
}

function getParagraphContentHash(paragraphContent) {
    let pureParagraph = purifyParagraph(paragraphContent);
    let paragraphId = md5(pureParagraph);
    return paragraphId;
}

function getParagraphHashSelectionFromInstanceSelection(paragraphInstanceSelection, getParagraphIdByNumber){
    //console.log('get paragraph hash selection from instance selection');
    let paragraphHashSelection = Object.assign({}, paragraphInstanceSelection);

    let start = Object.assign({}, paragraphInstanceSelection.start);
    start.paragraphNumber = null;
    start.paragraphId = getParagraphIdByNumber(paragraphInstanceSelection.start.paragraphNumber);
    
    let end = Object.assign({}, paragraphInstanceSelection.end);
    end.paragraphNumber = null;
    end.paragraphId = getParagraphIdByNumber(paragraphInstanceSelection.end.paragraphNumber);

    

    let middleParagraphIds = [];
    for(let middleParagraphNumber of paragraphInstanceSelection.middle){
        let middleParagraphId = getParagraphIdByNumber(middleParagraphNumber);
        middleParagraphIds.push(middleParagraphId);
    }

    paragraphHashSelection.start = start;
    paragraphHashSelection.end = end;
    paragraphHashSelection.middle = middleParagraphIds;

    return paragraphHashSelection;
}

function paragraphHashPositionToInstancePosition(hashPosition, paragraphNumber) {
    let instancePosition = Object.assign({}, hashPosition, { paragraphNumber: paragraphNumber });
    return instancePosition;
}


function getParagraphOffset(paragraphHashSelection) {
    let paragraphOffset;
    if (!paragraphHashSelection.endOffset) {
        if (paragraphHashSelection.start.paragraphId === paragraphHashSelection.end.paragraphId) {
            paragraphOffset = 0;
        } else {
            paragraphOffset = 1;
        }
    } else {
        paragraphOffset = paragraphHashSelection.endOffset;
    }
    return paragraphOffset;
}

function getParagraphIds(paragraphHashSelection) {
    let paragraphIds = [paragraphHashSelection.start.paragraphId];

    let paragraphOffset = getParagraphOffset(paragraphHashSelection);

    if (paragraphHashSelection.middle) {
        for (let paragraphId of paragraphHashSelection.middle) {
            paragraphIds.push(paragraphId);
        }
    }

    if (paragraphOffset > 0) {
        paragraphIds.push(paragraphHashSelection.end.paragraphId);
    }

    //final check
    if (paragraphIds.length !== (paragraphOffset + 1)) {
        paragraphIds = null;//intend to return wrong result
        console.log('invalid selection, paragraphIds and endOffset mismatch');
    }
    return paragraphIds;
}

function generateMiddleParagraphNumbers(startParagraphNumber, endOffset){
    let middleParagraphNumbers = [];
    for (let i = 1; i < endOffset; i++) {
      let paragraphNumber = startParagraphNumber + i;
      middleParagraphNumbers.push(paragraphNumber);
    }
    return middleParagraphNumbers;
}

function containsParagraphInstancePosition(paragraphInstanceSelection, paragraphInstancePosition) {
    
    
    let { start, middle, end, endOffset } = paragraphInstanceSelection;

    
    let position = paragraphInstancePosition;

    let result = false;
    //single paragraph
    if(start.paragraphNumber === position.paragraphNumber 
        && end.paragraphNumber === position.paragraphNumber
        && endOffset === 0){
        if(start.offset <= position.offset
            && end.offset >= position.offset){
                result = true;
            }
    } else if (
        //more than one paragraphs
        (start.paragraphNumber === position.paragraphNumber
            && start.offset <= position.offset)
        ||
        middle.includes(position.paragraphNumber)
        ||
        (end.paragraphNumber === position.paragraphNumber
            && end.offset >= position.offset)
    ) {
        result= true;
    }

    //console.log('contains paragraph instance position:'+ JSON.stringify(paragraphInstanceSelection)    +'; paragraph instance position:'+JSON.stringify(paragraphInstancePosition)    +'; result:'+result);

    return result;
    
}

function getParagraphSegmentOffsets(paragraphInfo){
    let start = getSegmentOffset(paragraphInfo.offset);
    let end = getSegmentOffset(paragraphInfo.offset + paragraphInfo.length);
    let segmentOffsets = [];
    for(let i=start;i<end+1;i++){
        segmentOffsets.push(i);
    }
    return segmentOffsets;
}

function getArticleSelectionFromParagraphInstanceSelection(article, paragraphInstanceSelection) {
    let { start, end } = paragraphInstanceSelection;

    let startParagraphInfo = article.paragraphs[start.paragraphNumber];
    let startArticleOffset = startParagraphInfo.offset + start.offset;

    let endParagraphInfo = article.paragraphs[end.paragraphNumber];
    let endArticleOffset = endParagraphInfo.offset + end.offset;

    let articleSelection = {
        start: startArticleOffset,
        end: endArticleOffset,
    }
    return articleSelection;
}

function getParagraphInstanceSelectionFromParagraphHashSelection(article, paragraphHashSelection, startParagraphNumber) {
    let startParagraphInstancePosition = paragraphHashPositionToInstancePosition(paragraphHashSelection.start, startParagraphNumber);

    let endParagraphNumber = startParagraphNumber + getParagraphOffset(paragraphHashSelection);
    let endParagraphInstancePosition = paragraphHashPositionToInstancePosition(paragraphHashSelection.end, endParagraphNumber);

    //check paragraph IDs
    let expectedParagraphIds = getParagraphIds(paragraphHashSelection);
    let paragraphOffset = getParagraphOffset(paragraphHashSelection);

    let middleParagraphNumbers = generateMiddleParagraphNumbers(startParagraphNumber, paragraphOffset);

    let verifyResult = verifyParagraphIds(article, startParagraphNumber, paragraphOffset, expectedParagraphIds);

    if (!verifyResult) {
        //expected behavior
        //console.log('verify paragraph IDs failed.');
    }
    //console.log('startParagraphInstancePosition:' + JSON.stringify(startParagraphInstancePosition));
    //console.log('endParagraphInstancePosition:' + JSON.stringify(endParagraphInstancePosition));

    let result = null;
    if (verifyResult) {
        result = {
            start: startParagraphInstancePosition,
            middle: middleParagraphNumbers,
            end: endParagraphInstancePosition,
            endOffset: paragraphOffset,
        };

    }

    return result;
}

function verifyParagraphIds(article, startParagraphNumber, paragraphOffset, expectedParagraphIds) {
    if (!expectedParagraphIds) {
        return false;
    }

    for (let i = 0; i < paragraphOffset + 1; i++) {
        let paragraphNumber = startParagraphNumber + i;
        let actualParagraphId = article.paragraphs[paragraphNumber].paragraphId;
        let expectedParagraphId = expectedParagraphIds[i];
        if (actualParagraphId !== expectedParagraphId) {
            return false;
        }
    }
    return true;
}

function getSelectedTextOfNoteOfParagraph(article, note) {
    let buffer = '';
  
    let paragraphContent;
    const { start, middle, end } = note.selection;
    if (start.paragraphId === end.paragraphId) {
        paragraphContent = article.paragraphMap.get(start.paragraphId);
        buffer = paragraphContent.substring(start.offset, end.offset);
  
    } else {
  
        paragraphContent = article.paragraphMap.get(start.paragraphId);
      let firstParagraphText = paragraphContent.substring(start.offset);
  
  
      let middleContents = [];
      for(let m of middle) {
        let content = article.paragraphMap.get(m);
        middleContents.push(content);
      }
  
      paragraphContent = article.paragraphMap.get(end.paragraphId);
      let lastParagraphText = paragraphContent.substring(0, end.offset);
  
      buffer = firstParagraphText + middleContents.join() + lastParagraphText;
  
    }
  
    return buffer;
}

function getParagraphInstanceSelectionFromArticleSelection(article, articleSelection) {
    let start = getParagraphInstancePositionFromArticlePosition(article, articleSelection.start);
    let end = getParagraphInstancePositionFromArticlePosition(article, articleSelection.end);

    let endOffset = end.paragraphNumber - start.paragraphNumber;
    let middle = []
    for (let i = 1; i < end.paragraphNumber - start.paragraphNumber; i++) {
        let paragraphNumber = start.paragraphNumber + i;
        middle.push(paragraphNumber);
    }

    let paragraphInstanceSelection = {
        type: 'paragraph',
        start,
        middle,
        end,
        endOffset,
    }

    return paragraphInstanceSelection;
}

function getParagraphInstancePositionFromArticlePosition(article, articleOffset) {
    let paragraphInfo = findParagraphInfo(article, articleOffset);
    let paragraphOffset = articleOffset - paragraphInfo.offset;
    let paragraphInstancePosition = {
        paragraphNumber: paragraphInfo.paragraphNumber,
        offset: paragraphOffset,
    };
    return paragraphInstancePosition;
}

function findParagraphInfo(article, articleOffset) {
    let segmentOffset = getSegmentOffset(articleOffset);
    let startParagraphNumberOfSegment = article.segmentOffsetParagraphMap.get(segmentOffset);
    //console.log(`find paragraph info, articleOffset: ${articleOffset}, startParagraphNumberOfSegment: ${startParagraphNumberOfSegment}`);
    for(let i=startParagraphNumberOfSegment; i< article.paragraphs.length; i++) {
        let paragraphInfo = article.paragraphs[i];
        if (paragraphInfo.offset <= articleOffset && articleOffset < (paragraphInfo.offset + paragraphInfo.length)) {
            return paragraphInfo;
        }
    }
    return null;
}

function getParagraphInstanceSelectionsFromParagraphHashSelection(article, paragraphHashSelection) {
    let startParagraphNumbers = article.paragraphIdNumbersMap.get(paragraphHashSelection.start.paragraphId);
  
    let paragraphInstanceSelections = [];
  
    if (startParagraphNumbers) {
      for (let startParagraphNumber of startParagraphNumbers) {
        let paragraphInstanceSelection = getParagraphInstanceSelectionFromParagraphHashSelection(article, paragraphHashSelection, startParagraphNumber);
        if (paragraphInstanceSelection) {
            paragraphInstanceSelections.push(paragraphInstanceSelection);
        }
      }
    }
    return paragraphInstanceSelections;
}

export { getParagraphContentHash, getParagraphOffset, getParagraphIds, generateMiddleParagraphNumbers, paragraphHashPositionToInstancePosition, getParagraphHashSelectionFromInstanceSelection, containsParagraphInstancePosition, getParagraphSegmentOffsets, getParagraphInstanceSelectionFromParagraphHashSelection, getArticleSelectionFromParagraphInstanceSelection, getSelectedTextOfNoteOfParagraph, getParagraphInstanceSelectionFromArticleSelection, getParagraphInstanceSelectionsFromParagraphHashSelection };