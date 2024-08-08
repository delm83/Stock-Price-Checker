const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
let numberOfLikes;

chai.use(chaiHttp);

suite('Functional Tests', function() {

    test('Test GET /view one stock',  function(done){
        chai.request(server)
        .keepOpen()
        .get('/api/stock-prices?stock=GOOG')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData');
          assert.property(res.body.stockData, 'stock');
          assert.property(res.body.stockData, 'price');
          assert.property(res.body.stockData, 'likes');
          assert.equal(res.body.stockData.stock, 'GOOG');
          assert.typeOf(res.body.stockData.price, 'number');
          assert.typeOf(res.body.stockData.likes, 'number');
       done()
        });
      });

      test('Test GET /view one stock and like it',  function(done){
        chai.request(server)
        .keepOpen()
        .get('/api/stock-prices?stock=MSFT&like=true')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData');
          assert.typeOf(res.body.stockData, 'object')
          assert.property(res.body.stockData, 'stock');
          assert.property(res.body.stockData, 'price');
          assert.property(res.body.stockData, 'likes');
          assert.equal(res.body.stockData.stock, 'MSFT');
          assert.typeOf(res.body.stockData.price, 'number');
          assert.typeOf(res.body.stockData.likes, 'number');
          numberOfLikes = res.body.stockData.likes;
       done()
        });
      });
      test('Test GET /view the same stock and like it again',  function(done){
        chai.request(server)
        .keepOpen()
        .get('/api/stock-prices?stock=MSFT&like=true')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData');
          assert.typeOf(res.body.stockData, 'object');
          assert.property(res.body.stockData, 'stock');
          assert.property(res.body.stockData, 'price');
          assert.property(res.body.stockData, 'likes');
          assert.equal(res.body.stockData.stock, 'MSFT');
          assert.typeOf(res.body.stockData.price, 'number');
          assert.typeOf(res.body.stockData.likes, 'number');
          assert.equal(res.body.stockData.likes, numberOfLikes);
       done()
        });
      });

      test('Test GET /view two stocks',  function(done){
        chai.request(server)
        .keepOpen()
        .get('/api/stock-prices?stock=AMZN&stock=AAPL')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData');
          assert.typeOf(res.body.stockData, 'array')
          assert.property(res.body.stockData[0], 'stock');
          assert.property(res.body.stockData[0], 'price');
          assert.property(res.body.stockData[0], 'rel_likes');
          assert.property(res.body.stockData[1], 'stock');
          assert.property(res.body.stockData[1], 'price');
          assert.property(res.body.stockData[1], 'rel_likes');
          assert.equal(res.body.stockData[0].stock, 'AMZN');
          assert.typeOf(res.body.stockData[0].price, 'number');
          assert.typeOf(res.body.stockData[0].rel_likes, 'number');
          assert.equal(res.body.stockData[1].stock, 'AAPL');
          assert.typeOf(res.body.stockData[1].price, 'number');
          assert.typeOf(res.body.stockData[1].rel_likes, 'number');
          numberOfLikes = res.body.stockData[0].rel_likes;
       done()
        });
      });

      test('Test GET /view two stocks and like them',  function(done){
        chai.request(server)
        .keepOpen()
        .get('/api/stock-prices?stock=AMZN&stock=AAPL&like=true')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData');
          assert.typeOf(res.body.stockData, 'array')
          assert.property(res.body.stockData[0], 'stock');
          assert.property(res.body.stockData[0], 'price');
          assert.property(res.body.stockData[0], 'rel_likes');
          assert.property(res.body.stockData[1], 'stock');
          assert.property(res.body.stockData[1], 'price');
          assert.property(res.body.stockData[1], 'rel_likes');
          assert.equal(res.body.stockData[0].stock, 'AMZN');
          assert.typeOf(res.body.stockData[0].price, 'number');
          assert.typeOf(res.body.stockData[0].rel_likes, 'number');
          assert.equal(res.body.stockData[1].stock, 'AAPL');
          assert.typeOf(res.body.stockData[1].price, 'number');
          assert.typeOf(res.body.stockData[1].rel_likes, 'number');
          assert.equal(res.body.stockData[0].rel_likes, numberOfLikes);
       done()
        });
      });
});

