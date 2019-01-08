const { expect } = require('chai');
const sinon = require('sinon');
const ICAL = require('@linagora/ical.js');

describe('The request email processor', function() {
  let attendeeAsUser, attendeeEmail, videoconferenceModule, domain;

  function getVEvent(ics) {
    return ICAL.Component.fromString(ics).getFirstSubcomponent('vevent');
  }

  function getIcs(videoConferenceURL, description) {
    const videoConferenceEntry = videoConferenceURL ? `X-OPENPAAS-VIDEOCONFERENCE:${videoConferenceURL}` : 'X-FOO:BAR';
    const descriptionEntry = description ? `DESCRIPTION:${description}` : 'X-BAR:BAZ';

    return `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Sabre//Sabre VObject 4.1.3//EN\r\nCALSCALE:GREGORIAN\r\nBEGIN:VTIMEZONE\r\nTZID:Europe/Berlin\r\nBEGIN:DAYLIGHT\r\nTZOFFSETFROM:+0100\r\nTZOFFSETTO:+0200\r\nTZNAME:CEST\r\nDTSTART:19700329T020000\r\nRRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU\r\nEND:DAYLIGHT\r\nBEGIN:STANDARD\r\nTZOFFSETFROM:+0200\r\nTZOFFSETTO:+0100\r\nTZNAME:CET\r\nDTSTART:19701025T030000\r\nRRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU\r\nEND:STANDARD\r\nEND:VTIMEZONE\r\nBEGIN:VEVENT\r\nUID:9d53f164-5407-4826-8ad5-3a8ffff46701\r\nTRANSP:OPAQUE\r\nDTSTART;TZID=Europe/Berlin:20190110T120000\r\nDTEND;TZID=Europe/Berlin:20190110T123000\r\nCLASS:PUBLIC\r\nSUMMARY:This is a conference event\r\nORGANIZER;CN=Clint Eastwood:mailto:user1@open-paas.org\r\nATTENDEE;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;ROLE=REQ-PARTICIPANT;CUTYPE=INDIVIDUAL;CN=Admin Admin:mailto:admin@open-paas.org\r\nATTENDEE;PARTSTAT=ACCEPTED;RSVP=FALSE;ROLE=CHAIR;CUTYPE=INDIVIDUAL:mailto:user1@open-paas.org\r\nDTSTAMP:20190107T153402Z\r\nSEQUENCE:0\r\n${videoConferenceEntry}\r\n${descriptionEntry}\r\nEND:VEVENT\r\nEND:VCALENDAR`;
  }

  beforeEach(function() {
    videoconferenceModule = {
      lib: {
        videoconference: {
          create: sinon.stub(),
          getUrls: sinon.stub()
        }
      }
    };

    this.requireModule = function() {
      this.moduleHelpers.addDep('videoconference', videoconferenceModule);

      return require('../../../../backend/lib/email-processors/request')(this.moduleHelpers.dependencies);
    };

    attendeeAsUser = {};
    domain = { _id: 'the domain ID' };
    attendeeEmail = 'admin@open-paas.org';
  });

  describe('The process function', function() {
    it('should resolve with input data when there is no conference in ICS', function(done) {
      const ics = getIcs();

      this.requireModule()({ics, attendeeAsUser, attendeeEmail, domain})
        .then(result => {
          expect(result).to.deep.equal({ ics, attendeeAsUser, attendeeEmail, domain });
          expect(videoconferenceModule.lib.videoconference.create).to.not.have.been.called;
          expect(videoconferenceModule.lib.videoconference.getUrls).to.not.have.been.called;
          done();
        })
        .catch(done);
    });

    it('should generate a public link for external user', function(done) {
      const videoConferenceURL = 'https://open-paas.org/videoconference/foobar';
      const ics = getIcs(videoConferenceURL);
      const conference = {};
      const urls = { public: 'https://open-paas.org/videoconference/public/bazqux' };

      videoconferenceModule.lib.videoconference.create.returns(Promise.resolve(conference));
      videoconferenceModule.lib.videoconference.getUrls.returns(Promise.resolve(urls));

      this.requireModule()({ ics, attendeeEmail, domain })
        .then(({ ics }) => {
          const vevent = getVEvent(ics);

          expect(vevent.getFirstPropertyValue('x-openpaas-videoconference')).to.equal(urls.public);
          expect(vevent.getFirstPropertyValue('description')).to.contains(urls.public);
          expect(videoconferenceModule.lib.videoconference.create).to.have.been.calledWith({ conferenceName: 'foobar', domainId: domain._id, type: 'public' });
          expect(videoconferenceModule.lib.videoconference.getUrls).to.have.been.called;
          done();
        })
        .catch(done);
    });

    it('should keep the input link for OpenPaaS users', function(done) {
      const videoConferenceURL = 'https://open-paas.org/videoconference/foobar';
      const ics = getIcs(videoConferenceURL);
      const conference = {};

      videoconferenceModule.lib.videoconference.create.returns(Promise.resolve(conference));
      videoconferenceModule.lib.videoconference.getUrls.returns(Promise.resolve());
      this.requireModule()({ ics, attendeeAsUser, attendeeEmail, domain })
        .then(({ ics }) => {
          const vevent = getVEvent(ics);

          expect(vevent.getFirstPropertyValue('x-openpaas-videoconference')).to.equal(videoConferenceURL);
          expect(videoconferenceModule.lib.videoconference.create).to.not.have.been.called;
          expect(videoconferenceModule.lib.videoconference.getUrls).to.not.have.been.called;
          done();
        })
        .catch(done);
    });

    it('should set a description if there is no description in ICS', function(done) {
      const videoConferenceURL = 'https://open-paas.org/videoconference/foobar';
      const ics = getIcs(videoConferenceURL);
      const conference = {};

      videoconferenceModule.lib.videoconference.create.returns(Promise.resolve(conference));
      videoconferenceModule.lib.videoconference.getUrls.returns(Promise.resolve());
      this.requireModule()({ ics, attendeeAsUser, attendeeEmail, domain })
        .then(({ ics }) => {
          const vevent = getVEvent(ics);

          expect(vevent.getFirstPropertyValue('description')).to.contain(videoConferenceURL);
          expect(videoconferenceModule.lib.videoconference.create).to.not.have.been.called;
          expect(videoconferenceModule.lib.videoconference.getUrls).to.not.have.been.called;
          done();
        })
        .catch(done);
    });

    it('should append link in description a description if there is a description in ICS', function(done) {
      const videoConferenceURL = 'https://open-paas.org/videoconference/foobar';
      const description = 'This is my description';
      const ics = getIcs(videoConferenceURL, description);
      const conference = {};

      videoconferenceModule.lib.videoconference.create.returns(Promise.resolve(conference));
      videoconferenceModule.lib.videoconference.getUrls.returns(Promise.resolve());
      this.requireModule()({ ics, attendeeAsUser, attendeeEmail, domain })
        .then(({ ics }) => {
          const vevent = getVEvent(ics);

          expect(vevent.getFirstPropertyValue('description')).to.contain(videoConferenceURL);
          expect(vevent.getFirstPropertyValue('description')).to.contain(description);
          expect(videoconferenceModule.lib.videoconference.create).to.not.have.been.called;
          expect(videoconferenceModule.lib.videoconference.getUrls).to.not.have.been.called;
          done();
        })
        .catch(done);
    });
  });
});
