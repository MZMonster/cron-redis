/**
 * Created by liuxing on 16/3/11.
 */
var redisConfig = require('../config/redis');
// init config
var cronClient = require('../app')('test', redisConfig,{
  level: 'info'
});

// define function
function hello (x, y){
  console.log(x + ' + '+ y +' = %s', x+y);
}

// register function
cronClient.register(hello);

// publish task
cronClient.publish({
  method: hello.name,
  params: [2, 3],
  rule: '*/1 * * * *'
});

// get current app task list
cronClient.list().then(function(lists){
  console.log(lists);
});


