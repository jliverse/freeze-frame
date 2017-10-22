import times from 'lodash/times';
import shuffle from 'lodash/shuffle';
import isFunction from 'lodash/isFunction';

const DEFAULT_WIDTH = 4;

export function randomBinomials(numberOfTrials = DEFAULT_WIDTH) {
  if (numberOfTrials % 2 !== 0 || numberOfTrials <= 0) {
    throw new Error(
      'The randomBinomials function accepts only positive even integer sizes.'
    );
  }
  const options = [];
  times(Math.floor(numberOfTrials / 2), () => options.push(true, false));
  return shuffle(options);
}

export function* cycle() {
  const [fn, ...args] = [...arguments];
  let index = 0;
  let array = isFunction(fn) ? fn.apply(this, args) : fn;
  while (true) {
    yield array[index++];
    if (index >= array.length) {
      index = 0;
      array = isFunction(fn) ? fn.apply(this, args) : fn;
    }
  }
}

export function coin() {
  const generator = cycle(randomBinomials);
  return { flip: () => !!generator.next().value };
}

const booleans = cycle(randomBinomials);
export function flip() {
  return !!booleans.next().value;
}
