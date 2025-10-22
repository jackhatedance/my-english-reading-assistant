<script setup>
import { ref, inject, computed, watch } from 'vue'
import { humanRemain } from '../../../utils/dateUtils.js'


const emits = defineEmits(['value-changed']);

const props = defineProps({
    book: Object,
});


const t = chrome.i18n.getMessage;


const init = async () => {

};

init();
</script>

<template>
    <div class="detail">
        <h3>Detail</h3>
        <div class="fields">
            <label>{{ t('options_section_book_detail_title') }}</label>
            <span>{{ props.book.title }}</span>
                
            <label>{{ t('options_section_book_detail_url_pattern') }}</label>
            <span>{{ props.book.urlPattern }}</span>

        </div>
    </div>
</template>
<style>
.books .detail {
    overflow-wrap: anywhere;
}

.fields {
    display: grid;
    grid-template-columns: auto auto;
    height: fit-content;
    label {
        font-weight: bold;
    }
  }
</style>
