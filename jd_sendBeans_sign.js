/*
连续签到，赢大额京豆
活动地址：https://sendbeans.jd.com/jump/index/#/taro/pages/turncard/index?turnTableId=1310&shopId=58661

https://sendbeans.jd.com/jump/index/#/taro/pages/turncard/index?turnTableId=1247&shopId=1000102789

https://sendbeans.jd.com/jump/index/#/taro/pages/turncard/index?turnTableId=1082&shopId=1000004123

1 1,21 * * * jd_sendBeans_sign.js
 */
const $ = new Env('连续签到，赢大额京豆');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';

//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', message = '';
$.invite_pins = [];
const activityList = [
  {
    turnTableId: 1310,
    shopId: 58661
  },
  {
    turnTableId: 1247,
    shopId: 1000102789
  },
  {
    turnTableId: 1082,
    shopId: 1000004123
  }
]
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
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  try {
    for (let i = 0; i < cookiesArr.length; i++) {
      cookie = cookiesArr[i];
      if (cookie) {
        $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
        $.index = i + 1;
        console.log(`\n\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
        for (const item of activityList) {
          $.fp =  randomString();
          $.eid =  randomString(90).toUpperCase();
          const {turnTableId, shopId} = item;
          await main(turnTableId, shopId);
          await $.wait(2000);
        }
      }
    }
  } catch (e) {
    $.logErr(e)
  }
  if (message) {
    $.msg($.name, '', message);
    await notify.sendNotify($.name, message);
  }
  // for (let i = 0; i < cookiesArr.length; i++) {
  //   cookie = cookiesArr[i];
  //   if (cookie) {
  //     $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
  //     $.index = i + 1;
  //     for (const item of $.invite_pins) {
  //       if (!item['pin']) continue;
  //       console.log(`\n\n******【京东账号${$.index}】${$.nickName || $.UserName}开始 助力 ${item['pin']}*********\n`);
  //       const data = await invite(item['pin']);
  //       if (data && data.success && data.data) {
  //         const res = await join(item['pin']);
  //         if (res) {
  //           if (res['errorCode'] && (res['errorCode'] === '612201' || res['errorCode'] === '612209')) {
  //             break
  //           }
  //         }
  //       } else {
  //         console.log('invite异常', data);
  //       }
  //       await $.wait(4000);
  //     }
  //   }
  // }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })
async function main(turnTableId, shopId) {
  try {
    const res = await sendBeansDetail(turnTableId, shopId);
    if (res && res.success && res['data']) {
      const { hasSign, fissionInfo } = res['data'];
      if (fissionInfo) {
        if (fissionInfo['userFissionCount'] !== 3 || fissionInfo['userFissionStatus'] !== 'COMPLETE') {
          console.log(`账号 ${$.index} ${$.UserName} 邀请进度：${fissionInfo['userFissionCount']}/3\n`);
          if ($.index <= 6) {
            $.invite_pins.push({
              pin: $.UserName
            })
          }
        } else {
          console.log(`账号 ${$.index} ${$.UserName},${fissionInfo['shareLine']}\n`);
        }
      }
      if (hasSign) {
        console.log(`账号 ${$.index} ${$.UserName},已签到`);
        return ;
      }
      //开始签到
      await sendBeansSign(turnTableId, shopId);
    } else {
      console.log(`sendBeansDetail 异常：${$.toStr(res)}\n`);
    }
  } catch (e) {
    $.logErr()
  }
}
async function sendBeansSign(turnTableId, shopId) {
  return new Promise(resolve => {
    const options = {
      url: `https://sendbeans.jd.com/api/turncard/chat/sign?turnTableId=${turnTableId}&shopId=${shopId}&fp=${$.fp}&eid=${$.eid}`,
      headers: {
        'Cookie' : cookie ,
        'Accept-Encoding' : `gzip, deflate, br`,
        'user-agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        'Accept-Language' : `zh-cn`,
        'Referer' : `https://sendbeans.jd.com/jump/index/`,
        'Origin' : `sendbeans.jd.com`
      }
    }
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log('sendBeansSign', $.toStr(err));
        } else {
          data = $.toObj(data);
          if (data && data.success && data.data) {
            const { topLine, rewardName, jdBeanQuantity } = data['data'];
            $.log(`账号 ${$.index} ${$.UserName}连续签到\n${topLine}，${rewardName}：${jdBeanQuantity}个`);
            message += `账号 ${$.index} ${$.UserName}连续签到\n${topLine}，${rewardName}：${jdBeanQuantity}个\n\n`;
          } else {
            console.log(`sendBeansSign 异常：${$.toStr(data)}\n`);
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve()
      }
    })
  })
}
function sendBeansDetail(turnTableId, shopId) {
  return new Promise(resolve => {
    const options = {
      url: `https://sendbeans.jd.com/api/turncard/chat/detail?turnTableId=${turnTableId}&shopId=${shopId}`,
      headers: {
        'Cookie' : cookie ,
        'Accept-Encoding' : `gzip, deflate, br`,
        'user-agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        'Accept-Language' : `zh-cn`,
        'Referer' : `https://sendbeans.jd.com/jump/index/`,
        'Origin' : `sendbeans.jd.com`
      }
    }
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log('sendBeansDetail', $.toStr(err));
        } else {
          data = $.toObj(data)
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data)
      }
    })
  })
}

function invite(pin) {
  return new Promise(resolve => {
    const options = {
      url: `https://draw.jdfcloud.com//api/turncard/chat/invite?appId=wxccb5c536b0ecd1bf&turnTableId=1310&shopId=58661&invitePin=${encodeURIComponent(pin)}&openId=oPcgJ40Ol7BSTczZ2ok0WmfLWoAs`,
      headers: {
        "Accept-Encoding": "gzip,compress,br,deflate",
        "App-Id": "wxccb5c536b0ecd1bf",
        "Connection": "keep-alive",
        "Host": "draw.jdfcloud.com",
        "LKYLToken": "",
        "Lottery-Access-Signature": "",
        "Referer": "https://servicewechat.com/wxccb5c536b0ecd1bf/776/page-frame.html",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.16(0x1800102c) NetType/WIFI Language/zh_CN",
        "content-type": "application/json",
        "openId": "oPcgJ40Ol7BSTczZ2ok0WmfLWoAs"
      }
    }
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log('invite', $.toStr(err));
        } else {
          data = $.toObj(data);
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data)
      }
    })
  })
}
function join(pin) {
  return new Promise(resolve => {
    const options = {
      url: `https://draw.jdfcloud.com//api/turncard/chat/join?appId=wxccb5c536b0ecd1bf&client=apple&turnTableId=1310&shopId=58661&invitePin=${encodeURIComponent(pin)}&inviteDate=1637138004853&thresholdType=1&openId=oPcgJ40Ol7BSTczZ2ok0WmfLWoAs`,
      headers: {
        'Cookie' : cookie,
        "Accept-Encoding": "gzip,compress,br,deflate",
        "App-Id": "wxccb5c536b0ecd1bf",
        "Connection": "keep-alive",
        "Host": "draw.jdfcloud.com",
        "LKYLToken": "",
        "Lottery-Access-Signature": "",
        "Referer": "https://servicewechat.com/wxccb5c536b0ecd1bf/776/page-frame.html",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.16(0x1800102c) NetType/WIFI Language/zh_CN",
        "content-type": "application/json",
        "openId": "oPcgJ40Ol7BSTczZ2ok0WmfLWoAs"
      }
    }
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log('join', $.toStr(err));
        } else {
          console.log('\njoin', data);
          data = $.toObj(data)
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data)
      }
    })
  })
}
function randomString(e) {
  e = e || 32;
  let t = "abcdef0123456789", a = t.length, n = "";
  for (i = 0; i < e; i++)
    n += t.charAt(Math.floor(Math.random() * a));
  return n
}
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}