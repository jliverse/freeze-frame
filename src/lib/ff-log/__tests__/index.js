import Log from '../index';

test('Log includes timestamps', done => {
  const log = new Log();
  log.log('Lorem ipsum A');
  setTimeout(() => {
    log.log('Lorem ipsum B');
    log.log({
      trial: 2,
      text: 'Lorem ipsum B',
      type: 'Boring',
      object: 'Animation'
    });
    done();
    expect(log.data).toBeTruthy();
    expect(log.data.length).toEqual(1);
    expect(Object.keys(log.data[0])).toContain('time');
  }, 100);
});
