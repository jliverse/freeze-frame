import _ from 'lodash';

import Context from '..';

/**
 * Take a mock function and an array of delegate function names and
 * return a delegate that listens for those functions along with the
 * function name called.
 */
function wrapDelegateFunctions(fn, names, properties) {
  const delegate = _.fromPairs(names.map(name => [name, _.partial(fn, name)]));
  delegate.calls = () =>
    fn.mock.calls.map(([i, j]) => {
      return properties ? [i, _.pick(j, properties)] : [i, j];
    });

  return delegate;
}

describe('24 Oct 2017', () => {
  test('Boundary 999s after key down', () => {
    jest.useFakeTimers();
    const fn = jest.fn();
    const context = new Context();
    context.delegate = wrapDelegateFunctions(
      fn,
      ['didSaccade', 'didNotSaccade', 'didCalibrationEnd'],
      ['isSaccadeAway', 'isSaccadeEarly', 'lookNumber', 'didMaintainFocus']
    );
    context.getDelayInMilliseconds = () => 1000;
    context.start();

    context.keyDown();
    jest.runTimersToTime(1000 - 1);
    context.keyUp();
    jest.runTimersToTime(10000);

    expect(context.delegate.calls()).toEqual([
      [
        'didSaccade',
        {
          isSaccadeAway: true,
          isSaccadeEarly: true,
          lookNumber: 0,
          didMaintainFocus: false
        }
      ]
    ]);
  });
  test('Boundary 1001s after key down', () => {
    jest.useFakeTimers();
    const fn = jest.fn();
    const context = new Context();
    context.delegate = wrapDelegateFunctions(
      fn,
      ['didSaccade', 'didNotSaccade', 'didCalibrationEnd'],
      ['isSaccadeAway', 'isSaccadeEarly', 'lookNumber', 'didMaintainFocus']
    );
    context.getDelayInMilliseconds = () => 1000;
    context.start();

    context.keyDown();
    jest.runTimersToTime(1000 + 1);
    context.keyUp();
    jest.runTimersToTime(10000);

    expect(context.delegate.calls()).toEqual([
      [
        'didSaccade',
        {
          isSaccadeAway: false,
          isSaccadeEarly: false,
          lookNumber: 1,
          didMaintainFocus: false
        }
      ]
    ]);
  });
  test('Boundary tests after key down', () => {
    jest.useFakeTimers();

    const calls = [];

    [
      0,
      0 + 1,
      1000 - 1,
      1000 + 1,
      1000 + 200 - 1,
      1000 + 200 + 1,
      1000 + 200 + 600 - 1,
      1000 + 200 + 600 + 1,
      1000 + 200 + 600 + 400 - 1,
      1000 + 200 + 600 + 400 + 1,
      1000 + 200 + 600 + 2400 - 1,
      1000 + 200 + 600 + 2400 + 1
    ].forEach(time => {
      const fn = jest.fn();
      const context = new Context();
      context.delegate = wrapDelegateFunctions(
        fn,
        ['didSaccade', 'didNotSaccade', 'didCalibrationEnd'],
        [
          'trialNumber',
          'isSaccadeAway',
          'isSaccadeEarly',
          'lookNumber',
          'didMaintainFocus'
        ]
      );
      context.getDelayInMilliseconds = () => 1000;
      context.start();

      context.keyDown();
      jest.runTimersToTime(time);
      context.keyUp();
      jest.runTimersToTime(10000);

      const event = {};
      event[time] = context.delegate
        .calls()
        .map(i => [
          i[0],
          [
            i[1]['trialNumber'],
            i[1]['isSaccadeEarly'] ? 'Early' : 'Not Early',
            i[1]['didMaintainFocus']
              ? 'No Saccade'
              : i[1]['isSaccadeAway'] ? 'Saccade Away' : 'Saccade to Cue',
            i[1]['lookNumber'] || 0
          ]
        ]);
      calls.push(event);
    });

    expect(calls).toEqual([
      { '0': [['didSaccade', [1, 'Early', 'Saccade Away', 0]]] },
      { '1': [['didSaccade', [1, 'Early', 'Saccade Away', 0]]] },
      { '999': [['didSaccade', [1, 'Early', 'Saccade Away', 0]]] },
      { '1001': [['didSaccade', [1, 'Not Early', 'Saccade to Cue', 1]]] },
      { '1199': [['didSaccade', [1, 'Not Early', 'Saccade to Cue', 1]]] },
      { '1201': [['didSaccade', [1, 'Not Early', 'Saccade to Cue', 1]]] },
      { '1799': [['didSaccade', [1, 'Not Early', 'Saccade to Cue', 1]]] },
      {
        '1801': [
          ['didNotSaccade', [1, 'Not Early', 'No Saccade', 0]],
          ['didSaccade', [1, 'Not Early', 'No Saccade', 0]]
        ]
      },
      {
        '2199': [
          ['didNotSaccade', [1, 'Not Early', 'No Saccade', 0]],
          ['didSaccade', [1, 'Not Early', 'No Saccade', 0]]
        ]
      },
      {
        '2201': [
          ['didNotSaccade', [1, 'Not Early', 'No Saccade', 0]],
          ['didSaccade', [1, 'Not Early', 'No Saccade', 0]]
        ]
      },
      {
        '4199': [
          ['didNotSaccade', [1, 'Not Early', 'No Saccade', 0]],
          ['didSaccade', [1, 'Not Early', 'No Saccade', 0]]
        ]
      },
      {
        '4201': [
          ['didNotSaccade', [1, 'Not Early', 'No Saccade', 0]],
          ['didSaccade', [2, 'Early', 'Saccade Away', 0]]
        ]
      }
    ]);
  });
  test(`The cue duration can be set by two early saccades before the cue appears and doesn't count as a look.`, () => {
    jest.useFakeTimers();
    const fn = jest.fn();
    const context = new Context();
    context.delegate = {
      didCalibrationEnd: jest.fn()
    };
    context.getDelayInMilliseconds = () => 1000;
    context.start();

    // Trial #1 Make a saccade before the cue appears.
    context.keyDown();
    jest.runTimersToTime(1000 - 1);
    context.keyUp();
    jest.runTimersToTime(1 + context.state.cueDuration + 3000);

    // Trial #2 Make a saccade before the cue appears.
    context.keyDown();
    jest.runTimersToTime(1000 - 1);
    context.keyUp();
    jest.runTimersToTime(1 + context.state.cueDuration + 3000);
    expect(context.delegate.didCalibrationEnd).not.toBeCalled();
  });
  test('The cue duration can be set by two early saccades before the cue appears.', () => {
    jest.useFakeTimers();
    const fn = jest.fn();
    const context = new Context();
    context.delegate = wrapDelegateFunctions(fn, [
      'didSaccade',
      'didNotSaccade',
      'didCalibrationEnd'
    ]);
    context.getDelayInMilliseconds = () => 1000;
    context.start();

    // Trial #1 Make a saccade before the cue appears.
    context.keyDown();
    jest.runTimersToTime(1000 - 1);
    context.keyUp();
    jest.runTimersToTime(1 + context.state.cueDuration + 3000);

    // Trial #2 Make a saccade before the cue appears.
    context.keyDown();
    jest.runTimersToTime(1000 - 1);
    context.keyUp();
    jest.runTimersToTime(1 + context.state.cueDuration + 3000);

    expect(
      fn.mock.calls.map(([i, j]) => {
        return [i, _.pick(j, ['cueDuration', 'isDistracting'])];
      })
    ).toEqual([
      ['didSaccade', { cueDuration: 200, isDistracting: false }],
      ['didSaccade', { cueDuration: 200, isDistracting: false }]
    ]);
  });
});

describe('18 Oct 2017', () => {
  test('There is a saccade before the cue appears.', () => {
    jest.useFakeTimers();
    const context = new Context();
    context.delegate = {
      didSaccade: jest.fn()
    };
    context.getDelayInMilliseconds = () => 1000;
    context.start();
    context.keyDown();

    // Make a saccade before the cue appears.
    jest.runTimersToTime(1000 - 1);
    context.keyUp();
    jest.runTimersToTime(1 + context.state.cueDuration + 3000);
    // Reverted on 28 Oct 2017.
    expect(context.delegate.didSaccade).toBeCalled();
  });
  test('There is a saccade after the cue appears.', () => {
    jest.useFakeTimers();
    const context = new Context();
    context.delegate = {
      didSaccade: jest.fn()
    };
    context.getDelayInMilliseconds = () => 1000;
    context.start();
    context.keyDown();

    // Make a saccade after the cue appears.
    jest.runTimersToTime(1000 + 1);
    context.keyUp();
    jest.runTimersToTime(-1 + context.state.cueDuration + 3000);
    expect(context.delegate.didSaccade).toBeCalled();
  });
  test(`Saccades before 1000ms should be logged as 'looks to cue', which should only be logged after the cue is visible.`, () => {
    jest.useFakeTimers();
    const fn = jest.fn();
    const context = new Context();
    context.delegate = wrapDelegateFunctions(fn, [
      'didCueChange',
      'didSaccade',
      'didNotSaccade',
      'didAnimationStart'
    ]);
    context.getDelayInMilliseconds = jest.fn();
    context.getDelayInMilliseconds.mockReturnValue(1000);
    context.start();
    context.keyDown();

    // Wait for the random delay and show the cue for 200ms
    jest.runTimersToTime(1000);
    jest.runTimersToTime(1);
    context.keyUp(); // #1
    jest.runTimersToTime(context.state.cueDuration);
    jest.runTimersToTime(800);
    jest.runOnlyPendingTimers();
    expect(
      fn.mock.calls.map(([i, j]) => {
        return [i, _.pick(j, ['isSaccadeAway', 'isDistracting'])];
      })
    ).toEqual([
      ['didAnimationStart', { isDistracting: false }],
      ['didCueChange', { isDistracting: true }],
      ['didSaccade', { isDistracting: true, isSaccadeAway: false }],
      ['didCueChange', { isDistracting: false }],
      ['didAnimationStart', { isDistracting: false }]
    ]);
  });
});

describe('12 Oct 2017', () => {
  test(`Saccades before 1000ms should be logged as 'looks to cue' and afterward as 'looks away'.`, () => {
    jest.useFakeTimers();
    const fn = jest.fn();
    const context = new Context();
    context.delegate = wrapDelegateFunctions(fn, [
      'didSaccade',
      'didNotSaccade',
      'didAnimationStart'
    ]);
    context.getDelayInMilliseconds = jest.fn();
    context.getDelayInMilliseconds.mockReturnValue(1000);
    context.start();
    context.keyDown();

    // Wait for the random delay and show the cue for 200ms
    jest.runTimersToTime(1000 + context.state.cueDuration + 1);

    //  Wait another 800ms to get down/up samples at 800, 900, 1000 and 1100 ms.
    // We expect the first two will be false and the next two to be true.
    jest.runTimersToTime(800);
    context.keyDown();
    context.keyUp(); // #1
    jest.runTimersToTime(100);
    context.keyDown();
    context.keyUp(); // #2
    jest.runTimersToTime(100);
    context.keyDown();
    context.keyUp(); // #3
    jest.runTimersToTime(100);
    context.keyDown();
    context.keyUp(); // #4
    jest.runOnlyPendingTimers();
    expect(fn.mock.calls.map(([i, j]) => i)).toEqual([
      'didAnimationStart',
      'didNotSaccade',
      'didSaccade', // #1
      'didSaccade', // #2
      'didSaccade', // #3
      'didSaccade', // #4
      'didAnimationStart'
    ]);
    expect(
      fn.mock.calls
        .filter(([i, j]) => i === 'didSaccade')
        .map(([i, j]) => _.pick(j, ['isSaccadeAway']))
    ).toEqual([
      { isSaccadeAway: false },
      { isSaccadeAway: false },
      { isSaccadeAway: true },
      { isSaccadeAway: true }
    ]);
  });
});

describe('28 Sept 2017', () => {
  test('Multiple late saccades (after 600ms) should be logged.', () => {
    jest.useFakeTimers();
    const fn = jest.fn();
    const context = new Context();
    context.delegate = wrapDelegateFunctions(fn, [
      'didSaccade',
      'didNotSaccade',
      'didAnimationStart'
    ]);
    context.getDelayInMilliseconds = jest.fn();
    context.getDelayInMilliseconds.mockReturnValue(1000);
    context.start();
    context.keyDown();
    jest.runTimersToTime(1000 + context.state.cueDuration + 600 + 1);
    context.keyUp(); // #1
    jest.runTimersToTime(1);
    context.keyUp(); // #2
    jest.runTimersToTime(1);
    context.keyUp(); // #3
    jest.runTimersToTime(1);
    context.keyUp(); // #4
    jest.runTimersToTime(1);
    context.keyUp(); // #5
    jest.runTimersToTime(2400 - 5);
    expect(fn.mock.calls.map(([i, j]) => i)).toEqual([
      'didAnimationStart',
      'didNotSaccade',
      'didSaccade', // #1
      'didSaccade', // #2
      'didSaccade', // #3
      'didSaccade', // #4
      'didSaccade', // #5
      'didAnimationStart'
    ]);
  });
});

describe('New Scenarios', () => {
  test(`#8 Report late saccades.`, () => {
    jest.useFakeTimers();
    const delegate = {
      didSaccade: jest.fn(),
      didNotSaccade: jest.fn()
    };
    const context = new Context();
    context.delegate = delegate;
    context.start();
    context.keyDown();
    jest.runTimersToTime(1000 + context.state.cueDuration);
    jest.runTimersToTime(600);
    jest.runTimersToTime(2400 - 1);
    context.keyUp();
    jest.runTimersToTime(1);
    expect(delegate.didNotSaccade).toHaveBeenCalledTimes(1);
    expect(delegate.didSaccade).toHaveBeenCalledTimes(1);
  });

  test(`#1b The experiment should ignore keyDown when it's not running.`, () => {});

  test(`#1a The experiment should know when it's running.`, () => {
    jest.useFakeTimers();
    const context = new Context();
    expect(context.isStarted()).toBe(false);
    context.start();
    expect(context.isStarted()).toBe(true);
  });

  test(`#4 The trial #0 should be 'Interesting', and trial #1 should be 'Boring'.`, () => {
    jest.useFakeTimers();
    const delegate = {};

    const context = new Context();
    context.delegate = delegate;
    context.getDelayInMilliseconds = () => 1000;
    context.start();

    expect(context.isBoringTrial()).toBe(false);
    expect(context.isInterestingTrial()).toBe(true);
    context.keyDown();
    expect(context.isBoringTrial()).toBe(true);
    expect(context.isInterestingTrial()).toBe(false);
    jest.runTimersToTime(3000);
  });

  test('#7 The experiment should only end once.', () => {
    jest.useFakeTimers();

    const delegate = {
      didExperimentEnd: jest.fn()
    };

    const context = new Context();
    context.delegate = delegate;
    context.getDelayInMilliseconds = () => 1000;
    context.start();

    // Hold the CTRL key down for a no-look experiment lasting one hour.
    context.keyDown();
    jest.runTimersToTime(1 * 60 * 60 * 1000);
    expect(delegate.didExperimentEnd).toHaveBeenCalledTimes(1);
  });

  test('#3 The trials should trigger animation stop/starts in a consistent order.', () => {
    jest.useFakeTimers();

    const fn = jest.fn();
    const delegate = {
      didAnimationStart: state =>
        fn({
          name: 'Start',
          cueDuration: state.cueDuration,
          trialNumber: state.trialNumber
        }),
      didAnimationStop: state =>
        fn({
          name: 'Stop',
          cueDuration: state.cueDuration,
          trialNumber: state.trialNumber
        }),
      didNotSaccade: state =>
        fn({
          name: 'Continues',
          cueDuration: state.cueDuration,
          trialNumber: state.trialNumber
        })
    };

    const context = new Context();
    context.delegate = delegate;
    context.getDelayInMilliseconds = () => 1000;
    context.start();

    // Hold the CTRL key down for a no-look experiment.
    context.keyDown();
    jest.runTimersToTime(
      ((context.options.cueDurationMaximum -
        context.options.cueDurationInitial) /
        context.options.cueDurationIncrement +
        context.options.trialCriterion +
        1) *
        3000
    ); // 106 trials

    const values = _.flatten(fn.mock.calls);
    const maxTrialNumber = values[values.length - 1].trialNumber;
    const trialsAndEvents = [];
    for (let i = 0; i <= maxTrialNumber; i++) {
      trialsAndEvents[i] = [];
    }

    values.forEach(value =>
      trialsAndEvents[value.trialNumber].push(value.name)
    );

    const expectedArray = [];
    _.times(64, () => {
      expectedArray.push('Start, Stop, Continues');
    });
    expect(
      _.chunk(_.flatten(trialsAndEvents), 3).map(i => i.join(', '))
    ).toEqual(expectedArray);
  });

  test('The trial criterion (80 trials) should be counted after calibration is set', () => {
    jest.useFakeTimers();

    const delegate = {
      didStateChange: jest.fn(),
      didCalibrationEnd: jest.fn(),
      didExperimentEnd: jest.fn()
    };

    const context = new Context();
    context.delegate = delegate;
    context.getDelayInMilliseconds = () => 1000;
    context.start();

    // Hold the CTRL key down for a no-look experiment to require that
    // the cue duration hits its default maximum at 1200 ms before
    // the calibration end.
    context.keyDown();
    jest.runTimersToTime(
      ((context.options.cueDurationMaximum -
        context.options.cueDurationInitial) /
        context.options.cueDurationIncrement +
        context.options.trialCriterion +
        100) *
        3000
    ); // 106 trials

    const calibrationEndValues = _.flatten(
      delegate.didCalibrationEnd.mock.calls
    ).map(i => _.pick(i, ['cueDuration', 'trialNumber']));
    expect(calibrationEndValues).toEqual([
      { cueDuration: context.options.cueDurationMaximum, trialNumber: 26 },
      {}
    ]);

    const experimentEndValues = _.flatten(
      delegate.didExperimentEnd.mock.calls
    ).map(i => _.pick(i, ['cueDuration', 'trialNumber']));
    expect(experimentEndValues).toEqual([
      {
        cueDuration: context.options.cueDurationMaximum,
        trialNumber: 26 + context.options.trialCriterion
      }
    ]);
  });

  test('The trials should be Interesting/Boring/Interesting/...', () => {
    const expectedCalls = [
      { isAnimating: true, trialNumber: 0 },
      { isAnimating: true, trialNumber: 0 },
      { isAnimating: true, trialNumber: 1 },
      { isAnimating: false, trialNumber: 1 },
      { isAnimating: false, trialNumber: 1 },
      { isAnimating: true, trialNumber: 1 },
      { isAnimating: true, trialNumber: 2 },
      { isAnimating: true, trialNumber: 2 },
      { isAnimating: false, trialNumber: 2 },
      { isAnimating: false, trialNumber: 2 },
      { isAnimating: false, trialNumber: 2 },
      { isAnimating: true, trialNumber: 3 },
      { isAnimating: true, trialNumber: 3 }
    ];

    jest.useFakeTimers();
    const mockFn = jest.fn();
    const fn = state => {
      const values = _.pick(state, ['isAnimating', 'trialNumber']);
      mockFn({ ...values });
    };
    const delegate = {
      didAnimationStart: fn,
      didAnimationStop: fn,
      didStateChange: fn
    };
    const context = new Context();
    context.delegate = delegate;
    context.getDelayInMilliseconds = () => 1000;
    context.start();

    // Trial
    context.keyDown();
    jest.runTimersToTime(1000 + context.state.cueDuration + 600);
    context.keyUp();
    jest.runTimersToTime(3000);

    expect(_.flatten(mockFn.mock.calls)).toEqual(expectedCalls.slice(0, 8));

    // Trial
    context.keyDown();
    jest.runTimersToTime(1000 + context.state.cueDuration);
    context.keyUp();
    jest.runTimersToTime(600);
    jest.runTimersToTime(3000);

    expect(_.flatten(mockFn.mock.calls)).toEqual(expectedCalls);
  });

  test('Interesting Trial should be animated until random delay expires.', () => {
    jest.useFakeTimers();
    const delegate = {
      didAnimationChange: jest.fn()
    };
    const context = new Context();
    context.delegate = delegate;
    context.getDelayInMilliseconds = () => 1000;
    context.start();

    // Trial #3 Boring
    context.state.trialNumber = 3;
    expect(context.isBoringTrial()).toBe(true);
    context.keyDown();
    jest.runTimersToTime(1000 + context.state.cueDuration + 1); // Fast saccade to trigger pause.
    context.keyUp();
    context.keyDown(); // Back down to trigger an immediate next trial.
    jest.runTimersToTime(3000 - 2); // Just before next trial.
    expect(context.isAnimating()).toBe(false);
    jest.runTimersToTime(1); // Next trial.
    expect(context.isInterestingTrial()).toBe(true);
    expect(context.isAnimating()).toBe(true);
  });

  test('Simple trial.', () => {
    jest.useFakeTimers();
    const context = new Context();
    context.getDelayInMilliseconds = () => 1500;

    context.start();
    context.keyDown();
    expect(context.state.trialNumber).toBe(1);
    jest.runTimersToTime(1500 + context.state.cueDuration + 1);
    expect(context.isAnimating()).toBe(false);
    jest.runTimersToTime(600 + 1);
    expect(context.isAnimating()).toBe(true);
    expect(context.state.trialNumber).toBe(1);
  });
  test('Pressing and releasing CTRL before the cue will count as a saccade.', () => {
    jest.useFakeTimers();
    const context = new Context();
    context.getDelayInMilliseconds = () => 1000;

    context.start();
    context.keyDown();
    jest.runTimersToTime(context.getDelayInMilliseconds() - 1);
    context.keyUp();
    jest.runTimersToTime(1);
    expect(context.isAnimating()).toBe(false);
    expect(context.trialNumber).toBeUndefined();
  });

  test('Holding CTRL will trigger continuous trials.', () => {
    jest.useFakeTimers();
    const context = new Context();
    context.getDelayInMilliseconds = () => 1000;

    context.start();
    context.keyDown(); // 1
    expect(context.state.trialNumber).toBe(1);
    jest.runTimersToTime(1000 + context.state.cueDuration + 3000); // 2
    expect(context.state.trialNumber).toBe(2);
    jest.runTimersToTime(1000 + context.state.cueDuration + 3000); // 3
    expect(context.state.trialNumber).toBe(3);
  });

  test(`Random CTRL events won't trigger continuous trials.`, () => {
    jest.useFakeTimers();
    const context = new Context();
    context.getDelayInMilliseconds = () => 1000;

    const randomlyHitKeys = (times = 10) => {
      _.times(times, () =>
        (Math.random() < 0.5 ? ::context.keyDown : ::context.keyUp)()
      );
    };
    context.start();
    context.keyDown();
    expect(context.state.lookNumber).toBe(0);
    expect(context.state.trialNumber).toBe(1);
    randomlyHitKeys();
    jest.runTimersToTime(500);
    randomlyHitKeys();
    jest.runTimersToTime(500);
    randomlyHitKeys(); // Look #1
    jest.runTimersToTime(100); // Cue visible here.
    randomlyHitKeys();
    jest.runTimersToTime(100);
    randomlyHitKeys();
    jest.runTimersToTime(300);
    randomlyHitKeys();
    jest.runTimersToTime(300);
    randomlyHitKeys();
    jest.runTimersToTime(1200);
    randomlyHitKeys();
    jest.runTimersToTime(1200 - 1);
    context.keyUp();
    jest.runTimersToTime(1);
    expect(context.state.lookNumber).toBe(1);
    expect(context.state.trialNumber).toBe(2);
    jest.runTimersToTime(10000);
    expect(context.state.trialNumber).toBe(2);
  });

  test(`Multiple CTRL UP events won't trigger continuous trials.`, () => {
    jest.useFakeTimers();
    const context = new Context();
    context.getDelayInMilliseconds = () => 1000;

    context.start();
    context.keyDown();
    expect(context.state.lookNumber).toBe(0);
    expect(context.state.trialNumber).toBe(1);
    jest.runTimersToTime(1000 + 200 + 600);
    context.keyDown(); // 2
    context.keyUp();
    context.keyDown(); // 3
    context.keyUp();
    context.keyDown(); // 4
    context.keyUp();
    context.keyDown(); // 5
    context.keyUp();
    context.keyDown(); // 6
    context.keyUp();
    context.keyDown(); // 7
    context.keyUp();
    jest.runTimersToTime(2400);
    expect(context.state.lookNumber).toBe(0);
    expect(context.state.trialNumber).toBe(2);
    jest.runTimersToTime(4000);
    expect(context.state.trialNumber).toBe(2);
  });

  test(`Multiple CTRL DOWN events won't trigger continuous trials.`, () => {
    jest.useFakeTimers();
    const context = new Context();
    context.getDelayInMilliseconds = () => 1000;

    context.start();
    context.keyDown(); // Start trial #1.
    expect(context.state.trialNumber).toBe(1);
    jest.runTimersToTime(1000 + 200 + 600);
    context.keyDown();
    context.keyDown();
    context.keyDown();
    context.keyDown();
    context.keyDown();
    jest.runTimersToTime(2400);
    expect(context.state.trialNumber).toBe(2);
    jest.runTimersToTime(4200); // Skip trial #2 with CTRL down.
    jest.runTimersToTime(4200); // Now trial #3
    expect(context.state.trialNumber).toBe(3);
  });
});

describe('Procedure (2008)', () => {
  describe('Initially, interesting animations were presented at the center of the screen, changing every 2 s until the infant fixated on them.', () => {
    test('Initially, interesting animations were presented...', () => {
      const context = new Context();
      context.start();
      expect(context.isInterestingTrial()).toBe(true);
    });
    test('...at the center of the screen...', () => {
      // See the in-browser validation for this test in
      // components/ff-app/__browser__/*.js.
      expect(window.href).toBeUndefined();
    });
    test('...changing every 2s...', () => {
      jest.useFakeTimers();
      const delegate = {
        didStateChange: jest.fn(),
        didAnimationChange: jest.fn()
      };
      const context = new Context();
      context.delegate = delegate;
      context.start();
      expect(delegate.didAnimationChange).not.toBeCalled();
      jest.runTimersToTime(2000);
      expect(delegate.didAnimationChange).toHaveBeenCalledTimes(1);
      jest.runTimersToTime(4000);
      expect(delegate.didAnimationChange).toHaveBeenCalledTimes(1 + 2);
      jest.runTimersToTime(8000);
      expect(delegate.didAnimationChange).toHaveBeenCalledTimes(1 + 2 + 4);
    });
  });
  describe('Once the experimenter judged that the infant was fixated on the animations, she pressed a key on the keyboard to start the first trial.', () => {
    test('...she pressed a key on the keyboard to start the first trial', () => {
      const context = new Context();
      context.start();
      context.keyDown();
      expect(context.state.trialNumber).toBe(1);
    });
  });
  describe('In each trial, the animation froze after a delay of 1000 to 2000 ms (varied to avoid anticipatory eye movements) and at the same time a distractor appeared randomly on either the right or left side of the screen.', () => {
    test('In each trial, the animation froze after a delay of 1000 to 2000 ms...', () => {
      const delegate = {
        didAnimationChange: jest.fn(),
        didAnimationStart: jest.fn(),
        didAnimationStop: jest.fn()
      };

      jest.useFakeTimers();
      const context = new Context();
      context.delegate = delegate;
      context.state.trialNumber = 1;
      context.getDelayInMilliseconds = jest.fn();
      context.getDelayInMilliseconds.mockReturnValue(1000);

      context.start();
      context.keyDown();
      jest.runTimersToTime(1000 - 1);
      expect(delegate.didAnimationStart).toBeCalled();
      expect(delegate.didAnimationStop).not.toBeCalled();
      expect(delegate.didAnimationChange).not.toBeCalled();
      jest.runTimersToTime(1);
      expect(delegate.didAnimationStop).toHaveBeenCalledTimes(1);
      jest.runTimersToTime(1000);
      jest.runTimersToTime(1000);
      jest.runTimersToTime(1000);
      expect(delegate.didAnimationStart).toBeCalled();
      expect(delegate.didAnimationStop).toHaveBeenCalledTimes(1);
      expect(delegate.didAnimationChange).not.toBeCalled();
    });
    test('...and at the same time a distractor appeared randomly on either the right or left side of the screen.', () => {
      const delegate = {
        didAnimationStart: jest.fn(),
        didAnimationStop: jest.fn()
      };

      jest.useFakeTimers();
      const context = new Context();
      context.delegate = delegate;
      context.state.trialNumber = 1;
      context.getDelayInMilliseconds = jest.fn();
      context.getDelayInMilliseconds.mockReturnValue(1000);

      context.start();
      context.keyDown();
      jest.runTimersToTime(1000 - 1);
      expect(delegate.didAnimationStop).not.toBeCalled();
      jest.runTimersToTime(1);
      expect(delegate.didAnimationStop).toHaveBeenCalledTimes(1);
      expect(context.isDistracting());
    });
    test('The randomly chosen side of the screen is shuffled in groups of four to avoid repeats.', () => {
      const context = new Context();
      context.start();
      expect(context.isDistracting());

      // Generate sixteen random left-or-right values and make sure that we have the same number.
      const flips = _.times(16, context.nextDirectionAsBoolean);
      const [left, right] = _.partition(flips, Boolean);
      expect(left).toEqual(right.map(i => !i));
    });
  });
  describe('The duration of the distractor presentation was calibrated individually (see below).', () => {});
  describe('The experimenter indicated whether the infant made a saccade toward the distractor stimulus by releasing the key on the keyboard.', () => {
    test('There is a keyUp event.', () => {
      jest.useFakeTimers();
      const delegate = {
        didSaccade: jest.fn(),
        didNotSaccade: jest.fn()
      };
      const context = new Context();
      context.delegate = delegate;
      context.getDelayInMilliseconds = () => 1000;
      context.start();
      context.keyDown();
      expect(context.delegate).toBe(delegate);
      expect(_.isFunction(context.keyUp)).toBe(true);

      // Make a saccade just before the timer expires.
      jest.runTimersToTime(1000 + context.state.cueDuration + 600 - 1);
      context.keyUp();

      // The event will only fire at the delay.
      // jest.runOnlyPendingTimers();

      expect(delegate.didSaccade).toBeCalled();
      expect(delegate.didNotSaccade).not.toBeCalled();
    });
  });
  describe('If the infant made a saccade toward the distractor stimulus within 600 ms (as indicated by the experimenter’s key release and regardless of whether the distractor was still on the screen), the animation remained frozen for 3000 ms, and then a new trial was started.', () => {
    test('If the infant made a saccade [...] within 600 ms ([...] and regardless of whether the distractor was still on the screen), the animation remained frozen for 3000 ms, and then a new trial was started.', () => {
      jest.useFakeTimers();
      const delegate = {
        didSaccade: jest.fn(),
        didNotSaccade: jest.fn(),
        didAnimationStart: jest.fn()
      };
      const context = new Context();
      context.delegate = delegate;
      context.getDelayInMilliseconds = jest.fn();
      context.getDelayInMilliseconds.mockReturnValue(1000);
      context.start();
      expect(delegate.didAnimationStart).toHaveBeenCalledTimes(1);
      context.keyDown();
      jest.runTimersToTime(1000 + context.state.cueDuration + 600 - 1);
      context.keyUp();
      expect(delegate.didSaccade).toBeCalled();
      expect(context.hasFocus).toBe(false);
      jest.runTimersToTime(1);
      expect(delegate.didSaccade).toBeCalled();
      expect(context.isAnimating()).toBe(false);
      jest.runTimersToTime(2399);
      expect(delegate.didAnimationStart).toHaveBeenCalledTimes(1);
      expect(context.isAnimating()).toBe(false);
      jest.runTimersToTime(1);
      expect(context.isAnimating()).toBe(true);
      expect(delegate.didAnimationStart).toHaveBeenCalledTimes(2);
    });
  });
  describe('If the infant did not make a saccade toward the distractor within 600 ms (and the experimenter did not release the key), the animation continued for another 2400 ms before the next trial was presented.', () => {
    test('If the infant did not make a saccade [...]  the animation continued for another 2400 ms before the next trial was presented.', () => {
      jest.useFakeTimers();
      const delegate = {
        didAnimationStart: jest.fn(),
        didSaccade: jest.fn(),
        didNotSaccade: jest.fn()
      };
      const context = new Context();
      context.delegate = delegate;
      context.getDelayInMilliseconds = jest.fn();
      context.getDelayInMilliseconds.mockReturnValue(1000);
      context.start();
      expect(delegate.didAnimationStart).toHaveBeenCalledTimes(1);
      context.keyDown();
      jest.runTimersToTime(1000 + context.state.cueDuration + 600 + 1);
      expect(delegate.didSaccade).not.toBeCalled();
      context.keyUp();
      expect(delegate.didNotSaccade).toBeCalled();
      expect(delegate.didAnimationStart).toHaveBeenCalledTimes(1);
      jest.runTimersToTime(2399);
      jest.runTimersToTime(1);
      expect(delegate.didAnimationStart).toHaveBeenCalledTimes(2);
    });
  });
  describe('The even-numbered trials presented new interesting animations changing every 2 s (interesting trials), whereas the odd-numbered trials always presented the same uninteresting rotating orange star (boring trials).', () => {
    test('The even-numbered trials presented new interesting animations...', () => {
      const context = new Context();
      context.start();
      context.state.trialNumber = 2;
      expect(context.state.trialNumber).toBe(2);
      expect(context.isBoringTrial()).toBe(false);
      expect(context.isInterestingTrial()).toBe(true);
    });
    test('...changing every 2s (interesting trials)...', () => {
      jest.useFakeTimers();
      const fn = jest.fn();
      const delegate = {
        didAnimationChange: fn
      };
      const context = new Context();
      context.delegate = delegate;
      context.start();
      expect(fn).not.toBeCalled();
      jest.runTimersToTime(2000);
      expect(fn).toHaveBeenCalledTimes(1);
      jest.runTimersToTime(4000);
      expect(fn).toHaveBeenCalledTimes(1 + 2);
      jest.runTimersToTime(8000);
      expect(fn).toHaveBeenCalledTimes(1 + 2 + 4);
    });
    test('...whereas the odd-numbered trials always presented the same uninteresting rotating orange star (boring trials).', () => {
      const context = new Context();
      context.start();
      context.state.trialNumber = 3;
      expect(context.state.trialNumber).toBe(3);
      expect(context.isBoringTrial()).toBe(true);
      expect(context.isInterestingTrial()).toBe(false);
    });
  });
  describe('We aimed at getting the infants to complete 60 trials, but the experiment was stopped if an infant became fussy or stopped looking at the screen.', () => {
    test('The experiment can be stopped.', () => {
      const delegate = {
        didExperimentEnd: jest.fn()
      };
      const context = new Context();
      context.delegate = delegate;
      context.start();
      context.keyDown();
      expect(context).toHaveProperty(
        'delegate.didAnimationStart',
        delegate.didAnimationStart
      );

      expect(_.isFunction(context.stop)).toBe(true);
      expect(delegate.didExperimentEnd).not.toBeCalled();
      context.stop();
      expect(delegate.didExperimentEnd).toBeCalled();
    });
  });
});

describe('Calibration (2008)', () => {
  describe('Pilot experiments indicated that the distractor duration needed to elicit automatic saccades varied greatly among infants.', () => {});
  describe('Therefore, we used the initial phase of the experiment to calibrate the duration of the distractor to the individual participant.', () => {});
  describe('Initial distractor duration was set to 200 ms by the computer and was increased automatically in 40-ms steps after every trial where the infant did not look to the distractor.', () => {
    test('Initial distractor duration was set to 200 ms by the computer...', () => {
      const delegate = {};
      const context = new Context();
      context.delegate = delegate;
      context.start();
      expect(context.state.cueDuration).toBe(200);
    });
    test('... and was increased automatically in 40-ms steps after every trial where the infant did not look to the distractor.', () => {
      jest.useFakeTimers();
      const delegate = {};
      const context = new Context();
      context.delegate = delegate;
      context.getDelayInMilliseconds = jest.fn();
      context.getDelayInMilliseconds.mockReturnValue(1000);
      context.start();

      context.keyDown();
      expect(context.state.isCalibrating).toBe(true);
      expect(context.state.cueDuration).toBe(200);
      expect(context.state.trialNumber).toBe(1);
      jest.runTimersToTime(1000 + context.state.cueDuration + 600 + 1);
      context.keyUp();
      jest.runTimersToTime(2400);
      expect(context.state.cueDuration).toBe(240);
      expect(context.state.trialNumber).toBe(2);
    });
  });
  describe('If the infant looked to the distractor, the experimenter released a key on the keyboard to indicate to the computer that the infant had looked to the distractor.', () => {
    test('If the infant looked to the distractor, the experimenter released a key on the keyboard...', () => {});
    test('...to indicate to the computer that the infant had looked to the distractor.', () => {
      jest.useFakeTimers();
      const delegate = {
        didSaccade: jest.fn()
      };
      const context = new Context();
      context.delegate = delegate;
      context.getDelayInMilliseconds = () => 1000;
      context.getDelayInMilliseconds = jest.fn();
      context.getDelayInMilliseconds.mockReturnValue(1000);
      context.start();
      expect(context.state.lookNumber).toBe(0);
      context.keyDown();
      expect(context.state.trialNumber).toBe(1);
      jest.runTimersToTime(1000 + context.state.cueDuration + 600 - 1);
      context.keyUp();
      jest.runTimersToTime(3000);
      expect(context.state.lookNumber).toBe(1);
      expect(delegate.didSaccade).toBeCalled();
      expect(context.state.trialNumber).toBe(2);
      expect(context.state.cueDuration).toBe(200);
    });
  });
  describe('On the following trial, the computer presented the distractor at the same duration, and if the infant again looked to the distractor (and the experimenter released the key to indicate to the computer that the infant had looked to the distractor), the computer set the distractor presentation to this duration for the rest of the experiment.', () => {
    test('On the following trial, the computer presented the distractor at the same duration...', () => {
      jest.useFakeTimers();
      const delegate = {
        didSaccade: jest.fn()
      };
      const context = new Context();
      context.delegate = delegate;
      context.getDelayInMilliseconds = jest.fn();
      context.getDelayInMilliseconds.mockReturnValue(1000);
      context.start();
      expect(context.state.lookNumber).toBe(0);
      expect(context.state.isCalibrating).toBeTruthy();
      context.keyDown();
      jest.runTimersToTime(1);
      context.keyUp();
      jest.runTimersToTime(3000);
      expect(context.state.cueDuration).toBe(200);
      expect(context.state.lookNumber).toBe(0);
    });
    test('...and if the infant again looked to the distractor (and the experimenter released the key to indicate to the computer that the infant had looked to the distractor), the computer set the distractor presentation to this duration for the rest of the experiment.', () => {
      jest.useFakeTimers();
      const delegate = {
        didSaccade: jest.fn(),
        didCalibrationEnd: jest.fn()
      };
      const context = new Context();
      context.delegate = delegate;
      context.getDelayInMilliseconds = jest.fn();
      context.getDelayInMilliseconds.mockReturnValue(1000);
      context.start();

      // Fast saccade.
      context.keyDown();
      expect(context.state.lookNumber).toBe(0);
      expect(context.state.trialNumber).toBe(1);
      jest.runTimersToTime(1200 + 1);
      context.keyUp();
      jest.runTimersToTime(3000 - 2);
      expect(context.state.trialNumber).toBe(1);
      jest.runTimersToTime(1);
      expect(context.state.lookNumber).toBe(1);
      expect(context.state.trialNumber).toBe(2);
      expect(context.state.cueDuration).toBe(200);
      expect(context.state.isCalibrating).toBeTruthy();

      // Fast saccade.
      context.keyDown();
      jest.runTimersToTime(1200 + 1);
      context.keyUp();
      jest.runTimersToTime(3000 - 1);
      expect(context.state.lookNumber).toBe(2);
      expect(context.state.cueDuration).toBe(200);
      expect(context.state.isCalibrating).toBeFalsy();
      expect(delegate.didCalibrationEnd).toHaveBeenCalledTimes(1);

      jest.runTimersToTime(10000);

      // No saccade until after 600 ms.
      context.keyDown();
      expect(context.state.lookNumber).toBe(2);
      jest.runTimersToTime(1000 + context.state.cueDuration + 600 + 1);
      expect(context.state.lookNumber).toBe(2);
      context.keyUp();
      expect(context.state.lookNumber).toBe(2);
      expect(context.state.cueDuration).toBe(200);
      expect(context.state.trialNumber).toBe(3);
      jest.runTimersToTime(2400 - 2);
      expect(context.state.trialNumber).toBe(3);
      jest.runTimersToTime(1);
      expect(context.state.trialNumber).toBe(4);
    });
  });
  describe('Thus, the infant needed to look to the distractor on two consecutive trials before distractor duration became fixed.', () => {
    test('...on two consecutive trials before distractor duration became fixed...', () => {
      jest.useFakeTimers();
      const delegate = {
        didSaccade: jest.fn()
      };
      const context = new Context();
      context.delegate = delegate;
      context.getDelayInMilliseconds = jest.fn();
      context.getDelayInMilliseconds.mockReturnValue(1000);
      context.start();
      expect(context.state.lookNumber).toBe(0);
      context.keyDown();
      expect(context.state.trialNumber).toBe(1);
      jest.runTimersToTime(1000 + context.state.cueDuration + 600 - 1);
      context.keyUp();
      jest.runTimersToTime(1);
      expect(context.state.lookNumber).toBe(1);
      jest.runTimersToTime(2400);
      expect(context.state.isCalibrating).toBeTruthy();
      expect(context.state.trialNumber).toBe(2);
      jest.runTimersToTime(10000);
      expect(context.state.lookNumber).toBe(1);
      context.keyDown();
      jest.runTimersToTime(1000 + context.state.cueDuration + 600 + 1);
      context.keyUp();
      expect(context.state.lookNumber).toBe(0);
    });
    test('The distractor duration can be set manually.', () => {
      const delegate = {
        didCalibrationEnd: jest.fn()
      };
      const context = new Context();
      context.delegate = delegate;
      context.start();
      expect(context.state.cueDuration).toBe(200);
      expect(context.state.isCalibrating).toBe(true);
      context.setCueDuration(1234);
      expect(context.state.cueDuration).toBe(1234);
      expect(context.state.isCalibrating).toBe(false);
      expect(delegate.didCalibrationEnd).toHaveBeenCalledTimes(1);
    });
    test('The distractor duration can be set by reaching a maximum value.', () => {
      jest.useFakeTimers();
      const delegate = {
        didCalibrationEnd: jest.fn()
      };
      const context = new Context({
        cueDurationInitial: 1000,
        cueDurationIncrement: 333,
        cueDurationMaximum: 1250
      });
      context.delegate = delegate;
      context.getDelayInMilliseconds = jest.fn();
      context.getDelayInMilliseconds.mockReturnValue(1000);
      context.start();
      expect(context.state.cueDuration).toBe(1000);
      expect(context.state.isCalibrating).toBe(true);
      context.keyDown();
      jest.runTimersToTime(1000 + context.state.cueDuration + 600 + 1);
      context.keyUp();
      jest.runTimersToTime(2400);
      expect(context.state.cueDuration).toBe(1250);
      expect(context.state.isCalibrating).toBe(false);
      expect(delegate.didCalibrationEnd).toHaveBeenCalledTimes(1);
    });
  });
  describe('Results were analyzed from two trials before the calibration trial so as to include the first trials where the infant started to look to the distractor.', () => {});
});

// The module must have a conventional API.
//////////////////////////////////////////////////////////////////////////////
describe('Module', () => {
  test('The module should be a class.', () => {
    expect(Context).toBeTruthy();
  });

  test('The instance should expose the state.', () => {
    const context = new Context();
    expect(context.state).toBeTruthy();
  });
});

// Answer these questions for each unit test you write:
//////////////////////////////////////////////////////////////////////////////
describe('What feature are you testing?', () => {
  const actual = 'What is the actual output?';
  const expected = 'What is the expected output?';
  test('What should the feature do?', () =>
    expect(actual).not.toEqual(expected));
});
