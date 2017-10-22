import partition from 'lodash/partition';
import times from 'lodash/times';

import { randomBinomials, flip, coin } from '../index';

test('flip returns true or false', () => {
  times(4, () => expect([true, false]).toContain(flip()));
});

test('flip returns equal numbers of true and false values', () => {
  let counter = 0;
  const generator = coin();
  times(4, () => (counter += generator.flip() ? 1 : -1));
  expect(counter).toEqual(0);
});

test('randomBinomials returns correct length (4)', () =>
  expect(randomBinomials(4).length).toEqual(4));

test('randomBinomials returns correct length (8)', () =>
  expect(randomBinomials(8).length).toEqual(8));

test('randomBinomials throws error for odd sizes', () => {
  expect(() => randomBinomials(1)).toThrow();
  expect(() => randomBinomials(11)).toThrow();
});

test('randomBinomials throws error for zero sizes', () =>
  expect(() => randomBinomials(0)).toThrow());

test('randomBinomials throws error for negative sizes', () => {
  expect(() => randomBinomials(-1)).toThrow();
  expect(() => randomBinomials(-10)).toThrow();
  expect(() => randomBinomials(-11)).toThrow();
});

test('randomBinomials throws error for character argumetns', () =>
  expect(() => randomBinomials('A')).toThrow());

test('randomBinomials returns equal numbers of true and false values', () => {
  const groups = partition(randomBinomials(64), Boolean);
  expect(groups[0]).toEqual(groups[1].map(i => !i));
});
