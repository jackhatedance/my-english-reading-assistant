<script setup>


const props = defineProps({
    tabId: String,
    name: String,
    isActive: Boolean,
    id: String,
});

const init = async () => {
    
};

init();

</script>

<template>
    <li :data-tab-id="tabId" :class="{active: isActive}" :id="id" @click="$emit('activeTab', props.tabId)">
        <a href=#>{{ name }}</a>
    </li>
</template>
