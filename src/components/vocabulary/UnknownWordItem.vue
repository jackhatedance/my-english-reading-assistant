<script setup>
import { ref, watch, onMounted, onBeforeUpdate, onUpdated, computed, inject } from 'vue';
import {searchWord, isKnown } from '../../language.js';
import { loadKnownWords, markWordAsKnown, markWordAsUnknown, removeWordMark } from '../../vocabularyStore.js';
import { sendMessageMarkWordToBackground } from '../../message.js';

const props = defineProps({
    word: Object,
    showDefinition: Boolean,
    reset: Boolean,
    isKnown: Boolean,
});

const emit = defineEmits(['markWord']);

const sendMessageToContentPage = inject('sendMessageToContentPage');


const wordStr = computed(() => {
    let { target, from } = props.word;
    let word = target;
    let fromArray = from;
    let fromStr = '';
    if (fromArray) {
        fromStr = fromArray.join(',');
    }
    
    let wordStr = fromStr ? `${word} (${fromStr})` : word;

    return wordStr;
});

const definition = computed(() => {
    let { target, from } = props.word;
    let word = target;

    //query root word
    let searchResult = searchWord({
      query: word,
      allowLemma: true,
      allowRemoveSuffixOrPrefix: false,      
    });
    
    let definition = '';
    if(searchResult){
        definition = searchResult.definition;
    }
    
    if (!definition) {
        definition = '';
    }

    return definition;
});

const showDefinition = ref(props.showDefinition);
watch(() => props.showDefinition, (newValue) => {
    showDefinition.value = props.showDefinition;
});
watch(() => props.reset, () => {
    showDefinition.value = props.showDefinition;
});

const showDefinitionTips = chrome.i18n.getMessage('sidepanelWordActionShowDefinition');
const markAsKnownTips = chrome.i18n.getMessage('sidepanelWordActionMarkAsKnown');
const markAsUnknownTips = chrome.i18n.getMessage('sidepanelWordActionMarkAsUnknown');
const clearMarkTips = chrome.i18n.getMessage('sidepanelWordActionClearMark');

function clickShowDefinition() {
    showDefinition.value = true;
}

async function clickMarkToggle() {
    let { target } = props.word;
    let knownWords = await loadKnownWords();
    let known = isKnown(target, knownWords);
    if(known){
        await clickMarkAsUnknown();
    } else {
        await clickMarkAsKnown();
    }
    
    //console.log('mark toggle');
}

async function clickMarkAsKnown() {
    let baseForm = props.word.target;
    //console.log(`mark word as known ${baseForm}`);
    let wordChanges = await markWordAsKnown(baseForm);
    sendMessageKnownWordsUpdated('known', wordChanges);

    
}
async function clickMarkAsUnknown() {
    let baseForm = props.word.target;
    let wordChanges = await markWordAsUnknown(baseForm);
    sendMessageKnownWordsUpdated('unknown', wordChanges);
}
async function clickClearMark() {
    let baseForm = props.word.target;
    let wordChanges = await removeWordMark(baseForm);
    sendMessageKnownWordsUpdated('clear', wordChanges);

     

}

function sendMessageKnownWordsUpdated(type, wordChanges) {
    let sender = null;
    let sendResponse = (response) => {};
    sendMessageToContentPage({
        type: 'KNOWN_WORDS_UPDATED',
        payload: {
            source: 'unknown-word-list',
        },
    },
    sender, 
    sendResponse);

    sendMessageMarkWordToBackground(wordChanges);
    
    emit('markWord');
}


let lookupImgUrl = chrome.runtime.getURL("icons/lookup.png");
let tickImgUrl = chrome.runtime.getURL("icons/tick.png");
let questionMarkImgUrl = chrome.runtime.getURL("icons/question-mark.png");
let clearImgUrl = chrome.runtime.getURL("icons/clear.png");

</script>

<template>
    <li>
        <div class='list-item'>
            <div class="word-and-actions">

                <span :class="{ word: true, known: props.isKnown }">{{ wordStr }}</span>

                <div class="actions">
                    <button class='mea-show-definition' :word="props.word.target" :title='showDefinitionTips'
                        @click="clickShowDefinition">
                        <img :src='lookupImgUrl' width="12"/>
                    </button>

                    <button :class="{ unknown: !props.isKnown }" :word="props.word.target" :title="markAsKnownTips"
                        @click="clickMarkToggle">
                        <img :src='tickImgUrl' width="12"/>
                    </button>                    
                    <button class='mea-mark-clear' :word="props.word.target" :title="clearMarkTips" @click="clickClearMark">
                        <img :src='clearImgUrl' width="12"/>
                    </button>
                </div>
            </div>

            <div class="definition-container">
                <p class="definition" v-show="showDefinition">{{ definition }}</p>
            </div>


        </div>
    </li>
</template>

<style>

.list-item {
  padding: 5px;
  height: auto;
  
}

.word-and-actions{
  clear:both;
  line-height: 1.8em;
}

.actions {
  float:right;
    
  button {
    font-size: 5px;
    margin-right: 2px;
  }
}
.word {
    font-weight: bold;
}
.word-and-actions .word.known {
    text-decoration: line-through;
}
.word-and-actions .unknown {
    img {
        filter: grayscale(100%);
    }
}
.definition {
    margin:0px;
}
</style>