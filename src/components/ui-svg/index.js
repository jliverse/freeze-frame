import toPairs from 'lodash/toPairs';
import isArray from 'lodash/isArray';
import isEqual from 'lodash/isEqual';

import { h, Component } from 'preact';
import { Parser } from 'xml2js';

import style from './style.less';

const parser = new Parser({
  explicitRoot: true,
  explicitChildren: true,
  explicitArray: true,
  mergeAttrs: false,
  async: !'_virtualConsole' in window // Synchronous for JSDOM testing.
});

export default class extends Component {
  recurseChildren(el) {
    const array = [];
    if (!el) {
      return array;
    }
    toPairs(el).forEach(([name, values]) => {
      (isArray(values) ? values : [values]).forEach(child => {
        const { $, $$, _ } = child;
        const children = this.recurseChildren($$);
        _ && children.push(_);
        const node = h(name, $, children);
        array.push(node);
      });
    });
    return array;
  }

  svgWithXML(xml, fn) {
    parser.parseString(xml, (err, result) => {
      const { src, children, ...props } = this.props;
      const svg = this.recurseChildren(result);
      if (fn && svg && svg[0]) {
        const { attributes, children } = svg[0];
        fn(
          <svg xmlns="http://www.w3.org/2000/svg" {...attributes} {...props}>
            {children}
          </svg>
        );
      }
    });
  }

  componentWillMount() {
    const { src } = this.props;
    this.svgWithXML(src, svg => this.setState({ svg }));
  }

  componentWillReceiveProps({ src, ...nextProps }) {
    if (!isEqual(src, this.props.src)) {
      this.svgWithXML(src, svg => this.setState({ svg }));
    }
  }

  render({ src, children, ...props }, { svg }) {
    return svg || <svg {...props} />;
  }
}
