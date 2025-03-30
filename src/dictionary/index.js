// index data version should always match below program version. any change to index building should increase it.
export const INDEX_VERSION = 19;

//sleepWorkRatio: sleep time / work time. the larger the slower
async function generateIndex(dictionary, updateProgress, sleepWorkRatio = 0.1) {
    let map = {};

    
    let i = 0;
    let startTime = Date.now();
    let batchStartTime = Date.now();
    let lastRateText = '';
    let keys = dictionary.getKeys();
    let total = keys.length;
    for (let key of keys) {
        let result = dictionary.lookup(key, { fromRaw: true, autoJumpLink: false, outputFormats: ['json'] });
        map[key] = result;

        if (i % 100 == 0) {
            let batchWorkTime = Date.now() - batchStartTime;
            let batchSleepTime = batchWorkTime * sleepWorkRatio; 
            //reduce CPU usage
            await new Promise(resolve => setTimeout(resolve, batchSleepTime));
            batchStartTime = Date.now();
        }

        i++;
        let rate = i / total;
        let milliSecondsElapsed = Date.now() - startTime;
        let milliSecondsRemain = milliSecondsElapsed / rate - milliSecondsElapsed;

        let rateText = (rate * 100).toFixed(1);
        if (rateText !== lastRateText) {
            if (updateProgress) {
                updateProgress({ rate: rate, remain: milliSecondsRemain });
            }

            lastRateText = rateText;
        }
    }

    return {
        version: INDEX_VERSION,
        data: map,
    };
}

export { generateIndex }