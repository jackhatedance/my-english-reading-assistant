
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
    if(timeRange==='all'){
        return activities;
    } 
    
    let startTime, endTime;
    let now = new Date();
    if(timeRange==='this_year'){
        startTime = new Date(now.getFullYear(), 0, 1);
    } else if(timeRange==='this_month'){
        startTime = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if(timeRange==='this_week'){
        now.setDate(now.getDate() - now.getDay());
        let then = now;
        startTime = new Date(then.getFullYear(), then.getMonth(), then.getDate());
    } else if(timeRange==='last_7_days'){
        now.setDate(now.getDate() - 7);
        let then = now;
        startTime = new Date(then.getFullYear(), then.getMonth(), then.getDate());
    } else if(timeRange==='last_30_days'){
        now.setDate(now.getDate() - 30);
        let then = now;
        startTime = new Date(then.getFullYear(), then.getMonth(), then.getDate());
    } else if(timeRange==='last_360_days'){
        now.setDate(now.getDate() - 360);
        let then = now;
        startTime = new Date(then.getFullYear(), then.getMonth(), then.getDate());
    }
    endTime = now;

    let filtered = activities.filter(item => item.startTime>=startTime);
    return filtered;
}

export { formatDuration, filterActivityByTimeRange }