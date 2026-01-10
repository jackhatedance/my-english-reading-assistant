<script setup>
import { ref, watch, onMounted, onBeforeUpdate, onUpdated, computed, inject, toRaw } from 'vue';
import Word from './Word.vue';
import Notes from './Notes.vue';
import { isFeatureEnabled, FEATURE_NOTE } from '../../feature-toggle.js'

const props = defineProps({
    page: Object,
    word: String,
    dictionary: String,
    notes: Array,
    selectedNotes: Array

});


const isSelectedNotesEmpty = computed(() => {
    return (props.selectedNotes.length===0);
});

const init = async () => {

};

init();
</script>

<template>
    <div class="actiontab-items">
        <Word v-if="props.word" :siteOptions="toRaw(page.siteOptions)" :dictionary="props.dictionary" :word="props.word"></Word>
        <Notes v-if="isFeatureEnabled(page.siteOptions, FEATURE_NOTE) && !isSelectedNotesEmpty" :items="props.selectedNotes" />
    </div>
</template>

<style>
.actiontab-items>div {
    
    margin: 5px;

    .title {
        font-size: large;
        margin: 0;
        padding: 0;
    }
}
.actiontab-items>div:not(:first-child) {
    border-top: solid rgb(210, 210, 210) 1px;
}
</style>