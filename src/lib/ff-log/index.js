import 'lib/compatibility';
import isObject from 'lodash/isObject';

const DEFAULT_TIMER = window.performance;

export default class Log {
  data = [];

  constructor(timer = DEFAULT_TIMER) {
    this.timer = timer;
    this.start = timer.now();
    this.now = () => Math.round(this.timer.now() - this.start);
  }

  log(data) {
    const time = this.now();
    if ('debug' in console) {
      console.debug(`⏲ ${time} ms.`, [...arguments]);
    }
    if (isObject(data)) {
      this.data.push({ time, ...data });
    } else {
      this.data.push({ time, text: data });
    }
  }
}
