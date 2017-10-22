import partition from 'lodash/partition';
import times from 'lodash/times';

import { mock, restore } from 'simple-mock';

import { isAvailable, sizeInBytes, withKey } from '../index';
import instance from '../index';

test('should return a boolean', () => {
  expect([true, false]).toContain(isAvailable());
});

test('size() should return a number', () => {
  expect(sizeInBytes()).toBeGreaterThanOrEqual(0);
});

test('withKey().key() should return itself', () => {
  mock(instance, 'isAvailable').returnWith(true);
  expect(withKey('any-key').key()).toEqual('any-key');
});

test('should return an error if not available', () => {
  mock(instance, 'isAvailable').returnWith(true);
  expect(isAvailable()).toEqual(true);
  expect(() => {
    withKey('ANY_KEY');
  }).not.toThrow();

  mock(instance, 'isAvailable').returnWith(false);
  expect(isAvailable()).toEqual(false);
  expect(() => {
    withKey('ANY_KEY');
  }).toThrow();
});
