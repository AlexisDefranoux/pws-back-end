"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');
var SERVER_PORT = process.env.PORT || 8080;
var SERVER_HOST = process.env.HOST || 'localhost';
var APP_ID = process.env.APP_ID || 'parse-server-webplugin';
//C'EST SECRET CA, OK ?!!!!!!!!
var MASTER_KEY = process.env.MASTER_KEY || 'UQdRmQLQwxV5NT8L6a74kqF8aPqIM9F';
var DATABASE_URI = process.env.DATABASE_URI || 'mongodb://localhost:27017/parse-server-webplugin';
var IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';
var DASHBOARD_AUTH = process.env.DASHBOARD_AUTH || 'denys:isagod';
var app = express_1.default();
var parseServerAPI = new ParseServer({
    databaseURI: DATABASE_URI,
    appId: APP_ID,
    masterKey: MASTER_KEY,
    serverURL: "http://" + SERVER_HOST + ":" + SERVER_PORT + "/parse"
});
app.get("/", function (req, res) {
    res.end("IS_DEVELOPMENT => " + IS_DEVELOPMENT);
});
app.use('/parse', parseServerAPI);
if (IS_DEVELOPMENT) {
    var users = [];
    if (DASHBOARD_AUTH) {
        var _a = DASHBOARD_AUTH.split(':'), user = _a[0], pass = _a[1];
        users = [{ user: user, pass: pass }];
    }
    var dashboard = ParseDashboard({
        apps: [{
                serverURL: '/parse',
                appId: APP_ID,
                masterKey: MASTER_KEY,
                appName: 'parse-webplugin',
            }],
        users: users,
    }, IS_DEVELOPMENT);
    app.use("/dashboard", dashboard);
}
app.listen(SERVER_PORT, function () { return console.log("Notre serveur tourne en mode " + (process.env.NODE_ENV || 'development') + " sur http://localhost:" + SERVER_PORT); });
