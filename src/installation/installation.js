
async function getFirstInstallationTime(){
    const result = await chrome.storage.local.get('installation');  

    let firstTime = result.installation?.firstTime;
    return firstTime;
}

async function saveFirstInstallationTime() {

    let firstTime = await getFirstInstallationTime();
    if(firstTime){
        return;
    }

    let installation = result.installation;
    if(!installation){
        installation = {};
    }
    
    firstTime = Date.now();
    installation.firstTime = firstTime;

    await chrome.storage.local.set({ installation });
        
}

export { getFirstInstallationTime, saveFirstInstallationTime }