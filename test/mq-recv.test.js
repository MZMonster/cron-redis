/**
 * Created by liuxing on 16/7/4.
 */

var MQ = require('./MNS').elastic;
MQ.notifyRecv(function(err, message){
  console.log(message);
  if(err && err.message === "NetworkBroken"){
    // Best to restart the process when this occurs
    throw err;
  }
 // MQ.sendP('I am second task!');
  return true; // this will cause message to be deleted automatically
});

var i = 0;
setInterval(function () {
  i++;
  if (i % 10 ===0) {
      console.log(i);
  }
}, 1000)
console.log('MQ is listen...');