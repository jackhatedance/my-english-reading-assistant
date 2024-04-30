<script setup>
import Note from './Note.vue';

const props = defineProps({
    items: Array,

});


const sidepanelActionsTabNotesLabelNotes = chrome.i18n.getMessage('sidepanelActionsTabNotesLabelNotes');

const init = async () => {

};

init();
</script>

<template>
    <div>
        <h4>{{ sidepanelActionsTabNotesLabelNotes }}</h4>
        <div class="notes">
            <Note v-for="item of props.items" :note="item"></Note>
        </div>
    </div>
</template>
