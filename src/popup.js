'use strict';

import './popup.css';
import {loadKnownWords, loadUnknownWords, saveKnownWords, saveUnknownWords} from './vocabularyStore.js';

(function () {
  // We will make use of Storage API to get and store `count` value
  // More information on Storage API can we found at
  // https://developer.chrome.com/extensions/storage

  // To get storage access, we have to mention it in `permissions` property of manifest.json file
  // More information on Permissions can we found at
  // https://developer.chrome.com/extensions/declare_permissions
   

  const enabledStorage = {
    get: (cb) => {
      chrome.storage.sync.get(['enabled'], (result) => {
        cb(result.enabled);
      });
    },
    set: (value, cb) => {
      chrome.storage.sync.set(
        {
          enabled: value,
        },
        () => {
          cb();
        }
      );
    },
  };
 

  function setupEnabled(initialValue = false) {
    document.getElementById('enabledCheckbox').checked = initialValue;

    document.getElementById('enabledCheckbox').addEventListener('click', (e) => {
      e.preventDefault();
      
      updateEnabled({        
      });
      
    });
  }

  

//toggle
  function updateEnabled() {
    enabledStorage.get((enabled) => {
      let newValue;

      if (enabled) {
        newValue = false;
      } else {
        newValue = true;
      }

      enabledStorage.set(newValue, () => {
        document.getElementById('enabledCheckbox').checked = newValue;

        // Communicate with content script of
        // active tab by sending a message
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const tab = tabs[0];

          chrome.tabs.sendMessage(
            tab.id,
            {
              type: 'ENABLED',
              payload: {
                enabled: newValue,
              },
            },
            (response) => {
              console.log('Current enabled value passed to contentScript file');
            }
          );
        });
      });
    });
  }



  async function init() {
     

    enabledStorage.get((enabled) => {
    
      enabledStorage.set(false, () => {
        setupEnabled(false);
      });
    
    });

    let knownWordsResult = await loadKnownWords();
    let knownWords = knownWordsResult;
    if(!knownWords){
      knownWords= [];
    }    
    document.getElementById('knownWords').value = knownWords.join('\n');

    let unknownWordsResult = await loadUnknownWords();
    let unknownWords = unknownWordsResult ? unknownWordsResult : [];
    document.getElementById('unknownWords').value = unknownWords.join('\n');

    document.getElementById('save').addEventListener('click', () => {
      let knownWordsArray = document.getElementById('knownWords').value.split('\n');
      let unknownWordsArray = document.getElementById('unknownWords').value.split('\n');
      save({
        knownWords: knownWordsArray,
        unknownWords: unknownWordsArray
      });
    });
  }

  

  async function save(settings){
    if(settings.knownWords){
      let uw = settings.knownWords;
      await saveKnownWords(uw);
      settings.knownWords = null;
    }
    if(settings.unknownWords){
      let uw = settings.unknownWords;
      await saveUnknownWords(uw);
      settings.unknownWords = null;
    }
   // await chrome.storage.sync.set(settings);
    
  }

  document.addEventListener('DOMContentLoaded', init);

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
