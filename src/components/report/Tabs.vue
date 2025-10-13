
<script setup>
const t = chrome.i18n.getMessage;


const init = async () => {

};

init();
</script>

<template>
    <div class="tabs">
        <nav>
            <RouterLink to="/vocabulary">{{ t('report_header_vocabulary') }}</RouterLink>
            <RouterLink to="/site">{{ t('report_header_site') }}</RouterLink>
            <RouterLink to="/page">{{ t('report_header_page') }}</RouterLink>
            <RouterLink to="/activity">{{ t('report_header_activity') }}</RouterLink>
        </nav>              
    
    </div>
    
</template>
<style>
nav {
    background-color: rgb(229, 229, 229);
}
.tabs a {
    padding: 10px;
    font-size: x-large;
    text-decoration: none;
    color: #666666;

    &.active {
        
        background-color: white;
    }
}

</style>