var request = require('request');
var express = require('express');
var router = express.Router();

const servicekey = conf_json.serviceKey;

/*  */
router.post('/get/data/test', function (req, res, next) {
  console.log(req.body);
  // http://localhost:36000/openapi/weather/forecast/get/data/test?lat=35.823431&lng=127.157041

  

  // var result= {"lat":req.body.lat,"lng":req.body.lng};
  res.redirect("http://member.shift.co.kr/xg-manual/data/data.xml");

});


/* 기상청 실시간 날씨 조회 */
router.get('/get/data/rtweather', function (req, res, next) {
  var rs = dfs_xy_conv("toXY", req.query.lat, req.query.lng);
  // http://localhost:36000/openapi/weather/forecast/get/data/forecast?lat=35.823431&lng=127.157041

  var today = new Date();
  var year = today.getFullYear();
  var month = today.getMonth()+1;
  var day = today.getDate();

  var base_date = year + (("00"+month.toString()).slice(-2)) + (("00"+day.toString()).slice(-2));

  var base_time = "";

  if (today.getMinutes() < 30) {
    base_time = (("00"+(today.getHours()-1).toString()).slice(-2))+"00";
  } else {
    base_time = (("00"+(today.getHours()).toString()).slice(-2))+"00";
  }

  var url = 'http://apis.data.go.kr/1360000/VilageFcstInfoService/getUltraSrtNcst';
  var queryParams = '?' + encodeURIComponent('ServiceKey') + '=' + servicekey; /* Service Key*/  
  queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /* 페이지번호 */
  queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('100'); /* 한 페이지 결과 수 */
  queryParams += '&' + encodeURIComponent('dataType') + '=' + encodeURIComponent('JSON'); /* 요청자료형식(XML/JSON)Default: XML */
  queryParams += '&' + encodeURIComponent('base_date') + '=' + encodeURIComponent(base_date); /*  */
  queryParams += '&' + encodeURIComponent('base_time') + '=' + encodeURIComponent(base_time); /*  */
  queryParams += '&' + encodeURIComponent('nx') + '=' + encodeURIComponent(rs.x); /*  */
  queryParams += '&' + encodeURIComponent('ny') + '=' + encodeURIComponent(rs.y); /*  */

  request({
    url: url + queryParams,
    method: 'GET'
  }, function (error, response, body) {
    //console.log('Status', response.statusCode);
    //console.log('Headers', JSON.stringify(response.headers));
    // console.log('Reponse received', body);

    res.json(JSON.parse(body)); 
  });
});

/* 기상청 동네예보 조회 */
router.get('/get/data/forecast', function (req, res, next) {
  var rs = dfs_xy_conv("toXY", req.query.lat, req.query.lng);
  // http://localhost:36000/openapi/weather/forecast/get/data/forecast?lat=35.823431&lng=127.157041

  var today = new Date();
  var year = today.getFullYear();
  var month = today.getMonth()+1;
  var day = today.getDate();

  var base_date = year + (("00"+month.toString()).slice(-2)) + (("00"+day.toString()).slice(-2));

  var base_time = "0500";

  var url = 'http://apis.data.go.kr/1360000/VilageFcstInfoService/getVilageFcst';
  var queryParams = '?' + encodeURIComponent('ServiceKey') + '=' + servicekey; /* Service Key*/  
  queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /* 페이지번호 */
  queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('100'); /* 한 페이지 결과 수 */
  queryParams += '&' + encodeURIComponent('dataType') + '=' + encodeURIComponent('JSON'); /* 요청자료형식(XML/JSON)Default: XML */
  queryParams += '&' + encodeURIComponent('base_date') + '=' + encodeURIComponent(base_date); /*  */
  queryParams += '&' + encodeURIComponent('base_time') + '=' + encodeURIComponent(base_time); /*  */
  queryParams += '&' + encodeURIComponent('nx') + '=' + encodeURIComponent(rs.x); /*  */
  queryParams += '&' + encodeURIComponent('ny') + '=' + encodeURIComponent(rs.y); /*  */

  request({
    url: url + queryParams,
    method: 'GET'
  }, function (error, response, body) {
    //console.log('Status', response.statusCode);
    //console.log('Headers', JSON.stringify(response.headers));
    // console.log('Reponse received', body);

    res.json(JSON.parse(body)); 
  });
});

// LCC DFS 좌표변환을 위한 기초 자료
var RE = 6371.00877; // 지구 반경(km)
var GRID = 5.0; // 격자 간격(km)
var SLAT1 = 30.0; // 투영 위도1(degree)
var SLAT2 = 60.0; // 투영 위도2(degree)
var OLON = 126.0; // 기준점 경도(degree)
var OLAT = 38.0; // 기준점 위도(degree)
var XO = 43; // 기준점 X좌표(GRID)
var YO = 136; // 기1준점 Y좌표(GRID)

// LCC DFS 좌표변환 ( code : "toXY"(위경도->좌표, v1:위도, v2:경도), "toLL"(좌표->위경도,v1:x, v2:y) )
function dfs_xy_conv(code, v1, v2) {
  var DEGRAD = Math.PI / 180.0;
  var RADDEG = 180.0 / Math.PI;

  var re = RE / GRID;
  var slat1 = SLAT1 * DEGRAD;
  var slat2 = SLAT2 * DEGRAD;
  var olon = OLON * DEGRAD;
  var olat = OLAT * DEGRAD;

  var sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  var sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
  var ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = re * sf / Math.pow(ro, sn);
  var rs = {};
  if (code == "toXY") {
    rs['lat'] = v1;
    rs['lng'] = v2;
    var ra = Math.tan(Math.PI * 0.25 + (v1) * DEGRAD * 0.5);
    ra = re * sf / Math.pow(ra, sn);
    var theta = v2 * DEGRAD - olon;
    if (theta > Math.PI) theta -= 2.0 * Math.PI;
    if (theta < -Math.PI) theta += 2.0 * Math.PI;
    theta *= sn;
    rs['x'] = Math.floor(ra * Math.sin(theta) + XO + 0.5);
    rs['y'] = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
  }
  else {
    rs['x'] = v1;
    rs['y'] = v2;
    var xn = v1 - XO;
    var yn = ro - v2 + YO;
    ra = Math.sqrt(xn * xn + yn * yn);
    if (sn < 0.0) - ra;
    var alat = Math.pow((re * sf / ra), (1.0 / sn));
    alat = 2.0 * Math.atan(alat) - Math.PI * 0.5;

    if (Math.abs(xn) <= 0.0) {
      theta = 0.0;
    }
    else {
      if (Math.abs(yn) <= 0.0) {
        theta = Math.PI * 0.5;
        if (xn < 0.0) - theta;
      }
      else theta = Math.atan2(xn, yn);
    }
    var alon = theta / sn + olon;
    rs['lat'] = alat * RADDEG;
    rs['lng'] = alon * RADDEG;
  }
  return rs;
}

module.exports = router;
