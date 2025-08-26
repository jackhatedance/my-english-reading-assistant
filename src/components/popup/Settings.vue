<script setup>
import { ref, provide, inject, computed, toRaw } from 'vue';
import { setSiteOptions, setSiteOptionsAsDefault, getDefaultSiteOptions, initVocabularyIfEmpty} from '../../service/optionService.js';
import {localizeHtmlPage} from '../../locale.js';
import {initializeOptionService, getOptionsFromCache} from '../../service/optionService.js';
import { getAdditionalDictionaryMetas } from '../../dictionary/customDictionary.js'
import { getWebSiteDocumentUrl } from '../../site.js';

const t = chrome.i18n.getMessage;

const props = defineProps({
    pageInfo: Object,
    options: Object
});

const gQueryParams = inject('gQueryParams');



const enabled = ref(false);
const position = ref(0);
const fontSize = ref(0);
const lineHeight = ref(1);

const color = ref('');
const opacity = ref(0.5);

const interlaced = ref(false);
const maxMeaningNumber = ref(3);
const hideWordClass = ref(false);

const contentStyleEnabled = ref(false);
const unknownWordColor = ref('');

const additionalDictionaryMetas = ref([]);
const additionalDictionaries = ref([]);

//const emit = defineEmits(['reload-page-info']);

const additionalDictionaryEnabled = computed(() => {
    return props.options.dictionary.additionalDictionaryEnabled;
});

const site = computed(() => {
    console.log(props.pageInfo?.domain);
    return props.pageInfo?.domain;
});

function onChangePageEnabled(){
    //emit('reload-page-info');
    getPageInfo((pageInfo) => {
        toggleEnabled(pageInfo.visible);
    });
}

function onChangeSetting(){
    applyStyles();
}


function buildOptions(){
  //const selectedAdditionalDictionaryValues = Array.from(additionalDictionariesElement.selectedOptions).map(option => option.value);

  let newOptions = {
    enabled: enabled.value,

    annotation:{    
      fontSize: fontSize.value,
      lineHeight: lineHeight.value,
      position: position.value,        
      opacity: opacity.value,
      color:color.value,        
      maxMeaningNumber: maxMeaningNumber.value,
      hideWordClass: hideWordClass.value,        
      interlaced: interlaced.value,
    },
    content: {
      enabled: contentStyleEnabled.value,
      unknownWordColor: unknownWordColor.value,
    },
    other: {
      additionalDictionaries: toRaw(additionalDictionaries.value),
    }
  };

  return newOptions;
}

async function applyStyles(){
    let newOptions = buildOptions();

    let siteDomain = props.pageInfo.domain;

    //console.log('set site options, domain:'+siteDomain + ', options:'+ JSON.stringify(newOptions))
    await setSiteOptions(siteDomain, newOptions);
    console.log(newOptions);
    let queryOptions = { active: true, currentWindow: true };
    if(gQueryParams.index){
        let index = parseInt(gQueryParams.index);
        queryOptions = { index: index };
    }

    chrome.tabs.query(queryOptions, (tabs) => {
        const tab = tabs[0];
        chrome.tabs.sendMessage(
        tab.id,
        {
            type: 'CHANGE_SITE_OPTIONS',
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
    let queryOptions = { active: true, currentWindow: true };
    if(gQueryParams.index){
        let index = parseInt(gQueryParams.index);
        queryOptions = { index: index };
    }
    chrome.tabs.query(queryOptions, (tabs) => {
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
    let queryOptions = { active: true, currentWindow: true };
    if(gQueryParams.index){
        let index = parseInt(gQueryParams.index);
        queryOptions = { index: index };
    }

    chrome.tabs.query(queryOptions, (tabs) => {
        console.log(`query tab`);
        console.log(JSON.stringify(tabs));
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
                    console.log('getPageInfo:'+JSON.stringify(response));
                    resolve(response.pageInfo?response.pageInfo:undefined);
                }else {
                    resolve(undefined);
                }
            }
        );
    });
}


function updateViewModel(siteOptions, settingsOnly = false){
  if(!settingsOnly){
    enabled.value = siteOptions.enabled;
  }

  let annotationOptions = siteOptions.annotation;
  position.value = annotationOptions.position;
  fontSize.value = annotationOptions.fontSize;
  lineHeight.value = annotationOptions.lineHeight;

  color.value = annotationOptions.color;
  opacity.value = annotationOptions.opacity;

  interlaced.value = annotationOptions.interlaced;
  maxMeaningNumber.value = annotationOptions.maxMeaningNumber;
  hideWordClass.value = annotationOptions.hideWordClass;

  let contentOptions = siteOptions.content;

  contentStyleEnabled.value = contentOptions.enabled;
  unknownWordColor.value = contentOptions.unknownWordColor;

  let otherOptions = siteOptions.other;
  additionalDictionaries.value = otherOptions.additionalDictionaries;
}

async function onReset(){
  let siteOptions = await getDefaultSiteOptions();
  updateViewModel(siteOptions, true);
  applyStyles();
}

async function onSaveAsDefault(){
  let newOptions = buildOptions();
  setSiteOptionsAsDefault(newOptions);
}

const init = async () => {
  additionalDictionaryMetas.value = await getAdditionalDictionaryMetas();
  updateViewModel(props.pageInfo.siteOptions);
};


init();
</script>

<template>
    <div id="pageSection">
        <h3 id="site">{{ site }}</h3>
        <p class="subtitle">{{ t('popupShowHideDefinition') }}</p>
        <label class="switch">
          <input type="checkbox" id="enabledCheckbox" data-testid="switch" v-model="props.pageInfo.visible" @change="onChangePageEnabled">
          <span class="slider"></span>
        </label>
        <div>
          <label>{{ t('popupAlwaysShowDefinition') }}<input type="checkbox" id="enabled" v-model="enabled" @change="onChangeSetting"></label>
        </div>
        <br/>
        
        <h4>{{ t('popupSettings') }}</h4>
        <div class="popup-settings">

          <div class="field">
            <label>{{ t('popupPositionLabel') }}</label>
            <input id="annotationPosition" v-model="position"  @change="onChangeSetting" type="number" value="-1" min="-10" max="10" step="0.1">
          </div>  

          <div class="field">
            <label>{{ t('popupFontSizeLabel') }}</label>
            <input id="fontSize" v-model="fontSize" @change="onChangeSetting" type="number" value="0.4" min="0.1" max="1" step="0.1">
          </div>
          
          <div class="field">
            <label>{{ t('popupLineHeightLabel') }}</label>
            <input id="lineHeight" v-model="lineHeight" @change="onChangeSetting" type="number" value="0.5" min="1" max="2" step="0.1">
          </div>

          <div class="field">
            <label for="color">{{ t('popupColorLabel') }}</label>
            <input type="color" id="color" v-model="color" @change="onChangeSetting"  name="color" value="#808080">
          </div>

          <div class="field">
            <label>{{ t('popupOpacityLabel') }}</label>
            <input id="opacity" v-model="opacity" @change="onChangeSetting" type="number" value="0.3" min="0.1" max="1" step="0.1">
          </div>

          <div class="field">
            <label>{{ t('popupInterlacedLabel') }}</label>
            <input id="interlaced" v-model="interlaced" @change="onChangeSetting" type="checkbox" >
          </div>

          <div class="field">
            <label>{{ t('popupMaxMeaningNumberLabel') }}<span class="red">*</span></label>
            <input id="maxMeaningNumber" v-model="maxMeaningNumber" @change="onChangeSetting" type="number" value="3" min="1" max="20" step="1">
          </div>

          <div class="field">
            <label>{{ t('popupHideWordClassLabel') }}<span class="red">*</span></label>
            <input id="hideWordClass" v-model="hideWordClass" @change="onChangeSetting" type="checkbox" >
          </div>

          <div class="field">
            <label>{{ t('popupUnknownWordColorLabel') }}</label>
            <input id="contentStyleEnabled" v-model="contentStyleEnabled" @change="onChangeSetting" type="checkbox" >
            <input type="color" id="unknownWordColor" v-model="unknownWordColor" @change="onChangeSetting" name="unknownWordColor" value="#808080">
          </div>

          <div class="field" id="dictionaryField" v-show="additionalDictionaryEnabled">
            <label>{{ t('popupAdditionalDictionaryLabel') }}'<span class="red">*</span></label>
            <select id="additionalDictionaries" v-model="additionalDictionaries" @change="onChangeSetting" multiple size="3">
                <option v-for="(meta, index) in additionalDictionaryMetas" :key="meta.name" :value="meta.name">{{ meta.displayName }}</option>
            </select>            
          </div>

          <div>
            <button id="resetAnnotationSettings" @click="onReset" class="button">{{ t('popupResetButton') }}</button>
            <button id="saveAsDefault" @click="onSaveAsDefault" class="button">{{ t('popupSaveAsDefault') }}</button>
          </div>

          <div class="footnote">
            <span class="red">*</span>{{ t('popupFootNotes') }}
          </div>

        </div>

        <button id="test" class="button" style="display:none">Test</button>
      </div>
</template>
<style>

</style>