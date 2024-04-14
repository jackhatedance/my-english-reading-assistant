<script setup>
import { ref, watch, onMounted, onBeforeUpdate, onUpdated, computed } from 'vue';
import {searchWord, isKnown } from '../../language.js';
import { loadKnownWords, markWordAsKnown, markWordAsUnknown, removeWordMark } from '../../vocabularyStore.js';

const props = defineProps({
    word: Object,
    showDefinition: Boolean,
    reset: Boolean,
});


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

const isKnownRef = ref(false);

async function clickMarkAsKnown() {
    let baseForm = props.word.target;
    //console.log(`mark word as known ${baseForm}`);
    let wordChanges = await markWordAsKnown(baseForm);
    sendMessageKnownWordsUpdated('known', wordChanges);

    isKnownRef.value = true;

}
async function clickMarkAsUnknown() {
    let baseForm = props.word.target;
    let wordChanges = await markWordAsUnknown(baseForm);
    sendMessageKnownWordsUpdated('unknown', wordChanges);
    isKnownRef.value = false;
}
async function clickClearMark() {
    let baseForm = props.word.target;
    let wordChanges = await removeWordMark(baseForm);
    sendMessageKnownWordsUpdated('clear', wordChanges);

    let knownWords = await loadKnownWords();

    if (isKnown(baseForm, knownWords)) {
        isKnownRef.value = true;
    } else {
        isKnownRef.value = false;
    }

}

function sendMessageKnownWordsUpdated(type, wordChanges) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        chrome.tabs.sendMessage(
            tab.id,
            {
                type: 'KNOWN_WORDS_UPDATED',
                payload: {
                    source: 'side-panel',
                },
            },
            (response) => {

                //renderUnknownWordList(response.words);
            }
        );

        //send to background
        chrome.runtime.sendMessage(
            {
                type: 'MARK_WORD',
                payload: {
                    contentTabId: tab.id,
                    wordChanges: wordChanges,
                },
            },
            (response) => {
                //console.log(response.message);
            }
        );
    });


}
</script>

<template>
    <li>
        <div class='list-item'>
            <div class="word-and-actions">

                <span :class="{ word: true, known: isKnownRef }">{{ wordStr }}</span>

                <div class="actions">
                    <button class='mea-show-definition' :word="props.word.target" :title='showDefinitionTips'
                        @click="clickShowDefinition">
                        <img src='icons/lookup.png' width="12"></img>
                    </button>

                    <button class='mea-mark-known' :word="props.word.target" :title="markAsKnownTips"
                        @click="clickMarkAsKnown">
                        <img src='icons/tick.png' width="12"></img>
                    </button>
                    <button class='mea-mark-unknown' :word="props.word.target" :title="markAsUnknownTips"
                        @click="clickMarkAsUnknown">
                        <img src='icons/question-mark.png' width="12"></img>
                    </button>
                    <button class='mea-mark-clear' :word="props.word.target" :title="clearMarkTips" @click="clickClearMark">
                        <img src='icons/clear.png' width="12"></img>
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
  }
}
.word {
    font-weight: bold;
}
.word-and-actions .word.known {
    text-decoration: line-through;
}
.definition {
    margin:0px;
}
</style>