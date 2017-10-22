import 'linkstate/polyfill';

import CSV from 'json2csv';
import debounce from 'lodash/debounce';
import fromPairs from 'lodash/fromPairs';
import isEqual from 'lodash/isEqual';
import isFunction from 'lodash/isFunction';
import toNumber from 'lodash/toNumber';
import shuffle from 'lodash/shuffle';
import throttle from 'lodash/throttle';
import toPairs from 'lodash/toPairs';
import pick from 'lodash/pick';

import { h, Component } from 'preact';
import { withKey } from '../../lib/localStorage';
import { asLong } from '../../lib/time';
import { download } from '../../lib/download';
import { validate } from 'revalidator';

import { name, description, version } from '../../../package.json';

import Experiment from '../../lib/ff-state-context';
import Log from '../../lib/ff-log';

import Animation from '../ff-app-animation';
import ColorWheel from '../ff-app-color-wheel';
import Cue from '../ff-app-cue';
import Modal from '../ui-modal';
import Popout from '../ui-popout';
import Range from '../ui-range';
import SVG from '../ui-svg';
import Toast from '../ui-toast';

import style from './style.less';

const DISTANCE_IN_CENTIMETERS = 60;
const ANIMATION_WIDTH_IN_DEGREES = 5.1;
const ANIMATION_HEIGHT_IN_DEGREES = 4.9;
const CUE_ECCENTRICITY_IN_DEGREES = 13.5;
const CUE_SIZE_IN_DEGREES = 3.2;

const CUE_DURATION_IN_MILLIS = 200; // Configurable
const CUE_DURATION_INCREMENT = 40; // Configurable
const CUE_DURATION_MAXIMUM = 1200; // Configurable
const LOOK_CRITERION = 2; // Configurable
const TRIAL_CRITERION = 80; // Configurable

const CONFIGURABLE_KEYS = [
  'cueDurationInitial',
  'cueDurationIncrement',
  'cueDurationMaximum',
  'lookCriterion',
  'trialCriterion'
];

const allAnimations = require('../../2008/animations').default;
const allSounds = require('../../2017/sounds').default;
const boringAnimation = require('../../2008/boring.gif');

const animationOrder = shuffle(allAnimations.map((_, i) => i));
const soundOrder = shuffle(allSounds.map((_, i) => i));

const fullScreenImages = [
  require('../../2017/expand-wide.svg'),
  require('../../2017/compress-wide.svg')
];
const windowSrc = require('../../2017/window.svg');
const helpSrc = require('../../2017/question-circle.svg');
const settingsSrc = require('../../2017/cog.svg');

const defer = Promise.prototype.then.bind(Promise.resolve());

export default class extends Component {
  state = {
    events: [],
    trialNumber: 0,
    soundId: 0,
    animationId: 0,
    isDistracting: false,
    distance: DISTANCE_IN_CENTIMETERS,
    cueDuration: CUE_DURATION_IN_MILLIS,
    cueDurationInitial: CUE_DURATION_IN_MILLIS,
    cueDurationIncrement: CUE_DURATION_INCREMENT,
    cueDurationMaximum: CUE_DURATION_MAXIMUM,
    lookCriterion: LOOK_CRITERION,
    trialCriterion: TRIAL_CRITERION
  };

  log = event => {
    this.logger.log(event);
    let { events = [] } = this.state;
    events.push(event);
    this.setState({ events });
  };

  didStateChange = ({
    cueDirection,
    isAnimating,
    isStarted,
    isCalibrating,
    lookNumber,
    trialNumber
  }) => {
    this.setState({
      cueDirection,
      isAnimating,
      isInterestingTrial: trialNumber % 2 === 0,
      isStarted,
      lookNumber,
      trialNumber
    });
  };

  didCueChange = ({ cueDirection, cueTimeElapsed, isDistracting }) => {
    this.setState({ isDistracting }, () => {
      if (!isDistracting) {
        this.easy({
          text: `Cue presented on the ${cueDirection !== 'left'
            ? 'right'
            : 'left'} side for ${cueTimeElapsed} ms.`,
          object: `Cue`
        });
      }
    });
  };

  didCalibrationEnd = ({ cueDuration, isCalibrating, lookNumber }, options) => {
    this.setState({ cueDuration, isCalibrating }, () => {
      if (!options) {
        this.easy({
          text: `Cue duration is manually set to ${cueDuration} ms.`,
          object: `Cue`
        });
        return;
      }
      const { cueDurationMaximum, lookCriterion } = options || {};
      if (+lookNumber === +lookCriterion) {
        this.easy({
          text: `Cue duration is set to ${cueDuration} ms.`,
          object: `Cue`
        });
      } else if (+cueDuration === +cueDurationMaximum) {
        this.easy({
          text: `Cue duration has reached its maximum at ${cueDuration} ms.`,
          object: `Cue`
        });
      }
    });
  };

  didExperimentEnd = ({ isStarted }) => {
    this.easy({
      text: 'EXPERIMENT ENDED',
      object: 'Experiment'
    });
    this.setState({ isStarted });
  };

  didExperimentStart = ({
    cueDuration,
    lookNumber,
    trialNumber,
    isStarted
  }) => {
    this.downloadCompleted = false;
    this.easy({
      text: 'EXPERIMENT STARTED',
      object: 'Experiment'
    });
    this.setState(
      {
        cueDuration,
        lookNumber,
        trialNumber,
        isStarted,
        isInterestingTrial: trialNumber % 2 === 0
      },
      () => {}
    );
  };

  didSaccade = ({ lookNumber, trialNumber, isSaccadeAway }) => {
    this.easy({
      text: isSaccadeAway ? `Subject looks away` : `Subject looks to cue`,
      object: `Subject`
    });
  };

  didNotSaccade = ({ lookNumber, trialNumber }) => {
    const { animationId } = this.state;
    this.easy({
      text: `Animation continues`,
      object:
        (trialNumber % 2 === 0 &&
          `Animation #${animationOrder[animationId]}`) ||
        'Boring'
    });
  };

  didAnimationStart = ({ isAnimating, trialNumber }) => {
    let { animationId } = this.state;
    animationId = ++animationId % allAnimations.length;
    const isInterestingTrial = trialNumber % 2 === 0;
    this.setState(
      {
        isAnimating,
        animationId,
        isInterestingTrial
      },
      () => {
        this.easy({
          text: `Animation starts`,
          trial: trialNumber,
          object:
            (isInterestingTrial &&
              `Animation #${animationOrder[animationId]}`) ||
            'Boring'
        });
      }
    );
  };

  didAnimationStop = ({ trialNumber }) => {
    this.setState(
      {
        isAnimating: false
      },
      () => {
        this.easy({
          trial: trialNumber,
          text: `Animation stops`,
          object:
            (this.state.trialNumber % 2 === 0 &&
              `Animation #${animationOrder[this.state.animationId]}`) ||
            'Boring'
        });
      }
    );
  };

  didAnimationChange = () => {
    let { animationId } = this.state;
    animationId = ++animationId % allAnimations.length;
    this.setState({ animationId });
  };

  didPlaySound() {
    const { soundId = 0 } = this.state;
    this.easy({
      text: `ALARM`,
      object: `Alarm #${soundOrder[soundId]}`
    });
  }

  start = e => {
    this.experiment.start();
  };

  end = e => {
    const { didEnd } = this.props;
    isFunction(didEnd) && didEnd();
  };

  constructor({ acceptKeys = e => {} }) {
    super(arguments);

    this.logger = new Log();

    // Throttle the call to the HTML5 audio play() function.
    this.playSound = throttle(::this.playSound, 250);
    this.save = throttle(::this.save, 1000);
    this.formDidChange = throttle(::this.formDidChange, 250);

    try {
      this.storage = withKey([name, version].join('-'));
    } catch (err) {
      this.storage = null;
    }
  }

  componentDidMount() {
    const { distance, subjectID, ...props } = this.props;

    this.onKeyDown = ::this.onKeyDown;
    this.onKeyUp = ::this.onKeyUp;
    this.onFullScreen = ::this.onFullScreen;
    this.onWindowBlur = ::this.onWindowBlur;
    this.onWindowUnload = ::this.onWindowUnload;

    window.addEventListener('beforeunload', this.onWindowUnload);
    window.addEventListener('blur', this.onWindowBlur);
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
    document.addEventListener(this.fullScreenAPIEventName(), this.onFullScreen);

    this.formDidChange();
    distance && this.setState({ distance });
    subjectID && this.setState({ subjectID });
    this.storage && this.setState(this.storage.get());
    this.resetSettings();
    this.setState({ configurable: this.getConfiguration() });

    this.experiment = new Experiment(this.getConfiguration());
    this.experiment.delegate = this;
  }

  componentWillReceiveProps({ distance, subjectID, ...nextProps }) {
    if (!isEqual(subjectID, this.props.subjectID)) {
      subjectID && this.setState({ subjectID });
    }
    if (!isEqual(distance, this.props.distance)) {
      distance && this.setState({ distance });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !nextState ||
      !isEqual(nextState, this.state) ||
      (!nextProps || !isEqual(nextProps, this.props))
    );
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener(
      this.fullScreenAPIEventName(),
      this.onFullScreen
    );
    window.removeEventListener('blur', this.onWindowBlur);
    window.removeEventListener('beforeunload', this.onWindowUnload);
  }

  fullScreenAPIEventName = () =>
    toPairs({
      requestFullscreen: 'fullscreenchange',
      msRequestFullscreen: 'MSFullscreenChange',
      mozRequestFullScreen: 'mozfullscreenchange',
      webkitRequestFullscreen: 'webkitfullscreenchange'
    })
      .map(i => i[0] in document.documentElement && i[1])
      .filter(Boolean)
      .filter((fn, i) => i === 0)[0];

  getConfigurationDefaults() {
    return {
      cueDurationInitial: CUE_DURATION_IN_MILLIS,
      cueDurationIncrement: CUE_DURATION_INCREMENT,
      cueDurationMaximum: CUE_DURATION_MAXIMUM,
      lookCriterion: LOOK_CRITERION,
      trialCriterion: TRIAL_CRITERION
    };
  }
  getConfiguration() {
    return pick(this.state, CONFIGURABLE_KEYS);
  }
  getConfigurationEdits() {
    return pick(this.state.configurable, CONFIGURABLE_KEYS);
  }
  resetSettingsToDefaults() {
    this.setState({ configurable: this.getConfigurationDefaults() });
  }

  resetSettings() {
    const configurable = this.getConfiguration();
    this.setState({ configurable }, () => this.toggle(false));
  }

  saveSettings() {
    this.saveState(this.getConfigurationEdits(), () => {
      this.toggle(false);
      this.toast.success('Successfully saved settings.');
      this.experiment.setOptions(this.getConfiguration());
    });
  }

  visualAngleInPixels = angleInDegrees => {
    const { distance } = this.state;

    // The distance is in centimeters.
    const distanceInInches = distance / 2.54;
    const numberOfInches =
      Math.tan(angleInDegrees * Math.PI / 180 / 2) * (distanceInInches * 2);
    const dpi = this.props.dpi || 96;
    const dpr = this.props.pixelRatio || global.devicePixelRatio || 1;
    return Math.trunc(numberOfInches * dpi);
  };

  onFullScreen = e => {
    const isFullScreen =
      document.fullscreen ||
      document.msFullscreenElement ||
      document.webkitIsFullScreen ||
      document.mozFullScreen ||
      false;
    this.setState({ isFullScreen });
  };

  showShrink = e => {
    this.setState({ showShrink: true }, () => {
      setTimeout(() => {
        this.setState({ showShrink: false });
      }, 2000);
    });
  };

  showSpiral = e => {
    this.setState({ showSpiral: true }, () => {
      setTimeout(() => {
        this.setState({ showSpiral: false });
      }, 2000);
    });
  };

  showRotate = e => {
    this.setState({ showRotate: true }, () => {
      setTimeout(() => {
        this.setState({ showRotate: false });
      }, 2000);
    });
  };

  easy = object => {
    const { trialNumber, subjectID } = this.state;
    this.log(
      Object.assign(
        {
          subject: subjectID,
          trial: trialNumber,
          type:
            (trialNumber !== 0 &&
              (trialNumber % 2 === 0 ? 'Interesting' : 'Boring')) ||
            '',
          date: asLong()
        },
        object
      )
    );
  };

  csv() {
    const fields = [
      { label: 'Time', value: 'time' },
      { label: 'Text', value: 'text' },
      { label: 'Trial', value: 'trial' },
      { label: 'Trial Type', value: 'type' },
      { label: 'Item', value: 'object' },
      { label: 'Subject', value: 'subject' },
      { label: 'Date', value: 'date' }
    ];
    return CSV({ data: this.logger.data, fields });
  }

  download() {
    try {
      const csv = this.csv();
      download(csv, `${asLong()}.csv`, 'text/csv');
      this.downloadCompleted = true;
      withKey('last-csv').remove();
    } catch (err) {
      console.error(err);
    }
  }

  useNextSound(fn) {
    let { soundId } = this.state;
    soundId = ++soundId % allSounds.length;
    this.setState({ soundId }, fn);
  }

  onKeyDown(e) {
    if (
      e.target &&
      e.target === document.activeElement &&
      e.target.nodeName === 'INPUT'
    ) {
      return;
    }
    if (e.repeat) {
      return;
    }
    const isCtrl = e.ctrlKey || e.altKey;
    const code = e.which || e.keyCode;
    if (isCtrl && code < 32) {
      this.experiment.keyDown();
    }
    switch (e.which || e.keyCode) {
      case 49: // 1: Shrink
        return this.showShrink();
      case 50: // 2: Spiral
        return this.showSpiral();
      case 51: // 3: Rotate
        return this.showRotate();
      case 65: // A
        return this.playSound();
      case 80: // P
        return this.showSettings(e);
      case 81: // Q
        break;
      case 83: // CTRL-S
        if (e.metaKey || isCtrl) {
          e.preventDefault();
        }
      case 88: // X
        const { cueDuration, isCalibrating } = this.state;
        this.experiment.setCueDuration(cueDuration);
        break;
      default:
        break;
    }
  }

  onWindowBlur() {
    this.experiment.blur();
  }

  onWindowUnload() {
    try {
      const csv = this.csv();
      if (!this.downloadCompleted) {
        withKey('last-csv').set(csv);
      }
      withKey([name, version, asLong(), 'csv'].join('-')).set(csv);
    } catch (err) {
      console.error(err);
    }
  }

  onKeyUp(e) {
    const isCtrl = e.ctrlKey || e.altKey;
    const code = e.which || e.keyCode;
    if (!isCtrl && code < 32) {
      this.experiment.keyUp();
    }
  }

  playSound() {
    if (this.audioElement) {
      this.audioElement.play();
      this.didPlaySound();
    }
  }

  playSoundDidComplete() {
    this.useNextSound(_ => this.audioElement.load());
  }

  showSettings(e) {
    this.toggle(true);
    e.preventDefault();
  }

  showWindow = e => {
    if (this.window) {
      this.window.show();
    }
  };

  showFullScreen = e => {
    const { isFullScreen } = this.state;

    const el = document.documentElement;
    const exitFn = [
      'exitFullscreen',
      'mozCancelFullScreen',
      'webkitCancelFullScreen',
      'msExitFullscreen'
    ]
      .map(i => i in document && ::document[i])
      .filter(Boolean)
      .filter((fn, i) => i === 0 && fn)[0];

    const enterFn = [
      'requestFullscreen',
      'msRequestFullscreen',
      'mozRequestFullScreen',
      'webkitRequestFullscreen'
    ]
      .map(i => i in el && ::el[i])
      .filter(Boolean)
      .filter((fn, i) => i === 0)[0];

    // The full-screen change will be checked by onFullScreen().
    if (isFullScreen && exitFn) {
      exitFn();
    } else if (enterFn) {
      enterFn();
    }
  };

  onUpdateSubject = e => {
    const subjectText = e.target.value;
    this.setState({ subjectText });
  };

  onSaveSubject = e => {
    const { subjectID, subjectText } = this.state;
    this.setState(
      {
        subjectID: subjectText,
        subjectText,
        status: `The new subject ID is now ‘${subjectText || subjectID}’.`
      },
      _ => this.toggle(false)
    );
  };

  onCancelSubject = e => {
    e.preventDefault();
    const { subjectID } = this.state;
    this.setState({ subjectText: subjectID }, _ => this.toggle(false));
  };

  save = () => {
    if (!this.storage) {
      return;
    }
    const payload = pick(this.state, [
      'distance',
      'useImperial',
      'cueDurationInitial',
      'cueDurationMaximum',
      'cueDurationIncrement',
      'lookCriterion',
      'trialCriterion'
    ]);
    this.storage.set(payload);
  };

  saveState = (values, fn) => {
    this.setState(values, () => {
      fn && fn.apply(this, [...arguments]);
      this.save(arguments);
    });
  };

  onDistanceChange = e => {
    this.saveState({ distance: e.target.value }, () =>
      this.setState({ isRangeActive: false })
    );
  };

  onDistanceInput = e => {
    this.setState({ distance: e.target.value, isRangeActive: true });
  };

  formDidChange() {
    const messages = {
      type: 'Must be a whole number.',
      minimum: 'Must be a whole number greater than zero.',
      required: 'Required.'
    };
    const { valid, errors } = validate(
      this.state.configurable || {},
      {
        properties: {
          cueDurationInitial: {
            type: 'integer',
            allowEmpty: false,
            minimum: 1,
            messages
          },
          cueDurationIncrement: {
            type: 'integer',
            allowEmpty: false,
            minimum: 1,
            messages
          },
          cueDurationMaximum: {
            type: 'integer',
            allowEmpty: false,
            minimum: 1,
            dependencies: ['cueDurationInitial'],
            messages
          },
          lookCriterion: {
            type: 'integer',
            allowEmpty: false,
            minimum: 1,
            messages
          },
          trialCriterion: {
            type: 'integer',
            allowEmpty: false,
            minimum: 1,
            messages
          }
        }
      },
      { cast: true }
    );
    defer(() => {
      this.setState({
        isValid: valid,
        errors: fromPairs(errors.map(i => [i.property, i.message]))
      });
    });
  }

  componentWillUpdate() {
    if (!isEqual(this.getConfiguration(), this.getConfigurationEdits())) {
      this.formDidChange();
    }
  }

  render(
    { isTesting = false, ...props },
    {
      animationId = 0,
      cueDirection,
      isAnimating,
      isDistracting,
      isInterestingTrial,
      soundId = 0,
      trialNumber = 0,
      isStarted = false,
      isRangeActive = false,
      //////////////////////////////////////
      configurable = {},
      cueSize,
      distance,
      errors = {},
      events = [],
      isValid = false,
      status,
      subjectID,
      subjectText = '',
      validations = {},
      ...state
    }
  ) {
    const {
      cueDurationInitial,
      cueDurationIncrement,
      cueDurationMaximum,
      lookCriterion,
      trialCriterion
    } = configurable;

    const isBoring = !isInterestingTrial;
    const finishSrc = require('../../2017/flag-checkered.svg');
    let experimentStartSrc = require('../../2017/pause-circle.svg');
    if (!isStarted) {
      experimentStartSrc =
        trialNumber === 0 ? require('../../2017/play-circle.svg') : finishSrc;
    }

    // Format the distance as centimeters.
    const distanceText = new String(Math.floor(distance * 10.0))
      .match(/(\d+)(\d)/)
      .filter((_, i) => i > 0)
      .join('.');
    const distanceDisplay = [
      {
        text: `${distanceText} cm`,
        html: (
          <span>
            <strong>{distanceText}</strong> <abbr title="centimeters">cm</abbr>
          </span>
        )
      },
      {
        text: `${Math.floor(+distanceText / 2.5)}″`,
        html: (
          <span>
            <strong>{Math.floor(+distanceText / 2.5)}</strong>
            <abbr title="inches">&Prime;</abbr>
          </span>
        )
      }
    ];

    return (
      <div data-name="ff-app" {...props}>
        {false && (
          <pre>{this.experiment && JSON.stringify(this.experiment.state)}</pre>
        )}
        <Toast class="z-2" ref={el => (this.toast = el)} />
        <Range
          class={isRangeActive && 'active'}
          value={distance}
          min={Math.floor(DISTANCE_IN_CENTIMETERS / 4)}
          max={Math.floor(DISTANCE_IN_CENTIMETERS * 4)}
          step="2.5"
          title="Distance to Display"
          aria-role="slider"
          onChange={this.onDistanceChange}
          onInput={this.onDistanceInput}
        >
          <a
            href="#"
            class="pointer gray-color"
            data-balloon={distanceDisplay[state.useImperial ? 0 : 1].text}
            data-balloon-direction="down"
            title={`Toggle units for distance`}
            onclick={_ => this.saveState({ useImperial: !state.useImperial })}
          >
            {distanceDisplay[state.useImperial ? 1 : 0].html}
          </a>
          <a
            href="#"
            data-balloon={'Settings'}
            data-balloon-direction="down"
            onclick={::this.showSettings}
          >
            <SVG
              src={settingsSrc}
              class="ml-2 relative pointer"
              style="top: -1px; vertical-align: middle; fill: currentColor;"
              height="1.5em"
            />
          </a>
          {isStarted &&
            trialNumber > 0 && (
              <a
                href={`#${trialNumber}`}
                data-balloon="Finish the experiment and return to the welcome page."
                data-balloon-direction="down-left"
                onclick={e => {
                  e.preventDefault();
                  this.experiment.stop();
                }}
              >
                <SVG
                  src={finishSrc}
                  class="ml-2 relative pointer"
                  style="top: -1px; vertical-align: middle; fill: currentColor;"
                  height="1.5em"
                />
              </a>
            )}
          <a
            href="#"
            data-balloon={'Open a window'}
            data-balloon-direction="down"
            onclick={::this.showWindow}
          >
            <SVG
              src={windowSrc}
              class="ml-2 relative pointer"
              style="top: -1px; vertical-align: middle; fill: currentColor;"
              height="1.5em"
            />
          </a>
          <a
            href="#"
            data-balloon={
              state.isFullScreen
                ? 'Exit full screen view.'
                : 'Open the experiment in full screen view.'
            }
            data-balloon-direction="down-left"
            onclick={::this.showFullScreen}
          >
            <SVG
              src={fullScreenImages[state.isFullScreen ? 1 : 0]}
              class="ml-2 relative pointer"
              style="top: -1px; vertical-align: middle; fill: currentColor;"
              height="1.5em"
            />
          </a>
        </Range>

        <Cue
          isVisible={isDistracting}
          ref={el => (this.cueEL = el)}
          direction={cueDirection}
          offsetInPixels={this.visualAngleInPixels(CUE_ECCENTRICITY_IN_DEGREES)}
          size={this.visualAngleInPixels(CUE_SIZE_IN_DEGREES)}
        />
        {!isStarted && (
          <div data-name="ff-experiment-start">
            <button
              data-id="icon"
              data-balloon={
                trialNumber === 0
                  ? 'Start the experiment.'
                  : 'Finish the experiment and return to the welcome page.'
              }
              style={`width: ${this.visualAngleInPixels(
                ANIMATION_WIDTH_IN_DEGREES
              )}px; height: ${this.visualAngleInPixels(
                ANIMATION_WIDTH_IN_DEGREES
              )}px`}
              onclick={e => (trialNumber > 0 ? this.end : this.start)()}
            >
              <SVG src={experimentStartSrc} />
            </button>
            {trialNumber !== 0 && (
              <button
                data-id="download"
                class="btn"
                onclick={::this.download}
                style={`position: relative; top: ${this.visualAngleInPixels(
                  ANIMATION_WIDTH_IN_DEGREES
                ) / 2}px`}
              >
                Download CSV <i class="icon icon-download" />
              </button>
            )}
          </div>
        )}
        {isStarted &&
          !state.showRotate && (
            <Animation
              scale={this.visualAngleInPixels(ANIMATION_WIDTH_IN_DEGREES) / 148}
              style={`max-width: ${this.visualAngleInPixels(
                ANIMATION_WIDTH_IN_DEGREES
              )}; max-height: ${this.visualAngleInPixels(
                ANIMATION_HEIGHT_IN_DEGREES
              )}`}
              class={[
                state.showShrink && 'shrink',
                state.showSpiral && 'spiral'
              ]
                .filter(Boolean)
                .join(' ')}
              src={
                isTesting || isInterestingTrial
                  ? allAnimations[animationOrder[animationId]]
                  : boringAnimation
              }
              isRunning={isAnimating}
            />
          )}
        {state.showRotate && <ColorWheel />}
        <Modal
          title="Settings"
          header={
            <span>
              Settings{' '}
              <span
                data-balloon-size="md"
                data-balloon={`You can configure the cue duration settings for the current experiment.`}
              >
                <SVG class="gray-color text" src={helpSrc} />
              </span>
            </span>
          }
          footer={
            <div>
              <button
                onclick={::this.resetSettingsToDefaults}
                class="btn float-left"
                disabled={isEqual(
                  this.getConfigurationDefaults(),
                  this.getConfigurationEdits()
                )}
                data-balloon="Replace all values with original application settings."
              >
                Revert to Defaults
              </button>
              <div class="kr-actions">
                <button
                  disabled={!isValid}
                  onclick={::this.saveSettings}
                  class="btn btn-primary x-loading"
                >
                  Save & Return
                </button>
                <button onclick={::this.resetSettings} class="btn btn-link">
                  Cancel
                </button>
              </div>
            </div>
          }
          ref={el => el && (this.toggle = ::el.toggle)}
        >
          <form id="form-settings">
            <fieldset>
              {false && <pre>{JSON.stringify(this.state)}</pre>}
              <legend class="visuallyhidden">Cue Durations</legend>
              <div
                class={['form-group', errors.cueDurationInitial && 'has-error']
                  .filter(Boolean)
                  .join(' ')}
              >
                <label class="form-label" for="cue-duration-initial">
                  Initial Cue Duration
                </label>
                <input
                  id="cue-duration-initial"
                  class="form-input"
                  type="text"
                  onInput={this.linkState(
                    'configurable.cueDurationInitial',
                    this.formDidChange
                  )}
                  value={cueDurationInitial}
                  placeholder="Initial Duration"
                  pattern="^[0-9]+$"
                />
                <p class="form-input-hint">
                  {errors.cueDurationInitial ||
                    'The starting cue duration in milliseconds.'}
                </p>
              </div>
              <div
                class={[
                  'form-group',
                  errors.cueDurationIncrement && 'has-error'
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <label class="form-label" for="cue-duration-increment">
                  Cue Duration Increment
                </label>
                <input
                  id="cue-duration-increment"
                  class="form-input"
                  type="text"
                  onInput={this.linkState(
                    'configurable.cueDurationIncrement',
                    this.formDidChange
                  )}
                  value={cueDurationIncrement}
                  placeholder="Duration Increment"
                  pattern="^[0-9]+$"
                />
                <p class="form-input-hint">
                  {errors.cueDurationIncrement ||
                    'The number of milliseconds to increase for each trial during the calibration.'}
                </p>
              </div>
              <div
                class={['form-group', errors.cueDurationMaximum && 'has-error']
                  .filter(Boolean)
                  .join(' ')}
              >
                <label class="form-label" for="cue-duration-maximum">
                  Maximum Cue Duration
                </label>
                <input
                  id="cue-duration-maximum"
                  class="form-input"
                  type="text"
                  onInput={this.linkState(
                    'configurable.cueDurationMaximum',
                    this.formDidChange
                  )}
                  value={cueDurationMaximum}
                  placeholder="Maximum Cue Duration"
                  pattern="^[0-9]+$"
                />
                <p class="form-input-hint">
                  {errors.cueDurationMaximum ||
                    'The maximum value for the number of milliseconds to show the cue.'}
                </p>
              </div>
              <div
                class={['form-group', errors.lookCriterion && 'has-error']
                  .filter(Boolean)
                  .join(' ')}
              >
                <label class="form-label" for="look-criterion">
                  Look Criterion
                </label>
                <input
                  id="look-criterion"
                  class="form-input"
                  type="text"
                  onInput={this.linkState(
                    'configurable.lookCriterion',
                    this.formDidChange
                  )}
                  value={lookCriterion}
                  placeholder="Number of Calibration Trials"
                  pattern="^[0-9]+$"
                />
                <p class="form-input-hint">
                  {errors.lookCriterion ||
                    'The number of trials to use for calibration.'}
                </p>
              </div>
              <div
                class={['form-group', errors.trialCriterion && 'has-error']
                  .filter(Boolean)
                  .join(' ')}
              >
                <label class="form-label" for="trial-criterion">
                  Trial Criterion
                </label>
                <input
                  id="trial-criterion"
                  class="form-input"
                  type="text"
                  onInput={this.linkState(
                    'configurable.trialCriterion',
                    this.formDidChange
                  )}
                  value={trialCriterion}
                  placeholder="Number of Trials"
                  pattern="^[0-9]+$"
                />
                <p class="form-input-hint">
                  {errors.trialCriterion ||
                    'The number of trials to collect before ending the experiment.'}
                </p>
              </div>
            </fieldset>
          </form>
        </Modal>
        {false && <div>{this.renderAccessoryView({}, this.state)}</div>}
        <Popout ref={el => (this.window = el)}>
          {this.renderAccessoryView({}, this.state)}
        </Popout>
        {allSounds[soundId] && (
          <audio
            ref={e => (this.audioElement = e)}
            onended={::this.playSoundDidComplete}
            src={allSounds[soundOrder[soundId]]}
            preload="auto"
          />
        )}
      </div>
    );
  }

  renderAccessoryView(
    { ...props },
    {
      subjectID,
      trialNumber = 0,
      lookNumber = 0,
      cueDuration,
      cueDirection,
      events = [],
      ...state
    }
  ) {
    return (
      <div class="panel">
        <div class="panel-header text-center">
          <div class="panel-title h5 mt-10">{subjectID || 'No Subject ID'}</div>
          <div class="panel-subtitle">
            {trialNumber !== 0 && (
              <span class="chip">Trial #{trialNumber}</span>
            )}
            {state.isCalibrating && <span class="chip">Calibration</span>}
            <span class="chip">
              Cue Direction{' '}
              {cueDirection === 'left' ? (
                <i class="ml-1 icon icon-back" />
              ) : (
                <i class="ml-1 icon icon-forward" />
              )}
            </span>
            <span class="chip">Cue Duration {cueDuration}ms</span>
            {lookNumber !== 0 && <span class="chip">Look #{lookNumber}</span>}
          </div>
        </div>
        <div class="panel-body">
          <table class="table table-striped">
            <thead>
              <tr>
                {[
                  'trial',
                  'type',
                  'text',
                  'object',
                  'subject',
                  'date'
                ].map(name => (
                  <th class="monospace text-capitalize">{name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map(event => {
                return (
                  <tr>
                    {[
                      'trial',
                      'type',
                      'text',
                      'object',
                      'subject',
                      'date'
                    ].map(property => {
                      return <td class="monospace">{event[property] || ''}</td>;
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div class="panel-footer">
          <button
            onclick={e => {
              this.download();
              e.preventDefault();
            }}
            class="btn btn-primary btn-block"
          >
            Save
          </button>
        </div>
      </div>
    );
  }
}
