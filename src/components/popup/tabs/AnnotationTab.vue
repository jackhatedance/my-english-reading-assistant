<script setup>
import { ref, watch, onMounted, onBeforeUpdate, onUpdated, computed, inject, toRaw } from 'vue';
import HelpLink from '../../HelpLink.vue'
import InformationTooltip from '../../common/InformationTooltip.vue'
import { ElSwitch } from 'element-plus'
import 'element-plus/es/components/switch/style/css'
import { ElInputNumber } from 'element-plus'
import 'element-plus/es/components/input-number/style/css'
import { ElSelect, ElOption } from 'element-plus'
import 'element-plus/es/components/select/style/css'
import { ElColorPicker } from 'element-plus'
import 'element-plus/es/components/color-picker/style/css'

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

const notesEnabled = inject('notesEnabled');

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
            <label>{{ t('popupDualAnnotationEnabledLabel') }}<InformationTooltip :content="t('popupDualAnnotationEnabledTip')" linkType="guide" linkKeyword="双注解" /></label>
            
            <div class="inputs">
                <el-switch v-model="dualAnnotationEnabled" @change="onChangeDualAnnotationEnabled" size="small"/>
            </div>
        </div>

        <div class="field">
            <label>{{ t('popupContentLabel') }}</label>
            <div class="inputs">
                

                <el-select v-show="dualAnnotationEnabled" data-testid="content2" class="annotation-input-2" v-model="content2" @change="onChangeSetting" size="small">
                    <el-option value="AC_NONE" :label="t('popup_settings_content_none')" />
                    <el-option value="AC_PRONUNCIATION" :label="t('popup_settings_content_pronunciation')" />
                    <el-option value="AC_DEFINITION" :label="t('popup_settings_content_definition')" />
                    <el-option value="AC_NOTE" :label="t('popup_settings_content_note')" :disabled="!notesEnabled"/>
                    <el-option value="AC_PRONUNCIATION_AND_DEFINITION" :label="t('popup_settings_content_pronunciation_and_definition')" />
                    <el-option value="AC_PRONUNCIATION_AND_DEFINITION_NEW_LINE" :label="t('popup_settings_content_pronunciation_newline_definition')" />
                    <el-option value="AC_PRONUNCIATION_AND_NOTE" :label="t('popup_settings_content_pronunciation_and_note')" :disabled="!notesEnabled"/>
                    <el-option value="AC_PRONUNCIATION_AND_NOTE_2_LINES" :label="t('popup_settings_content_pronunciation_and_note_2_lines')" :disabled="!notesEnabled"/>
                </el-select>   

                <el-select data-testid="content" v-model="content" @change="onChangeSetting" size="small">
                    <el-option value="AC_NONE" :label="t('popup_settings_content_none')" />
                    <el-option value="AC_PRONUNCIATION" :label="t('popup_settings_content_pronunciation')" />
                    <el-option value="AC_DEFINITION" :label="t('popup_settings_content_definition')" />
                    <el-option value="AC_NOTE" :label="t('popup_settings_content_note')" :disabled="!notesEnabled"/>
                    <el-option value="AC_PRONUNCIATION_AND_DEFINITION" :label="t('popup_settings_content_pronunciation_and_definition')" />
                    <el-option value="AC_PRONUNCIATION_AND_DEFINITION_NEW_LINE" :label="t('popup_settings_content_pronunciation_newline_definition')" />
                    <el-option value="AC_PRONUNCIATION_AND_NOTE" :label="t('popup_settings_content_pronunciation_and_note')" :disabled="!notesEnabled"/>
                    <el-option value="AC_PRONUNCIATION_AND_NOTE_2_LINES" :label="t('popup_settings_content_pronunciation_and_note_2_lines')" :disabled="!notesEnabled"/>
                </el-select>   
            </div>
        </div>
        
        <div class="field">
            <label>{{ t('popupPositionLabel') }}</label>
            <div class="inputs">
            
                <el-input-number v-show="dualAnnotationEnabled" v-model="position2" :min="-2" :max="1" :step="0.1" @change="onChangeSetting" controls-position="right" size="small">
                    
                </el-input-number>

                <el-input-number v-model="position" :min="-2" :max="1" :step="0.1" @change="onChangeSetting" controls-position="right" size="small">
                    
                </el-input-number>
            </div>
        </div>

        <div class="field">
            <label>{{ t('popupFontSizeLabel') }}</label>
            <div class="inputs">
            

                <el-input-number v-show="dualAnnotationEnabled" v-model="fontSize2" :min="0.1" :max="1" :step="0.1" @change="onChangeSetting" controls-position="right" size="small">
                    
                </el-input-number>

                <el-input-number v-model="fontSize" :min="0.1" :max="1" :step="0.1" @change="onChangeSetting" controls-position="right" size="small">
                    
                </el-input-number>
            </div>
        </div>
        
        <div class="field">
            <label for="color">{{ t('popupColorLabel') }}</label>
            <div class="inputs">
            <el-color-picker :class="{ 'hidden-component': !dualAnnotationEnabled }" v-show="dualAnnotationEnabled" v-model="color2" @change="onChangeSetting" size="small"/>
            <el-color-picker v-model="color" @change="onChangeSetting" size="small"/>
            </div>
        </div>

        <div class="field">
            <label>{{ t('popupOpacityLabel') }}</label>
            <div class="inputs">
            
                <el-input-number v-show="dualAnnotationEnabled" v-model="opacity2" :min="0.1" :max="1" :step="0.1" @change="onChangeSetting" controls-position="right" size="small">
                    
                </el-input-number>
                <el-input-number v-model="opacity" :min="0.1" :max="1" :step="0.1" @change="onChangeSetting" controls-position="right" size="small">
                    
                </el-input-number>

            </div>
        </div>

        <div class="field">
            <label>{{ t('popupInterlacedLabel') }}</label>
            <div class="inputs">
            <el-switch class="annotation-input-2" v-show="dualAnnotationEnabled" v-model="interlaced2" @change="onChangeSetting" size="small" />
            <el-switch id="interlaced" v-model="interlaced" @change="onChangeSetting" size="small" />
            </div>
        </div>

         <div class="field">
            <label>{{ t('popupMaxMeaningNumberLabel') }}<span class="red">*</span></label>
            <div class="inputs">
                
                <el-input-number v-model="maxMeaningNumber" :min="1" :max="20" :step="1" @change="onChangeSetting" controls-position="right" size="small">
                    
                </el-input-number>
            </div>
        </div>

        <div class="field">
            <label>{{ t('popupHideWordClassLabel') }}<span class="red">*</span></label>
            <div class="inputs">
                <el-switch id="hideWordClass" v-model="hideWordClass" @change="onChangeSetting" size="small" />
            </div>
        </div>

    </div>
</template>

<style>
.annotation-settings {
  .field {
    .inputs {
      >* {
        width: 7em;
      }
    }

  }
}

</style>