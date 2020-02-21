// jest by default gives every single test 5 seconds to run. If it takes longer than this, it assumes theres a problem and returns an error. As some tests take long, I can enlarge this to 30 seconds like this (30k miliseconds)
jest.setTimeout(30000);

require('../models/User');
const mongoose = require('mongoose');
const keys = require('../config/keys');

// mongoose can use a few different promises implemantations. This tells mongoose to use the Node regular one
mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI);
