import log from 'loglevel'

const gLogger = log.getLogger("partial-tokenization");

export const PARTIAL_TOKENIZATION_MODE_UNSET = 'unset';
export const PARTIAL_TOKENIZATION_MODE_OFF = 'off';
export const PARTIAL_TOKENIZATION_MODE_ON = 'on';
export const PARTIAL_TOKENIZATION_MODE_AUTO = 'auto';


function isPartialTokenizationEnabled(globalPolicy, sitePolicy, contentLength, largeContentStartLength){
    let policy = globalPolicy;
    if(sitePolicy){
        policy = sitePolicy;
    }

    let enabled = false;
    if(policy == PARTIAL_TOKENIZATION_MODE_ON){
        enabled = true;
    } else if(policy == PARTIAL_TOKENIZATION_MODE_AUTO){
        let bLargeContent = contentLength >= largeContentStartLength;
          
        if(bLargeContent){
            enabled = true;
        }        
    } 

    let enabledStr = enabled? 'on':'off';
    gLogger.debug(`partial tokenization is ${enabledStr}`);

    return enabled;
}

export { isPartialTokenizationEnabled }