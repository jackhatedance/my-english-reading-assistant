<script setup>
import { onUpdated, inject, nextTick } from 'vue';
import TabHeader from './TabHeader.vue';
import TabBody from './TabBody.vue';
import VocabularyTabContent from './VocabularyTabContent.vue';
import NotesTabContent from './NotesTabContent.vue';
import MenuTabContent from './MenuTabContent.vue';
import ActionsTabContent from './ActionsTabContent.vue';

import { ref, watch } from "vue";

const emit = defineEmits(['markWord', 'vocabulary', 'note']);

const props = defineProps({
    word: String,
    notes: Array,
    page: Object,
    activeTabId: String,
    changeToggle: Boolean,
    menuItems: Array,
});

const sendMessageToContentPage = inject('sendMessageToContentPage');

const sidepanelTabActions = chrome.i18n.getMessage('sidepanelTabActions');
const sidepanelTabMenu = chrome.i18n.getMessage('sidepanelTabMenu');
const sidepanelTabVocabulary = chrome.i18n.getMessage('sidepanelTabVocabulary');
const sidepanelTabNotes = chrome.i18n.getMessage('sidepanelTabNotes');



console.log('Tabs notes:' + JSON.stringify(props.notes));

async function onActiveTab(tabId) {
    console.log('on active tab:' + tabId);
    activeTabId.value = tabId;
}

function onMarkWord(type){
    
    emit('markWord', type);
}

function onVocabulary(){
    
    emit('vocabulary');
}

function onNote(type){
    
    emit('note', type);
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
            <TabHeader v-if="false" tabId="menu-tab" :name="sidepanelTabMenu" :isActive="activeTabId === 'menu-tab'" @activeTab="onActiveTab" ></TabHeader>
            <TabHeader v-if="false" tabId="notes-tab" :name="sidepanelTabNotes" :isActive="activeTabId === 'notes-tab'" @activeTab="onActiveTab" >
            </TabHeader>

            <TabHeader tabId="vocabulary-tab" :name="sidepanelTabVocabulary" :isActive="activeTabId === 'vocabulary-tab'" @activeTab="onActiveTab"></TabHeader>

            <TabHeader tabId="actions-tab" :name="sidepanelTabActions" :isActive="activeTabId === 'actions-tab'" @activeTab="onActiveTab"></TabHeader>
        </ul>
        <TabBody id="menu-tab" v-show="activeTabId === 'menu-tab'" :isActive="activeTabId === 'menu-tab'">

            <MenuTabContent :menuItems="props.menuItems" @markWord="onMarkWord" @vocabulary="onVocabulary" @note="onNote"></MenuTabContent>
        </TabBody>
        <TabBody id="vocabulary-tab" v-show="activeTabId === 'vocabulary-tab'" :isActive="activeTabId === 'vocabulary-tab'">
            
            <VocabularyTabContent :page="page"></VocabularyTabContent>
        </TabBody>
        <TabBody id="notes-tab" v-show="activeTabId === 'notes-tab'" :isActive="activeTabId === 'notes-tab'">
            
            <NotesTabContent :notes="props.notes"></NotesTabContent>
        </TabBody>
        <TabBody id="actions-tab" v-show="activeTabId === 'actions-tab'" :isActive="activeTabId === 'actions-tab'">
            
            <ActionsTabContent :word="word" :notes="props.notes"></ActionsTabContent>
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
  line-height : 35px;
  max-height: 35px;
  overflow: hidden;
  display: inline-block;
  padding-right: 20px
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
  float : right;
  margin : 5px -10px 0;
  border-top-right-radius: 25px 170px;
  border-top-left-radius: 20px 90px;
  padding : 0 30px 0 25px;
  height: 170px;
  background: #ddd;
  position : relative;
  box-shadow: 0 10px 20px rgba(0,0,0,.5);
  max-width : 200px;
}

ul.tabs > li > a{
  display: inline-block;
  max-width:100%;
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: none;
  color: #222;
  padding-left: 5px;
  padding-right: 5px;
}

ul.tabs > li:before, ul.tabs > li:after{
  content : '';
  background : transparent;
  height: 20px;
  width: 20px;
  border-radius: 100%;
  border-width: 10px;
  top: 0px;
  border-style : solid;
  position : absolute;
}

ul.tabs > li:before{
  border-color : transparent #ddd transparent transparent;
  -webkit-transform : rotate(48deg);
  left: -23px;
}

ul.tabs > li:after{
  border-color : transparent transparent transparent #ddd;
  -webkit-transform : rotate(-48deg);
  right: -17px;
}

/* Clear Fix took for HTML 5 Boilerlate*/

.clearfix:before, .clearfix:after { content: ""; display: table; }
.clearfix:after { clear: both; }
.clearfix { zoom: 1; }

.tabbody.active{
  background: #efefef;
}
</style>