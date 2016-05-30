global.rootRequire = function(name) {
    return require(__dirname + '/' + name);
};

let dbConfig = require('./config/db.json');
let serverConfig = require('./config/webserver.json');

let bodyParser = require('body-parser');
let express = require('express');
let mysql = require('mysql');

let Database = require('./src/Database');
let Rest = require('./src/Rest');

let db = new Database(mysql, dbConfig);
let rest = new Rest(express(), db, bodyParser, serverConfig);

rest.start();
