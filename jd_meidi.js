/*
* 每日跑2次
* 默认不加购物车
* 环境变量PURCHASE_SHOPS为true则完成加购物车的任务
31 3,4 1-30 11 * jd_meidi.js
* */
const $ = new Env('奔跑的小美');
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let cookiesArr = [];
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {
    };
} else {
    cookiesArr = [
        $.getdata("CookieJD"),
        $.getdata("CookieJD2"),
        ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
}
let inAnswerInfo = {"469":{"cId":1},"470":{"cId":2},"471":{"cId":2},"472":{"cId":2},"473":{"cId":1},"474":{"cId":2},"475":{"cId":1},"476":{"cId":2},"477":{"cId":2},"478":{"cId":2},"479":{"cId":2},"480":{"cId":2},"481":{"cId":1},"482":{"cId":1},"483":{"cId":1},"484":{"cId":2},"485":{"cId":1},"486":{"cId":1},"487":{"cId":2},"488":{"cId":2},"489":{"cId":1},"490":{"cId":2},"491":{"cId":2},"492":{"cId":2},"493":{"cId":1},"494":{"cId":2},"495":{"cId":2},"496":{"cId":2},"497":{"cId":2},"498":{"cId":2},"499":{"cId":2},"500":{"cId":1},"501":{"cId":1},"502":{"cId":1},"503":{"cId":1},"504":{"cId":2},"505":{"cId":2},"506":{"cId":2},"507":{"cId":1},"508":{"cId":1},"509":{"cId":1},"510":{"cId":2},"511":{"cId":1},"512":{"cId":1},"513":{"cId":1},"514":{"cId":1},"515":{"cId":2},"516":{"cId":1},"517":{"cId":2},"518":{"cId":2},"519":{"cId":1},"520":{"cId":2},"521":{"cId":1},"522":{"cId":2},"523":{"cId":2},"524":{"cId":1},"525":{"cId":2},"526":{"cId":2},"527":{"cId":1},"528":{"cId":2},"529":{"cId":2},"530":{"cId":1},"531":{"cId":1},"532":{"cId":2},"533":{"cId":2},"534":{"cId":2},"535":{"cId":1},"536":{"cId":2},"537":{"cId":2},"538":{"cId":1},"539":{"cId":2},"540":{"cId":2},"541":{"cId":1},"542":{"cId":2},"543":{"cId":1},"544":{"cId":1},"545":{"cId":2},"546":{"cId":2},"547":{"cId":2},"548":{"cId":2},"549":{"cId":2},"550":{"cId":1},"551":{"cId":1},"552":{"cId":1},"553":{"cId":1},"554":{"cId":1},"555":{"cId":1},"556":{"cId":1},"557":{"cId":1},"558":{"cId":1},"559":{"cId":2},"560":{"cId":2},"561":{"cId":2},"562":{"cId":2},"563":{"cId":1},"564":{"cId":1},"565":{"cId":2},"566":{"cId":1},"567":{"cId":2},"568":{"cId":1},"569":{"cId":1},"570":{"cId":1},"571":{"cId":1},"572":{"cId":2},"573":{"cId":1},"574":{"cId":1},"575":{"cId":2},"576":{"cId":2},"577":{"cId":1},"578":{"cId":2},"579":{"cId":1},"580":{"cId":2},"581":{"cId":1},"582":{"cId":2},"583":{"cId":2},"584":{"cId":2},"585":{"cId":1},"586":{"cId":1},"587":{"cId":1},"588":{"cId":2},"589":{"cId":2},"590":{"cId":2},"591":{"cId":2},"592":{"cId":1},"593":{"cId":1},"594":{"cId":2},"595":{"cId":1},"596":{"cId":1},"597":{"cId":2},"598":{"cId":1},"599":{"cId":1},"600":{"cId":1},"601":{"cId":2},"602":{"cId":1},"603":{"cId":2},"604":{"cId":2},"605":{"cId":2},"606":{"cId":2},"607":{"cId":2},"608":{"cId":1},"609":{"cId":2},"610":{"cId":2},"611":{"cId":1},"612":{"cId":2},"613":{"cId":2},"614":{"cId":2},"615":{"cId":1},"616":{"cId":1},"617":{"cId":2},"618":{"cId":2},"619":{"cId":2},"620":{"cId":2},"621":{"cId":2},"622":{"cId":1},"623":{"cId":1},"624":{"cId":2},"625":{"cId":2},"626":{"cId":2},"627":{"cId":2},"628":{"cId":1},"629":{"cId":1},"630":{"cId":2},"631":{"cId":1},"632":{"cId":2},"633":{"cId":1},"634":{"cId":1},"635":{"cId":2},"636":{"cId":2},"637":{"cId":2},"638":{"cId":2},"639":{"cId":1},"640":{"cId":2},"641":{"cId":2},"642":{"cId":2},"643":{"cId":2},"644":{"cId":1},"645":{"cId":1},"646":{"cId":1},"647":{"cId":2},"648":{"cId":2},"649":{"cId":2},"650":{"cId":1},"651":{"cId":1},"652":{"cId":1},"653":{"cId":2},"654":{"cId":1},"655":{"cId":2},"656":{"cId":1},"657":{"cId":1},"658":{"cId":2},"659":{"cId":1},"660":{"cId":1},"661":{"cId":1},"662":{"cId":1},"663":{"cId":1},"664":{"cId":1},"665":{"cId":2},"666":{"cId":2},"667":{"cId":1},"668":{"cId":1},"669":{"cId":2},"670":{"cId":1},"671":{"cId":2},"672":{"cId":2},"673":{"cId":1},"674":{"cId":2},"675":{"cId":2},"676":{"cId":1},"677":{"cId":1},"678":{"cId":1},"679":{"cId":2},"680":{"cId":2},"681":{"cId":1},"682":{"cId":1},"683":{"cId":2},"684":{"cId":1},"685":{"cId":2},"686":{"cId":1},"687":{"cId":2},"688":{"cId":2},"689":{"cId":1},"690":{"cId":2},"691":{"cId":1},"692":{"cId":1},"693":{"cId":1},"694":{"cId":2},"695":{"cId":2},"696":{"cId":2},"697":{"cId":1},"698":{"cId":2},"699":{"cId":1},"700":{"cId":1},"701":{"cId":2},"702":{"cId":2},"703":{"cId":1},"704":{"cId":1},"705":{"cId":1},"706":{"cId":2},"707":{"cId":1},"708":{"cId":1},"709":{"cId":1},"710":{"cId":1},"711":{"cId":1},"712":{"cId":1},"713":{"cId":1},"714":{"cId":1},"715":{"cId":1},"716":{"cId":2},"717":{"cId":2},"718":{"cId":2},"719":{"cId":2},"720":{"cId":1},"721":{"cId":1},"722":{"cId":1},"723":{"cId":1},"724":{"cId":2},"725":{"cId":2},"726":{"cId":1},"727":{"cId":2},"728":{"cId":1},"729":{"cId":2},"730":{"cId":2},"731":{"cId":2},"732":{"cId":1},"733":{"cId":1},"734":{"cId":1},"735":{"cId":1},"736":{"cId":1},"737":{"cId":1},"738":{"cId":1},"739":{"cId":1},"740":{"cId":2},"741":{"cId":2},"742":{"cId":2},"743":{"cId":1},"744":{"cId":2},"745":{"cId":1},"746":{"cId":2},"747":{"cId":2},"748":{"cId":2},"749":{"cId":1},"750":{"cId":2},"751":{"cId":2},"752":{"cId":1},"753":{"cId":1},"754":{"cId":2},"755":{"cId":2},"756":{"cId":1},"757":{"cId":1},"758":{"cId":1},"759":{"cId":1},"760":{"cId":1},"761":{"cId":1},"762":{"cId":1},"763":{"cId":1},"764":{"cId":2},"765":{"cId":1},"766":{"cId":2},"767":{"cId":1},"768":{"cId":1},"769":{"cId":2},"770":{"cId":2},"771":{"cId":1},"772":{"cId":2},"773":{"cId":1},"774":{"cId":1},"775":{"cId":1},"776":{"cId":1},"777":{"cId":2},"778":{"cId":2},"779":{"cId":2},"780":{"cId":1},"781":{"cId":2},"782":{"cId":2},"783":{"cId":1},"784":{"cId":1},"785":{"cId":2},"786":{"cId":2},"787":{"cId":2},"788":{"cId":1},"789":{"cId":2},"790":{"cId":2},"791":{"cId":2},"792":{"cId":2},"793":{"cId":1},"794":{"cId":1},"795":{"cId":2},"796":{"cId":2},"797":{"cId":1},"798":{"cId":2},"799":{"cId":1},"800":{"cId":2},"801":{"cId":2},"802":{"cId":1},"803":{"cId":1},"804":{"cId":2},"805":{"cId":1},"806":{"cId":1},"807":{"cId":1},"808":{"cId":2},"809":{"cId":2},"810":{"cId":1},"811":{"cId":2},"812":{"cId":1},"813":{"cId":2},"814":{"cId":2},"815":{"cId":1},"816":{"cId":2},"817":{"cId":2},"818":{"cId":2},"819":{"cId":1},"820":{"cId":2},"821":{"cId":2},"822":{"cId":1},"823":{"cId":1},"824":{"cId":2},"825":{"cId":1},"826":{"cId":1},"827":{"cId":2},"828":{"cId":2},"829":{"cId":2},"830":{"cId":1},"831":{"cId":1},"832":{"cId":1},"833":{"cId":2},"834":{"cId":2},"835":{"cId":1},"836":{"cId":1},"837":{"cId":2},"838":{"cId":1},"839":{"cId":1},"840":{"cId":2},"841":{"cId":2},"842":{"cId":2},"843":{"cId":1},"844":{"cId":1},"845":{"cId":2},"846":{"cId":1},"847":{"cId":2},"848":{"cId":1},"849":{"cId":2},"850":{"cId":2},"851":{"cId":2},"852":{"cId":2},"853":{"cId":2},"854":{"cId":1},"855":{"cId":1},"856":{"cId":1},"857":{"cId":2},"858":{"cId":2},"859":{"cId":2},"860":{"cId":1},"861":{"cId":2},"862":{"cId":2},"863":{"cId":1},"864":{"cId":2},"865":{"cId":2},"866":{"cId":2},"867":{"cId":2},"868":{"cId":2},"869":{"cId":1},"870":{"cId":1},"871":{"cId":2},"872":{"cId":2},"873":{"cId":2},"874":{"cId":1},"875":{"cId":2},"876":{"cId":2},"877":{"cId":1},"878":{"cId":2},"879":{"cId":2},"880":{"cId":2},"881":{"cId":2},"882":{"cId":2},"883":{"cId":2},"884":{"cId":1},"885":{"cId":1},"886":{"cId":1},"887":{"cId":2},"888":{"cId":1},"889":{"cId":1},"890":{"cId":1},"891":{"cId":2},"892":{"cId":1},"893":{"cId":2},"894":{"cId":1},"895":{"cId":2},"896":{"cId":2},"897":{"cId":1},"898":{"cId":2},"899":{"cId":2},"900":{"cId":2},"901":{"cId":2},"902":{"cId":2},"903":{"cId":1},"904":{"cId":1},"905":{"cId":2},"906":{"cId":1},"907":{"cId":2},"908":{"cId":2},"909":{"cId":1},"910":{"cId":2},"911":{"cId":2},"912":{"cId":2},"913":{"cId":1},"914":{"cId":1},"915":{"cId":2},"916":{"cId":2},"917":{"cId":2},"918":{"cId":2},"919":{"cId":1},"920":{"cId":2},"921":{"cId":1},"922":{"cId":1},"923":{"cId":1},"924":{"cId":2},"925":{"cId":2},"926":{"cId":2},"927":{"cId":2},"928":{"cId":2},"929":{"cId":2},"930":{"cId":1},"931":{"cId":2},"932":{"cId":2},"933":{"cId":2},"934":{"cId":1},"935":{"cId":2},"936":{"cId":1}};
let LZ_TOKEN_VALUE = '',pin='',nickname='',attrTouXiang='';
$.shareUuid = 'a01782b7e611402fae556afd56c02278';
$.CryptoJS = require('crypto-js');
let answerInfo = {};
!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
        return;
    }
    // answerInfo = $.getdata('answerInfo');
    // if (!answerInfo) {
    //     $.setdata({}, 'answerInfo');
    //     answerInfo = {};
    // }
    answerInfo = inAnswerInfo;
    for (let i = 0; i < cookiesArr.length; i++) {
        $.index = i + 1;
        $.cookie = cookiesArr[i];
        $.isLogin = true;
        $.nickName = '';
        $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
        //await TotalBean();
        console.log(`\n*****开始【京东账号${$.index}】${$.nickName || $.UserName}*****\n`);
        if (!$.isLogin) {
            $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

            if ($.isNode()) {
                await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
            }
            continue
        }
        try {
            await main($.cookie);
        }catch (e) {
            console.log(e)
        }
    }
})().catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
    $.done();
});
async function main(cookie) {
    let userName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1]);
    let token = await getToken(cookie);
    console.log(token)
    LZ_TOKEN_VALUE = '',pin='',nickname='';
    await getMyPing(`https://cjdp.dianpusoft.cn/customer/getMyPing?token=${token}&userId=1000282702&fromType=mini`);
    if(!token || !LZ_TOKEN_VALUE ||!pin ||!nickname){
        console.log(`黑号`);
        return ;
    }
    attrTouXiang = 'https://img10.360buyimg.com/imgzone/jfs/t1/207900/7/5803/100575/616d0317Eb6e04312/351d4431e83c606e.png';
    await getUserInfo(`https://cjdp.dianpusoft.cn/wxActionCommon/getUserInfo?pin=${encodeURIComponent(pin)}`);
    await accessLogWithAD(`https://cjdp.dianpusoft.cn/common/accessLogWithAD?venderId=1000282702&code=100&pin=${encodeURIComponent(pin)}&activityId=902102001&pageUrl=pages%2Findex%2Findex&subType=weapp&adSource=DirectSeeding`);
    let activityInfo = await takeRequest(`activityContent`);
    //console.log(`${activityInfo.uid}`);
    let myInfo = await takeRequest(`myInfo`);
    if($.shareUuid){
        await $.wait(2000);
        let helpInfo = await takeRequest(`helpFriend`,`&shareUuid=${$.shareUuid}`);
        //console.log(JSON.stringify(helpInfo));
        await $.wait(2000);
    }
    let taskList = myInfo.task;
    let freshFlag = false;
    for (let i = 0; i < taskList.length; i++) {
        $.oneTask = taskList[i];
        if($.oneTask.curNum === $.oneTask.maxNeed){
            console.log(`任务：${$.oneTask.taskname},已完成`);
            continue;
        }
        if($.oneTask.taskid === 'buysku' || $.oneTask.taskid === 'joinvip' || $.oneTask.taskid === 'share2help'){
            continue;
        }
        if($.oneTask.taskid === 'scansku' || $.oneTask.taskid === 'add2cart'){
            if ($.oneTask.taskid === 'add2cart' && !process.env.PURCHASE_SHOPS) continue
            console.log(`任务：${$.oneTask.taskname},去执行`);
            let productList = [];
            if($.oneTask.taskid === 'scansku'){
                productList = await takeRequest(`getproduct`,'&type=4');
            }else if($.oneTask.taskid === 'add2cart'){
                productList = await takeRequest(`getproduct`,'&type=1');
            }
            await $.wait(2000);
            for (let j = 0; j < productList.length; j++) {
                $.oneItem = productList[j];
                if($.oneItem.taskDone !== true){
                    console.log(`任务：${$.oneTask.taskname},${$.oneItem.name},去执行`);
                    let doInfo = await takeRequest(`doTask`,`&taskId=${$.oneTask.taskid}&param=${$.oneItem.id}`);
                    console.log(`执行结果：${JSON.stringify(doInfo)}`);
                    await $.wait(3000);
                    freshFlag = true;
                }
            }
        }else{
            console.log(`任务：${$.oneTask.taskname},去执行`);
            let doInfo = await takeRequest(`doTask`,`&taskId=${$.oneTask.taskid}&param=`);
            console.log(`执行结果：${JSON.stringify(doInfo)}`);
            await $.wait(3000);
            freshFlag = true;
        }
    }
    if(freshFlag){
        myInfo = await takeRequest(`myInfo`);
        await $.wait(3000);
    }
    let questionNumber =  myInfo.leftchance;
    console.log(`\n可以答题次数:${questionNumber}`);
    for (let i = 0; i < questionNumber && i<10; i++) {
        console.log(`\n开始第${i+1}次答题`);
        $.gameId = await takeRequest(`game/start`);
        console.log(`答题ID：${$.gameId}`);
        if($.gameId === -1 || $.gameId === '-1'){
            break;
        }
        let questionList = await takeRequest(`questions`,`&limit=10`);
        let chaseFlag = true;
        await $.wait(1000);
        $.correctAmount = 0;
        $.score = 0;
        for (let j = 0; j < questionList.length && $.gameId && chaseFlag; j++) {
            $.oneQuestion = questionList[j];
            $.choose = 1;
            let chooseId = `a${$.choose}`;
            console.log(`问题：${$.oneQuestion.title}ID:${$.oneQuestion.id}`);
            console.log(JSON.stringify($.oneQuestion));
            if(answerInfo[$.oneQuestion.id]){
                $.choose = answerInfo[$.oneQuestion.id].cId;
                chooseId =  `a${$.choose}`;
                console.log(`查询到答案，选择：${$.oneQuestion[chooseId]}`)
            }else{
                answerInfo[$.oneQuestion.id] = {'cId':1}
                console.log(`未查询到答案，默认选择：${$.oneQuestion[chooseId]}`);
                //$.setdata(answerInfo, 'answerInfo');
            }
            let chooseInfo = await takeRequest(`choose`);
            if(chooseInfo.correct){
                console.log(`回答正确`);
                $.correctAmount++;
                $.score = $.score + Number(chooseInfo.score);
            }else{
                answerInfo[$.oneQuestion.id].cId = answerInfo[$.oneQuestion.id].cId === 1 ? 2 : 1;
                console.log(`回答错误`);
                //$.setdata(answerInfo, 'answerInfo');
                chaseFlag = false;
            }
            await $.wait(2000);
        }
        console.log(`结束答题,答对${$.correctAmount}题,获得积分${$.score}`);
        let endInfo = await takeRequest(`end`);
        console.log(`结束返回：${JSON.stringify(endInfo)}`);
        await $.wait(5000);
    }
    if(myInfo.bagList.length > 0){
        let bagInfo = myInfo.bagList[0];
        let lossNum = Number(bagInfo.totalNum) - Number(bagInfo.useNum);
        let canDraw = Math.floor(lossNum/50);
        console.log(`可以抽奖${canDraw}次`);
        for (let i = 0; i < canDraw && i<10; i++) {
            console.log(`\n进行一次抽奖`);
            let drawInfo = await takeRequest(`draw`,'&drawId=0&type=0');
            console.log(`结果：${JSON.stringify(drawInfo)}`);
            await $.wait(3000);
        }
    }
}

async function takeRequest(functionId,info = ''){
    let url = '';
    if(functionId === 'activityContent') {
        url = `https://cjdp.dianpusoft.cn/dingzhi/bd/common/${functionId}?activityId=902102001&pin=${encodeURIComponent(pin)}&nick=${encodeURIComponent(nickname)}&pinImg=${encodeURIComponent(attrTouXiang)}&shareUuid=${$.shareUuid}`;
    }else if(functionId === 'choose'){
        url = `https://cjdp.dianpusoft.cn/dingzhi/midea/answer/choose?activityId=902102001&pin=${encodeURIComponent(pin)}&questionId=${$.oneQuestion.id}&choose=${$.choose}&gameId=${$.gameId}`
    }else if(functionId === 'end'){
        let bodyTime = Date.now();
        let bodySign = `${$.gameId},${bodyTime},${$.score}71b597dc94cb8f3b89ccfda6beb57dbe`;
        bodySign = $.CryptoJS.MD5(bodySign);
        url = `https://cjdp.dianpusoft.cn/dingzhi/midea/answer/game/end?activityId=902102001&pin=${encodeURIComponent(pin)}&reqtime=${bodyTime}&score=${$.score}&gameId=${$.gameId}&data=${$.correctAmount}&sign=${bodySign}`
    }else{
        url = `https://cjdp.dianpusoft.cn/dingzhi/bd/common/${functionId}?activityId=902102001&pin=${encodeURIComponent(pin)}${info}`;
    }
    let time = Date.now();
    let sign = `time=${time}&pin=${pin}&key=kjB5wGaZuZHNVEsAb04GL2Oi7bUcbqW6qgudCX2tklTR6Y`;
    sign = $.CryptoJS.MD5(sign);
    const headers = {
        'Host': 'cjdp.dianpusoft.cn',
        'sign':	sign,
        'time': time,
        'content-type': 'application/json',
        'Accept-Encoding': 'gzip,compress,br,deflate',
        'user-agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        'Referer':'https://servicewechat.com/wx4d291470222bb211/8/page-frame.html',
    }
    let myRequest =  {url: url, headers: headers};
    return new Promise(async resolve => {
        $.get(myRequest, (err, resp, data) => {
            try {
                if(functionId === 'game/start'){
                    console.log(data);
                }
                if(err){
                    console.log(err);
                }else{
                    data = JSON.parse(data);
                }
            } catch (e) {
                console.log(data);
                $.logErr(e, resp)
            } finally {
                resolve(data.data || {});
            }
        })
    })
}
function accessLogWithAD(url) {
    let myRequest = {
        url: url,
        headers: {
            'Host': 'cjdp.dianpusoft.cn',
            'content-type': 'application/json',
            'Accept-Encoding': 'gzip,compress,br,deflate',
            'user-agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
            'Referer':'https://servicewechat.com/wx4d291470222bb211/8/page-frame.html',
        }
    }
    return new Promise(async resolve => {
        $.get(myRequest, (err, resp, data) => {
            try {

            } catch (e) {
                console.log(data);
                $.logErr(e, resp)
            } finally {
                resolve('');
            }
        })
    })
}
function getUserInfo(url) {
    let time = Date.now();
    let sign = `time=${time}&pin=${pin}&key=kjB5wGaZuZHNVEsAb04GL2Oi7bUcbqW6qgudCX2tklTR6Y`;
    sign = $.CryptoJS.MD5(sign);
    let myRequest = {
        url: url,
        headers: {
            'Host': 'cjdp.dianpusoft.cn',
            'sign':	sign,
            'time': time,
            'content-type': 'application/json',
            'Accept-Encoding': 'gzip,compress,br,deflate',
            'user-agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
            'Referer':'https://servicewechat.com/wx4d291470222bb211/8/page-frame.html',
        }
    }
    return new Promise(async resolve => {
        $.get(myRequest, (err, resp, data) => {
            try {

                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                }
                else {
                    if(data){
                        data = JSON.parse(data);
                        if(data.count === 0 && data.result){
                            if(data.data.yunMidImageUrl){
                                attrTouXiang = data.data.yunMidImageUrl
                            }
                        }
                    }
                }
            } catch (e) {
                console.log(data);
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}
function getMyPing(url) {
    let myRequest = {
        url: url,
        headers: {
            'Host': 'cjdp.dianpusoft.cn',
            'time': Date.now(),
            'content-type': 'application/json',
            'Accept-Encoding': 'gzip,compress,br,deflate',
            'user-agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
            'Referer':'https://servicewechat.com/wx4d291470222bb211/8/page-frame.html',
        }
    }
    return new Promise(async resolve => {
        $.get(myRequest, (err, resp, data) => {
            try {
                let setcookie = resp['headers']['set-cookie'] || resp['headers']['Set-Cookie'] || ''
                if(setcookie){
                    let lzjdpintoken = setcookie.filter(row => row.indexOf("lz_jdpin_token") !== -1)[0]
                    if(lzjdpintoken && lzjdpintoken.indexOf("lz_jdpin_token=") > -1){
                        LZ_TOKEN_VALUE = lzjdpintoken.split(';') && (lzjdpintoken.split(';')[0] + ';') || ''
                    }
                    let LZTOKENVALUE = setcookie.filter(row => row.indexOf("LZ_TOKEN_VALUE") !== -1)[0]
                    if(LZTOKENVALUE && LZTOKENVALUE.indexOf("LZ_TOKEN_VALUE=") > -1){
                        LZ_TOKEN_VALUE = LZTOKENVALUE.split(';') && (LZTOKENVALUE.split(';')[0]) || ''
                        LZ_TOKEN_VALUE = LZ_TOKEN_VALUE.replace('LZ_TOKEN_VALUE=','')
                    }
                }
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    console.log(`执行任务异常`);
                    console.log(data);
                }
                if (data.data && data.data.secretPin) {
                    pin = data.data.secretPin
                    nickname = data.data.nickname
                } else {
                    console.log(JSON.stringify(data));
                }
            } catch (e) {
                console.log(data);
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}
function getToken(cookie) {
    let config = {
        url: 'https://wxapplogin2.m.jd.com/cgi-bin/login/isv/isvObfuscator',
        body: 'body=%7B%22url%22%3A%22m.jd.com%22%2C%22id%22%3A%22wx_login_source%22%2C%22client%22%3A%22wxapp%22%2C%22wxappid%22%3A%22wx4d291470222bb211%22%7D',
        headers: {
            'Host': 'wxapplogin2.m.jd.com',
            'accept': '*/*',
            'user-agent': 'JD4iPhone/167490 (iPhone; iOS 14.2; Scale/3.00)',
            'accept-language': 'zh-Hans-JP;q=1, en-JP;q=0.9, zh-Hant-TW;q=0.8, ja-JP;q=0.7, en-US;q=0.6',
            'content-type': 'application/x-www-form-urlencoded',
            'Cookie': cookie
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
                resolve(data['token'] || '');
            }
        })
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
                "Cookie": $.cookie,
                "Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
                "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")
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
                        if (data['retcode'] === 0) {
                            $.nickName = (data['base'] && data['base'].nickname) || $.UserName;
                        } else {
                            $.nickName = $.UserName
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
