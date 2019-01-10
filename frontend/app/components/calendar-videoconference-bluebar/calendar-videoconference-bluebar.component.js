(function(angular) {
  'use strict';

  angular.module('linagora.esn.videoconference.calendar')
    .component('calendarVideoconferenceBluebar', {
      templateUrl: '/videoconference-calendar/app/components/calendar-videoconference-bluebar/calendar-videoconference-bluebar.html',
      controller: 'calendarVideoconferenceBluebarController',
      bindings: {
        videoconferenceLink: '='
      }
    });

})(angular);
