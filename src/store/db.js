import { openDB } from 'idb';

const DB_NAME = 'MyEnglishReadingAssistant';
const DB_VERSION = 1;

const STORE_DICTIONARY_RESOURCE_FILES = 'DictionaryResourceFiles';

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(database, oldVersion, newVersion, transaction) {
    if (!database.objectStoreNames.contains(STORE_DICTIONARY_RESOURCE_FILES)) {
      const store = database.createObjectStore(STORE_DICTIONARY_RESOURCE_FILES);
      store.createIndex('dictionary', 'dictionary');
    }

  },
});


function getResourceFileKey(dictionary, path){
  return `${dictionary}-${path}`;
}

export async function saveDictionaryResourceFile(resourceFile) {
  let key = getResourceFileKey(resourceFile.dictionary, resourceFile.path);  
  await (await dbPromise).add(STORE_DICTIONARY_RESOURCE_FILES, resourceFile, key);
}

export async function loadDictionaryResourceFile(dictionary, path) {
  let key = getResourceFileKey(dictionary, path);
  let value = await (await dbPromise).get(STORE_DICTIONARY_RESOURCE_FILES, key);
  return value;
}

export async function countDictionaryResourceFile(dictionary) {
  return await (await dbPromise).countFromIndex(STORE_DICTIONARY_RESOURCE_FILES, 'dictionary', dictionary);
}

export async function deleteDictionaryAllResourceFiles(dictionary){
  let keys = await (await dbPromise).getAllKeysFromIndex(STORE_DICTIONARY_RESOURCE_FILES, 'dictionary');
  for(let key of keys){
    let f = await (await dbPromise).get(STORE_DICTIONARY_RESOURCE_FILES, key);
    await (await dbPromise).delete(STORE_DICTIONARY_RESOURCE_FILES, key);
  }
}