const express    = require('express');
const weixin     = require('weixin-api');
const netease    = require('./controller/netease.js');
const app        = express();

/**
 * config TOKEN
 */
weixin.token = 'hello';

/**
 * 处理文本消息
 */
weixin.textMsg((msg) => {

  /**
   * 错误处理
   * @param {String} err_msg
   */
  const handlerErr = (err_msg, msg) => {
    let resMsg = {
      fromUserName : msg.toUserName,
      toUserName : msg.fromUserName,
      msgType : 'text',
      content : err_msg,
      funcFlag : 0
    };

    weixin.sendMsg(resMsg);
  }

  /**
   * 发送 TOP 榜 （前4条）
   * @param {Array} songs
   */
  const sendLists = songs => {
    let resMsg = {};
    let articles = [];

    for(let i = 0; i < 4; i++) {
      articles[i] = {
        title: songs[i].name + ' - ' + songs[i].artists[0].name,
        description: songs[i].name,
        picUrl: songs[i].album.picUrl,
        url: 'http://music.163.com/m/song?id=' + songs[i].id
      };
    }

    // 返回图文消息
    resMsg = {
      fromUserName: msg.toUserName,
      toUserName: msg.fromUserName,
      msgType: 'news',
      articles: articles,
      funcFlag: 0
    };

    weixin.sendMsg(resMsg);
  }

  // 特殊搜索 < * + ?? > 
  if(msg.content[0] === '*') {
    switch (msg.content[1]) {
      case '0':  //  TOP: 新歌榜
        console.log(new Date() + '    '+ msg.fromUserName + '    云音乐新歌榜    文字检索\n');
        netease.topNew(sendLists);
        break;

      case '1':  // TOP: 热歌榜
        console.log(new Date() + '    '+ msg.fromUserName + '    云音乐热歌榜    文字检索\n');
        netease.topHot(sendLists);
        break;
      
      case '2':  // TOP: 飙升榜
        console.log(new Date() + '    '+ msg.fromUserName + '    云音乐飙升榜    文字检索\n');
        netease.topSoaring(sendLists);
        break;
      
      case '3':  // TOP: 电音榜
        console.log(new Date() + '    '+ msg.fromUserName + '    云音乐电音榜    文字检索\n');
        netease.topDenon(sendLists);
        break;

      case '4':  // TOP: Billboard 周榜
        console.log(new Date() + '    '+ msg.fromUserName + '    Billboard 周榜    文字检索\n');
        netease.topBbWeek(sendLists);
        break;

      case '5':  // 任性: 看点啥
        console.log(new Date() + '    '+ msg.fromUserName + '    看点啥    文字检索\n');
        netease.randomRecommend(results => {
          let resMsg = {};
          let articles = [];
          let i = Math.ceil(Math.random() * 6);
          
          articles[0] = {
            title: '随机推荐',
            description: '云音乐希望给您带来不一样的体验 😋.',
            picUrl: results[i].picUrl,
            url: results[i].url
          };

          // 返回图文消息
          resMsg = {
            fromUserName: msg.toUserName,
            toUserName: msg.fromUserName,
            msgType: 'news',
            articles: articles,
            funcFlag: 0
          };
          
          weixin.sendMsg(resMsg);
      　});
        break;
      
      case '6':  // 任性: 听点啥
        console.log(new Date() + '    '+ msg.fromUserName + '    听点啥    文字检索\n');
        netease.randomMusic(songs => {
          // 返回音乐
          resMsg = {
            fromUserName : msg.toUserName,
            toUserName : msg.fromUserName,
            msgType : "music",
            title : songs[0].name,
            description : songs[0].artists[0].name,
            musicUrl : songs[0].mp3Url,
            HQMusicUrl : '',
            funcFlag : 0
          };

          weixin.sendMsg(resMsg);
        });
        break;  
      
      default:  // Default: 新歌榜
        console.log(new Date() + '    '+ msg.fromUserName + '    云音乐新歌榜    文字检索（Default）\n');
        netease.topNew(sendLists);
    }
    return ;
  }

  // 普通搜索 
  let this_msg = msg.content.trim().split('/');
  let len = 1;

  if(this_msg.length === 1) {
    len = 1;
  } else{
    if(this_msg[1].trim() === '' || isNaN(parseInt(this_msg[1].trim()))) {
      len = 1;
    }
    len = parseInt(this_msg[1].trim());
    len = len > 4 ? 4: len;
  }

  netease.search(this_msg[0], 'song', songs => {
    let resMsg = {};
    let articles = [];

    if(!songs) return handlerErr('姿势不对？请重试。', msg);

    if(len === 1) {
      // 发送音乐
      resMsg = {
        fromUserName : msg.toUserName,
        toUserName : msg.fromUserName,
        msgType : "music",
        title : songs[0].name,
        description : songs[0].artists[0].name,
        musicUrl : songs[0].mp3Url,
        HQMusicUrl : '',
        funcFlag : 0
      };
    } else {
      // 发送图文
      for(let i = 0; i < len; i++) {
        articles[i] = {
          title: songs[i].name,
          description: songs[i].name,
          picUrl: songs[i].album.picUrl,
          url: 'http://music.163.com/m/song?id=' + songs[i].id
        };
      }

      resMsg = {
        fromUserName: msg.toUserName,
        toUserName: msg.fromUserName,
        msgType: 'news',
        articles: articles,
        funcFlag: 0
      };
    }

    weixin.sendMsg(resMsg);
    
  });
});


/**
 * 监听事件消息 (菜单)
 */
weixin.eventMsg((msg) => {

  /**
   * 错误处理
   * @param {String} err_msg
   */
  const handlerErr = (err_msg, msg) => {
    let resMsg = {
      fromUserName : msg.toUserName,
      toUserName : msg.fromUserName,
      msgType : 'text',
      content : err_msg,
      funcFlag : 0
    };

    weixin.sendMsg(resMsg);
  }

  /**
   * 发送 TOP 榜 （前4条）
   * @param {Array} songs
   */
  const sendLists = songs => {
    let resMsg = {};
    let articles = [];

    for(let i = 0; i < 4; i++) {
      articles[i] = {
        title: songs[i].name + ' - ' + songs[i].artists[0].name,
        description: songs[i].name,
        picUrl: songs[i].album.picUrl,
        url: 'http://music.163.com/m/song?id=' + songs[i].id
      };
    }

    // 返回图文消息
    resMsg = {
      fromUserName: msg.toUserName,
      toUserName: msg.fromUserName,
      msgType: 'news',
      articles: articles,
      funcFlag: 0
    };

    weixin.sendMsg(resMsg);
  }

  switch (msg.eventKey) {

    // 任性
    case 'random_recommend':
      console.log(new Date() + '    '+ msg.fromUserName + '    看点啥\n');
      netease.randomRecommend(results => {
        let resMsg = {};
        let articles = [];
        let i = Math.ceil(Math.random() * 6);
        
        articles[0] = {
          title: '随机推荐',
          description: '云音乐希望给您带来不一样的体验 😋.',
          picUrl: results[i].picUrl,
          url: results[i].url
        };

        // 返回图文消息
        resMsg = {
          fromUserName: msg.toUserName,
          toUserName: msg.fromUserName,
          msgType: 'news',
          articles: articles,
          funcFlag: 0
        };
        
        weixin.sendMsg(resMsg);
      });
      break;

    case 'random_music':
      console.log(new Date() + '    '+ msg.fromUserName + '    听点啥\n');
      netease.randomMusic(songs => {
        resMsg = {
          fromUserName : msg.toUserName,
          toUserName : msg.fromUserName,
          msgType : "music",
          title : songs[0].name,
          description : songs[0].artists[0].name,
          musicUrl : songs[0].mp3Url,
          HQMusicUrl : '',
          funcFlag : 0
        };

         weixin.sendMsg(resMsg);
      });
      break;
    
    // TOP 榜
    case 'new_top':
      console.log(new Date() + '    '+ msg.fromUserName + '    云音乐新歌榜\n');
      netease.topNew(sendLists);
      break;
    
    case 'hot_top':
      console.log(new Date() + '    '+ msg.fromUserName + '    云音乐热歌榜\n');
      netease.topHot(sendLists);
      break;

    case 'soaring_top':
      console.log(new Date() + '    '+ msg.fromUserName + '    云音乐飙升榜\n');
      netease.topSoaring(sendLists);
      break;

    case 'denon_top':
      console.log(new Date() + '    '+ msg.fromUserName + '    云音乐电音榜\n');
      netease.topDenon(sendLists);
      break;

    case 'Bb_week_top':
      console.log(new Date() + '    '+ msg.fromUserName + '    Billboard 周榜\n');
      netease.topBbWeek(sendLists);
      break;

    default:
      console.log(new Date() + '    '+ msg.fromUserName + '    下载 APP\n');
  }
});

/**
 * 监听图片消息
 */
weixin.imageMsg(function(msg) {
  console.log("imageMsg received");
  console.log(JSON.stringify(msg));

  let resMsg = {
    fromUserName : msg.toUserName,
    toUserName : msg.fromUserName,
    msgType : 'text',
    content : '( ⊙ o ⊙ )？好好说话，发图片是几个意思...',
    funcFlag : 0
  };

  weixin.sendMsg(resMsg);
});

/**
 * 监听位置消息
 */
weixin.locationMsg(function(msg) {
  console.log("locationMsg received");
  console.log(JSON.stringify(msg));

  let resMsg = {
    fromUserName : msg.toUserName,
    toUserName : msg.fromUserName,
    msgType : 'text',
    content : '原来你在这里啊 😃',
    funcFlag : 0
  };

  weixin.sendMsg(resMsg);
});

// check signature
app.get('/', (req, res) => {
  if (weixin.checkSignature(req)) {
    res.status(200).send(req.query.echostr);
  } else {
    res.status(200).send('fail');
  }
});

// handler WeChat msg
app.post('/', (req, res) => {
  weixin.loop(req, res);
});

// Start WeChat
app.listen(4000, () => {
  console.log('Server running at 4000 port.');
});