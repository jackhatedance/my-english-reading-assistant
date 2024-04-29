<script setup>
import { ref, onMounted, onBeforeUpdate, provide } from 'vue';
import Unavailable from './Unavailable.vue';
import Tabs from './Tabs.vue';

import { loadKnownWords, markWordAsKnown, markWordAsUnknown, removeWordMark } from '../vocabularyStore.js';
import { getNote } from '../service/noteService.js';


import { isPageAnnotationVisible } from '../page.js';

const props = defineProps({
  // embedded (content page), standalone (side page)
  appMode: String,
  setSendMessageToApp: Function,
  sendMessageToContentPage: Function,
  getActiveTabId: Function,
});

provide('appMode', props.appMode);
provide('sendMessageToContentPage', props.sendMessageToContentPage);
provide('getActiveTabId', props.getActiveTabId);

const isShowUnavailable = ref(false);
const isShowTabs = ref(false);

const word = ref();
const notes = ref([]);
const page = ref();

const activeTabId = ref('menu-tab');

const changeToggle = ref(false);

const menuItems = ref([]);

async function getPageInfo() {
  let sender = null;
  //console.log('get pageInfo');
  props.sendMessageToContentPage({
    type: 'GET_PAGE_INFO_AS_MESSAGE',
    payload: {
      src: 'side_panel',
    },
  },
    sender,
    (response) => {

      //console.log('get pageInfo response:' + JSON.stringify(response));
      if (response && response.pageInfo) {
        //updatePageInfo(response.pageInfo);  
      }


    });

}

function updatePageInfo(pageInfo) {
  let response = {
    pageInfo
  };

  if (response && response.pageInfo) {
    let pageInfo = response.pageInfo;
    if (pageInfo.visible) {
      page.value = response.pageInfo;

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

async function messageListener(request, sender, sendResponse) {

  //console.log('recieve message:'+request.type);

  if (request.type === 'LOAD') {
    getPageInfo();
  } else if (request.type === 'UPDATE_PAGE_INFO') {
    updatePageInfo(request.payload.pageInfo);
  } else if (request.type === 'RESET_PAGE_ANNOTATION_VISIBILITY_FINISHED') {

    if (request.payload.source === 'side-panel') {
      return;
    }

    getPageInfo();

    // Log message coming from the `request` parameter
    //console.log(request.payload.message);
    // Send a response message
    sendResponse({

    });
  } else if (request.type === 'SELECTION_CHANGE') {
    let { type, selectedText, sentenceSelection } = request.payload;

    word.value = request.payload.word;

    let noteArray = request.payload.notes;

    //console.log('payload:' + JSON.stringify(request.payload));
    if (type === 'select-text') {
      let note = {
        selectedText: selectedText,
        selection: sentenceSelection,
        content: '',
        persisted: false,
      };

      let noteEntity = await getNote(sentenceSelection);
      if (noteEntity) {
        note.content = noteEntity.content;
        note.persisted = true;
      }
      noteArray = [note];
    } else {
      for (let note of noteArray) {
        note.persisted = true;
      }
    }

    notes.value = noteArray;
    //console.log('SELECTION_CHANGE, update notes:' + JSON.stringify(notes.value));


  } else if (request.type === 'ACTIVE_TAB') {
    activeTabId.value = request.payload.activeTabId;
    menuItems.value = request.payload.menuItems;

    changeToggle.value = !(changeToggle.value);
  }

}

chrome.runtime.onMessage.addListener(messageListener);



async function onMarkWord(type) {
  //console.log(`mark word:${type}`);

  let targetWord = word.value;
  if (targetWord) {
    let wordChanges;
    if (type === 'known') {
      wordChanges = await markWordAsKnown(targetWord);
    } else if (type === 'unknown') {
      wordChanges = await markWordAsUnknown(targetWord);
    } else if (type === 'clear') {
      wordChanges = await removeWordMark(targetWord);
    }

    let visible = isPageAnnotationVisible();
    //resetPageAnnotationVisibilityAndNotify(visible);
    props.sendMessageToContentPage({
      type: 'KNOWN_WORDS_UPDATED',
      payload: {
      },
    },
      null, (response) => { });

    //showToolbar(false);
    props.sendMessageToContentPage({
      type: 'CLOSE_DIALOG',
      payload: {
      },
    },
      null, (response) => { });
  }
}

function onVocabulary() {
  activeTabId.value = 'vocabulary-tab';
  changeToggle.value = !(changeToggle.value);
}

function onNote(type) {
  activeTabId.value = 'notes-tab';
  changeToggle.value = !(changeToggle.value);
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
    },
  },
    null, (response) => { });
}

</script>

<template>
  <Unavailable v-show="isShowUnavailable"></Unavailable>
  <div class="header">
    <button @click="onClickCloseButton">X</button>
  </div>
  <Tabs v-show="isShowTabs" :word="word" :notes="notes" :page="page" :menuItems="menuItems" :activeTabId="activeTabId"
    :changeToggle="changeToggle" @markWord="onMarkWord" @vocabulary="onVocabulary" @note="onNote"></Tabs>
</template>

<style>
.header {
  float: right;
}
</style>