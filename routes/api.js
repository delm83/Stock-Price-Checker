'use strict';

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res){
      let stock = req.query.stock
      let like = req.query.like
      let response = await fetch('https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/'+stock+'/quote')
      let data = await response.json()
      res.json({"stockData":{"stock":data.symbol, "price":data.latestPrice}})
    });
};
