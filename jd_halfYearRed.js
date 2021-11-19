/*
京东半年红包明细
入口地址：https://wqs.jd.com/my/redpacket.shtml?jxsid=&ptag=&sceneval=2
建议别太过频繁执行，可能会被京东ban IP
1 10 1,20 * * jd_halfYearRed.js
 */
const $ = new Env('京东半年红包明细');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';

//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', message = '';
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
  console.log('京东半年红包明细\n' +
      '入口地址：https://wqs.jd.com/my/redpacket.shtml?jxsid=&ptag=&sceneval=2\n' +
      '建议别太过频繁执行，可能会被京东ban IP')
  try {
    for (let i = 0; i < cookiesArr.length; i++) {
      cookie = cookiesArr[i];
      if (!cookie) continue
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      $.index = i + 1;
      console.log(`\n\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
      await main();
      await $.wait(2000);
    }
  } catch (e) {
    $.logErr(e)
  }
  if (message) {
    $.msg($.name, '', message);
    await notify.sendNotify($.name, message);
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })

async function main() {
  try {
    $.jxRed = 0,
    $.jsRed = 0,
    $.jdRed = 0,
    $.jdhRed = 0,
    $.jdOtherRed = 0,

    $.jxRedUsed = 0,
    $.jsRedUsed = 0,
    $.jdRedUsed = 0,
    $.jdhRedUsed = 0,
    $.jdOtherRedExpire = 0,

    $.jxRedExpire = 0,
    $.jsRedExpire = 0,
    $.jdRedExpire = 0,
    $.jdhRedExpire = 0,
    $.jdOtherRedUsed = 0,

    $.redSum = 0,
    $.redUsedSum = 0,
    $.redExpireSum = 0;
    let page = 1, nextPage = true, isLogin = true;
    do {
      // console.log(`开始查询第${page}页历史红包`);
      const res = await QueryUserRedEnvelopesV2(page);
      if (res && res.msg === 'success' && res.data) {
        const {count, redList = []} = res.data.unUseRedInfo;
        if (page === 1) $.log(`\n近六个月累计获得红包总数：${count}个，历史红包查询中，请稍等片刻...\n`)
        if (!redList) break
        if (redList.length <= 0) {
          break
        } else {
          nextPage = true;
          page++;
          for (const vo of redList) {
            // hbState，2：可使用，3：已使用，4：已过期
            if (vo['hbState'] === 4 && parseFloat(vo['balance']) >= 5) {
              console.log(`\n京东账号 ${$.index} ${$.UserName} 大金额过期红包\n${vo['activityName']} 总金额：${vo['discount']}，过期金额：${vo['balance']}`)
              console.log(`获得时间：${$.time('yyyy-MM-dd HH:mm:ss', vo['beginTime'] * 1000)}，过期时间：${$.time('yyyy-MM-dd HH:mm:ss', vo['endTime'] * 1000)}\n`)
            }
            //总获得红包金额
            $.redSum += parseFloat(vo['discount']);
            //总过期红包金额
            $.redExpireSum += parseFloat(vo['balance']);
            //总使用红包金额
            $.redUsedSum += parseFloat(vo['discount']) - parseFloat(vo['balance']);
            if (vo.orgLimitStr.includes("京喜")) {
              $.jxRed += parseFloat(vo.discount);
              $.jxRedExpire += parseFloat(vo.balance);
              $.jxRedUsed += parseFloat(vo.discount) - parseFloat(vo.balance);
            } else if (vo.orgLimitStr.includes("极速版")) {
              $.jsRed += parseFloat(vo.discount);
              $.jsRedExpire += parseFloat(vo.balance);
              $.jsRedUsed += parseFloat(vo.discount) - parseFloat(vo.balance);
            } else if (vo.orgLimitStr.includes("京东健康")) {
              $.jdhRed += parseFloat(vo.discount);
              $.jdhRedExpire += parseFloat(vo.balance);
              $.jdhRedUsed += parseFloat(vo.discount) - parseFloat(vo.balance);
            } else if (vo.orgLimitStr.includes("京东商城")) {
              $.jdRed += parseFloat(vo.discount);
              $.jdRedExpire += parseFloat(vo.balance);
              $.jdRedUsed += parseFloat(vo.discount) - parseFloat(vo.balance);
            } else {
              $.jdOtherRed += parseFloat(vo.discount);
              $.jdOtherRedExpire += parseFloat(vo.balance);
              $.jdOtherRedUsed += parseFloat(vo.discount) - parseFloat(vo.balance);
            }
          }
        }
      } else {
        console.log(`QueryUserRedEnvelopesV2 异常：${$.toStr(res)}\n`);
        if (res['errcode'] === 13) isLogin = false;
        break
      }
    } while (nextPage);
    if (isLogin) message += `京东账号 ${$.index} ${$.UserName}\n近半年累计：\n获得红包总额，${$.redSum.toFixed(2)}元，使用红包总额：${$.redUsedSum.toFixed(2)}元，过期红包总额：${$.redExpireSum.toFixed(2)}元\n其中详细红包如下：\n通用红包总金额：${$.jdOtherRed.toFixed(2)}元，总使用红包：${$.jdOtherRedUsed.toFixed(2)}元，总过期红包：${$.jdOtherRedExpire.toFixed(2)}元\n京东商城总金额：${$.jdRed.toFixed(2)}元，总使用红包：${$.jdRedUsed.toFixed(2)}元，总过期红包：${$.jdRedExpire.toFixed(2)}元\n京喜 APP总金额：${$.jxRed.toFixed(2)}元，总使用红包：${$.jxRedUsed.toFixed(2)}元，总过期红包：${$.jxRedExpire.toFixed(2)}元\n京东极速总金额：${$.jsRed.toFixed(2)}元，总使用红包：${$.jsRedUsed.toFixed(2)}元，总过期红包：${$.jsRedExpire.toFixed(2)}元\n京东健康总金额：${$.jdhRed.toFixed(2)}元，总使用红包：${$.jdhRedUsed.toFixed(2)}元，总过期红包：${$.jdhRedExpire.toFixed(2)}元\n\n`
  } catch (e) {
    $.logErr(e)
  }
}

async function QueryUserRedEnvelopesV2(page = 1, timeout = 500) {
  // type，1：可用红包，2：历史红包
  // page，分页
  return new Promise(resolve => {
    setTimeout(() => {
      const options = {
        url: `https://wq.jd.com/user/info/QueryUserRedEnvelopesV2?type=2&orgFlag=JD_PinGou_New&page=${page}&cashRedType=1&redBalanceFlag=0&channel=3&_=1637293558804&sceneval=2&g_login_type=1&g_ty=ls`,
        headers: {
          "accept": "*/*",
          "accept-encoding": "gzip, deflate, br",
          "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
          "Cookie": cookie,
          "Referer": "https://wqs.jd.com/",
          "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")
        }
      }
      $.get(options, async (err, resp, data) => {
        try {
          if (err) {
            console.log('QueryUserRedEnvelopesV2 失败', $.toStr(err));
          } else {
            data = $.toObj(data, {});
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data)
        }
      })
    }, timeout)
  })
}

// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}