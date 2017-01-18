/**
 * Created by liuxing on 16/7/4.
 */
var MQ = require('./MNS').elastic;
// send message
//MQ.sendP("waiting 60 seconds!");


MQ.peekP(61).then(function (data) {
  console.log(data);
}).catch((err) => {
  console.error(err);

});
