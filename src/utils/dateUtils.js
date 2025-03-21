function humanRemain(milliSeconds) {
    let mydate = new Date(milliSeconds);

    let s = '';

    let hours = mydate.getUTCHours();
    if (hours > 0) {
        s += hours + "h";
    }

    let minutes = mydate.getUTCMinutes();
    if (minutes > 0 || s != '') {
        s += minutes + "m"
    }

    let seconds = mydate.getUTCSeconds();
    if (seconds > 0 || s != '') {
        s += seconds + "s"
    }

    return s;
}

export { humanRemain }
