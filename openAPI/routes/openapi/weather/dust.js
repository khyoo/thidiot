var syncRrequest = require('sync-request');
var request = require('request');
var express = require('express');
var router = express.Router();

var xml2js = require('xml2js');
var parser = new xml2js.Parser();



var cron = require('node-cron');

const servicekey = "d6jaYPOmc0Pa1m83x3zueNB3pF6MOKZireJOZo7dkIqOS%2BD7JakOH1FZjdaUTulBgFjU3TQaaXjFqhgmUomXKA%3D%3D";

const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: '202.31.147.196',
  database: 'thidiot',
  password: 'mcalab3408',
  port: 5432,
});

const async = require("async");

client.connect();

// second minute hour day-of-month month day-of-week
// cron.schedule('20 * * * * *', function () {
//   openapi_collectAirPollution_RTMeasure();
// });

function validDouble(src) {
  if (src == "-" || src.length == 0) {
    src = 0.0;
  } else {
    src = parseFloat(src);
  }
  return src;
}

/* 시도별 실시간 측정 정보 조회*/
function openapi_collectAirPollution_RTMeasure() {
  var j = 0;
  var url = 'http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty';

  var queryParams = '?' + encodeURIComponent('ServiceKey') + '=' + servicekey; /* Service Key*/
  queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('1000'); /* 한 페이지 결과 수 */
  queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /* 페이지 번호 */
  queryParams += '&' + encodeURIComponent('sidoName') + '=' + encodeURIComponent('서울'); /* 	도시 이름 */
  queryParams += '&' + encodeURIComponent('ver') + '=' + encodeURIComponent('1.3'); /* 페이지 번호 */

  request({
    url: url + queryParams,
    method: 'GET'
  }, function (error, response, body) {
    //console.log('Status', response.statusCode);
    //console.log('Headers', JSON.stringify(response.headers));
    //console.log('Reponse received', body);

    parser.parseString(body, function (err, result) {
      // console.log(result.response.body[0].items[0]);

      for (var i = 0; i < result.response.body[0].items[0].item.length; i++) {

        var prefix_sql = "INSERT INTO openapi_airpollution(station_name, mang_name, so2_value, so2_grade, co_value, co_grade, o3_value, o3_grade, no2_value, no2_grade, pm10_value, pm10_value24, pm10_grade, pm10_grade1h, pm25_value, pm25_value24, pm25_grade, pm25_grade1h, khai_value, khai_grade, date_time)";
        var postfix_sql = " VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,TO_TIMESTAMP($21,'YYYY/MM/DD HH24:MI:SS'))";

        var station_name = result.response.body[0].items[0].item[i].stationName[0].replace("\"", "");
        var mang_name = result.response.body[0].items[0].item[i].mangName[0].replace("\"", "");
        var so2_value = validDouble(result.response.body[0].items[0].item[i].so2Value[0].replace("\"", ""));
        var so2_grade = validDouble(result.response.body[0].items[0].item[i].so2Grade[0].replace("\"", ""));
        var co_value = validDouble(result.response.body[0].items[0].item[i].coValue[0].replace("\"", ""));
        var co_grade = validDouble(result.response.body[0].items[0].item[i].coGrade[0].replace("\"", ""));
        var o3_value = validDouble(result.response.body[0].items[0].item[i].o3Value[0].replace("\"", ""));
        var o3_grade = validDouble(result.response.body[0].items[0].item[i].o3Grade[0].replace("\"", ""));
        var no2_value = validDouble(result.response.body[0].items[0].item[i].no2Value[0].replace("\"", ""));
        var no2_grade = validDouble(result.response.body[0].items[0].item[i].no2Grade[0].replace("\"", ""));
        var pm10_value = validDouble(result.response.body[0].items[0].item[i].pm10Value[0].replace("\"", ""));
        var pm10_value24 = validDouble(result.response.body[0].items[0].item[i].pm10Value24[0].replace("\"", ""));
        var pm10_grade = validDouble(result.response.body[0].items[0].item[i].pm10Grade[0].replace("\"", ""));
        var pm10_grade1h = validDouble(result.response.body[0].items[0].item[i].pm10Grade1h[0].replace("\"", ""));
        var pm25_value = validDouble(result.response.body[0].items[0].item[i].pm25Value[0].replace("\"", ""));
        var pm25_value24 = validDouble(result.response.body[0].items[0].item[i].pm25Value24[0].replace("\"", ""));
        var pm25_grade = validDouble(result.response.body[0].items[0].item[i].pm25Grade[0].replace("\"", ""));
        var pm25_grade1h = validDouble(result.response.body[0].items[0].item[i].pm25Grade1h[0].replace("\"", ""));
        var khai_value = validDouble(result.response.body[0].items[0].item[i].khaiValue[0].replace("\"", ""));
        var khai_grade = validDouble(result.response.body[0].items[0].item[i].khaiGrade[0].replace("\"", ""));
        var date_time = result.response.body[0].items[0].item[i].dataTime[0].replace("\"", "");

        var values = [station_name, mang_name, so2_value, so2_grade, co_value, co_grade, o3_value, o3_grade, no2_value, no2_grade, pm10_value, pm10_value24, pm10_grade, pm10_grade1h, pm25_value, pm25_value24, pm25_grade, pm25_grade1h, khai_value, khai_grade, date_time];

        client.query(prefix_sql + postfix_sql, values, (err, res) => {
          if (err) {
            console.log(err.stack)
          } else {
            console.log((j+1) + "번째 입력 성공!");
            j = j+1;
          }
        });
      }
    });
  });
}

/* 중심좌표 기준 반경 검색 데이터 조회 */
router.get('/get/data/dust', function (req, res, next) {
  var select_sql = "SELECT * FROM station_list";
  var where_sql = " WHERE ST_DWithin(ST_Transform(ST_SetSRID(geom, 4326), 2097), ST_Transform(ST_GeomFromText('POINT(" + req.query.coordx + " " + req.query.coordy + ")', 4326), 2097), $1);";
  var values = [req.query.radius];
  //    http://localhost:36000/openapi/weather/dust/get/data/dust?coordx=128.084167&coordy=35.193333&radius=1000

  client.query(select_sql + where_sql, values, (err, res2) => {
    if (err) {
      console.log(err.stack)
    } else {
      // console.log(res2.rows)

      var url = 'http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty';
      var json_result = { response: [{}] };
      for (var i = 0; i < res2.rows.length; i++) {
        // console.log(res2.rows[i].station_name);

        async.waterfall([
          function (callback) {
            var queryParams = '?' + encodeURIComponent('ServiceKey') + '=' + servicekey; /* Service Key*/
            queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('1'); /* 한 페이지 결과 수 */
            queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /* 페이지 번호 */
            queryParams += '&' + encodeURIComponent('dataTerm') + '=' + encodeURIComponent('DAILY'); /* 요청 데이터기간 (하루 : DAILY, 한달 : MONTH, 3달 : 3MONTH) */
            queryParams += '&' + encodeURIComponent('stationName') + '=' + encodeURIComponent(res2.rows[i].station_name); /* 	측정소 이름 */
            queryParams += '&' + encodeURIComponent('ver') + '=' + encodeURIComponent('1.3'); /* 페이지 번호 */

            callback(null, queryParams, res2.rows[i].station_name);
          },
          function (queryParams, station_name, callback) {
            var res_result = syncRrequest('GET', url + queryParams);

            parser.parseString(res_result.getBody('utf8'), function (err, result) {

              var data = { station: {}, payload: {} };
              data.station = station_name;
              data.payload = result.response.body[0].items[0].item[0];
              json_result.response[i] = data;
              // console.log(result);
              // console.log(result.response.body[0].items[0].item[0]); 
            });
          }
        ]);
      }
      res.json(json_result);
    }
  });
});



router.get('/get/dust', function (req, res, next) {

});


/* 측정소 정보 조회(위경도 좌표 기준)  */
router.get('/collect/station', function (req, res, next) {

  var url = 'http://openapi.airkorea.or.kr/openapi/services/rest/MsrstnInfoInqireSvc/getMsrstnList';
  var queryParams = '?' + encodeURIComponent('ServiceKey') + '=' + servicekey; /* Service Key*/
  queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('1000'); /* 한 페이지 결과 수 */
  queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /* 페이지 번호 */
  // queryParams += '&' + encodeURIComponent('addr') + '=' + encodeURIComponent('부산'); /* 시도 이름 (서울, 부산, 대구, 인천, 광주, 대전, 울산, 경기, 강원, 충북, 충남, 전북, 전남, 경북, 경남, 제주, 세종) */
  // queryParams += '&' + encodeURIComponent('searchCondition') + '=' + encodeURIComponent('DAILY'); /* 요청 데이터기간 (시간 : HOUR, 하루 : DAILY) */

  var result_list = [];

  request({
    url: url + queryParams,
    method: 'GET'
  }, function (error, response, body) {
    // console.log('Status', response.statusCode);
    // console.log('Headers', JSON.stringify(response.headers));    
    // console.log('Reponse received', body);
    
    parser.parseString(body, function (err, result) {

      var delete_sql = "DELETE FROM station_list;";

      client.query(delete_sql, [], (err, res) => {
        if (err) {
          console.log(err.stack)
        } else {
          // console.log(res)
        }
      });

      var items = result.response.body[0].items[0].item;

      var prefix_sql = "INSERT INTO station_list(id, station_name, addr, year, oper, photo, vrml, map, mang_name, item, dm_x, dm_y, geom)";
      var postfix_sql = " VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,ST_Point($11,$12))";
      var j = 0;

      for (var i = 0; i < items.length; i++) {
        if (parseFloat(items[i].dmX) > 0 && parseFloat(items[i].dmY) > 0) {

          j = j + 1;
          var values = [j, items[i].stationName[0].replace("\"", ""), items[i].addr[0].replace("\"", ""), items[i].year[0].replace("\"", ""), items[i].oper[0].replace("\"", ""), items[i].photo[0].replace("\"", ""), items[i].vrml[0].replace("\"", ""), items[i].map[0].replace("\"", ""), items[i].mangName[0].replace("\"", ""), items[i].item[0].replace("\"", ""), parseFloat(items[i].dmY), parseFloat(items[i].dmX)];

          result_list.push(values);
          client.query(prefix_sql + postfix_sql, values, (err, res) => {
            if (err) {
              console.log(err.stack)
            } else {
              // console.log(res)
            }
          });
        }
      }
    });
  });

  res.render('dust_station_insert', { title: '측정소 정보 입력', contents: result_list });
});

module.exports = router;
