
const express = require('express');
const ParseServer = require('parse-server').ParseServer;
const ParseDashboard = require('parse-dashboard');
const path = require('path');


const SERVER_PORT = process.env.PORT || 8080;
const SERVER_HOST = process.env.HOST || 'localhost';
const APP_ID = process.env.APP_ID || 'parse-server-webplugin';
//C'EST SECRET CA, OK ?!!!!!!!!
const MASTER_KEY = process.env.MASTER_KEY || 'UQdRmQLQwxV5NT8L6a74kqF8aPqIM9F';
const DATABASE_URI = process.env.DATABASE_URI || 'mongodb://localhost:27017/parse-server-webplugin';
const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';
const DASHBOARD_AUTH = process.env.DASHBOARD_AUTH || 'denys:isagod';

const app = express();


const parseServerAPI = new ParseServer({
    databaseURI: DATABASE_URI,
    cloud: path.resolve(__dirname, 'cloud.js'),
    appId: APP_ID,
    masterKey: MASTER_KEY,
    serverURL: `http://${SERVER_HOST}:${SERVER_PORT}/parse`
});


app.get("/", function (req, res) {
    res.end("IS_DEVELOPMENT => " + IS_DEVELOPMENT);
});

app.use('/parse', parseServerAPI);


if(IS_DEVELOPMENT) {
    let users;
    if (DASHBOARD_AUTH) {
        const [user, pass] = DASHBOARD_AUTH.split(':');
        users = [{user, pass}];
    }
    const dashboard = ParseDashboard({
        apps: [{
            serverURL: '/parse',
            appId: APP_ID,
            masterKey: MASTER_KEY,
            appName: 'parse-webplugin',
        }],
        users,
    }, IS_DEVELOPMENT);
    app.use("/dashboard", dashboard);
}


app.listen(SERVER_PORT, () => console.log(
    `Notre serveur tourne en mode ${process.env.NODE_ENV || 'development'} sur http://localhost:${SERVER_PORT}`
));