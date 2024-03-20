'use strict';

import './options.css';
import {loadKnownWords, loadAndMergeWordLists, saveKnownWords} from './vocabularyStore.js';
import {localizeHtmlPage} from './locale.js';

localizeHtmlPage();

// Saves options to chrome.storage
const saveOptions = () => {
    const splitter = /\r*\n/;
    let knownWordsArray = document.getElementById('knownWords').value.split(splitter);

    save({
      knownWords: knownWordsArray
    });

  };
  
  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
  const restoreOptions = async () => {
    let knownWordsResult = await loadKnownWords();
    let knownWords = knownWordsResult;
    if(!knownWords){
      knownWords= [];
    }    

    updateVocabulary(knownWords);
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
    document.getElementById('count').innerHTML = wordArray.length;
  }

  async function save(settings){
    if(settings.knownWords){
      let uw = settings.knownWords;
      await saveKnownWords(uw);
      settings.knownWords = null;
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
  document.getElementById('save').addEventListener('click', saveOptions);
  document.getElementById('loadFromFile').addEventListener('click', loadFromFile);