<script setup>
import { ref, watch, onMounted, onBeforeUpdate, onUpdated, computed, inject, toRaw } from 'vue';
import { ElSelect, ElOption } from 'element-plus'
import 'element-plus/es/components/select/style/css'
import { SELECT_OPTION_UNSET } from '../../../element-plus-utils.js'
import { SITE_CATEGORY_TEXT, SITE_CATEGORY_VIDEO, SITE_CATEGORY_OTHER } from '../../../site-category.js'

const emit = defineEmits(['change-setting']);

const props = defineProps({
    

});

const options = inject('options');

const clickWord = inject('clickWord');
const hoverWord = inject('hoverWord');
const selectText = inject('selectText');

const siteCategory = inject('siteCategory');

function getInteractionDefaultLabel(key){
  let interactionOptions = options.value.interaction;
  return interactionOptions[key] ? t('enabled') : t('disabled');
}

const t = chrome.i18n.getMessage;


function onChangeSetting(){
    emit('change-setting');
}

const init = async () => {

};

init();
</script>

<template>
    <div class="misc-settings">
        
      <div class="field" >
        <label>{{ t('popup_interaction_click_word_Label') }}</label>
        <div class="inputs">
          <el-select data-testid="click-word" v-model="clickWord" @change="onChangeSetting" size="small">
            <el-option :value="SELECT_OPTION_UNSET" :label="getInteractionDefaultLabel('clickWord') + '(' +t('default') + ')'" />
            <el-option value="true" :label="t('enabled')" />
            <el-option value="false" :label="t('disabled')" />
          </el-select> 
        </div> 
      </div>

      <div class="field" >
        <label>{{ t('popup_interaction_hover_word_Label') }}</label>
        <div class="inputs">
          <el-select data-testid="hover-word" v-model="hoverWord" @change="onChangeSetting" size="small">
            <el-option :value="SELECT_OPTION_UNSET" :label="getInteractionDefaultLabel('hoverWord') + '(' +t('default') + ')'" />
            <el-option value="true" :label="t('enabled')" />
            <el-option value="false" :label="t('disabled')" />
          </el-select> 
        </div> 
      </div>

      <div class="field" >
        <label>{{ t('popup_interaction_select_text_Label') }}</label>
        <div class="inputs">
          <el-select data-testid="select-text" v-model="selectText" @change="onChangeSetting" size="small">
            <el-option :value="SELECT_OPTION_UNSET" :label="getInteractionDefaultLabel('selectText') + '(' +t('default') + ')'" />
            <el-option value="true" :label="t('enabled')" />
            <el-option value="false" :label="t('disabled')" />
          </el-select> 
        </div> 
      </div>

      <div class="field" >
        <label>{{ t('popup_site_category_Label') }}</label>
        <div class="inputs">
          <el-select data-testid="site-category" v-model="siteCategory" @change="onChangeSetting" size="small">
            <el-option :value="SITE_CATEGORY_TEXT" :label="t('popup_site_category_text_Label')" />
            <el-option :value="SITE_CATEGORY_VIDEO" :label="t('popup_site_category_video_Label')" />
            <el-option :value="SITE_CATEGORY_OTHER" :label="t('popup_site_category_other_Label')" />
          </el-select> 
        </div> 
      </div>
    </div>
</template>

<style>
.misc-settings {
  .field{
    .inputs {
      width: 100px;
    }
    
  }
  
}
</style>