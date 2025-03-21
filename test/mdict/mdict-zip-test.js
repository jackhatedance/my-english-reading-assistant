
import { strict as assert } from 'assert';
import { YhdParser } from '../../src/dictionary/mdict/parser/YhdParser.js'
import fs from 'fs'

describe('mdict zip profile', function () {

  describe('zip file', function () {
    before(function () {
      this.parser = new YhdParser();
    });

    it('zips', async function () {
      const files = fs.readdirSync('./test/mdict/zips');
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const fileStat = fs.statSync(filePath);
        if (fileStat.isFile()) {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          //console.log(`File: ${file}, Content: ${fileContent}`);
          const base64String = Buffer.from(fileContent).toString('base64');
          const dataUrl = `data:${mimeType};base64,${base64String}`;

          

        }
      });
    });


  });

});
