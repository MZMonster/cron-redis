/**
 * Created by liuxing on 16/3/12.
 */
const Queue = require('bull');

var client = Queue('test', 6379, '127.0.0.1');
client.add({
  a: 1
},{delay: 1000});

client.add({
  a: 1
},{delay: 2000});

client.add({
  a: 1
},{delay: 3000});

setInterval(function () {

},1000)

client.on('ready', function() {
  console.log('client %s is ready');
});