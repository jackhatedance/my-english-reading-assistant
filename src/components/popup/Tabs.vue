<script setup>
import { onUpdated, inject, nextTick, computed } from 'vue';
import TabHeader from './TabHeader.vue';
import TabBody from './TabBody.vue';
import AnnotationTab from './tabs/AnnotationTab.vue'
import TextTab from './tabs/TextTab.vue'
import DictionaryTab from './tabs/DictionaryTab.vue'


import { ref, watch } from "vue";

const emit = defineEmits(['markWord', 'vocabulary', 'note', 'change-setting']);
const t = chrome.i18n.getMessage;

const props = defineProps({
    word: String,
    dictionary: String,
    notes: Array,
    page: Object,
    activeTabId: String,
    changeToggle: Boolean,
    menuItems: Array,
});


const sidepanelTabActions = chrome.i18n.getMessage('sidepanelTabActions');
const sidepanelTabMenu = chrome.i18n.getMessage('sidepanelTabMenu');
const sidepanelTabVocabulary = chrome.i18n.getMessage('sidepanelTabVocabulary');
const sidepanelTabNotes = chrome.i18n.getMessage('sidepanelTabNotes');
const sidepanelTabBook = chrome.i18n.getMessage('sidepanelTabBook');


//console.log('Tabs notes:' + JSON.stringify(props.notes));

const pageUrl = computed(() => {
    if(props.page) {
      return props.page.url;
    }
    return '';
});

async function onActiveTab(tabId) {
    //console.log('on active tab:' + tabId);
    activeTabId.value = tabId;
}

function onChangeSetting(type){
  console.log('emit change setting:'+type);
    emit('change-setting', type);
}

function onVocabulary(){
    
    emit('vocabulary');
}

const activeTabId = ref(props.activeTabId);
watch(() => props.changeToggle, (newValue, oldValue) => {
    // React to prop changes
    //console.log('page changed:', newValue);
    activeTabId.value = props.activeTabId; // Update the value in the ref if needed
});

onUpdated(() => {
  
});

</script>

<template>
    <div class=tab-container>

        

        <ul v-show="true" class="tabs clearfix">
            <TabHeader tabId="annotation-tab" :name="t('popup_tab_annotation')" :isActive="activeTabId === 'annotation-tab'" @activeTab="onActiveTab"></TabHeader>
            <TabHeader tabId="text-tab" :name="t('popup_tab_text')" :isActive="activeTabId === 'text-tab'" @activeTab="onActiveTab"></TabHeader>
            <TabHeader tabId="dictionary-tab" :name="t('popup_tab_dictionary')" :isActive="activeTabId === 'dictionary-tab'" @activeTab="onActiveTab"></TabHeader>
        </ul>
        <TabBody id="annotation-tab" v-show="activeTabId === 'annotation-tab'" :isActive="activeTabId === 'annotation-tab'">
            <AnnotationTab @change-setting="onChangeSetting"></AnnotationTab>
        </TabBody>
        <TabBody id="text-tab" v-show="activeTabId === 'text-tab'" :isActive="activeTabId === 'text-tab'">
            <TextTab @change-setting="onChangeSetting"></TextTab>
        </TabBody>
        <TabBody id="dictionary-tab" v-show="activeTabId === 'dictionary-tab'" :isActive="activeTabId === 'dictionary-tab'">
            <DictionaryTab @change-setting="onChangeSetting"></DictionaryTab>
        </TabBody>
       
        
    </div>
</template>
<style>

.tab-container{
  margin: 0;
  padding: 0;
  
}

ul.tabs{
  margin: 0;
  list-style-type : none;
  
  overflow: hidden;
  padding-left: 10px;
  padding-right: 20px;
}

ul.tabs > li.active{
  z-index: 2;
  background: #efefef;
}

ul.tabs > li.active:before{
  border-color : transparent #efefef transparent transparent;
}


ul.tabs > li.active:after{
  border-color : transparent transparent transparent #efefef;
}

ul.tabs > li{
  float : left;
  margin-right : 2px;
  border-top-right-radius: 5px;
  border-top-left-radius: 5px;
  padding : 5px;
  background: #ddd;
  position : relative;
  max-width : 200px;
}

ul.tabs > li > a{
  display: inline-block;
  max-width:100%;
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: none;
  color: #222;
  padding: 5px;
}


/* Clear Fix took for HTML 5 Boilerlate*/

.clearfix:before, .clearfix:after { content: ""; display: table; }
.clearfix:after { clear: both; }
.clearfix { zoom: 1; }

.tabbody.active{
  background: #efefef;
}
</style>