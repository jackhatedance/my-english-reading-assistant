<script setup>
import { ref, toRaw, onMounted, onBeforeUpdate, onUpdated, computed, inject, watch } from 'vue';
import { useRoute } from 'vue-router'
import Definition from './Definition.vue'
import DictionaryList from './DictionaryList.vue'
import { getAllDictionaryMetas, loadCustomDictionary } from '../../dictionary/customDictionary.js'
import { loadSystemDictionary } from '../../dictionary/systemDictionary.js'

const props = defineProps({
    
    
});

const route = useRoute();


const query = inject('query');
watch(() => query.value, (newValue) => {
    queryRef.value = newValue;
    onLookup();
});

const dictionaryMetas = ref([]);
const searchResults = ref([]);
const activeDictionaryName = ref();


const queryRef = ref(null);
const lookupResultRef = ref(null);

async function getDictionary(meta){
    let dictionaryInstance;
    if(meta.type =='system'){
        dictionaryInstance = await loadSystemDictionary(meta.name);
    }else{
        dictionaryInstance = await loadCustomDictionary(meta, ['raw'], { rawType: 'extracted'});    
    }

    return dictionaryInstance;
}

async function search(query){
    for(let meta of toRaw(dictionaryMetas.value)){
        let result = await searchSingle(meta, query);
        if(result){
            appendSearchResult(result);

            if(meta.name == activeDictionaryName.value){
                showDefinition(activeDictionaryName.value);
            }
        }
    }
}

function appendSearchResult(meta){
    searchResults.value.push(meta);
}

function clearSearchResult(){
    searchResults.value = [];
    lookupResultRef.value = null;
}

async function searchSingle(meta, query){
    let dictionaryInstance = await getDictionary(meta);

    let lookupResult = dictionaryInstance.lookup(query, { fromRaw: true, outputFormats:['html']});
    if(lookupResult){
        meta.lookupResult = lookupResult;
       return meta;
    }
}

async function showDefinition(dictionaryName){
    let meta = toRaw(dictionaryMetas.value.find(item => item.name == dictionaryName));

    if(meta){
        //console.log(meta);
        let dictionaryInstance = await getDictionary(meta);
        
        //let result = dictionaryInstance.lookup(query, { fromRaw: true, outputFormats:['html']});
        let lookupResult = meta.lookupResult;
        //console.log(result);
        if(lookupResult){
            if(!lookupResult.embeddedHtml){
                if(dictionaryInstance.toEmbeddedHtml){
                    lookupResult.embeddedHtml = await dictionaryInstance.toEmbeddedHtml(lookupResult.html);    
                } else {
                    lookupResult.embeddedHtml = lookupResult.html;
                }
            }
        }    
        
        lookupResultRef.value = lookupResult;
    }
}

async function onChangeDictionary(dictionaryName){
    activeDictionaryName.value = dictionaryName;
    await showDefinition(dictionaryName, queryRef.value);
}

async function onLookup(){
    //console.log(`lookup dict: ${selectedDictionary.value}, query: ${queryRef.value}`);
    
    clearSearchResult();

    await search(queryRef.value);

    //await doLookup(null, queryRef.value);
}

const init = async () => {
    
//    await doLookup(dictionary, query);

    dictionaryMetas.value = await getAllDictionaryMetas();

    if(route.query.dictionary){
        let meta = dictionaryMetas.value.find(item => item.name == route.query.dictionary);
        activeDictionaryName.value = meta?.name;
    }
    
    if(route.query.query){
        queryRef.value = route.query.query; 
    }

    if(route.query.query){
        await onLookup();
    }
};


init();
</script>

<template>
    <div class="lookup-container">     
        <div class="toolbar">
            <input type="text" v-model="queryRef" @keyup.enter="onLookup">
            <button @click="onLookup">lookup</button>   
        </div>
        <div class="body">
            <div class="sidebar">
                <DictionaryList :dictionaries="searchResults" :activeDictionaryName="activeDictionaryName" @change-dictionary="onChangeDictionary"></DictionaryList>
            </div>
            <div class="content">
                <Definition v-if="lookupResultRef" :query="lookupResultRef?.query" :text="lookupResultRef?.text" :html="lookupResultRef?.embeddedHtml"></Definition>
                <p v-if="!lookupResultRef">no result</p>
            </div>
        </div>
    </div>
</template>

<style>

.lookup-container {
    height: 100%;
    background-color: rgb(229, 229, 229);

    .toolbar {
        text-align: center;
        padding: 20px;
        input, button {
            margin: 5px;
            font-size: x-large;
        }
    }

}


.body{
    display: flex;
    height: 100%;

    .sidebar {
        padding: 10px;
        padding-right: 0;
        width: 250px;
        height: 100vh;
        box-sizing: border-box;
        position: fixed;

        border-top: solid grey 1px;
    }

    .content {
        flex: 1;
        padding: 10px;
        padding-left: 0;
        box-sizing: border-box;
        margin-left: 250px;
        text-align: justify;

        background-color: white;
        border-color: grey;
        border-style: solid;
        border-width: 1px 1px 1px 0;
    }
}



</style>
