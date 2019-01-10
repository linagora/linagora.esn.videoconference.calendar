const AwesomeModule = require('awesome-module');
const path = require('path');
const glob = require('glob-all');
const Dependency = AwesomeModule.AwesomeModuleDependency;

const AWESOME_MODULE_NAME = 'linagora.esn.videoconference.calendar';
const FRONTEND_JS_PATH = __dirname + '/frontend/app/';
const NAME = 'videoconference-calendar';
const APP_ENTRY_POINT = path.join(FRONTEND_JS_PATH, `${NAME}.module.js`);

module.exports = new AwesomeModule(AWESOME_MODULE_NAME, {
  dependencies: [
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.webserver.wrapper', 'webserver-wrapper'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.logger', 'logger'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.calendar', 'calendar'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.videoconference', 'videoconference'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.i18n', 'i18n')
  ],

  states: {
    lib: function(dependencies, callback) {
      const lib = require('./backend/lib')(dependencies);

      callback(null, {
        lib
      });
    },

    deploy: function(dependencies, callback) {
      const app = require('./backend/webserver/application')(dependencies, this);
      const webserverWrapper = dependencies('webserver-wrapper');
      const frontendJsFilesFullPath = glob.sync([
        APP_ENTRY_POINT,
        FRONTEND_JS_PATH + '**/!(*spec).js'
      ]);
      const frontendJsFilesUri = frontendJsFilesFullPath.map(function(filepath) {
        return filepath.replace(FRONTEND_JS_PATH, '');
      });
      const lessFile = path.join(FRONTEND_JS_PATH, 'styles.less');

      webserverWrapper.injectAngularAppModules(NAME, frontendJsFilesUri, AWESOME_MODULE_NAME, ['esn'], {
        localJsFiles: frontendJsFilesFullPath
      });
      webserverWrapper.injectLess(NAME, [lessFile], 'esn');

      webserverWrapper.addApp(NAME, app);

      this.lib.processors.init();

      callback();
    }
  }
});
