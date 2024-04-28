<script setup>
import { ref, watch, onMounted, onBeforeUpdate, onUpdated, computed } from 'vue';

import UnknownWordItem from './UnknownWordItem.vue';
import { loadKnownWords, markWordAsKnown, markWordAsUnknown, removeWordMark } from '../../vocabularyStore.js';
import { getWordParts, isKnown } from '../../language.js';

const props = defineProps({
    items: Array,
    showDefinition: Boolean,
    reset: Boolean,
});


async function buildTargetWords(words) {
    let knownWords = await loadKnownWords();

    let expandedWords = [];
    for (let wordObj of words) {
        let { base } = wordObj;
        let target = base;

        //itself
        expandedWords.push({ target: base });

        //parts
        let parts = getWordParts(base);
        let from = base;

        if (parts) {
            for (let part of parts) {
                target = part.dictEntry;


                if (!isKnown(target, knownWords)) {
                    expandedWords.push({ target, from });
                }
            }
        }
    }


    //word array to merge
    let targetObjMap = new Map();

    for (let wordObj of expandedWords) {
        let { target, from } = wordObj;

        let targetObj = targetObjMap.get(target);
        if (!targetObj) {
            targetObj = { target, from: [] };
            targetObjMap.set(target, targetObj);
        }

        if (from) {
            targetObj.from.push(from);
        }


    }
    let array = Array.from(targetObjMap, ([name, value]) => ({ target: name, from: value.from }));
    return array;
}

async function updateItems(newItems) {
    let targetWords = await buildTargetWords(newItems);
    items.value = targetWords;
}


const items = ref();
watch(() => props.items, (newValue, oldValue) => {
    // React to prop changes
    //console.log('items changed:', newValue);
    updateItems(newValue);
});

//console.log('props.items:'+JSON.stringify(props.items));


onMounted(() => {
    
    updateItems(props.items);
});

onUpdated(() => {
    //console.log('updated');

});

</script>

<template>
    <div class="mea-unknown-word-list">
        <ol id="unknownWordList">
            <UnknownWordItem v-for="item of items" :word="item" :key="item.target" :showDefinition="props.showDefinition" :reset="props.reset">
            </UnknownWordItem>
        </ol>
    </div>
</template>

<style>
.mea-unknown-word-list {
    height: 380px;
    overflow: auto;
    overscroll-behavior-y: contain;

    text-align: left;

    li:nth-child(odd) {
        background-color: #bed8d6;
    }
}
</style>