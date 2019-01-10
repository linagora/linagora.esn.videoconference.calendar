(function(angular) {
  'use strict';

  angular.module('linagora.esn.videoconference.calendar')
    .component('calendarVideoconferenceForm', {
      templateUrl: '/videoconference-calendar/app/components/calendar-videoconference-form/calendar-videoconference.html',
      controller: 'calendarVideoconferenceFormController',
      bindings: {
        event: '=',
        canModifyEvent: '='
      }
    });

})(angular);
