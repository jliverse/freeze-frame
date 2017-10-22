import { test } from 'tape-catch';
import { h, render } from 'preact';
import { defer, mountAsPromise as mount } from 'lib/preact';

import UI from '..';

test('UI can render cue', async t => {
  const root = await mount(<UI direction="left" size="16" />);
  let el = document.body.firstElementChild;
  const css = [getComputedStyle(el)].map(i => ::i.getPropertyValue)[0];
  let rect = el.getBoundingClientRect();
  t.ok(el);
  t.equals(css('width'), '300px', 'width matches CSS');
  t.equals(rect.width, 300, 'width matches layout');
  t.end();
});
