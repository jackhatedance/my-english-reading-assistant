import { Progress } from './Progress.js'

// index data version should always match below program version. any change to index building should increase it.
export const INDEX_VERSION = 24;

const jobName = chrome.i18n.getMessage('options_dictionary_detail_job_parse');
//sleepWorkRatio: sleep time / work time. the larger the slower
async function generateIndex(dictionary, updateProgress, sleepWorkRatio = 0.1) {
    let map = {};

    
    let keys = dictionary.getKeys();
    let total = keys.length;
    let progress = new Progress(jobName, total, updateProgress);
    progress.start();

    for (let key of keys) {
        let result = dictionary.lookup(key, { fromRaw: true, autoJumpLink: false, outputFormats: ['json'] });
        map[key] = result;

        await progress.count();
    }

    return {
        version: INDEX_VERSION,
        data: map,
    };
}

export { generateIndex }