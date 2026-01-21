<script setup>
import { ref, onMounted, onBeforeUpdate, provide, toRaw, computed } from 'vue';
import Unavailable from '../Unavailable.vue';
import VocabularyTabContent from './VocabularyTabContent.vue';
import ActionsTabContent from './ActionsTabContent.vue';
import BookTabContent from './BookTabContent.vue';
import NotesTabContent from './NotesTabContent.vue'

import { loadKnownWords, markWordAsKnown, markWordAsUnknown, removeWordMark } from '../../vocabularyStore.js';
import { getNote } from '../../service/noteService.js';
import { initializeCustomDictionaryService } from '../../dictionary/customDictionary.js';
import { getEntryFromLink } from '../../dictionary/mdict/mdict-definition-utils.js'
import { isPageAnnotationVisible } from '../../page.js';


import { ElTabs, ElTabPane } from 'element-plus'
import 'element-plus/es/components/tabs/style/css'
import 'element-plus/es/components/tab-pane/style/css'

const t = chrome.i18n.getMessage;

const props = defineProps({
  // embedded (content page), standalone (side page)
  appMode: String,
  setSendMessageToApp: Function,
  sendMessageToContentPage: Function,
});

provide('appMode', props.appMode);
provide('sendMessageToContentPage', props.sendMessageToContentPage);

const isShowUnavailable = ref(false);
const isShowTabs = ref(false);

const word = ref();
const dictionary = ref();
const notes = ref([]);
const selectedNotes = ref([]);
const page = ref();

const activeTabName = ref('tab-actions');
const menuItems = ref([]);

//record actions that user has been done on the dialog, it will decide how to refresh the page.
const actions = ref([]);
const actionRecorder = (action) => {
  actions.value.push(action);
};

provide('action-recorder', actionRecorder);

async function getPageInfo() {
  let sender = null;
  //console.log('get pageInfo');
  props.sendMessageToContentPage({
    type: 'GET_PAGE_INFO',
    payload: {
      src: 'side_panel',
    },
  },
    sender,
    (response) => {

      //console.log('get pageInfo response:' + JSON.stringify(response));
      if (response && response.pageInfo) {
        updatePageInfo(response.pageInfo);  
      }


    });

}

async function updatePageInfo(pageInfo) {
  //console.log('update page info, title:' + pageInfo?.title);
  let response = {
    pageInfo
  };

  if (response && response.pageInfo) {
    
    let pageInfo = response.pageInfo;
    if (pageInfo.visible) {
      page.value = response.pageInfo;

      let siteOptions = response.pageInfo.siteOptions;
      //console.log(`update info: ${JSON.stringify(siteOptions)}`);
      let additionalDictionaryNames = siteOptions.other.additionalDictionaries;
      await initializeCustomDictionaryService(additionalDictionaryNames, ['raw', 'index'], { rawType: 'extracted'});

      isShowUnavailable.value = false;
      isShowTabs.value = true;
    } else {
      isShowUnavailable.value = true;
      isShowTabs.value = false;
    }

  } else {

    isShowUnavailable.value = true;
    isShowTabs.value = false;
  }

}

function messageListener(request, sender, sendResponse) {

  //console.log('receive message:'+request.type);
  let response = {};
  if (request.type === 'LOAD') {
    getPageInfo();
  } else if (request.type === 'UPDATE_PAGE_INFO') {
    updatePageInfo(request.payload.pageInfo);
  } else if (request.type === 'RESET_PAGE_ANNOTATION_VISIBILITY_FINISHED') {

    if (request.payload.source === 'unknown-word-list') {
      return;
    }

    getPageInfo();

    // Log message coming from the `request` parameter
    //console.log(request.payload.message);
    // Send a response message
    
  } else if (request.type === 'SELECTION_CHANGE') {
    onSelectionChange(request.payload);

  } else if (request.type === 'ACTIVE_APP_TAB') {
    activeTabName.value = request.payload.activeAppTabName;
    menuItems.value = request.payload.menuItems;

  } else if (request.type === 'DICTIONARY_LINK') {
    const href = request.data;
    let entry = getEntryFromLink(href);
    if(entry){
      word.value = entry;
    }
  } else if (request.type === 'CLOSE_DIALOG_FROM_BACKGROUND') {
    onClickCloseButton();

  } 
  
  sendResponse(response);
}

//chrome.runtime.onMessage.addListener(messageListener);

async function onSelectionChange(payload){
  let { type, selectedText, paragraphSelection } = payload;

  word.value = payload.word;
  dictionary.value = payload.dictionary;

  let selectedNoteArray = payload.selectedNotes;

  //console.log('payload:' + JSON.stringify(request.payload));
  if (type === 'select-text') {
    let note = {
      text: selectedText,
      selection: paragraphSelection,
      content: '',
      persisted: false,
    };

    let noteEntity = await getNote(paragraphSelection);
    if (noteEntity) {
      note.content = noteEntity.content;
      note.persisted = true;
    }
    selectedNoteArray = [note];
  } else {
    for (let note of selectedNoteArray) {
      note.persisted = true;
    }
  }

  selectedNotes.value = selectedNoteArray;


  let articleNotes = payload.notes;
  for (let note of articleNotes) {
    note.persisted = true;
  }
  notes.value = articleNotes;
  //console.log('SELECTION_CHANGE, update notes:' + JSON.stringify(notes.value));

}

onMounted(() => {
  props.setSendMessageToApp(messageListener);
});

onBeforeUpdate(() => {
  //console.log('before update, props.page:'+JSON.stringify(page.value));
  //console.log('before update');

});

function onClickCloseButton() {
  props.sendMessageToContentPage({
    type: 'CLOSE_DIALOG',
    payload: {
      actions: toRaw(actions.value),
    },
  },
    null, (response) => { });
}

</script>

<template>
  <Unavailable v-show="isShowUnavailable"></Unavailable>
  <div class="dialog-header">
    <button @click="onClickCloseButton">X</button>
  </div>
  
  <div v-if="isShowTabs" class="tab-container">

    <el-tabs v-model="activeTabName" class="setting-tabs" >
      <el-tab-pane :label="t('sidepanelTabActions')" name="actions">
        <ActionsTabContent :page="page" :word="word" :dictionary="dictionary" :selectedNotes="selectedNotes"></ActionsTabContent>
      </el-tab-pane>
      
      <el-tab-pane :label="t('sidepanelTabVocabulary')" name="vocabulary">
        <VocabularyTabContent :page="page"></VocabularyTabContent>
      </el-tab-pane>
      
      <el-tab-pane :label="t('sidepanelTabBook')" name="book">
        <BookTabContent :page="page"></BookTabContent>
      </el-tab-pane>
      
      <el-tab-pane :label="t('sidepanelTabNotes')" name="notes">
        <NotesTabContent :notes="notes"></NotesTabContent>
      </el-tab-pane>
    </el-tabs>
      
  </div>
</template>

<style>
.dialog-header {
  float: right;
  border-radius: 10px;
  padding-top: 10px;
  padding-right: 10px;
}

.tab-container{
  margin: 0;
  padding: 10px;
  .el-tabs {
    width: 100%;
  }

  .el-tabs__content {
    height: 420px;
    overflow: auto;
  }
}
</style>