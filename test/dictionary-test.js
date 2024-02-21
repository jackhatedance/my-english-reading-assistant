
import {removeWordClass, firstMeaning} from '../src/dictionary.js';
import { strict as assert } from 'assert';


describe('dictionary', function () {
  describe('#removeWordClass()', function () {
    it('should remove "a. " when exists', function () {
      assert.equal(removeWordClass("ad. foo"), 'foo');
      assert.equal(removeWordClass("ad. 在船上, 在火车上, 在飞机上"), "在船上, 在火车上, 在飞机上");
      assert.equal(removeWordClass("vt.vi. 想象, 出现幻想, 产生幻想, 使幻想化, 幻想"), "想象, 出现幻想, 产生幻想, 使幻想化, 幻想");
      
      assert.equal(removeWordClass("视频分布系统, 自动数据系统, 自主开发系统"), "视频分布系统, 自动数据系统, 自主开发系统");
    });
  });
  describe('#firstMeaning()', function () {
    it('should return first meaning', function () {
      
      assert.equal(firstMeaning("在船上, 在火车上, 在飞机上"), "在船上");
      assert.equal(firstMeaning("在船上"), "在船上");
    });
  });
});
