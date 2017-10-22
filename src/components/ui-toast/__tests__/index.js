import { h, render } from 'preact';
import { renderAsHTML, renderAsDocument } from 'lib/preact';

import UI from '../index';

test('UI renders', () => {
  const html = renderAsHTML(<UI color="pink" />);
  expect(html).toBeTruthy();
  expect(html).toMatchSnapshot();
});
