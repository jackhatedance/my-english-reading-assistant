
<script setup>

const props = defineProps({
    
});

const init = async () => {

};

init();
</script>

<template>
    <div class="tab-content">
        <slot></slot>
    </div>
</template>
<style>
.tab-content {
    flex: 1 1;
    height: 100%;

    .sections {
        width: 80%;
        padding: 10px;
        margin-left: auto;
        margin-right: auto;

        .section {
            width: 100%;
            display: flex;
            padding: 10px;

            .label {
                width: 30%;
                vertical-align: middle;
                padding: 5px;
            }
            .input {
                width: 40%;  
                padding: 5px;      
            }
            .action {
                width: 30%;  
                padding: 5px;      
            }
        }

        .section:not(:first-child) {
            border-top: solid 1px rgb(227, 225, 225);
        }
        
    }
}
</style>