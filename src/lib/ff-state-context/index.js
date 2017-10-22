import 'lib/compatibility';

import cloneDeep from 'lodash/cloneDeep';
import fromPairs from 'lodash/fromPairs';
import isFunction from 'lodash/isFunction';
import once from 'lodash/once';
import partial from 'lodash/partial';
import toPairs from 'lodash/toPairs';

import { cycle, randomBinomials } from '../random';
import { uuid } from '../uuid';

const ANIMATION_CYCLE_DELAY = 2000;
const MINIMUM_BEFORE_CUE_IN_MILLIS = 1000;
const MAXIMUM_BEFORE_CUE_IN_MILLIS = 2000;
const DELAY_AFTER_CUE = 600;
const AWAY_DURATION = 1000;
const REWARD_DURATION = 2400;
const PUNISH_DURATION = 0;

class State {
  __state__ = true;
  uuid = uuid();
}

export default class {
  delegate = {};
  state = {};
  options = {
    lookCriterion: 2,
    trialCriterion: 80,
    cueDurationInitial: 200,
    cueDurationIncrement: 40,
    cueDurationMaximum: 1200
  };

  directions = cycle(randomBinomials, 4);

  constructor(options = {}) {
    this.setOptions(options);
  }

  getState = () => cloneDeep(this.state);

  start = () => {
    if (this.isStarted()) {
      return;
    }
    this.hasFocus = false;
    this.state = {
      isStarted: true,
      trialNumber: 0,
      cueDuration: this.options.cueDurationInitial,
      isCalibrating: true,
      isAnimating: true,
      isDistracting: false,
      lookNumber: 0
    };
    const {
      didExperimentStart,
      didAnimationStart,
      didStateChange
    } = this.delegate;
    isFunction(didExperimentStart) && didExperimentStart(this.getState());
    this.animationTimer = this.createAnimationTimer();
    isFunction(didAnimationStart) && didAnimationStart({ ...this.getState() });
    isFunction(didStateChange) && didStateChange(this.getState());
  };

  stop = () => {
    const { didExperimentEnd } = this.delegate;
    const { isStarted } = this.state;
    if (isStarted) {
      this.state = { ...this.state, isStarted: false };
      isFunction(didExperimentEnd) && didExperimentEnd(this.getState());
      clearInterval(this.animationTimer);
    }
  };

  keyDown = () => {
    if (!this.isStarted()) {
      return;
    }
    if (this.state.trialNumber === 0) {
      this.state.trialNumber++;
      this.state.cueDirection = this.nextDirectionAsBoolean();
      const { didStateChange } = this.delegate;
      isFunction(didStateChange) && didStateChange(this.getState());
    }
    if (!this.hasFocus) {
      this.nextTrial();
      this.hasFocus = true;
    }
  };

  keyUp = () => {
    this.hasFocus = false;
    isFunction(this.keyDelegate) && this.keyDelegate(false);
  };

  blur = () => (this.hasFocus = false);

  createAnimationTimer = () => {
    return setInterval(() => {
      if (!this.isInterestingTrial()) {
        return;
      }
      const { didAnimationChange } = this.delegate;
      isFunction(didAnimationChange) && didAnimationChange(this.getState());
    }, 2000);
  };

  isStarted = () => !!this.state.isStarted;

  isAnimating = () => this.state.isAnimating;

  isDistracting = () => this.state.isDistracting;

  getSaccadeAwayThreshold = () => this.state.cueDuration + AWAY_DURATION;

  getSaccadeThreshold = () => DELAY_AFTER_CUE;

  getDelayInMilliseconds = () =>
    MINIMUM_BEFORE_CUE_IN_MILLIS +
    (MAXIMUM_BEFORE_CUE_IN_MILLIS - MINIMUM_BEFORE_CUE_IN_MILLIS) *
      Math.random();

  nextDirectionAsBoolean = () => ::this.directions.next().value;

  isBoringTrial = () => this.state.trialNumber % 2 === 1;

  isInterestingTrial = () => (this.state.trialNumber || 0) % 2 === 0;

  reset() {
    clearInterval(this.animationTimer);
    this.state = {};
    this.nextTrial = once(::this._nextTrial);
    const { didStateChange } = this.delegate;
    isFunction(didStateChange) && didStateChange(this.getState());
  }

  setOptions = options => {
    const numericOptions = fromPairs(toPairs(options).map(([i, j]) => [i, +j]));
    this.options = { ...this.options, ...numericOptions };
    this.reset();
  };

  setCueDuration = cueDuration => {
    this._calibrateWithDuration(cueDuration);
  };

  _calibrateWithDuration = (cueDuration, options) => {
    if (!this.state.isCalibrating) {
      return;
    }
    this.state.cueDuration = cueDuration;
    this.state.isCalibrating = false;
    this.state.trialNumberAtCalibrationEnd =
      Math.max(0, this.state.trialNumber) + this.options.trialCriterion;
    const { didCalibrationEnd } = this.delegate;
    isFunction(didCalibrationEnd) &&
      didCalibrationEnd(this.getState(), options);
  };

  _incrementCueDuration = () => {
    // Reward.
    if (!this.state.isCalibrating) {
      return;
    }
    this.state.cueDuration += this.options.cueDurationIncrement;
    this.state.lookNumber = 0;

    if (this.state.cueDuration > this.options.cueDurationMaximum) {
      this._calibrateWithDuration(
        this.options.cueDurationMaximum,
        this.options
      );
    }
  };

  _incrementLook = () => {
    if (!this.state.isCalibrating) {
      return;
    }
    // Punish.
    if (++this.state.lookNumber >= this.options.lookCriterion) {
      this._calibrateWithDuration(this.state.cueDuration, this.options);
    }
  };

  _didSaccade() {
    const { didSaccade } = this.delegate;
    isFunction(didSaccade) &&
      didSaccade({ ...this.getState(), isSaccadeAway: this.isSaccadeAway });
  }

  _didSaccadeEarly() {
    this.state.reward = false;
    if (typeof this.isSaccadeAway !== 'undefined') {
      this._didSaccade();
    }
  }

  _nextTrial = () => {
    if (!this.state.isStarted) {
      return;
    }
    clearInterval(this.animationTimer);

    this.isSaccadeAway = undefined;
    this.state.reward = true;
    this.keyDelegate = ::this._didSaccadeEarly;

    // After 1-2s random delay, pause the animation and show the cue.
    setTimeout(() => {
      const {
        didAnimationStart,
        didAnimationStop,
        didCueChange,
        didStateChange,
        didSaccade,
        didNotSaccade
      } = this.delegate;

      // Freeze animation and show cue.
      this.state.isAnimating = false;
      this.state.isDistracting = true;
      this.isSaccadeAway = false;
      this.cueTime = window.performance.now();
      isFunction(didCueChange) && didCueChange(this.getState());
      isFunction(didAnimationStop) && didAnimationStop(this.getState());
      isFunction(didStateChange) && didStateChange(this.getState());

      // After 1000ms, don't report saccades as looks to cue.
      setTimeout(
        () => (this.isSaccadeAway = true),
        this.getSaccadeAwayThreshold()
      );

      // After the cue duration expires, hide the distractor.
      setTimeout(() => {
        this.state.isDistracting = false;
        isFunction(didCueChange) &&
          didCueChange({
            ...this.getState(),
            cueTimeElapsed: Math.floor(window.performance.now() - this.cueTime)
          });

        // After 600ms, we know what kind of saccade the subject made.
        setTimeout(() => {
          this.keyDelegate = ::this._didSaccade;
          this.state.isAnimating = this.state.reward;
          if (this.state.reward) {
            isFunction(didNotSaccade) && didNotSaccade(this.getState());
            this._incrementCueDuration();
          } else {
            this._incrementLook();
          }
          isFunction(didStateChange) && didStateChange(this.getState());
        }, this.getSaccadeThreshold());

        // After all work is complete, reset and restart the animation.
        setTimeout(() => {
          if (
            this.state.trialNumberAtCalibrationEnd &&
            this.state.trialNumber >= this.state.trialNumberAtCalibrationEnd
          ) {
            this.stop();
            return;
          }

          if (this.hasFocus) {
            this._nextTrial();
          } else {
            this.nextTrial = once(::this._nextTrial);
          }
          clearInterval(this.animationTimer);
          this.state.isAnimating = true;
          this.state.trialNumber++;

          this.state.cueDirection = this.nextDirectionAsBoolean()
            ? 'left'
            : 'right';

          this.isStarted() &&
            isFunction(didAnimationStart) &&
            didAnimationStart(this.getState());

          isFunction(didStateChange) && didStateChange(this.getState());
          if (!this.hasFocus && this.state.trialNumber % 2 === 0) {
            this.animationTimer = this.createAnimationTimer();
          }
        }, 3000);
      }, this.state.cueDuration);
    }, this.getDelayInMilliseconds());
  };
}
