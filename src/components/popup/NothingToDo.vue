<script setup>
import { ref, provide } from 'vue';

const t = chrome.i18n.getMessage;

const init = async () => {

};


init();
</script>

<template>
    <div id="nothing-to-do">
        <br>
        <h1>{{ t('popupNothingToDoTitle') }}</h1>
        <img src="icons/nothing-to-do.png" width="277px">
      </div>
</template>
<style>


</style>