import { h, Component } from 'preact';
import style from './style.less';

export default class extends Component {
  render({ children, ...props }) {
    const classes = [props.class, 'z-1'].filter(Boolean).join(' ');
    return (
      <div data-name="ui-range-container" class={classes}>
        <div class="p-2 o-90" data-name="ui-range">
          <input class="w-100" type="range" {...props} />
          <span class="pull-right">{children}</span>
        </div>
      </div>
    );
  }
}
