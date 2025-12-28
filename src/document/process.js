export const STEP_CHANGE_MEA_STYLE = "changeMeaStyle";
export const STEP_TOKENIZE_TEXT_NODE = "tokenizeTextNode";
export const STEP_ADD_DOCUMENT_EVENT_LISTENER = "addDocumentEventListener";
export const STEP_PARSE_DOCUMENT = "parseDocument";
export const STEP_ADD_WORD_LISTENER = "addWordHoverListener";

function canProcessStep(processStepsOptions, step){
    if(processStepsOptions?.ignoreSteps != null){
        if(processStepsOptions.ignoreSteps.includes(step)){
            return false;
        }

    }

    return true;
}

export { canProcessStep }