# Freeze Frame
For researchers of infant cognition and human development, Freeze Frame is an interactive computer application that provides experimental control of visual cues, animation and stimuli for scientific trials of early visual inhibition. The software is derived from the behavior and code used in [established research](http://doi.org/10.1016/j.jecp.2007.09.004) and supports data collection for a lab environment using Microsoft Windows 10.

> Holmboe, K., Fearon, R. M. P., Csibra, G., Tucker, L. A., & Johnson, M. H. (2008). Freeze-Frame: A new infant inhibition task and its relation to frontal cortex tasks during infancy and early childhood. Journal of Experimental Child Psychology, 100, 89–114.

:rocket: The [latest version](https://bookandbranch.github.io/freeze-frame/) of the Freeze Frame (2017) software is available as a hosted application.

# Development Guide
- [Installation](#installation)
- [Development](#development)

## Installation

Install dependencies using [Yarn](https://yarnpkg.com):
```sh
yarn install
```

This software uses [webpack] to compile JavaScript, [Less](https://lesscss.org/) styles, images and sound clips into a single package. Browser compatibility is automated using [Babel](https://babeljs.io/) and includes Internet Explorer 11 and the two (2) most recent versions of other major desktop browsers.

## Development
Start a local server:
```sh
yarn start
```
Run tests using [Jest](https://facebook.github.io/jest/):
```sh
yarn test
```
…or test continuously as you make changes with:
```sh
yarn jest
```
Run UI tests in a browser using [Tape](https://github.com/substack/tape):
```sh
yarn test:browser
```
Run all tests and create a production-ready release in `public`:
```sh
yarn release
```

# Acknowledgements

Research reported in this publication was supported by the Eunice Kennedy Shriver National Institute of Child Health & Human Development of the National Institutes of Health under award number `R03HD091644`. The content is solely the responsibility of the authors and does not necessarily represent the official views of the National Institutes of Health.

# License

MIT

[eligrey/FileSaver.js](https://github.com/eligrey/FileSaver.js)

[webpack]: https://webpack.github.io
