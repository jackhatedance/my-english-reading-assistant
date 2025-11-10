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
        margin: 4px;
        margin-left: 4px !important;
    }
    
    
}
</style>