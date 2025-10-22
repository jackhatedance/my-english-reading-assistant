
function formatDuration(milliseconds) {

    let seconds = Math.floor(milliseconds) / 1000;

    //var d = Math.floor(seconds / (3600*24));
    var h = Math.floor(seconds / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);

    let fh = (h+"").padStart(2, '0');
    let fm = (m+"").padStart(2, '0');
    let fs = (s+"").padStart(2, '0');

    return fh + ":" + fm + ":" + fs;
}

function formatSpeed(speed){
    let speedStr;
    const MAX_SPEED = 350;
    if(speed>MAX_SPEED){
        //impossible, meaningless
        speedStr = '';
    }else{
        speedStr = ''+speed;
    }
    return speedStr;
}

function formatVocabularyChange(change){
    if(change>0){
        return '+'+change;
    }
    
    return ''+change;
}

function filterActivityByTimeRange(activities, timeRange){
    
    let startTime, endTime;
    if(timeRange==null){
        startTime = new Date(1970,0,1);
        endTime = new Date();
    } else{
        startTime = timeRange[0];
        endTime = timeRange[1];
    }
    
    let filtered = activities.filter(item => item.endTime>startTime && item.endTime<endTime);
    return filtered;
}

function getDocumentOfUrl(url){

    let path = url;
        
    let index = path.lastIndexOf('/');
    let doc = path.substring(index+1);

    const MAX_DOC_LEN = 30;
    if(doc.length>MAX_DOC_LEN){
        doc= doc.substring(0,MAX_DOC_LEN) + '...';
    }

    return doc;
}


export { formatDuration, filterActivityByTimeRange, formatVocabularyChange, formatSpeed, getDocumentOfUrl }