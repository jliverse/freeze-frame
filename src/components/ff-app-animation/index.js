import { h, Component } from 'preact';
import { css } from '../../lib/preact/css';

import style from './style.less';

export default class extends Component {
  isLoaded = false;

  pause() {
    if (!this.canvasEL) {
      return;
    }
    const img = this.imageEL;
    this.canvasEL.width = img.width;
    this.canvasEL.height = img.height;

    const ctx = this.canvasEL.getContext('2d');
    ctx && ctx.drawImage(img, 0, 0, img.width, img.height);
  }

  /**
  * HACK: Trigger a display change to work around a problem with Firefox freezing
  * on animated GIFs with changing images. (e.g., Firefox 52.0.2);
  * @see fixFirefoxAnimationBugLoad()
  * @param {Element} e A DOM element
  */
  fixFirefoxAnimationBugRender(el) {
    if (el && !this.isLoaded) {
      el.style.display = 'none';
    }
  }

  /**
  * HACK: Restore original styles after the first frame to work around a problem with
  * Firefox freezing on animated GIFs with changing images. (e.g., Firefox 52.0.2);
  * @see fixFirefoxAnimationBugRender()
  * @param {Event} e An IMG onload event
  */
  fixFirefoxAnimationBugLoad(e) {
    if (e && e.target) {
      this.isLoaded = true;
      requestAnimationFrame(() => {
        setTimeout(() => {
          e.target.style.display = '';
        }, 0);
      });
    }
  }

  componentWillReceiveProps({ isRunning, src, ...nextProps }) {
    if (src && src !== this.props.src) {
      this.isLoaded = false;
    }
    if (!isRunning && isRunning !== this.props.isRunning) {
      this.pause();
    }
  }

  render({ scale, src, isRunning = true, ...props }) {
    if (!src) {
      return <div class="error" />;
    }
    const styles = [
      props.style,
      scale && `transform: scale(${scale}, ${scale});`
    ]
      .filter(Boolean)
      .join('; ');

    return (
      <div data-name="ff-app-animation" {...props}>
        <img
          class={css(!isRunning && 'dn')}
          ref={el => {
            this.imageEL = el;
            'netscape' in window && this.fixFirefoxAnimationBugRender(el);
          }}
          onload={'netscape' in window && ::this.fixFirefoxAnimationBugLoad}
          src={src}
          style={styles}
        />
        <canvas
          class={css(isRunning && 'dn')}
          style={styles}
          ref={el => (this.canvasEL = el)}
        />
      </div>
    );
  }
}
