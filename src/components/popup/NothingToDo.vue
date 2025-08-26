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
        <div class="quick-actions">
          <h1 class="title">{{ t('popupNothingToDoQuickActionsTitle') }}</h1>
          <ul class="actions">
            <li><a href="https://app.flowoss.com" target="_blank">{{ t('popupNothingToDoQuickActionsEpubReader') }}</a></li>
            <li><a href="https://mozilla.github.io/pdf.js/web/viewer.html" target="_blank">{{ t('popupNothingToDoQuickActionsPdfReader') }}</a></li>            
          </ul>
        </div>
      </div>
</template>
<style>


</style>