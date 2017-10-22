import { arrayWithContext } from '../../lib/require';

export default arrayWithContext(require.context('.', false, /\.gif$/));
