
<script setup>
const t = chrome.i18n.getMessage;


const init = async () => {

};

init();
</script>

<template>
    <div class="tabs">
        <nav>
            <RouterLink to="/time">{{ t('report_header_time') }}</RouterLink>
            <RouterLink to="/site">{{ t('report_header_site') }}</RouterLink>
            <RouterLink to="/page">{{ t('report_header_page') }}</RouterLink>
            <RouterLink to="/book">{{ t('report_header_book') }}</RouterLink>
            
            <RouterLink to="/activity">{{ t('report_header_activity') }}</RouterLink>
            
        </nav>              
    
    </div>
    
</template>
<style>
nav {
    background-color: rgb(229, 229, 229);
}
.tabs {
    text-align: center;

    a {
        padding: 10px;
        font-size: x-large;
        text-decoration: none;
        color: #666666;
        border: solid white 1px;
        &.active {
            
            background-color: white;
        }
    }
}
</style>