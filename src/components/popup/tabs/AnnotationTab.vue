<script setup>
import { ref, watch, onMounted, onBeforeUpdate, onUpdated, computed, inject, toRaw } from 'vue';
import HelpLink from '../../HelpLink.vue'

const emit = defineEmits(['change-setting']);

const props = defineProps({
    
});


const dualAnnotationEnabled = inject('dualAnnotationEnabled');

const content = inject('content');
const content2 = inject('content2');

const position = inject('position');
const position2 = inject('position2');

const fontSize = inject('fontSize');
const fontSize2 = inject('fontSize2');

const color = inject('color');
const color2 = inject('color2');

const opacity = inject('opacity');
const opacity2 = inject('opacity2');

const interlaced = inject('interlaced');
const interlaced2 = inject('interlaced2');

const maxMeaningNumber = inject('maxMeaningNumber');
const hideWordClass = inject('hideWordClass');


const t = chrome.i18n.getMessage;

function onChangeSetting(){
    emit('change-setting');
}

function onChangeDualAnnotationEnabled(){
  emit('change-setting', 'dualAnnotationEnabled');
}

const init = async () => {

};

init();
</script>

<template>
    <div class="annotation-settings">
        <div class="field">
            <label>{{ t('popupDualAnnotationEnabledLabel') }} <HelpLink type="guide" keyword="双注解"/></label>
            <div class="inputs">
            <input v-model="dualAnnotationEnabled" @change="onChangeDualAnnotationEnabled" type="checkbox" >
            </div>
        </div>

        <div class="field">
            <label>{{ t('popupContentLabel') }}</label>
            <div class="inputs">
            <select data-testid="content2" class="annotation-input-2" v-show="dualAnnotationEnabled" v-model="content2" @change="onChangeSetting" >
                <option value="AC_NONE">{{ t('popup_settings_content_none') }}</option>
                <option value="AC_PRONUNCIATION">{{ t('popup_settings_content_pronunciation') }}</option>
                <option value="AC_DEFINITION">{{ t('popup_settings_content_definition') }}</option>
                <option value="AC_NOTE">{{ t('popup_settings_content_note') }}</option>
                <option value="AC_PRONUNCIATION_AND_DEFINITION">{{ t('popup_settings_content_pronunciation_and_definition') }}</option>
                <option value="AC_PRONUNCIATION_AND_DEFINITION_NEW_LINE">{{ t('popup_settings_content_pronunciation_newline_definition') }}</option>
            </select>
            <select data-testid="content" v-model="content" @change="onChangeSetting" >
                <option value="AC_NONE">{{ t('popup_settings_content_none') }}</option>
                <option value="AC_PRONUNCIATION">{{ t('popup_settings_content_pronunciation') }}</option>
                <option value="AC_DEFINITION">{{ t('popup_settings_content_definition') }}</option>
                <option value="AC_NOTE">{{ t('popup_settings_content_note') }}</option>
                <option value="AC_PRONUNCIATION_AND_DEFINITION">{{ t('popup_settings_content_pronunciation_and_definition') }}</option>
                <option value="AC_PRONUNCIATION_AND_DEFINITION_NEW_LINE">{{ t('popup_settings_content_pronunciation_newline_definition') }}</option>
            </select>
            </div>
        </div>
        
        <div class="field">
            <label>{{ t('popupPositionLabel') }}</label>
            <div class="inputs">
            <input class="annotation-input-2" v-show="dualAnnotationEnabled" v-model="position2"  @change="onChangeSetting" type="number" value="-1" min="-2" max="1" step="0.1">
            <input id="annotationPosition" v-model="position"  @change="onChangeSetting" type="number" value="-1" min="-2" max="1" step="0.1">
            </div>
        </div>

        <div class="field">
            <label>{{ t('popupFontSizeLabel') }}</label>
            <div class="inputs">
            <input class="annotation-input-2" v-show="dualAnnotationEnabled" v-model="fontSize2" @change="onChangeSetting" type="number" value="0.4" min="0.1" max="1" step="0.1"></input>
            <input id="fontSize" v-model="fontSize" @change="onChangeSetting" type="number" value="0.4" min="0.1" max="1" step="0.1">
            </div>
        </div>
        
        <div class="field">
            <label for="color">{{ t('popupColorLabel') }}</label>
            <div class="inputs">
            <input type="color" class="annotation-input-2" v-show="dualAnnotationEnabled" v-model="color2" @change="onChangeSetting"  name="color" value="#808080">
            <input type="color" id="color" v-model="color" @change="onChangeSetting"  name="color" value="#808080">
            </div>
        </div>

        <div class="field">
            <label>{{ t('popupOpacityLabel') }}</label>
            <div class="inputs">
            <input class="annotation-input-2" v-show="dualAnnotationEnabled" v-model="opacity2" @change="onChangeSetting" type="number" value="0.3" min="0.1" max="1" step="0.1">
            <input id="opacity" v-model="opacity" @change="onChangeSetting" type="number" value="0.3" min="0.1" max="1" step="0.1">
            </div>
        </div>

        <div class="field">
            <label>{{ t('popupInterlacedLabel') }}</label>
            <div class="inputs">
            <input class="annotation-input-2" v-show="dualAnnotationEnabled" v-model="interlaced2" @change="onChangeSetting" type="checkbox" >
            <input id="interlaced" v-model="interlaced" @change="onChangeSetting" type="checkbox" >
            </div>
        </div>

         <div class="field">
            <label>{{ t('popupMaxMeaningNumberLabel') }}<span class="red">*</span></label>
            <div class="inputs">
                <input id="maxMeaningNumber" v-model="maxMeaningNumber" @change="onChangeSetting" type="number" value="3" min="1" max="20" step="1">
            </div>
        </div>

        <div class="field">
            <label>{{ t('popupHideWordClassLabel') }}<span class="red">*</span></label>
            <div class="inputs">
                <input id="hideWordClass" v-model="hideWordClass" @change="onChangeSetting" type="checkbox" >
            </div>
        </div>

    </div>
</template>

<style>


</style>