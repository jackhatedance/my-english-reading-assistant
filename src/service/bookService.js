import { BookDao } from './BookDao.js';
import wcmatch from 'wildcard-match';

const bookDao = new BookDao();


async function getBook(isbn){
    let book = await bookDao.get(isbn);
    //console.log();
    return book;
}

async function saveBook(book){
    await bookDao.set(book);
}

async function deleteBook(isbn){
    await bookDao.delete(isbn);
}

async function getAllBooks(){
    return await bookDao.getAll();
}

async function saveAllBooks(books){
    await bookDao.setAll(books);
}

function matchUrl(url, pattern){
    const matcher = wcmatch(pattern);
    return matcher(url);
}

async function searchBookByUrlAsync(url) {
    
    let books = await getAllBooks();
    
    let result;

    //console.log('search book by url:' + url);

    for(let book of books){
        let pattern = book.urlPattern;
        if(pattern){
            let match = matchUrl(url, pattern);
            if(match){
                result = book;

                //console.log('found:'+JSON.stringify(book));

                break;
            }
        }
    }
    return result;
}


function searchBookByUrl(url, books) {
    
    let result;

    //console.log('search book by url:' + url);

    for(let book of books){
        let pattern = book.urlPattern;
        if(pattern){
            const isMatch = wcmatch(pattern);
            let match = isMatch(url);
            if(match){
                result = book;

                //console.log('found:'+JSON.stringify(book));

                break;
            }
        }
    }
    return result;
}

export { getAllBooks, getBook, saveBook, saveAllBooks, deleteBook, searchBookByUrl, searchBookByUrlAsync, matchUrl };