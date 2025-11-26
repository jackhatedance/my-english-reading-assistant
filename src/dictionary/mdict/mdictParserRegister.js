import { Noecd2eParser } from './parser/Noecd2eParser.js'
import { Oalecd9eParser } from './parser/Oalecd9eParser.js'
import { Oald9eParser } from './parser/Oald9eParser.js'
import { YhdParser } from './parser/YhdParser.js'
import { MwalecdParser } from './parser/MwalecdParser.js'

const parsers = [ new Noecd2eParser(), 
    new Oalecd9eParser(), 
    new Oald9eParser(),
    new YhdParser(), 
    new MwalecdParser() ];

function findDefinitionParser(name) {
    return parsers.find(item => item.name == name);    
}


export { findDefinitionParser }