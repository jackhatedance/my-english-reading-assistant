<script setup>
import { ref, watch, onMounted, onBeforeUpdate, onUpdated, computed, inject, toRaw } from 'vue';
import InformationTooltip from '../../common/InformationTooltip.vue'
import RefreshTooltip from '../../common/RefreshTooltip.vue'
import { ElSwitch } from 'element-plus'
import 'element-plus/es/components/switch/style/css'
import { ElInputNumber } from 'element-plus'
import 'element-plus/es/components/input-number/style/css'
import { ElColorPicker } from 'element-plus'
import 'element-plus/es/components/color-picker/style/css'
import { ElSlider } from 'element-plus'
import 'element-plus/es/components/slider/style/css'

const emit = defineEmits(['change-setting']);

const props = defineProps({
    

});

const predefineColors = [
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
];

const lineHeight = inject('lineHeight');
const unknownWordColor = inject('unknownWordColor');
const unknownWordWidth = inject('unknownWordWidth');
const textFontSize = inject('textFontSize');
const bionicEnabled = inject('bionicEnabled');


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
              <el-slider v-model="lineHeight" :min="1" :max="3" :step="0.1" @change="onChangeSetting" controls-position="right" size="small">
                    
              </el-slider>
            </div>
          </div>

          <div class="field">
            <label>{{ t('popupUnknownWordColorLabel') }}</label>
            <div class="inputs">
              
              <el-color-picker v-model="unknownWordColor" @change="onChangeSetting" :predefine="predefineColors" size="small"/>

              
            </div>
          </div>

          <div class="field">
            <label>{{ t('popupUnknownWordWidthLabel') }}</label>
            <div class="inputs">
              <el-slider v-model="unknownWordWidth" :min="1" :max="5" :step="1" @change="onChangeSetting" controls-position="right" size="small">
                    
              </el-slider>
            </div>
          </div>

          <div class="field">
            <label>{{ t('popup_settings_text_font_size_label') }}<InformationTooltip :content="t('popup_settings_text_font_size_tip')" linkType="guide" linkKeyword="正文字体尺寸" effect="dark" /></label>
            
            <div class="inputs">
              <el-slider v-model="textFontSize" :min="14" :max="28" :step="1" @change="onChangeSetting" controls-position="right" size="small">
                    
              </el-slider>
            </div>
          </div>

          <div class="field">
            <label>{{ t('popup_settings_text_bionic_reading_label') }}
              <InformationTooltip :content="t('popup_settings_text_bionic_reading_tip')" linkType="guide" linkKeyword="仿生阅读" effect="dark" />
              <RefreshTooltip />
            </label>
            
            
            <div class="inputs">
              <el-switch data-testid="bionic-switch" v-model="bionicEnabled" @change="onChangeSetting" size="small" />
              
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