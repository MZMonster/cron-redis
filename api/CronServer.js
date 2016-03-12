/**
 * Created by liuxing on 16/3/9.
 * 1. client 订阅 cron task
 * 2. 注册键空间过期任务
 * 3. 过期后,publish cron_finish_task,通知客户端
 *
 *
 */
'use strict';

var redisConfig = require('../config/redis');
var redisKey = require('../config/redisKey');
var bluebird = require('bluebird');
var parser = require('cron-parser');
var moment = require('moment');
const Queue = require('bull');

var redis = require("redis");
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

var client1 = redis.createClient(redisConfig),
  client3 = redis.createClient(redisConfig),
  client2 = redis.createClient(redisConfig);

const KEYEVENT_PREFIX =  '__keyevent@' + redisConfig.db + '__:expired';
var TASK_CHANNEL = redisKey.cron_task_queue;
var TASK_PREFIX =  redisKey.prefix;
var APP_SYSTEM = 'app:';

client1.on("error", function (err) {
  console.log("Error " + err);
});
client2.on("error", function (err) {
  console.log("Error " + err);
});
client3.on("error", function (err) {
  console.log("Error " + err);
});

client1.on('ready', function (err) {
  if (err) {
      console.error(err);
  }
  console.log('Cron Service is ready');
});

function getAppSystemKey(name) {
  return APP_SYSTEM + name;
}

// 定时到期,任务处理
client2.on("pmessage", function (pattern, channel, message) {
  switch (pattern){
    case KEYEVENT_PREFIX: {    // 处理完成, 通知 client
      var appName = message.substr(0, message.indexOf(':{'));  // 截取前缀, app:test:{Object}
      // 检查 app name 是否注册过
      if (appName.length > 0) {
         var strs = appName.split(':');
        var _app = strs[1];
        if (_app) { // 获取 app 名字
          client3.getAsync(getAppSystemKey(_app)).then(function(name){
            if (name) { // 存在这个 app
              message = message.replace(appName + ':',''); //  截取 {Object}
              console.log(appName + 'is OK', message);
              addTask(message); // 是否是循环任务, 如果是 继续添加到任务列表
              message = JSON.parse(message);
              client3.publish(message.channel, JSON.stringify(message));
            }
          });
        }
      }

    }
  }
});

/**
 * 当前的任务还未结束 获取下一次定时任务的时间
 * @param interval interval 对象
 * @param next 当前的时间
 */
function getNextDate(interval, next){
  var date = new Date(next.toString());
  var timeOffset = moment(date).unix() - moment().unix();
  if (timeOffset < 1) {
    next = interval.next();
    return getNextDate(interval, next);
  }
  return timeOffset;
}

/**
 * 检查定时任务的时间是否过期
 * @param rule  *    *    *    *    *    *
 * @return string | boolean 过期返回 false, 否则返回过期的毫秒数
 */
function checkRule(rule){
  var interval = parser.parseExpression(rule);
  var next = interval.next();
  console.log(new Date().getTime(),new Date(next.getTime()).getTime());
  if (next.done) {
    return false;
  }else {
    return getNextDate(interval, next);
  }
}

// 任务接受通道,设置过期值
function addTask(message) {
  var obj;
  try {
    obj  = JSON.parse(message);
    console.log('received ' + obj.app + '\'s task ' + obj.method);
    var ttl = checkRule(obj.rule);
    console.log('next: ',ttl);
    if (ttl && ttl > 0) {
      console.log('task will be run after %s second', ttl);
      client3.set(getAppSystemKey(obj.app), obj.app); // 注册 app, 设置任务的 app 到 app 集合,用来做分析处理
      client3.setex(TASK_PREFIX + obj.app + ':' + message, ttl, ''); // 设置过期时间
    }
  } catch (err) {
    console.error(err);
    console.error('task error');
  }
}

client1.on('message', function (channel, message) {
  switch (channel){
    case TASK_CHANNEL: {    // 处理完成, 通知 client
      addTask(message);
    }
  }
});

client1.subscribe(TASK_CHANNEL);  // 订阅任务队列
client2.psubscribe(KEYEVENT_PREFIX);  // 订阅键空间过期通知