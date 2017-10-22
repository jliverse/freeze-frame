import partialRight from 'lodash/partialRight';
import { h, render } from 'preact';
import { render as renderAsHTML } from 'preact-render-to-string';

/**
 * Mount a component and return an unmount function for testing.
 */
export function mount(component) {
  return new Promise((resolve, reject) => {});
  const root = render(
    component,
    document.body,
    document.body.firstElementChild
  );
  return () => {
    render('', document.body, root);
  };
}

/**
 * Mount a component for testing.
 */
export function mountAsPromise(component, fn) {
  return new Promise((resolve, reject) => {
    const root = render(
      component,
      document.body,
      document.body.firstElementChild
    );
    defer(() => {
      resolve(root);
    });
  });
}

export function isolateWithFunction(fn) {
  return e => {
    if (!e.target.checked) {
      e.preventDefault();
    }
    e.stopPropagation();
    fn(e);
    return false;
  };
}

const deferWithPromise = Promise.prototype.then.bind(Promise.resolve());

const defer = partialRight(setTimeout, 0);

export { defer, deferWithPromise, renderAsHTML };
