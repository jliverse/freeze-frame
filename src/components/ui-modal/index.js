import { h, Component } from 'preact';
import uniqueId from 'lodash/uniqueId';

import $ from '../../lib/dollar';

import InlineSVG from '../ui-svg';

import style from './style.less';

export default class extends Component {
  state = {
    shouldShow: false
  };

  componentWillMount() {
    // Generate a unique ID for this instance for ARIA labeling.
    this.setState({
      id: `j${uniqueId() + 100}`
    });
  }

  componentDidMount() {
    this.context.dismissModal = () => {
      this.toggle(false);
    };
  }

  resolveFocus(el) {
    if (!el) {
      return;
    }
    // This ref-triggered function links the render() elements to class members.
    this.parentEL = Promise.resolve(el);
    const focusable = el.querySelectorAll(
      'a, *[href], *[tabindex], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), object, embed, *[contenteditable], input:not([disabled])'
    );
    if (focusable.length > 0) {
      const focusEL = focusable[Math.min(1, focusable.length - 1)];
      this.focusableEL = Promise.resolve(focusEL);
    }
  }

  toggle(shouldShow) {
    this.setState({ shouldShow }, async () => {
      // If we show the dialog, set the new focus within the dialog. We'll save the
      // original focus so we can restore focus when we dismiss the dialog.
      if (shouldShow) {
        $('html').addClass('has-modal');
        this.originEL = Promise.resolve(document.activeElement);
        const el = await this.focusableEL;
        if (el && 'focus' in el) {
          el.focus();
        }
      } else {
        this.originEL && this.originEL.then(el => el.focus());
        $('html').removeClass('has-modal');
      }
    });
  }

  async onFocusOut(e) {
    if (!e.relatedTarget) {
      return;
    }
    // If the new focused element is *outside* the dialog, trap the focus
    // by resetting focus back to the first element in the dialog.
    const parentEL = await this.parentEL;
    if (parentEL && !parentEL.contains(e.relatedTarget)) {
      this.focusableEL.then(el => el.focus());
    }
  }

  onKeyDown(e) {
    // ESC to dismiss.
    switch (e.which || e.keyCode) {
      case 27:
        return this.toggle(false);
      default:
        break;
    }
  }

  render({ children, header, footer, value }, { id, shouldShow }) {
    // NOTE: The #stopPropagation() prevents the onclick handler at the component
    // root from triggering a dismissal within the dialog content.
    return (
      <div
        class={['modal', shouldShow && 'active'].filter(Boolean).join(' ')}
        tabindex="0"
        hidden={!shouldShow}
        aria-describedby={`${id}-dialog-description`}
        aria-hidden={!shouldShow}
        aria-labelledby={`${id}-dialog-label`}
        role="dialog"
      >
        <div onclick={() => ::this.toggle(false)} class="modal-overlay z--1" />
        <div
          ref={::this.resolveFocus}
          onclick={e => e.stopPropagation()}
          onkeydown={::this.onKeyDown}
          onfocusout={::this.onFocusOut}
          class="modal-container"
        >
          <div class="modal-header">
            <button
              class="btn btn-clear float-right"
              aria-label="Dismiss"
              onclick={() => ::this.toggle(!shouldShow)}
            />
            <div class="modal-title h5" id={`${id}-dialog-description`}>
              {header}
              <span class="visuallyhidden">
                Press Escape to dismiss this dialog.
              </span>
            </div>
          </div>
          <div class="modal-body">
            <div class="content">{children}</div>
          </div>
          <div class="modal-footer">{footer}</div>
        </div>
      </div>
    );
  }
}
