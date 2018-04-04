/*!
 * Copyright (c) 2015-2017 Cisco Systems, Inc. See LICENSE file.
 */
const path = require('path');

const denodeify = require('denodeify');
const FirefoxProfile = require('firefox-profile');
const {stat} = require('fs-promise');

const spawn = require('../spawn');

const {rimraf} = require('./async');

const PROFILE_DIR = './.tmp/selenium';

const copy = denodeify(FirefoxProfile.copy);
/**
 * denodeifies FirefoxProfile.encode
 * @param {FirefoxProfile} fp
 * @returns {Promise<string>}
 */
function encode(fp) {
  return new Promise((resolve, reject) => {
    fp.encode((err, encoded) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(encoded);
    });
  });
}

/**
 * Determines the switchabale platform name from a sauce definition or the
 * output of os.platform()
 * @param {string} platform
 * @returns {string}
 */
function platformToShortName(platform) {
  const p = platform.toLowerCase();
  if (p.toLowerCase().includes('os x') || p === 'darwin' || p.toLowerCase().includes('mac')) {
    return 'mac';
  }

  return undefined;
}
/* eslint-disable valid-jsdoc */
/**
 * Injects a gzipped, base64-encoded firefox profile directory into a firefox browser definition
 * @param {Object} def
 * @returns {Promise}
 */
async function injectProfile(def) {
  if (def.browserName.toLowerCase().includes('firefox')) {
    const platform = platformToShortName(def.platform);
    if (platform !== 'mac') {
      throw new Error(`No tooling implemented for injecting h264 into ${platform} (${def.platform})`);
    }

    const dir = path.resolve(process.cwd(), `${PROFILE_DIR}/${platform}`);
    const profile = await copy(dir);
    // eslint-disable-next-line
    def.firefox_profile = await encode(profile);
  }
}

/**
 * Determines if a given file/directory already exists
 * @param {string} dir
 * @returns {Promise<boolean>}
 */
async function exists(dir) {
  try {
    const s = await stat(dir);
    return s.isDirectory();
  }
  catch (err) {
    return false;
  }
}
/* eslint-enable valid-jsdoc */

exports.download = async function download() {
  await rimraf(`${PROFILE_DIR}/mac`);
  await spawn(`${__dirname}/openh264.sh`, []);
};

exports.inject = async function inject(browsers) {
  if (!await exists(`${PROFILE_DIR}/mac`)) {
    await exports.download();
  }
  /* eslint-disable no-await-in-loop */
  for (const key of Object.keys(browsers)) {
    const def = browsers[key];
    await injectProfile(def);
  }
};

