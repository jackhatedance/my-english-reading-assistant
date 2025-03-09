
<script setup>

const props = defineProps({
    isActive: Boolean,  
});

const init = async () => {

};

init();
</script>

<template>
    <div :class="{'tab-content': true, active: isActive}">
        <slot></slot>
    </div>
</template>
<style>


</style>