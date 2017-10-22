import './browser-console';
import './browser.less';

// Include (and run) all tests in the __browser__ directories.
//////////////////////////////////////////////////////////////////////////////
const requireAll = fn => fn.keys().forEach(fn);
document.addEventListener('DOMContentLoaded', () => {
  requireAll(require.context('../src/', true, /__browser__\/.+\.(js)$/));
});
