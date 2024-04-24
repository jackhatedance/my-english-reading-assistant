'use strict';

import './options.css';
import {loadKnownWords, loadAndMergeWordLists, saveKnownWords, calculateKnownWordsCount} from './vocabularyStore.js';
import {getOptions, setOptions} from './service/optionService.js';
import {localizeHtmlPage} from './locale.js';
import {deleteAllReadingHistory} from './service/activityService.js';

localizeHtmlPage();

  // Saves options to chrome.storage
  const saveOptionsUI = async () => {
    const splitter = /\r*\n/;
    let knownWordsArray = document.getElementById('knownWords').value.split(splitter);
    let wordMarkRootMode = document.getElementById('rootMode').checked;
    let enableReport = document.getElementById('enableReport').checked;
    
    await save({
      knownWords: knownWordsArray,
      options: {
        rootAndAffix:{
          enabled:wordMarkRootMode,
        },
        report:{
          enabled: enableReport,
        }
      }
    });

    //notify backgroud
    chrome.runtime.sendMessage(
      {
        type: 'OPTIONS_CHANGED',
        payload: {          
        },
      },
      (response) => {
        //console.log(response.message);
      }
    );

    //notify all tabs
    chrome.tabs.query({}, (tabs) => {
      for(const tab of tabs){
        chrome.tabs.sendMessage(
          tab.id,
          {
            type: 'OPTIONS_CHANGED',
            payload: {            
            },
          },
          (response) => {          
            
          }
        );
      }
    });

  };

  function deleteReadingHistoryUI(){
    deleteAllReadingHistory();
  }
  
  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
  const restoreOptions = async () => {
    let knownWordsResult = await loadKnownWords();
    let knownWords = knownWordsResult;
    if(!knownWords){
      knownWords= [];
    }    

    updateVocabulary(knownWords);
    

    //word mark
    let options = await getOptions();

    updateWordMark(options.rootAndAffix?.enabled);
    updateReport(options.report);
    
  };

  const resetVocabulary = async () => {
    var options = document.getElementById('wordLists').selectedOptions;
    var wordLists = Array.from(options).map(({ value }) => value);

    if(wordLists.length==0){
        alert('please select word lists.');
    }

    let knownWordsResult = await loadAndMergeWordLists(wordLists);
    let knownWords = knownWordsResult;
    if(!knownWords){
      knownWords= [];
    }    

    updateVocabulary(knownWords);
  };

  function backupVocabulary() {
    
    let vocabulary = document.getElementById('knownWords').value;
    saveTextAsFile(vocabulary);

  };

  function loadFromFile() {
    
    var file = document.getElementById("file").files[0];
    if(!file){
        alert('pick file first.');
        return;
    }

    var reader = new FileReader();
    reader.onload = function(e){
      //console.log(e.target.result);
      let array = e.target.result.split(/\r*\n/);
      updateVocabulary(array);
    }
    reader.readAsText(file);

  };

  function updateVocabulary(wordArray){
    document.getElementById('knownWords').value = wordArray.join('\n');

    const knownCount = calculateKnownWordsCount(wordArray);   
    
    document.getElementById('count').innerHTML = knownCount;
  }

  function updateWordMark(rootMode){
    document.getElementById('rootMode').checked = rootMode;
  }

  function updateReport(reportOptions){
    document.getElementById('enableReport').checked = reportOptions.enabled;
  }

  async function save(settings){
    if(settings.knownWords){
      let uw = settings.knownWords;
      await saveKnownWords(uw);
      settings.knownWords = null;
    }

    if(settings.options){
      let options = settings.options;
      await setOptions(options);
    }
  }

  function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
  }
 

  function saveTextAsFile(text) {
    var textToWrite = text;
    var textFileAsBlob = new Blob([ textToWrite ], { type: 'text/plain' });

    let yyyymmdd = formatDate(new Date());
    var fileNameToSaveAs = `my-vocabulary-${yyyymmdd}.txt`; //filename.extension
  
    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    if (window.webkitURL != null) {
      // Chrome allows the link to be clicked without actually adding it to the DOM.
      downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    } else {
      // Firefox requires the link to be added to the DOM before it can be clicked.
      downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
      downloadLink.onclick = destroyClickedElement;
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);
    }
  
    downloadLink.click();
  }
  
  
  document.addEventListener('DOMContentLoaded', restoreOptions);
  document.getElementById('backupVocabulary').addEventListener('click', backupVocabulary);
  document.getElementById('resetVocabulary').addEventListener('click', resetVocabulary);
  document.getElementById('save').addEventListener('click', saveOptionsUI);
  document.getElementById('loadFromFile').addEventListener('click', loadFromFile);
  document.getElementById('deleteReadingHistory').addEventListener('click', deleteReadingHistoryUI);