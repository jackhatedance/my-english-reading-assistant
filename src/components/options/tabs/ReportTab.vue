<script setup>
import { ref } from 'vue';
import { getOptions, updateOptions } from '../../../service/optionService.js';
import {deleteAllReadingHistory} from '../../../service/activityService.js';

const t = chrome.i18n.getMessage;
const enableReport = ref(false);

async function onChange() {
  const report = {
    enabled: enableReport.value,
  };
  let newOptions = { report };
  await updateOptions(newOptions);
}

async function onDelete(){
  deleteAllReadingHistory();
}

function updateReport(reportOptions){
  enableReport.value = reportOptions.enabled;
}

const init = async () => {
  let options = await getOptions();
  updateReport(options.report);  
};

init();
</script>

<template>

  <div class="sections">
    <div class="section">
      <div class="label">

        <p>{{ t('optionsReportLabelDesc') }}</p>  
      </div>
      <div class="input">
        <div>
          <label>{{ t('optionsReportModeLabel') }}</label>
          <input type="checkbox" @change="onChange" v-model="enableReport">
        </div>
      </div>
      <div class="action">

      </div>
    </div>
    <div class="section">
      <div class="label">
      </div>
      <div class="input">
        <div>
        </div>
      </div>
      <div class="action">
        <button @click="onDelete">{{ t('optionsDeleteReadingHistoryAction') }}</button>
      </div>
    </div>
  </div>

</template>
