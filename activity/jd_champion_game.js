/*
电竞预言家
2021年10月22日～2021年11月6日
默认选答案A，也可自己设置环境变量 rightAnswerCode
活动地址 https://dnsm618-100million.m.jd.com
0 0,11,15,17 * * * jd_champion_game.js
*/
const $ = new Env('电竞预言家');
//设置选的答案
const rightAnswerCode = 'A';
$.rightAnswerCode = process.env.rightAnswerCode ? process.env.rightAnswerCode : rightAnswerCode;
const notify = $.isNode() ? require('../sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('../jdCookie.js') : '';
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', message = '', allMessage = '';

if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
} else {
  cookiesArr = [
    $.getdata("CookieJD"),
    $.getdata("CookieJD2"),
    ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
}
let inviteCodes = [];
const JD_API_HOST = 'https://api.m.jd.com/api';
const activeEndTime = '2021/11/14 00:00:00+08:00';//活动结束时间
let nowTime = new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000;
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  $.temp = [];
  if (new Date().getHours() >= 18) {
    console.log(`已过竞猜时间：每日18:00`)
    $.canGuess = true;
    return
  }
  await updateShareCodesCDN();
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      $.beans = 0;//本次运行获得京豆数量
      $.blockAccount = false;//黑号
      message = '';
      console.log(`\n******************开始【京东账号${$.index}】${$.nickName || $.UserName}******************\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
        if ($.isNode()) {
          // await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      await JD818();
    }
  }
  if (allMessage) {
    //NODE端,默认每月一日运行进行推送通知一次
    $.msg($.name, '', allMessage);
    if ($.isNode()) {
      await notify.sendNotify($.name, allMessage, { url: 'https://dnsm618-100million.m.jd.com/' });
    }
  }
  //=====================内部互助===================
  for (let i = 0; i < cookiesArr.length; i++) {
    if (!cookiesArr[i]) continue
    cookie = cookiesArr[i];
    $.index = i + 1;
    $.canHelp = true;//能否助力
    $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
    if ((cookiesArr && cookiesArr.length >= 1) && $.canHelp) {
      console.log(`\n先自己账号内部相互邀请助力\n`);
      for (let item of $.temp) {
        if ($.index === 1) break
        if (!item) continue
        console.log(`\n${$.UserName} 去助力 ${item}`);
        const helpRes = await toHelp(item.trim());
        if (helpRes.data.status === 5) {
          console.log(`助力机会已耗尽，跳出助力`);
          $.canHelp = false;
          break;
        }
      }
    }
    if ($.canHelp) {
      console.log(`\n\n${$.UserName}如果有剩余助力机会，则给作者以及随机码助力`)
      for (let item of $.updatePkActivityIdRes || []) {
        if (!item) continue;
        console.log(`${$.UserName} 开始助力作者邀请码：${item}`);
        const helpRes = await toHelp(item.trim());
        if (helpRes.data.status === 5) {
          console.log(`助力机会已耗尽，跳出助力`);
          break;
        }
      }
    }
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })

async function JD818() {
  try {
    $.lastDate = $.time('yyyyMMdd', parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000 - (1000 * 60 * 60 * 24));
    $.nowDate = $.time('yyyyMMdd');
    $.hasGuess = true;
    $.shareId = '';
    console.log('上一期时间：', $.lastDate + '\n');
    await homePage();//获取任务
    if (!$.hasGuess) {
      //还没竞猜
      console.log(`还没竞猜，现在做任务参与竞猜`)
      //开始做任务
      $.times = 0;
      do {
        await getTaskList();//获取任务列表
        await doHotProductTask()
        if ($.blockAccount) break
        await $.wait(2000)
        $.times += 1;
        console.log(`第${$.times}次完成\n\n`);
      } while (!$.canGuess && $.times < 2)
      if ($.blockAccount) return
      if ($.TaskList && $.TaskList.length > 0) {
        await guessAnswer();//开始选答案
      }
    }
    if ($.blockAccount) return
    if ($.shareId) await supportList();
    //领取上一期京豆
    await homePage('/api/homePage', {activityDate: $.lastDate}, true)
  } catch (e) {
    $.logErr(e)
  }
}
//做任务
async function doHotProductTask() {
  let BROWSE_TASK, FOLLOW_CHANNEL_TASK, FOLLOW_SHOP_TASK, JOIN_SHOPPING_CART;
  for (const item of $.TaskList) {
    const { parentId, taskId, type, finishNum, totalNum, taskState, taskUrl } = item;
    $.timeStamp = '';
    if (type === 'BROWSE_TASK') {
      console.log(`浏览会场任务进度：${finishNum}/${totalNum}`);
      if (finishNum < totalNum) {
        await doBrowse(`/api/task/doTask`, { parentId, taskId, 'activityDate': `${$.time('yyyyMMdd')}` })
        if ($.blockAccount) break
        await $.wait(5000)
        await doBrowse(`/api/task/getReward`, { parentId, taskId, timeStamp: $.timeStamp ? $.timeStamp : Date.now(), 'activityDate': `${$.time('yyyyMMdd')}` })
      } else {
        BROWSE_TASK = true;
      }
    }
    if (type === 'FOLLOW_CHANNEL_TASK') {
      console.log(`浏览频道任务进度：${finishNum}/${totalNum}`);
      if (finishNum < totalNum) {
        await doBrowse(`/api/task/doTask`, { parentId, taskId, 'activityDate': `${$.time('yyyyMMdd')}` })
        await $.wait(1000)
        await doBrowse(`/api/task/getReward`, { parentId, taskId, timeStamp: $.timeStamp ? $.timeStamp : Date.now(), 'activityDate': `${$.time('yyyyMMdd')}` })
      } else {
        FOLLOW_CHANNEL_TASK = true;
      }
    }
    if (type === 'FOLLOW_SHOP_TASK') {
      console.log(`关注店铺任务进度：${finishNum}/${totalNum}`);
      if (finishNum < totalNum) {
        await doBrowse(`/api/task/doTask`, { parentId, taskId, 'activityDate': `${$.time('yyyyMMdd')}` })
        await $.wait(1000)
        await doBrowse(`/api/task/getReward`, { parentId, taskId, timeStamp: $.timeStamp ? $.timeStamp : Date.now(), 'activityDate': `${$.time('yyyyMMdd')}` })
      } else {
        FOLLOW_SHOP_TASK = true;
      }
    }
    if (type === 'JOIN_SHOPPING_CART') {
      console.log(`加购商品任务进度：${finishNum}/${totalNum}`);
      if (finishNum < totalNum) {
        await $.wait(1000)
        await doBrowse(`/api/task/getReward`, { parentId, taskId, timeStamp: $.timeStamp ? $.timeStamp : Date.now(), 'activityDate': `${$.time('yyyyMMdd')}` })
      } else {
        JOIN_SHOPPING_CART = true;
      }
    }
  }
  if (FOLLOW_CHANNEL_TASK && JOIN_SHOPPING_CART && FOLLOW_SHOP_TASK && BROWSE_TASK) {
    $.canGuess = true;
  } else {
    $.canGuess = false
  }
}
function doBrowse(fun = '', body = {}) {
  return new Promise(resolve => {
    const options = taskPostUrl(fun, body)
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          console.log(`doBrowse 做${fun}任务:${data}`);
          data = $.toObj(data);
          if (data) {
            if (data && data['code'] === 200) {
              const { timeStamp } = data.data;
              if (timeStamp) $.timeStamp = timeStamp;
            } else if (data && data['code'] === 1002) {
              console.log(`做任务失败：${data.msg}\n`)
              $.blockAccount = true;//黑号
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

//选择答案
function guessAnswer() {
  return new Promise(resolve => {
    const time = $.time('yyyyMMdd');
    const body = {
      "activityDate": time,
      answerCode: $.rightAnswerCode || `A`
    }
    console.log('本期时间：', time, '开始选择答案：', body.answerCode);
    const options = taskPostUrl('/api/guessAnswer', body)
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          console.log(`选答案 结果:${data}`);
          data = JSON.parse(data);
          if (data && data['code'] === 200) {
            const { shareId, apercent } = data.data;
            console.log(`${apercent}%的人选择了A\n`);
            if (shareId) {
              $.temp.push(shareId);
            }
            if (apercent > 50) {
              $.rightAnswerCode = 'A';
            } else {
              $.rightAnswerCode = 'B';
            }
            await lottery();
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

//进入活动页面
function homePage(functionId = '/api/homePage', body = {}, flag = false) {
  const options = taskPostUrl(functionId, body)
  return new Promise( (resolve) => {
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          if (data.code === 200) {
            const { activityDate, userAnswerCode, shareId, rightAnswerCode, percentA } = data['data'];
            if (userAnswerCode) {
              console.log(`${body.activityDate ? body.activityDate : $.time('yyyyMMdd')}期已参与竞猜，邀请码：${shareId}，选择答案为：${userAnswerCode}，正确答案为：${rightAnswerCode}，A答案百分比：${percentA}`);
              if (activityDate === $.nowDate && shareId) {
                $.temp.push(shareId);
                $.shareId = shareId;
              }
              if (flag) {
                console.log(`开始领取上一期京豆`)
                await saveJbean();
              }
            } else {
              console.log(`${activityDate}期活动，还未参与竞猜\n`);
              $.hasGuess = false;
            }
          } else {
            console.log(`异常：${JSON.stringify(data)}`)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  });
}
//获取助力信息
function supportList() {
  const options = taskPostUrl('/api/initSupport', { shareId: `${$.shareId}` })
  return new Promise( (resolve) => {
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          if (data.code === 200) {
            console.log(`${$.nowDate}期助力情况：${data['data']['supportedNum']}/${data['data']['supportNeedNum']}`);
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  });
}
function lottery() {
  const options = taskPostUrl('/api/lottery/lottery', { "activityDate": $.nowDate, })
  return new Promise( (resolve) => {
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          console.log(`抽奖结果`, data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  });
}
//获取任务列表
function getTaskList(functionId = '/api/task/getTaskList', body = {}) {
  const options = taskPostUrl(functionId, body)
  return new Promise( (resolve) => {
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          if (data.code === 200) {
            console.log(`获取任务列表成功`)
            $.TaskList = data['data'] || [];
          } else {
            console.log(`${functionId}异常：${$.toStr(data)}\n`)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  });
}

//领取往期奖励API
function saveJbean() {
  return new Promise(resolve => {
    const body = {"activityDate": $.lastDate};
    const options = taskPostUrl('/api/lottery', body)
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          console.log('领取京豆结果', data);
          data = JSON.parse(data);
          if (data && data['code'] === 200) {
            if (data['data']) {
              $.beans += Number(data.data);
              allMessage += `账号 ${$.index} ${$.UserName}\n${$.lastDate}期${$.name}获得京豆：${data['data']}\n\n`;
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

//助力API
function toHelp(code = "") {
  return new Promise(resolve => {
    const body = {"shareId" : code};
    const options = taskPostUrl('/api/doSupport', body)
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          console.log(`助力结果:${data}`);
          data = JSON.parse(data);
          if (data && data['code'] === 200) {
            if (data['data']['status'] === 7) console.log(`助力成功\n`)
          }
          if (data && data['code'] === 1002) {
            $.canHelp = false;
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
function updateShareCodesCDN(url = 'https://cdn.jsdelivr.net/gh/gitupdate/updateTeam@master/shareCodes/champion_game.json') {
  return new Promise(resolve => {
    $.get({url , headers:{"User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('../USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")}, timeout: 200000}, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          $.updatePkActivityIdRes = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function taskPostUrl(t, a) {
  const r = Date.now().toString();
  const body = $.toStr({...a,"apiMapping":`${t}`});
  return {
    url: `${JD_API_HOST}`,
    body: `appid=china-joy&functionId=champion_game_prod&body=${body}&t=${r}&loginType=2`,
    headers: {
      "Accept": "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "zh-cn",
      "Connection": "keep-alive",
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": cookie,
      "Host": "api.m.jd.com",
      "Origin": "https://dnsm618-100million.m.jd.com",
      "Referer": "https://dnsm618-100million.m.jd.com/?tttparams=i1zsmeyJsbmciOiIxMjEuNDA2ODU4IiwiZ0xhdCI6IjMxLjM2MDY0IiwibGF0IjoiMzEuMzYzODE2IiwiZ0xuZyI6IjEyMS4zOTQzNCIsImdwc19hcmVhIjoiMl8yODI0XzUxOTE2XzAiLCJ1bl9hcmVhIjoiMl8yODI0XzUxOTE2XzAifQ5%3D%3D&lng=&lat=&sid=&un_area=2_2824_51916_0",
      "User-Agent": "jdapp;iPhone;9.4.6;14.4;0bcbcdb2a68f16cf9c9ad7c9b944fd141646a849;network/4g;ADID/BF650B20-A81A-4172-98EE-064834D97D6E;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone12,1;addressid/2377723269;supportBestPay/0;appBuild/167618;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"
    }

  }
}

// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}