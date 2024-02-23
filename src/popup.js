'use strict';

import './popup.css';
import {loadKnownWords, saveKnownWords} from './vocabularyStore.js';

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
 

  function setupEnabled(enabled) {
    document.getElementById('enabledCheckbox').checked = enabled;

    console.log('add switch click event listener 1');
    document.getElementById('enabledCheckbox').addEventListener('click', (e) => {
      e.preventDefault();
      console.log('switch clicked');

      isPageAnnotationEnabled((enabled) => {
        toggleEnabled(enabled);
      });
      
      
    });
    console.log('add switch click event listener 2');


    document.getElementById('refresh').addEventListener('click', (e) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        chrome.tabs.sendMessage(
          tab.id,
          {
            type: 'REFRESH_PAGE',
            payload: {            
            },
          },
          (response) => {
            console.log('refresh page response');
            //resolve(response);
          }
        );
      });
    });
  }

  

  function toggleEnabled(currentValue) {
    
    let newValue = !currentValue ;

    let time = setTimeout(function () {
      document.getElementById('enabledCheckbox').checked = newValue;
    }, 100);
      

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
              console.log('Current enabled value passed to contentScript file:'+ newValue);
            }
          );
        });
        
       
     
  }

  async function isPageAnnotationEnabled(resolve){
    // Communicate with content script of
    // active tab by sending a message
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];

      chrome.tabs.sendMessage(
        tab.id,
        {
          type: 'IS_PAGE_ANNOTATION_ENABLED',
          payload: {            
          },
        },
        (response) => {
          console.log('is page enabled response: '+ response.enabled);
          resolve(response.enabled);
        }
      );
    });
  }

  async function init() {
    isPageAnnotationEnabled((enabled) => {
      setupEnabled(enabled);
    });

    

    let knownWordsResult = await loadKnownWords();
    let knownWords = knownWordsResult;
    if(!knownWords){
      knownWords= [];
    }    
    document.getElementById('knownWords').value = knownWords.join('\n');

    document.getElementById('save').addEventListener('click', () => {
      let knownWordsArray = document.getElementById('knownWords').value.split('\n');

      save({
        knownWords: knownWordsArray
      });
    });
  }

  

  async function save(settings){
    if(settings.knownWords){
      let uw = settings.knownWords;
      await saveKnownWords(uw);
      settings.knownWords = null;
    }
    
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
