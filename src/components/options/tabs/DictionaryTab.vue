<script setup>
import { ref, toRaw } from 'vue';
import { getOptions, updateOptions } from '../../../service/optionService.js';
import { addCustomDictionary, deleteCustomDictionary } from '../../../dictionary/customDictionary.js';
import { saveTextAsFile } from '../../../html-utils.js';

const dictionaries = ref();
const selectedDictionary = ref([]);
const file = ref();
const enableAdditionalDictionary = ref(false);

async function onChangeEnable() {
  await updateAdditionalDictionaryEnabled(enableAdditionalDictionary.value);
}

async function onDelete(){
    //let array = toRaw(dictionaries.value);
    //console.log(array);
    
    await deleteCustomDictionary(selectedDictionary.value);
    let array = dictionaries.value;
    var index = array.indexOf(selectedDictionary.value);
    if (index !== -1) {
        array.splice(index, 1);
    }
    
    await updateDictionariesInOptions(toRaw(array));
    
}

async function updateDictionariesInOptions(nameArray) {
    let options = await getOptions();
    let dictionary = options.dictionary;
    dictionary.additionalDictionaries = nameArray;
    let newOptions = { dictionary };

    await updateOptions(newOptions);
}

async function updateAdditionalDictionaryEnabled(value) {
    let options = await getOptions();
    let dictionary = options.dictionary;
    dictionary.additionalDictionaryEnabled = value;
    let newOptions = { dictionary };

    await updateOptions(newOptions);
}

async function onImport() {
   
    const files = file.value.files;
    if(files.length == 0){
        alert('pick file first.');
        return;
    }

    const _file = files[0];


    let name = _file.name;
    if(name.endsWith('.txt')){
      name = name.slice(0, -4);
    }

    var reader = new FileReader();
    reader.onload = function(e){
      //console.log(e.target.result);
      let array = e.target.result.split(/\r*\n/);
      //save dict data to memory temporarily
      //gNewDictionaryMap[name] = array;
      addCustomDictionary(name, array);
    }
    reader.readAsText(_file);

    //add dictionary name to select element
    if(!dictionaries.value.includes(name)){
      dictionaries.value.push(name)
    }

    await updateDictionariesInOptions(toRaw(dictionaries.value));    
}

const init = async () => {
    let options = await getOptions();
    let dictionaryOptions = options.dictionary;
    //console.log(options);
    
    if(dictionaryOptions.additionalDictionaries){
        dictionaries.value = dictionaryOptions.additionalDictionaries;      
        enableAdditionalDictionary.value = dictionaryOptions.additionalDictionaryEnabled;
        //dictionaries.value = names;
        //console.log(dictionaries.value);
    }    

};

const t = chrome.i18n.getMessage;


init();
</script>

<template>

<div class="sections">
          <div class="section">
            <div class="label">
              
            </div>
            <div class="input">              
              <select v-model="selectedDictionary" size="10" >
                <option v-for="(name,index) in dictionaries" :key="name" :value="name">{{name}}</option>
              </select>          
            </div>            
            <div class="action">
              <button @click="onDelete">{{ t('optionsDeleteAdditionalDictionaryAction') }}</button>
            </div>
          </div>
          <div class="section">
            <div class="label">
              <p>{{ t('optionsImportDictionaryDesc') }}</p>          
            </div>
            <div class="input">
              <input type="file" ref="file">
            </div>
            <div class="action">
              <button @click="onImport" >{{ t('optionsImportAdditionalDictionaryAction') }}</button>
            </div>
          </div>
          <div class="section">
            <div class="label">
              <p>{{ t('optionsAdditionalDictionaryEnableDictionaryDesc') }}</p>
            </div>
            <div class="input">
              <label>{{ t('optionsAdditionalDictionaryEnableDictionaryLabel') }}</label>
              <input @change="onChangeEnable" v-model="enableAdditionalDictionary" type="checkbox">
            </div>
            <div class="action"></div>
          </div>
        </div>

</template>
