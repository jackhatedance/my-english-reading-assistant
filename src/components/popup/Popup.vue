<script setup>
import { ref, provide, watch } from 'vue';
import Header from './Header.vue';
import Settings from './Settings.vue';
import NothingToDo from './NothingToDo.vue';
import { getOptionsFromCache } from '../../service/optionService.js';

const t = chrome.i18n.getMessage;

const props = defineProps({
    gQueryParams: Object,   
});

provide('gQueryParams', props.gQueryParams);

const pageInfo = ref();
const showSettings = ref(false);
const showNothingToDo = ref(false);
const options = ref();

watch(() => pageInfo.value, (newValue) => {
  if(newValue === null) {
    showSettings.value = false;
    showNothingToDo.value = true;
  } 
});

function onReloadPageInfo(){

}

function getPageInfo(resolve){
    // Communicate with content script of
    // active tab by sending a message
    let queryOptions = { active: true, currentWindow: true };
    if(props.gQueryParams.index){
        let index = parseInt(props.gQueryParams.index);
        queryOptions = { index: index };
    }

    chrome.tabs.query(queryOptions, (tabs) => {
        console.log(`query tab`);
        console.log(JSON.stringify(tabs));
        const tab = tabs[0];

        chrome.tabs.sendMessage(
            tab.id,
            {
                type: 'GET_PAGE_INFO',
                payload: {            
                },
            },
            (response) => {
                if(response){
                    console.log('getPageInfo:'+JSON.stringify(response));
                    resolve(response.pageInfo?response.pageInfo:null);
                }else {
                    resolve(null);
                }
        });
    });
}

const init = async () => {
    options.value = getOptionsFromCache();
    getPageInfo((_pageInfo) => {
      pageInfo.value = _pageInfo;
    });
};


init();
</script>

<template>
    <div class="options-container">
        <Header :options="options"></Header>
        <Settings v-if="pageInfo" :pageInfo="pageInfo" :options="options" @reload-page-info="onReloadPageInfo"></Settings>
        <NothingToDo v-if="pageInfo === null"></NothingToDo>
    </div>
</template>
<style>
/* normalize css starts here */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
/* normalize css ends here */

html {
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial,
    sans-serif;
  color: #222;
}

body {
  width: 350px;
}

.app {
  height: 100%;
  min-height: 300px;
  display: flex;
  align-items: center;
  flex-direction: column;
  text-align: center;
  padding: 10px;
  
  >div{
    width: 100%;
  }
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 12px;
}

code {
  font-size: 12px;
  font-family: inherit;
  background-color: rgba(254, 237, 185, 0.3);
  padding: 2px 4px;
  border-radius: 2px;
}


.button {
  border: 0;
  display: inline-block;
  padding: 10px 20px;
  margin-right: 4px;
  margin-left: 4px;
  color: white;
  background-color: #26a890;
  font-size: 16px;
  cursor: pointer;
  border-radius: 4px;
  text-decoration: none;
  transition: transform 0.2s ease;
  user-select: none;
}

.button:focus {
  outline: none;
}

.button:hover {
  transform: scale(1.1);
}

.divider {
  margin: 30px auto 25px;
  width: 50px;
  border: 0.5px dashed #000;
  opacity: 0.1;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  font-size:xx-large;
  margin: 10px;
}

.switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #26a890;
}

input:focus + .slider {
  box-shadow: 0 0 1px #26a890;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.popup-settings {
  border: solid 1px;
  padding: 10px;
  div {
    padding: 5px;
    clear: both;
  }

  .footnote {
    font-size: xx-small;

    .red{
      color: red;
    }
  }
}

#pageSection{
  display: block;
}

#options-container {
  width:100%;
  text-align:right;

  a img {
    width: 20px;
    height: 20px;
  }
}

.field {
  text-align: left;
  

  .red{
    color: red;
  }

  input {
    float: right;
    width: 4em;
    height: 20px;
    margin-left: 5px;
  }
  select {
    float: right;
    width: 4em;
    margin-left: 5px;
  }
}

#additionalDictionaries {
  width: 45%;
}

#nothing-to-do {
  
  .quick-actions {
    .title {
      text-align: left;
    }
    .actions {
      li {
        list-style: none;
        font-size: medium;
        margin: 4px;
        text-align: left;
      }
    }
  }
}

</style>