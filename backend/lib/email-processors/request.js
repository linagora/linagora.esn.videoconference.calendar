const ICAL = require('@linagora/ical.js');

module.exports = dependencies => {
  const logger = dependencies('logger');
  const videoconference = dependencies('videoconference');

  return function process({ attendeeAsUser, attendeeEmail, ics, domain, emailContentOverrides = {}}) {
    logger.info('Processing REQUEST event');

    const isExternalUser = !attendeeAsUser;
    const vcalendar = ICAL.Component.fromString(ics);
    const vevent = vcalendar.getFirstSubcomponent('vevent');
    const conferenceLink = getConferenceLink(vevent);

    if (!conferenceLink) {
      return Promise.resolve({ ics, attendeeAsUser, attendeeEmail, domain, emailContentOverrides });
    }

    emailContentOverrides.description = getDescription(vevent);

    const getLink = isExternalUser ? generatePublicLink(conferenceLink, domain) : Promise.resolve(conferenceLink);
    const patchEvent = isExternalUser ? patchEventForExternalUser : patchEventForInternalUser;

    return getLink
      .then(updatedLink => {
        emailContentOverrides.videoconferenceLink = updatedLink;

        return updatedLink;
      })
      .then(updatedLink => patchEvent(vevent, updatedLink))
      .then(() => ({ ics: vcalendar.toString(), attendeeAsUser, attendeeEmail, domain, emailContentOverrides }))
      .catch(err => {
        logger.error('Can not generate public conference link', err);

        return { ics: vcalendar.toString(), attendeeAsUser, attendeeEmail, domain, emailContentOverrides };
      });
  };

  function getConferenceLink(vevent) {
    return vevent.getFirstPropertyValue('x-openpaas-videoconference');
  }

  function generatePublicLink(initialLink, domain) {
    const conferenceName = initialLink.split('/').pop();

    return videoconference.lib.videoconference.create({ conferenceName, domainId: domain._id, type: 'public' })
      .then(conference => videoconference.lib.videoconference.getUrls(conference))
      .then(urls => (urls.public));
  }

  function patchEventForExternalUser(vevent, link) {
    setConferenceLink(vevent, link);
    updateDescription(vevent, link);
  }

  function patchEventForInternalUser(vevent, link) {
    updateDescription(vevent, link);
  }

  function updateDescription(vevent, link) {
    const description = getDescription(vevent);

    if (!description) {
      vevent.updatePropertyWithValue('description', generateDescription('', link));
    } else {
      vevent.updatePropertyWithValue('description', generateDescription(description, link));
    }
  }

  function getDescription(vevent) {
    return vevent.getFirstPropertyValue('description');
  }

  function generateDescription(initialDescription, link) {
    return `${initialDescription}\n\n*#*#*#*#*#\nPlease do not edit this section of the description.\n\nThis event contains a videoconference.\nJoin: ${link}\n*#*#*#*#*#`;
  }

  function setConferenceLink(vevent, link) {
    vevent.updatePropertyWithValue('x-openpaas-videoconference', link);
  }
};
