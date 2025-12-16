<script setup>
import { ref, provide } from 'vue';

const t = chrome.i18n.getMessage;

const minTipsNumber = 1;
const maxTipsNumber = 5;

function getTipMessageKey(id){
  return `popup_tips_${id}`;
}

function getRandomTip(){
  let min = minTipsNumber;
  let max = maxTipsNumber;
  let tipId = Math.floor(Math.random() * (max - min + 1) + min);
  let key = getTipMessageKey(tipId);
  let message = t(key);
  return message;
}


const init = async () => {

};


init();
</script>

<template>
    <div id="nothing-to-do">
        <br>
        <h2>{{ t('popupNothingToDoTitle') }}</h2>
        <img src="icons/nothing-to-do.png" width="277px">
      <div class="tips">
        <h3>{{ t('popup_tips') }}</h3>
        <p>{{ getRandomTip() }}</p>
      </div>    
    </div>
      
</template>
<style>

#nothing-to-do {
  background-color: white;

  .tips {
    border-radius: 5px;
    border: 1px solid #508cc7; 
  }

}
</style>