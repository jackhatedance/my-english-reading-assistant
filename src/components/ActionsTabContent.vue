<script setup>
import { ref, watch, onMounted, onBeforeUpdate, onUpdated, computed, inject, toRaw } from 'vue';
import Word from './Word.vue';
import Notes from './Notes.vue';


const props = defineProps({
    page: Object,
    word: String,
    dictionary: String,
    notes: Array

});


const isNotesEmpty = computed(() => {
    return (props.notes.length===0);
});

const init = async () => {

};

init();
</script>

<template>
    <Word v-if="props.word" :siteOptions="toRaw(page.siteOptions)" :dictionary="props.dictionary" :word="props.word"></Word>


    <Notes v-if="!isNotesEmpty" :items="props.notes">

    </Notes>
</template>
