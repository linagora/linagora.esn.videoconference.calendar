module.exports = dependencies => {
  const calendar = dependencies('calendar');
  const request = require('./request')(dependencies);

  return {
    init
  };

  function init() {
    console.log(calendar.invitation)
    calendar.invitation.processors.register(['REQUEST'], request);
  }
};