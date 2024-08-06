'use strict';

module.exports = function (app) {

  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

  let Schema = mongoose.Schema;

  let stockSchema = new Schema({
     stockname: String,
     ipLikedList: [String],
     likes: Number
 });

 let Stock = mongoose.model("Stock", stockSchema)

  app.route('/api/stock-prices')
    .get(async function (req, res){
      try{
      let stockname = req.query.stock
      let like = req.query.like
      let ip = req.ip
      let response = await fetch('https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/'+stockname+'/quote')
      let data = await response.json()
      console.log(data.symbol)
      let inputStock = await Stock.findOne({stockname: data.symbol})
      console.log(inputStock)
      console.log(like)
      if(inputStock){
        console.log('exists')
      return res.json({"stockData":{"stock":data.symbol, "price":data.latestPrice, "likes":inputStock.likes}})
      }
      else{
      if(like === "true"){newLikeHandler(data.symbol, ip)}
      }
      res.json({"stockData":{"stock":data.symbol, "price":data.latestPrice, "likes":like === "true"?1:0}})
    }catch(err){return res.json({error: err})}
     });

      async function newLikeHandler(stockname, ip){
        let newStock = Stock({
          stockname: stockname,
          ipLikedList: [ip],
          likes: 1
      });
         await newStock.save();
      }
};
