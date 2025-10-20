import { BookDao } from './BookDao.js';
import wcmatch from 'wildcard-match';

const bookDao = new BookDao();


async function getBook(isbn){
    let book = await bookDao.get(isbn);
    //console.log();
    return book;
}

async function deleteBook(isbn){
    await bookDao.delete(isbn);
}

async function getAllBooks(){
    return await bookDao.getAll();
}

async function searchBookByUrl(url, books) {
    if(!books){
        books = await getAllBooks();
    }
    
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

export { getAllBooks, getBook, deleteBook, searchBookByUrl };