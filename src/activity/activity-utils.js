function activityToString(activity){
    let startTime = new Date(activity.startTime);
    let startTimeStr = startTime.toLocaleTimeString();
 
    let endTime = new Date(activity.endTime);
    let endTimeStr = endTime.toLocaleTimeString();
    
    let durationStr = formatDuration(activity.duration) 

    return `${startTimeStr} - ${endTimeStr}: ${durationStr}`;
}


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

export { activityToString, formatDuration }