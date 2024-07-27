<script setup>
import { ref, onMounted, onBeforeUpdate, onUpdated, computed, inject, watch } from 'vue';
import { lookup } from '../dictionary.js';
import { loadKnownWords, markWordAsKnown, markWordAsUnknown, removeWordMark } from '../vocabularyStore.js';
import { sendMessageMarkWordToBackground } from '../message.js'; 
import { isKnown } from '../language.js'

const props = defineProps({
    word: String,
});

const sendMessageToContentPage = inject('sendMessageToContentPage');

const markToggleTips = chrome.i18n.getMessage('sidepanelWordActionMarkToggle');
const clearMarkTips = chrome.i18n.getMessage('sidepanelWordActionClearMark');

let tickImgUrl = chrome.runtime.getURL("icons/tick.png");
let clearImgUrl = chrome.runtime.getURL("icons/clear.png");

const definition = computed(() => {
    let dicts = ['large', 'small', 'affix'];
    let def = lookup(props.word, dicts);
    if(!def){
        def = '';
    }
    def = def.replaceAll(';', '\n');
    return def;
});

const knownRef = new ref(false);
watch(() => props.word, (newValue) => {
    updateKnown();
});

async function updateKnown() {
    let knownWords = await loadKnownWords();
    let known = isKnown(props.word, knownWords);
    knownRef.value = known;
}

onMounted(() => {
    updateKnown();

});

onBeforeUpdate(() => {
    //console.log('Note before update, props.note:'+JSON.stringify(props.note));

});

onUpdated(() => {
    //console.log('Note updated');

});

async function onMarkToggle() {
    let knownWords = await loadKnownWords();
    let known = isKnown(props.word, knownWords);
    if(known){
        await onMarkAsUnknown();
    } else {
        await onMarkAsKnown();
    }
    updateKnown();
    //console.log('mark toggle');
}

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
    updateKnown();
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
            <p class="word-definition-content">{{ definition }}</p>
        </div>
        <div class="word-mark-actions">
            <div :class="{ 'word-mark-action': true, unknown: !knownRef }"><button @click="onMarkToggle" :title='markToggleTips'>
                <img :src='tickImgUrl' />
            </button></div>
            <div class="word-mark-action"><button @click="onClearMark" :title='clearMarkTips'>
                <img :src='clearImgUrl' />
            </button></div>
        </div>
    </div>
</template>

<style>
.word-definition {
    border: solid black 1px;

    .word-definition-content {
        white-space: pre-line;
    }
}

.word-mark-actions {
    display: flex;
    img {
        width: 20px;
    }

}

.word-mark-actions .unknown {
    img {
        filter: grayscale(100%);
    }
}

.word-mark-action {
    margin: 4px;
}
</style>
