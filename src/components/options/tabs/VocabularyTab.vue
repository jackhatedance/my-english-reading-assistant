
<script setup>
import { ref, toRaw } from 'vue';
import {loadKnownWords, loadAndMergeWordLists, saveKnownWords, calculateKnownWordsCount} from '../../../vocabularyStore.js';
import { saveTextAsFile } from '../../../html-utils';
import { ElButton } from 'element-plus'
import 'element-plus/es/components/button/style/css'

const t = chrome.i18n.getMessage;

const wordList = ref([]);
const knownWords = ref();
const count = ref();
const file = ref();


const init = async () => {
    let array = await loadKnownWords();
    
    if(!array){
      array= [];
    }    

    updateVocabulary(array);
};

function updateVocabulary(wordArray){
    knownWords.value = wordArray.join('\n');

    const knownCount = calculateKnownWordsCount(wordArray);   
    
    count.value = knownCount;
}

async function onInitializeVocabulary() {
  
    if(wordList.value.length==0){
        alert('please select word lists.');
    }

    let knownWordsResult = await loadAndMergeWordLists(toRaw(wordList.value));
    let knownWordsArray = knownWordsResult;
    if(!knownWordsArray){
      knownWords= [];
    }    

    updateVocabulary(knownWordsArray);

    await saveKnownWords(knownWordsArray);
}


function onImport() {
    
    const files = file.value.files;
    if(files.length == 0){
        alert(t('choose_file_first'));
        return;
    }
    
    const _file = files[0]

    var reader = new FileReader();
    reader.onload = function(e){
      let knownWordsArray = e.target.result.split(/\r*\n/);
      updateVocabulary(knownWordsArray);
      saveKnownWords(knownWordsArray);
    }
    reader.readAsText(_file);

};


function onExport() {
    let vocabulary = toRaw(knownWords.value);
    saveTextAsFile(vocabulary, 'vocabulary');
}


init();
</script>

<template>

    <div class="sections">
        <div class="section">
        <div class="label">
            <h3>{{ t('optionsInitializeVocabularyLabel') }}</h3>
            <p>{{ t('optionsInitializeVocabularyLabelDesc') }}</p>
        </div>

        <div class="input">
            <select v-model="wordList" multiple size="11">
                <option value="初中-2000">初中(2000)</option>
                <option value="高中-3500">高中(3500)</option>
                <option value="CET4-4600">大学英语4级(5000)</option>
                <option value="CET6-8000">大学英语6级(8600)</option>
                <option value="英语专业八级-13000">英语专业八级(13000)</option>
                <option value="常用-3000" >常用3000</option>
                <option value="常用-5000" >常用5000</option>
                <option value="常用-8000" >常用8000</option>
                <option value="GRE-8000">GRE(8000)不含常用词汇</option>
                <option value="TOEFL-4500">TOEFL(4500)不含常用词汇</option>
            </select>
            
            <p>{{ t('optionsInitializeVocabularyActionWarning') }}</p>
            <el-button @click="onInitializeVocabulary" round>{{ t('optionsInitializeVocabularyAction') }}</el-button>
        </div>
        <div class="action">
            
        </div>
        </div>
    
    
        <div class="section">
        <div class="label">
            <h3>{{ t('optionsEditVocabularyLabel') }}</h3>
            <p>{{ t('optionsEditVocabularyLabelDesc') }}</p>
        </div>
        <div class="input">
            <p class="vocabulary-tip">{{ t('options_edit_vocabulary_field_tip') }}</p>
            <textarea v-model="knownWords" rows="10" maxlength="500000"></textarea>
            <p>{{ t('optionsEditVocabularyTotal') }}<span>{{ count }}</span></p>
        </div>
        <div class="action">
            
        </div>
        </div>

        <div class="section">
        <div class="label">
            {{ t('optionsImportLabelDesc') }}
        </div>
        <div class="input">
            <input type="file" ref="file" >

            <el-button @click="onImport" round>{{ t('optionsImportAction') }}</el-button>
        </div>
        <div class="action">
            
        </div>
        </div>
        <div class="section">
        <div class="label">
            {{ t('optionsExportLabelDesc') }}
        </div>
    
        <div class="input">
            <el-button @click="onExport" round>{{ t('optionsExportAction') }}</el-button>
        </div>
        <div class="action">
            
        </div>
        </div>
    </div>
    
</template>
<style>
.vocabulary-tip {
    color: red;
}
</style>