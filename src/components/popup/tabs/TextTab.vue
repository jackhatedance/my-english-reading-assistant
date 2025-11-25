<script setup>
import { ref, watch, onMounted, onBeforeUpdate, onUpdated, computed, inject, toRaw } from 'vue';
import InformationTooltip from '../../common/InformationTooltip.vue'
import { ElSwitch } from 'element-plus'
import 'element-plus/es/components/switch/style/css'
import { ElInputNumber } from 'element-plus'
import 'element-plus/es/components/input-number/style/css'
import { ElColorPicker } from 'element-plus'
import 'element-plus/es/components/color-picker/style/css'

const emit = defineEmits(['change-setting']);

const props = defineProps({
    

});

const lineHeight = inject('lineHeight');
const unknownWordColor = inject('unknownWordColor');
const unknownWordWidth = inject('unknownWordWidth');
const textFontSize = inject('textFontSize');
const bionicEnabled = inject('bionicEnabled');

const contentStyleEnabled = inject('contentStyleEnabled');

const t = chrome.i18n.getMessage;

function onChangeSetting(){
    emit('change-setting');
}

const init = async () => {

};

init();
</script>

<template>
    <div class="text-settings">
        
        <div class="field">
            <label>{{ t('popupLineHeightLabel') }}</label>
            <div class="inputs">
              <el-input-number v-model="lineHeight" :min="1" :max="3" :step="0.1" @change="onChangeSetting" controls-position="right" size="small">
                    
              </el-input-number>
            </div>
          </div>

          <div class="field">
            <label>{{ t('popupUnknownWordColorLabel') }}</label>
            <div class="inputs">
              <el-switch id="contentStyleEnabled" v-model="contentStyleEnabled" @change="onChangeSetting" size="small" />
              
              <el-color-picker v-model="unknownWordColor" @change="onChangeSetting" size="small"/>

              
            </div>
          </div>

          <div class="field">
            <label>{{ t('popupUnknownWordWidthLabel') }}</label>
            <div class="inputs">
              <el-input-number v-model="unknownWordWidth" :min="1" :max="5" :step="1" @change="onChangeSetting" controls-position="right" size="small">
                    
              </el-input-number>
            </div>
          </div>

          <div class="field">
            <label>{{ t('popup_settings_text_font_size_label') }}<InformationTooltip :content="t('popup_settings_text_font_size_tip')" linkType="guide" linkKeyword="正文字体尺寸" /></label>
            
            <div class="inputs">
              <el-input-number v-model="textFontSize" :min="14" :max="28" :step="1" @change="onChangeSetting" controls-position="right" size="small">
                    
              </el-input-number>
            </div>
          </div>

          <div class="field">
            <label>{{ t('popup_settings_text_bionic_reading_label') }}<span class="red">*</span><InformationTooltip :content="t('popup_settings_text_bionic_reading_tip')" linkType="guide" linkKeyword="仿生阅读" /></label>
            
            
            <div class="inputs">
              <el-switch v-model="bionicEnabled" @change="onChangeSetting" size="small" />
              
            </div>
          </div>
    </div>
</template>

<style>
.text-settings {
  .field {
    .inputs {
      >* {
        width: 6em;
      }
    }

  }
}

</style>