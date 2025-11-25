<script setup>
import Tooltip from './Tooltip.vue'

const props = defineProps({
    content: String,
    linkType: String,
    linkKeyword: String,
});

</script>

<template>
    <Tooltip v-bind="$props" placement="top-start"  effect="dark" >
        ⓘ
    </Tooltip>
</template>
