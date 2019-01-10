'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The calendarVideoconferenceForm component', function() {
  var $rootScope, $scope, $q, $controller, EVENT_VIDEOCONFERENCE_OPTIONS;

  function initController(videoConf) {
    $scope = $rootScope.$new();

    var controller = $controller('calendarVideoconferenceFormController');

    controller.event = {xOpenpaasVideoconference: videoConf};
    controller.canModifyEvent = true;

    $scope.$digest();

    return controller;
  }

  beforeEach(function() {
    module('linagora.esn.videoconference.calendar', function($provide) {
      $provide.value('VideoConfConfigurationService', {
        getOpenPaasVideoconferenceAppUrl: function() {
          return $q.when('http://localhost/');
        }
      });
      $provide.value('uuid4', {
        generate: function() {
          return '94273a39-0bbf-4d92-94f6-c46b2a14b7bd';
        }
      });
    });
  });

  beforeEach(inject(function(_$rootScope_, _$q_, _$controller_, _EVENT_VIDEOCONFERENCE_OPTIONS_) {
    $rootScope = _$rootScope_;
    $q = _$q_;
    $controller = _$controller_;
    EVENT_VIDEOCONFERENCE_OPTIONS = _EVENT_VIDEOCONFERENCE_OPTIONS_;
  }));

  describe('$onInit', function() {
    it('should get the Jitsi instance URL from configuration', function(done) {
      var target = initController();

      target.$onInit().then(function() {
        expect(target.videoConfHostname).to.eql('http://localhost/');
        done();
      });

      $scope.$digest();
    });

    describe('when no event is provided', function() {
      it('should set the room name and the event\'s xOpenpaasVideoconference field', function(done) {
        var target = initController();

        target._videoconference = EVENT_VIDEOCONFERENCE_OPTIONS.OPENPAAS_VIDEOCONFERENCE;

        target.$onInit().then(function() {
          expect(target.roomName()).to.eql('94273a39-0bbf-4d92-94f6-c46b2a14b7bd');
          expect(target.event.xOpenpaasVideoconference).to.eql('http://localhost/94273a39-0bbf-4d92-94f6-c46b2a14b7bd');
          done();
        });

        $scope.$digest();
      });
    });

    describe('when an event is provided', function() {
      it('should set the room name, _videoconference, and the event\'s xOpenpaasVideoconference fields', function(done) {
        var target = initController('http://localhost/openpaas');

        target._videoconference = EVENT_VIDEOCONFERENCE_OPTIONS.NO_VIDEOCONFERENCE;

        target.$onInit().then(function() {
          expect(target.roomName()).to.eql('openpaas');
          expect(target.event.xOpenpaasVideoconference).to.eql('http://localhost/openpaas');
          expect(target.videoconference()).to.eql(EVENT_VIDEOCONFERENCE_OPTIONS.OPENPAAS_VIDEOCONFERENCE);
          done();
        });

        $scope.$digest();
      });
    });
  });
});
