
import {parseWordClass, firstMeaning} from '../src/dictionary.js';
import { strict as assert } from 'assert';


describe('dictionary', function () {
  describe('#parseWordClass()', function () {
    it('should remove "a. " when exists', function () {
      assert.equal(parseWordClass("ad. foo").meanings, 'foo');
      assert.equal(parseWordClass("ad. 在船上, 在火车上, 在飞机上").meanings, "在船上, 在火车上, 在飞机上");
      assert.equal(parseWordClass("vt.vi. 想象, 出现幻想, 产生幻想, 使幻想化, 幻想").meanings, "想象, 出现幻想, 产生幻想, 使幻想化, 幻想");
      
      assert.equal(parseWordClass("视频分布系统, 自动数据系统, 自主开发系统").meanings, "视频分布系统, 自动数据系统, 自主开发系统");
    });
  });
  describe('#firstMeaning()', function () {
    it('should return first meaning', function () {
      
      assert.equal(firstMeaning("在船上, 在火车上, 在飞机上"), "在船上");
      assert.equal(firstMeaning("在船上"), "在船上");
    });
  });
});
