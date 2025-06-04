import { Progress } from './Progress.js'

// index data version should always match below program version. any change to index building should increase it.
export const INDEX_VERSION = 29;
export const JSON_SCHEMA_MAJOR_VERSION = 1;

const jobName = chrome.i18n.getMessage('options_dictionary_detail_job_parse');

function findDefinition(entries){
    if(!entries){
        return null;
    }

    for(let entry of entries){
        for(let definitionGroup of entry.definitionGroups){
            for(let definition of definitionGroup.definitions){
                let text = definition.text;
                if(text && text.length > 0){
                    return definition;
                }
            }
        }
    }
    
    return null;    
}

//sleepWorkRatio: sleep time / work time. the larger the slower
async function generateIndex(dictionary, updateProgress, sleepWorkRatio = 0.1) {
    let map = {};

    
    let keys = dictionary.getKeys();
    let total = keys.length;
    let progress = new Progress(jobName, total, updateProgress);
    progress.start();

    for (let key of keys) {
        let result = dictionary.lookup(key, { fromRaw: true, autoJumpLink: false, outputFormats: ['json'] });
        
        let definition = findDefinition(result.json);
        if(definition){
            map[key] = result;
        }else{
            console.log(`no definition found for key:${key}`);
        }

        await progress.count();
    }

    return {
        version: INDEX_VERSION,
        schemaVersion: dictionary.definitionParser.jsonSchemaVersion,
        parser: {
            name: dictionary.definitionParser.name,
            version: dictionary.definitionParser.version
        },
        data: map,
    };
}

export { generateIndex }