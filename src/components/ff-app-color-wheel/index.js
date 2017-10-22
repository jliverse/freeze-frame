import { h, Component } from 'preact';
import style from './style.less';

import { css } from '../../lib/preact/css';

export default class extends Component {
  render({ size = 300, ...props }) {
    return (
      <div
        class="page-center circle"
        {...props}
        data-name="ff-app-color-wheel"
      />
    );
  }
}
