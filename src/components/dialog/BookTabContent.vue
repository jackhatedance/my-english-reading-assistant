<script setup>
import { ref, watch, onMounted, onBeforeUpdate, onUpdated, computed, inject } from 'vue';
import { BookDao } from '../../service/BookDao.js';
import { searchBookByUrlAsync } from '../../service/bookService.js';
import getfake from 'getfake';

const t = chrome.i18n.getMessage;

const props = defineProps({
    url: String,
    page: Object,
});


const bookDao = new BookDao();




const mode = ref('view');//view, edit

const bookMeta = ref();

const isbn = ref();
const title = ref();
const urlPattern = ref();

const isBook = ref(false);

watch(bookMeta, (newValue) => {
    isBook.value = (newValue != null);
});

onMounted(()=>{
    update(props.url);
});

watch(() => props.url, (newValue) => {
    console.log('url changed:'+ newValue);
    update(newValue);
});

async function update(url){
    let book = await searchBookByUrlAsync(url);
    console.log('update, url:'+url+', book:'+ JSON.stringify(book));
    bookMeta.value = book;
    if(book){
        isbn.value = book.isbn;
        title.value = book.title;
        urlPattern.value = book.urlPattern;
    }else{
        isbn.value = '';
        title.value = '';
        urlPattern.value = '';
    }
}

function clickCreate() {
    mode.value = 'edit';
}

function clickEdit() {
    mode.value = 'edit';
}

async function clickSave() {
    //console.log('click save');
    let book = await searchBookByUrlAsync(props.url);
    if(book){
        await bookDao.delete(book.isbn);
    }

    //console.log('page:'+ JSON.stringify(page));
    //console.log('book:'+ JSON.stringify(book));
    let newBook = {
        isbn: isbn.value,
        title: title.value,
        urlPattern: urlPattern.value
    };
    await bookDao.set(newBook);

    mode.value = 'view';
    await update(props.url);
}

async function clickDelete() {

    await bookDao.delete(isbn.value);

    mode.value = 'view';
    await update(props.url);
}

async function clickAutofill() {
    console.log('page:'+ JSON.stringify(props.page));

    let isbns = props.page.isbnsInContent;
    if(isbns!=null && isbns.length>0){
        isbn.value = isbn[0];
    }else{
        isbn.value = getfake.isbn.v13.any();
    }

    let url = props.page.url;
    
    let bookTitle = props.page.title;
    
    let isFlowoss = isFlowossEpubUrl(url);
    if(isFlowoss){
        let parseResult = parseZlibBookTitle(bookTitle);
        if(parseResult){
            bookTitle = parseResult.title;
        }
    }

    let bookUrlPattern = createUrlPattern(url);


    title.value = bookTitle;
    urlPattern.value = bookUrlPattern;

}

/**
 * e.g. A Clash of Kings (George R. R. Martin) (Z-Library).epub
 * @param title 
 */
function parseZlibBookTitle(text){
    let pattern = /(?<title>.+) \((?<author>[^)]+)\) \(Z-Library\)\.epub/;
    let matchResult = text.match(pattern);
    if(matchResult != null){
        let title = matchResult.groups.title;
        let author = matchResult.groups.author;
        
        return { title, author };            
    }
}

/**
 * e.g. https://app.flowoss.com/#A%20Clash%20of%20Kings%20(George%20R.%20R.%20Martin)%20(Z-Library).epub/OEBPS/Text/C63.xhtml
 * @param url 
 */
function isFlowossEpubUrl(url){
    let isFlowoss = url && url.includes('flowoss.com') && url.includes('.epub');
    return isFlowoss;
}

function createUrlPattern(url){
    let isFlowoss = isFlowossEpubUrl(url);

    
    let index = url.lastIndexOf("/");
    let pattern = url.substring(0, index+1) + "*";

    if(isFlowoss){
        index = url.lastIndexOf("\.epub/");
        pattern = url.substring(0, index+"\.epub/".length) + "**";
    }

    return pattern;
}

async function clickReset() {
    update(props.url);
}

function changeIsbn(){
    isbn.value = isbn.value.replaceAll(/-/g, '');
}

const init = async () => {

};

init();
</script>

<template>
    <div v-show="!isBook && mode =='view'" class="not-book">
        <p>{{ t('sidepanelBookTabNotBook') }}</p>
        <button class="button" @click="clickCreate">{{ t('sidepanelBookTabCreateAction') }}</button>
    </div>
    <div v-show="isBook && mode =='view'" class="book-view">

        <p>{{ t('sidepanelBookTabIsBook') }}</p>
        <div class="book">
        
            <label>{{ t('sidepanelBookTabTitleLabel') }}</label>
            <div class="input">
                {{ title }}
            </div>
            
            <label>{{ t('sidepanelBookTabIsbnLabel') }}</label>
            <div class="input">
                {{ isbn }}
            </div>

            <label>{{ t('sidepanelBookTabUrlPatternSimpleLabel') }}</label>
            <div class="input">
                {{ urlPattern }}
            </div>
        </div>    

        <button class="button" @click="clickEdit">{{ t('sidepanelBookTabEditAction') }}</button>
               
    </div>
    <div v-show="mode =='edit'"  class="book">
        
            <label>{{ t('sidepanelBookTabUrlLabel') }}</label>
            <div class="input">
                <div class="url">{{ props.url }}</div>
            </div>
                
            <label>{{ t('sidepanelBookTabIsbnLabel') }}</label>
            <div class="input">
                <input class="isbn" v-model="isbn" @change="changeIsbn">
            </div>
        

        
            <label>{{ t('sidepanelBookTabTitleLabel') }}</label>
            <div class="input">
                <input type="text" class="title" v-model="title">
            </div>
        

        
            <label>{{ t('sidepanelBookTabUrlPatternLabel') }}</label>
            <div class="input">
                <textarea class="urlPattern" v-model="urlPattern" ></textarea>
            </div>
        

        <div class="line">
            <button class="button" @click="clickAutofill">{{ t('sidepanelBookTabAutofillAction') }}</button>
            <button class="button" @click="clickSave">{{ t('sidepanelBookTabSaveAction') }}</button>
            <button class="button" @click="clickDelete">{{ t('sidepanelBookTabDeleteAction') }}</button>
            <button class="button" @click="clickReset">{{ t('sidepanelBookTabResetAction') }}</button>
        </div>
    </div>

</template>
<style>
.not-book {
    text-align: center;
}

.book-view {
    text-align: center;
    overflow-wrap: anywhere;
}

.book {
    display: grid;
    grid-template-columns: auto auto;
    gap: 10px;


    label {
        display: inline-block;
        text-align: right;
        width: 100px;
    }

    .input {
        width: 80%;
        padding: 2px;           
    }

    .url {
        overflow-wrap: anywhere;
    }
    .isbn {
        width: 60%;
    }
    .query-isbn {
        width: 50px;
    }
    
    .title {
        width: 100%;
    }

    .urlPattern {
        width: 100%;
        height: 100px;
    }


    .line {
        grid-column: 1 / span 2;
        text-align: center;
    }

    button {
        margin: 5px;
    }
}
</style>