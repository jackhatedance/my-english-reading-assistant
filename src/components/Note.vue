<script setup>
import { ref, watch, onMounted, onBeforeUpdate, onUpdated, computed, inject } from 'vue';

import { getNote, setNote, deleteNote } from '../service/noteService.js';

import 'sceditor/minified/sceditor.min.js';
import 'sceditor/minified/formats/bbcode.js';
import 'sceditor/minified/themes/default.min.css';
import * as XBBCODE from 'xbbcode-parser';
import 'xbbcode-parser/xbbcode.css';

const props = defineProps({
    note: Object,
    service: Object,
});

const sendMessageToContentPage = inject('sendMessageToContentPage');

const sidepanelNoteLabel = chrome.i18n.getMessage('sidepanelNoteLabel');
const sidepanelAddAction = chrome.i18n.getMessage('sidepanelAddAction');
const sidepanelEditAction = chrome.i18n.getMessage('sidepanelEditAction');
const sidepanelDeleteAction = chrome.i18n.getMessage('sidepanelDeleteAction');
const sidepanelSaveAction = chrome.i18n.getMessage('sidepanelSaveAction');
const sidepanelCancelAction = chrome.i18n.getMessage('sidepanelCancelAction');

const rootElement = ref();


const noteContentHtml = computed(() => bbcodeToHtml(props.note.content));


const mode = ref('init');

const textarea = ref();

//one time flag
var sceditorInitialized = false;


function clickAdd() {
    
    mode.value = 'edit';
}

function clickEdit() {
    getScEditor().val(props.note.content);

    mode.value = 'edit';
}

async function clickDelete() {
    await deleteNote(props.note.selection);

    props.note.persisted = false;
    props.note.content = '';

    getScEditor().val('');

    mode.value = 'view';

    sendMessageToActiveTab('NOTES_UPDATED');
}

async function clickSave() {
    let noteBBCode = getScEditor().val();
    let noteEnity = { selection: props.note.selection, content: noteBBCode };
    await setNote(noteEnity);

    props.note.persisted = true;
    props.note.content = noteBBCode;


    mode.value = 'view';
    sendMessageToActiveTab('NOTES_UPDATED');
}

async function clickCancel() {
    mode.value = 'view';

}

function sendMessageToActiveTab(type) {
    let sender = null;
    let sendResponse = (response)=>{};
    sendMessageToContentPage({
        type: type,
        payload: {
            source: 'side-panel',
        },
    },
    sender,
    sendResponse);
}

function getScEditor() {

    let noteEditor = sceditor.instance(textarea.value);
    return noteEditor;
}

function bbcodeToHtml(bbcodeContent) {
    /*
    if (sceditorInitialized) {
        console.log('bbcodeToHtml 1');
        return getScEditor().fromBBCode(bbcodeContent);
    } else {
        console.log('bbcodeToHtml 2');
        return bbcodeContent;
    }
    */
    var result = XBBCODE.process({
      text: bbcodeContent,
      removeMisalignedTags: false,
      addInLineBreaks: false
    });

    //console.log('bbcode html:' + JSON.stringify(result));
    if(!result.error){
        return result.html;
    } else {
        return '<error: invalid bbcode>';
    }   
}

watch(() => props.note, (newValue) => {
    mode.value = 'view';
});

onMounted(() => {
    //console.log('Note mounted');

    //initialize sceditor
    sceditor.create(textarea.value, {
        format: 'bbcode',
        toolbarExclude: 'emoticon,youtube,ltr,rtl,print',
        emoticonsEnabled: false,
        style: '',
        autofocus: true,
    });

    mode.value = 'view';

    if (!sceditorInitialized) {
        //console.log('sceditorInitialized = true');
        sceditorInitialized = true;

        //trigger re-computing
        //props.note.content = props.note.content;

        //dont know why, but need to remove style.
        rootElement.value.querySelector('.sceditor-container').style.width = null;
        rootElement.value.querySelector('.sceditor-container').style.height = null;
    }
});

onBeforeUpdate(() => {
    //console.log('Note before update, props.note:'+JSON.stringify(props.note));
    
});

onUpdated(() => {
    //console.log('Note updated');
    
});

function init() {




}


init();
</script>

<template>
    <div ref="rootElement" class="note">
        <h2 class="highlight-text">{{ props.note.selectedText }}</h2>
        <div class="view-note-container" v-show="mode === 'view'">
            <p>{{ sidepanelNoteLabel }}</p>
            <div class="note-view" v-html="noteContentHtml"></div>
            <div class="note-actions">
                <div class="note-action">
                    <button class="addNoteAction" v-show="!props.note.persisted" @click="clickAdd">{{ sidepanelAddAction }}</button>
                </div>
                <div class="note-action">
                    <button class="editNoteAction" v-show="props.note.persisted" @click="clickEdit">{{ sidepanelEditAction }}</button>
                </div>
                <div class="note-action">
                    <button class="deleteNoteAction" v-show="props.note.persisted" @click="clickDelete">{{ sidepanelDeleteAction }}</button>
                </div>
                
            </div>
        </div>
        <div class="edit-note-container" v-show="mode === 'init' || mode === 'edit'">
            <textarea ref="textarea" class="note-editor"></textarea>
            <div class="note-actions">
                <div class="note-action">
                    <button @click="clickSave">{{ sidepanelSaveAction }}</button>
                </div>
                <div class="note-action">
                    <button @click="clickCancel">{{ sidepanelCancelAction }}</button>
                </div>
                
            </div>
        </div>
    </div>
</template>

<style>
.note {
    overflow: auto;
    border: solid black 1px;
}
.note-actions {
    display: flex;
}
.note-action {
    margin: 2px;
}

.xbbcode-size-1 {font-size:x-small !important;}
.xbbcode-size-2 {font-size:small !important;}
.xbbcode-size-3 {font-size: medium !important;}
.xbbcode-size-4 {font-size:large !important;}
.xbbcode-size-5 {font-size:x-large !important;}
.xbbcode-size-6 {font-size:xx-large !important;}
.xbbcode-size-7 {font-size:-webkit-xxx-large !important;}
</style>
