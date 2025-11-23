/**
 * this lock is used to controll access to tabInfo and user activity local storage
 */

import { Mutex } from 'async-mutex';


const mutex = new Mutex();

/**
 * usage: 
 * 
 * const release = acquireMutex();
 * try {} 
 * finally { release(); }
 */
async function acquireMutex(){
    const release = await mutex.acquire();
    return release;
}

/**
 * similar to Java synchronized keyword
 * @param {*} asyncCallback 
 */
async function synchronized(asyncCallback){
    const release = await mutex.acquire();
    try {
        await asyncCallback();
    } finally {
        release();
    }
}

export { acquireMutex, synchronized }