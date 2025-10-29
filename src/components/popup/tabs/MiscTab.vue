<script setup>
import { ref, watch, onMounted, onBeforeUpdate, onUpdated, computed, inject, toRaw } from 'vue';
import { ElSelect, ElOption } from 'element-plus'
import 'element-plus/es/components/select/style/css'
import { SELECT_OPTION_UNSET } from '../../../element-plus-utils.js'

const emit = defineEmits(['change-setting']);

const props = defineProps({
    

});

const options = inject('options');

const clickWord = inject('clickWord');
const hoverWord = inject('hoverWord');
const selectText = inject('selectText');


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