function startOperation(name){
    let startTime = new Date().getTime();
    let operation = { name, startTime };
    return operation;
}

function endOperation(operation){
    let endTime = new Date().getTime();
    operation.endTime = endTime;
    return operation;
}

function getOperationTime(operation){
    let diff = operation.endTime - operation.startTime;
    return diff;
}

function operationToString(operation){
    let time = getOperationTime(operation);
    let formattedTime = (time/1000).toFixed(1);
    return `operation ${operation.name} cost ${formattedTime}s`;
}

export { startOperation, endOperation, getOperationTime, operationToString }