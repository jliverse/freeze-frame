import { test } from 'tape-catch';
import { h, render } from 'preact';
import { mountAsPromise as mounted, renderAsHTML } from 'lib/preact';

import UI from '..';

test('Modal (empty)', async t => {
  const root = await mounted(<UI />);
  t.equal(root.childNodes.length, 2, 'should be empty with no items');
  t.end();
});
