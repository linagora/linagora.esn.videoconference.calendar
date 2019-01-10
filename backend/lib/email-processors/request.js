const ICAL = require('@linagora/ical.js');

module.exports = dependencies => {
  const logger = dependencies('logger');
  const videoconference = dependencies('videoconference');
  const calendar = dependencies('calendar');

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
      .then(updatedLink => patchEvent(vevent, updatedLink, attendeeAsUser))
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

    return updateDescription(vevent, link);
  }

  function patchEventForInternalUser(vevent, link, attendee) {
    return updateDescription(vevent, link, attendee);
  }

  function updateDescription(vevent, link, attendee) {
    const description = getDescription(vevent);

    return generateDescription(description || '', link, attendee).then(translated => vevent.updatePropertyWithValue('description', translated));
  }

  function getDescription(vevent) {
    return vevent.getFirstPropertyValue('description');
  }

  function generateDescription(initialDescription, link, attendee) {
    return translate(attendee).then(({ please, contains, join }) => `${initialDescription}\n\n*#*#*#*#*#\n${please}.\n\n${contains}.\n${join}: ${link}\n*#*#*#*#*#`);
  }

  function setConferenceLink(vevent, link) {
    vevent.updatePropertyWithValue('x-openpaas-videoconference', link);
  }

  function translate(attendee) {
    return calendar.i18n.getI18nForMailer(attendee).then(i18nConfiguration => ({
      please: i18nConfiguration.i18n.__({phrase: 'Please do not edit this section of the description', locale: i18nConfiguration.locale}),
      contains: i18nConfiguration.i18n.__({phrase: 'This event contains a videoconference', locale: i18nConfiguration.locale}),
      join: i18nConfiguration.i18n.__({phrase: 'Join the videoconference', locale: i18nConfiguration.locale})
    }));
  }
};
