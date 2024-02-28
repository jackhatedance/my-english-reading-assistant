'use strict';

import './options.css';
import {loadKnownWords, loadDefaultKnownWords, saveKnownWords} from './vocabularyStore.js';

// Saves options to chrome.storage
const saveOptions = () => {
    
    let knownWordsArray = document.getElementById('knownWords').value.split('\n');

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
    document.getElementById('knownWords').value = knownWords.join('\n');

  };

  const resetVocabulary = async () => {
    let knownWordsResult = await loadDefaultKnownWords();
    let knownWords = knownWordsResult;
    if(!knownWords){
      knownWords= [];
    }    
    document.getElementById('knownWords').value = knownWords.join('\n');

  };


  async function save(settings){
    if(settings.knownWords){
      let uw = settings.knownWords;
      await saveKnownWords(uw);
      settings.knownWords = null;
    }
    
  }
  
  document.addEventListener('DOMContentLoaded', restoreOptions);
  document.getElementById('resetVocabulary').addEventListener('click', resetVocabulary);
  document.getElementById('save').addEventListener('click', saveOptions);