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
import ExternalLink from '../../common/ExternalLink.vue'
import { deleteDictionaryAllResourceFiles } from '../../../store/db.js'
import { DICTIONARY_INDEX_STATUS_OK, DICTIONARY_INDEX_STATUS_NOT_SUPPORT } from '../../../dictionary/dictConstants.js'
import {useLoading} from 'vue-loading-overlay'
import { ElButton } from 'element-plus'
import 'element-plus/es/components/button/style/css'

const dictionaryMetas = ref([]);
const selectedDictionary = ref();
const selectedDictionaryEnabled = ref(false);

const selectedDictionaryObject = ref();

const file = ref();

const indexBuildingProgress = inject('indexBuildingProgress');

const optionsEditDictionaryTips = ref('');
const optionalTips = ref({});

const extractable = computed(() => {
  let meta = toRaw(selectedDictionaryObject.value);
  if(!meta){
    return false;
  }

  
  let isUser = meta.type == 'user';
  //console.log(meta);

  let support = ! notSupport(meta);

  return isUser && support;
});

const $loading = useLoading({
        // options
    });

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

async function onExtract() {
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

async function onAdd() {
  const files = file.value.files;
  if (files.length == 0) {
    alert(t('choose_file_first'));
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

function supportOk(meta){
  return meta.data.index?.support 
    && meta.data.index?.status == DICTIONARY_INDEX_STATUS_OK 
    && meta.data.index?.hasNewerParser != true;
}

function supportOkUpgradable(meta){
  return meta.data.index?.support 
    && meta.data.index?.status == DICTIONARY_INDEX_STATUS_OK 
    && meta.data.index?.hasNewerParser == true;
}

function supportInvalid(meta){
  return meta.data.index.support 
    && meta.data.index?.status != DICTIONARY_INDEX_STATUS_OK;
}

function notSupport(meta){
  return meta.data.index?.status == DICTIONARY_INDEX_STATUS_NOT_SUPPORT;
}

const t = chrome.i18n.getMessage;

const init = async () => {
  
  await refreshUI();

  optionsEditDictionaryTips.value = await markdown2Html(t('optionsEditDictionaryTips'));
};

init();
</script>

<template>

  <div class="sections dictionary">
    <div class="section">
      <div class="label">
        <p>
        {{ t('optionsEditDictionaryIndexColorTipsTitle') }}
        </p>
        <ul>
          <li class="green">{{ t('optionsEditDictionaryIndexColorTipsGreen') }}</li>
          <li class="lightgreen">{{ t('optionsEditDictionaryIndexColorTipsLightGreen') }}</li>
          <li class="yellow">{{ t('optionsEditDictionaryIndexColorTipsYellow') }}</li>
          <li class="red">{{ t('optionsEditDictionaryIndexColorTipsRed') }}<ExternalLink type="faq" keyword="为什么有些词典无法提取结构化数据？"/></li>
        </ul>
        
        <p v-html="optionsEditDictionaryTips"></p>
        <ul class="optional-tips">
          <li v-for="(tip, index) in optionalTips" :key="tip" :value="tip">{{ tip }}</li>
        </ul>
        
      </div>
      <div class="input dictionary">
        <div class="dictionaries">
          <div class="list">
            <select class="dictionary-select" v-model="selectedDictionary" :size="12" @change="onChangeSelectedDictionary">
              <option :class="{support_ok: supportOk(meta), support_ok_upgradable: supportOkUpgradable(meta), support_invalid: supportInvalid(meta), not_support: notSupport(meta)}" v-for="(meta, index) in dictionaryMetas" :key="meta.name" :value="meta.name">{{ meta.enabled? `[✓]`:''}}{{ meta.displayName }}</option>
            </select>          
          </div>
          <DictionaryDetail v-if="selectedDictionaryObject" v-model:enabled="selectedDictionaryEnabled" :dict="selectedDictionaryObject" @value-changed="onDetailChanged"></DictionaryDetail>
        </div>
        <div>
          <el-button v-if="debug" @click="onDeleteGarbage">Delete Garbage</el-button>
          <el-button round @click="onDelete" :disabled="selectedDictionaryObject?.type == 'system'">{{ t('optionsDeleteAdditionalDictionaryAction') }}</el-button>
          <el-button round @click="onExtract" :disabled="!extractable">{{ t('optionsImportDictionaryAction') }}</el-button>

          <el-button round @click="onMoveUp" >{{ t('optionsDictionaryMoveUpAction') }}</el-button>
          <el-button round @click="onMoveDown" >{{ t('optionsDictionaryMoveDownAction') }}</el-button>
        </div>
      </div>
      <div class="action">
        
      </div>
    </div>
    <div class="section">
      <div class="label">
        <p>{{ t('optionsImportDictionaryDesc') }} <ExternalLink type="guide" keyword="词典格式"/></p>
        <ExternalLink type="faq" keyword="词典哪里找？" :message="t('options_dictionary_find_tips')"/>
      </div>
      <div class="input">
        <input type="file" ref="file" accept=".txt, .zip">
        <el-button round @click="onAdd">{{ t('optionsAddDictionaryAction') }}</el-button>
      </div>
      <div class="action">
        
      </div>
    </div>
    
  </div>

</template>
<style>
.sections.dictionary{
  .dictionaries {
    display: flex;
  }
  .input.dictionary {

    

    .list {
      width: 50%;
      margin: 8px;

      .dictionary-select{
        
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