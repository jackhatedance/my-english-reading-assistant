<script setup>
const props = defineProps({
    id: String,
    isActive: Boolean,
});

const init = async () => {
    
};

init();
</script>

<template>
    <div :id="id" class="tabbody" :class="{active: isActive}">
        <slot></slot>
    </div>
</template>
<style>
.tabbody {
    padding: 5px;
    border-radius: 10px;
}
</style>