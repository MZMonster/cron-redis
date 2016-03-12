/**
 * Created by liuxing on 16/3/12.
 */
'use strict';

const Queue = require('bull');
var methods = {};
var parser = require('cron-parser');
var queue;

/**
 * 根据函数名查找函数实现
 * @param name
 * @returns {*}
 */
function getMethod(name){
  return methods[name];
}

/**
 * 当前的任务还未结束 获取下一次定时任务的时间
 * @param interval interval 对象
 * @param next 当前的时间
 */
function getNextDate(interval, next){
  var date = new Date(next.toString());
  var timeOffset = date.getTime() - new Date().getTime();
  if (timeOffset < 1000) {
    next = interval.next();
    return getNextDate(interval, next);
  }else if (timeOffset < 60000) { // 小于1分钟 设置为1分钟,防止重复调用定时任务
    timeOffset = 60000;
  }
  return timeOffset;
}

function init(app, redisConfig) {
  queue = Queue(app, redisConfig.port, redisConfig.host, {
    password: redisConfig.password
  });

  queue.on('ready', function () {
    console.log('%s is ready', app);
  });

  queue.on('failed', function (job, err) {
    console.log(job.jobId);
    console.error(err.stack);
  });

// 定时任务处理
  queue.process(function(job) {
    let task = job.data;
    getMethod(task.method).apply(this, task.params);
    publish(task); // 如果是重复任务则重新发布
    return Promise.resolve();
  });
}

/**
 * 检查定时任务的时间是否过期
 * @param rule  *    *    *    *    *    *
 * @return int 过期返回 false, 否则返回过期的毫秒数
 */
function getTTL(rule){

  var interval;
  try {
    interval = parser.parseExpression(rule);
    var next = interval.next();
    if (next.done) {
      return 0;
    }else {
      return getNextDate(interval, next); // 毫秒数
    }
  } catch (e) {
    if (rule instanceof Date) {
      return (rule.getTime() - new Date().getTime());
    }
    return 0;
  }
}



/**
 * 发布一个任务
 * @param task 任务内容
 * @param method  任务需要回调的函数引用
 */
function publish(task, method){
  if (method) {
    methods[method.name] = method;
  }
  var options = {};
  // 存在定时
  if (task.rule) {
    //,并且过期时间小于0
    let ttl = Math.ceil(getTTL(task.rule) / 1000);
    if (ttl < 0) {
      return ;
    }
    options.delay = ttl;  // 设置定时任务
  }
  console.log('publish queue task %s ,' +
    ' running task after %s seconds', task.method, options.delay || 0);
  queue.add(task, options);
}

module.exports = function(app, redisConfig){
  init(app, redisConfig);
  Queue.publish = publish;
  return Queue;
}