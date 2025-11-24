export const FEATURE_NOTE = 'note';

function isFeatureEnabled(siteOptions, key){
    if(key == FEATURE_NOTE){
        return siteOptions.notes.enabled;
    }

    return false;
}


export { isFeatureEnabled }