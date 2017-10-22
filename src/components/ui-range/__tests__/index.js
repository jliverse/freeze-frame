import { h, render } from 'preact';
import { defer, renderAsHTML } from 'lib/preact';

import UI from '../index';

test('UI renders', () => {
  const html = renderAsHTML(<UI />);
  expect(html).toBeTruthy();
});
