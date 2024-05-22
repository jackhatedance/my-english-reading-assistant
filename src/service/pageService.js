import { PageDao } from './PageDao.js';
import { BookDao } from './BookDao.js';
import { searchBookByUrl } from './bookService.js';

const pageDao = new PageDao();
const bookDao = new BookDao();

async function getIsbn(url){
    let page = await pageDao.get(url);
    let result;
    if(!page){
        let book = await searchBookByUrl(url);
        if(book){
            result = book.isbn;
        }
    } else {
        result = page.isbn;
    }
    return result;
}

export { getIsbn };