<script setup>
import Tooltip from './Tooltip.vue'

const props = defineProps({
    content: String,
    linkType: String,
    linkKeyword: String,
});
const t = chrome.i18n.getMessage;
</script>

<template>
    <Tooltip v-bind="$props" placement="top-start" :content="t('popup_page_refresh_required')">
        <span class="refresh-tooltip">
            ⟳
        </span>
    </Tooltip>
</template>
<style>

.refresh-tooltip {
    color: red;
}

</style>
