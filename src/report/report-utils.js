
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

function filterActivityByTimeRange(activities, timeRange){
    
    let startTime, endTime;
    if(timeRange==null){
        startTime = new Date(1970,0,1);
        endTime = new Date();
    } else{
        startTime = timeRange[0];
        endTime = timeRange[1];
    }
    
    let filtered = activities.filter(item => item.startTime>=startTime && item.endTime<endTime);
    return filtered;
}

export { formatDuration, filterActivityByTimeRange }