
function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

function dataURItoArrayBuffer(dataURI) {
    const base64 = dataURI.split(',')[1];
    const binaryString = atob(base64);
    const arrayBuffer = new ArrayBuffer(binaryString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
    }
    return arrayBuffer;
}

function dataURItoText(dataURI) {
    const base64 = dataURI.split(',')[1];
    const binaryString = atob(base64);
    const arrayBuffer = new ArrayBuffer(binaryString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
    }
    const decoder = new TextDecoder();
    const text = decoder.decode(uint8Array);

    return text;
}


function base64toText(base64, charset="UTF-8") {
    const binaryString = atob(base64);
    const arrayBuffer = new ArrayBuffer(binaryString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
    }
    const decoder = new TextDecoder(charset);
    const text = decoder.decode(uint8Array);

    return text;
}

function textToBase64(str) {
    return Buffer.from(str).toString('base64');    
}

async function readFileAsync(file, type) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result);
        };

        reader.onerror = (error) => {
            reject(error);
        };

        if (type == 'arrayBuffer') {
            reader.readAsArrayBuffer(file);
        } else if (type == 'dataUrl') {
            reader.readAsDataURL(file);
        } else {
            reader.readAsText(file);
        }
    });
}

export { dataURLtoBlob, dataURItoArrayBuffer, dataURItoText, base64toText, textToBase64, readFileAsync }