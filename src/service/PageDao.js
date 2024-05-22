import { BaseDao } from './BaseDao.js';

class PageDao extends BaseDao {

    constructor(){
        let fields = ['url','isBook','isbn'];
        super('page', fields, 'url');
    }


}

export { PageDao };