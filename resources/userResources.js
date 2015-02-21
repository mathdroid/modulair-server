var mongo = require('mongoskin');
var params = require("../node_modules/swagger-node-express/lib/paramTypes");
var errorHandling = require('../node_modules/swagger-node-express/lib/errorHandling').error;
var BSON = mongo.BSONPure;
var async = require('async');

exports.getAll = {
  'spec': {
    path : "/users/all",
    notes : "Returns all user",
    summary : "Returns all user",
    method: "GET",
    nickname : "getAllUser",
    produces : ["application/json"]
  },
  'action': function (req,res) {
    var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});
    db.collection('usercollection').find().toArray(function (err, items) {
        res.status(200).send(JSON.stringify(items, null, 3));
    });
  }
};

exports.getOneById = {
  'spec': {
    "path" : "/users/id/{user_id}",
    "notes" : "Returns one user",
    "summary" : "Returns one user by ID",
    "method": "GET",
    "parameters" : [
      params.path("user_id", "user ID of user", "string")
      ],
    "nickname" : "getOneByIdUser"
  },
  'action': function (req,res) {
    var user_id = req.params.user_id || req.query.user_id;
    var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});
    var userRes;
    async.series([
      function (callback) {
      // check if string is ObjectID
        if (/^[0-9a-f]{24}$/.test(user_id)) {
          callback(null);
        } else {
          callback(400);
        }
      },
      function (callback) {
        db.collection('usercollection').find({_id:BSON.ObjectID(user_id)}).toArray(function (err, items) {
          if (!err) {
            userRes = items;
            callback(null);
          } else {
            callback(400);
          }
        });
      },
      function (callback) {
        if (userRes.length <= 0) {
          callback(404);
        } else {
          if (userRes.length > 1) {
            callback(400);
          } else {
            callback(null);
          }
        }
      }
    ],
    // optional callback
    function (err, results) {
      if (err) {
        switch(err) {
          case 400:
            message = errorHandling(err, "Bad request.");
            res.status(err).send(JSON.stringify(message, null, 3));
            break;
          case 404:
            message = errorHandling(err, "Not found.");
            res.status(err).send(JSON.stringify(message, null, 3));
            break;
          default:        
            message = errorHandling(err, "Unknown error.");
            res.status(500).send(JSON.stringify(message, null, 3));
            break;
        }
      } else {
        res.status(200).send(JSON.stringify(userRes[0], null, 3));
      }
    });
  }
};

exports.addOne = {
  'spec': {
    "path" : "/users/add",
    "notes" : "Add one user",
    "summary" : "Add one user",
    "method": "POST",
    "parameters" : [
      params.query("username", "username of NEW user", "string", true),
      params.query("email", "email of NEW user", "string", true),
      params.query("fullname", "fullname of NEW user", "string", true),
      params.query("age", "age of NEW user", "int", true),
      params.query("location", "location of NEW user", "string", true),
      params.query("gender", "gender of NEW user", "string", true),
      ],
    "responseClass": "",
    "errorResponses": [],
    "nickname" : "addOneUser"
  },
  'action': function (req,res) {
    // var db = mongo.db("mongodb://localhost:27017/scratch-test", {
    //   native_parser: true
    // });http://swagger.io/
    // db.collection('usercollection').insert(req.body, function(err, result) {
    //   res.send(
    //     (err === null) ? {
    //       msg: ''
    //     } : {
    //       msg: err
    //     }
    //   );
    // });
    var newUsername = req.query.username || req.body.username || '';
    var newEmail = req.query.email || req.body.email || '';
    var newFullname = req.query.fullname || req.body.fullname || '';
    var newAge = req.query.age || req.body.age || undefined;
    var newLocation = req.query.location || req.body.location || '';
    var newGender = req.query.gender || req.body.gender || '';
    console.log('database: ' + req.db);
    if (newUsername && newEmail && newFullname && newAge && newLocation && newGender) {
      var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});
      var userToAdd = {
        "username": newUsername,
        "email": newEmail,
        "fullname": newFullname,
        "age": newAge,
        "location": newLocation,
        "gender": newGender
      }
      db.collection('usercollection').insert(userToAdd, function(err, result) {
        if (err === null) {
            res.status(200).send(JSON.stringify(userToAdd, null, 3));
          } else {
            message = errorHandling(500, "unknown error");
            res.status(500).send(JSON.stringify(message, null, 3));
          }
      });
    } else {
            message = errorHandling(400, "Bad request.");
            res.status(400).send(JSON.stringify(message, null, 3));
    }
  }
};

// exports.findById = {
//   'spec': {
//     "description" : "Operations about pets",
//     "path" : "/pet.{format}/{petId}",
//     "notes" : "Returns a pet based on ID",
//     "summary" : "Find pet by ID",
//     "method": "GET",
//     "parameters" : [
//       param.path("username", "NEW username", "string"),
//       param.path("email", "NEW email", "string"),
//       param.path("fullname", "NEW fullname", "string"),
//       param.path("age", "NEW age", "string"),
//       param.path("location", "NEW location", "string"),
//       param.path("gender", "NEW gender", "string"),

//       ],
//     "type" : "Pet",
//     "nickname" : "getPetById"
//   },
//   'action': function (req,res) {

//   //   { username: 'a',
//   // email: 's',
//   // fullname: 'd',
//   // age: '2',
//   // location: 'f',
//   // gender: 'g' }


//   }
// };