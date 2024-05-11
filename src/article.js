'use strict';

import { split } from "sentence-splitter";
import { traverseElement, traverseNode } from './dom.js';
import { annotateWord, annotateNonword } from './word.js';
import { generateMiddleSetenceNumbers, getSentenceContentHash, getSentenceOffset, getSentenceIds, hashPositionToInstancePosition, getSentenceSegmentOffsets, getSegmentOffset } from './sentence.js';
import { searchWord } from './language.js';
import { isTextTag } from './html.js';
import { TEXT_TAG } from './html.js';

/**
 * split text node to words, wrapped by span.
 * in order to show unknown word definition
 * @param {*} document 
 */
function tokenizeTextNode(document) {

    traverseNode(document.body, (node) => {
        //avoid re-enter
        if (isInMeaElement(node.parentElement)) {
            return;
        }
        

        if (node.nodeName === '#text') {
            let textContent = node.textContent;
            
            //some tags are not tokenizable, such as style, script, etc.
            if (!isTextElement(node.parentElement)) {
                const tagsNotLog = ['SCRIPT', 'NOSCRIPT', 'BUTTON', 'g', 'svg'];
                if(!tagsNotLog.includes(node.parentElement.nodeName)){
                    console.log('not text element:'+ node.parentElement.nodeName+ ', textContent:'+textContent);
                }
                
                return;
            }
            

            let tokens = splitText(textContent);

            let tokenHtmls = [];
            for (let token of tokens) {
                let tokenHtml;
                let searchResult = searchWord({
                    query: token.content,
                    allowLemma: true,
                    allowRemoveSuffixOrPrefix: false,
                });
                //console.log(JSON.stringify(searchResult));
                //finally,
                if (searchResult) {// find the correct form which has definition in dictionary
                    let annotatedWord = annotateWord(searchResult, '', '', 0);
                    //console.log(x+'-> '+ annotatedWord);
                    //gTokenNumber++;
                    tokenHtml = annotatedWord;
                } else {
                    //console.log('search failed');
                    let annotated = annotateNonword(token.content, '', '', 0);
                    //gTokenNumber++;
                    tokenHtml = annotated;

                    //return `<span class="mea-container mea-no-word" data-sentence-id="${sentenceId}" data-sentence-number="${sentenceNumber}">${x}</span>`;
                }
                //let tokenHtml = `<span class="mea-container mea-token">${token.content}</span>`;
                tokenHtmls.push(tokenHtml);
            }
            let tokensHtml = tokenHtmls.join('');
            let span = document.createElement('span');
            let spanHtml = `<${TEXT_TAG} class="mea-element mea-text-node">${tokensHtml}</${TEXT_TAG}>`;

            /** TODO?
             let unescapedTextContent = textContent.replace(/\u00a0/g, "&nbsp;")
                .replace(/&/g, "&amp;");
             */
            span.innerHTML = spanHtml;
            node.parentNode.replaceChild(span, node);
        }
    });
}

function splitText(sentence) {
    let parts = [];

    const regexp = /([a-zA-Z][a-zA-Z'&-]+)|([a-zA-Z]+)|([^a-zA-Z]+)/g;
    const str = sentence;
    const matches = str.matchAll(regexp);

    for (const match of matches) {
        let part = {
            content: match[0],
            offset: match.index,
            length: match[0].length,
        };
        parts.push(part);
    }

    return parts;
}

/**
 * parse document into sentences
 * 
 * maintain dom element and sentence mapping relation, so that given any element(node) and offset, we can find it's sentence (hash and number).
 * 
 * @param {*} document 
 */
function parseDocument(document, skip = false) {
    
    let article = {
        currentSentenceNumber: 0,
        sentences: [],
        //<ID, info>
        sentenceMap: new Map(),
        //<ID, number array>
        sentenceIdNumbersMap: new Map(),
        //segment offset, first sentence number of the segment
        segmentOffsetSentenceMap: new Map(),

        paragraphs: [],

        textNodes: [],
        textNodeMap: new Map(),
    };

    //parse paragraph and sentence
    /*
    traverseElement(document.body, (element) => {
        if(isParagraphElement(element)){
            parseParagraph(article, element);

            return 'stop';
        }

    });
      */

    if(!skip) {    
        parseArticleContent(article, document.body.textContent);
        parseArticleTextNodes(article, document.body);

        article.contentLength = document.body.textContent.length;
        article.document = document;
    }

    return article;
}

function parseArticleContent(article, articleContent){
    var lines = breakString(articleContent, '\n');
    
    let offset =0;
    for(let line of lines){

        let paragraphInfo ={
            content : line,
            offset: offset,
            contentLength: line.length,
            sentences: [],
        };

        parseParagraphContent(article, paragraphInfo, line);
        addParagraph(article, paragraphInfo);

        offset += line.length;
    }
}

function parseParagraphContent(article, paragraphInfo, content){
    //console.log('content:'+content);
    let paragraphStartOffsetOfArticle = paragraphInfo.offset;
    let sentences = split(content);

    for (let sentence of sentences) {
     
        
        let tokens = splitText(sentence.raw);
        
        let begin = sentence.range[0];
        let end = sentence.range[1];
        let offsetOfParagraph = begin;
        let offsetOfArticle = paragraphStartOffsetOfArticle + offsetOfParagraph;
        let length = end - begin;

        let sentenceId = getSentenceContentHash(sentence.raw);

        let sentenceInfo = {
            content: sentence.raw,
            offset: offsetOfArticle,
            offsetOfParagraph: offsetOfParagraph,            
            length: length,
            tokens: tokens,
            sentenceId: sentenceId,
            sentenceNumber: article.currentSentenceNumber,
        };
        //console.log(sentenceInfo);
        addSentence(article, paragraphInfo, sentenceInfo);
        
    }
    

    paragraphInfo.contentLength = content.length;
    
}

function parseArticleTextNodes(article, element){
    let offset = 0;
    traverseNode(element, (node) => {
        if (node.nodeName === '#text') {
            let length = node.textContent.length;

            let nodeInfo = { 
                node: node,
                offset: offset, 
                length: length, 
                content: node.textContent 
            };
            
            addArticleNode(article, nodeInfo);
            
            offset += length;
        }
    });

    article.textNodeContentLength = offset;
}

function addArticleNode(article, nodeInfo){
    let { textNodeMap } = article;

    textNodeMap.set(nodeInfo.node, nodeInfo);

    article.textNodes.push(nodeInfo);
}

function addParagraph(article, paragraphInfo){
    let { paragraphs } = article;

    paragraphs.push(paragraphInfo);
}

function addSentence(article, paragraph, sentenceInfo){
    let { sentences, sentenceMap, sentenceIdNumbersMap, segmentOffsetSentenceMap } = article;

    sentences.push(sentenceInfo);

    //update index
    let { sentenceNumber, sentenceId, content } = sentenceInfo;

    sentenceMap.set(sentenceId, content);
    //sentenceNumberIdMap.set(sentenceNumber, sentenceId);

    let segmentOffsets = getSentenceSegmentOffsets(sentenceInfo);
    for(let segmentOffset of segmentOffsets){
        let sentenceNumber = segmentOffsetSentenceMap.get(segmentOffset);
        if(!sentenceNumber){
            segmentOffsetSentenceMap.set(segmentOffset, sentenceInfo.sentenceNumber);
        }
    }

    let numberArray = sentenceIdNumbersMap.get(sentenceId);
    if (!numberArray) {
        numberArray = [];
        
        sentenceIdNumbersMap.set(sentenceId, numberArray);
    }
    numberArray.push(sentenceNumber);


    article.currentSentenceNumber = article.currentSentenceNumber +1;

    //paragraph
    paragraph.sentences.push(sentenceInfo);
}

function breakString(str, ch){
    let lines = [];
    let line = '';
    for(let i=0;i<str.length;i++){

        let c = str.charAt(i);

        line += c;

        if(c===ch){
            lines.push(line);
            line = '';
        }

    }
    if(line!==''){
        lines.push(line);
    }
    
    return lines;
}


function isTextElement(element){
    return isTextTag(element.nodeName);
}

function isInMeaElement(element) {
    if (!element) {
        console.log('null element');
        return false;
    }
    let meaElement = element.closest('.mea-element');
    if (meaElement) {
        return true;
    } else {
        return false;
    }
}

function findTokenInSentence(sentence, offset) {


    for (let token of sentence.tokens) {
        let tokenArtileOffset = sentence.offset + token.offset;

        if (tokenArtileOffset <= offset && offset < (tokenArtileOffset + token.length)) {
            let result = Object.assign({}, token);
            result.articleOffset = tokenArtileOffset;
            console.log('find token in sentence');
            return result;
        }
    }
    return null;
}

function findTokenInArticle(article, offset) {
    let sentence = findSentenceInfo(article, offset);
    if (sentence) {
        return findTokenInSentence(sentence, offset);
    }
    return null;
}

function getNodeSelectionsFromSentenceHashSelection(article, sentenceHashSelection) {

    //console.log('get node selections from sentence hash selection');
    /*steps:
    1. start sentenceId > start sentence numbers
    2. sentence instance selections
    3. article selections
    4. node selections
    */
    let startSentenceNumbers = article.sentenceIdNumbersMap.get(sentenceHashSelection.start.sentenceId);

    let nodeSelections = [];

    if (startSentenceNumbers) {
        //console.log('find start sentence numbers:' + JSON.stringify(startSentenceNumbers));

        for (let startSentenceNumber of startSentenceNumbers) {
            let sentenceInstanceSelection = getSentenceInstanceSelectionFromSentenceHashSelection(article, sentenceHashSelection, startSentenceNumber);
            if (sentenceInstanceSelection) {
                let articleSelection = getArticleSelectionFromSentenceInstanceSelection(article, sentenceInstanceSelection);

                //let nodeSelection = this.getNodeSelectionFromSentenceSelection(sentenceHashSelection, startSentenceNumber);
                let nodeSelection = getNodeSelectionFromArticleSelection(article, articleSelection);

                nodeSelections.push(nodeSelection);

            }
        }
    }
    return nodeSelections;
}

function getNodeSelectionFromArticleSelection(article, articleSelection) {
    let anchorNodePosition = getNodePositionFromOffset(article, articleSelection.start);
    let focusNodePosition = getNodePositionFromOffset(article, articleSelection.end);

    if(!anchorNodePosition || !focusNodePosition){
        return null;
    }

    let nodeSelection = {
        anchorNode: anchorNodePosition.node,
        anchorOffset: anchorNodePosition.offset,

        focusNode: focusNodePosition.node,
        focusOffset: focusNodePosition.offset,
    }
    return nodeSelection;
}

function getNodePositionFromOffset(article, offset){
    let textNodeInfo = findTextNodeInfoByOffset(article, offset);
    if(!textNodeInfo){
        return null;
    }

    let nodeOffset = offset - textNodeInfo.offset;
    let nodePosition = {
        node: textNodeInfo.node,
        offset: nodeOffset,
    };
    return nodePosition;
}

function findTextNodeInfoByOffset(article, offset){
    for(let textNode of article.textNodes){
        if(textNodeContainsOffset(textNode, offset)){
            return textNode;
        }
    }

    return null;
}

function textNodeContainsOffset(textNodeInfo, offset){
    let startOffset = textNodeInfo.offset;
    let endOffset = textNodeInfo.offset + textNodeInfo.length;
    return (startOffset <= offset && offset < endOffset );
}

function getArticleSelectionFromSentenceInstanceSelection(article, sentenceInstanceSelection) {
    let { start, end } = sentenceInstanceSelection;

    let startSentenceInfo = article.sentences[start.sentenceNumber];
    let startArticleOffset = startSentenceInfo.offset + start.offset;

    let endSentenceInfo = article.sentences[end.sentenceNumber];
    let endArticleOffset = endSentenceInfo.offset + end.offset;

    let articleSelection = {
        start: startArticleOffset,
        end: endArticleOffset,
    }
    return articleSelection;
}

function getSentenceInstanceSelectionFromSentenceHashSelection(article, sentenceHashSelection, startSentenceNumber) {
    let startSentenceInstancePosition = hashPositionToInstancePosition(sentenceHashSelection.start, startSentenceNumber);

    let endSentenceNumber = startSentenceNumber + getSentenceOffset(sentenceHashSelection);
    let endSentenceInstancePosition = hashPositionToInstancePosition(sentenceHashSelection.end, endSentenceNumber);

    //check sentence IDs
    let expectedSentenceIds = getSentenceIds(sentenceHashSelection);
    let sentenceOffset = getSentenceOffset(sentenceHashSelection);

    let middleSentenceNumbers = generateMiddleSetenceNumbers(startSentenceNumber, sentenceOffset);

    let verifyResult = verifySentenceIds(article, startSentenceNumber, sentenceOffset, expectedSentenceIds);

    if (!verifyResult) {
        //expected behavior
        //console.log('verify sentence IDs failed.');
    }
    //console.log('startSentenceInstancePosition:' + JSON.stringify(startSentenceInstancePosition));
    //console.log('endSentenceInstancePosition:' + JSON.stringify(endSentenceInstancePosition));

    let result = null;
    if (verifyResult) {
        result = {
            start: startSentenceInstancePosition,
            middle: middleSentenceNumbers,
            end: endSentenceInstancePosition,
            endOffset: sentenceOffset,
        };

    }

    return result;
}

function getNodePositionFromSentenceInstancePosition(document, sentenceInstancePosition) {
    let sentenceNumber = sentenceInstancePosition.sentenceNumber;
    let sentenceOffset = sentenceInstancePosition.offset;
    let selector = `.mea-sentence[data-sentence-number='${sentenceNumber}']`;
    let sentenceElement = document.querySelector(selector);
    let sentenceBuffer = '';

    let result = null;
    if (sentenceElement) {
        //console.log('find sentence element, sentence number:' + sentenceNumber);

        let done = false;

        traverseNode(sentenceElement, (node) => {
            if (done) {
                return;
            }

            if (node.nodeName === '#text') {
                sentenceBuffer = sentenceBuffer + node.textContent;
                if (sentenceBuffer.length >= sentenceOffset) {

                    //calc offset
                    let nodeOffset = node.textContent.length - (sentenceBuffer.length - sentenceOffset);

                    result = { node, offset: nodeOffset };

                    done = true;
                }

            }
        });
    }
    return result;
}

function verifySentenceIds(article, startSentenceNumber, sentenceOffset, expectedSentenceIds) {
    if (!expectedSentenceIds) {
        return false;
    }

    for (let i = 0; i < sentenceOffset + 1; i++) {
        let sentenceNumber = startSentenceNumber + i;
        let actualSentenceId = article.sentences[sentenceNumber].sentenceId;
        let expectedSentenceId = expectedSentenceIds[i];
        if (actualSentenceId !== expectedSentenceId) {
            return false;
        }
    }
    return true;
}

function getSentenceInstanceSelectionFromNodeSelection(article, nodeSelection) {
    let articleSelection = getArticleSelectionFromNodeSelection(article, nodeSelection);
    let sentenceInstanceSelection = getSentenceInstanceSelectionFromArticleSelection(article, articleSelection);
    return sentenceInstanceSelection;
}

function getSentenceInstanceSelectionFromArticleSelection(article, articleSelection) {
    let start = getSentenceInstancePositionFromArticlePosition(article, articleSelection.start);
    let end = getSentenceInstancePositionFromArticlePosition(article, articleSelection.end);

    let endOffset = end.sentenceNumber - start.sentenceNumber;
    let middle = []
    for (let i = 1; i < end.sentenceNumber - start.sentenceNumber; i++) {
        let sentenceNumber = start.sentenceNumber + i;
        middle.push(start.sentenceNumber);
    }


    let sentenceInstanceSelection = {
        start,
        middle,
        end,
        endOffset,
    }

    return sentenceInstanceSelection;
}

function getSentenceInstancePositionFromArticlePosition(article, articleOffset) {
    let sentenceInfo = findSentenceInfo(article, articleOffset);
    let sentenceOffset = articleOffset - sentenceInfo.offset;
    let sentenceInstancePosition = {
        sentenceNumber: sentenceInfo.sentenceNumber,
        offset: sentenceOffset,
    };
    return sentenceInstancePosition;
}

function findSentenceInfo(article, articleOffset) {
    let segmentOffset = getSegmentOffset(articleOffset);
    let startSentenceNumberOfSegment = article.segmentOffsetSentenceMap.get(segmentOffset);
    //console.log(`find sentence info, articleOffset: ${articleOffset}, startSentenceNumberOfSegment: ${startSentenceNumberOfSegment}`);
    for(let i=startSentenceNumberOfSegment; i< article.sentences.length; i++) {
        let sentenceInfo = article.sentences[i];
        if (sentenceInfo.offset <= articleOffset && articleOffset < (sentenceInfo.offset + sentenceInfo.length)) {
            return sentenceInfo;
        }
    }
    return null;
}

function getArticleSelectionFromNodeSelection(article, nodeSelection) {
    let { anchorNode, anchorOffset, focusNode, focusOffset } = nodeSelection;

    let anchorNodeInfo = article.textNodeMap.get(anchorNode);
    let focusNodeInfo = article.textNodeMap.get(focusNode);

    let anchorArticleOffset = anchorNodeInfo.offset + anchorOffset;
    let focusArticleOffset = focusNodeInfo.offset + focusOffset;

    let start, end;
    if (anchorArticleOffset < focusArticleOffset) {
        start = anchorArticleOffset;
        end = focusArticleOffset;
    } else {
        start = focusArticleOffset;
        end = anchorArticleOffset;
    }

    let articleSelection = {
        start,
        end
    };
    //console.log('get article selection:'+JSON.stringify(articleSelection));
    return articleSelection;
}

function getSentenceInstanceSelectionsFromSentenceHashSelection(article, sentenceHashSelection) {
    let startSentenceNumbers = article.sentenceIdNumbersMap.get(sentenceHashSelection.start.sentenceId);
  
    let sentenceInstanceSelections = [];
  
    if (startSentenceNumbers) {
      for (let startSentenceNumber of startSentenceNumbers) {
        let sentenceInstanceSelection = getSentenceInstanceSelectionFromSentenceHashSelection(article, sentenceHashSelection, startSentenceNumber);
        if (sentenceInstanceSelection) {
          sentenceInstanceSelections.push(sentenceInstanceSelection);
        }
      }
    }
    return sentenceInstanceSelections;
}


function getSelectedTextOfNote(article, note) {
    let buffer = '';
  
    let sentenceContent;
    const { start, middle, end } = note.selection;
    if (start.sentenceId === end.sentenceId) {
      sentenceContent = article.sentenceMap.get(start.sentenceId);
      buffer = sentenceContent.substring(start.offset, end.offset);
  
    } else {
  
      sentenceContent = article.sentenceMap.get(start.sentenceId);
      let firstSentenceText = sentenceContent.substring(start.offset);
  
  
      let middleContents = [];
      for(let m of middle) {
        let content = article.sentenceMap.get(m);
        middleContents.push(content);
      }
  
      sentenceContent = article.sentenceMap.get(end.sentenceId);
      let lastSentenceText = sentenceContent.substring(0, end.offset);
  
      buffer = firstSentenceText + middleContents.join() + lastSentenceText;
  
    }
  
    return buffer;
}

export { tokenizeTextNode, parseDocument, findTokenInArticle, getNodeSelectionsFromSentenceHashSelection, getSentenceInstanceSelectionFromNodeSelection, getSentenceInstanceSelectionsFromSentenceHashSelection, getSelectedTextOfNote };