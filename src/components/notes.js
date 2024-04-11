'use strict';

import {Note} from './note.js';

class Notes {
    
    constructor(rootElement, service){
        this.rootElement = rootElement;
        this.service = service;
        this.rootElement.classList.add('notes');
        this.noteArray = [];
        this.noteComponentArray = [];
    }

    setList(noteArray) {
        
        this.clear();

        for(let note of list){
            addItem(note);
        }
    }

    addItem(note){
        this.noteArray.push(note);

        let document = rootElement.ownerDocument;
        let noteElement = document.createElement('div');
        let noteComponent = new Note(noteElement, this.service);

        rootElement.appendChild(noteElement);

        noteComponentArray.push(noteComponent);
    }

    clear(){
        this.rootElement.innerHTML = '';
        this.noteArray = [];
        this.noteComponentArray = [];
    }

    getNoteArray(){
        return this.noteArray;
    }

    getNoteComponentArray(){
        return this.noteComponentArray;
    }
    
}

export {Notes};