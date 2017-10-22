import { h, Component } from 'preact';
import style from './style.less';

import isEqual from 'lodash/isEqual';

export default class extends Component {
  state = {
    shouldShow: false,
    text: ''
  };

  primary = text => this.text(text, 'toast-primary');

  success = text => this.text(text, 'toast-success');

  warning = text => this.text(text, 'toast-warning');

  error = text => this.text(text, 'toast-error');

  text = (text, style = '') => {
    this.setState({ text, style, shouldShow: true }, () => {
      this.toastEL.addEventListener('webkitAnimationEnd', e => {
        this.setState({ text: '', style: '', shouldShow: false });
      });
    });
  };

  render({ children, ...props }, { shouldShow, style, text }) {
    return (
      <div
        class={[shouldShow && 'toast', style, props.class]
          .filter(Boolean)
          .join(' ')}
        ref={el => (this.toastEL = el)}
        role="alert"
      >
        {text || children}
      </div>
    );
  }
}
