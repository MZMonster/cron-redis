/**
 * Created by liuxing on 16/3/9.
 */
var redisKey = require('../config/redisKey');

var redis = require("redis");
var bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

var client1, client2, client3 ;
var TASK_FINISH_CHANNEL = 'TASK_FINASH:';  // 定时任务执行的频道
var TASK_CHANNEL = redisKey.cron_task_queue;
var TASK_PREFIX =  redisKey.prefix;
var app;
var methods = {};

/**
 * 发布一个定时任务
 */
function publish(task){
  task.app = app;
  task.channel = TASK_FINISH_CHANNEL; // 设置任务完成通道
  client1.publish(TASK_CHANNEL, JSON.stringify(task)); // 发布一个任务,给定时服务处理
}

/**
 * 开始监听任务完成
 */
function listenBegin(){
  // 处理定时任务的调用逻辑
  client2.on('message', function (channel, message) {
    message = message.replace(TASK_PREFIX,'');
    var task = JSON.parse(message);
    switch (channel){
      case TASK_FINISH_CHANNEL: {
        if (getMethod(task.method)) {
          getMethod(task.method).apply(this, task.params);
        }else { // 从全局获取
          global[task.method].apply(this, task.params);
        }
      }
    }
  });
}

function list(){
  return client3.keysAsync(TASK_PREFIX + '*').then(function(lists){
    var len = lists.length;
    var result = [];
    for (var i = 0; i < len; i++) {
      var obj = lists[i];
      obj = JSON.parse(obj.replace(TASK_PREFIX,''));
      result.push(obj);
    }
    return result;
  });
}

/**
 *
 * @param name application name
 * @param options redis config
 */
function init(name, options){
  app = name;
  TASK_PREFIX = TASK_PREFIX + name + ':'; // 设置任务 键前缀
  TASK_FINISH_CHANNEL = TASK_FINISH_CHANNEL + name; // 设置任务完成的通知队列

  client1 = redis.createClient(options);
  client2 = redis.createClient(options);
  client3 = redis.createClient(options);
  client2.subscribe(TASK_FINISH_CHANNEL);
  listenBegin();
}

/**
 * 注册回调函数
 * @param method
 */
function register(method){
  methods[method.name] = method;
}

/**
 * 根据函数名查找函数实现
 * @param name
 * @returns {*}
 */
function getMethod(name){
  return methods[name];
}

module.exports = function (name, options, _getMethod) {
  init(name, options, _getMethod);
  return {
    publish: publish,
    list: list,
    register: register
  }
};
