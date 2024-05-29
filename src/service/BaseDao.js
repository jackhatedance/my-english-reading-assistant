import { chunkedRead, chunkedWrite } from '../chunk.js';

class BaseDao {

    constructor(type, fields, key){
                
        this._type = type;
        this._fields = fields;
        this._key = key;
    }

    async read() {
        return await chunkedRead(this._type);
    }

    async write(data) {
        return await chunkedWrite(this._type, data);
    }

    async getAll() {
        let objects = await this.read();
        //console.log('get objects:' + JSON.stringify(objects));

        if (!Array.isArray(objects)) {
            objects = [];
        }
    
        //fix old data
        for(let object of objects){
            
        }
    
        return objects;
    }

    async setAll(objectArray){
        //console.log('get objects:' + JSON.stringify(objectArray));
        await this.write(objectArray);
    }

    async getAllAsMap() {
        let array = await this.getAll();
        //console.log('get books:'+ JSON.stringify(array));
        let map = this.arrayToMap(array);
        return map;
    }

    async  get(key) {        
        let map = await this.getAllAsMap();
    
        return map.get(key);
    }

    async delete(key) {
        //console.log('delete book');
    
        let map = await this.getAllAsMap();
        map.delete(key);
    
        let objectArray = this.mapToArray(map);
        
        await this.write(objectArray);
    }

    getKey(object){
        return object[this._key];
    }

    async set(object) {
        //console.log('setBook');
        let cleanObject = this.cleanCopy(object);
    
        let key = this.getKey(object);
        let map = await this.getAllAsMap();
        map.set(key, cleanObject);
    
        let array = this.mapToArray(map);
        //console.log('write books:'+ JSON.stringify(bookArray));
        await this.write(array);
    }

    cleanCopy(src) {
        let dst = {};
        for(let field of this._fields){
            dst[field] = src[field];
        }
        return dst;
    }

    arrayToMap(array) {

        const map = new Map();
        array.forEach((obj) => {
            let key = this.getKey(obj);
            map.set(key, obj);
        });
        return map;
    }

    mapToArray(map) {
        let array = [];
        for (let key of map.keys()) {
            let object = map.get(key);
            array.push(object);
        }
        return array;
    }

};

export { BaseDao };