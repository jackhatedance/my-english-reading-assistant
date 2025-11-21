<script setup>
import { ElTooltip } from 'element-plus';
import 'element-plus/es/components/tooltip/style/css'
import { ref } from 'vue';
import ExternalLink from './ExternalLink.vue'

const props = defineProps({
    content: String,
    linkType: String,
    linkKeyword: String,
});

</script>

<template>
    <el-tooltip v-bind="$attrs" :show-after="200">
        <template #content>
            <p>{{ content }}<ExternalLink :type="props.linkType" :keyword="props.linkKeyword"/></p>
        </template>
        <slot />
    </el-tooltip>
</template>
