import TapConsoleParser from 'tap-console-parser';

// Configure a TAP parser for the console to add styling to browser tests.
//////////////////////////////////////////////////////////////////////////////
(() => {
  const logs = [];
  let name;

  const deferWithPromise = Promise.prototype.then.bind(Promise.resolve());

  const parser = TapConsoleParser()
    .on('assert', data => {
      if (data.ok) {
        return;
      }
      deferWithPromise(() => {
        console.group.call(this, `#${data.number} ${name}`);
        const { expected, actual, stack } = data.error;
        console.warn.apply(
          this,
          [
            `${data.name}\n‘${actual}’ does not match ‘${expected}’`,
            stack && '\n\n',
            stack
          ].filter(Boolean)
        );
        console.groupEnd();
      });
    })
    .on('log', log => {
      if (!isTapeText(log)) {
        logs.push(log);
      } else if (logs.length !== 0) {
        console.debug(logs.join('\n'));
        logs.length = 0;
      }
    })
    .on('test', test => (name = `${test.name}`))
    .on('complete', data => {
      parser.detach();
      document.documentElement.setAttribute(
        'data-tape-status',
        data.ok ? 'pass' : 'fail'
      );
      console.debug(
        `%cTests: ${data.pass} passed, ${data.total} total`,
        [
          `background: ${data.ok ? 'green' : 'red'}`,
          'color: #fff',
          'padding: 1px 8px'
        ].join(';')
      );
    });

  const isTapeText = string =>
    /^\s*$/.test(string) ||
    /^\s{6}/.test(string) ||
    /^\s*(not ok|ok)/.test(string) ||
    /^\s+[\.\-]{3}$/.test(string) ||
    /^\#\s/.test(string) ||
    /^\s*(operator|expected|actual|stack):\s/.test(string) ||
    /^[0-9]+\.{2}[0-9]+$/.test(string) ||
    /^TAP version [0-9]+$/.test(string);
})();
