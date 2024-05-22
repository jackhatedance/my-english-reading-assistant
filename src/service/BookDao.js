
import { BaseDao } from './BaseDao.js';


class BookDao extends BaseDao {

    constructor(){
        let fields = ['isbn','title','urlPattern'];
        super('book', fields, 'isbn');
    }

}

export { BookDao };