// eslint-disable-next-line prefer-destructuring
const argv = require('yargs').argv;
require('dotenv').config();

process.env.SAUCE = true;

let {config} = require('./wdio.conf.js');

const browserType = process.env.BROWSER || 'chrome';
const browserCount = process.env.BROWSER_COUNT || 2;
const platform = process.env.PLATFORM || 'MAC';
const build = process.env.BUILD_NUMBER || `local-${process.env.USER}-wdio-${Date.now()}`;
const resolution = '1920x1080';
const suite = argv.suite || 'integration';

config = Object.assign({}, config, {
  deprecationWarnings: false,
  user: process.env.BROWSERSTACK_USERNAME || 'BROWSERSTACK_USERNAME',
  key: process.env.BROWSERSTACK_ACCESS_KEY || 'BROWSERSTACK_ACC_KEY',
  host: 'hub.browserstack.com'
});

config.mochaOpts.timeout = 120000;

const baseCaps = {
  name: `react-widget-${suite}`,
  build,
  os: 'OS X',
  os_version: 'Sierra',
  platform,
  logLevel: 'verbose',
  'browserstack.debug': 'true',
  'browserstack.networkLogs': 'true',
  'browserstack.console': 'verbose',
  'browserstack.selenium_version': '3.4.0',
  resolution
};

const capabilities = {
  firefox: {
    browser: 'firefox',
    browserName: 'firefox',
    'browserstack.geckodriver': '0.18.0',
    ...baseCaps
  },
  chrome: {
    browser: 'chrome',
    browserName: 'chrome',
    chromeOptions: {
      args: [
        '--use-fake-device-for-media-stream',
        '--use-fake-ui-for-media-stream',
        '--disable-infobars'
      ],
      prefs: {
        'profile.default_content_setting_values.notifications': 2
      }
    },
    ...baseCaps
  }
};

function getBrowserCapabilities(type = 'chrome', count = 2) {
  const cap = {};
  for (let i = 1; i <= count; i += 1) {
    cap[i] = {
      desiredCapabilities: capabilities[type]
    };
  }
  return cap;
}

config.capabilities = getBrowserCapabilities(browserType, browserCount);

exports.config = config;
