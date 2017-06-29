"use strict";

/*
* Author : nguyenpham93
* This file is to create and add data to Elasticsearch
*/

var elas = require("./elastic/index");
var moment = require("moment");
var shortid = require("shortid");
var data = require("./data2.json");
var async = require("async");
var coll = require("./models/collection");
var bcrypt = require('bcrypt-nodejs');

// Search ALl for test
function searchAll() {
    elas.searchAll("icolor", "users").then(function (data) {
        console.log(data);
        //console.log(data.length);
    });
}
//searchAll();


//Create Index
function createIndex() {
    elas.createIndex("icolor", function (err, stt) {
        if (err) {
            console.log(err);
        } else {
            console.log(stt);
        }
    });
}
//createIndex();

//Delete Index
function deleteIndex() {
    elas.deleteIndex("icolor", function (err, stt) {
        if (err) console.log(err);else console.log(stt);
    });
}
//deleteIndex();

// Merge Data into ElasticSearch
function initData() {
    var colors = [];
    var temp = [];
    for (var count in data) {
        delete data[count].key;
        delete data[count].key1;
        data[count].id = shortid.generate();
        data[count].name = data[count]['string'];
        delete data[count]["string"];
        data[count].color1 = data[count]['array'][0];
        data[count].color2 = data[count]['array'][1];
        data[count].color3 = data[count]['array'][2];
        data[count].color4 = data[count]['array'][3];
        data[count].color5 = data[count]['array'][4];
        delete data[count]["array"];
        data[count].date = moment().format("DD-MM-YYYY HH:mm:ss");
        data[count].description = "Color collection";
        data[count]['id_user'] = "SJxr4BIzb";
        delete data[count].author;
        delete data[count].author_email;
        data[count].like = 0;
        data[count].dislike = 0;

        data[count].share = 0;
        colors.push(data[count]);
    }
    temp = colors.slice(20, 39);
    async.mapSeries(colors, merge, function (err, rs) {
        console.log(rs);
    });
}

//initData();

function merge(item, cb) {
    coll.addCollection(item).then(function (data) {
        cb(null, data);
    }, function (error) {
        console.log(error);
        cb(null, error);
    });
}

// Add author
var author = {
    "id": 'rJBkgtYyb',
    "email": "bluevn@gmail.com",
    "password": "rootvn",
    'facebook_id': "",
    "facebook_access_token": "",
    'google_id': "",
    "google_access_token": "",
    "date": moment().format("DD-MM-YYYY HH:mm:ss")
};

function addAuthor(author) {
    bcrypt.hash(author['password'], null, null, function (err, hash) {
        author['password'] = hash;
        elas.insertDocument("icolor", "users", author).then(function (data) {
            console.log(data);
        });
    });
}

//addAuthor(author);

var collection = {
    id: shortid.generate(),
    name: "The Shepherd's Boy",
    color1: '#FE4365',
    color2: '#036564',
    color3: '#B38184',
    color4: '#F77825',
    color5: '#E6AC27',
    date: moment().format("DD-MM-YYYY HH:mm:ss"),
    description: 'Pro color',
    id_user: 'rJBkgtYyb',
    like: 0,
    dislike: 0,
    share: 0
};

function addCollection2(collection) {
    coll.addCollection(collection).then(function (data) {
        console.log(data);
    }, function (error) {
        console.log(error);
    });
}
// addCollection2(collection);

var doc1 = [{ id: 'Hy2Diy4-W' }];

function deleteDocument(doc2) {
    elas.deleteDocument("icolor", "collection", doc2).then(function (data) {
        console.log(data);
    }, function (err) {
        console.log(err);
    });
}
doc1.forEach(function (i) {
    //deleteDocument(i);
});

// Add Like & Dislike
var like = {
    "id": shortid.generate(),
    "id_collection": "r1-bxZIEe-",
    "id_user": "rJBkgtYyb",
    "status": 0,
    "date": moment().format("DD-MM-YYYY HH:mm:ss")
};
function addLike() {
    elas.insertDocument("icolor", "like_dislike", like).then(function (data) {
        console.log(data);
    });
}
//addLike();


//update
var like1 = [{ id: 'SkQW2aJWb',
    name: 'Dat',
    color1: '#ffffff',
    color2: '#ffff00',
    color3: '#ff0000',
    color4: '#000000',
    color5: '#ff00ff',
    date: '22-05-2017 09:24:58',
    description: '',
    id_user: 'r1o1n61WZ',
    like: 0,
    dislike: 0,
    share: 0,
    userlogin: 0,
    author: 'thanhdat21293@gmail.com',
    currentAction: '' }];

function update(val) {
    elas.updateDocument('icolor', 'collection', val);
}

like1.forEach(function (i) {
    //update (i)
});

//update();


// elas.search("icolor","color_related", "#D95B43")
//  .then (data => {
//      console.log(data);
//  });

// rJDog98lb
var allPallet = [{
    id: 'B1GkgJ3xb',
    name: 'TD123',
    color1: '#234567',
    color2: '#234568',
    color3: '#234569',
    color4: '#234560',
    color5: '#234561',
    date: '19-05-2017',
    description: '',
    id_user: 'rJDog98lb',
    share: 0
}, {
    id: 'B1GkgJ3xb1',
    name: 'TD',
    color1: '#234567',
    color2: '#234568',
    color3: '#234569',
    color4: '#234560',
    color5: '#234561',
    date: '19-05-2017',
    description: '',
    id_user: 'rJDog98lb',
    share: 0
}];

var userPallet = {
    id: 'rJW-xyngZ',
    name: ' td123 ',
    color1: '#234567',
    color2: '#234568',
    color3: '#234569',
    color4: '#234560',
    color5: '#234561',
    date: '19-05-2017',
    description: '',
    id_user: 'rJDog98lb',
    share: 0
};

var isSamePallet = function isSamePallet(allPallet, userPallet) {
    var n = allPallet.length;
    var check = 0;
    for (var i = 0; i < n; i++) {
        var name_old = allPallet[i].name.trim().toLowerCase();
        var name_new = userPallet.name.trim().toLowerCase();

        if (name_old === name_new) {
            check = 1;
        }
    }
    if (check === 1) {
        return true;
    } else {
        return false;
    }
};

// function matrixElementsSum(matrix) {
//     for(var i = 0; i < matrix.length; i++){
//         for(var j = 0; j < i.length; i++){
//
//         }
//     }
// }
//
// //console.log(matrixElementsSum([[0,1,1,2],[0,5,0,0], [2,0,3,3]]));
// matrixElementsSum([[0,1,1,2],[0,5,0,0], [2,0,3,3]])

// let test = (a, b) => {
//     let result = 0;
//     let nhiphanold = a.toString(2);
//     let n2 = nhiphanold.length;
//     nhiphanold = [...nhiphanold];
//     nhiphanold[n2 - b] = 0;
//     nhiphannew = nhiphanold.join("");
//     for(var i = 0; i < nhiphannew.length; i++){
//         result += nhiphannew[i] * Math.pow(2, (n2 - i - 1));
//     }
//     console.log(result)
//     //return result;
// };
//
// test(37, 3);
//# sourceMappingURL=init.js.map