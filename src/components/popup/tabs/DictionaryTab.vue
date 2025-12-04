<script setup>
import { ref, watch, onMounted, onBeforeUpdate, onUpdated, computed, inject, toRaw } from 'vue';
import InformationTooltip from '../../common/InformationTooltip.vue'
import RefreshTooltip from '../../common/RefreshTooltip.vue'
import { ElSelect, ElOption } from 'element-plus'
import 'element-plus/es/components/select/style/css'

const emit = defineEmits(['change-setting']);

const props = defineProps({
    

});

const options = inject('options');

const additionalDictionaryMetas = inject('additionalDictionaryMetas');
const additionalDictionaries = inject('additionalDictionaries');

const t = chrome.i18n.getMessage;


function onChangeSetting(){
    emit('change-setting');
}

const init = async () => {

};

init();
</script>

<template>
    <div class="dictionary-settings">
        
          <div class="field" id="dictionaryField" >
            
            
            <label>{{ t('popupAdditionalDictionaryLabel') }}
              <InformationTooltip :content="t('popupAdditionalDictionaryTip')" linkType="guide" linkKeyword="指定附加词典" effect="dark" />
              <RefreshTooltip/>
            </label>
            
            <div class="inputs">
                       
              
              <el-select id="additionalDictionaries" data-testid="additionalDictionaries" v-model="additionalDictionaries" @change="onChangeSetting" multiple size="small">
                <el-option v-for="(meta, index) in additionalDictionaryMetas" :key="meta.name" :value="meta.name" :label="meta.displayName" />
                
              </el-select>   
            </div> 
          </div>

    </div>
</template>

<style>
.dictionary-settings{
  .field {

    .inputs {
      >* {
        width: 10em;
      }
    }

  }
}


</style>