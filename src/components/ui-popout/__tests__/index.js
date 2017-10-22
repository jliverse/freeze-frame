import { h, render } from 'preact';
import { renderAsHTML } from 'lib/preact';

import UI from '../index';

test('UI renders', () => {
  const data = { string: 'value', number: 42 };
  const html = renderAsHTML(
    <UI>
      {data}
    </UI>
  );
  expect(html).toBeFalsy();
  expect(html).toMatchSnapshot();
});
