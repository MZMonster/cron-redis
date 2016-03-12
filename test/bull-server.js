/**
 * Created by liuxing on 16/3/12.
 */
'use strict';

const Queue = require('bull');

var testServer = Queue('test', 6379, '127.0.0.1');

testServer.process((job, done) => {
  console.log('server recived job:', job.data);
  done();
})

testServer.on('ready', function() {
  console.log('server test is ready');
});

