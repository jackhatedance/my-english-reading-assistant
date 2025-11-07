<script setup>
import { ref, watch, onMounted, onBeforeUpdate, onUpdated, computed, inject, toRaw } from 'vue';
import Tooltip from '../../common/Tooltip.vue'
import { ElSwitch } from 'element-plus'
import 'element-plus/es/components/switch/style/css'

const emit = defineEmits(['change-setting']);

const props = defineProps({
    

});

const lineHeight = inject('lineHeight');
const unknownWordColor = inject('unknownWordColor');
const unknownWordWidth = inject('unknownWordWidth');
const textFontSize = inject('textFontSize');

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
              <input id="lineHeight" v-model="lineHeight" @change="onChangeSetting" type="number" value="0.5" min="1" max="3" step="0.1">
            </div>
          </div>

          <div class="field">
            <label>{{ t('popupUnknownWordColorLabel') }}</label>
            <div class="inputs">
              <input type="color" id="unknownWordColor" v-model="unknownWordColor" @change="onChangeSetting" name="unknownWordColor" value="#808080">
              <el-switch id="contentStyleEnabled" v-model="contentStyleEnabled" @change="onChangeSetting" size="small" />
              
            </div>
          </div>

          <div class="field">
            <label>{{ t('popupUnknownWordWidthLabel') }}</label>
            <div class="inputs">
              <input id="unknownWordWidth" v-model="unknownWordWidth" @change="onChangeSetting" type="number" value="1" min="1" max="5" step="1">
            </div>
          </div>

          <div class="field">
            <Tooltip placement="top-start"  effect="dark" :content="t('popup_settings_text_font_size_tip')" linkType="guide" linkKeyword="正文字体尺寸">
              <label>{{ t('popup_settings_text_font_size_label') }}</label>
            </Tooltip>
            
            <div class="inputs">
              <input v-model="textFontSize" @change="onChangeSetting" type="number" value="1" min="14" max="28" step="1">
            </div>
          </div>
    </div>
</template>

<style>


</style>