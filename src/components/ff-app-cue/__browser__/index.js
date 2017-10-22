import { test } from 'tape-catch';
import { h, render } from 'preact';
import { defer, mountAsPromise as mount } from 'lib/preact';

import UI from '..';

test('UI can render cue', async t => {
  await mount(<UI direction="left" size="16" />, document.body);
  let el = document.body.firstElementChild;
  t.ok(el);

  const css = [getComputedStyle(el)].map(i => ::i.getPropertyValue)[0];
  let rect = el.getBoundingClientRect();
  t.ok(el);
  t.equals(css('left'), '0px', 'left position matches CSS');

  t.equals(css('width'), '16px', 'width matches CSS');
  t.equals(rect.width, 16, 'width matches layout');

  // Re-render and verify that the component can be pinned to the right.
  el = render(<UI direction="right" size="32" />, document.body, el);
  t.equals(css('width'), '32px', 'resized width matches CSS');
  t.equals(css('right'), '0px', 'right position matches CSS');
  t.pendingCount && unmount();
  t.end();
});
