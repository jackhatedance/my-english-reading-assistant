<script setup>
import { ref } from 'vue'

defineEmits(['value-changed']);

const props = defineProps({
    dict: Object,
});

const enabled = defineModel('enabled');


const t = chrome.i18n.getMessage;


const init = async () => {
    enabled.value = props.dict.enabled;
};

init();
</script>

<template>
    <div class="detail">
        <h3>Detail</h3>
        <div class="fields">
            <label>Name</label>
            <span>{{ props.dict.name }}</span>

            <label>Type</label>
            <span>{{ props.dict.type }}</span>
                
            <label>Format</label>
            <span>{{ props.dict.format }}</span>
                
            <label>size</label>
            <span>{{ props.dict.size }}</span>

            <label>language</label>
            <span>{{ props.dict.fromLanguage }} - {{ props.dict.toLanguage }}</span>
               
            <label>Enabled</label>
            <input type="checkbox" v-model="enabled" @change="$emit('value-changed')">
        </div>
    </div>
</template>
<style>

.fields {
    display: grid;
    grid-template-columns: auto auto;
    height: fit-content;
    label {
        font-weight: bold;
    }
  }
</style>
