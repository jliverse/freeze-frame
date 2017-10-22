import { test } from 'tape-catch';
import { h, render } from 'preact';

import UI from '..';

test('UI can render', t => {
  const ui = render(<UI />, document.body);
  t.ok(ui);
  t.end();
});
