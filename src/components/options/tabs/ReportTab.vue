<script setup>
import { ref } from 'vue';
import { getOptions, updateOptions } from '../../../service/optionService.js';
import {deleteAllReadingHistory} from '../../../service/activityService.js';
import {loadActivitiesFromStorage, saveActivities } from '../../../service/activityService.js';
import { saveTextAsFile } from '../../../html-utils.js';
import { ElSwitch } from 'element-plus'
import 'element-plus/es/components/switch/style/css'
import { ElButton } from 'element-plus'
import 'element-plus/es/components/button/style/css'
import { ElNotification } from 'element-plus'
import 'element-plus/es/components/notification/style/css'

const t = chrome.i18n.getMessage;
const enableReport = ref(false);

const file = ref();

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

function onImport() {
    
    const files = file.value.files;
    if(files.length == 0){
        alert(t('choose_file_first'));
        return;
    }
    
    const _file = files[0];

    var reader = new FileReader();
    reader.onload = function(e){
        let activities = JSON.parse(e.target.result);
        saveActivities(activities);

        ElNotification({
          title: t('options_report_import_notification_title'),
          message: t('options_report_import_notification_message_success'),
      });
    }
    reader.readAsText(_file);

}

async function onExport() {
    let notes  = await loadActivitiesFromStorage();
    let json = JSON.stringify(notes);

    saveTextAsFile(json, 'activity', 'json');
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
        <div class="option">
          <label>{{ t('optionsReportModeLabel') }}</label>
          <el-switch class="right" @change="onChange" v-model="enableReport" />
        </div>
        
      </div>
      
    </div>
    

    <div class="section">
        <div class="label">
            {{ t('options_report_import_label_desc') }}
        </div>
        <div class="input">
            <input type="file" ref="file">
            <el-button round @click="onImport" >{{ t('options_report_import') }}</el-button>
        </div>
        
    </div>
    <div class="section">
        <div class="label">
            {{ t('options_report_export_label_desc') }}
        </div>

        <div class="input">
            <el-button round @click="onExport">{{ t('options_report_export') }}</el-button>
        </div>
        
    </div>

    <div class="section">
        <div class="label">
            {{ t('optionsDeleteReadingHistoryLabelDesc') }}
        </div>
        <div class="input">
            <div class="option">
              <p class="warning">{{ t('optionsDeleteReadingHistoryActionWarning') }}</p>
              <el-button round @click="onDelete">{{ t('optionsDeleteReadingHistoryAction') }}</el-button>
          </div>
        </div>
        
    </div>
  </div>

</template>
