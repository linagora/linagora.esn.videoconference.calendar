module.exports = dependencies => {
  const calendar = dependencies('calendar');
  const request = require('./request')(dependencies);

  return {
    init
  };

  function init() {
    calendar.invitation.processors.register(['REQUEST'], request);
  }
};
