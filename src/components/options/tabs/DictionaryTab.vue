<script setup>
import { ref, toRaw, watch, inject, computed } from 'vue';
import { getOptions, updateOptions } from '../../../service/optionService.js';
import { saveDictionary, deleteDictionary, deleteDictionaryIndex, getAllDictionaryMetas, getDictionaryMeta, saveDictionaryMeta, changeOrder } from '../../../dictionary/customDictionary.js';
import DictionaryDetail from './DictionaryDetail.vue';
import { ZipReader, BlobReader, Data64URIWriter } from '@zip.js/zip.js'
import { readFileAsync } from '../../../utils/fileUtils.js'
import { MdictDictionary } from '../../../dictionary/mdict/MdictDictionary.js'
import { TextDictionary } from '../../../dictionary/text/TextDictionary.js'
import { sendMessageDictionaryChangeToBackground } from '../../../message.js';
import { markdown2Html } from '../../../utils/markdownUtils.js'

const dictionaryMetas = ref([]);
const selectedDictionary = ref();
const selectedDictionaryEnabled = ref(false);

const selectedDictionaryObject = ref();

const file = ref();
const enableAdditionalDictionary = ref(false);

const indexBuildingProgress = inject('indexBuildingProgress');

const optionsEditDictionaryTips = ref('');
const options_dictionary_detail_enabled = ref('');
const optionalTips = ref({});
const dictionaryFormatHelpLink = ref('#');
const howToFindDictionaryLink = ref('#');

async function onChangeEnableAdditionalDictionary() {
  await updateAdditionalDictionaryEnabled(enableAdditionalDictionary.value);
}

async function onDelete() {
  //console.log(array);

  await deleteDictionary(selectedDictionary.value);

  let metaArray = dictionaryMetas.value;
  let index = metaArray.findIndex((item) => item.name == selectedDictionary.value);
  if (index !== -1) {
      metaArray.splice(index, 1);
  }

  //trigger event
  selectedDictionaryObject.value = null;
}

async function onBuildIndex() {
  let name = selectedDictionary.value;
  await deleteDictionaryIndex(name);
  refreshUI();
  sendMessageDictionaryChangeToBackground(name, 'build-index');
}

async function onMoveUp() {
  let name = selectedDictionary.value;
  
  let metas = dictionaryMetas.value;

  let index = metas.findIndex((item) => item.name == name);
  if(index != -1 && index >0){
    swap(metas, index, index -1);
  }
  let names = metas.map(item => item.name)
  await changeOrder(names);
}

async function onMoveDown() {
  let name = selectedDictionary.value;
  
  let metas = dictionaryMetas.value;

  let index = metas.findIndex((item) => item.name == name);
  if(index != -1 && index + 1 <= metas.length -1){
    swap(metas, index, index + 1);
  }
  let names = metas.map(item => item.name)
  await changeOrder(names);
}

function swap(array, index1, index2) {
  const temp = array[index1];
  array[index1] = array[index2];
  array[index2] = temp;
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

  let fileName = _file.name;
  let name = fileName.slice(0, -4);
  
  //console.log(e.target.result);
  const newDictionary = await getDictionaryFromFile(fileName,name, _file);  
  
  if(newDictionary){
    //let dataUrl = await readFileAsync(_file, 'dataUrl'); 
    //newDictionary.data = dataUrl;

    await saveDictionary(newDictionary);

    //add dictionary name to select element
    let metaArray = toRaw(dictionaryMetas.value);
    let meta = metaArray.find((item) => item.name == selectedDictionary.value);
    if (!meta) {
      dictionaryMetas.value.push(newDictionary.meta)
    }

    sendMessageDictionaryChangeToBackground(name, 'add');
  }else{
    alert('failed to import');
  }
  
}

async function getDictionaryFromFile(fileName, name, file){
  let meta;
  if(fileName.endsWith('.txt')){    
    meta = getTextDictionary(fileName, name, file);
  } else if(fileName.endsWith('.zip')){
    meta = getZipDictionary(fileName, name, file);
  } 
  return meta;
}

async function getTextDictionary(fileName, name, file){

  let fileMap = {};
  let dataUrl = await readFileAsync(file, 'dataUrl');
  fileMap[fileName] = dataUrl;

 

  let data = { raw: fileMap };
  let dictionary =  new TextDictionary(data, '');
  
  let size = dictionary.size;
    
  const meta = {
    name: name,
    type: 'user',
    format: 'text',
    'size': size,
    fromLanguage: 'en',
    toLanguage: 'cn',        
    data: {
        index:{}
      },
  };
    
  const newDictionary = {
    meta,
    data
  };

  return newDictionary;  
}

async function getZipDictionary(fileName, name, file){
  const options = {"filenameEncoding":"gbk"}
  var entries = await (new ZipReader(new BlobReader(file))).getEntries(options);
  
  let fileMap = {};
  for(let entry of entries){    
    if(!entry.directory){
      const dataUri = await entry.getData(new Data64URIWriter());         
      fileMap[entry.filename] = dataUri;
    }
  }
  
  let data = {
    raw: fileMap,
  };

  let dictionary =  new MdictDictionary(data, '');

  if(dictionary){
    //const def1 = mdictDictionary.lookup("ask");
    //console.log(def1.definition);

    let size = dictionary.size;
    let title = dictionary.title;
    
    const newDictionaryMeta = {
      name: title,
      type: 'user',
      format: 'mdict',
      size: size,
      fromLanguage: 'en',
      toLanguage: 'cn',    
      data: {
        raw: dictionary.getRawMeta(),
        index:{}
      },
    };
    const newDictionaryData = {
      raw: fileMap,     
      index: null, 
    };

    const newDictionary = {
      meta: newDictionaryMeta,
      data: newDictionaryData,
    };

    return newDictionary;
  } 

}

async function onChangeSelectedDictionary() {
  //console.log(selectedDictionary.value);

  let dictMeta = await getDictionaryMeta(selectedDictionary.value);
  selectedDictionaryObject.value = dictMeta;
  selectedDictionaryEnabled.value = dictMeta.enabled;
  //console.log(toRaw(selectedDictionaryObject.value));
}

async function onDetailChanged(){
  //console.log(`detail changed, enabled: ${selectedDictionaryEnabled.value}`);
  let obj = toRaw(selectedDictionaryObject.value);
 
  const newMeta =  Object.assign({}, obj, { enabled: selectedDictionaryEnabled.value});

  await saveDictionaryMeta(newMeta);

  await refreshUI();
}

async function refreshUI(){
  dictionaryMetas.value = await getAllDictionaryMetas();

  let dictMeta = await getDictionaryMeta(selectedDictionary.value);
  selectedDictionaryObject.value = dictMeta;

  let options = await getOptions();
  enableAdditionalDictionary.value = options.dictionary.additionalDictionaryEnabled;

}

watch(() => indexBuildingProgress.value, (newValue) => {
    if(newValue.progress.rate == 1){
      console.log('index build complete');
      refreshUI();
    }
});

const sumOfEnabledDictionary = computed(() => {
  return dictionaryMetas.value.reduce((accumulator, currentValue) => accumulator + (currentValue.enabled ? 1:0), 0); 
});

watch(sumOfEnabledDictionary, (newValue) =>{
  if(newValue ==0 ){
    optionalTips.value['sumOfEnabledDictionary'] = t('optionsEditDictionaryIndexColorTipsAtLeastEnabledOneDictionary');
  }else{
    delete optionalTips.value.sumOfEnabledDictionary;
  }
});


const sumOfEnabledBigDictionary = computed(() => {
  return dictionaryMetas.value.reduce((accumulator, currentValue) => accumulator + (currentValue.size > 10000 && currentValue.enabled ? 1:0), 0); 

});

watch(sumOfEnabledBigDictionary, (newValue) =>{
  if(newValue > 3){
    optionalTips.value['sumOfEnabledBigDictionary'] = t('optionsEditDictionaryIndexColorTipsTooManyDictionariesEnabled');
  }else{
    delete optionalTips.value['sumOfEnabledBigDictionary'];
  }
});

const t = chrome.i18n.getMessage;

const init = async () => {
  
  await refreshUI();

  optionsEditDictionaryTips.value = await markdown2Html(t('optionsEditDictionaryTips'));
  options_dictionary_detail_enabled.value = t('options_dictionary_detail_enabled');
  options_dictionary_detail_enabled.value = t('options_dictionary_detail_enabled');
  dictionaryFormatHelpLink.value = chrome.runtime.getURL('guide.html#词典格式');
  howToFindDictionaryLink.value = chrome.runtime.getURL('faq.html#词典哪里找');
};

init();
</script>

<template>

  <div class="sections dictionary">
    <div class="section">
      <div class="label">
        <ul>
          <li class="green">{{ t('optionsEditDictionaryIndexColorTipsGreen') }}</li>
          <li class="orange">{{ t('optionsEditDictionaryIndexColorTipsOrange') }}</li>
          <li class="blue">{{ t('optionsEditDictionaryIndexColorTipsBlue') }}</li>
        </ul>
        <p v-html="optionsEditDictionaryTips"></p>
        <ul class="optional-tips">
          <li v-for="(tip, index) in optionalTips" :key="key" :value="tip">{{ tip }}</li>
        </ul>
        
      </div>
      <div class="input dictionary">
        <div class="list">
          <select class="dictionaries" v-model="selectedDictionary" size="10" @change="onChangeSelectedDictionary">
            <option :class="{support_ok: meta.data.index?.support && meta.data.index?.status == 'OK', support_invalid: meta.data.index.support && meta.data.index?.status != 'OK', not_support: meta.data.index?.status == 'NOT_SUPPORT'}" v-for="(meta, index) in dictionaryMetas" :key="meta.name" :value="meta.name">{{ meta.enabled? `[${options_dictionary_detail_enabled}]`:''}}{{ meta.displayName }}</option>
          </select>          
        </div>
        <DictionaryDetail v-if="selectedDictionaryObject" v-model:enabled="selectedDictionaryEnabled" :dict="selectedDictionaryObject" @value-changed="onDetailChanged"></DictionaryDetail>
        
      </div>
      <div class="action">
        <button @click="onDelete" :disabled="selectedDictionaryObject?.type == 'system1'">{{ t('optionsDeleteAdditionalDictionaryAction') }}</button>
        <button @click="onBuildIndex" :disabled="selectedDictionaryObject?.type == 'system'">{{ t('optionsBuildDictionaryIndexAction') }}</button>

        <button @click="onMoveUp" >{{ t('optionsDictionaryMoveUpAction') }}</button>
        <button @click="onMoveDown" >{{ t('optionsDictionaryMoveDownAction') }}</button>
      </div>
    </div>
    <div class="section">
      <div class="label">
        <p>{{ t('optionsImportDictionaryDesc') }} <a target=_blank :href="dictionaryFormatHelpLink">?</a></p>
        <a :href="howToFindDictionaryLink">{{ t('options_dictionary_find_tips') }}</a>
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
        <input @change="onChangeEnableAdditionalDictionary" v-model="enableAdditionalDictionary" type="checkbox">
      </div>
      <div class="action"></div>
    </div>
  </div>

</template>
<style>
.sections.dictionary{
  .input.dictionary {

    display: flex;

    * {
      margin-left: 5px;
    }

    .dictionaries{
      min-width: 100px;
      
      option.support_ok{
        color: green;
      }
      option.support_invalid{
        color: orange;
      }
      option.not_support{
        color: blue;
      }
    }
  }


  .green {
    color: green;
  }
  .orange {
    color: orange;
  }
  .blue {
    color: blue;
  }

  .optional-tips {
    color: red;
  }
}
</style>