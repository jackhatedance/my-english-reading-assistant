<script setup>
import Note from './Note.vue';

const props = defineProps({
    items: Array,
    readonly: Boolean,
});


const sidepanelActionsTabNotesLabelNotes = chrome.i18n.getMessage('sidepanelActionsTabNotesLabelNotes');

const init = async () => {

};

init();
</script>

<template>
    <div class="notes-container">
        <h3 class="title">{{ sidepanelActionsTabNotesLabelNotes }}</h3>
        <div class="notes">
            <Note v-for="item of props.items" :note="item" :key="item.text" :readonly="props.readonly"></Note>
        </div>
    </div>
</template>

<style>

</style>