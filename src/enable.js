const ENABLE_DEFAULT_OPTION_NONE = 'none';
const ENABLE_DEFAULT_OPTION_ALL = 'all';
const ENABLE_DEFAULT_OPTION_ENGLISH = 'english';

function isEnglish(pageLanguage){
    let isEnglishPage = false;
    if (pageLanguage === 'en' || pageLanguage.startsWith('en-')) {
        isEnglishPage = true;
    }
    return isEnglishPage;
}

function getEnabled(globalPolicy, sitePolicy, pageLanguage){
    let policy = globalPolicy;
    if(sitePolicy){
        policy = sitePolicy;
    }

    let enabled = false;
    if(policy == ENABLE_DEFAULT_OPTION_ALL){
        enabled = true;
    } else if(policy == ENABLE_DEFAULT_OPTION_ENGLISH){
        let isEnglishPage = isEnglish(pageLanguage);
          
        if(isEnglishPage){
            enabled = true;
        }        
    } 
    return enabled;
}

export { getEnabled, ENABLE_DEFAULT_OPTION_NONE, ENABLE_DEFAULT_OPTION_ALL, ENABLE_DEFAULT_OPTION_ENGLISH }