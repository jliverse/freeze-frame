import { h, Component } from 'preact';
import linkstate from 'linkstate/polyfill';
import style from './style.less';
import bytes from 'bytes';

import { name, description, version, homepage } from '../../../package.json';

import SVG from '../ui-svg';

import { isAvailable, sizeInBytes, withKey } from '../../lib/localStorage';
import { download } from '../../lib/download';
import { asLong } from '../../lib/time';

import favicon from '../../2017/favicon.svg';

Number.isFinite =
  Number.isFinite || (value => typeof value === 'number' && isFinite(value));

export default class extends Component {
  download = e => {
    e.preventDefault();
    try {
      const lastSavedStorage = withKey('last-csv');
      const lastSavedFile = lastSavedStorage.get();
      lastSavedFile && download(lastSavedFile, `${asLong()}.csv`, 'text/csv');
      lastSavedStorage.remove();
      this.setState({ hasLastSavedFile: !!lastSavedStorage.get() });
      return false;
    } catch (err) {
      console.error(err);
    }
  };

  getDisplaySize = size =>
    bytes(size, {
      thousandsSeparator: ',',
      unit: size < 1024 * 1024 ? 'KB' : 'MB'
    });

  componentWillMount() {
    const size = sizeInBytes();
    const displaySize = this.getDisplaySize(size);
    const lastSavedFile = withKey('last-csv').get();
    const lastSavedFileDisplaySize =
      lastSavedFile && this.getDisplaySize(lastSavedFile.length || 0);
    const hasLastSavedFile = !!lastSavedFile;
    this.setState({
      isAvailable: isAvailable(),
      size,
      displaySize,
      hasLastSavedFile,
      lastSavedFileDisplaySize
    });
  }

  render(
    { children, didStart = () => {}, ...props },
    {
      isAvailable,
      subjectID,
      size,
      displaySize,
      hasLastSavedFile,
      lastSavedFileDisplaySize
    }
  ) {
    return (
      <form
        data-name="ff-app-welcome"
        onsubmit={e => {
          didStart(subjectID);
          e.preventDefault();
        }}
      >
        <div class="empty">
          <div class="empty-icon">
            <SVG src={favicon} style="height: 4rem" />
          </div>
          {!isAvailable && (
            <div class="toast toast-error">
              <button
                class="btn btn-clear float-right"
                onclick={e => this.setState({ isAvailable: !isAvailable })}
              />
              This browser is preventing saving event data or settings.
            </div>
          )}
          <p class="empty-title h5 visuallyhidden">{name}</p>
          <p class="empty-subtitle w-67-l">{description}</p>
          <div>
            <div class="empty-action input-group input-inline">
              <label>
                <strong class="visuallyhidden">Subject ID</strong>
                <input
                  type="text"
                  class="form-input"
                  disabled={!isAvailable}
                  onInput={this.linkState('subjectID')}
                  autofocus
                  placeholder="Subject ID"
                />
                <p class="form-input-hint">
                  Subject ID is an optional identifier, e.g., 001 or AAA.
                </p>
              </label>
              <button
                class="btn btn-primary input-group-btn"
                disabled={!isAvailable}
              >
                Start Freeze Frame{' '}
                {!hasLastSavedFile && <i class="icon icon-forward" />}
              </button>
            </div>
            <div class="empty-action input-group input-inline ml-2 va-t">
              {hasLastSavedFile && (
                <button
                  data-balloon-size="md"
                  data-balloon="You can recover the most recent session by downloading the CSV."
                  href="/download"
                  class="btn input-group-btn"
                  onclick={::this.download}
                >
                  Recover CSV ({lastSavedFileDisplaySize})
                </button>
              )}
            </div>
          </div>
          <div class="empty-action">
            <div class="btn-group btn-group-inline">
              <a href={`${homepage}/wiki#${version}`} class="btn btn-link">
                Read Documentation
              </a>

              <a href={homepage} class="btn btn-link">
                View Code on Github
              </a>
            </div>
          </div>
          <p class="footer">
            v{version} (2017)
            {size !== 0 && (
              <span>
                {' '}
                &#8226;{' '}
                <span data-balloon="The disk space used by settings and experimental data.">
                  {displaySize} used
                </span>
              </span>
            )}
          </p>
        </div>
      </form>
    );
  }
}
