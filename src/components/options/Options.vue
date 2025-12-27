<script setup>
import { ref, provide } from 'vue';
import SideBar from './SideBar.vue';
import TabContent from './TabContent.vue';

import { ElContainer } from 'element-plus'
import 'element-plus/es/components/container/style/css'
import { ElAside } from 'element-plus'
import 'element-plus/es/components/aside/style/css'
import { ElMain } from 'element-plus'
import 'element-plus/es/components/main/style/css'

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
    <div class="common-layout">
        
        <el-container>
            <el-aside width="200px">
                <SideBar></SideBar>
            </el-aside>
            <el-main>
                <TabContent>
                    <RouterView />
                </TabContent>
            </el-main>
        </el-container>
        
    </div>

    
</template>
<style>
html, body, #app {
    height: 100%;     
    margin: 0;
    min-width: 800px;

    
}

.el-main {
    --el-main-padding: 0;
}

.options-container {
   display: flex;
   height: 100%;
}

.el-aside {
    height: 100vh;
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