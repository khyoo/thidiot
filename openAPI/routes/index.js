var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {

  var url_list = {};

  url_list.dust = "http://info.khyoo1221.com:36000/openapi/weather/dust/get/data/dust?coordx=128.084167&coordy=35.193333&radius=1000";
  url_list.rtweather = "http://info.khyoo1221.com:36000/openapi/weather/forecast/get/data/rtweather?lat=35.823431&lng=127.157041";  
  url_list.forecast = "http://info.khyoo1221.com:36000/openapi/weather/forecast/get/data/forecast?lat=35.823431&lng=127.157041";  

  res.render('index', { title: 'Thidiot Project', url_list: url_list });
});


module.exports = router;
