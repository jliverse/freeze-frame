import { h, render } from 'preact';
import { defer, renderAsHTML } from 'lib/preact';
import { isEqual, partial } from 'lodash';

import UI from '../index';
import simpleSVG from './samples/simple.svg';
import exampleSVG from './samples/example.svg';

test('UI renders', () => {
  const html = renderAsHTML(<UI />);
  expect(html).toBeTruthy();
  expect(html).toMatchSnapshot();
});

test('UI accepts an SVG as @src', () => {
  const withComponent = component => {
    expect(component).toBeTruthy();
    expect(component.props.src).toBeTruthy();
    expect(isEqual(component.props.src, simpleSVG)).toBeTruthy();
    done();
  };
  const html = renderAsHTML(<UI ref={withComponent} src={simpleSVG} />);
  expect(html).toEqual(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="red" stroke-width="5" fill="blue"></circle></svg>`
  );
});

test('UI renders a simple SVG', () => {
  const html = render(<UI src={simpleSVG} />);
  expect(html.outerHTML).toMatchSnapshot();
});

test('UI renders an example SVG', () => {
  const html = render(<UI src={exampleSVG} />);
  expect(html.outerHTML).toMatchSnapshot();
});
