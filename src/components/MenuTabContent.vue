<script setup>
import { ref, computed, watch, onMounted, onUpdated } from 'vue';
import { MenuItems } from '../menu.js';

const props = defineProps({
    menuItems: Array,

});





</script>

<template>
    <div class="menu-list">
        <ul>
            <li v-show="props.menuItems.includes(MenuItems.MarkAsKnown)"><button @click="$emit('markWord', 'known')">Mark As Known</button></li>
            <li v-show="props.menuItems.includes(MenuItems.MarkAsUnknown)"><button @click="$emit('markWord', 'unknown')">Mark As Unknown</button></li>
            <li v-show="props.menuItems.includes(MenuItems.ClearMark)"><button @click="$emit('markWord', 'clear')">Clear Mark</button></li>
            <li v-show="props.menuItems.includes(MenuItems.Vocabulary)"><button @click="$emit('vocabulary')">Vocabuary</button></li>
            <li v-show="props.menuItems.includes(MenuItems.AddNote)"><button @click="$emit('note', 'add')">Add Note</button></li>
            <li v-show="props.menuItems.includes(MenuItems.ViewNote)"><button @click="$emit('note', 'view')">View/Edit Note</button></li>
        </ul>
    </div>
</template>

<style></style>