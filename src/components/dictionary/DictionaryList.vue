<script setup>
import { ref, toRaw, watch, inject, computed } from 'vue';

const props = defineProps({
    dictionaries: Array,
    activeDictionaryName: String,
});


const emit = defineEmits(['change-dictionary']);

async function onClick(dictionaryName) {
    emit('change-dictionary', dictionaryName);  
}

const init = async () => {
    
};

init();

</script>

<template>
    <div class="search-result">
        <ul class="dictionaries" >
            <li v-for="(meta, index) in dictionaries" :key="meta.name" :value="meta.name" :class="{ active: activeDictionaryName == meta.name, searchResultItem: true }" >
                <a href="#" @click.prevent="onClick(meta.name)">{{ meta.displayName }}</a>
            </li>
        </ul>
    </div>
    
</template>
<style>

.search-result {
    .dictionaries {
        padding-left: 0;
        text-align: right;
    
        .searchResultItem{
            a {
                text-decoration: none;
                color: #666666;
                padding-right: 10px;
            }
            list-style-type: none;
            font-size: small;
            padding: 5px 0 5px 10px;
            border-radius: 8px 0 0 8px;

            color: #666666;
            &.active{
                    background-color: white;
                }
        }
    }
}

</style>