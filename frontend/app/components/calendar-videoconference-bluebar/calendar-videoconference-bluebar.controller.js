(function(angular) {
  'use strict';

  angular.module('linagora.esn.videoconference.calendar')
    .controller('calendarVideoconferenceBluebarController', calendarVideoconferenceBluebarController);

  function calendarVideoconferenceBluebarController(VideoConfConfigurationService) {
    var self = this;

    self.$onInit = $onInit;
    self.videoconference = videoconference;

    function $onInit() {
      return VideoConfConfigurationService.getOpenPaasVideoconferenceAppUrl().then(function(jitsiInstanceUrl) {
        self.videoConfHostname = jitsiInstanceUrl;
      });
    }

    function videoconference() {
      if (self.videoConfHostname && self.videoconferenceLink && self.videoconferenceLink.length) {
        var chunks = self.videoconferenceLink.split('/');

        return self.videoConfHostname + chunks[chunks.length - 1];
      }

      return '';
    }
  }
})(angular);
