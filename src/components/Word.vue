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

let tickImgUrl = chrome.runtime.getURL("icons/tick.png");
let questionMarkImgUrl = chrome.runtime.getURL("icons/question-mark.png");
let clearImgUrl = chrome.runtime.getURL("icons/clear.png");

const definition = computed(() => {
    let def = lookupShort(props.word);
    return def;
});


onMounted(() => {
    

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

    //console.log('send known words updated to content page');
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
        <div class="word-definition">
            <h2>{{ props.word }}</h2>
            <p>{{ definition }}</p>
        </div>
        <div class="word-mark-actions">
            <div class="word-mark-action"><button @click="onMarkAsKnown">
                <img :src='tickImgUrl' />
            </button></div>
            <div class="word-mark-action"><button @click="onMarkAsUnknown">
                <img :src='questionMarkImgUrl' />
            </button></div>
            <div class="word-mark-action"><button @click="onClearMark">
                <img :src='clearImgUrl' />
            </button></div>
        </div>
    </div>
</template>

<style>
.word-definition {
    border: solid black 1px;
}

.word-mark-actions {
    display: flex;
    img {
        width: 20px;
    }
}

.word-mark-action {
    margin: 4px;
}
</style>
