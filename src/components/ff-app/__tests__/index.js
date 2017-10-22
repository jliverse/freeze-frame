import _ from 'lodash';
import { h, render } from 'preact';
import { renderAsHTML, mountAsPromise as mounted } from 'lib/preact';
import { deep } from 'preact-render-spy';

import allAnimations from '../../../2008/animations';
jest.mock('../../../2008/animations');
jest.mock('../../../2017/sounds');

import UI from '../index';

const defer = Promise.prototype.then.bind(Promise.resolve());

test('App should record events', async () => {
  let component;
  await mounted(<UI subjectID="ABC" ref={el => (component = el)} />);

  let { events, trialNumber } = component.state;
  expect(events.length).toEqual(0);
  component.start();
  expect(events.length).toEqual(1);
  expect(_.pick(events[0], ['text', 'object'])).toEqual({
    text: 'EXPERIMENT STARTED',
    object: 'Experiment'
  });
  expect(trialNumber).toEqual(0);
});

test('UI can play sounds', async () => {
  const spy = jest.spyOn(UI.prototype, 'didPlaySound');

  await mounted(<UI ref={ui => ui.onKeyDown({ keyCode: 65 })} />);
  expect(spy).toHaveBeenCalled();
});

test('UI renders', () => {
  const html = render(<UI />, document.body);
  expect(html).toBeTruthy();
  return defer(() => {
    expect(document.querySelector('img')).toBeTruthy();
  });
});
