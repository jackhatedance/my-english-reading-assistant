
<script setup>
const t = chrome.i18n.getMessage;

var version = '';
var releaseNotesUrl = '';

const init = async () => {

    var manifestData = chrome.runtime.getManifest();
    version = manifestData.version;
    let tag = version.replaceAll('.','');
    releaseNotesUrl = chrome.runtime.getURL('release-notes.html#'+tag);
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
                <RouterLink data-testid="root-and-affix" to="/root-and-affix">{{ t('optionsRootAndAffixLabel') }}</RouterLink>
                <RouterLink to="/report">{{ t('optionsReportLabel') }}</RouterLink>
                <RouterLink to="/dictionary">{{ t('optionsSectionDictionaryTitle') }}</RouterLink>
                <RouterLink data-testid="unrecognized-words" to="/unrecognized-words">{{ t('optionsUnrecognizedWordsLabel') }}</RouterLink>
            </nav>              
        </div>

        <div class="sidebar-bottom">
            <div class="sns">
                <ul class="sns-list">
                    <li>
                        <a target="_blank" href="https://space.bilibili.com/410137399" title="Bilibili"><img src="icons/bilibili.png" alt="Bilibili"></a>
                    </li>
                    <li>
                        <a target="_blank" href="https://tieba.baidu.com/f?ie=utf-8&kw=%E6%88%91%E7%9A%84%E8%8B%B1%E6%96%87%E9%98%85%E8%AF%BB%E5%8A%A9%E6%89%8B&fr=search" title="贴吧"><img src="icons/tieba.png" alt="Tieba"></a>
                    </li>
                    <li>
                        <a target="_blank" href="https://github.com/jackhatedance/my-english-reading-assistant/issues/new" title="Github"><img src="icons/github.jpeg" alt="Github"></a>
                    </li>
                    <li>
                        <a target="_blank" href="https://www.zhihu.com/people/ding-jack-94" title="知乎"><img src="icons/zhihu.png" alt="Zhihu"></a>
                    </li>
                </ul>
            </div>
            <hr></hr>
            <div class="version">
                <p>{{ t('options_sidebar_bottom_version') }} <a :href="releaseNotesUrl">{{ version }}</a></p>
            </div>
        </div>
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
    width: 190px;
    text-align: center;
    .sns-list {
        
        display: inline-flex;
        padding: 0;
        margin: 0;
        
        li {
            list-style: none;
            padding: 5px;
        }
        img {
            width: 20px;
            height: 20px;
        }
        
    }
}

</style>