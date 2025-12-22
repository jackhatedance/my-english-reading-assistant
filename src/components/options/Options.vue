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
    min-width: 800px;
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


input[type="file"]::file-selector-button{
  color: var(--el-button-text-color);
  border: thin solid var(--el-border-color);
  border-radius: var(--el-border-radius-round);
  font-size: large;
}

input[type="file"]::file-selector-button:hover {
  
    background-color: var(--el-button-hover-bg-color);
    border-color: var(--el-button-hover-border-color);
    color: var(--el-button-hover-text-color);
    outline: none;
}


.right {
  float: right;
}

.option {
    clear: both;
}

.warning{
    color: red;
}
</style>