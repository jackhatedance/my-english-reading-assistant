import { DICTIONARY_DEFINITION_TYPE_LINK, DICTIONARY_DEFINITION_TYPE_FORM }  from './dictConstants.js'

function getDefinitionTypeAccurate(type){
    if(type == DICTIONARY_DEFINITION_TYPE_LINK){
        return 1;
    } else if(type == DICTIONARY_DEFINITION_TYPE_FORM){
        return 2;
    }

    return 0;
}

function findMostAccurateTypedDefinition(definitions){
    if(!definitions || definitions.length == 0){
        return null;
    }

    let sortedDefinitions = definitions.sort((item1, item2) => {
        let accurate1 = getDefinitionTypeAccurate(item1.type);
        let accurate2 = getDefinitionTypeAccurate(item2.type);
        return accurate2 - accurate1;
    });
    return sortedDefinitions[0];
}

export { getDefinitionTypeAccurate, findMostAccurateTypedDefinition }