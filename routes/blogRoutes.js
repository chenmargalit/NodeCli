const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');

const cleanCache = require('../middlewares/cleanCache');
const Blog = mongoose.model('Blog');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.send(blog);
  });

  app.get('/api/blogs', requireLogin, cleanCache, async (req, res) => {
    // const redis = require('redis');
    // default redis server
    // const redisUrl = 'redis://127.0.0.1:6379';
    // const client = redis.createClient(redisUrl);
    // const util = require('util');
    // promisify takes a function that uses a callback as a second argument, and makes it work with promises. util is built in Node. We overwrite our regular function, with one that returns a promise. This allows us to use await, rather than a callback.
    // client.get = util.promisify(client.get);

    // const cachedBlog = await client.get(req.user.id);

    // if (cachedBlog) {
    //   // as we use return here, we dont need an else {  later on. If something is found, it will be returned. As objects in Redis must be stored in JSON, we need to parse it to a normal js object when we give it back
    //   console.log('serving from Redis');
    //   return res.send(JSON.parse(cachedBlog));
    // }

    const blogs = await Blog.find({ _user: req.user.id }).cache({
      key: req.user.id
    });

    // // we first send the answer to the user, only then do we save the response.
    // console.log('serving from MongoDB');
    res.send(blogs);

    // // as objects must be stored as JSON, we must JSONify them before saving in the db.
    // client.set(req.user.id, JSON.stringify(blogs));
  });

  app.post('/api/blogs', requireLogin, async (req, res) => {
    console.log('blogs reached server side');
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
  });
};
