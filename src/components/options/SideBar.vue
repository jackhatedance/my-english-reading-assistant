
<script setup>
const t = chrome.i18n.getMessage;

const init = async () => {

};

init();
</script>

<template>
    <div class="sidebar">
        <div class="sidebar-top">
            <h1>{{ t('optionsTitle') }}</h1>
        </div>
        <div class="sidebar-middle">
            <nav>
                <RouterLink data-testid="general" to="/general">{{ t('optionsGeneralLabel') }}</RouterLink>
                <RouterLink to="/vocabulary">{{ t('optionsSectionVocabularyTitle') }}</RouterLink>
                <RouterLink to="/notes">{{ t('optionsEditNotesLabel') }}</RouterLink>
                <RouterLink to="/root-and-affix">{{ t('optionsRootAndAffixLabel') }}</RouterLink>
                <RouterLink to="/report">{{ t('optionsReportLabel') }}</RouterLink>
                <RouterLink to="/dictionary">{{ t('optionsSectionDictionaryTitle') }}</RouterLink>
                <RouterLink to="/unrecognized-words">{{ t('optionsUnrecognizedWordsLabel') }}</RouterLink>
            </nav>              
        </div>

        <div class="sidebar-bottom"></div>
    </div>
    
</template>
<style>
.sidebar {
    background-color: rgb(229, 229, 229);
    flex: 0 0 200px;
    height: 100%;
    padding-left: 10px;
}

.sidebar-middle {
    text-align: left;

}

nav {
    display: grid;
    a {
        font-size: large;
        padding: 5px 0 5px 10px;
        border-radius: 8px 0 0 8px;

        text-decoration: none;
        color: #666666;

        &.active {
            background-color: white;
        }
    }
}

.sidebar-bottom {
    position: fixed;
    bottom: 0px;
}

</style>