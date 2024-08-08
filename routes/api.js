'use strict';

module.exports = function (app) {

  const mongoose = require('mongoose');
  const bcrypt = require('bcrypt')
  const saltRounds = 12;
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

  let Schema = mongoose.Schema;

  let stockSchema = new Schema({
     stockname: String,
     hashedIpList: [String],
     likes: Number
 });

 let Stock = mongoose.model("Stock", stockSchema)

  app.route('/api/stock-prices')
    .get(async function (req, res){
      try{
      let stockname = req.query.stock
      let like = req.query.like
      let ip = req.ip
      let hashedIp = bcrypt.hashSync(ip, saltRounds);
      return typeof stockname == 'string'? 
      res.json(await oneStockHandler(stockname, ip, hashedIp, like)):
      res.json(await twoStockHandler(stockname, ip, hashedIp, like))
    }catch(err){return res.json({error: err})}
     });

      async function newStockHandler(stockname, hashedIp, like){
        let newStock
        if(like==="true"){
          newStock = Stock({
          stockname: stockname,
          hashedIpList: [hashedIp],
          likes: 1
         });
         }
        else{
        newStock = Stock({
        stockname: stockname,
        hashedIpList: [],
        likes: 0
        });
        }
        await newStock.save();
        return newStock
      }

      async function updateStockHandler(inputStock, hashedIp){
        inputStock.hashedIpList.push(hashedIp);
        inputStock.likes++;
        await inputStock.save()
      }

      async function oneStockHandler(stockname, ip, hashedIp, like){
      let response = await fetch('https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/'+stockname+'/quote')
      let data = await response.json()
      if(data == 'Invalid symbol'){
        return {"error": "invalid symbol"}
      }
      let inputStock = await Stock.findOne({stockname: data.symbol})
      if(inputStock){
        // check if input ip matches saved hashedip
        if(like === "true" && !inputStock.hashedIpList.some((x)=>bcrypt.compareSync(ip, x)))
          {
            updateStockHandler(inputStock, hashedIp)
        }
      }
      else{inputStock = await newStockHandler(data.symbol, hashedIp, like)}
      return {"stockData":{"stock":data.symbol, "price":data.latestPrice, "likes":inputStock.likes}}
      }

      async function twoStockHandler(stockname, ip, hashedIp, like){
        let response = await fetch('https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/'+stockname[0]+'/quote')
        let stockOneData = await response.json()
        response = await fetch('https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/'+stockname[1]+'/quote')
        let stockTwoData = await response.json()
        if(stockOneData == 'Invalid symbol' || stockTwoData == 'Invalid symbol'){
          return {"error": "invalid symbol"}
        }
        let stockOne =await Stock.findOne({stockname: stockOneData.symbol})
        let stockTwo =await Stock.findOne({stockname: stockTwoData.symbol})
        
        if(stockOne){
          // check if input ip matches saved hashedip
          if(like === "true" && !stockOne.hashedIpList.some((x)=>bcrypt.compareSync(ip, x)))
            {
              updateStockHandler(stockOne, hashedIp)
          }
        }
        else{stockOne = await newStockHandler(stockOneData.symbol, hashedIp, like)}

        if(stockTwo){
          // check if input ip matches saved hashedip
          if(like === "true" && !stockTwo.hashedIpList.some((x)=>bcrypt.compareSync(ip, x)))
            {
              updateStockHandler(stockTwo, hashedIp)
          }
        }
        else{stockTwo = await newStockHandler(stockTwoData.symbol, hashedIp, like)}
        
        return {"stockData":[{"stock":stockOneData.symbol, "price":stockOneData.latestPrice, "rel_likes":stockOne.likes-stockTwo.likes}, 
        {"stock":stockTwoData.symbol, "price":stockTwoData.latestPrice, "rel_likes":stockTwo.likes-stockOne.likes}
       ]}
      }
};
