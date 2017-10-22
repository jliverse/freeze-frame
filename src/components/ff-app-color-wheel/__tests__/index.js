import { h, render } from 'preact';
import { deferWithPromise as defer, renderAsHTML } from 'lib/preact';

const log = require('debug')('ff:app:cue');

import UI from '../index';

test('UI renders', () => {
  const html = renderAsHTML(<UI />);
  expect(html).toBeTruthy();
  expect(html).toMatchSnapshot();
});

test('UI accepts a direction (left)', () => {
  const ui = <UI direction="left" size="16" />;
  const html = renderAsHTML(ui);
  expect(html).toMatchSnapshot();
});

test('UI accepts a direction (right)', () => {
  const ui = <UI direction="right" size="16" />;
  const html = renderAsHTML(ui);
  expect(html).toMatchSnapshot();
});
