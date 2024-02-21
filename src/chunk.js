export function chunkedWrite(key, value) {
    return new Promise(resolve => {
      if (typeof key !== 'string') key = `${key}`;
      const str = JSON.stringify(value); // consider using LZString's compressToUTF16
      const len = chrome.storage.sync.QUOTA_BYTES_PER_ITEM - key.length - 4;
      const num = Math.ceil(str.length / len);
      const obj = {};
      obj[key + '#'] = num;
      for (let i = 0; i < num; i++) {
        obj[key + i] = str.substr(i * len, len);
      }
      chrome.storage.local.set(obj, resolve);
    });
  }

export function chunkedRead(key) {
    return new Promise(resolve => {
      if (typeof key !== 'string') key = `${key}`;
      const keyNum = key + '#';
      chrome.storage.local.get(keyNum, data => {
        const num = data[keyNum];
        const keys = [];
        for (let i = 0; i < num; i++) {
          keys[i] = key + i;
        }
        chrome.storage.local.get(keys, data => {
          const chunks = [];
          for (let i = 0; i < num; i++) {
            chunks.push(data[key + i] || '');
          }
          const str = chunks.join('');
          resolve(str ? JSON.parse(str) : undefined);
        });
      });
    });
  }

export function chunkedDelete(key) {
    return new Promise(resolve => {
      if (typeof key !== 'string') key = `${key}`;
      const keyNum = key + '#';
      chrome.storage.local.get(keyNum, data => {
        const num = data[keyNum];
        const keys = [keyNum];
        for (let i = 0; i < num; i++) {
          keys.push(key + i);
        }
        chrome.storage.local.remove(keys, resolve);
      });
    });
  }