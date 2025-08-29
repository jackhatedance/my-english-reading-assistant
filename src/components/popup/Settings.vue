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
const dualAnnotationEnabled = ref(false);

const content = ref(0);
const content2 = ref(0);

const position = ref(0);
const position2 = ref(0);

const fontSize = ref(0);
const fontSize2 = ref(0);

const lineHeight = ref(1);

const color = ref('');
const color2 = ref('');

const opacity = ref(0.5);
const opacity2 = ref(0.5);

const interlaced = ref(false);
const interlaced2 = ref(false);

const maxMeaningNumber = ref(3);
const hideWordClass = ref(false);

const contentStyleEnabled = ref(false);
const unknownWordColor = ref('');
const unknownWordWidth = ref(1);

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

function onChangeDualAnnotationEnabled(){
  if(dualAnnotationEnabled.value == true && unknownWordWidth.value ==1){
    //fix ::before display on end of previous line issue
    unknownWordWidth.value = 1.1;
  }
  if(dualAnnotationEnabled.value == false && unknownWordWidth.value ==1.1){
    //fix ::before display on end of previous line issue
    unknownWordWidth.value = 1;
  }
  applyStyles();
}

function buildOptions(){
  //const selectedAdditionalDictionaryValues = Array.from(additionalDictionariesElement.selectedOptions).map(option => option.value);

  let newOptions = {
    enabled: enabled.value,
    dualAnnotationEnabled: dualAnnotationEnabled.value,

    annotation:{    
      content: content.value,
      fontSize: fontSize.value,
      lineHeight: lineHeight.value,
      position: position.value,        
      opacity: opacity.value,
      color:color.value,        
      maxMeaningNumber: maxMeaningNumber.value,
      hideWordClass: hideWordClass.value,        
      interlaced: interlaced.value,
    },
    secondaryAnnotation: {
        content: content2.value,
        position: position2.value,  
        fontSize: fontSize2.value,
        opacity: opacity2.value,
        color: color2.value,  
        interlaced: interlaced2.value,
    },
    content: {
      enabled: contentStyleEnabled.value,
      unknownWordColor: unknownWordColor.value,
      unknownWordWidth: unknownWordWidth.value,
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

  dualAnnotationEnabled.value = siteOptions.dualAnnotationEnabled;

  let annotationOptions = siteOptions.annotation;
  let annotationOptions2 = siteOptions.secondaryAnnotation;

  content.value = annotationOptions.content;
  content2.value = annotationOptions2.content;

  position.value = annotationOptions.position;
  position2.value = annotationOptions2.position;

  fontSize.value = annotationOptions.fontSize;
  fontSize2.value = annotationOptions2.fontSize;

  color.value = annotationOptions.color;
  color2.value = annotationOptions2.color;

  opacity.value = annotationOptions.opacity;
  opacity2.value = annotationOptions2.opacity;

  interlaced.value = annotationOptions.interlaced;
  interlaced2.value = annotationOptions2.interlaced;

  lineHeight.value = annotationOptions.lineHeight;

  maxMeaningNumber.value = annotationOptions.maxMeaningNumber;
  hideWordClass.value = annotationOptions.hideWordClass;

  let contentOptions = siteOptions.content;

  contentStyleEnabled.value = contentOptions.enabled;
  unknownWordColor.value = contentOptions.unknownWordColor;
  unknownWordWidth.value = contentOptions.unknownWordWidth;

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
        <div class="toggle-container">
          <div class="toggle-master">
            <span class="subtitle">{{ t('popupShowHideDefinition') }}</span>
            <label class="switch">
              <input type="checkbox" id="enabledCheckbox" data-testid="switch" v-model="props.pageInfo.visible" @change="onChangePageEnabled">
              <span class="slider"></span>
            </label>
          </div>
          <div class="toggle-always">
            <label>{{ t('popupAlwaysShowDefinition') }} <input type="checkbox" id="enabled" v-model="enabled" @change="onChangeSetting"></label>
          </div>
        </div>
                
        <div class="popup-settings">

          <div class="annotation-settings">
            <div class="field">
              <label>{{ t('popupDualAnnotationEnabledLabel') }}</label>
              <input v-model="dualAnnotationEnabled" @change="onChangeDualAnnotationEnabled" type="checkbox" >
            
            </div>

            <div class="field">
              <label>{{ t('popupContentLabel') }}</label>
              <select data-testid="content" v-model="content" @change="onChangeSetting" >
                <option value="AC_NONE">{{ t('popup_settings_content_none') }}</option>
                <option value="AC_PRONUNCIATION">{{ t('popup_settings_content_pronunciation') }}</option>
                <option value="AC_DEFINITION">{{ t('popup_settings_content_definition') }}</option>
                <option value="AC_PRONUNCIATION_AND_DEFINITION">{{ t('popup_settings_content_pronunciation_and_definition') }}</option>
                <option value="AC_PRONUNCIATION_AND_DEFINITION_NEW_LINE">{{ t('popup_settings_content_pronunciation_newline_definition') }}</option>
              </select>

              <select data-testid="content2" class="annotation-input-2" v-show="dualAnnotationEnabled" v-model="content2" @change="onChangeSetting" >
                <option value="AC_NONE">{{ t('popup_settings_content_none') }}</option>
                <option value="AC_PRONUNCIATION">{{ t('popup_settings_content_pronunciation') }}</option>
                <option value="AC_DEFINITION">{{ t('popup_settings_content_definition') }}</option>
                <option value="AC_PRONUNCIATION_AND_DEFINITION">{{ t('popup_settings_content_pronunciation_and_definition') }}</option>
                <option value="AC_PRONUNCIATION_AND_DEFINITION_NEW_LINE">{{ t('popup_settings_content_pronunciation_newline_definition') }}</option>
              </select>
            </div>
            
            <div class="field">
              <label>{{ t('popupPositionLabel') }}</label>
              <input id="annotationPosition" v-model="position"  @change="onChangeSetting" type="number" value="-1" min="-10" max="10" step="0.1">
              <input class="annotation-input-2" v-show="dualAnnotationEnabled" v-model="position2"  @change="onChangeSetting" type="number" value="-1" min="-10" max="10" step="0.1">
            </div>

            <div class="field">
              <label>{{ t('popupFontSizeLabel') }}</label>
              <input id="fontSize" v-model="fontSize" @change="onChangeSetting" type="number" value="0.4" min="0.1" max="1" step="0.1">
              <input class="annotation-input-2" v-show="dualAnnotationEnabled" v-model="fontSize2" @change="onChangeSetting" type="number" value="0.4" min="0.1" max="1" step="0.1"></input>
            </div>
            
            <div class="field">
              <label for="color">{{ t('popupColorLabel') }}</label>
              <input type="color" id="color" v-model="color" @change="onChangeSetting"  name="color" value="#808080">
              <input type="color" class="annotation-input-2" v-show="dualAnnotationEnabled" v-model="color2" @change="onChangeSetting"  name="color" value="#808080">
            </div>

            <div class="field">
              <label>{{ t('popupOpacityLabel') }}</label>
              <input id="opacity" v-model="opacity" @change="onChangeSetting" type="number" value="0.3" min="0.1" max="1" step="0.1">
              <input class="annotation-input-2" v-show="dualAnnotationEnabled" v-model="opacity2" @change="onChangeSetting" type="number" value="0.3" min="0.1" max="1" step="0.1">
            </div>

            <div class="field">
              <label>{{ t('popupInterlacedLabel') }}</label>
              <input id="interlaced" v-model="interlaced" @change="onChangeSetting" type="checkbox" >
              <input class="annotation-input-2" v-show="dualAnnotationEnabled" v-model="interlaced2" @change="onChangeSetting" type="checkbox" >
            </div>
          </div>
          <div class="field">
            <label>{{ t('popupLineHeightLabel') }}</label>
            <input id="lineHeight" v-model="lineHeight" @change="onChangeSetting" type="number" value="0.5" min="1" max="3" step="0.1">
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

          <div class="field">
            <label>{{ t('popupUnknownWordWidthLabel') }}</label>
            <input id="unknownWordWidth" v-model="unknownWordWidth" @change="onChangeSetting" type="number" value="1" min="1" max="5" step="1">
          </div>

          <div class="field" id="dictionaryField" v-show="additionalDictionaryEnabled">
            <label>{{ t('popupAdditionalDictionaryLabel') }}<span class="red">*</span></label>
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

      </div>
</template>
<style>
.toggle-container{
  display: flex;
  padding-left: 5px;
  padding-right: 5px;
  padding-bottom: 10px;

  .toggle-master {
    width: 70%;
    align-content: end;
  }
  .toggle-always {
    align-content: end;
    margin-bottom: 10px;
  }
}
.annotation-settings {
  padding:0 !important;
}
</style>