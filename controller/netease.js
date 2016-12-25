// 相关参数设计参考 https://github.com/darknessomi/musicbox/wiki/网易云音乐API分析
const http = require('http');
const querystring = require('querystring');

/**
 * 搜索
 * @param {Object} search
 * @param {String} keywords
 * @param {String} type
 * @param {Function} cb
 */
function toSearch(keywords, type, cb) {
  const all_type = {
    song: 1,
    album: 10,
    artist: 100,
    playlist: 1000,
    userprofile: 1002
  };
  
  const postData = querystring.stringify({
    's': keywords,  // 搜索关键词
    'limit': 4,  // 返回结果的数量
    'type': all_type[type] || all_type.song,  // 搜索类型 [1 单曲, 10 专辑, 100 歌手, 1000 歌单 ,1002 用户 ]
    'offset': 0  // 偏移数量 用于分页
  });

  const options = {
    host: 'music.163.com',
    port: '80',
    method: 'POST',
    path: '/api/search/get',
    headers: {
      'User-Agent': 'hello/world',
      'Referer': 'http://music.163.com',
      'Cookie': 'appver=2.0.2',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  const req = http.request(options, res => {
    let resData = '';
    
    // 解码
    res.setEncoding('utf8');

    // 接收数据 & 拼接
    res.on('data', (chunk) => {
      resData += chunk;
    });

    // 请求结束
    res.on('end', () => {
      cb(JSON.parse(resData).result);
    });
  });

  req.setTimeout(2000, () => {
    console.log('请求超时');
    req.abort();
    cb();
  });

  req.on('error', (e) => {
    console.log(`problem with request: ${e.message}`);
  });
  req.write(postData);
  req.end();
}


/**
 * 根据 id 获取对应歌曲详细信息
 * @param {Array} 歌曲 id
 * @param {Function} 回调
 */
function getSongs(song_ids, cb) {
  const url = 'http://music.163.com/api/song/detail?ids=[' + song_ids.join(',') + ']';

  const req = http.get(url, (res) => {
    let resData = '';
    
    // 解码
    res.setEncoding('utf8');

    // 接收数据 & 拼接
    res.on('data', (chunk) => {
      resData += chunk;
    });

    // 请求结束
    res.on('end', () => {
      cb(JSON.parse(resData).songs);
    });
  });

  req.setTimeout(2000, () => {
    console.log('请求超时');
    req.abort();
    cb();
  });

  req.on('error', (e) => {
    console.log(`problem with request: ${e.message}`);
  });
  req.end();
}

/**
 * 获取 TOP 榜
 * @param {Number} 类型序号
 * @param {Function} 回调
 */
function getTopList(num, cb) {
  const top_lists = [
    ['云音乐新歌榜', '3779629'],
    ['云音乐热歌榜', '3778678'],
    ['云音乐飙升榜', '19723756'],
    ['云音乐电音榜', '10520166'],
    ['美国Billboard周榜', '60198']
  ];
  const url = 'http://music.163.com/discover/toplist?&id=' + top_lists[num][1];

  http.get(url, res => {
    let resData = '';
    res.setEncoding('utf8');
    res.on('data', chunk => resData += chunk);
    res.on('end', () => {
      const start_pos = resData.indexOf('<textarea style="display:none;">[{') + '<textarea style="display:none;">[{'.length;
      const stop_pos = resData.indexOf('}]</textarea>');
      const topData = '[{' + resData.substring(start_pos, stop_pos) + '}]';

      cb(JSON.parse(topData));
    });
  });
}

/**
 * 获取发现
 * @param {Function} 回调
 */
function getDiscover(cb) {
  const url = 'http://music.163.com/discover/';

  function find(str, cha, num){
    let x = str.indexOf(cha);

    for(let i = 0; i < num; i++){
      x = str.indexOf(cha, x + 1);
    }

    return x;
  }

  http.get(url, res => {
    let resData = '';
    res.setEncoding('utf8');
    res.on('data', chunk => resData += chunk);
    res.on('end', () => {
      const start_pos = resData.indexOf('window.Gbanners =') + 'window.Gbanners ='.length;
      const stop_pos = find(resData, '</script>', 3) - 2;  //resData.indexOf('</script>');
      let discoverData = resData.substring(start_pos, stop_pos);

      discoverData = discoverData.replace(/picUrl/g, '"picUrl"');
      discoverData = discoverData.replace(/url/g, '"url"');
      discoverData = discoverData.replace(/targetId/g, '"targetId"');
      discoverData = discoverData.replace(/backgroundUrl/g, '"backgroundUrl"');
      discoverData = discoverData.replace(/targetType/g, '"targetType"');

      cb(JSON.parse(discoverData));
    });
  });
}

/**
 * 搜索
 * @param {String} keywords
 * @param {String} type
 */
exports.search = (keywords, type, cb) => {
  toSearch(keywords, type, result => {
    let this_type = result[type + 's'] ? type : 'song';
    let result_ids = [];
    let result_type = this_type + 's';

    if(!result[result_type]) {
      return cb();
    } else {
      for(let i = 0, len = result[result_type].length; i < len; i++) {
        if(type === 'userprofile') {
          result_ids.push(result[result_type][i].userId);
        } else {
          result_ids.push(result[result_type][i].id);
        }
      }
    }

    switch (this_type) {
      case 'song':
        getSongs(result_ids, cb);
        break;
      default:
        return ;
    }
  })
};

//////////////////////////////////////////////
///////////////// 任性 ///////////////////////
//////////////////////////////////////////////
/**
 * 看点啥
 */
exports.randomRecommend = (cb) => {
  getDiscover(cb);
};

/**
 *听点啥
 */
exports.randomMusic = (cb) => {
  let num = Math.ceil(Math.random() * 4);

  getTopList(num, songs => {
    let i = Math.ceil(Math.random() * songs.length);

    getSongs([songs[i].id], cb);
  });
};


//////////////////////////////////////////////
////////////// TOP 榜 ////////////////////////
//////////////////////////////////////////////
/**
 * 新歌榜
 */
exports.topNew = cb => {
  getTopList(0, cb);
};

/**
 * 热歌榜
 */
exports.topHot = cb => {
  getTopList(1, cb);
};

/**
 * 飙升榜
 */
exports.topSoaring = cb => {
  getTopList(2, cb);
};

/**
 * 电音榜
 */
exports.topDenon = cb => {
  getTopList(3, cb);
};

/**
 * Billboard 周榜
 */
exports.topBbWeek = cb => {
  getTopList(4, cb);
};