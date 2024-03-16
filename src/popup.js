'use strict';

import './popup.css';
import {setSiteOptions, setSiteOptionsAsDefault, getDefaultOptions, initVocabularyIfEmpty} from './optionService.js';


(function () {
  // We will make use of Storage API to get and store `count` value
  // More information on Storage API can we found at
  // https://developer.chrome.com/extensions/storage

  // To get storage access, we have to mention it in `permissions` property of manifest.json file
  // More information on Permissions can we found at
  // https://developer.chrome.com/extensions/declare_permissions

  var pageInfo;

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
 

  function setupPage(pageInfo) {
    document.getElementById('test').addEventListener('click', (e) => {
      
      getPageInfo((pageInfo) => {
        //console.log('pageInfo'+JSON.stringify(pageInfo));
      });
      
    });

    //console.log('setupPage:'+ JSON.stringify(pageInfo));
    if(!pageInfo){
      return;
    }

    document.getElementById('options').addEventListener('click', (e) => {
      //e.preventDefault();
      chrome.runtime.openOptionsPage();
      
    });

    document.getElementById('site').innerHTML = pageInfo.domain;

    document.getElementById('enabledCheckbox').checked = pageInfo.visible;

    //console.log('add switch click event listener 1');
    document.getElementById('enabledCheckbox').addEventListener('click', (e) => {
      e.preventDefault();
      //console.log('switch clicked');

      getPageInfo((pageInfo) => {
        toggleEnabled(pageInfo.visible);
      });
      
      
    });
    
    document.getElementById('enabled').checked = pageInfo.siteOptions.enabled;
    document.getElementById('enabled').addEventListener('change', (e) => {
      
      //console.log('enabled changed');
      
      applyStyles();
      
    });

    let annotationOptions = pageInfo.siteOptions.annotation;

    document.getElementById('annotationPosition').value = annotationOptions.position;
    document.getElementById('annotationPosition').addEventListener('change', (e) => {
      applyStyles();
    });

    document.getElementById('fontSize').value = annotationOptions.fontSize;
    document.getElementById('fontSize').addEventListener('change', (e) => {      
      applyStyles();
    });

    document.getElementById('color').value = annotationOptions.color;
    document.getElementById('color').addEventListener('change', (e) => {
      
      applyStyles();
    });

    document.getElementById('opacity').value = annotationOptions.opacity;
    document.getElementById('opacity').addEventListener('change', (e) => {
      applyStyles();
    });

    document.getElementById('resetAnnotationSettings').addEventListener('click', async (e) => {
      
      //console.log('resetAnnotationSettings');
      let options = await getDefaultAnnotationOptions();
      updateOptionsUI(options);
      applyStyles();
    });

    document.getElementById('saveAsDefault').addEventListener('click', (e) => {
      
      //console.log('saveAsDefault');
      let newOptions = buildOptions();
      setSiteOptionsAsDefault(newOptions);
      
    });
  }

  function updateOptionsUI(options){
    document.getElementById('annotationPosition').value = options.position;

    document.getElementById('fontSize').value = options.fontSize;
    
    document.getElementById('color').value = options.color;;
    document.getElementById('opacity').value = options.opacity;;

  }

  function buildOptions(){
    let enabled = document.getElementById('enabled').checked;

    let position = document.getElementById('annotationPosition').value;

    let fontSize =  document.getElementById('fontSize').value;
    
    let color =  document.getElementById('color').value;
    let opacity =  document.getElementById('opacity').value;

    let newOptions = {
      enabled: enabled,

      annotation:{    
        fontSize: fontSize,
        position: position,        
        opacity: opacity,
        color:color,
      }
    };

    return newOptions;
  }

  async function applyStyles(){
    let newOptions = buildOptions();

    let siteDomain = pageInfo.domain;

    await setSiteOptions(siteDomain, newOptions);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      chrome.tabs.sendMessage(
        tab.id,
        {
          type: 'CHANGE_STYLE',
          payload: {}
        },
        (response) => {
          //console.log('refresh page response');
          //resolve(response);
        }
      );
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
              //console.log('Current enabled value passed to contentScript file:'+ newValue);
            }
          );
        });
        
       
     
  }

  function getPageInfo(resolve){
    // Communicate with content script of
    // active tab by sending a message
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
          if(response){
            //console.log('getPageInfo:'+JSON.stringify(response));
            resolve(response.pageInfo?response.pageInfo:undefined);
          }else {
            resolve(undefined);
          }
        }
      );
    });
  }

  function init() {
    initVocabularyIfEmpty();
    
    getPageInfo((_pageInfo) => {
      pageInfo = _pageInfo;
      setupPage(pageInfo);
    });

    
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
      //console.log(response.message);
    }
  );
})();
