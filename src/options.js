'use strict';

import './options.css';
import {loadKnownWords, loadAndMergeWordLists, saveKnownWords, calculateKnownWordsCount} from './vocabularyStore.js';
import { addCustomDictionary, deleteCustomDictionary } from './dictionary/customDictionary.js';
import {getOptions, setOptions} from './service/optionService.js';
import {localizeHtmlPage} from './locale.js';
import {deleteAllReadingHistory} from './service/activityService.js';
import { getNotes, setNotes } from './service/noteService.js';
import { getUnrecognizedWords, clearUnrecognizedWords } from './service/dictionaryService.js';

localizeHtmlPage();

var gOldDictionaryNames = []
//dictionary: { name:'xx', data:'yy'}
var gNewDictionaryMap = {};

  // Saves options to chrome.storage
  const saveOptionsUI = async () => {
    const splitter = /\r*\n/;
    let knownWordsArray = document.getElementById('knownWords').value.split(splitter);
    
    //custom dictionary names
    const dictionaryOptions = document.getElementById('dictionaries').options;
    let dictionaryNames = [];
    for (let i = 0; i < dictionaryOptions.length; i++) {
      dictionaryNames.push(dictionaryOptions[i].value);
    }

    let notesArray = JSON.parse(document.getElementById('notes').value);
    let wordMarkRootMode = document.getElementById('rootMode').checked;
    let enableReport = document.getElementById('enableReport').checked;
    let enableDictionary = document.getElementById('enableDictionary').checked;
    let enableUnrecognizedWords = document.getElementById('enableUnrecognizedWords').checked;
    
    await save({
      knownWords: knownWordsArray,
      notes: notesArray,
      options: {
        rootAndAffix:{
          enabled:wordMarkRootMode,
        },
        report:{
          enabled: enableReport,
        },
        dictionary:{
          enabled: enableDictionary,
          dictionaries: dictionaryNames,
        },        
        unrecognizedWords:{
          enabled: enableUnrecognizedWords,
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
  
  function clearNotes(){
    updateNotes([]);
  }

  function clearUnrecognizedWordsAction(){
    //clear UI
    document.getElementById('unrecognizedWords').value = '';
    
    //delete from store
    clearUnrecognizedWords();
  }

  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
  const restoreOptions = async () => {
    let knownWordsResult = await loadKnownWords();
    let notes  = await getNotes();
    let knownWords = knownWordsResult;
    if(!knownWords){
      knownWords= [];
    }    

    updateVocabulary(knownWords);
    updateNotes(notes);
    

    //word mark
    let options = await getOptions();

    console.log(options);
    
    let dictionaryOptions = options.dictionary;
    if(dictionaryOptions.dictionaries){
      gOldDictionaryNames = dictionaryOptions.dictionaries;
      updateDictionaries(dictionaryOptions);
    }
    
    updateWordMark(options.rootAndAffix?.enabled);
    updateReport(options.report);

    let unrecognizedWords = await getUnrecognizedWords();
    updateUnrecognizedWords(unrecognizedWords, options.unrecognizedWords);
    
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

  const deleteDictionary = async () => {
    let selectElement = document.getElementById('dictionaries')
    
    let selectedDictionary = selectElement.value;
    
    await deleteCustomDictionary(selectedDictionary);
    selectElement.remove(selectElement.selectedIndex);
  };

  function backupVocabulary() {
    
    let vocabulary = document.getElementById('knownWords').value;
    saveTextAsFile(vocabulary, 'vocabulary');

  };
  
  function backupNotes() {
    
    let notes = document.getElementById('notes').value;
    saveTextAsFile(notes, 'notes');

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

  function loadNotesFromFile() {
    
    var file = document.getElementById("notesFile").files[0];
    if(!file){
        alert('pick notes file first.');
        return;
    }

    var reader = new FileReader();
    reader.onload = function(e){
      //console.log(e.target.result);
      let array = JSON.parse(e.target.result);
      updateNotes(array);
    }
    reader.readAsText(file);

  };

  function updateVocabulary(wordArray){
    document.getElementById('knownWords').value = wordArray.join('\n');

    const knownCount = calculateKnownWordsCount(wordArray);   
    
    document.getElementById('count').innerHTML = knownCount;
  }

  function updateNotes(wordArray){
    document.getElementById('notes').value = JSON.stringify(wordArray);
    document.getElementById('noteCount').innerHTML = wordArray.length;
  }

  function updateDictionaries(dictionaryOptions){
    document.getElementById('enableDictionary').checked = dictionaryOptions.enabled;
    //(dictionaryOptions);
    var dictionaries = document.getElementById('dictionaries');
    for(let name of dictionaryOptions.dictionaries) {
      const opt1 = document.createElement("option");
      
      opt1.value = name;
      opt1.text = name;
      dictionaries.add(opt1);
    }    
  }

  function updateWordMark(rootMode){
    document.getElementById('rootMode').checked = rootMode;
  }

  function updateReport(reportOptions){
    document.getElementById('enableReport').checked = reportOptions.enabled;
  }

  function updateUnrecognizedWords(unrecognizedWords, unrecognizedWordsOptions) {
    document.getElementById('unrecognizedWords').value = unrecognizedWords.join('\n');
    document.getElementById('unrecognizedWordsCount').innerHTML = unrecognizedWords.length;
    document.getElementById('enableUnrecognizedWords').checked = unrecognizedWordsOptions.enabled;
  }

  async function save(settings){
    if(settings.knownWords){
      let uw = settings.knownWords;
      await saveKnownWords(uw);
      settings.knownWords = null;
    }

    if(settings.options.dictionary){
      let dictionaryOptions = settings.options.dictionary;
      await saveDictionaries(dictionaryOptions.dictionaries);      
    }

    if(settings.notes){
      let notes = settings.notes;
      await setNotes(notes);
      settings.notes = null;
    }

    if(settings.options){
      let options = settings.options;
      await setOptions(options);
    }
  }

  async function saveDictionaries(dictionaryNames){
    //deleted
    for(let name of gOldDictionaryNames){
      if(!dictionaryNames.includes(name)){
        deleteCustomDictionary(name);
      }
    }    

    //added
    for(let name of dictionaryNames){
      if(!gOldDictionaryNames.includes(name)){
        let data = gNewDictionaryMap[name];
        addCustomDictionary(name, data);
      }
    }

    //updated
    for(let name of dictionaryNames){
      if(gOldDictionaryNames.includes(name)){
        let data = gNewDictionaryMap[name];
        if(data){//just uploaded
          addCustomDictionary(name, data);
        }        
      }
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
 

  function saveTextAsFile(text, name) {
    var textToWrite = text;
    var textFileAsBlob = new Blob([ textToWrite ], { type: 'text/plain' });

    let yyyymmdd = formatDate(new Date());
    var fileNameToSaveAs = `my-${name}-${yyyymmdd}.txt`; //filename.extension
  
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
  
  function initializeDictionaryDropSupport(){
    const dropArea = document.getElementById("dropArea");

    // Prevent default drag behaviors
    ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
      dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Highlight drop area when item is dragged over it
    ["dragenter", "dragover"].forEach(eventName => {
      dropArea.addEventListener(eventName, highlight, false);
    });

    ["dragleave", "drop"].forEach(eventName => {
      dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
      dropArea.classList.add("highlight");
    }

    function unhighlight(e) {
      dropArea.classList.remove("highlight");
    }

    // Handle dropped files
    dropArea.addEventListener("drop", handleDrop, false);

    function handleDrop(e) {
      let dt = e.dataTransfer;
      let files = dt.files;

      handleFiles(files);
    }

    function handleFiles(files) {
      ([...files]).forEach(file => {
        //console.log(file.name); // Do something with the file
        let name = file.name;
        if(name.endsWith('.txt')){
          name = name.slice(0, -4);
        }

        var reader = new FileReader();
        reader.onload = function(e){
          //console.log(e.target.result);
          let array = e.target.result.split(/\r*\n/);
          //save dict data to memory temporarily
          gNewDictionaryMap[name] = array;
        }
        reader.readAsText(file);

        
        //add dictionary name to select element
        var dictionaries = document.getElementById('dictionaries');
        const optionExists = Array.from(dictionaries.options).some(option => option.value === name);
        if(!optionExists){
          const opt1 = document.createElement("option");
        
          opt1.value = name;
          opt1.text = name;
          dictionaries.add(opt1);
        }
        
      });
    }
  }
  
  document.addEventListener('DOMContentLoaded', restoreOptions);
  document.getElementById('backupVocabulary').addEventListener('click', backupVocabulary);
  document.getElementById('resetVocabulary').addEventListener('click', resetVocabulary);
  document.getElementById('deleteDictionary').addEventListener('click', deleteDictionary);
  document.getElementById('backupNotes').addEventListener('click', backupNotes);
  document.getElementById('save').addEventListener('click', saveOptionsUI);
  document.getElementById('loadFromFile').addEventListener('click', loadFromFile);
  document.getElementById('loadNotesFromFile').addEventListener('click', loadNotesFromFile);
  document.getElementById('clearNotes').addEventListener('click', clearNotes);
  document.getElementById('deleteReadingHistory').addEventListener('click', deleteReadingHistoryUI);
  document.getElementById('clearUnrecognizedWords').addEventListener('click', clearUnrecognizedWordsAction);
  initializeDictionaryDropSupport();