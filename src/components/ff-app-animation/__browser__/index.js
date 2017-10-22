import { test } from 'tape-catch';
import { h, render } from 'preact';
import { mountAsPromise as mounted } from 'lib/preact';

import UI from '..';

import animations from '../../../2008/animations';

// For each unit test you write, answer these questions:
test('What component aspect are you testing?', assert => {
  const actual = 'What is the actual output?';
  const expected = 'What is the expected output?';
  assert.notEqual(actual, expected, 'What should the feature do?');
  assert.end();
});

test('The animation should cycle without stopping.', async t => {
  let i = 0;
  const timer = setInterval(async () => {
    const root = await mounted(<UI src={animations[i++]} />);
    if (i >= animations.length) {
      clearInterval(timer);
      t.end();
    }
  }, 2000);
  t.end();
});
