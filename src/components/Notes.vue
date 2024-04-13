<script setup>
import Note from './Note.vue';

const props = defineProps({
    items: Array,

});

const init = async () => {

};

init();
</script>

<template>
    <div class="notes">
        <Note v-for="item of props.items" :note="item"></Note>
    </div>
</template>
