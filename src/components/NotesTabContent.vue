<script setup>
import Notes from './Notes.vue';


const props = defineProps({
    notes: Array

});



const init = async () => {

};

init();
</script>

<template>
    <Notes :items="props.notes">

    </Notes>

</template>
