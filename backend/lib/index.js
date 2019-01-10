module.exports = function(dependencies) {
  const processors = require('./email-processors')(dependencies);
  const i18n = require('./i18n')(dependencies);

  return {
    processors,
    i18n
  };
};
