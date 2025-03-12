<script setup>
import { ref, toRaw } from 'vue';
import { getOptions, updateOptions } from '../../../service/optionService.js';
import { saveDictionary, deleteDictionary, getAllDictionaryMetas, getDictionaryMeta, saveDictionaryMeta } from '../../../dictionary/customDictionary.js';
import DictionaryDetail from './DictionaryDetail.vue';

const dictionaries = ref([]);
const selectedDictionary = ref();
const selectedDictionaryEnabled = ref(false);

const selectedDictionaryObject = ref();

const file = ref();
const enableAdditionalDictionary = ref(false);

async function onChangeEnable() {
  await updateAdditionalDictionaryEnabled(enableAdditionalDictionary.value);
}

async function onDelete() {
  //console.log(array);

  await deleteDictionary(selectedDictionary.value);

  let array = dictionaries.value;
  var index = array.indexOf(selectedDictionary.value);
  if (index !== -1) {
      array.splice(index, 1);
  }

  //trigger event
  selectedDictionaryObject.value = null;
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
  if (files.length == 0) {
    alert('pick file first.');
    return;
  }

  const _file = files[0];


  let name = _file.name;
  if (name.endsWith('.txt')) {
    name = name.slice(0, -4);
  }

  let size = 0;
  var reader = new FileReader();
  reader.onload = async function (e) {
    //console.log(e.target.result);
    let array = e.target.result.split(/\r*\n/);
    size = array.length;
    
    const newDictionary = {
      name: name,
      type: 'user',
      format: 'text',
      size: size,
      fromLanguage: 'english',
      toLanguage: 'chinese',
      data: array,
    };
    saveDictionary(newDictionary);

    //add dictionary name to select element
    if (!dictionaries.value.includes(name)) {
      dictionaries.value.push(name)
    }
    
  }
  reader.readAsText(_file);


}

async function onChangeSelectedDictionary() {
  console.log(selectedDictionary.value);

  let dictMeta = await getDictionaryMeta(selectedDictionary.value);
  selectedDictionaryObject.value = dictMeta;
  selectedDictionaryEnabled.value = dictMeta.enabled;
  //console.log(toRaw(selectedDictionaryObject.value));
}

async function onDetailChanged(){
  //console.log(`detail changed, enabled: ${selectedDictionaryEnabled.value}`);
  let obj = toRaw(selectedDictionaryObject.value);
  const newDictionary = {
      name: obj.name,
      type: obj.type,
      format: obj.format,
      size: obj.size,
      fromLanguage: obj.fromLanguage,
      toLanguage: obj.toLanguage,
      //data: obj.data,
      enabled: selectedDictionaryEnabled.value
    };
    saveDictionaryMeta(newDictionary);
}

const init = async () => {
  

  let allDictionaries = await getAllDictionaryMetas();
  if (allDictionaries.length > 0) {
    
    let allDictionaryNames = [];
    for (let d of allDictionaries) {
      allDictionaryNames.push(d.name);
    }
    dictionaries.value = allDictionaryNames;
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
      <div class="input dictionary">
        <div class="list">
          <select class="dictionaries" v-model="selectedDictionary" size="10" @change="onChangeSelectedDictionary">
            <option v-for="(name, index) in dictionaries" :key="name" :value="name">{{ name }}</option>
          </select>
        </div>
        <DictionaryDetail v-if="selectedDictionaryObject" v-model:enabled="selectedDictionaryEnabled" :dict="selectedDictionaryObject" @value-changed="onDetailChanged"></DictionaryDetail>

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
        <button @click="onImport">{{ t('optionsImportAdditionalDictionaryAction') }}</button>
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
<style>
.input.dictionary {

  display: flex;

  * {
    margin-left: 5px;
  }

  .dictionaries{
    min-width: 100px;
  }

}
</style>