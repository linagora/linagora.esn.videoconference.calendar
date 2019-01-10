'use strict';

angular.module('esn.form.helper', []);
angular.module('esn.core', []);
angular.module('esn.user', []);
angular.module('pascalprecht.translate', [])
  .provider('$translate', function() {
    return {
      useSanitizeValueStrategy: angular.noop,
      preferredLanguage: angular.noop,
      useStaticFilesLoader: angular.noop,
      $get: angular.noop
    };
  });
