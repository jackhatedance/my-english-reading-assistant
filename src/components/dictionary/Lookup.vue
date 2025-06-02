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
const t = chrome.i18n.getMessage;

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

var gDictionaryInstanceCache = {};

async function getDictionary(meta){
    let name = meta.name;
    if(!gDictionaryInstanceCache.hasOwnProperty(name)){
        gDictionaryInstanceCache[name] = await loadDictionary(meta)
    }
    return gDictionaryInstanceCache[name];
}

async function loadDictionary(meta){
    let dictionaryInstance;
    if(meta.type =='system'){
        dictionaryInstance = await loadSystemDictionary(meta.name);
    }else{
        dictionaryInstance = await loadCustomDictionary(meta, ['raw'], { rawType: 'extracted'});    
    }

    return dictionaryInstance;
}

async function search(query){
    let activeDictionaryHasResult = false;
    for(let meta of toRaw(dictionaryMetas.value)){
        let result = await searchSingle(meta, query);
        if(result){
            appendSearchResult(result);

            if(meta.name == activeDictionaryName.value){
                showDefinition(activeDictionaryName.value);
                activeDictionaryHasResult = true;
            }
        }
    }

    if(!activeDictionaryHasResult){
        if(searchResults.value.length > 0){
            activeDictionaryName.value = searchResults.value[0].name;
            showDefinition(activeDictionaryName.value);
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

var inProgress = false;
async function onLookup(){
    //console.log(`lookup dict: ${selectedDictionary.value}, query: ${queryRef.value}`);
    if(inProgress){
        return;
    }
    
    inProgress = true;

    clearSearchResult();

    await search(queryRef.value);
    
    inProgress = false;
    //await doLookup(null, queryRef.value);
}

const init = async () => {
    
//    await doLookup(dictionary, query);

    let allMetas = await getAllDictionaryMetas();
    dictionaryMetas.value = allMetas;

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
            <button @click="onLookup">{{ t('dictionaryPage_button_lookup') }}</button>   
        </div>
        <div class="body">
            <div class="sidebar">
                <DictionaryList :dictionaries="searchResults" :activeDictionaryName="activeDictionaryName" @change-dictionary="onChangeDictionary"></DictionaryList>
            </div>
            <div class="content">
                <Definition v-if="lookupResultRef" :query="lookupResultRef?.query" :text="lookupResultRef?.text" :html="lookupResultRef?.embeddedHtml"></Definition>
                <div v-if="!lookupResultRef" class="no-lookup-result">
                    <h2>{{ t('dictionaryPage_no_result_tips') }}</h2>
                    <br>
                    <h3 v-for="(meta, index) in dictionaryMetas" >
                        {{ meta.displayName }}
                    </h3>
                </div>
            </div>
        </div>
    </div>
</template>

<style>

.lookup-container {
    height: 100%;
    
    .toolbar {
        text-align: center;
        padding: 20px;
        border-bottom: solid grey 1px;
        height: 40px;
        input, button {
            margin: 5px;
            font-size: x-large;
        }
    }

}


.body{
    display: flex;
    height: calc(100% - 80px);
    background-color: rgb(229, 229, 229);

    .sidebar {
        padding: 10px;
        padding-right: 0;
        width: 250px;
        height: 100vh;
        box-sizing: border-box;
        position: fixed;

        
    }

    .content {
        flex: 1;
        padding: 10px;
        padding-left: 0;
        box-sizing: border-box;
        margin-left: 250px;
        text-align: justify;

        background-color: white;
        
        border-width: 0;

        .no-lookup-result {
            text-align: center;
        }
    }
}



</style>
