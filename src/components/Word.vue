<script setup>
import { ref, onMounted, onBeforeUpdate, onUpdated, computed, inject } from 'vue';
import { MenuItems } from '../menu.js';
import { lookupShort } from '../dictionary.js';
import { markWordAsKnown, markWordAsUnknown, removeWordMark } from '../vocabularyStore.js';
import { sendMessageMarkWordToBackground, sendMessageToBackground } from '../message.js'; import { isKnown } from '../language.js'

const props = defineProps({
    word: String,
});

const sendMessageToContentPage = inject('sendMessageToContentPage');

const sidepanelActionsTabWordLabelWord = chrome.i18n.getMessage('sidepanelActionsTabWordLabelWord');

const sidepanelActionsTabWordMarkAsUnknownAction = chrome.i18n.getMessage('sidepanelActionsTabWordMarkAsUnknownAction');
const sidepanelActionsTabWordMarkAsKnownAction = chrome.i18n.getMessage('sidepanelActionsTabWordMarkAsKnownAction');
const sidepanelActionsTabWordClearMarkAction = chrome.i18n.getMessage('sidepanelActionsTabWordClearMarkAction');



const definition = computed(() => {
    let def = lookupShort(props.word);
    return def;
});


onMounted(() => {
    console.log('Note mounted');

});

onBeforeUpdate(() => {
    //console.log('Note before update, props.note:'+JSON.stringify(props.note));

});

onUpdated(() => {
    //console.log('Note updated');

});

async function onMarkAsUnknown() {
    let targetWord = props.word;
    let wordChanges = await markWordAsUnknown(targetWord);

    sendMessageToContentPage({
        type: 'KNOWN_WORDS_UPDATED',
        payload: {
        },
    },
        null, (response) => { });

    sendMessageMarkWordToBackground(wordChanges);
}

async function onMarkAsKnown() {
    let targetWord = props.word;
    let wordChanges = await markWordAsKnown(targetWord);

    sendMessageToContentPage({
        type: 'KNOWN_WORDS_UPDATED',
        payload: {
        },
    },
        null, (response) => { });
    sendMessageMarkWordToBackground(wordChanges);
}

async function onClearMark() {
    let targetWord = props.word;
    let wordChanges = await removeWordMark(targetWord);

    sendMessageToContentPage({
        type: 'KNOWN_WORDS_UPDATED',
        payload: {
        },
    },
        null, (response) => { });
    sendMessageMarkWordToBackground(wordChanges);
}

</script>

<template>
    <div class="word-container">
        <h2>{{ sidepanelActionsTabWordLabelWord }}</h2>
        <div class="definition">
            <h1>{{ props.word }}</h1>
            <p>{{ definition }}</p>
        </div>
        <div class="word-mark-actions">
            <div class="word-mark-action"><button @click="onMarkAsUnknown">{{ sidepanelActionsTabWordMarkAsUnknownAction }}</button></div>
            <div class="word-mark-action"><button @click="onMarkAsKnown">{{ sidepanelActionsTabWordMarkAsKnownAction }}</button></div>
            <div class="word-mark-action"><button @click="onClearMark">{{ sidepanelActionsTabWordClearMarkAction }}</button></div>
        </div>
    </div>
</template>

<style>
.word-container {
    border: solid black 1px;
}

.word-mark-actions {
    display: flex;
}

.word-mark-action {
    margin: 2px;
}
</style>
