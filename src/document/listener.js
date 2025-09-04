import { loadKnownWords } from '../vocabularyStore.js';
import { isKnown, searchWord, buildDictionaryOptions } from '../language.js';
import { searchNote } from '../service/noteService.js';
import { getTargetWordFromElement, getQueryFromElement} from '../word.js';
import { containsSentenceInstancePosition, getSentenceHashSelectionFromInstanceSelection } from '../sentence.js';
import { containsParagraphInstancePosition, getParagraphHashSelectionFromInstanceSelection, getParagraphInstanceSelectionsFromParagraphHashSelection } from '../paragraph.js';
import { getSentenceInstanceSelectionFromNodeSelection, getParagraphInstanceSelectionFromNodeSelection, getSentenceInstanceSelectionsFromSentenceHashSelection, getSelectedTextOfNote } from '../article.js';
import { MenuItems } from '../menu.js';
import { sendMessageToEmbeddedApp } from '../embed/iframe-embed.js';
import { showDialog } from '../dialog.js' 

async function mouseUpEventListenerWithParams(event, document, currentSiteOption, gDocumentArticleMap) {
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
    
    let filteredNotes = [];
    if (isSelectionCollapsed) {
      //1. mark the word
      let targetElement = event.target;
      let highlightElement = targetElement.closest('.mea-word');
      if(highlightElement){//find word
        let query = getQueryFromElement(highlightElement);
        let searchResult = searchWord(query, { dictionaryOptions: buildDictionaryOptions(currentSiteOption) });
        dictionaryName = searchResult?.lookupResult?.dictionaryName;

        word = getTargetWordFromElement(highlightElement);

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
      

      let noteArray = await searchNote(sentenceHashSelection.start, paragraphHashSelection.start);

      for (let note of noteArray) {
        let isContainsPosition;

        let selectionType = note.selection.type;
        if(selectionType === 'paragraph'){
          let paragraphInstanceSelections = getParagraphInstanceSelectionsFromParagraphHashSelection(article, note.selection);
          isContainsPosition = paragraphInstanceSelections.some((s) => containsParagraphInstancePosition(s, paragraphInstanceSelection.start));
        } else {
        let sentenceInstanceSelections = getSentenceInstanceSelectionsFromSentenceHashSelection(article, note.selection);
          isContainsPosition = sentenceInstanceSelections.some((s) => containsSentenceInstancePosition(s, sentenceInstanceSelection.start));
        }
        
        if(!isContainsPosition){
          continue;
        }

        let selectedText = getSelectedTextOfNote(article, note);
        note.selectedText = selectedText;

        filteredNotes.push(note);
      }
      //console.log('search notes:' + JSON.stringify(filteredNotes));
      if(filteredNotes.length>0){
        menuItems.push(MenuItems.ViewNote);
      }
    } else {
      type = 'select-text';
      menuItems.push(MenuItems.AddNote);
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
          notes: filteredNotes,
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


export { mouseUpEventListenerWithParams }