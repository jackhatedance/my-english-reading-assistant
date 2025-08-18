<script setup>
import { ref } from 'vue';
import { getOptions, updateOptions } from '../../../service/optionService.js';
import { getUnrecognizedWords, updateUnrecognizedWords } from '../../../service/dictionaryService.js';

const enabled = ref(false);
const unrecognizedWords = ref('');
const unrecognizedWordsCount = ref(0);

async function onChangeEnabled() {
    let options = await getOptions();
    let unrecognizedWordsOptions = options.unrecognizedWords;
    unrecognizedWordsOptions.enabled = enabled.value;
    let newOptions = { "unrecognizedWords": unrecognizedWordsOptions };

    await updateOptions(newOptions);
}

async function onClear() {
    unrecognizedWords.value = '';
    await updateUnrecognizedWords([], true);
    updateUnrecognizedWordsUI([]);    
}

function updateUnrecognizedWordsUI(array){
    unrecognizedWords.value = array.join('\n');
    unrecognizedWordsCount.value = array.length;
}

const init = async () => {
    let options = await getOptions();
    let unrecognizedWordsOptions = options.unrecognizedWords;

    enabled.value = unrecognizedWordsOptions.enabled;

    let unrecognizedWordsArray = await getUnrecognizedWords();
    updateUnrecognizedWordsUI(unrecognizedWordsArray);
    
};

const t = chrome.i18n.getMessage;


init();
</script>

<template>

    <div class="sections">
        <div class="section">
            <div class="label">
                <p>{{ t('optionsUnrecognizedWordsToggleDesc') }}</p>
            </div>
            <div class="input">
                <div>
                    <label>{{ t('optionsUnrecognizedWordsToggleLabel') }}</label>
                    <input data-testid="unregonized-words-enabled" v-model="enabled" type="checkbox" @change="onChangeEnabled">
                </div>
            </div>
            <div class="action">

            </div>
        </div>
        <div class="section">
            <div class="label">
                <p>{{ t('optionsUnrecognizedWordsLabelDesc') }}</p>
            </div>
            <div class="input">
                <textarea data-testid="unregonized-words" v-model="unrecognizedWords" rows="10" maxlength="500000"
                    readonly></textarea>
                <p>{{ t('optionsUnrecognizedWordsTotal') }}<span>{{ unrecognizedWordsCount }}</span></p>
            </div>
            <div class="action">
                <button @click="onClear" >{{ t('optionsClearUnrecognizedWordsAction') }}</button>
            </div>
        </div>
    </div>

</template>
