
<script setup>

const props = defineProps({
    id: String,
    name: String,
    tips: String,
    isActive: Boolean,  
});


const init = async () => {

};

init();
</script>

<template>
    <li :class="{'sidebar-item': true, active: isActive}">
        <a href=# @click="$emit('clickModule', id)">{{ name }}</a>
    </li>
</template>
<style>
.sidebar-item {
    padding: 5px 0 5px 10px;
    border-radius: 8px 0 0 8px;

    
    &.active {
        background-color: white;
    }

    a {
        text-decoration: none;
        color: #666666;
    }
}

</style>