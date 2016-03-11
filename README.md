# redis 定时任务 ,支持 cluster
基于 redis 的 键空间过期, 

** redis 版本 2.8 才支持 **

## service 端 
服务器端需要单独部署
1. 服务器端负责接收任务
2. 提交定时任务
3. 定时任务介绍后,通知客户端

## client 端
1. 提交任务
2. 订阅任务完成队列
3. 处理任务

## usage

1. 修改 `config/redis`配置, 启动 server 端 ,作为微服务
2. `node api/RedisCronServe`

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
  ttl: 10
};

// 发布定时任务
cronService.publish(task);

// 获取当前的任务列表
cronService.list().then(function(lists){
  console.log(lists);
});

```