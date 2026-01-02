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
    <div id="notes-wrapper">

        <Notes :items="props.notes" >

        </Notes>

    </div>
    
</template>
<style>
#notes-wrapper .notes-container .notes {
    height: 340px;
    overflow: auto;
    overscroll-behavior-y: contain;

    text-align: left;

}



</style>
