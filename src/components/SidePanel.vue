<script setup>
import { ref, onMounted, onBeforeUpdate, provide } from 'vue';
import Unavailable from './Unavailable.vue';
import Tabs from './Tabs.vue';


import { getNote } from '../noteService.js';

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

const notes = ref([]);
const page = ref();



async function getPageInfo() {
  let sender = null;
  console.log('get pageInfo');
  props.sendMessageToContentPage({
        type: 'GET_PAGE_INFO',
        payload: {
        },
      },
      sender,
      (response) => {

        //console.log('get pageInfo response:' + JSON.stringify(response));

        updatePageInfo(response.pageInfo);

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

  console.log(request.type);

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
      message: 'ok'
    });
  } else if (request.type === 'SELECTION_CHANGE') {
    let type = request.payload.type;
    let selectedText = request.payload.selectedText;
    let sentenceSelection = request.payload.sentenceSelection;
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


  }

}

chrome.runtime.onMessage.addListener(messageListener);

onMounted(()=>{
  props.setSendMessageToApp(messageListener);
});

onBeforeUpdate(() => {
  //console.log('before update, props.page:'+JSON.stringify(page.value));
  //console.log('before update');

});


</script>

<template>
  <Unavailable v-show="isShowUnavailable"></Unavailable>
  <Tabs v-show="isShowTabs" :notes="notes" :page="page"></Tabs>
</template>

<style></style>