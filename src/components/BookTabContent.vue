<script setup>
import { ref, watch, onMounted, onBeforeUpdate, onUpdated, computed, inject } from 'vue';
import { PageDao } from '../service/PageDao.js';
import { BookDao } from '../service/BookDao.js';
import { searchBookByUrl } from '../service/bookService.js';

const props = defineProps({
    url: String,
    isBook: Boolean,
    isbn: String,
    title: String,
    urlPattern: String,
    page: Object,
});

const sidepanelBookTabUrlLabel = chrome.i18n.getMessage('sidepanelBookTabUrlLabel');
const sidepanelBookTabIsBookLabel = chrome.i18n.getMessage('sidepanelBookTabIsBookLabel');
const sidepanelBookTabIsbnLabel = chrome.i18n.getMessage('sidepanelBookTabIsbnLabel');
const sidepanelBookTabTitleLabel = chrome.i18n.getMessage('sidepanelBookTabTitleLabel');
const sidepanelBookTabUrlPatternLabel = chrome.i18n.getMessage('sidepanelBookTabUrlPatternLabel');
const sidepanelBookTabQueryIsbnAction = chrome.i18n.getMessage('sidepanelBookTabQueryIsbnAction');
const sidepanelBookTabDetectAction = chrome.i18n.getMessage('sidepanelBookTabDetectAction');
const sidepanelBookTabSaveAction = chrome.i18n.getMessage('sidepanelBookTabSaveAction');
const sidepanelBookTabDeleteAction = chrome.i18n.getMessage('sidepanelBookTabDeleteAction');
const sidepanelBookTabResetAction = chrome.i18n.getMessage('sidepanelBookTabResetAction');

const pageDao = new PageDao();
const bookDao = new BookDao();

const isBook = ref(props.isBook);
watch(() => props.isBook, (newValue) => {
    isBook.value = props.isBook;
});

const isbn = ref(props.isbn);
watch(() => props.isbn, (newValue) => {
    isbn.value = props.isbn;
});

const title = ref(props.title);
watch(() => props.title, (newValue) => {
    title.value = props.title;
});

const urlPattern = ref(props.urlPattern);
watch(() => props.urlPattern, (newValue) => {
    urlPattern.value = props.urlPattern;
});


onMounted(()=>{
    update(props.url);
});

watch(() => props.url, (newValue) => {
    console.log('url changed:'+ newValue);
    update(newValue);
});

async function update(url){
    let page = await pageDao.get(url);
    if(!page){
        let book = await searchBookByUrl(url);
        if(book){
            //fake
            page = {
                isbn: book.isbn,
            }            
        }
    }
    updatePageUI(page);
    let book;
    if(page){
        book = await bookDao.get(page.isbn);
    }
    updateBookUI(book);
}

function updatePageUI(page){
    if(page){
        isBook.value = true;
        isbn.value = page.isbn;    
    }else {
        isBook.value = false;
        isbn.value = '';
    }
}

function updateBookUI(book){
    if(book){
        title.value = book.title;
        urlPattern.value = book.urlPattern;
    }else{
        title.value = '';
        urlPattern.value = '';
    }
}

function clickSave() {
    console.log('click save');
    let page = {
        url: props.url,
        isBook: isBook.value,
        isbn: isbn.value,
    };

    let book = {
        isbn: isbn.value,
        title: title.value,
        urlPattern: urlPattern.value,
    }

    console.log('page:'+ JSON.stringify(page));
    console.log('book:'+ JSON.stringify(book));
    pageDao.set(page);
    bookDao.set(book);
}

function clickDelete() {
    console.log('click save');
    let page = {
        url: props.url,
        isBook: isBook.value,
        isbn: isbn.value,
    };

    let book = {
        isbn: isbn.value,
        title: title.value,
        urlPattern: urlPattern.value,
    }

    pageDao.delete(props.url);
    bookDao.delete(isbn.value);

    update(props.url);
}

async function clickQuery() {
    let book = await bookDao.get(isbn.value);
    updateBookUI(book);
}

async function clickDetect() {
    console.log('page:'+ JSON.stringify(props.page));
    isbn.value = props.page.isbnsInContent.join(',');
    title.value = props.page.title;
    urlPattern.value = props.url;

    changeIsbn();
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
    
    <div class="book">
        
            <label>{{ sidepanelBookTabUrlLabel }}</label>
            <div class="input">
                <div class="url">{{ props.url }}</div>
            </div>
        
        
            <label>{{ sidepanelBookTabIsBookLabel }}</label>
            <div class="input">
                <input type="checkbox" v-model="isBook">
            </div>
        

        
            <label>{{ sidepanelBookTabIsbnLabel }}</label>
            <div class="input">
                <input class="isbn" v-model="isbn" @change="changeIsbn">
                <button class="query-isbn button" @click="clickQuery">{{ sidepanelBookTabQueryIsbnAction }}</button>
            </div>
        

        
            <label>{{ sidepanelBookTabTitleLabel }}</label>
            <div class="input">
                <textarea class="title" v-model="title"></textarea>
            </div>
        

        
            <label>{{ sidepanelBookTabUrlPatternLabel }}</label>
            <div class="input">
                <textarea class="urlPattern" v-model="urlPattern" ></textarea>
            </div>
        

        <div class="line">
            <button class="button" @click="clickDetect">{{ sidepanelBookTabDetectAction }}</button>
            <button class="button" @click="clickSave">{{ sidepanelBookTabSaveAction }}</button>
            <button class="button" @click="clickDelete">{{ sidepanelBookTabDeleteAction }}</button>
            <button class="button" @click="clickReset">{{ sidepanelBookTabResetAction }}</button>
        </div>
    </div>

</template>
<style>
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