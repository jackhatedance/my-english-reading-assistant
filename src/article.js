'use strict';

import { split } from "sentence-splitter";
import { tokenizeSentence, tokenizeNodeText } from "./text/tokenizer.js";
import { traverseNode } from './dom.js';
import { annotateWord, annotateNonword, updateWordAnnotation, updateNonWordAnnotation, getWordFromElement, getBaseWordFromElement } from './word.js';
import { getSegmentOffset } from './segment.js';
import { getParagraphContentHash, getParagraphSegmentOffsets, getParagraphInstanceSelectionFromParagraphHashSelection, getArticleSelectionFromParagraphInstanceSelection, getSelectedTextOfNoteOfParagraph, getParagraphInstanceSelectionFromArticleSelection } from './paragraph.js';
import { generateMiddleSetenceNumbers, getSentenceContentHash, getSentenceOffset, getSentenceIds, sentenceHashPositionToInstancePosition, getSentenceSegmentOffsets } from './sentence.js';
import { searchWord, buildDictionaryOptions, isKnown } from './language.js';
import { TEXT_TAG, TOKEN_TAG } from './html.js';
import { getSimplifyDefinitionOptions } from './service/site-option-service.js';
import { trimPunctuations } from './text/textUtils.js';
import { deleteUnrecognizedWord } from './service/dictionaryService.js';
import log from 'loglevel'
import { containsDefinitionGroupNames } from './dictionary/entry-utils.js'
import { getMeaTokenElement, getFirstTextNode } from './token.js'
import { hasIntersections } from './utils/range.js'
import { startOperation, endOperation, operationToString } from './utils/operation-time-util.js'

const gLogger = log.getLogger('article');

const CONTENT_TYPE_NORMAL = 'normal';
const CONTENT_TYPE_NO_PARSE = 'noParse';
/**
 * split text node to words, wrapped by span.
 * in order to show unknown word definition
 * @param {*} document 
 */
function tokenizeTextNode(document, article, options, siteOptions, siteProfile, knownWords, partialTokenization, refreshOptions) {
    let simplifyDefinitionOptions = getSimplifyDefinitionOptions(options, siteOptions);

    //console.log('simplifyDefinitionOptions:'+ JSON.stringify(simplifyDefinitionOptions));
    let refreshRanges = getRefreshRanges(article, refreshOptions);
    
    var tokenCount = 0;
    var tokenNodeCount = 0;

    for(const nodeInfo of article.originalTextNodes){
        const { node, offset, length, content } = nodeInfo;

        const needCheckRefreshRanges = refreshRanges != null;
        if(needCheckRefreshRanges){
            let inRanges = inRefreshRanges(nodeInfo, refreshRanges);
            if(!inRanges){
                continue;
            }
        }

        //return 'stop' will no longer process it internal content
        if(!siteProfile.canElementBeTokenized(node.parentElement)){
            continue;
        }

        if (node.nodeName === '#text') {
            if (!siteProfile.canNodeBeTokenized(node)) {
                continue;
            }
            let textContent = content;
            //console.log(node.parentElement.nodeName);
            gLogger.debug(textContent);

            let firstToken = findTokenInArticle(article, offset);
            if(!firstToken){
                gLogger.error('token not found');
            }
            let tokenIndex = article.tokens.indexOf(firstToken);
            let nodeStartOffset = offset;
            let nodeEndOffset = offset + length;

            let nodeTokens = [];
            while(true){
                if(tokenIndex >= article.tokens.length){
                    break;
                }
                let articleToken = article.tokens[tokenIndex];
                //console.log(articleToken);
                let articleTokenStartOffset = articleToken.sentenceOffsetOfArticle + articleToken.offset;
                if(articleTokenStartOffset >= nodeEndOffset){
                    break;
                }

                let nodeTokenStartOffset = articleTokenStartOffset < nodeStartOffset ? nodeStartOffset : articleTokenStartOffset; 
                
                let articleTokenEndOffset = articleTokenStartOffset + articleToken.length;
                let nodeTokenEndOffset = articleTokenEndOffset > nodeEndOffset ? nodeEndOffset : articleTokenEndOffset;

                let nodeTokenOriginalContent = articleToken.originalContent.substring(nodeTokenStartOffset - articleTokenStartOffset, nodeTokenEndOffset - articleTokenStartOffset);
                let nodeTokenContentLength = nodeTokenOriginalContent.length;

                let nodeToken = {
                    originalContent: nodeTokenOriginalContent,
                    content: articleToken.content,

                    word: articleToken.word,
                    
                    offset: nodeTokenStartOffset,
                    length: nodeTokenContentLength,
                };
                nodeTokens.push(nodeToken);
                //console.log('node token'+nodeToken.originalContent);

                tokenIndex++;
            }
            
            //let tokens = tokenizeNodeText((text, lookupBase='Never')=>checkWord(siteOptions, text, lookupBase), textContent);
            //console.log(siteOptions);

            let tokenParts = [];
            for (let nodeToken of nodeTokens) {
                let tokenPart;
                
                //note
                let hasNoteResult = hasNote(nodeToken, article.notes);
                
                let query = nodeToken.word? nodeToken.word: trimPunctuations(nodeToken.content); 
                //console.log('before trim punctuation:'+query);
                
                //console.log('nodeTokens to query:'+query);
                
                let searchResult = searchWord(query, {                    
                    allowLemma: true,
                    lookupBase: 'Always',
                    dictionaryOptions: buildDictionaryOptions(siteOptions),
                });

                //console.log(JSON.stringify(searchResult));
                //finally,
                if (searchResult) {// find the correct form which has definition in dictionary
                    let annotatedWordResult = annotateWord(nodeToken.originalContent, searchResult, '', '', 0, simplifyDefinitionOptions, options.pronunciation.region, siteOptions);
                    const { targetWord, outerHTML} = annotatedWordResult;
                    
                    let bIsWord = targetWord != null && targetWord != '';
                    let bIsKnownWord;
                    if(bIsWord){
                        bIsKnownWord = isKnown(targetWord, knownWords);

                    }

                    let tokenPartType;
                    if(partialTokenization){	
                        let isUnknownWord = bIsWord && !bIsKnownWord;
                        if(isUnknownWord || hasNoteResult){
                            tokenPartType = 'token';    
                        } else {
                            tokenPartType = 'text'
                        }
                    } else {
                        tokenPartType = 'token'
                    }

                    if(tokenPartType == 'text'){	
                        tokenPart = { type: 'text', content: nodeToken.originalContent };
                    } else {
                        tokenPart = { type: 'token', content: outerHTML };
                        tokenNodeCount++;
                    }
                    //console.log(x+'-> '+ annotatedWord);
                    //gTokenNumber++;
                    
                } else {
                    //console.log('search failed');
                    let tokenPartType;

                    if(partialTokenization){	
                        if(hasNoteResult){
                            tokenPartType = 'token';    
                        } else {
                            tokenPartType = 'text'
                        }
                    } else {
                        tokenPartType = 'token'
                    }

                    if(tokenPartType == 'text'){	
                        tokenPart = { type: 'text', content: nodeToken.originalContent };
                    } else {
                        let annotated = annotateNonword(nodeToken.originalContent, '', '', 0);
                        tokenPart = { type: 'token', content: annotated };
                        tokenNodeCount++;
                    }
                    
                    //gTokenNumber++;
                    //return `<span class="mea-container mea-no-word" data-sentence-id="${sentenceId}" data-sentence-number="${sentenceNumber}">${x}</span>`;
                }
                //let tokenHtml = `<span class="mea-container mea-token">${token.content}</span>`;
                tokenParts.push(tokenPart);

                tokenCount ++;
            }
            /*
            let tokensHtml = tokenHtmls.join('');
            let textTag = document.createElement(TEXT_TAG);
            textTag.classList.add('mea-element');
            textTag.classList.add('mea-text-node');
            */
            /** TODO?
             let unescapedTextContent = textContent.replace(/\u00a0/g, "&nbsp;")
                .replace(/&/g, "&amp;");
             */
            /*
            textTag.innerHTML = tokensHtml;
            node.parentNode.replaceChild(textTag, node);
            */


            //merge adjacent text nodes
            let mergedTokenParts = [];
            let mergedTokenPartIndex = -1;
            let lastTokenPart;
            for(var tokenPart of tokenParts){
                
                if(tokenPart.type =='text'){
                    
                    if(lastTokenPart?.type =='text'){//merge
                        let mergedTokenPart = mergedTokenParts[mergedTokenPartIndex];
                        mergedTokenPart.content += tokenPart.content;
                    }else{
                        mergedTokenPartIndex++;
                        mergedTokenParts[mergedTokenPartIndex] = { type: 'text', content:tokenPart.content};
                    }
                }else{
                    mergedTokenPartIndex++;
                    mergedTokenParts[mergedTokenPartIndex] = { type: 'token', content: tokenPart.content};
                }

                lastTokenPart = tokenPart;
            }

            let oneTextNode = mergedTokenParts.length == 1 && mergedTokenParts[0].type == 'text';
            
            if(!oneTextNode) {
                const parentElement = node.parentElement;
                const nextSibling = node.nextSibling;
                parentElement.removeChild(node);
                for(const tokenPart of mergedTokenParts){
                    if (nextSibling) {

                        let newNode = createTokenNode(document, tokenPart);
                        parentElement.insertBefore(newNode, nextSibling);
                        updateMeaTokenOutHTML(newNode, tokenPart);
                    } else {
                        let newNode = createTokenNode(document, tokenPart);
                        parentElement.appendChild(newNode);
                        updateMeaTokenOutHTML(newNode, tokenPart);
                    }
                }
            }
        }
    }

    delete article.originalTextNodes;

    gLogger.info(`${tokenNodeCount}/${tokenCount} DOM tokens generated`);
}


function getRefreshRanges(article, refreshOptions){
    if(refreshOptions==null){
        return null;
    }

    let ranges = [];
    
    const {words, noteSelections } = refreshOptions;

    //mark as unknown word
    if(words!=null && words.length >0){
        for(const word of words) {
            let tokens = article.targetWordMap.get(word);
            for(const token of tokens){
                let offset = token.sentenceOffsetOfArticle + token.offset;
                ranges.push({offset: offset, length : token.length });
            }
        }
    }

    if(noteSelections!=null && noteSelections.length > 0){
        for(const noteSelection of noteSelections){
            let articleSelections = getArticleSelectionsFromHashSelection(article, noteSelection);
            console.log(articleSelections);
            for(const articleSelection of articleSelections){
                let offset = articleSelection.start;
                let length = articleSelection.end - articleSelection.start;
                ranges.push({offset: offset, length : length });
            }
        }
    }

    return ranges;
}

function inRefreshRanges(nodeInfo, refreshRanges){
    const nodeRange = {min : nodeInfo.offset, max: nodeInfo.offset + nodeInfo.length};
    return refreshRanges.some(range => hasIntersections({min: range.offset, max: range.offset + range.length}, nodeRange));
}

function hasNote(nodeToken, notes){
    let nodeTokenRange = { min: nodeToken.offset, max: nodeToken.offset + nodeToken.length};
    for(const note of notes){
        for(const selection of note.articleSelections){
            let selectionRange = { min: selection.start, max: selection.end};
            let has = hasIntersections(nodeTokenRange, selectionRange);
            if(has==true){
                return true;
            }
        }
        
    }
    return false;
}


function createTokenNode(document, tokenPart){
    const {type, content} = tokenPart;
    if(type=='text'){
        const node = document.createTextNode(content);
        return node;
    }else{
        let element = document.createElement('mea-token');
        
        return element;
    }
}

//TODO maybe use updateAnnotation method is better
function updateMeaTokenOutHTML(element, tokenPart){
    if(tokenPart.type=='token'){
        element.outerHTML = tokenPart.content;
    }
}

function detokenizeTextNode(document) {
   document.querySelectorAll(TEXT_TAG).forEach((element) => {
        let textContent = element.textContent;
        element.outerHTML = textContent;
   });
   document.querySelectorAll(TOKEN_TAG).forEach((element) => {
        let textContent = element.textContent;
        element.outerHTML = textContent;
   });
}

/**
 * parse document into sentences
 * 
 * maintain dom element and sentence mapping relation, so that given any element(node) and offset, we can find it's sentence (hash and number).
 * 
 * @param {*} document 
 */
function parseDocument(document, options, siteOptions, skip = false) {
    
    let article = {
        //snapshot begin
        textContent: '',
        textContentLength: 0,
        newTagPositions: {},

        originalTextNodes: [],
        //snapshot end

        tokens: [],
        wordsCount: 0,
        //target word, token Array
        targetWordMap: new Map(),

        currentSentenceNumber: 0,
        sentences: [],
        //<ID, info>
        sentenceMap: new Map(),
        //<ID, number array>
        sentenceIdNumbersMap: new Map(),
        //segment offset, first sentence number of the segment
        segmentOffsetSentenceMap: new Map(),

        currentParagraphNumber: 0,
        paragraphs: [],
        //<ID, info>
        paragraphMap: new Map(),
        //<ID, number array>, why number is an array? because some paragraphs have same text content.
        paragraphIdNumbersMap: new Map(),
        //segment offset, first sentence number of the segment
        segmentOffsetParagraphMap: new Map(),


        //found in content
        isbns: [],


        notes: [],

        // BEGIN of DOM stuff, which are not pure article stuff

        textNodes: [],
        //key is node, value is nodeInfo
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
        //let lines = getParagraphLines2(document.body);
        const snapshotOperation = startOperation('snapshot');
        snapshot(document, article);
        endOperation(snapshotOperation);
        gLogger.info(operationToString(snapshotOperation));

        let blocks = splitByNoParseBlocks(article.textContent, article.newTagPositions.noParseRangeCollection);
        let lines = [];
        for(const block of blocks){
            if(block.type == CONTENT_TYPE_NO_PARSE){
                lines.push(block);
            } else {
                let blockLines = breakString(block.content, '\n');
                for(const blockLine of blockLines){
                    lines.push({ type: CONTENT_TYPE_NORMAL, content: blockLine});
                }
            }
        }
        
        let newTagPositions = article.newTagPositions;
        //console.log('newTagPositions');
        //parse paragraph, token
        const parseArticleOperation = startOperation('parseArticle');
        parseArticleTextContent(siteOptions, article, lines, newTagPositions);
        endOperation(parseArticleOperation);
        gLogger.info(operationToString(parseArticleOperation));

        //parse text node(offset)
        //parseArticleTextNodes(article, document.body, options, siteOptions);

        article.contentLength = document.body.textContent.length;
        article.document = document;
        
        countWords(article);
    }

    gLogger.info(`${article.tokens.length} article tokens generated`);

    return article;
}

function countWords(article){
    let wordsCount=0;

    for(const token of article.tokens){
        const { targetWord } = token;
        let bIsWord = targetWord != null && targetWord != '';
        if(bIsWord){
            wordsCount ++;
        }
    }

    article.wordsCount = wordsCount;
}

function splitByNoParseBlocks(content, noParseRangeCollection){
    let blocks = [];

    let lastOffset = 0;
    let lastRange;
    for(const range of noParseRangeCollection.ranges){
        if(range.offset > lastOffset){
            let blockContent = content.substring(lastOffset, range.offset);
            let block = { type: CONTENT_TYPE_NORMAL, content: blockContent};
            blocks.push(block);
        }

        let endOffset = range.offset + range.length;
        let blockContent = content.substring(range.offset, endOffset);
        let block = { type: CONTENT_TYPE_NO_PARSE, content: blockContent};
        blocks.push(block);

        lastOffset = endOffset;
        lastRange = range;
    }

    if(lastOffset<content.length){
        let blockContent = content.substring(lastOffset);
        let block = { type: CONTENT_TYPE_NORMAL, content: blockContent};
        blocks.push(block);
    }

    return blocks;
}

function collectNodeRanges(node, tags, collection){
    
    if (node.nodeName === '#text') {
        let parentElement = node.parentElement;
        
        if(tags.includes(parentElement.nodeName)){
            let contentLength = node.textContent.length;
            if(collection.pos > collection.lastPos && contentLength > 0){
                let range = { offset: collection.pos, length: contentLength};
                collection.ranges.push(range);
                collection.lastPos = collection.pos;
            }
        }else{
            //console.log(node.textContent);
        }

        collection.pos += node.textContent.length;
    }
}

function collectNodePositions(node, tags, collection){
    
    if(tags.includes(node.nodeName)){
        if(collection.pos > collection.lastPos){
            collection.positions.push(collection.pos);
            collection.lastPos = collection.pos;
        }
    }

    if (node.nodeName === '#text') {
        collection.pos += node.textContent.length;
    }
}

function parseArticleTextContent(siteOptions, article, lines, newTagPositions){
    
    let offset =0;
    var paragraphNumber = 0;
    for(let line of lines){
        let lineContentLength = line.content.length;

        let paragraphInfo ={
            content : line.content,
            offset: offset,
            length: lineContentLength,
            paragraphNumber : paragraphNumber,
            sentences: [],
        };

        parseParagraphContent(siteOptions, article, paragraphInfo, line, newTagPositions);
        addParagraph(article, paragraphInfo);

        offset += lineContentLength;
        paragraphNumber++;
    }
    article.length = offset;
}


function extractIsbn(content) {
    return [];
    /* not need to extract isbn from page content.
    let isbns = [];

    if(content.includes('ISBN')){
        //console.log('ISBN:'+content);
    }

    const regexp = /ISBN[^\d]+([\d-]+)/g;
    const str = content;
    const matches = str.matchAll(regexp);

    for (const match of matches) {
        
        isbns.push(match[1]);
    }

    return isbns;
    */
}

function parseParagraphContent(siteOptions, article, paragraphInfo, line, newTagPositions){
    let content = line.content;

    //search isbn
    let isbns = extractIsbn(content);
    if(isbns){
        for(let i of isbns){
            article.isbns.push(i);
        }
    }
    

    //console.log('paragraph:'+content);
    let paragraphStartOffsetOfArticle = paragraphInfo.offset;
    let sentences;
    let noParse = line.type == CONTENT_TYPE_NO_PARSE;
    if(noParse){
        sentences = [{
            range:[0, content.length],
            raw: content,
        }];
    } else {
        sentences = split(content);
    }

    for (let sentence of sentences) {
             
        let begin = sentence.range[0];
        let end = sentence.range[1];
        let offsetOfParagraph = begin;
        let offsetOfArticle = paragraphStartOffsetOfArticle + offsetOfParagraph;
        let length = end - begin;

        let sentenceId = getSentenceContentHash(sentence.raw);

        let tokens = tokenizeSentence((text, lookupBase='Never')=>checkWord(siteOptions, text, lookupBase), sentence.raw, noParse, offsetOfArticle, newTagPositions);

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
    
    paragraphInfo.paragraphId = getParagraphContentHash(content);
    
}

function checkWord(siteOptions, text, lookupBase){
    let searchResult = searchWord(text, {
        allowLemma: false,
        lookupBase: lookupBase,
        dictionaryOptions: buildDictionaryOptions(siteOptions),	
        anonymous: true,
    });

    let result ;
    if(searchResult){

        let isPreposition = containsDefinitionGroupNames(searchResult.lookupResult.json, ['prep.', 'preposition']);
        result = {
            word: searchResult.word,
            baseWord: searchResult.baseWord,
            isPreposition: isPreposition,
        };
    }
    return result;
}

/**
 * snapshot of textContent and textNodes
 * @param {*} document 
 * @param {*} article 
 */
function snapshot(document, article){
    var textContents = [];
    let offset = 0;

    const NO_PARSE_ELEMENTS = ['SCRIPT', 'NOSCRIPT', 'STYLE', 'SVG'];

    let noParseRangeCollection = {
        ranges: [],
        pos: 0,
        lastPos: -1,
    };

    const NEW_LINE_ELEMENTS = ['DIV', 'P', 'BR'];
    const NEW_WORD_ELEMENTS = ['SUP'];
    
    let newLinePositionCollection = {
        positions: [],
        pos: 0,
        lastPos: 0,
    };

    let newWordPositionCollection = {
        positions: [],
        pos: 0,
        lastPos: 0,
    };

    traverseNode(document.body, (node) => {
        collectNodeRanges(node, NO_PARSE_ELEMENTS, noParseRangeCollection);

        collectNodePositions(node, NEW_LINE_ELEMENTS, newLinePositionCollection);
        collectNodePositions(node, NEW_WORD_ELEMENTS, newWordPositionCollection);

        if (node.nodeName === '#text') {
            let nodeContent = node.textContent;
            let length = nodeContent.length;
            //console.log(node.textContent);

            textContents.push(nodeContent);

            let nodeInfo = { 
                node: node,
                offset: offset, 
                length: length, 
                content: nodeContent,
            };
            
            //addArticleNode(article, nodeInfo);
            article.originalTextNodes.push(nodeInfo);
            
            offset += length;
        }
    });

    let textContent = textContents.join("");

    article.textContent = textContent;
    article.textContentLength = textContent.length;

    article.newTagPositions = {
        noParseRangeCollection: noParseRangeCollection,
        
        newLinePositions: newLinePositionCollection.positions,
        newWordPositions: newWordPositionCollection.positions,
    };
    
}

function parseArticleTextNodes(article, element, options, siteOptions){
    let simplifyDefinitionOptions = getSimplifyDefinitionOptions(options, siteOptions);

    let offset = 0;
    traverseNode(element, (node) => {
        if (node.nodeName === '#text') {
            let nodeContent = node.textContent;
            let length = nodeContent.length;
            //console.log(node.textContent);

            let nodeInfo = { 
                node: node,
                offset: offset, 
                length: length, 
                content: nodeContent,
            };
            
            addArticleNode(article, nodeInfo);


            let token = findTokenInArticle(article, offset);
            //console.log(token);
            
            //debug purpose
            
            
            if(node.textContent.includes('lord.')){
                //console.log(node.textContent);
                //console.log(token);
            }
            
            var meaTokenElement, dataWord, dataBaseWord, showAnnotation;
            if(token){
                meaTokenElement = getMeaTokenElement(node);
                if(meaTokenElement){
                    dataWord = getWordFromElement(meaTokenElement);
                    dataBaseWord = getBaseWordFromElement(meaTokenElement);
                    
                    const regex = /[a-zA-Z]/;
                    const firstAlphabetIndex = token.content.search(regex);
                    const firstAlphabetIndexOfArticle = token.sentenceOffsetOfArticle + token.offset + firstAlphabetIndex;

                    //firstTextNodeOfMeaTokenElement
                    const firstTextNode = getFirstTextNode(meaTokenElement);
                    let firstTextNodeInfo;
                    if(node == firstTextNode){
                        firstTextNodeInfo = nodeInfo;
                    } else {
                        firstTextNodeInfo = article.textNodeMap.get(firstTextNode);
                    }

                    const meaTokenElementOffset = firstTextNodeInfo.offset;
                    const meaTokenElementTextLength = meaTokenElement.textContent.length;

                    const meaTokenElementContainsFirstAlphabet = meaTokenElementOffset <= firstAlphabetIndexOfArticle
                        && meaTokenElementOffset + meaTokenElementTextLength > firstAlphabetIndexOfArticle;

                    showAnnotation = meaTokenElementContainsFirstAlphabet;
                }
            }
            
            if(token
                && meaTokenElement
                && (
                    dataWord != token.checkWordResult?.word
                    || dataBaseWord != token.checkWordResult?.baseWord
                    || !showAnnotation
                )
            ){  
                if(token.checkWordResult) {
                    let contentWithoutPunctuation = trimPunctuations(token.content);
                    //console.log(contentWithoutPunctuation);
                    let searchResult = searchWord(token.word, {
                        allowLemma: true,
                        lookupBase: 'Always',
                        transform: token.transform,
                        dictionaryOptions: buildDictionaryOptions(siteOptions),
                    });
                    if(searchResult) {
                        updateWordAnnotation(node.parentElement, searchResult, showAnnotation, simplifyDefinitionOptions, options.pronunciation.region);


                        //in case the wrong word has been searched
                        //console.log('deleteUnrecognizedWord, node content:'+nodeContent + '; token content:'+token.content);
                        deleteUnrecognizedWord(nodeContent);
                    } else {
                        updateNonWordAnnotation(node.parentElement, contentWithoutPunctuation);
                        //console.log('search not found:' + token.content);
                    }
                }
            }
        
            
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
    let { paragraphs, paragraphMap, paragraphIdNumbersMap, segmentOffsetParagraphMap } = article;
    
    paragraphs.push(paragraphInfo);

    //update index
    let { paragraphNumber, paragraphId, content } = paragraphInfo;

    paragraphMap.set(paragraphId, content);
    //paragraphNumberIdMap.set(paragraphNumber, paragraphId);

    let segmentOffsets = getParagraphSegmentOffsets(paragraphInfo);
    for(let segmentOffset of segmentOffsets){
        let paragraphNumber = segmentOffsetParagraphMap.get(segmentOffset);
        if(!paragraphNumber){
            segmentOffsetParagraphMap.set(segmentOffset, paragraphInfo.paragraphNumber);
        }
    }

    let numberArray = paragraphIdNumbersMap.get(paragraphId);
    if (!numberArray) {
        numberArray = [];
        
        paragraphIdNumbersMap.set(paragraphId, numberArray);
    }
    numberArray.push(paragraphNumber);


    article.currentParagrapheNumber = article.currentParagraphNumber +1;

}

function addSentence(article, paragraph, sentenceInfo){
    let { sentences, sentenceMap, sentenceIdNumbersMap, segmentOffsetSentenceMap } = article;

    //console.log(sentenceInfo.tokens);
    article.tokens.push(...sentenceInfo.tokens);

    //add to targetWordMap
    for(const token of sentenceInfo.tokens){
        let targetWord = token.targetWord;
        let tokens = article.targetWordMap.get(targetWord);
        if(tokens==null){
            tokens = [];
            article.targetWordMap.set(targetWord, tokens);
        }
        tokens.push(token);
    }

    sentences.push(sentenceInfo);

    //update index
    let { sentenceNumber, sentenceId, content } = sentenceInfo;

    sentenceMap.set(sentenceId, content);
    //sentenceNumberIdMap.set(sentenceNumber, sentenceId);

    let segmentOffsets = getSentenceSegmentOffsets(sentenceInfo);
    for(let segmentOffset of segmentOffsets){
        if(!segmentOffsetSentenceMap.has(segmentOffset)){
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

function findTokenIndexOfSentence(sentence, offset) {
    for (let i =0; i< sentence.tokens.length; i++) {
        let token = sentence.tokens[i];
        let tokenArtileOffset = sentence.offset + token.offset;

        if (tokenArtileOffset <= offset && offset < (tokenArtileOffset + token.length)) {
            return i;
        }
    }
    return -1;
}

function findTokenInSentence(sentence, offset) {
    let index = findTokenIndexOfSentence(sentence, offset);
    if(index>=0){
        let token = sentence.tokens[index];
        let tokenArtileOffset = sentence.offset + token.offset;
        //let result = Object.assign({}, token);
        //console.log('find token in sentence');
        return token;
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

function getArticleSelectionsFromSentenceHashSelection(article, sentenceHashSelection) {

    //console.log('get node selections from sentence hash selection');
    /*steps:
    1. start sentenceId > start sentence numbers
    2. sentence instance selections
    3. article selections
    4. node selections
    */
    let startSentenceNumbers = article.sentenceIdNumbersMap.get(sentenceHashSelection.start.sentenceId);

    let articleSelections = [];

    if (startSentenceNumbers) {
        //console.log('find start sentence numbers:' + JSON.stringify(startSentenceNumbers));

        for (let startSentenceNumber of startSentenceNumbers) {
            let sentenceInstanceSelection = getSentenceInstanceSelectionFromSentenceHashSelection(article, sentenceHashSelection, startSentenceNumber);
            if (sentenceInstanceSelection) {
                let articleSelection = getArticleSelectionFromSentenceInstanceSelection(article, sentenceInstanceSelection);

                articleSelections.push(articleSelection);
            }
        }
    }
    return articleSelections;
}

function getArticleSelectionsFromHashSelection(article, selection){
    let articleSelections = [];

    let selectionType = selection.type;
    if(selectionType === 'paragraph'){
        articleSelections = getArticleSelectionsFromParagraphHashSelection(article, selection);
    } else {
        articleSelections = getArticleSelectionsFromSentenceHashSelection(article, selection);
    }

    return articleSelections;
}

function getArticleSelectionsFromParagraphHashSelection(article, paragraphHashSelection) {

    //console.log('get node selections from paragraph hash selection');
    /*steps:
    1. start paragraphId > start paragraph numbers
    2. paragraph instance selections
    3. article selections
    4. node selections
    */
    let startParagraphNumbers = article.paragraphIdNumbersMap.get(paragraphHashSelection.start.paragraphId);

    let articleSelections = [];

    if (startParagraphNumbers) {
        //console.log('find start paragraph numbers:' + JSON.stringify(startParagraphNumbers));

        for (let startParagraphNumber of startParagraphNumbers) {
            let paragraphInstanceSelection = getParagraphInstanceSelectionFromParagraphHashSelection(article, paragraphHashSelection, startParagraphNumber);
            if (paragraphInstanceSelection) {
                let articleSelection = getArticleSelectionFromParagraphInstanceSelection(article, paragraphInstanceSelection);

                articleSelections.push(articleSelection);

            }
        }
    }
    return articleSelections;
}

function getNodeSelectionFromHashSelection(article, selection){
    
    let articleSelections = getArticleSelectionsFromHashSelection(article, selection);
    
    let nodeSelections = [];
    for(const articleSelection of articleSelections){
        let nodeSelection = getNodeSelectionFromArticleSelection(article, articleSelection);
        nodeSelections.push(nodeSelection);
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
    let startSentenceInstancePosition = sentenceHashPositionToInstancePosition(sentenceHashSelection.start, startSentenceNumber);

    let endSentenceNumber = startSentenceNumber + getSentenceOffset(sentenceHashSelection);
    let endSentenceInstancePosition = sentenceHashPositionToInstancePosition(sentenceHashSelection.end, endSentenceNumber);

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

function getParagraphInstanceSelectionFromNodeSelection(article, nodeSelection) {
    let articleSelection = getArticleSelectionFromNodeSelection(article, nodeSelection);
    let paragraphInstanceSelection = getParagraphInstanceSelectionFromArticleSelection(article, articleSelection);
    return paragraphInstanceSelection;
}

function getSentenceInstanceSelectionFromArticleSelection(article, articleSelection) {
    let start = getSentenceInstancePositionFromArticlePosition(article, articleSelection.start);
    let end = getSentenceInstancePositionFromArticlePosition(article, articleSelection.end);

    let endOffset = end.sentenceNumber - start.sentenceNumber;
    let middle = []
    for (let i = 1; i < end.sentenceNumber - start.sentenceNumber; i++) {
        let sentenceNumber = start.sentenceNumber + i;
        middle.push(sentenceNumber);
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

function findTokenInfoByNode(article, node, characterOffsetOfNode=0){
    let nodeInfo = article.textNodeMap.get(node);
    let offsetOfArticle = nodeInfo.offset + characterOffsetOfNode;
    let sentenceInfo = findSentenceInfo(article, offsetOfArticle);
    let tokenIndexOfSentence = findTokenIndexOfSentence(sentenceInfo, offsetOfArticle);
    return { sentenceInfo: sentenceInfo, tokenIndex: tokenIndexOfSentence };
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
    let type = note.selection.type;
    if(type === 'paragraph'){
        return getSelectedTextOfNoteOfParagraph(article, note);
    } else {
        return getSelectedTextOfNoteOfSentence(article, note)
    }
}

function getSelectedTextOfNoteOfSentence(article, note) {
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

function findArticleNotes(article, notes){
    let filteredNotes = [];
    for (let note of notes) {
        //one sentence selection could map to multiple node selections
        //let nodeSelections = getNodeSelectionsFromSentenceHashSelection(document, note.selection);
        let articleSelections;
        let selectionType = note.selection.type;
        if(selectionType === 'paragraph'){
            articleSelections = getArticleSelectionsFromParagraphHashSelection(article, note.selection);
        } else {
            articleSelections = getArticleSelectionsFromSentenceHashSelection(article, note.selection);
        }

        if(articleSelections.length>0){
            //note.articleSelections = articleSelections;
            let positions = [];
            for(const selection of articleSelections){
                const position = selection.start / article.textContentLength;
                positions.push(position);
            }

            note.positions = positions;
            note.articleSelections = articleSelections;

            filteredNotes.push(note);
        }

    }

    filteredNotes = filteredNotes.sort(function(a, b){
        let aPosition = a.positions.length>0? a.positions[0] : 0;
        let bPosition = b.positions.length>0? b.positions[0] : 0;

        return aPosition - bPosition;
    });
    return filteredNotes;
}


export { tokenizeTextNode, detokenizeTextNode, parseDocument, findTokenInArticle, getArticleSelectionsFromHashSelection, getNodeSelectionFromHashSelection, getSentenceInstanceSelectionFromNodeSelection, getParagraphInstanceSelectionFromNodeSelection, getSentenceInstanceSelectionsFromSentenceHashSelection, getSelectedTextOfNote, findTokenInfoByNode, parseArticleTextNodes, findArticleNotes };