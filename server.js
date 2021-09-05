var express = require('express');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
//const accounts = require('./mongoose/account');


var app = express();
app.use(bodyParser.json());


app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
});


const mongoose = require('mongoose');
var Schema = mongoose.Schema;


var connection_url = "";
//var url ="mongodb+srv://admin:admin@cluster0.7mgnx.mongodb.net/innovate-mongo?retryWrites=true&w=majority";

var server;
//var server = require('./app');
var port = 3400;
// Connect to the db 
var connection_url = "169.57.56.202:30659";
//
var url = "mongodb+srv://admin:admin@cluster0.7mgnx.mongodb.net/innovate?retryWrites=true&w=majority";
MongoClient.connect(url, function(err, mongoclient) {
  if(err) {
    console.log("Mongo DB connection failed");
    return console.dir(err);
  }
  console.log("Mongo DB connection successful");



});

app.post('/api/accounts/create', function (req, res) {
    let number = Math.floor(Math.random() * 900000);
    let balance = 0;

    var body = req.body;
    console.log(JSON.stringify(body));
   // res.send(body);

    var uuid = body['uuid'];
    var type = body['type'];
    var currency = body['currency'];
    //var balance = body['balance'];
   // var numb = body['number'];

    MongoClient.connect(url , function(err, mongoclient) {
    if(err) {
      console.log("Mongo DB connection failed");
      return console.dir(err);
    }

    if (req.body.type === 'current') {
        balance = 5000;
    }
    if (req.body.type === 'credit') {
        balance = 40000;
    }
  

  //console.log(JSON.stringify(newAccount));

  var database = mongoclient.db("innovate");
  var collection;

  database.createCollection('accounts', function(err1, collection) {

      var newAccount =[{
        uuid: req.body.uuid,
        type: req.body.type,
        currency: req.body.currency,
        balance: balance,
        number: number
       }
    ];

    collection = database.collection('accounts');

    collection.insert(newAccount, function(err2, result) {
      if (!err2) {
        console.log("Docs inserted in Collection 'accounts'.");
        //res.send("Docs inserted in Collection 'accountdetails");
        res.status(200).send({'message': 'Done!'});

      }else{
        res.status(500).send(err2);
      }


     
    });

  });
  });

});

/////////////
/*
{
  "number":210
  "amount":379
}
*/
app.post('/api/accounts/deposit', function (req, res) {

    var url = "mongodb+srv://admin:admin@cluster0.7mgnx.mongodb.net/innovate?retryWrites=true&w=majority";

  MongoClient.connect(url , function(err, mongoclient) {
  if(err) {
    console.log("Mongo DB connection failed");
    return console.dir(err);
  }

  const client = new MongoClient(url);

  async function run() {
    try {
      await client.connect();
      const database = client.db("innovate");
      const accounts = database.collection("accounts");
      // Query for a movie that has the title 'The Room'
      const query = { number:parseInt(req.body.number)};

      const option = {
        //sort matched documents in descending order by rating
        //sort: { rating: -1 },
        // Include only the `title` and `imdb` fields in the returned document
         projection: { _id: 0, uuid: 1, type: 1, balance: 1,currency:1 },
      };
      const account = await accounts.findOne(query, option);
      // since this method returns the matched document, not a cursor, print it directly

      if (account==null) {
        // console.log('account not found');
           console.log('target(deposit) account not found');

          res.status(500).send({'err': 'account not found'});
          return;
      }

      console.log(account.balance);
      //res.status(200).send(movie);

      let amount = Number(account.balance) + Number(req.body.amount);


      const update = { $set: { number: parseInt(req.body.number), balance: amount }};
      const update_options = {};
      const account_update =accounts.updateOne(query, update, update_options);


      if (account_update==null) {
          console.log('update was unsuccessul');
          res.status(500).send({'err': 'unable to update account'});
          return;
      }
      
      console.log("account has been credited");

      res.status(200).send("account has been credited");


    } finally {
      await client.close();
    }
  }
    run().catch(console.dir);


    });

});



app.post('/api/accounts/withdraw', function (req, res) {

    var url = "mongodb+srv://admin:admin@cluster0.7mgnx.mongodb.net/innovate?retryWrites=true&w=majority";

    let acc_number = parseInt(req.body.number);

    console.log("Body withdrawal "+(req.body.uuid));
   // console.log("Body withdrawal "+(req.body.balance));

    console.log("Body withdrawal "+(req.body.number));

    MongoClient.connect(url , function(err, mongoclient) {
    if(err) {
      console.log("Mongo DB connection failed");
      return console.dir(err);
    }

const client = new MongoClient(url);

async function run() {
  try {
    await client.connect();
    const database = client.db("innovate");
    const accounts = database.collection("accounts");
    // Query for a movie that has the title 'The Room'
    const query = { number:parseInt(req.body.number)};

    const option = {
      // sort matched documents in descending order by rating
      sort: { rating: -1 },
      // Include only the `title` and `imdb` fields in the returned document
      projection: { _id: 0, uuid: 1, type: 1, balance: 1,currency:1 },
    };


    if(parseInt(req.body.number)==217){
      console.log("Acc number is "+217);
    }

    //let acc_number = parseInt(req.body.number);



    const account = await accounts.findOne(query, option);
    // since this method returns the matched document, not a cursor, print it directly

    if (account==null) {
        //console.log('account not found');
        console.log('source(withdrawal) account not found');

        res.status(500).send({'err': 'account not found'});
        return;
    }

    console.log(account.number);
    console.log(account.uuid);

    console.log(account.balance);
    //res.status(200).send(movie);

    let amount = Number(account.balance) - Number(req.body.amount);

    console.log("updated Amount "+amount);
    const update = { $set: { number: parseInt(req.body.number), balance: amount }};
    const update_options = {};
    const account_update =accounts.updateOne(query, update, update_options);


    if (account_update==null) {
        console.log('update was unsuccessul');
        res.status(500).send({'err': 'unable to update account'});
        return;
    }
    
    console.log("account has been debited");

    res.status(200).send("account has been debited");


  } finally {
    await client.close();
  }
}
  run().catch(console.dir);


  });

});


app.post('/api/accounts/get', function (req, res) {

MongoClient.connect(url, function(err, mongoclient) {
    if(err) {
      console.log("Mongo DB connection failed");
      return console.dir(err);
    }

const client = new MongoClient(url);

var o = {} // empty Object
var key = 'Data';
o[key] = []; // empty Array, which you can push() values into


async function run() {
  try {
    await client.connect();
    const database = client.db("innovate");
    const accounts = database.collection("accounts");

    const query = {
        uuid: req.body.uuid
      };
    
    
     accounts.find({}).toArray(function(err, items) {
         
          res.status(200).send(items);
      });
    /*
    accounts.find(query).toArray(function(err, items) {
         
          res.status(200).send(items);
      });
    */
    
    //console.log("Account info");


    }finally {
        await client.close();
      }
    }
      run().catch(console.dir);


      });

});


/////////////////////


app.post('/api/accounts/getold', function (req, res) {
    var url = "mongodb+srv://admin:admin@cluster0.7mgnx.mongodb.net/innovate?retryWrites=true&w=majority";

    MongoClient.connect(url, function(err, mongoclient) {
    if(err) {
      console.log("Mongo DB connection failed");
      return console.dir(err);
    }

const client = new MongoClient(url);

async function run() {
  try {
    await client.connect();
    const database = client.db("innovate");
    const accounts = database.collection("accounts");
    // Query for a movie that has the title 'The Room'
    const query = { uuid:req.body.uuid};

    const options = {
      // sort matched documents in descending order by rating
      sort: { rating: -1 },
      // Include only the `title` and `imdb` fields in the returned document
      projection: { _id: 0,number: 1, type: 1, balance: 1,currency:1 },
    };
    const account = await accounts.findOne(query, options);
    // since this method returns the matched document, not a cursor, print it directly

    if (account==null) {
        console.log('account not found');
        res.status(500).send({'err': 'account not found'});
        return;
    }

    res.status(200).send("account has been found");
    console.log("account has been found");

    console.log(account);
    await client.close();
    //res.status(200).send(movie

    }finally {
       client.close();
      }
    }
      run().catch(console.dir);


      });


});


app.get('/api/accounts/drop', function (req, res) {

var url = "mongodb+srv://admin:admin@cluster0.7mgnx.mongodb.net/innovate?retryWrites=true&w=majority";

MongoClient.connect(url, {useNewUrlParser: true} ,{ useUnifiedTopology: true }, function(err, mongoclient) {
    if(err) {
      console.log("Mongo DB connection failed");
      return console.dir(err);
    }

const client = new MongoClient(url);

async function run() {
  try {
    await client.connect();
    const database = client.db("innovate");
    const accounts = database.collection("accounts");
    // Query for a movie that has the title 'The Room'

    accounts.drop();
    // since this method returns the matched document, not a cursor, print it directly
    
    console.log("Account collection has been droped");
    res.status(200).send({'message': 'Done!'});


    //res.status(200).send(movie

    }finally {
        await client.close();
      }
    }
      run().catch(console.dir);


      });

});




app.get('/', function (req, res) {
    res.end( "Rest API implementation for Microservice ACCOUNT MANAGEMENT" );
});

var port = 3400;

var server = app.listen(port, function () {
  console.log("Account Management service listening on " + port);
});
