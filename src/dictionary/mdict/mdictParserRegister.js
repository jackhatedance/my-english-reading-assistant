import { NewOxfordEcDualParser } from './parser/NewOxfordEcDualParser.js'
import { Oalecd9eParser } from './parser/Oalecd9eParser.js'
import { YhdParser } from './parser/YhdParser.js'

const parsers = [ new NewOxfordEcDualParser(), new Oalecd9eParser(), new YhdParser() ];

function findMdictParser(name) {
    return parsers.find(item => item.constructor.name == name);    
}


export { findMdictParser }