
<script setup>
const t = chrome.i18n.getMessage;

const init = async () => {

};

init();
</script>

<template>
    <div class="sidebar">
        <div class="sidebar-top">
            <h1>{{ t('optionsTitle') }}</h1>
        </div>
        <div class="sidebar-middle">
            <ul>
                <slot></slot>    
            </ul>
        </div>

        <div class="sidebar-bottom"></div>
    </div>
    
</template>
<style>
.sidebar {
    background-color: rgb(229, 229, 229);
    flex: 0 0 200px;
    height: 100%;
    padding-left: 10px;
}

.sidebar-middle {
    text-align: left;

    ul {
        list-style-type: none; 
        padding-left: 0; 
        font-size: large;
    }  
}

.sidebar-bottom {
    position: fixed;
    bottom: 0px;
}

</style>