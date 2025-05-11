import { findMdictProfile } from './mdictProfileRegister.js'
import { findDefinitionParser } from './mdictParserRegister.js'

function findParser(rawMeta){
    let profile = findMdictProfile(rawMeta);
    if(profile){
        this.definitionParser = findDefinitionParser(profile.parser);
        if(!this.definitionParser){
            //console.error(`parser not found`);    
        }
    }else{
        //console.error(`profile not found`);
    }   
}

export { findParser }