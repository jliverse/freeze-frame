// @license http://opensource.org/licenses/MIT
// copyright Paul Irish 2015
(function(e) {
  if ('performance' in e === false) {
    e.performance = {};
  }
  if ('now' in e.performance === false) {
    const { timing } = e.performance;
    let nowOffset = (timing && timing.navigationStart) || Date.now();
    e.performance.now = () => Date.now() - nowOffset;
  }
})(window);
