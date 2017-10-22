import { h, Component } from 'preact';
import style from './style.less';

import { css } from '../../lib/preact/css';

import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';

export default class extends Component {
  mouseDown = false;
  showAnimation = debounce(
    e => {
      this.setState({ isResizing: true }, () => {
        this.showAnimation.cancel();
        this.waitForAnimationEnd(this.codeEL);
      });
    },
    500,
    { leading: true, trailing: false }
  );

  waitForAnimationEnd = debounce(el => {
    if (!el) {
      return;
    }
    this.setState({ isAnimating: true }, () => {
      el.addEventListener('webkitAnimationEnd', () =>
        this.setState({ isResizing: false, isAnimating: false }, () => {})
      );
    });
  }, 1000);

  componentWillReceiveProps({ size, ...nextProps }) {
    if (!this.props.size) {
      return;
    }
    if (size !== this.props.size) {
      this.showAnimation();
    }
  }

  render(
    {
      offsetInPixels = 0,
      direction = 'left',
      size = 1,
      isVisible = false,
      children,
      ...props
    },
    { isResizing = false, isAnimating = false, ...state }
  ) {
    const distanceFromCenter = offsetInPixels * (direction === 'left' ? -1 : 1);
    return (
      <aside
        class={`ff-app-cue ${!isVisible && 'dn'}`}
        {...props}
        style={`transform: translateX(${distanceFromCenter}px); x${direction}: 0; width: ${size}px; height: ${size}px`}
      />
    );
  }
}
