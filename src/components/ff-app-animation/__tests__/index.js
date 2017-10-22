import { h, render } from 'preact';
import { renderAsHTML } from 'lib/preact';

import UI from '../index';

test('matches styles and markup', () => {
  const html = renderAsHTML(<UI src="0000.png" />);
  expect(html).toMatchSnapshot();
});

test('matches styles and markup with size', () => {
  const html = renderAsHTML(<UI src="0000.png" size="256" />);
  expect(html).toMatchSnapshot();
});
