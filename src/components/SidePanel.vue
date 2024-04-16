<script setup>
import { ref, onBeforeUpdate } from 'vue';
import Unavailable from './Unavailable.vue';
import Tabs from './Tabs.vue';

import { initializeOptionService } from '../optionService.js';
import { getNote } from '../noteService.js';



const isShowUnavailable = ref(false);
const isShowTabs = ref(false);

const notes = ref([]);
const page = ref();


document.addEventListener('DOMContentLoaded', async () => {
  await initializeOptionService();
  getPageInfo();


});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.active) {
    getPageInfo();
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tab.active) {
    getPageInfo();
  }
});

async function getPageInfo() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    chrome.tabs.sendMessage(
      tab.id,
      {
        type: 'GET_PAGE_INFO',
        payload: {
        },
      },
      (response) => {

        //console.log('get pageInfo response:' + JSON.stringify(response));

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
    );
  });
}


chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {

  console.log(request.type);

  if (request.type === 'RESET_PAGE_ANNOTATION_VISIBILITY_FINISHED') {

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