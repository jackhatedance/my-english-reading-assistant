const SWITCH_MODE_OPTION_OFF = 'off';
const SWITCH_MODE_OPTION_ON = 'on';
const SWITCH_MODE_OPTION_AUTO = 'auto';

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
    if(policy == SWITCH_MODE_OPTION_ON){
        enabled = true;
    } else if(policy == SWITCH_MODE_OPTION_AUTO){
        let isEnglishPage = isEnglish(pageLanguage);
          
        if(isEnglishPage){
            enabled = true;
        }        
    } 
    return enabled;
}

export { getEnabled, SWITCH_MODE_OPTION_OFF, SWITCH_MODE_OPTION_ON, SWITCH_MODE_OPTION_AUTO }