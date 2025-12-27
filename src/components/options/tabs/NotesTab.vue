<script setup>
import { ref } from 'vue';
import { getNotes, setNotes } from '../../../service/noteService.js';
import { saveTextAsFile } from '../../../html-utils.js';
import { xbbcToText } from '../../../note/note-util.js'
import { ElButton } from 'element-plus'
import 'element-plus/es/components/button/style/css'

const notes = ref();
const noteCount = ref();
const file = ref();

function updateNotes(noteArray){
    
    let contentArray = [];
    for(let item of noteArray){
        const content = xbbcToText(item.content);
        let text = item.text? item.text : '';
        //console.log(text);
        let tc;
        if(item.text){
            tc = `"${text}":${content}`;
        }else {
            tc = content;
        }
        
        contentArray.push(tc);
    }
    notes.value = contentArray.join("\n");
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
        alert(t('choose_file_first'));
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

async function onExport() {
    let notes  = await getNotes();
    let json = JSON.stringify(notes);

    saveTextAsFile(json, 'notes', 'json');
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
                <textarea class="notes" v-model="notes" rows="10" maxlength="500000" readonly></textarea>
                <p>{{ t('optionsEditNotesTotal') }}<span>{{ noteCount }}</span></p>
                
            </div>
            
        </div>

        <div class="section">
            <div class="label">
                {{ t('optionsImportNotesLabelDesc') }}
            </div>
            <div class="input">
                <input type="file" ref="file">
                <el-button round @click="onImport" >{{ t('optionsImportNotesAction') }}</el-button>
            </div>
            
        </div>
        <div class="section">
            <div class="label">
                {{ t('optionsExportNotesLabelDesc') }}
            </div>

            <div class="input">
                <el-button round @click="onExport">{{ t('optionsExportNotesAction') }}</el-button>
            </div>
            
        </div>

        <div class="section">
            <div class="label">
                <p>{{ t('optionsClearNotesActionDesc') }}</p>
            </div>
            <div class="input">
                
                <p class="warning">{{ t('optionsClearNotesActionWarning') }}</p>
                <el-button round @click="clearNotes" >{{ t('optionsClearNotesAction') }}</el-button>
            </div>
            
        </div>
    </div>

</template>
<style>

.notes {
    white-space: nowrap;
    width: 100%;
}
</style>