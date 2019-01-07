module.exports = function(dependencies) {
  const processors = require('./email-processors')(dependencies);

  return {
    processors
  };
};
