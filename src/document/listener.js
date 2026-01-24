import { loadKnownWords } from '../vocabularyStore.js';
import { isKnown, searchWord, buildDictionaryOptions } from '../language.js';
import { searchNote, getNotes } from '../service/noteService.js';
import { getTargetWordFromElement, getQueryFromElement, getTargetWordFromSearchResult} from '../word.js';
import { containsSentenceInstancePosition, getSentenceHashSelectionFromInstanceSelection } from '../sentence.js';
import { containsParagraphInstancePosition, getParagraphHashSelectionFromInstanceSelection, getParagraphInstanceSelectionsFromParagraphHashSelection } from '../paragraph.js';
import { getSentenceInstanceSelectionFromNodeSelection, getParagraphInstanceSelectionFromNodeSelection, getSentenceInstanceSelectionsFromSentenceHashSelection, getSelectedTextOfNote, findArticleNotes, findTokenInfoByNode } from '../article.js';
import { MenuItems } from '../menu.js';
import { sendMessageToEmbeddedApp } from '../embed/iframe-embed.js';
import { showDialog } from '../dialog.js' 
import { INTERACTION_KEY_CLICK_WORD, INTERACTION_KEY_SELECT_TEXT, getEffectiveInteractionOption } from '../interaction-utils.js'
import { getCurrentSiteOptions } from '../current-site-options.js'
import { isFeatureEnabled, FEATURE_NOTE } from '../feature-toggle.js'
import { handleTooltipForCaretPosition } from '../tooltip.js'
import { cursorNearCaret } from '../html-utils.js'

var gMouseMoveTimer;

async function mouseUpEventListenerWithParams(event, document, options, currentSiteOption, gDocumentArticleMap, siteProfile) {
  //console.log(event);
  //mouse up event on dialog itself, ignore
  let supplementary = event.target.closest('.mea-supplementary');
  if(supplementary){
    return;
  }

  //wont show dialog on a link
  let aLink = event.target.closest('a');
  if(aLink){
    let href = aLink.getAttribute('href');
    if(href) {
      return;
    }      
  }

  let nodeSelection = document.getSelection();
  let { anchorNode, focusNode } = nodeSelection;
  let bothTextNode = (anchorNode && focusNode && anchorNode.nodeName === '#text' && focusNode.nodeName === '#text');
  let selectedText = nodeSelection.toString();

  let article = gDocumentArticleMap.get(document);

  let notes = await getNotes();
  let articleNotes = findArticleNotes(article, notes);
  for(const note of articleNotes){
    if(!note.text){
      let text = getSelectedTextOfNote(article, note);
      note.text = text;
    }    
  }
    
  if(article && nodeSelection.type !== 'None' && bothTextNode){

    
    let sentenceInstanceSelection = getSentenceInstanceSelectionFromNodeSelection(article, nodeSelection);
    //console.log('mouse up, sentence instance selection:'+JSON.stringify(sentenceInstanceSelection));

    let paragraphInstanceSelection = getParagraphInstanceSelectionFromNodeSelection(article, nodeSelection);
    //console.log('mouse up, paragraph instance selection:'+JSON.stringify(paragraphInstanceSelection));
    
    let sentenceHashSelection = getSentenceHashSelectionFromInstanceSelection(sentenceInstanceSelection, (sentenceNumber) => article.sentences[sentenceNumber].sentenceId);
    //console.log('mouse up, sentence hash selection:'+JSON.stringify(sentenceHashSelection));
    
    let paragraphHashSelection = getParagraphHashSelectionFromInstanceSelection(paragraphInstanceSelection, (paragraphNumber) => article.paragraphs[paragraphNumber].paragraphId);
    //console.log('mouse up, paragraph hash selection:'+JSON.stringify(paragraphHashSelection));
    
    let isSelectionCollapsed = nodeSelection.isCollapsed;
    
    let type;
    let menuItems = [];
    let word;
    let dictionaryName;
    
    let selectedNotes = [];
    let siteOptions = await getCurrentSiteOptions(siteProfile);
    let clickWordEnabled = getEffectiveInteractionOption(options, siteOptions, INTERACTION_KEY_CLICK_WORD);
    if (isSelectionCollapsed && clickWordEnabled) {

      //1. mark the word
      let query;

      //query = getQueryFromMeaToken(event);
      query = getQueryFromCaretPosition(document, article, event);
      
      if(query){//find word
        let searchResult = searchWord(query, { 
          allowLemma: true,
          lookupBase: 'Always',
          dictionaryOptions: buildDictionaryOptions(currentSiteOption) });

        if(!searchResult){
          return;
        }

        dictionaryName = searchResult?.lookupResult?.dictionaryName;

        word = getTargetWordFromSearchResult(searchResult);

        let knownWords = await loadKnownWords();
        if(isKnown(word, knownWords)){
          menuItems.push(MenuItems.MarkAsUnknown);
        } else {
          menuItems.push(MenuItems.MarkAsKnown);
        }
        menuItems.push(MenuItems.ClearMark);   
        menuItems.push(MenuItems.Vocabulary);
      }

      //2. search note of the position
      type = 'search-note';
      

      selectedNotes = await searchNote(sentenceHashSelection.start, paragraphHashSelection.start);
      for(const note of selectedNotes){
        if(!note.text){
          let text = getSelectedTextOfNote(article, note);
          note.text = text;
        }
      }
      
      //console.log('search notes:' + JSON.stringify(selectedNotes));
      if(isFeatureEnabled(siteOptions, FEATURE_NOTE) && selectedNotes.length>0){
        menuItems.push(MenuItems.ViewNote);
      }
    } 

    let selectTextEnabled = getEffectiveInteractionOption(options, siteOptions, INTERACTION_KEY_SELECT_TEXT);
    if (!isSelectionCollapsed && selectTextEnabled) {
      type = 'select-text';
      if(isFeatureEnabled(siteOptions, FEATURE_NOTE)){
        menuItems.push(MenuItems.AddNote);
      }
    }
    

    if (sentenceHashSelection || paragraphSelection) {
      let request = {
        type: 'SELECTION_CHANGE',
        payload: {
          word: word,
          dictionary: dictionaryName,
          type: type,            
          selectedText: selectedText,
          sentenceSelection: sentenceHashSelection,
          paragraphSelection: paragraphHashSelection,
          notes: articleNotes,
          selectedNotes: selectedNotes,
        },
      };
      let sender = null;
      let sendResponse = (response) => {
        //console.log(response.message);
      };
      //console.log('selection change:'+JSON.stringify(request));
      sendMessageToEmbeddedApp(request, sender, sendResponse);

      if(menuItems.length>0){
        showDialog(menuItems);
      }
      
    }
  }
}

//old method
function getQueryFromMeaToken(event){
  let query;

  let targetElement = event.target;
  let highlightElement = targetElement.closest('.mea-word');
  if(highlightElement){//find word
    query = getQueryFromElement(highlightElement);
  }

  return query;
}

function getQueryFromCaretPosition(document, article, event){
  let query;
  
  let x = event.clientX;
  let y = event.clientY;
  const cursorPosition = { x, y };
  const caretPosition = document.caretPositionFromPoint(x, y);

  let isNear = cursorNearCaret(caretPosition, cursorPosition);
  if(!isNear){
    return;
  }

  const { offsetNode, offset } = caretPosition;
  let tokenInfo = findTokenInfoByNode(article, offsetNode, offset);
  const { sentenceInfo, tokenIndex } = tokenInfo;
  let token = sentenceInfo.tokens[tokenIndex];

  let isWord = token.checked && token.checkWordResult.word != '';
  if(isWord){
    query = token.content;  
      }
  
  return query;
}

function mouseStopped(event, page, document, documentConfig, options, siteOptions) {
  let x = event.clientX;
  let y = event.clientY;
  const caretPosition = document.caretPositionFromPoint(x, y);
  let cursorPosition = {x, y};
  
  handleTooltipForCaretPosition(page, document, documentConfig, options, siteOptions, caretPosition, cursorPosition);
}

function mouseMoveEventListenerWithParams(event, page, document, documentConfig, options, siteOptions) {
  
  clearTimeout(gMouseMoveTimer);

  gMouseMoveTimer = setTimeout(()=> mouseStopped(event, page, document, documentConfig, options, siteOptions), 300);

}

export { mouseUpEventListenerWithParams, mouseMoveEventListenerWithParams }