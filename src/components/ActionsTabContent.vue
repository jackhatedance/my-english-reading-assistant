<script setup>
import { ref, watch, onMounted, onBeforeUpdate, onUpdated, computed, inject } from 'vue';
import Word from './Word.vue';
import Notes from './Notes.vue';


const props = defineProps({
    page: Object,
    word: String,
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
    <Word v-if="props.word" :siteOptions="page.siteOptions" :word="props.word"></Word>


    <Notes v-if="!isNotesEmpty" :items="props.notes">

    </Notes>
</template>
