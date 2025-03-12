<script setup>
import { ref } from 'vue';
import SideBar from './SideBar.vue';
import TabContent from './TabContent.vue';

const t = chrome.i18n.getMessage;


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
    min-width: 1200px;
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
    }
}
</style>