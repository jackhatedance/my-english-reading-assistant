import { NewOxfordEcDualParser } from './parser/NewOxfordEcDualParser.js'
import { YhdParser } from './parser/YhdParser.js'

const parsers = [ new NewOxfordEcDualParser(), new YhdParser() ];

function findMdictParser(name) {
    return parsers.find(item => item.constructor.name == name);    
}


export { findMdictParser }