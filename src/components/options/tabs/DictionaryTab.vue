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
import HelpLink from '../../HelpLink.vue'
import { deleteDictionaryAllResourceFiles } from '../../../store/db.js'
import { DICTIONARY_INDEX_STATUS_OK, DICTIONARY_INDEX_STATUS_NOT_SUPPORT } from '../../../dictionary/dictConstants.js'
import {useLoading} from 'vue-loading-overlay'

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

const $loading = useLoading({
        // options
    });

async function onChangeEnableAdditionalDictionary() {
  await updateAdditionalDictionaryEnabled(enableAdditionalDictionary.value);
}

const debug = ref(false);
async function onDeleteGarbage() {
  let keyword = 'extracted_resource_';
  const all = await chrome.storage.local.get();
  let keys = [];
  for (const [key, val] of Object.entries(all)) {
    if(key.includes(keyword)){
      keys.push(key);
    }
  }
  chrome.storage.local.remove(keys, ()=>{});
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

async function onImport() {
  let name = selectedDictionary.value;
  await deleteDictionaryIndex(name);
  await deleteDictionaryAllResourceFiles(name);

  refreshUI();
  sendMessageDictionaryChangeToBackground(name, 'parse');
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

async function onAdd() {
  const files = file.value.files;
  if (files.length == 0) {
    alert('pick file first.');
    return;
  }

  const _file = files[0];

  let fileName = _file.name;
  let name = fileName.slice(0, -4);
  
  const loader = $loading.show({
            // Optional parameters
        });
  
  //console.log(e.target.result);
  const newDictionary = await getDictionaryFromFile(fileName,name, _file);  
  
  if(newDictionary){
    //let dataUrl = await readFileAsync(_file, 'dataUrl'); 
    //newDictionary.data = dataUrl;

    //clean data anyway
    await deleteDictionary(newDictionary.meta.name);

    await saveDictionary(newDictionary);
    
    
    loader.hide()


    //add dictionary name to select element
    await refreshUI();

    sendMessageDictionaryChangeToBackground(newDictionary.meta.name, 'add');
  }else{
    alert('failed to import');
  }
  
}

async function getDictionaryFromFile(fileName, name, file){
  let dictionary;
  if(fileName.endsWith('.txt')){    
    dictionary = getTextDictionary(fileName, name, file);
  } else if(fileName.endsWith('.zip')){
    dictionary = getZipDictionary(fileName, name, file);
  } 
  return dictionary;
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
    package: false,
    definitionFormat: 'text',
    size: size,
    fromLanguage: 'en',
    toLanguage: 'cn',
    enabled: false,        
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

  let dictionary =  new MdictDictionary(data, '', { rawType: 'package'});

  if(dictionary){
    //const def1 = mdictDictionary.lookup("ask");
    //console.log(def1.definition);

    let size = dictionary.size;
    let title = dictionary.title;
    if(!title || title.trim() == '' || title == 'Title (No HTML code allowed)'){
      title = name;
    }
    
    const newDictionaryMeta = {
      name: title,
      type: 'user',
      format: 'mdict',
      package: true,
      definitionFormat: 'html',
      size: size,
      fromLanguage: 'en',
      toLanguage: 'cn',
      enabled: false,    
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
      console.log(`dictionary job ${newValue.progress.job} complete`);
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
  if(newValue > 2){
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
};

init();
</script>

<template>

  <div class="sections dictionary">
    <div class="section">
      <div class="label">
        <p>
        {{ t('optionsEditDictionaryIndexColorTipsTitle') }}
        <ul>
          <li class="green">{{ t('optionsEditDictionaryIndexColorTipsGreen') }}</li>
          <li class="lightgreen">{{ t('optionsEditDictionaryIndexColorTipsLightGreen') }}</li>
          <li class="yellow">{{ t('optionsEditDictionaryIndexColorTipsYellow') }}</li>
          <li class="red">{{ t('optionsEditDictionaryIndexColorTipsRed') }}<HelpLink type="faq" keyword="为什么有些词典无法提取结构化数据"/></li>
        </ul>
        </p>
        <p v-html="optionsEditDictionaryTips"></p>
        <ul class="optional-tips">
          <li v-for="(tip, index) in optionalTips" :key="tip" :value="tip">{{ tip }}</li>
        </ul>
        
      </div>
      <div class="input dictionary">
        <div class="list">
          <select class="dictionaries" v-model="selectedDictionary" :size="12" @change="onChangeSelectedDictionary">
            <option :class="{support_ok: meta.data.index?.support && meta.data.index?.status == DICTIONARY_INDEX_STATUS_OK && meta.data.index?.hasNewerParser != true, support_ok_upgradable: meta.data.index?.support && meta.data.index?.status == DICTIONARY_INDEX_STATUS_OK && meta.data.index?.hasNewerParser == true, support_invalid: meta.data.index.support && meta.data.index?.status != DICTIONARY_INDEX_STATUS_OK, not_support: meta.data.index?.status == DICTIONARY_INDEX_STATUS_NOT_SUPPORT}" v-for="(meta, index) in dictionaryMetas" :key="meta.name" :value="meta.name">{{ meta.enabled? `[${options_dictionary_detail_enabled}]`:''}}{{ meta.displayName }}</option>
          </select>          
        </div>
        <DictionaryDetail v-if="selectedDictionaryObject" v-model:enabled="selectedDictionaryEnabled" :dict="selectedDictionaryObject" @value-changed="onDetailChanged"></DictionaryDetail>
        
      </div>
      <div class="action">
        <button v-if="debug" @click="onDeleteGarbage">Delete Garbage</button>
        <button @click="onDelete" :disabled="selectedDictionaryObject?.type == 'system'">{{ t('optionsDeleteAdditionalDictionaryAction') }}</button>
        <button @click="onImport" :disabled="selectedDictionaryObject?.type == 'system'">{{ t('optionsImportDictionaryAction') }}</button>

        <button @click="onMoveUp" >{{ t('optionsDictionaryMoveUpAction') }}</button>
        <button @click="onMoveDown" >{{ t('optionsDictionaryMoveDownAction') }}</button>
      </div>
    </div>
    <div class="section">
      <div class="label">
        <p>{{ t('optionsImportDictionaryDesc') }} <HelpLink type="guide" keyword="词典格式"/></p>
        <HelpLink type="faq" keyword="词典哪里找" :parentheses=false :message="t('options_dictionary_find_tips')"/>
      </div>
      <div class="input">
        <input type="file" ref="file" accept=".txt, .zip">
      </div>
      <div class="action">
        <button @click="onAdd">{{ t('optionsAddDictionaryAction') }}</button>
      </div>
    </div>
    <div class="section">
      <div class="label">
        <p>{{ t('optionsAdditionalDictionaryEnableDictionaryDesc') }}<HelpLink type="guide" keyword="附加词典" ></HelpLink></p>
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

    .list {
      width: 50%;
    
      .dictionaries{
        
        width: 100%;
        overflow-y: auto;
        
        option.support_ok{
          color: green;
        }
        option.support_ok_upgradable{
          color: lightgreen;
        }
        option.support_invalid{
          color: rgb(209, 185, 3);
        }
        option.not_support{
          color: rgba(255, 89, 0, 0.933);
        }
      }
    }
    .detail{
      width: 50%;
    }
  }


  .green {
    color: green;
  }
  .lightgreen {
    color: lightgreen;
  }
  .yellow {
    color: rgb(209, 185, 3);
  }
  .red {
    color: rgba(255, 89, 0, 0.933);
  }

  .optional-tips {
    color: red;
  }
}
</style>