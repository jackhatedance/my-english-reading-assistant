<script setup>
import { ref } from 'vue';
import { getNotes, setNotes } from '../../../service/noteService.js';
import { saveTextAsFile } from '../../../html-utils.js';

const notes = ref();
const noteCount = ref();
const file = ref();

function updateNotes(noteArray){
    notes.value = JSON.stringify(noteArray);
    noteCount.value = noteArray.length;
}

function clearNotes() {
    const notes = [];
    updateNotes(notes);
    setNotes(notes);
}

function onImport() {
    
    const files = file.value.files;
    if(files.length == 0){
        alert('pick file first.');
        return;
    }
    
    const _file = files[0];

    var reader = new FileReader();
    reader.onload = function(e){
        let notes = JSON.parse(e.target.result);
        updateNotes(notes);
        setNotes(notes);
    }
    reader.readAsText(_file);

}

function onExport() {
    
    saveTextAsFile(notes.value, 'notes');
}

const init = async () => {
    let notes  = await getNotes();
    updateNotes(notes);

};

const t = chrome.i18n.getMessage;


init();
</script>

<template>


    <div class="sections">
        <div class="section">
            <div class="label">
                <p>{{ t('optionsEditNotesLabelDesc') }}</p>
            </div>
            <div class="input">
                <textarea v-model="notes" rows="10" maxlength="500000"></textarea>
                <p>{{ t('optionsEditNotesTotal') }}<span>{{ noteCount }}</span></p>
            </div>
            <div class="action">
                <button @click="clearNotes" >{{ t('optionsClearNotesAction') }}</button>
            </div>
        </div>

        <div class="section">
            <div class="label">
                {{ t('optionsImportNotesLabelDesc') }}
            </div>
            <div class="input">
                <input type="file" ref="file">
            </div>
            <div class="action">
                <button @click="onImport" >{{ t('optionsImportNotesAction') }}</button>
            </div>
        </div>
        <div class="section">
            <div class="label">
                {{ t('optionsExportNotesLabelDesc') }}
            </div>

            <div class="input">
            </div>
            <div class="action">
                <button @click="onExport">{{ t('optionsExportNotesAction') }}</button>
            </div>
        </div>
    </div>

</template>
