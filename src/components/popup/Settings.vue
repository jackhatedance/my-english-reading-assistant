<script setup>
import { ref, provide, inject, computed, toRaw } from 'vue';
import { getOptionsFromCache, initVocabularyIfEmpty} from '../../service/optionService.js';
import { setSiteOptions, setSiteOptionsAsDefault, getDefaultSiteOptions, } from '../../service/site-option-service.js';
import { getAdditionalDictionaryMetas } from '../../dictionary/customDictionary.js'
import HelpLink from '../HelpLink.vue'
import { SWITCH_MODE_OPTION_UNSET, SWITCH_MODE_OPTION_ON, SWITCH_MODE_OPTION_OFF, SWITCH_MODE_OPTION_AUTO } from '../../switch-mode.js'

import { ElSelect, ElOption } from 'element-plus'
import 'element-plus/es/components/select/style/css'
import { ElSwitch } from 'element-plus'
import 'element-plus/es/components/switch/style/css'
import { ElButton } from 'element-plus'
import 'element-plus/es/components/button/style/css'
import { ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'
import 'element-plus/es/components/dropdown/style/css'
import 'element-plus/es/components/dropdown-menu/style/css'
import 'element-plus/es/components/dropdown-item/style/css'
import { ElIcon } from 'element-plus'
import 'element-plus/es/components/icon/style/css'
import { ArrowDown } from '@element-plus/icons-vue'
import { ElTabs, ElTabPane } from 'element-plus'
import 'element-plus/es/components/tabs/style/css'
import 'element-plus/es/components/tab-pane/style/css'

import AnnotationTab from './tabs/AnnotationTab.vue'
import TextTab from './tabs/TextTab.vue'
import DictionaryTab from './tabs/DictionaryTab.vue'
import MiscTab from './tabs/MiscTab.vue'

import InformationTooltip from '../common/InformationTooltip.vue'
import { convertUnsetToValue, convertValueToUnset, trueFalseNullDict, getValueByOption, getOptionByValue } from '../../element-plus-utils.js'
import { fixCategory } from '../../site-category.js'

const t = chrome.i18n.getMessage;

const props = defineProps({
    pageInfo: Object,
    options: Object
});

const gQueryParams = inject('gQueryParams');

const activeTabName = ref('annotation');

const enabled = ref(false);

const switchMode = ref('');
function getSwitchModeValue(){
  return convertUnsetToValue(switchMode.value, '');
}


function setSwitchModeValue(value){
  switchMode.value = convertValueToUnset(value, '');
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

const width = ref(3);
provide('width', width);
const width2 = ref(3);
provide('width2', width2);

const maxMeaningNumber = ref(3);
provide('maxMeaningNumber', maxMeaningNumber);
const hideWordClass = ref(false);
provide('hideWordClass', hideWordClass);

const unknownWordColor = ref('');
provide('unknownWordColor', unknownWordColor);
const unknownWordWidth = ref(1);
provide('unknownWordWidth', unknownWordWidth);

const textFontSize = ref();
provide('textFontSize', textFontSize);

const bionicEnabled = ref(false);
provide('bionicEnabled', bionicEnabled);


const additionalDictionaryMetas = ref([]);
provide('additionalDictionaryMetas', additionalDictionaryMetas);
const additionalDictionaries = ref([]);
provide('additionalDictionaries', additionalDictionaries);

const clickWord = ref(true);
provide('clickWord', clickWord);

const hoverWord = ref(true);
provide('hoverWord', hoverWord);

const selectText = ref(true);
provide('selectText', selectText);

const partialTokenizationMode = ref('');
provide('partialTokenizationMode', partialTokenizationMode);
function getPartialTokenizationModeValue(){
  return convertUnsetToValue(partialTokenizationMode.value, '');
}

function setPartialTokenizationModeValue(value){
  partialTokenizationMode.value = convertValueToUnset(value, '');
}

const siteCategory = ref('text');
provide('siteCategory', siteCategory);

const notesEnabled = ref(false);
provide('notesEnabled', notesEnabled);

const virtualSiteEnabled = ref(false);
provide('virtualSiteEnabled', virtualSiteEnabled);

//const emit = defineEmits(['reload-page-info']);


const site = computed(() => {
    console.log(props.pageInfo?.domain);
    let displaySite;
    if(props.pageInfo?.siteOptions?._runtime?.virtualSite){
      displaySite = `${props.pageInfo?.domain} - ${props.pageInfo?.siteOptions?._runtime?.virtualSite.path}`;
    }else{
      displaySite = props.pageInfo?.domain;
    }
    return displaySite;
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
    //get REAL state from page, because the switch state may not same with page state
    getContentPageInfo((pageInfo) => {
      let currentPageState = pageInfo.visible;
        toggleEnabled(currentPageState);
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
    site:{
      virtualSiteEnabled: virtualSiteEnabled.value,
      category: siteCategory.value,
    },

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
      width: width.value,
    },
    secondaryAnnotation: {
        content: content2.value,
        position: position2.value,  
        fontSize: fontSize2.value,
        opacity: opacity2.value,
        color: color2.value,  
        interlaced: interlaced2.value,
        width: width2.value,
    },
    content: {
      unknownWordColor: unknownWordColor.value,
      unknownWordWidth: unknownWordWidth.value,
      textFontSize: textFontSize.value,
      bionic: {
        enabled: bionicEnabled.value,
      }
    },
    other: {
      additionalDictionaries: toRaw(additionalDictionaries.value),
    },
    interaction: {
      clickWord: getValueByOption(clickWord.value, trueFalseNullDict),
      hoverWord: getValueByOption(hoverWord.value, trueFalseNullDict),
      selectText: getValueByOption(selectText.value, trueFalseNullDict),
    },
    partialTokenization:{
      mode: getPartialTokenizationModeValue(partialTokenizationMode.value)
    },
    notes: {
      enabled: notesEnabled.value,
    }
  };

  return newOptions;
}

async function applyStyles(){
    let newOptions = buildOptions();

    let site = props.pageInfo.siteOptions.siteName;

    //console.log('set site options, domain:'+siteDomain + ', options:'+ JSON.stringify(newOptions))
    await setSiteOptions(site, newOptions);
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

    //fix switch state if mismatch
    if(enabled.value != newValue){
      setTimeout(function () {
        enabled.value = newValue;
      }, 100);
    }
    
    

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

function getContentPageInfo(resolve){
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
                  sections: [],          
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
  siteCategory.value = fixCategory(siteOptions.site.category);

  virtualSiteEnabled.value = siteOptions.site.virtualSiteEnabled;

  if(!props.options.annotation.dualAnnotation.enabled){
    dualAnnotationEnabled.value = false;
  } else{
    dualAnnotationEnabled.value = siteOptions.dualAnnotationEnabled;  
  }
  

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

  if(!props.options.annotation.interlaced.enabled){
    interlaced.value = false;
    interlaced2.value = false;
  }else{
    interlaced.value = annotationOptions.interlaced;
    interlaced2.value = annotationOptions2.interlaced;
  }

  width.value = annotationOptions.width;
  width2.value = annotationOptions2.width;

  lineHeight.value = annotationOptions.lineHeight;

  maxMeaningNumber.value = annotationOptions.maxMeaningNumber;

  if(!props.options.annotation.hideWordClass.enabled){
    hideWordClass.value = false;
  } else{
    hideWordClass.value = annotationOptions.hideWordClass;
  }


  let contentOptions = siteOptions.content;

  unknownWordColor.value = contentOptions.unknownWordColor;
  unknownWordWidth.value = contentOptions.unknownWordWidth;

  if(contentOptions.textFontSize > 0){
    textFontSize.value = contentOptions.textFontSize;
  } else {
    textFontSize.value = null;
  }
  
  bionicEnabled.value = contentOptions.bionic.enabled;

  let otherOptions = siteOptions.other;
  additionalDictionaries.value = otherOptions.additionalDictionaries;


  let interactionOptions = siteOptions.interaction;
  clickWord.value =  getOptionByValue(interactionOptions.clickWord, trueFalseNullDict);
  hoverWord.value =  getOptionByValue(interactionOptions.hoverWord, trueFalseNullDict);
  selectText.value =  getOptionByValue(interactionOptions.selectText, trueFalseNullDict);

  setPartialTokenizationModeValue(siteOptions.partialTokenization.mode);

  let notesOptions = siteOptions.notes;
  notesEnabled.value = notesOptions.enabled;
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

async function onDefaultCommand(command){
  if(command == 'resetDefault'){
    setSiteOptionsAsDefault(null);//delete
  }
  
}

const init = async () => {
  enabled.value = props.pageInfo.visible;
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
              <el-switch size="large" id="enabledCheckbox" data-testid="switch" v-model="enabled" @change="onChangePageEnabled" />
              
            </label>
          </div>
          <div class="switch-mode">
            <label>{{ t('popupSiteSwitchMode') }}<InformationTooltip :content="t('popupSiteSwitchModeTip')" linkType="guide" linkKeyword="站点开关模式" effect="dark" /></label>
            
            
            
              <el-select data-testid="switch-mode" class="switch-mode" v-model="switchMode" @change="onChangeSetting" >
                <el-option :value="SWITCH_MODE_OPTION_UNSET" :label="defaultSwitchMode + '(' +t('popupSiteSwitchModeUnset') + ')'" />
                <el-option :value="SWITCH_MODE_OPTION_ON" :label="t('options_general_switch_mode_on')" />
                <el-option :value="SWITCH_MODE_OPTION_OFF" :label="t('options_general_switch_mode_off')" />
                <el-option :value="SWITCH_MODE_OPTION_AUTO" :label="t('options_general_switch_mode_auto')" />
              </el-select>    
            
          </div>
        </div>
                
        <div class="popup-settings">
          <el-tabs v-model="activeTabName" class="setting-tabs" @tab-click="handleClick">
            <el-tab-pane :label="t('popup_tab_annotation')" name="annotation">
              <AnnotationTab @change-setting="onChangeSetting"></AnnotationTab>
            </el-tab-pane>
            <el-tab-pane :label="t('popup_tab_text')" name="text">
              <TextTab @change-setting="onChangeSetting"></TextTab>
            </el-tab-pane>
            <el-tab-pane :label="t('popup_tab_dictionary')" name="dictionary">
              <DictionaryTab @change-setting="onChangeSetting"></DictionaryTab>
            </el-tab-pane>
            <el-tab-pane :label="t('popup_tab_misc')" name="misc">
              <MiscTab :virtualSite="props.pageInfo.siteOptions._runtime?.virtualSite" @change-setting="onChangeSetting"></MiscTab>
            </el-tab-pane>
            
          </el-tabs>

          <div class="buttons">
            <el-button id="resetAnnotationSettings" @click="onReset">{{ t('popupResetButton') }}</el-button>
            <el-dropdown @click="onSaveAsDefault" @command="onDefaultCommand" split-button trigger="click" placement="top-start">
             
                {{ t('popupSaveAsDefault') }}
              
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="resetDefault">{{ t('popupResetDefault') }}</el-dropdown-item>
                  
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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

.setting-tabs {
  min-height: 280px;
}

.annotation-settings {
  padding:0 !important;
}
.hidden-component {
  display: none;
}
</style>