<script setup>
import { ref, computed } from 'vue';
import { getAllBooks, getBook, deleteBook } from '../../../service/bookService.js';
import { saveTextAsFile } from '../../../html-utils.js';
import BookDetail from './BookDetail.vue';


const t = chrome.i18n.getMessage;

const books = ref([]);

const selectedBook = ref();
const selectedBookObject = ref();

const file = ref();



async function onChangeSelectedBook(){
    selectedBookObject.value = await getBook(selectedBook.value)
}

async function onDetailChanged(){
    
}

async function onDelete(){
    let isbn = selectedBook.value;
    await deleteBook(isbn);
    selectedBook.value = null;
    selectedBookObject.value = null;
    await refreshUI();
}

async function refreshUI(){
  books.value = await getAllBooks();

  //let options = await getOptions();

}

const init = async () => {
    
    await refreshUI();
};

init();
</script>

<template>


    <div class="sections book">
        <div class="section">
            <div class="label">
                <p>{{ t('options_section_book_edit_label') }}</p>
            </div>
            <div class="input books">
                <div class="list">
                    <select class="books" v-model="selectedBook" :size="12" @change="onChangeSelectedBook">
                        <option v-for="(book, index) in books" :key="book.isbn" :value="book.isbn">{{ book.title }}</option>
                    </select>  

                </div>
                <BookDetail v-if="selectedBookObject" :book="selectedBookObject" @value-changed="onDetailChanged"></BookDetail>
            </div>
            <div class="action">
                <button @click="onDelete">{{ t('optionsDeleteAdditionalDictionaryAction') }}</button>
            </div>
        </div>

    </div>

</template>
<style>

.sections.book{
  .input.books {

    display: flex;

    * {
      margin-left: 5px;
    }

    .list {
      width: 50%;
    
      .books{
        
        width: 100%;
        overflow-y: auto;
        
      }
    }
    .detail{
      width: 50%;
    }
  }

}
</style>