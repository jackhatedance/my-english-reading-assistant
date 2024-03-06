'use strict';

import './sidePanel.css';
import {addKnownWord} from './vocabularyStore.js';
import {searchWord} from './language.js';
import { lookupShort } from './dictionary.js';

(function () {
  // We will make use of Storage API to get and store `count` value
  // More information on Storage API can we found at
  // https://developer.chrome.com/extensions/storage

  // To get storage access, we have to mention it in `permissions` property of manifest.json file
  // More information on Permissions can we found at
  // https://developer.chrome.com/extensions/declare_permissions
   


  var definitionVisible = false;
  

  document.addEventListener('DOMContentLoaded', () => {
    refreshUnknownWordList();
    

  });

  function refreshUnknownWordList(){
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      chrome.tabs.sendMessage(
        tab.id,
        {
          type: 'GET_VOCABULARY_INFO_OF_PAGE',
          payload: {            
          },
        },
        (response) => {

          //console.log('get unknown words:'+ JSON.stringify(response.words));
          //resolve(response);
          
          if(response && response.pageInfo){
            let pageInfo = response.pageInfo;
            renderPage(pageInfo);
          } else {
            renderPage({enabled:false});
          }
          
        }
      );
    });
  }

  function renderPage(pageInfo){
    
    if(pageInfo.enabled){
      renderRatio(pageInfo.unknownWordsRatio);
      renderUnknownWordList(pageInfo.unknownWords);
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

  function renderRatio(ratio){
    let ratioElement = document.getElementById('ratio');
    let percentage = Math.floor(ratio * 100);
    ratioElement.innerHTML=`${percentage}%`;
  }

  function renderUnknownWordList(words){
    let ul = document.getElementById('unknownWordList');
    while (ul.firstChild) {
      ul.removeChild(ul.firstChild);
    }

    for(let word of words){
      let li = document.createElement("li");
      //var text = document.createTextNode(word);
      //li.appendChild(text);
      ul.appendChild(li);

      let definition = lookupShort(word);
      
      let display = definitionVisible? 'unset':'none';
      const liInnerHTML = `${word}: <span class="definition" style="display:${display};">${definition}</span> <button class='mea-remove' word="${word}"><image src='svg/remove-button.svg' width="10"></image></button>`;

      li.innerHTML = liInnerHTML;

    }

    let removeButtons = document.querySelectorAll('.mea-remove');
    for(let btn of removeButtons){
      btn.addEventListener('click', async (e) => {
        let baseForm = e.currentTarget.getAttribute('word');
        console.log(`remove word ${baseForm}`);
        await addKnownWord(baseForm);
        sendMessageKnownWordsUpdated();

        refreshUnknownWordList();
      });
    }
  }


  function sendMessageKnownWordsUpdated(){
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      chrome.tabs.sendMessage(
        tab.id,
        {
          type: 'KNOWN_WORDS_UPDATED',
          payload: {            
          },
        },
        (response) => {
          
          //renderUnknownWordList(response.words);
        }
      );
    });
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'RESET_PAGE_ANNOTATION_VISIBILITY_FINISHED') {
      renderPage(request.payload.pageInfo);
      // Log message coming from the `request` parameter
      //console.log(request.payload.message);
      // Send a response message
      sendResponse({
        message:'ok'
      });
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
      console.log(response.message);
    }
  );
})();
