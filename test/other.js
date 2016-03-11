/**
 * Created by liuxing on 16/3/11.
 */
var parser = require('cron-parser');
var moment = require('moment');
try {
  var interval = parser.parseExpression('*/2 * * * *');

  console.log('Date: ', interval.next().toString()); // Sat Dec 29 2012 00:42:00 GMT+0200 (EET)
  console.log('Date: ', interval.next().toString()); // Sat Dec 29 2012 00:44:00 GMT+0200 (EET)
  console.log('Date: ', interval.next().toUTC().toString()); // Sat Dec 28 2012 22:46:00 GMT+0200 (EET)
} catch (err) {
  console.log('Error: ' + err.message);
}

var obj = moment().add(11, 'second').unix();
console.log(obj);
console.log(obj - moment().unix());
