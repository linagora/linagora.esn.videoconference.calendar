module.exports = dependencies => {

  const logger = dependencies('logger');
  const calendar = dependencies('calendar');
  const videoconference = dependencies('videoconference');

  return function process({ email, content }) {
    logger.info('Processing REQUEST event', email, content);

    return Promise.resolve({ email, content });
    // -1. Check if there is a conference in the ICS, if not, resolve as is
    // 0. generate link for external user if needed
    // 1. Add conference link in ICS description
    // 2. Update the content with the ICS link

    // const vcalendar = ICAL.Component.fromString(icalendar);
    // const vevent = vcalendar.getFirstSubcomponent('vevent');
    // vevent.getFirstPropertyValue('X-OPENPAAS-VIDEOCONFERENCE')
  }
}