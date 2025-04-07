<script setup>
import { ref, toRaw, onMounted, onBeforeUpdate, onUpdated, computed, inject, watch } from 'vue';
import Definition from './Definition.vue'
import { getAllDictionaryMetas, loadCustomDictionary } from '../../dictionary/customDictionary.js'
import { getSystemDictionary } from '../../dictionary/systemDictionary.js'

const props = defineProps({
    
    
});

const dictionaryMetas = ref([]);
const selectedDictionary = ref();


const dictionaryRef = ref(null);
const queryRef = ref(null);
const lookupResultRef = ref(null);

async function getDictionary(meta){
    let dictionaryInstance;
    if(meta.type =='system'){
        dictionaryInstance = await getSystemDictionary(meta.name);
    }else{
        dictionaryInstance = await loadCustomDictionary(meta, ['raw'], { rawType: 'extracted'});    
    }

    return dictionaryInstance;
}

async function doLookup(dictionary, query){
    let meta = toRaw(dictionaryMetas.value.find(item => item.name == dictionary));
    //console.log(meta);
    let dictionaryInstance = await getDictionary(meta);
    
    let result = dictionaryInstance.lookup(query, { fromRaw: true, outputFormats:['html']});
    console.log(result);
    if(result){
        if(dictionaryInstance.toEmbeddedHtml){
            result.html = await dictionaryInstance.toEmbeddedHtml(result.html);
        }
    }    
    
    lookupResultRef.value = result;
}


async function onLookup(){
    console.log(`lookup dict: ${selectedDictionary.value}, query: ${queryRef.value}`);
    await doLookup(selectedDictionary.value, queryRef.value);
}

const init = async () => {
    let dictionary = 'route.query.dictionary';
    let query = 'route.query.query';
//    await doLookup(dictionary, query);

    dictionaryMetas.value = await getAllDictionaryMetas();
    selectedDictionary.value = dictionaryMetas.value[0].name;
};


init();
</script>

<template>
    <div class="lookup-container">     
        <select class="dictionaries" v-model="selectedDictionary" size="1" >
            <option v-for="(meta, index) in dictionaryMetas" :key="meta.name" :value="meta.name">{{ meta.displayName }}</option>
        </select>  
        <input type="text" v-model="queryRef" @keyup.enter="onLookup">
        <button @click="onLookup">lookup</button>   
        <Definition v-if="lookupResultRef" :query="lookupResultRef?.query" :text="lookupResultRef?.text" :html="lookupResultRef?.html"></Definition>
        <p v-if="!lookupResultRef">no result</p>
    </div>
</template>

<style>

.lookup-container {
    height: 100%;
}

</style>
