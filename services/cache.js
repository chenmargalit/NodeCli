// The idea of what we're doing here is this:
// We are hooking into the mongoose query class. Query is the class that operates when ever we do anything with mongoose. We need to intercept the data after its being sent by mongoose, before it reaches to mongo, in order to understand if this is actually neccessary, e.g if we dont have it in Redis.
// So, basically we're creating our own query instance, so now this is what mongoose does. We are changing mongoose's behavior.

const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = {}) {
  this.useCache = true;
  // stringify to make sure whats added is a string or a number
  this.hashKey = JSON.stringify(options.key || '');
  return this;
};

mongoose.Query.prototype.exec = async function() {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }
  // // returns for example: { _id: '5e4ad202b49e11cfd689705d' }
  // console.log(this.getQuery());
  // // returns for example: blogs
  // console.log(this.mongooseCollection.name);

  // does a copy of the object. It puts the result of this.getQuery in the empty object and adds there everything after, in this case - the collection name
  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name
    })
  );

  // Z.B:  { _user: '5e4ad202b49e11cfd689705d', collection: 'blogs' }
  // console.log(key);

  const cacheValue = await client.hget(this.hashKey, key);
  if (cacheValue) {
    // console.log('cachevalue is', cacheValue);
    // mongoose expects we'll pass a mongoose object, so we need to create one out of the data in redis which we initiality Parse (convert from JSON to js)
    const doc = JSON.parse(cacheValue);

    // if doc is an object, everything is fine and u can pass turn it into a model. If its an array of objects, like we have with blogs, then we need to turn every individual blog post to an object.
    return Array.isArray(doc)
      ? doc.map(d => new this.model(d))
      : new this.model(doc);
  }

  const result = await exec.apply(this, arguments);
  client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);

  return result;
};

module.exports = {
  clearHash(hashKey) {
    console.log('clearing hash');
    client.del(JSON.stringify(hashKey));
  }
};
