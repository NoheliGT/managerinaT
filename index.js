// @ts-check
'use strict';

process.chdir(__dirname);
require('ts-node').register({ transpileOnly: true });

// Make sure data folder exists
const fs = require('fs');
fs.mkdirSync('./data', { recursive: true });
var express = require("express");
var app = express();


app.set("port", process.env.PORT || 5000);

app
  .get("/", function (request, response) {
    var result = "App is running";
    response.send(result);
  })
  .listen(app.get("port"), function () {
    console.log(
      "App is running, server is listening on port ",
      app.get("port")
    );
  });

// Utils
const { logError } = require('./utils/log');

const bot = require('./bot');

bot.use(
	require('./handlers/middlewares'),
	require('./plugins'),
	require('./handlers/commands'),
	require('./handlers/regex'),
	require('./handlers/unmatched'),
);

bot.catch(logError);

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bot.launch();
