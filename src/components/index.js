import { h, Component } from 'preact';

import FreezeFrame from './ff-app';
import FreezeFrameWelcome from './ff-app-welcome';
import '../css/index.less';

export default class extends Component {
  didStart = subjectID => {
    this.setState({ didStart: true, subjectID });
  };
  didEnd = () => {
    this.setState({ didStart: false });
  };

  render({ ...props }, { didStart, subjectID }) {
    if (window.location.hash.match(/\/window$/)) {
      return <section />;
    }
    if (didStart) {
      return (
        <FreezeFrame
          id="app"
          didEnd={::this.didEnd}
          subjectID={subjectID}
          {...props}
        />
      );
    } else {
      return (
        <FreezeFrameWelcome id="app" didStart={::this.didStart} {...props} />
      );
    }
  }
}
