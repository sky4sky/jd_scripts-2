/*
* 活动：荣耀新品传送挑战,每天4豆豆样子
* 入口：荣耀京东自营旗舰店
* 说明： 会加购，不会开卡，会助力作者，没有环境变量（也许会考虑加入不执行加购的环境变量），活动做游戏会有豆子，感觉水很少
*      由于就前几次游戏会给豆子，脚本默认执行5轮游戏，若想多做游戏，可重复执行脚本（会考虑加入执行游戏次数变量）
* 活动时间：9.26-10.15
cron  5 10 26-30,1-15 9,10 * jd_honour.js
*
* */
const $ = new Env('荣耀新品传送挑战');
const jdCookieNode = $.isNode() ? require('../jdCookie.js') : '';
const notify = $.isNode() ? require('../sendNotify') : '';
let cookiesArr = [];
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
    cookiesArr = [
        $.getdata("CookieJD"),
        $.getdata("CookieJD2"),
        ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
}
let userName = '';
let cookie = '',UA = '';
!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
        return;
    }
    let res = [];
    try{res = await getAuthorShareCode('https://raw.githubusercontent.com/lsh26/share_code/main/honour.json');}catch (e) {}
    if(!res){
        try{res = await getAuthorShareCode('https://gitee.com/star267/share-code/raw/master/honour.json');}catch (e) {}
        if(!res){res = [];}
    }
    shareId = '';
    if(res.length > 0){
        shareId = getRandomArrayElements(res,1)[0];
    }
    for (let i = 0; i < cookiesArr.length; i++) {
        let index = i + 1;
        cookie = cookiesArr[i];
        userName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
        $.isLogin = true;
        await TotalBean();
        console.log(`\n*****开始【京东账号${index}】${userName}*****\n`);
        if (!$.isLogin) {
            $.msg($.name, `【提示】cookie已失效`, `京东账号${index} ${userName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
            if ($.isNode()) {
                await notify.sendNotify(`cookie已失效 - ${userName}`, `京东账号${index} ${userName}\n请重新登录获取cookie`);
            }
            continue
        }
        let nowTime = Date.now();
        if(nowTime < '1634399999000'){
            await main();
            await $.wait(1000);
        }else{
            console.log(`\n活动已结束`)
        }
    }
})().catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
    $.done();
});
async function main() {
    UA = `Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/615.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/33E248 Safari/614.1`;
    let token = await takeJoyPost(`framework/user/token?appId=2a679256e7cd6b44234ce590faab81cf&client=m&url=pengyougou.m.jd.com`);
    let lkInfo = await takeJoyPost(`framework/encrypt/pin?appId=2a679256e7cd6b44234ce590faab81cf`);
    await takeJoyPost(`verify/domain?domain=www.kmg-jd.com&appId=2a679256e7cd6b44234ce590faab81cf`);
    if(token && lkInfo && lkInfo.lkEPin && lkInfo.lkToken){
        console.log(`初始化1成功`);
    }else{
        console.log(`初始化1失败，可能黑号`);
        return ;
    }
    let authorization = '';
    let authorizationInfo = await takeKmgPost(`api/user/verify`,'null',lkInfo.lkToken,token,`{"parameters":{"userId":"","lkToken":"${lkInfo.lkToken}","username":"sdfas"}}`);
    if(authorizationInfo && authorizationInfo.token){
        authorization = authorizationInfo.token;
        console.log(`初始化2失败，可能黑号`);
    }else{
        return ;
    }
    let maininfo = await takeKmgPost(`api/higgsNote/active`,authorization,lkInfo.lkToken,token,`{"attributes":{"activeId":"higgsNoteXoASQCnh","shareId":"${shareId}"}}`);
    //let rankingInfo = await takeKmgPost(`api/higgsNote/ranking`,authorization,lkInfo.lkToken,token,`{"attributes":{"activeId":"higgsNoteXoASQCnh","joinId":"${maininfo.data.userVO.joinId}"}}`);
    await takeKmgPost(`api/log/save`,authorization,lkInfo.lkToken,token,`{"attributes":{"activeId":"higgsNoteXoASQCnh","refer":"https://www.kmg-jd.com/honorPC/index.html?lkToken=${lkInfo.lkToken}&token=${token}","origin":"qj","vId":"123","type":"honor","sType":"APP"}}`);
    await doTask(maininfo,authorization,lkInfo,token);
    await $.wait(2000);
    maininfo = await takeKmgPost(`api/higgsNote/active`,authorization,lkInfo.lkToken,token,`{"attributes":{"activeId":"higgsNoteXoASQCnh","shareId":"${shareId}"}}`);
    let gameTime = maininfo.data.userVO.points2;
    console.log(`游戏次数:${gameTime}次`);
    let allList = ['笔记本','平板','电视','路由器','耳机'];
    let takeGameInfo = {};
    let runTime = 0
    for (let i = 0; i < gameTime && runTime <5; i++) {
        console.log(`执行一次游戏`);
        console.log(`开始游戏`);
        takeGameInfo = await takeKmgPost(`api/higgsNote/startGame`,authorization,lkInfo.lkToken,token,`{"attributes":{"activeId":"higgsNoteXoASQCnh","joinId":"${maininfo.data.userVO.joinId}","num":0,"time":0,"goods":"0"}}`);
        await $.wait(500);
        for (let j = 0; j < allList.length; j++) {
            let item = allList[j];
            let time = selectNum(100,500);
            takeGameInfo = await takeKmgPost(`api/higgsNote/startGame`,authorization,lkInfo.lkToken,token,`{"attributes":{"activeId":"higgsNoteXoASQCnh","joinId":"${maininfo.data.userVO.joinId}","num":1,"time":"${time}","goods":["${item}"]}}`);
            if(takeGameInfo.data.lottoryInfo !== null){
                console.log(`成功寻找到【${item}】，获得：${takeGameInfo.data.lottoryInfo.awardVal || ''}${takeGameInfo.data.lottoryInfo.awardName || ''}`);
            }else{
                console.log(`成功寻找到【${item}】`);
            }
            await $.wait(time*10);
        }
        await $.wait(1000);
        console.log(`进行抽奖`);
        let lotteryInfo = await takeKmgPost(`api/higgsNote/lottery`,authorization,lkInfo.lkToken,token,`{"attributes":{"activeId":"higgsNoteXoASQCnh","joinId":"${maininfo.data.userVO.joinId}","lotteryForm":1}}`);
        console.log(JSON.stringify(lotteryInfo));
        await $.wait(1000);
        runTime++;
    }
}
function selectNum(lowNum,upNum) {
    var num = upNum-lowNum+1;
    return Math.floor(Math.random()*num+lowNum);
}
async function doTask(maininfo,authorization,lkInfo,token) {
    let taskInfo = maininfo.data.jobMap;
    for(var oneType in taskInfo){
        if(taskInfo[oneType].points === 0){
            continue;
        }
        if(taskInfo[oneType].done){
            console.log(`任务：${oneType},已完成`);
            continue;
        }
        let taskDetailList = taskInfo[oneType].details;
        for (let i = 0; i < taskDetailList.length; i++) {
            let oneTask = taskDetailList[i];
            if(oneTask.done === 1){
                continue;
            }
            if(oneType === "bookingWare" && oneTask.config === "100026794844"){
                continue;
            }
            console.log(`任务：${oneType},${oneTask.title},去完成`);
            let returnInfo = await takeKmgPost(`api/higgsNote/job`,authorization,lkInfo.lkToken,token,`{"attributes":{"activeId":"higgsNoteXoASQCnh","joinId":"${maininfo.data.userVO.joinId}","jobForm":${taskInfo[oneType].jobForm},"jobDetail":"${oneTask.config}"}}`);
            await $.wait(1000);
            if(oneType === 'bookingWare'){
                await yuyue(oneTask.config);
            }
            if(returnInfo.code === 200){
                if(returnInfo.data.val){
                    console.log(`执行成功,获得${returnInfo.data.val}次游戏机会`);
                }else{
                    console.log(`执行成功`);
                }
            }else{
                console.log(JSON.stringify(returnInfo));
            }
            await $.wait(1000);
        }
    }
}

function yuyue(item) {
    let config = {
        url:  `https://wq.jd.com/bases/yuyue/item?callback=subscribeItemCBA&dataType=1&skuId=${item}&sceneval=2`,
        headers: {
            'Host' : `wq.jd.com`,
            'User-Agent' : UA,
            'Accept' : `*/*`,
            'Referer' : `https://wqs.jd.com/item/yuyue_item.shtml`,
            'Accept-Encoding' : `gzip, deflate`,
            'Accept-Language' : `zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7`,
            'Cookie' : cookie,
            'x-requested-with' : `com.jingdong.app.mall`,
        }
    }
    return new Promise(resolve => {
        $.get(config, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data['data'] || '');
            }
        })
    })
}

function takeKmgPost(url,Authorization,lkToken,token,body) {
    let config = {
        url:  `https://www.kmg-jd.com/${url}`,
        body: body,
        headers: {
            'Accept' : `application/json, text/plain, */*`,
            'Origin' : `https://www.kmg-jd.com`,
            'Accept-Encoding' : `gzip, deflate, br`,
            'Content-Type' : `application/json;charset=UTF-8`,
            'Connection' : `keep-alive`,
            'Host' : `www.kmg-jd.com`,
            'User-Agent' : UA,
            'Authorization' : Authorization,
            'Accept-Language' : `zh-cn`,
            'Referer' : `https://www.kmg-jd.com/honorPC/index.html?lkToken=${lkToken}&token=${token}`
        }
    }
    return new Promise(resolve => {
        $.post(config, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}
function takeJoyPost(url) {
    let config = {
        url:  `https://jdjoy.jd.com/saas/${url}`,
        body:``,
        headers: {
            'Origin' : `https://prodev.m.jd.com`,
            'Cookie' : cookie,
            'Connection' : `keep-alive`,
            'Accept' : `application/json, text/plain, */*`,
            'Referer' : `https://prodev.m.jd.com/mall/active/EmQQKjoPjJvhDEhdUyvsJScvJoZ/index.html`,
            'Host' : `jdjoy.jd.com`,
            'User-Agent' : UA,
            'Accept-Language' : `zh-cn`,
            'Accept-Encoding' : `gzip, deflate, br`
        }
    }
    return new Promise(resolve => {
        $.post(config, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data['data'] || '');
            }
        })
    })
}
function getRandomArrayElements(arr, count) {
    var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}
function getAuthorShareCode(url) {
    return new Promise(async resolve => {
        const options = {
            "url": `${url}`,
            "timeout": 10000,
            "headers": {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
            }
        };
        if ($.isNode() && process.env.TG_PROXY_HOST && process.env.TG_PROXY_PORT) {
            const tunnel = require("tunnel");
            const agent = {
                https: tunnel.httpsOverHttp({
                    proxy: {
                        host: process.env.TG_PROXY_HOST,
                        port: process.env.TG_PROXY_PORT * 1
                    }
                })
            }
            Object.assign(options, { agent })
        }
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                } else {
                    if (data) data = JSON.parse(data)
                }
            } catch (e) {
                // $.logErr(e, resp)
            } finally {
                resolve(data || []);
            }
        })
        await $.wait(10000)
        resolve();
    })
}
function TotalBean() {
    return new Promise(async resolve => {
        const options = {
            "url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
            "headers": {
                "Accept": "application/json,text/plain, */*",
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "zh-cn",
                "Connection": "keep-alive",
                "Cookie": cookie,
                "Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
                "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('../USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")
            }
        }
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (data['retcode'] === 13) {
                            $.isLogin = false; //cookie过期
                            return
                        }
                    } else {
                        console.log(`京东服务器返回空数据`)
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
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
