const SELECT_OPTION_UNSET = 'unset';

const trueFalseNullDict = {
    "true": true,
    "false": false,
    "unset": null,
}

/**
 * e.g. 'unset' -> ''
 * @param {*} elOption 
 * @param {*} valueForUnset 
 * @returns 
 */
function convertUnsetToValue(elOption, valueForUnset){
    return (elOption==SELECT_OPTION_UNSET)? valueForUnset: elOption;
}

/**
 * e.g. '' -> 'unset
 * @param {*} value 
 * @param {*} valueForUnset 
 * @returns 
 */
function convertValueToUnset(value, valueForUnset){
    return (value == valueForUnset)? SELECT_OPTION_UNSET: value;
}

function getValueByOption(option, dict){
    if(dict.hasOwnProperty(option)){
        return dict[option];
    }
}

function getOptionByValue(value, dict){
    for(const [key, value2] of Object.entries(dict)){
        if(value == value2){
            return key;
        }
    }
}

export { SELECT_OPTION_UNSET, convertUnsetToValue, convertValueToUnset, trueFalseNullDict, getValueByOption, getOptionByValue }