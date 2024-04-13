<script setup>
const props = defineProps({
    id: String,
});

const init = async () => {
    
};

init();
</script>

<template>
    <div :id="id" class="tabcontent">
        <slot></slot>
    </div>
</template>
