<script setup>
import { ElTooltip } from 'element-plus';
import 'element-plus/es/components/tooltip/style/css'
import { ref } from 'vue';
import ExternalLink from './ExternalLink.vue'

const props = defineProps({
    content: String,
    linkType: String,
    linkKeyword: String,
    effect: String,
});

</script>

<template>
    <el-tooltip v-bind="$props" :show-after="200">
        <template #content>
            <p>{{ content }}<ExternalLink v-if="props.linkKeyword" v-bind="$props" :type="props.linkType" :keyword="props.linkKeyword"/></p>
        </template>
        <slot />
    </el-tooltip>
</template>
