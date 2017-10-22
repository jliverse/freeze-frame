import isFunction from 'lodash/isFunction';
import toPairs from 'lodash/toPairs';

import { h, Component, render } from 'preact';

import style from './style.less';

const defer = Promise.resolve().then.bind(Promise.resolve());

const DEFAULT_OPTIONS = {
  scrollbars: 1,
  resizable: 1,
  width: 640,
  height: 480,
  top: (o, w) => (w.innerHeight - o.height) / 2 + w.screenY,
  left: (o, w) => (w.innerWidth - o.width) / 2 + w.screenX
};

let remote = undefined;

export default class extends Component {
  closeWindow = () => {
    remote && remote.close();
    window.removeEventListener('unload', this.closeWindow);
  };

  show = e => {
    const options = toPairs(DEFAULT_OPTIONS)
      .map(([i, j]) => `${i}=${isFunction(j) ? j(DEFAULT_OPTIONS, window) : j}`)
      .join(',');

    const url = `${window.location.href.split('#')[0]}#/window`;
    const popoutWindow = window.open(url, this.props.title || '', options);

    // Browser permissions could prevent the window from opening.
    if (!popoutWindow) {
      throw new Error('The window cannot be created.');
    }

    const onloadHandler = () => {
      if (remote && popoutWindow !== remote) {
        this.closeWindow();
      }
      remote = popoutWindow;
      this._render();
    };

    if (popoutWindow.addEventListener) {
      popoutWindow.addEventListener('load', onloadHandler);
    } else if (popoutWindow.attachEvent) {
      popoutWindow.attachEvent('onload', onloadHandler);
    } else {
      popoutWindow.onload = onloadHandler;
    }

    popoutWindow.document.readyState === 'complete' && onloadHandler();

    // If the main window reloads or closes, close the popout.
    window.addEventListener('unload', this.closeWindow, false);
    e && e.preventDefault();
  };

  _render() {
    const { children } = this.props;
    if (!remote || !children) {
      return '';
    }
    defer(() => {
      render(
        <div data-name="popout" role="main">
          {children}
        </div>,
        remote.document.body,
        remote.document.body.firstElementChild
      );
    });
  }

  componentDidUpdate() {
    this._render();
  }
}
