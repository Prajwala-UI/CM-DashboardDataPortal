// config.js
import * as testConfig from './config.test';
import * as localConfig from './config.local';
import * as preprodConfig from './config.preprod';
import * as prodConfig from './config.prod';

let config;

switch (process.env.REACT_APP_ENV) {
  case 'test':
    config = testConfig;
    break;
  case 'local':
    config = localConfig;
    break;
  case 'preprod':
    config = preprodConfig;
    break;
  case 'prod':
    config = prodConfig;
    break;
  default:
    config = localConfig;
    break;
}

export default config;
