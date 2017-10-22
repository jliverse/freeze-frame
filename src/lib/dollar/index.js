class Dollar {
  constructor(el = document.body) {
    this.el = el && el.nodeType ? el : document.querySelector(el) || {};
    this.classNames = (this.el.className && this.el.className.split(' ')) || [];
  }

  hasClass(className) {
    return this.classNames.indexOf(className) >= 0;
  }

  addClass(className) {
    if (this.classNames.indexOf(className) < 0) {
      this.classNames.push(className);
      this.el.className = this.classNames.join(' ');
    }
    return this;
  }

  attr(name, value) {
    if (value) {
      this.el.setAttribute(name, value);
      return this;
    } else {
      return this.el.getAttribute(name);
    }
  }

  css(name) {
    if (!this.el.nodeType) {
      return undefined;
    }
    const style = window.getComputedStyle(this.el);
    if (!style) {
      return undefined;
    }
    switch (name) {
      case 'color':
        return colorAsHex(style.getPropertyValue('color'));
      default:
        return style.getPropertyValue(name);
    }
  }

  removeClass(className) {
    const index = this.classNames.indexOf(className);
    if (index >= 0) {
      this.classNames.splice(index, 1);
      this.el.className = this.classNames.join(' ');
    }
    return this;
  }

  toggleClass(className) {
    return hasClass(className) ? removeClass(className) : addClass(className);
  }
}

export default el => {
  return new Dollar(el);
};
