<script setup>
import { ref, computed } from 'vue';
import { getAllBooks, getBook, saveAllBooks, deleteBook } from '../../../service/bookService.js';
import { saveTextAsFile } from '../../../html-utils.js';
import BookDetail from './BookDetail.vue';
import { ElButton } from 'element-plus'
import 'element-plus/es/components/button/style/css'

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

function onImport() {
    
    const files = file.value.files;
    if(files.length == 0){
        alert(t('choose_file_first'));
        return;
    }
    
    const _file = files[0];

    var reader = new FileReader();
    reader.onload = function(e){
        let books2 = JSON.parse(e.target.result);
        saveAllBooks(books2);
        books.value =books2;
    }
    reader.readAsText(_file);

}

async function onExport() {
    let books  = await getAllBooks();
    let json = JSON.stringify(books);

    saveTextAsFile(json, 'books', 'json');
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
                    <BookDetail v-if="selectedBookObject" :book="selectedBookObject" @value-changed="onDetailChanged"></BookDetail>
                </div>
                

                <div>
                    <el-button type="primary" @click="onDelete">{{ t('optionsDeleteAdditionalDictionaryAction') }}</el-button>

                </div>
            </div>
            <div class="action">
                
            </div>
        </div>

        <div class="section">
            <div class="label">
                {{ t('options_report_import_label_desc') }}
            </div>
            <div class="input">
                <input type="file" ref="file">
                <el-button type="primary" @click="onImport" >{{ t('options_report_import') }}</el-button>
            </div>
            <div class="action">
                
            </div>
        </div>
        <div class="section">
            <div class="label">
                {{ t('options_report_export_label_desc') }}
            </div>

            <div class="input">
              <el-button type="primary" @click="onExport">{{ t('options_report_export') }}</el-button>
            </div>
            <div class="action">
                
            </div>
        </div>
        
    </div>

</template>
<style>

.sections.book{
  .input.books {

    
    * {
      margin-left: 5px;
    }

    .list {
      display:flex;
      
    
      .books{
        
        width: 50%;
        overflow-y: auto;
        
      }
    }
    .detail{
      width: 50%;
    }
  }

}
</style>