<script setup>
import { ref, provide, inject, computed, toRaw } from 'vue';
import { setSiteOptions, setSiteOptionsAsDefault, getDefaultSiteOptions, initVocabularyIfEmpty} from '../../service/optionService.js';
import { getOptionsFromCache} from '../../service/optionService.js';
import { getAdditionalDictionaryMetas } from '../../dictionary/customDictionary.js'
import HelpLink from '../HelpLink.vue'
import { SWITCH_MODE_OPTION_UNSET, SWITCH_MODE_OPTION_ON, SWITCH_MODE_OPTION_OFF, SWITCH_MODE_OPTION_AUTO } from '../../switch-mode.js'
import Tabs from './Tabs.vue'
import { ElSelect, ElOption } from 'element-plus'
import 'element-plus/es/components/select/style/css'

const t = chrome.i18n.getMessage;

const props = defineProps({
    pageInfo: Object,
    options: Object
});

const gQueryParams = inject('gQueryParams');

const activeTabId = 'annotation-tab';

const enabled = ref(false);

const switchMode = ref('');
function getSwitchModeValue(){
  let value = switchMode.value;
  if(value == SWITCH_MODE_OPTION_UNSET){
    value = '';
  }
  return value;
}

function setSwitchModeValue(value){
  if(value == ''){
    value = SWITCH_MODE_OPTION_UNSET;
  }
  switchMode.value = value;
}

const dualAnnotationEnabled = ref(false);
provide('dualAnnotationEnabled', dualAnnotationEnabled);

const content = ref(0);
provide('content', content);

const content2 = ref(0);
provide('content2', content2);

const position = ref(0);
provide('position', position);

const position2 = ref(0);
provide('position2', position2);

const fontSize = ref(0);
provide('fontSize', fontSize);

const fontSize2 = ref(0);
provide('fontSize2', fontSize2);

const lineHeight = ref(1);
provide('lineHeight', lineHeight);


const color = ref('');
provide('color', color);
const color2 = ref('');
provide('color2', color2);

const opacity = ref(0.5);
provide('opacity', opacity);
const opacity2 = ref(0.5);
provide('opacity2', opacity2);

const interlaced = ref(false);
provide('interlaced', interlaced);
const interlaced2 = ref(false);
provide('interlaced2', interlaced2);

const maxMeaningNumber = ref(3);
provide('maxMeaningNumber', maxMeaningNumber);
const hideWordClass = ref(false);
provide('hideWordClass', hideWordClass);

const contentStyleEnabled = ref(false);
provide('contentStyleEnabled', contentStyleEnabled);
const unknownWordColor = ref('');
provide('unknownWordColor', unknownWordColor);
const unknownWordWidth = ref(1);
provide('unknownWordWidth', unknownWordWidth);

const textFontSize = ref('');
provide('textFontSize', textFontSize);

const additionalDictionaryMetas = ref([]);
provide('additionalDictionaryMetas', additionalDictionaryMetas);
const additionalDictionaries = ref([]);
provide('additionalDictionaries', additionalDictionaries);

//const emit = defineEmits(['reload-page-info']);


const site = computed(() => {
    console.log(props.pageInfo?.domain);
    return props.pageInfo?.domain;
});

const defaultSwitchMode = computed(() => {
  let options = getOptionsFromCache();
  let switchMode = options.switch.mode;

  if(switchMode == SWITCH_MODE_OPTION_ON){
    return t('options_general_switch_mode_' + switchMode);
  }else if(switchMode == SWITCH_MODE_OPTION_AUTO){
    return t('options_general_switch_mode_auto');
  }else {
    return t('options_general_switch_mode_off');
  }
});

function onChangePageEnabled(){
    //emit('reload-page-info');
    getPageInfo((pageInfo) => {
        toggleEnabled(pageInfo.visible);
    });
}

function onChangeSetting(type){
  console.log('emit change setting:'+type);
  if(type=='dualAnnotationEnabled'){
      if(dualAnnotationEnabled.value == true && unknownWordWidth.value ==1){
        //fix ::before display on end of previous line issue
        unknownWordWidth.value = 1.1;
      }
      if(dualAnnotationEnabled.value == false && unknownWordWidth.value ==1.1){
        //fix ::before display on end of previous line issue
        unknownWordWidth.value = 1;
      }
  }
  applyStyles();
}

function buildOptions(){
  //const selectedAdditionalDictionaryValues = Array.from(additionalDictionariesElement.selectedOptions).map(option => option.value);

  let newOptions = {
    switch: { mode: getSwitchModeValue(switchMode.value) },
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
      textFontSize: textFontSize.value,
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
    setSwitchModeValue(siteOptions.switch.mode);
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

  if(contentOptions.textFontSize > 0){
    textFontSize.value = contentOptions.textFontSize;
  } else {
    textFontSize.value = null;
  }
  

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
          <div class="switch-mode">
            <label>{{ t('popupSiteSwitchMode') }}<HelpLink type="guide" keyword="站点开关模式"/>
            
              <el-select data-testid="switch-mode" class="switch-mode" v-model="switchMode" @change="onChangeSetting" >
                <el-option :value="SWITCH_MODE_OPTION_UNSET" :label="defaultSwitchMode + '(' +t('popupSiteSwitchModeUnset') + ')'" />
                <el-option :value="SWITCH_MODE_OPTION_ON" :label="t('options_general_switch_mode_on')" />
                <el-option :value="SWITCH_MODE_OPTION_OFF" :label="t('options_general_switch_mode_off')" />
                <el-option :value="SWITCH_MODE_OPTION_AUTO" :label="t('options_general_switch_mode_auto')" />
              </el-select>    
            </label>
          </div>
        </div>
                
        <div class="popup-settings">
          <Tabs :activeTabId="activeTabId" @change-setting="onChangeSetting"></Tabs>
          
          <div class="buttons">
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
  .switch-mode {
    align-content: end;
    margin-bottom: 5px;

    select {
      text-align: center;
    }
  }
}
.annotation-settings {
  padding:0 !important;
}
</style>