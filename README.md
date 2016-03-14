## cron task for node by redis
Inspired by the [bull](https://github.com/OptimalBits/bull) 


## usage


### client
1. Initialize the redis config
2. register function for callback
3. publish task

```
var cronRedis = require('cron-redis')(appName, redisConfig);

function hello (x, y){
    return x + y;
}
cronRedis.register(hello); 

var task = {
  method: hello.name,
  params: [2, 3],
  rule: new Date()
};

// publish a task
cronService.publish(task);


```

### API

#### require('cron-redis')(appName, redisConfig)
init config

* appName {String} what your app's name?
* redisConfig {Object}  
    ```
    {
      host: '127.0.0.1',
      port: 6379,
      password: '',
      db: 0
      }
    ```
 
 
#### register
register a task 
* method {Function} // method for cron task callback
   
#### publish
add a task to queue

* task {Object}
  * method {String} the name of method  will be callback.
  * params {Array} 