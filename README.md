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
  DB: 1,
  opts: {
    auth_pass: 'root',
    password: 'root'
  }
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
  * rule {options}  cron rule . {Date} or {* */1 * * * *}  
  
 
###### Supported format
 
 ```
 *    *    *    *    *    *
 ┬    ┬    ┬    ┬    ┬    ┬
 │    │    │    │    │    |
 │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
 │    │    │    │    └───── month (1 - 12)
 │    │    │    └────────── day of month (1 - 31)
 │    │    └─────────────── hour (0 - 23)
 │    └──────────────────── minute (0 - 59)
 └───────────────────────── second (0 - 59, optional)
 ```
or 

```
new Date();
moment().add(3, 's').toDate()
```

### More 
[bull](https://github.com/OptimalBits/bull) 