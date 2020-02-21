const { clearHash } = require('../services/cache');

module.exports = async (req, res, next) => {
  // a wait to activate a middleware AFTER the request has been done. The way it performs is activating next() before the request. Becasue of await, it will wait for the function to end (next in this case would be the actual function) and then when it finishes, it comes back to this file where it will clear the hash.
  await next();

  clearHash(req.user.id);
};
