/*
jd宠汪汪 搬的https://github.com/uniqueque/QuantumultX/blob/4c1572d93d4d4f883f483f907120a75d925a693e/Script/jd_joy.js
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
IOS用户支持京东双账号,NodeJs用户支持N个京东账号
更新时间：2021-7-26
活动入口：京东APP我的-更多工具-宠汪汪
建议先凌晨0点运行jd_joy.js脚本获取狗粮后，再运行此脚本(jd_joy_steal.js)可偷好友积分，6点运行可偷好友狗粮
feedCount:自定义 每次喂养数量; 等级只和喂养次数有关，与数量无关
推荐每次投喂10个，积累狗粮，然后去玩聚宝盆赌
Combine from Zero-S1/JD_tools(https://github.com/Zero-S1/JD_tools)
==========Quantumult X==========
[task_local]
#京东宠汪汪
15 0-23/2 * * * jd_joy.js, tag=京东宠汪汪, img-url=https://raw.githubusercontent.com/58xinian/icon/master/jdcww.png, enabled=true

============Loon===========
[Script]
cron "15 0-23/2 * * *" script-path=jd_joy.js,tag=京东宠汪汪

============Surge==========
[Script]
京东宠汪汪 = type=cron,cronexp="15 0-23/2 * * *",wake-system=1,timeout=3600,script-path=jd_joy.js

===============小火箭==========
京东宠汪汪 = type=cron,script-path=jd_joy.js, cronexpr="15 0-23/2 * * *", timeout=3600, enable=true
*/
const $ = new Env('宠汪汪');
const invokeKey = 'qRKHmL4sna8ZOP9F';
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let allMessage = '';
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '';
let FEED_NUM = ($.getdata('joyFeedCount') * 1) || 10;   //每次喂养数量 [10,20,40,80]
if ($.isNode()) {
  const zooFaker = require('./utils/JDJRValidator_Pure');
  $.get = zooFaker.injectToRequest($.get.bind($));
  $.post = zooFaker.injectToRequest($.post.bind($));
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
  if (process.env.JOY_FEED_COUNT) {
    if ([0, 10, 20, 40, 80].indexOf(process.env.JOY_FEED_COUNT * 1) > -1) {
      FEED_NUM = process.env.JOY_FEED_COUNT ? process.env.JOY_FEED_COUNT * 1 : FEED_NUM;
    } else {
      console.log(`您输入的 JOY_FEED_COUNT 为非法数字，请重新输入`);
    }
  }
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
let message = '', subTitle = '';
let teamLevel = `2`;//参加多少人的赛跑比赛，默认是双人赛跑，可选2，10,50。其他不可选，其中2代表参加双人PK赛，10代表参加10人突围赛，50代表参加50人挑战赛，如若想设置不同账号参加不同类别的比赛则用&区分即可(如：`2&10&50`)
//是否参加宠汪汪双人赛跑（据目前观察，参加双人赛跑不消耗狗粮,如需参加其他多人赛跑，请关闭）
// 默认 'true' 参加双人赛跑，如需关闭 ，请改成 'false';
let joyRunFlag = true;
let jdNotify = true;//是否开启静默运行，默认true开启
let joyRunNotify = true;//宠汪汪赛跑获胜后是否推送通知，true推送，false不推送通知
const JD_API_HOST = 'https://jdjoy.jd.com/pet'
const weAppUrl = 'https://draw.jdfcloud.com//pet';
//apk add --update build-base cairo-dev pango-dev ,docker容器内先运行上面命令,再安装canvas
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      await TotalBean();
      console.log(`\n******开始【京东账号${$.index}】${$.UserName}*******\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      message = '';
      subTitle = '';
      $.validate = '';
      // const zooFaker = require('./utils/JDJRValidator_Pure');
      // $.validate = await zooFaker.injectToRequest()
      await jdJoy();
      await showMsg();
      // await joinTwoPeopleRun();
    }
  }
  if ($.isNode() && joyRunNotify === 'true' && allMessage) await notify.sendNotify(`${$.name}`, `${allMessage}`)
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done();
  })
async function jdJoy() {
  try {
    await launchInvite();
    await feedPets(FEED_NUM);//喂食
    await Promise.all([
      getPetTaskConfig(),//做日常任务
      appGetPetTaskConfig(),//做APP特有的任务
      deskGoodsTask(),//限时货柜
      joinTwoPeopleRun(),//参加双人赛跑
      getInviteFood()
    ])
    await enterRoom();
  } catch (e) {
    $.logErr(e)
  }
}
//逛商品得100积分奖励任务
async function deskGoodsTask() {
  const deskGoodsRes = await getDeskGoodDetails();
  if (deskGoodsRes && deskGoodsRes.success) {
    if (deskGoodsRes.data && deskGoodsRes.data.deskGoods) {
      const { deskGoods, taskChance, followCount = 0 } = deskGoodsRes.data;
      console.log(`浏览货柜商品 ${followCount ? followCount : 0}/${taskChance}`);
      if (taskChance === followCount) return
      for (let item of deskGoods) {
        if (!item['status'] && item['sku']) {
          await followScan(item['sku'])
        }
      }
    } else {
      console.log(`\n限时商品货架已下架`);
    }
  }
}
//参加双人赛跑
async function joinTwoPeopleRun() {
  joyRunFlag = $.getdata('joyRunFlag') ? $.getdata('joyRunFlag') : joyRunFlag;
  if ($.isNode() && process.env.JOY_RUN_FLAG) {
    joyRunFlag = process.env.JOY_RUN_FLAG;
  }
  if (`${joyRunFlag}` === 'true') {
    let teamLevelTemp = [];
    teamLevelTemp = $.isNode() ? (process.env.JOY_TEAM_LEVEL ? process.env.JOY_TEAM_LEVEL.split('&') : teamLevel.split('&')) : ($.getdata('JOY_TEAM_LEVEL') ? $.getdata('JOY_TEAM_LEVEL').split('&') : teamLevel.split('&'));
    teamLevelTemp = teamLevelTemp[$.index - 1] ? teamLevelTemp[$.index - 1] : 2;
    await getPetRace();
    console.log(`\n===以下是京东账号${$.index} ${$.nickName} ${$.petRaceResult.data.teamLimitCount || teamLevelTemp}人赛跑信息===\n`)
    if ($.petRaceResult) {
      let petRaceResult = $.petRaceResult.data.petRaceResult;
      // let raceUsers = $.petRaceResult.data.raceUsers;
      console.log(`赛跑状态：${petRaceResult}\n`);
      if (petRaceResult === 'not_participate') {
        console.log(`暂未参赛，现在为您参加${teamLevelTemp}人赛跑`);
        await runMatch(teamLevelTemp * 1);
        if ($.runMatchResult.success) {
          await getWinCoin();
          console.log(`${$.getWinCoinRes.data.teamLimitCount || teamLevelTemp}人赛跑参加成功\n`);
          message += `${$.getWinCoinRes.data.teamLimitCount || teamLevelTemp}人赛跑：成功参加\n`;
          // if ($.getWinCoinRes.data['supplyOrder']) await energySupplyStation($.getWinCoinRes.data['supplyOrder']);
          await energySupplyStation('2');
          // petRaceResult = $.petRaceResult.data.petRaceResult;
          // await getRankList();
          console.log(`双人赛跑助力请自己手动去邀请好友，脚本不带赛跑助力功能\n`);
        }
      }
      if (petRaceResult === 'unbegin') {
        console.log('比赛还未开始，请九点再来');
      }
      if (petRaceResult === 'time_over') {
        console.log('今日参赛的比赛已经结束，请明天九点再来');
      }
      if (petRaceResult === 'unreceive') {
        console.log('今日参赛的比赛已经结束，现在领取奖励');
        await getWinCoin();
        let winCoin = 0;
        if ($.getWinCoinRes && $.getWinCoinRes.success) {
          winCoin = $.getWinCoinRes.data.winCoin;
        }
        await receiveJoyRunAward();
        console.log(`领取赛跑奖励结果：${JSON.stringify($.receiveJoyRunAwardRes)}`)
        if ($.receiveJoyRunAwardRes.success) {
          joyRunNotify = $.isNode() ? (process.env.JOY_RUN_NOTIFY ? process.env.JOY_RUN_NOTIFY : `${joyRunNotify}`) : ($.getdata('joyRunNotify') ? $.getdata('joyRunNotify') : `${joyRunNotify}`);
          $.msg($.name, '', `【京东账号${$.index}】${$.nickName}\n太棒了，${$.name}赛跑取得获胜\n恭喜您已获得${winCoin}积分奖励`);
          allMessage += `京东账号${$.index}${$.nickName}\n太棒了，${$.name}赛跑取得获胜\n恭喜您已获得${winCoin}积分奖励${$.index !== cookiesArr.length ? '\n\n' : ''}`;
          // if ($.isNode() && joyRunNotify === 'true') await notify.sendNotify(`${$.name} - 京东账号${$.index} - ${$.nickName}`, `京东账号${$.index}${$.nickName}\n太棒了，${$.name}赛跑取得获胜\n恭喜您已获得${winCoin}积分奖励`)
        }
      }
      if (petRaceResult === 'participate') {
        // if ($.getWinCoinRes.data['supplyOrder']) await energySupplyStation($.getWinCoinRes.data['supplyOrder']);
        await energySupplyStation('2');
        await getRankList();
        if($.raceUsers && $.raceUsers.length > 0) {
          for (let index = 0; index < $.raceUsers.length; index++) {
            if (index === 0) {
              console.log(`您当前里程：${$.raceUsers[index].distance}KM\n当前排名:第${$.raceUsers[index].rank}名\n将获得积分:${$.raceUsers[index].coin}\n`);
              // message += `您当前里程：${$.raceUsers[index].distance}km\n`;
            } else {
              console.log(`对手 ${$.raceUsers[index].nickName} 当前里程：${$.raceUsers[index].distance}KM`);
              // message += `对手当前里程：${$.raceUsers[index].distance}km\n`;
            }
          }
        }
        console.log('\n今日已参赛，下面显示应援团信息');
        await getBackupInfo();
        if ($.getBackupInfoResult.success) {
          const { currentNickName, totalMembers, totalDistance, backupList } = $.getBackupInfoResult.data;
          console.log(`${currentNickName}的应援团信息如下\n团员：${totalMembers}个\n团员助力的里程数：${totalDistance}\n`);
          if (backupList && backupList.length > 0) {
            for (let item of backupList) {
              console.log(`${item.nickName}为您助力${item.distance}km`);
            }
          } else {
            console.log(`暂无好友为您助力赛跑，如需助力，请手动去邀请好友助力\n`);
          }
        }
      }
    }
  } else {
    console.log(`您设置的是不参加双人赛跑`)
  }
}
//日常任务
async function petTask() {
  for (let item of $.getPetTaskConfigRes.datas || []) {
    const joinedCount = item.joinedCount || 0;
    if (item['receiveStatus'] === 'chance_full') {
      console.log(`已完成任务：${item.taskName} ${item['joinedCount'] || 0}/${item['taskChance']}`)
      continue
    }
    //每日签到
    if (item['taskType'] === 'SignEveryDay') {
      console.log(`\n-----${item['taskName']}----- 任务进度：${item['joinedCount'] || 0}/${item['taskChance']}`);
      if (item['receiveStatus'] === 'chance_left') {
        console.log(`【${item['taskName']}】未完成,需要自己手动去微信小程序【来客有礼】签到，可获得京豆和${item['taskReward']}g狗粮奖励`)
      } else if (item['receiveStatus'] === 'unreceive') {
        //已签到，领取签到后的狗粮
        const res = await getFood('SignEveryDay');
        console.log(`领取每日签到狗粮结果：${res.data}`);
      }
    }
    //每日赛跑
    if (item['taskType'] === 'race') {
      console.log(`\n-----${item['taskName']}----- 任务进度：${item['joinedCount'] || 0}/${item['taskChance']}`);
      if (item['receiveStatus'] === 'chance_left') {
        console.log('每日赛跑未完成')
      } else if (item['receiveStatus'] === 'unreceive') {
        const res = await getFood('race');
        console.log(`领取每日赛跑狗粮结果：${res.data}`);
      }
    }
    //每日兑换
    if (item['taskType'] === 'exchange') {
      console.log(`\n-----${item['taskName']}----- 任务进度：${item['joinedCount'] || 0}/${item['taskChance']}`);
      if (item['receiveStatus'] === 'unreceive') {
        const res = await getFood('exchange');
        console.log(`领取每日兑换狗粮结果：${res.data}`);
      }
    }
    //每日帮好友喂一次狗粮
    if (item['taskType'] === 'HelpFeed') {
      console.log(`\n-----${item['taskName']}----- 任务进度：${item['joinedCount'] || 0}/${item['taskChance']}`);
      if (item['receiveStatus'] === 'chance_left') {
        console.log('每日帮好友喂一次狗粮未完成')
      } else if (item['receiveStatus'] === 'unreceive') {
        const res = await getFood('HelpFeed');
        console.log(`领取 【${item['taskName']}】任务奖励结果：${res.data}`);
      }
    }
    //每日喂狗粮
    if (item['taskType'] === 'FeedEveryDay') {
      console.log(`\n-----${item['taskName']}----- 任务进度：${item['feedTotal'] || 0}/${item['feedAmount']}`);
      if (item['receiveStatus'] === 'chance_left') {
        console.log(`${item['taskName']} 任务进行中\n`)
      } else if (item['receiveStatus'] === 'unreceive') {
        const res = await getFood('FeedEveryDay');
        console.log(`领取每日喂狗粮 结果：${res.data}`);
      }
    }
    //
    //邀请用户助力,领狗粮.(需手动去做任务)
    if (item['taskType'] === 'InviteUser') {
      console.log(`\n-----${item['taskName']}----- 任务进度：${item['joinedCount'] || 0}/${item['taskChance']}`);
      if (item['receiveStatus'] === 'chance_left') {
        console.log(`未完成,需要自己手动去邀请好友给你助力,每邀请一位好友，可得${item['taskReward']}g狗粮`)
      } else if (item['receiveStatus'] === 'unreceive') {
        const InviteUser = await getFood('InviteUser');
        console.log(`领取助力后的狗粮结果::${JSON.stringify(InviteUser)}`);
      }
    }
    //每日三餐
    if (item['taskType'] === 'ThreeMeals') {
      console.log(`\n-----每日三餐----- 任务进度：${item['joinedCount'] || 0}/${item['taskChance']}`);
      if (item['receiveStatus'] === 'unreceive') {
        const ThreeMealsRes = await getFood('ThreeMeals');
        if (ThreeMealsRes.success) {
          if (ThreeMealsRes.errorCode === 'received') {
            console.log(`三餐结果领取成功`)
            message += `【三餐】领取成功，获得${ThreeMealsRes.data}g狗粮\n`;
          }
        }
      }
    }
    //逛会场
    if (item['taskType'] === 'ScanMarket') {
      console.log(`\n-----逛会场----- 任务进度：${item['joinedCount'] || 0}/${item['taskChance']}`);
      const scanMarketList = item.scanMarketList;
      for (let i = 0; i < 3; i ++) {
        console.log(`\n第${i + 1}次做 【逛会场】 任务\n`)
        for (let scanMarketItem of scanMarketList) {
          if (!scanMarketItem.status) {
            const body = {
              "marketLink": scanMarketItem.marketLink,
              "taskType": "ScanMarket",
              //"reqSource": "weapp"
            };
            const scanMarketRes = await scanMarket('scan', body);
            console.log(`逛会场-${scanMarketItem.marketName}结果::${JSON.stringify(scanMarketRes)}`)
          }
        }
      }
    }
    //关注店铺
    if (item['taskType'] === 'FollowShop') {
      console.log(`\n-----关注店铺----- 任务进度：${item['joinedCount'] || 0}/${item['taskChance']}`);
      const followShops = item.followShops;
      for (let shop of followShops) {
        if (!shop.status) {
          await iconClick('follow_shop', shop.shopId);
          await $.wait(1000);
          const followShopRes = await followShop(shop.shopId);
          console.log(`关注店铺${shop.name}结果::${followShopRes['errorCode']}`)
          await $.wait(3000);
        }
      }
    }
    //浏览频道/关注频道
    if (item['taskType'] === 'FollowChannel') {
      console.log(`\n-----浏览频道/关注频道 任务进度：${item['joinedCount'] || 0}/${item['taskChance']} -----`);
      const followChannelList = item.followChannelList;
      for (let i = 0; i < 3; i ++) {
        console.log(`\n第${i + 1}次做 【浏览频道/关注频道】 任务\n`)
        for (let followChannelItem of followChannelList) {
          if (!followChannelItem.status) {
            await iconClick('follow_channel', followChannelItem.channelId);
            await $.wait(1000);
            const body = {
              "channelId": followChannelItem.channelId,
              "taskType": "FollowChannel",
              "reqSource": "weapp"
            };
            const scanMarketRes = await scanMarket('scan', body);
            console.log(`浏览频道-${followChannelItem.channelName}结果::${scanMarketRes['errorCode']}`)
            await $.wait(5000);
          }
        }
      }
    }
    //关注商品
    if (item['taskType'] === 'FollowGood') {
      console.log(`\n-----关注商品----- 任务进度：${item['joinedCount'] || 0}/${item['taskChance']}`);
      const followGoodList = item.followGoodList;
      for (let followGoodItem of followGoodList) {
        if (!followGoodItem.status) {
          await iconClick('follow_good', followGoodItem.sku)
          await $.wait(1000);
          const body = `sku=${followGoodItem.sku}`;
          const scanMarketRes = await scanMarket('followGood', body, 'application/x-www-form-urlencoded');
          // const scanMarketRes = await appScanMarket('followGood', `sku=${followGoodItem.sku}&reqSource=h5`, 'application/x-www-form-urlencoded');
          console.log(`关注商品-${followGoodItem.skuName}结果::${scanMarketRes['errorCode']}`)
          await $.wait(3000);
        }
      }
    }
    //看激励视频
    if (item['taskType'] === 'ViewVideo') {
      console.log(`\n-----看激励视频----- 任务进度：${item['joinedCount'] || 0}/${item['taskChance']}`);
      if (item.taskChance === joinedCount) {
        console.log('今日激励视频已看完')
      } else {
        for (let i = 0; i < new Array(item.taskChance - joinedCount).fill('').length; i++) {
          console.log(`开始第${i+1}次看激励视频`);
          const body = {"taskType":"ViewVideo","reqSource":"weapp"}
          let sanVideoRes = await scanMarket('scan', body);
          console.log(`看视频激励结果--${sanVideoRes['errorCode']}`);
          await $.wait(15 * 1000);
        }
      }
    }
  }
}

function getDeskGoodDetails() {
  return new Promise(resolve => {
    // const url = `${JD_API_HOST}/getDeskGoodDetails`;
    const host = `jdjoy.jd.com`;
    const reqSource = 'h5';
    let opt = {
      url: `//jdjoy.jd.com/common/pet/getDeskGoodDetails?invokeKey=${invokeKey}`,
      method: "GET",
      data: {},
      credentials: "include",
      header: {"content-type": "application/json"}
    }
    const url = "https:"+ taroRequest(opt)['url'] + $.validate;
    $.get(taskUrl(url, host, reqSource), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function followScan(sku) {
  return new Promise(resolve => {
    // const url = `${JD_API_HOST}/scan`;
    const host = `jdjoy.jd.com`;
    const reqSource = 'h5';
    const body = {
      "taskType": "ScanDeskGood",
      "reqSource": "h5",
      sku
    }
    let opt = {
      url: `//jdjoy.jd.com/common/pet/scan?invokeKey=${invokeKey}`,
      method: "POST",
      data: body,
      credentials: "include",
      header: {"content-type": "application/json"}
    }
    const url = "https:"+ taroRequest(opt)['url'] + $.validate;
    $.post(taskPostUrl(url, JSON.stringify(body), reqSource, host, 'application/json'), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//小程序逛会场，浏览频道，关注商品API
function scanMarket(type, body, cType = 'application/json') {
  return new Promise(resolve => {
    // const url = `${weAppUrl}/${type}`;
    const host = `draw.jdfcloud.com`;
    const reqSource = 'weapp';
    let opt = {
      url: `//jdjoy.jd.com/common/pet/${type}?invokeKey=${invokeKey}`,
      method: "POST",
      data: body,
      credentials: "include",
      header: {"content-type": cType}
    }
    const url = "https:"+ taroRequest(opt)['url'] + $.validate;
    if (cType === 'application/json') {
      body = JSON.stringify(body)
    }
    const options = taskPostUrl(url, body, reqSource, host, cType)
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//app逛会场
function appScanMarket(type, body) {
  return new Promise(resolve => {
    // const url = `${JD_API_HOST}/${type}`;
    const host = `jdjoy.jd.com`;
    const reqSource = 'h5';
    let opt = {
      url: `//jdjoy.jd.com/common/pet/${type}?invokeKey=${invokeKey}`,
      method: "POST",
      data: body,
      credentials: "include",
      header: {"content-type": "application/json"}
    }
    const url = "https:"+ taroRequest(opt)['url'] + $.validate;
    $.post(taskPostUrl(url, JSON.stringify(body), reqSource, host, 'application/json'), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
        } else {
          // data = JSON.parse(data);
          console.log(`京东app逛会场结果::${data}`)
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function launchInvite(body = {}) {
  return new Promise(resolve => {
    const invitePin = '被折叠的记忆33';
    const url = `https://draw.jdfcloud.com//common/pet/enterRoom/h5?invitePin=${encodeURIComponent(invitePin)}&inviteSource=friend_list&shareSource=weapp&openId=oPcgJ49Ea26t4OFpK9P2WoPwCh3I&reqSource=weapp&invokeKey=${invokeKey}`;
    $.post(taskPostUrl(url, JSON.stringify(body), '', '', 'application/json'), async (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
        } else {
          data = $.toObj(data);
          if (data) {
            if (data.success && data['data']) {
              if (data['data']['petLevel'] === 1 && data['data']['invitedUserTag'] === 'create_ok') {
                console.log(`新用户${data['data']['pin']} 接收${invitePin}邀请成功,赠送你 ${data['data']['newUserGetFoodCount']}g狗粮\n`);
              }
            } else {
              console.log(`launchInvite 失败 ${$.toStr(data)}\n`)
            }
          } else {
            console.log(`launchInvite 异常 ${$.toStr(data)}\n`)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
async function getInviteFood() {
  const options = {
    url: `https://draw.jdfcloud.com//common/pet/getInviteFood?reqSource=weapp&invokeKey=${invokeKey}`,
    timeout: 10000,
    headers: {
      "Accept-Encoding": "gzip,compress,br,deflate",
      "Connection": "keep-alive",
      "Cookie": cookie,
      "Host": "draw.jdfcloud.com",
      "LKYLToken": "",
      "Referer": "https://servicewechat.com/wxccb5c536b0ecd1bf/733/page-frame.html",
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.7(0x18000731) NetType/4G Language/zh_CN",
      "content-type": "application/json"
    }
  }
  await $.http.get(options).then(async (resp) => {
    let { statusCode, body } = resp;
    if (statusCode === 200) {
      try {
        body = $.toObj(body);
        if (body) {
          if (body['success'] && body['errorCode'] === 'success') {
            if (body['data']) {
              if (typeof body['data'] === 'number' && !isNaN(body['data'])) {
                console.log(`获得狗粮 ${body['data']}g\n`);
                $.msg($.name, '', `京东账号 ${$.index} ${$.UserName}\n获得狗粮 ${body['data']}g`);
                if ($.isNode()) await notify.sendNotify($.name, `京东账号 ${$.index} ${$.UserName}\n获得狗粮 ${body['data']}g`);
              } else {
                console.log(`getInviteFood失败，${$.toStr(data)}`);
              }
            }
          }
        }
      } catch (e) {
        console.log(`异常:${e}`);
      }
    }
  }).catch((e) => console.log(`异常:${e}`));
}
//领取狗粮API
function getFood(type) {
  return new Promise(resolve => {
    // const url = `${weAppUrl}/getFood?reqSource=weapp&taskType=${type}`;
    const host = `draw.jdfcloud.com`;
    const reqSource = 'weapp';
    let opt = {
      url: `//draw.jdfcloud.com/common/pet/getFood?reqSource=weapp&taskType=${type}&invokeKey=${invokeKey}`,
      method: "GET",
      data: {},
      credentials: "include",
      header: {"content-type": "application/json"}
    }
    const url = "https:"+ taroRequest(opt)['url'] + $.validate;
    $.get(taskUrl(url.replace(/reqSource=h5/, 'reqSource=weapp'), host, reqSource), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//关注店铺api
function followShop(shopId) {
  return new Promise(resolve => {
    // const url = `${weAppUrl}/followShop`;
    const body = `shopId=${shopId}`;
    const reqSource = 'weapp';
    const host = 'draw.jdfcloud.com';
    let opt = {
      url: `//jdjoy.jd.com/common/pet/followShop?invokeKey=${invokeKey}`,
      method: "POST",
      data: body,
      credentials: "include",
      header: {"content-type":"application/x-www-form-urlencoded"}
    }
    const url = "https:"+ taroRequest(opt)['url'] + $.validate;
    const options = taskPostUrl(url, body, reqSource, host,'application/x-www-form-urlencoded');
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function enterRoom() {
  return new Promise(resolve => {
    // const url = `${weAppUrl}/enterRoom/h5?reqSource=weapp&invitePin=&openId=`;
    const host = `draw.jdfcloud.com`;
    const reqSource = 'weapp';
    let opt = {
      url: `//draw.jdfcloud.com/common/pet/enterRoom/h5?invitePin=&openId=&invokeKey=${invokeKey}`,
      method: "GET",
      data: {},
      credentials: "include",
      header: {"content-type": "application/json"}
    }
    const url = "https:"+ taroRequest(opt)['url'] + $.validate;
    $.post({...taskUrl(url.replace(/reqSource=h5/, 'reqSource=weapp'), host, reqSource),body:'{}'}, (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
        } else {
          // console.log('JSON.parse(data)', JSON.parse(data))

          $.roomData = JSON.parse(data);

          console.log(`现有狗粮: ${$.roomData.data.petFood}\n`)

          subTitle = `【用户名】${$.roomData.data.pin}`
          message = `现有积分: ${$.roomData.data.petCoin}\n现有狗粮: ${$.roomData.data.petFood}\n喂养次数: ${$.roomData.data.feedCount}\n宠物等级: ${$.roomData.data.petLevel}\n`
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
function appGetPetTaskConfig() {
  return new Promise(resolve => {
    const host = `jdjoy.jd.com`;
    const reqSource = 'h5';
    let opt = {
      url: `//jdjoy.jd.com/common/pet/getPetTaskConfig?invokeKey=${invokeKey}`,
      method: "GET",
      data: {},
      credentials: "include",
      header: {"content-type": "application/json"}
    }
    const url = "https:"+ taroRequest(opt)['url'] + $.validate;
    $.get(taskUrl(url, host, reqSource), async (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
        } else {
          data = $.toObj(data);
          if (data) {
            if (data['success']) {
              if (data['datas'] && data['datas'].length) {
                $.appGetPetTaskConfigRes = data;
                for (let item of $.appGetPetTaskConfigRes.datas) {
                  if (item['taskType'] === 'ScanMarket' && item['receiveStatus'] === 'chance_left') {
                    const scanMarketList = item.scanMarketList;
                    for (let scan of scanMarketList) {
                      if (!scan.status && scan.showDest === 'h5') {
                        console.log(`逛会场-做APP特有任务：${scan['marketName']}`);
                        const body = { marketLink: scan.marketLinkH5, taskType: 'ScanMarket', reqSource: 'h5' }
                        await appScanMarket('scan', body);
                        await $.wait(5000);
                      }
                    }
                  }
                }
              } else {
                console.log(`获取APP任务列表失败：${$.toStr(data)}\\n`);
              }
            } else {
              console.log(`获取APP任务列表异常：${$.toStr(data)}\n`);
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
//喂食
function feedPets(feedNum) {
  return new Promise(resolve => {
    console.log(`您设置的喂食数量:${FEED_NUM}g\n`);
    if (FEED_NUM === 0) { console.log(`跳出喂食`);resolve();return }
    console.log(`实际的喂食数量:${feedNum}g\n`);
    // const url = `${weAppUrl}/feed?feedCount=${feedNum}&reqSource=weapp`;
    const host = `draw.jdfcloud.com`;
    const reqSource = 'weapp';
    let opt = {
      url: `//draw.jdfcloud.com/common/pet/feed?feedCount=${feedNum}&invokeKey=${invokeKey}`,
      method: "GET",
      data: {},
      credentials: "include",
      header: {"content-type": "application/json"}
    }
    const url = "https:"+ taroRequest(opt)['url'] + $.validate;
    $.get(taskUrl(url.replace(/reqSource=h5/, 'reqSource=weapp'), host, reqSource), async (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
        } else {
          data = JSON.parse(data);
          if (data.success) {
            if (data.errorCode === 'feed_ok') {
              console.log('喂食成功')
              message += `【喂食成功】消耗${feedNum}g狗粮\n`;
            } else if (data.errorCode === 'time_error') {
              console.log('\n喂食失败：您的汪汪正在食用中,请稍后再喂食\n')
              message += `【喂食失败】您的汪汪正在食用中,请稍后再喂食\n`;
            } else if (data.errorCode === 'food_insufficient') {
              console.log(`当前喂食${feedNum}g狗粮不够, 现为您降低一档次喂食\n`)
              if ((feedNum) === 80) {
                feedNum = 40;
              } else if ((feedNum) === 40) {
                feedNum = 20;
              } else if ((feedNum) === 20) {
                feedNum = 10;
              } else if ((feedNum) === 10) {
                feedNum = 0;
              }
              // 如果喂食设置的数量失败, 就降低一个档次喂食.
              if ((feedNum) !== 0) {
                await feedPets(feedNum);
              } else {
                console.log('您的狗粮已不足10g')
                message += `【喂食失败】您的狗粮已不足10g\n`;
              }
            } else {
              console.log(`其他状态${data.errorCode}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
function getPetTaskConfig() {
  return new Promise(resolve => {
    // const url = `${weAppUrl}/getPetTaskConfig?reqSource=weapp`;
    // const host = `jdjoy.jd.com`;
    // const reqSource = 'h5';
    const host = `draw.jdfcloud.com`;
    const reqSource = 'weapp';
    let opt = {
      url: `//draw.jdfcloud.com//common/pet/getPetTaskConfig?invokeKey=${invokeKey}`,
      method: "GET",
      data: {},
      credentials: "include",
      header: {"content-type": "application/json"}
    }
    const url = "https:"+ taroRequest(opt)['url'] + $.validate;
    $.get(taskUrl(url.replace(/reqSource=h5/, 'reqSource=weapp'), host, reqSource), async (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
        } else {
          // console.log('JSON.parse(data)', JSON.parse(data))
          // $.getPetTaskConfigRes = JSON.parse(data);
          data = $.toObj(data);
          if (data) {
            if (data['success']) {
              if (data['datas'] && data['datas'].length) {
                $.getPetTaskConfigRes = data;
                await petTask();
              } else {
                console.log(`获取任务列表失败：${$.toStr(data)}\\n`);
              }
            } else {
              console.log(`获取任务列表异常：${$.toStr(data)}\n`);
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
//查询赛跑信息API
function getPetRace() {
  return new Promise(resolve => {
    // const url = `${JD_API_HOST}/combat/detail/v2?help=false`;
    const host = `jdjoy.jd.com`;
    const reqSource = 'h5';
    let opt = {
      url: `//jdjoy.jd.com/common/pet/combat/detail/v2?help=false&invokeKey=${invokeKey}`,
      method: "GET",
      data: {},
      credentials: "include",
      header: {"content-type": "application/json"}
    }
    const url = "https:"+ taroRequest(opt)['url'] + $.validate;
    $.get(taskUrl(url, host, reqSource), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
        } else {
          // console.log('查询赛跑信息API',(data))
          $.petRaceResult = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
//查询赛跑排行榜
function getRankList() {
  return new Promise(resolve => {
    // const url = `${JD_API_HOST}/combat/getRankList`;
    $.raceUsers = [];
    let opt = {
      url: `//jdjoy.jd.com/common/pet/combat/getRankList?invokeKey=${invokeKey}`,
      method: "GET",
      data: {},
      credentials: "include",
      header: {"content-type": "application/json"}
    }
    const url = "https:"+ taroRequest(opt)['url'] + $.validate;
    $.get(taskUrl(url, `jdjoy.jd.com`, 'h5'), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
        } else {
          // console.log('查询赛跑信息API',(data))
          data = JSON.parse(data);
          if (data.success) {
            $.raceUsers = data.datas;
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
//参加赛跑API
function runMatch(teamLevel, timeout = 5000) {
  if (teamLevel === 10 || teamLevel === 50) timeout = 60000;
  console.log(`正在参赛中，请稍等${timeout / 1000}秒，以防多个账号匹配到统一赛场\n`)
  return new Promise(async resolve => {
    await $.wait(timeout);
    // const url = `${JD_API_HOST}/combat/match?teamLevel=${teamLevel}`;
    const host = `jdjoy.jd.com`;
    const reqSource = 'h5';
    let opt = {
      url: `//jdjoy.jd.com/common/pet/combat/match?teamLevel=${teamLevel}&invokeKey=${invokeKey}`,
      method: "GET",
      data: {},
      credentials: "include",
      header: {"content-type": "application/json"}
    }
    const url = "https:"+ taroRequest(opt)['url'] + $.validate;
    $.get(taskUrl(url, host, reqSource), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
        } else {
          // console.log('参加赛跑API', JSON.parse(data))
          $.runMatchResult = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
//查询应援团信息API
function getBackupInfo() {
  return new Promise(resolve => {
    // const url = `${JD_API_HOST}/combat/getBackupInfo`;
    const host = `jdjoy.jd.com`;
    const reqSource = 'h5';
    let opt = {
      url: `//jdjoy.jd.com/common/pet/combat/getBackupInfo?invokeKey=${invokeKey}`,
      method: "GET",
      data: {},
      credentials: "include",
      header: {"content-type": "application/json"}
    }
    const url = "https:"+ taroRequest(opt)['url'] + $.validate;
    $.get(taskUrl(url, host, reqSource), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
        } else {
          // console.log('查询应援团信息API',(data))
          $.getBackupInfoResult = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
//查询赛跑获得多少积分
function getWinCoin() {
  return new Promise(resolve => {
    // const url = `${weAppUrl}/combat/detail/v2?help=false&reqSource=weapp`;
    let opt = {
      url: `//draw.jdfcloud.com/common/pet/combat/detail/v2?help=false&invokeKey=${invokeKey}`,
      method: "GET",
      data: {},
      credentials: "include",
      header: {"content-type": "application/json"}
    }
    const url = "https:"+ taroRequest(opt)['url'] + $.validate;
    $.get(taskUrl(url.replace(/reqSource=h5/, 'reqSource=weapp'), 'draw.jdfcloud.com', `weapp`), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
        } else {
          // console.log('查询应援团信息API',(data))
          if (data) {
            $.getWinCoinRes = JSON.parse(data);
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
//领取赛跑奖励API
function receiveJoyRunAward() {
  return new Promise(resolve => {
    // const url = `${JD_API_HOST}/combat/receive`;
    const host = `jdjoy.jd.com`;
    const reqSource = 'h5';
    let opt = {
      url: `//jdjoy.jd.com/common/pet/combat/receive?invokeKey=${invokeKey}`,
      method: "GET",
      data: {},
      credentials: "include",
      header: {"content-type": "application/json"}
    }
    const url = "https:"+ taroRequest(opt)['url'] + $.validate;
    $.get(taskUrl(url, host, reqSource), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
        } else {
          // console.log('查询应援团信息API',(data))
          $.receiveJoyRunAwardRes = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
//能力补给站
async function energySupplyStation(showOrder) {
  let status;
  await getSupplyInfo(showOrder);
  if ($.getSupplyInfoRes && $.getSupplyInfoRes.success) {
    if ($.getSupplyInfoRes.data) {
      const { marketList } = $.getSupplyInfoRes.data;
      for (let list of marketList) {
        if (!list['status']) {
          await scanMarket('combat/supply', { showOrder, 'supplyType': 'scan_market', 'taskInfo': list.marketLink || list['marketLinkH5'], 'reqSource': 'weapp' });
          await getSupplyInfo(showOrder);
        } else {
          $.log(`能力补给站 ${$.getSupplyInfoRes.data.addDistance}km里程 已领取\n`);
          status = list['status'];
        }
      }
      if (!status) {
        await energySupplyStation(showOrder);
      }
    }
  }
}
function getSupplyInfo(showOrder) {
  return new Promise(resolve => {
    // const url = `${weAppUrl}/combat/getSupplyInfo?showOrder=${showOrder}`;
    let opt = {
      url: `//draw.jdfcloud.com/common/pet/combat/getSupplyInfo?showOrder=${showOrder}&invokeKey=${invokeKey}`,
      method: "GET",
      data: {},
      credentials: "include",
      header: {"content-type": "application/json"}
    }
    const url = "https:"+ taroRequest(opt)['url'] + $.validate;
    $.get(taskUrl(url.replace(/reqSource=h5/, 'reqSource=weapp'), 'draw.jdfcloud.com', `weapp`), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
        } else {
          // console.log('查询应援团信息API',(data))
          if (data) {
            $.getSupplyInfoRes = JSON.parse(data);
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
function showMsg() {
  jdNotify = $.getdata('jdJoyNotify') ? $.getdata('jdJoyNotify') : jdNotify;
  if (!jdNotify || jdNotify === 'false') {
    $.msg($.name, subTitle, message);
  } else {
    $.log(`\n${message}\n`);
  }
}
//点击领取任务API
function iconClick(functionId, id) {
  return new Promise(resolve => {
    $.get({
      url: `https://jdjoy.jd.com/common/pet/icon/click?iconCode=${functionId}&linkAddr=${id}&reqSource=h5&invokeKey=${invokeKey}`,
      headers: {
        'Accept': '*/*',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'Origin': 'https://h5.m.jd.com',
        'Accept-Language': 'zh-cn',
        'Host': 'jdjoy.jd.com',
        'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        'Referer': 'https://h5.m.jd.com/babelDiy/Zeus/2wuqXrZrhygTQzYA7VufBEpj4amH/index.html',
        'cookie': cookie
      },
      timeout: 10000,
    }, (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
        } else {
          data = $.toObj(data);
          if (data) {
            if (data.success) {
              console.log('点击领取任务:成功!');
            } else {
              console.log(`点击领取任务:失败`, $.toStr(data))
            }
          } else {
            console.log(`点击领取任务:失败`, $.toStr(data))
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
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
        "Cookie": cookie,
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
function taskUrl(url, Host, reqSource) {
  return {
    url: url,
    headers: {
      'Cookie': cookie,
      // 'reqSource': reqSource,
      // 'Host': Host,
      'Connection': 'keep-alive',
      'Content-Type': 'application/json',
      'Referer': 'https://jdjoy.jd.com/pet/index',
      'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      'Accept-Language': 'zh-cn',
      'Accept-Encoding': 'gzip, deflate, br',
    },
    timeout: 10000
  }
}
function taskPostUrl(url, body, reqSource, Host = 'jdjoy.jd.com', ContentType = 'application/json') {
  return {
    url: url,
    body: body,
    headers: {
      'Cookie': cookie,
      'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      // 'reqSource': reqSource,
      'Content-Type': ContentType,
      // 'Host': Host,
      'Referer': 'https://jdjoy.jd.com/pet/index',
      'Accept-Language': 'zh-cn',
      'Accept-Encoding': 'gzip, deflate, br',
    },
    timeout: 10000
  }
}
function jsonParse(str) {
  if (typeof str == "string") {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.log(e);
      $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
      return [];
    }
  }
}
function taroRequest(e) {
  const a = $.isNode() ? require('crypto-js') : CryptoJS;
  const i = "98c14c997fde50cc18bdefecfd48ceb7"
  const o = a.enc.Utf8.parse(i)
  const r = a.enc.Utf8.parse("ea653f4f3c5eda12");
  let _o = {
    "AesEncrypt": function AesEncrypt(e) {
      var n = a.enc.Utf8.parse(e);
      return a.AES.encrypt(n, o, {
        "iv": r,
        "mode": a.mode.CBC,
        "padding": a.pad.Pkcs7
      }).ciphertext.toString()
    },
    "AesDecrypt": function AesDecrypt(e) {
      var n = a.enc.Hex.parse(e)
          , t = a.enc.Base64.stringify(n);
      return a.AES.decrypt(t, o, {
        "iv": r,
        "mode": a.mode.CBC,
        "padding": a.pad.Pkcs7
      }).toString(a.enc.Utf8).toString()
    },
    "Base64Encode": function Base64Encode(e) {
      var n = a.enc.Utf8.parse(e);
      return a.enc.Base64.stringify(n)
    },
    "Base64Decode": function Base64Decode(e) {
      return a.enc.Base64.parse(e).toString(a.enc.Utf8)
    },
    "Md5encode": function Md5encode(e) {
      return a.MD5(e).toString()
    },
    "keyCode": "98c14c997fde50cc18bdefecfd48ceb7"
  }

  const c = function sortByLetter(e, n) {
    if (e instanceof Array) {
      n = n || [];
      for (var t = 0; t < e.length; t++)
        n[t] = sortByLetter(e[t], n[t])
    } else
      !(e instanceof Array) && e instanceof Object ? (n = n || {},
          Object.keys(e).sort().map(function(t) {
            n[t] = sortByLetter(e[t], n[t])
          })) : n = e;
    return n
  }
  const s = function isInWhiteAPI(e) {
    for (var n =  ["gift", "pet"], t = !1, a = 0; a < n.length; a++) {
      var i = n[a];
      e.includes(i) && !t && (t = !0)
    }
    return t
  }

  const d = function addQueryToPath(e, n) {
    if (n && Object.keys(n).length > 0) {
      var t = Object.keys(n).map(function(e) {
        return e + "=" + n[e]
      }).join("&");
      return e.indexOf("?") >= 0 ? e + "&" + t : e + "?" + t
    }
    return e
  }
  const l = function apiConvert(e) {
    for (var n = r, t = 0; t < n.length; t++) {
      var a = n[t];
      e.includes(a) && !e.includes("common/" + a) && (e = e.replace(a, "common/" + a))
    }
    return e
  }

  var n = e
      , t = (n.header,
      n.url);
  t += (t.indexOf("?") > -1 ? "&" : "?") + "reqSource=h5";
  var _a = function getTimeSign(e) {
    var n = e.url
        , t = e.method
        , a = void 0 === t ? "GET" : t
        , i = e.data
        , r = e.header
        , m = void 0 === r ? {} : r
        , p = a.toLowerCase()
        , g = _o.keyCode
        , f = m["content-type"] || m["Content-Type"] || ""
        , h = ""
        , u = +new Date();
    return h = "get" !== p &&
    ("post" !== p || "application/x-www-form-urlencoded" !== f.toLowerCase() && i && Object.keys(i).length) ?
        _o.Md5encode(_o.Base64Encode(_o.AesEncrypt("" + JSON.stringify(c(i)))) + "_" + g + "_" + u) :
        _o.Md5encode("_" + g + "_" + u),
    s(n) && (n = d(n, {
      "lks": h,
      "lkt": u
    }),
        n = l(n)),
        Object.assign(e, {
          "url": n
        })
  }(e = Object.assign(e, {
    "url": t
  }));
  return _a
}
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
