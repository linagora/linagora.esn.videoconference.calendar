const AwesomeModule = require('awesome-module');
const Dependency = AwesomeModule.AwesomeModuleDependency;
const AWESOME_MODULE_NAME = 'linagora.esn.videoconference.calendar';

module.exports = new AwesomeModule(AWESOME_MODULE_NAME, {
  dependencies: [
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
      this.lib.processors.init();

      callback();
    }
  }
});
