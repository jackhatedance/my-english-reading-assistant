'use strict';

import './sidePanel.css';
import {loadKnownWords, markWordAsKnown, markWordAsUnknown, removeWordMark} from './vocabularyStore.js';
import { lookupShort } from './dictionary.js';
import {localizeHtmlPage} from './locale.js';
import {getWordParts, isKnown} from './language.js';
import {initializeOptionService} from './optionService.js';


import {getNote, setNote, deleteNote} from './noteService.js';
import {Note} from './components/note.js';
import {Notes} from './components/notes.js';


localizeHtmlPage();
(function () {
  // We will make use of Storage API to get and store `count` value
  // More information on Storage API can we found at
  // https://developer.chrome.com/extensions/storage

  // To get storage access, we have to mention it in `permissions` property of manifest.json file
  // More information on Permissions can we found at
  // https://developer.chrome.com/extensions/declare_permissions
   


  var definitionVisible = false;
  
   
  var gNoteComponent;
  var gNotesComponent;


  document.addEventListener('DOMContentLoaded', async () => {
    await initializeOptionService();
    refreshUnknownWordList();
    

  });

  async function refreshUnknownWordList(){
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      chrome.tabs.sendMessage(
        tab.id,
        {
          type: 'GET_PAGE_INFO',
          payload: {            
          },
        },
        (response) => {

          //console.log('get pageInfo response:'+ JSON.stringify(response));
          
          if(response && response.pageInfo){
            let pageInfo = response.pageInfo;
            renderPage(pageInfo);
          } else {
            renderPage({visible:false});
          }

          
        }
      );
    });
  }

  async function renderPage(pageInfo){
    
    if(pageInfo.visible){
      renderRatio(pageInfo.totalWordCount, pageInfo.unknownWordsCount, pageInfo.unknownWordsRatio);
      await renderUnknownWordList(pageInfo.unknownWords);
      showPage();
    } else {
      hidePage();
    }
  }

  function hidePage(){
    setPageAvailable(false);
  }
  function showPage(){
    setPageAvailable(true);
  }
  
  function setPageAvailable(available){
    let app = document.getElementById('app');
    app.style.display= available? null : 'none';

    let notAvailable = document.getElementById('notAvailable');
    notAvailable.style.display=available?'none':null;
  }

  function renderRatio(totalWordCount, unknownWordsCount, ratio){
    let ratioElement = document.getElementById('wordStatistics');
    let percentage = Math.floor(ratio * 100);
    ratioElement.innerHTML=`${unknownWordsCount}/${totalWordCount} (${percentage}%)`;
  }


  async function buildTargetWords(words){
    let knownWords = await loadKnownWords();

    let expandedWords = [];
    for(let wordObj of words){
      let {base} = wordObj;
      let target = base;
      
      //itself
      expandedWords.push({target: base});
      
      //parts
      let parts = getWordParts(base);
      let from = base;

      if(parts){
        for(let part of parts){
          target = part.dictEntry;
          

          if(!isKnown(target, knownWords)){
            expandedWords.push({target, from});
          }
        }
      }
    }

    
    //word array to merge
    let targetObjMap = new Map();
    
    for(let wordObj of expandedWords) {
      let {target, from} = wordObj;
            
      let targetObj = targetObjMap.get(target);
      if(!targetObj){
        targetObj = {target, from:[]};
        targetObjMap.set(target, targetObj);
      }

      if(from){
        targetObj.from.push(from);
      }
      
      
    }
    let array = Array.from(targetObjMap, ([name, value]) => ({target: name, from: value.from}));
    return array;
  }

  async function renderUnknownWordList(words){
    let ul = document.getElementById('unknownWordList');
    while (ul.firstChild) {
      ul.removeChild(ul.firstChild);
    }

    let targetWords = await buildTargetWords(words);
    
    //console.log('targetWords:'+JSON.stringify(targetWords));

    for(let wordObj of targetWords){
      let {target, from } = wordObj;
      let word = target;
      let fromArray = from;
      let fromStr='';
      if(fromArray){
        fromStr = fromArray.join(',');
      }

      
      //query root word
      
      let definition = lookupShort(word);

      if(!definition){
        continue;
      }

      let li = document.createElement("li");
      //var text = document.createTextNode(word);
      //li.appendChild(text);
      ul.appendChild(li);

      let wordStr = fromStr? `${word} (${fromStr})` : word;
      
      let display = definitionVisible? 'unset':'none';
      let showDefinitionTips = chrome.i18n.getMessage('sidepanelWordActionShowDefinition');
      let markAsKnownTips = chrome.i18n.getMessage('sidepanelWordActionMarkAsKnown');
      let markAsUnknownTips = chrome.i18n.getMessage('sidepanelWordActionMarkAsUnknown');
      let clearMarkTips = chrome.i18n.getMessage('sidepanelWordActionClearMark');
      const liInnerHTML = `
        <div class='list-item'>
          <div class="word-and-actions">
            
            <span class='word'>${wordStr}</span>
            
            <div class="actions">
              <button class='mea-show-definition' word="${word}" title='${showDefinitionTips}'>
                <image src='icons/lookup.png';' width="12"></image>
              </button>
              
              <button class='mea-mark-known' word="${word}" title="${markAsKnownTips}">
                <image src='icons/tick.png';' width="12"></image>
              </button>
              <button class='mea-mark-unknown' word="${word}" title="${markAsUnknownTips}">
                <image src='icons/question-mark.png';' width="12"></image>
              </button>
              <button class='mea-mark-clear' word="${word}" title="${clearMarkTips}">
                <image src='icons/clear.png';' width="12"></image>
              </button>
            </div>
          </div>
          
          <div class="definition-container">
            <p class="definition" style="display:${display};">${definition}</p> 
          </div>

          
        </div>
        `;

      li.innerHTML = liInnerHTML;

    }

    document.querySelectorAll('.mea-show-definition').forEach( element => {
      let button = element;
      button.addEventListener('click', async (e) => {
        
        let definitionElement = e.target.closest('.list-item').querySelector('.definition');
        definitionElement.style.display = null;

        let baseForm = e.currentTarget.getAttribute('word');
        //console.log(`show definition: ${baseForm}`);     
      });
    });

    document.querySelectorAll('.mea-mark-unknown').forEach( element => {
      let btn = element;
      
      btn.addEventListener('click', async (e) => {
        let baseForm = e.currentTarget.getAttribute('word');
        //console.log(`mark word as unknown ${baseForm}`);
        let wordChanges = await markWordAsUnknown(baseForm);
        sendMessageKnownWordsUpdated('unknown', wordChanges);

        let btn = e.currentTarget;
        let wordElement = e.target.closest('.list-item').querySelector('.word');
        wordElement.style['text-decoration'] = null;
      });    
    
    });

    let removeButtons = document.querySelectorAll('.mea-mark-known');
    for(let btn of removeButtons){
      btn.addEventListener('click', async (e) => {
        let baseForm = e.currentTarget.getAttribute('word');
        //console.log(`mark word as known ${baseForm}`);
        let wordChanges = await markWordAsKnown(baseForm);
        sendMessageKnownWordsUpdated('known', wordChanges);

        let btn = e.currentTarget;
        let wordElement = e.target.closest('.list-item').querySelector('.word');
        wordElement.style['text-decoration'] = 'line-through';
      });
    }

    let clearButtons = document.querySelectorAll('.mea-mark-clear');
    for(let btn of clearButtons){
      btn.addEventListener('click', async (e) => {
        let baseForm = e.currentTarget.getAttribute('word');
        //console.log(`remove word mark ${baseForm}`);
        let wordChanges = await removeWordMark(baseForm);
        sendMessageKnownWordsUpdated('clear', wordChanges);

        let btn = e.currentTarget;
        let wordElement = e.target.closest('.list-item').querySelector('.word');
        
        let decoration = null;

        let knownWords = await loadKnownWords();

        if(isKnown(baseForm, knownWords)){
          decoration = 'line-through';
        }
        wordElement.style['text-decoration'] = decoration;
      });
    }
  }


  function sendMessageKnownWordsUpdated(type, wordChanges){
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      chrome.tabs.sendMessage(
        tab.id,
        {
          type: 'KNOWN_WORDS_UPDATED',
          payload: {            
            source:'side-panel',
          },
        },
        (response) => {
          
          //renderUnknownWordList(response.words);
        }
      );

      //send to background
      chrome.runtime.sendMessage(
        {
          type: 'MARK_WORD',
          payload: {
            contentTabId: tab.id,
            wordChanges: wordChanges,
          },
        },
        (response) => {
          //console.log(response.message);
        }
      );
    });

    
  }

  function sendMessageToActiveTab(type){
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      chrome.tabs.sendMessage(
        tab.id,
        {
          type: type,
          payload: {            
            source:'side-panel',
          },
        },
        (response) => {
          //do nothing
        }
      );
 
    });
  }

  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    
    console.log(request.type);

    if (request.type === 'RESET_PAGE_ANNOTATION_VISIBILITY_FINISHED') {

      if(request.payload.source === 'side-panel'){
        return;
      }

      renderPage(request.payload.pageInfo);
      // Log message coming from the `request` parameter
      //console.log(request.payload.message);
      // Send a response message
      sendResponse({
        message:'ok'
      });
    } else if (request.type === 'SELECTION_CHANGE') {
      let selectedText = request.payload.selectedText;
      let sentenceSelection = request.payload.sentenceSelection;
      
      console.log('payload:'+JSON.stringify(request.payload));
      
      let note = await getNote(sentenceSelection);
      if(!note){
        gNoteComponent.initForNewNote(selectedText, sentenceSelection);        
      } else {
        gNoteComponent.initForExistingNote(selectedText, note);
      }
      
      gNoteComponent.refreshNoteViewer();
    }

  });

  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.active) {
      refreshUnknownWordList();
    }
  });
  
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (tab.active) {
      refreshUnknownWordList();
    }
  });

  document.getElementById('showAllDefinitions').addEventListener('click', (e) => {
    definitionVisible = true;

    setDefinitions();
  });

  document.getElementById('hideAllDefinitions').addEventListener('click', (e) => {
    definitionVisible = false;

    setDefinitions();
  });

  document.querySelectorAll('.tabs > li').forEach((e) => {
    e.addEventListener('click', (e2) => {

      document.querySelectorAll('.tabs > li').forEach((e) => {
        e.classList.remove('active');
      });

      e2.currentTarget.classList.add('active');
      
      let contentTabId = e2.currentTarget.getAttribute('data-tab-id');
      
      
      openPage(contentTabId, e2.currentTarget);
    });
  });
  document.getElementById('defaultOpen').click();

  function openPage(pageName,elmnt) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].style.backgroundColor = "";
    }
    document.getElementById(pageName).style.display = "block";
    
  }

  let service = {
    getNote: (sentenceSelection) => getNote(sentenceSelection),
    setNote: (note) => setNote(note),
    deleteNote: (sentenceSelection) => deleteNote(sentenceSelection),
    sendMessageToActiveTab: (type) => sendMessageToActiveTab(type),
  };

  let notesElement = document.querySelector('.notes');
  gNotesComponent = new Notes(notesElement, service);

  let noteElement = document.createElement("div");
  notesElement.appendChild(noteElement);

  gNoteComponent = new Note(noteElement, service);

  gNoteComponent.setupNotesTab();


  function setDefinitions(){
    let definitionElements = document.querySelectorAll('.definition');
    for(let def of definitionElements){
      def.style.display = definitionVisible ? null:'none';
    }
  }
  
  // Communicate with background file by sending a message
  chrome.runtime.sendMessage(
    {
      type: 'GREETINGS',
      payload: {
        message: 'Hello, my name is Pop. I am from Popup.',
      },
    },
    (response) => {
      //console.log(response.message);
    }
  );
})();
