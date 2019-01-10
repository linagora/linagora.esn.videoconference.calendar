(function(angular) {
  'use strict';

  angular.module('linagora.esn.videoconference.calendar').run(runBlock);

  function runBlock(dynamicDirectiveService, DynamicDirective) {
    var directive = new DynamicDirective(true, 'calendar-videoconference-bluebar',
      {attributes: [{name: 'videoconference-link', value: '$ctrl.event.xOpenpaasVideoconference'}]});

    dynamicDirectiveService.addInjection('calendar-videoconference-bluebar', directive);
  }
})(angular);
