import { h, render } from 'preact';

import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';

const $html = document.querySelector('html');

let root = document.getElementById('root');
function init() {
  let App = require('./components/index').default;
  const el = root || document.body.firstElementChild;

  // An animation property with a 0.01s duration will indicate when our CSS has loaded.
  Promise.race([
    new Promise(resolve => {
      const fn = () => {
        resolve();
        document.body.removeEventListener('webkitAnimationEnd', fn);
      };
      document.body.addEventListener('webkitAnimationEnd', fn);
    }),
    new Promise(resolve => setTimeout(resolve, 200))
  ]).then(() => {
    $html.classList.remove('no-ui');
    $html.classList.add('ui');
  });

  root = render(<App />, el.parentNode, root);

  if (!root) {
    return;
  }

  $html.classList.remove('no-js');
  $html.classList.add('js');

  // Feature-detect for hairline borders.
  if (window.devicePixelRatio && devicePixelRatio >= 2) {
    const div = document.createElement('div');
    div.style.border = '.5px solid transparent';
    document.body.appendChild(div);
    if (div.offsetHeight !== 1) {
      $html.classList.add('hairline');
    }
    document.body.removeChild(div);
  }
}

document.addEventListener('DOMContentLoaded', init);

if (module.hot) {
  module.hot.accept('./components/index', () => requestAnimationFrame(init));
}
