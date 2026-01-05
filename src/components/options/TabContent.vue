
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
        padding: 10px;
        margin-left: auto;
        margin-right: auto;

        .section {
            width: 100%;
            display: flex;
            padding: 0;

            .label {
                width: 250px;
                vertical-align: middle;
                padding: 5px;
            }
            .input {
                flex-grow: 1;
                padding: 5px;   
                min-width: 450px;  
                max-width: 550px;   

                input, select {
                    margin: 5px;
                }
            }
            .action {
                width: 150px;  
                padding: 5px;      
            }
        }

        .section:not(:first-child) {
            border-top: solid 1px rgb(227, 225, 225);
        }
        
    }
}
</style>