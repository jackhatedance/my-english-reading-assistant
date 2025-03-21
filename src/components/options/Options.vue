<script setup>
import { ref, provide } from 'vue';
import SideBar from './SideBar.vue';
import TabContent from './TabContent.vue';

const t = chrome.i18n.getMessage;

const props = defineProps({
    indexBuildingProgress: Object,   
});

provide('indexBuildingProgress', props.indexBuildingProgress);

const init = async () => {

};


init();
</script>

<template>
    <div class="options-container">
        <SideBar></SideBar>
        
        <TabContent>
            <RouterView />
        </TabContent>        
    </div>
</template>
<style>
html, body, #app {
    height: 100%;     
    margin: 0;
    min-width: 900px;
}

.options-container {
   display: flex;
   height: 100%;
}


.action {
    button {
        border: 0;
        display: inline-block;
        padding: 10px 20px;
        margin: 4px;
        color: white;
        background-color: #26a890;
        font-size: 16px;
        cursor: pointer;
        border-radius: 4px;
        text-decoration: none;
        transition: transform 0.2s ease;
        user-select: none;
        min-width: 150px;
    }
    
    button:disabled {
        background-color: #929494;
    }
}
</style>