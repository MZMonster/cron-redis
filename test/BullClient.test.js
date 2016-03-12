/**
 * Created by liuxing on 16/3/12.
 */
var redisConfig = require('../config/redis');
const queue = require('../api/BullClient')('test',redisConfig);

var moment = require('moment');

function hello (x, y){
  console.log(new Date());
  console.log(x + ' + '+ y +' = %s', x+y);
}
var task1 = {
  method: hello.name,
  params: [2, 3],
  rule: moment().add(1, 'm').toDate()
}

var task2 = {
  method: hello.name,
  params: [4, 5],
  rule: '* */1 * * * *'
}
queue.publish(task1, hello);
queue.publish(task2, hello);

