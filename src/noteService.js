import { chunkedRead, chunkedWrite } from './chunk.js';
import { md5 } from 'js-md5';

const KEY_NOTES = "notes";
/**
 * 
 * @returns notes is an array(selection, content)
 */
async function read() {
    return await chunkedRead(KEY_NOTES);
}
async function write(data) {
    return await chunkedWrite(KEY_NOTES, data);
}

async function getNotes() {
    let notes = await read();
    if (!Array.isArray(notes)) {
        notes = [];
    }

    return notes;
}

async function getNoteMap() {
    let array = await getNotes();
    //console.log('get notes:'+ JSON.stringify(array));
    let map = noteArrayToMap(array);
    return map;
}

async function getNote(selection) {
    let key = getNoteKey(selection);
    let noteMap = await getNoteMap();

    return noteMap.get(key);
}

async function deleteNote(selection) {
    //console.log('delete note');

    let key = getNoteKey(selection);

    let noteMap = await getNoteMap();
    noteMap.delete(key);

    let noteArray = noteMapToArray(noteMap);
    //console.log('write notes:'+ JSON.stringify(noteArray));
    await write(noteArray);
}

async function setNote(note) {
    //console.log('setNote');
    let cleanNote = cleanCopyNote(note);

    let key = getNoteKey(cleanNote.selection);
    let noteMap = await getNoteMap();
    noteMap.set(key, cleanNote);

    let noteArray = noteMapToArray(noteMap);
    //console.log('write notes:'+ JSON.stringify(noteArray));
    await write(noteArray);
}

function cleanCopyNote(srcNote) {
    let note = {
        selection: cleanCopySelection(srcNote.selection),
        content: srcNote.content
    };
    return note;
}

function cleanCopySelection(srcSelection) {
    let selection = {
        start: {
            sentenceId: srcSelection.start.sentenceId,
            offset: srcSelection.start.offset,
        },
        end: {
            sentenceId: srcSelection.end.sentenceId,
            offset: srcSelection.end.offset,
        },
        middle: srcSelection.middle,
        endOffset: srcSelection.endOffset,
    };
    return selection;
}

function getNoteKey(selection) {
    //make sure no other fields
    let obj = cleanCopySelection(selection);
    let posStr = JSON.stringify(obj);
    let key = md5(posStr);
    return key;
}

function noteArrayToMap(array) {

    const map = new Map();
    array.forEach((obj) => {
        let key = getNoteKey(obj.selection);
        map.set(key, obj);
    });
    return map;
}

function noteMapToArray(map) {
    let noteArray = [];
    for (let key of map.keys()) {
        let note = map.get(key);
        noteArray.push(note);
    }
    return noteArray;
}

function purifySentence(sentence) {
    return sentence.replaceAll(/[^\w]+/g, '').toLowerCase();
}

function getSentenceHash(sentence) {
    let pureSentence = purifySentence(sentence);
    let sentenceId = md5(pureSentence);
    return sentenceId;
}

async function search(position) {
    let noteArray = await getNotes();

    let result = [];
    for (let note of noteArray) {
        if (contains(note.selection, position)) {
            result.push(note);

            let key = getNoteKey(note.selection);
            note.key = key;
        }
    }
    return result;
}

function contains(selection, position) {
    let { start, middle, end } = selection;

    
    if (!middle) {
        middle = [];
    }

    if (
        (start.sentenceId === position.sentenceId
            && start.offset <= position.offset)
        ||
        middle.includes(position.sentenceId)
        ||
        (end.sentenceId === position.sentenceId
            && end.offset >= position.offset)
    ) {
        return true;
    } else {
        return false;
    }
}

export { getNotes, getNote, setNote, getNoteKey, deleteNote, getSentenceHash, search };