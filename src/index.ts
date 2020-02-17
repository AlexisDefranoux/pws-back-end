import express, { Express } from 'express';

const ParseServer = require('parse-server').ParseServer;
const ParseDashboard = require('parse-dashboard');


const SERVER_PORT: string | number = process.env.PORT || 8080;
const SERVER_HOST: string = process.env.HOST || 'localhost';
const APP_ID: string = process.env.APP_ID || 'parse-server-webplugin';
// C'EST SECRET CA, OK ?!!!!!!!!
const MASTER_KEY: string = process.env.MASTER_KEY || 'UQdRmQLQwxV5NT8L6a74kqF8aPqIM9F';
const DATABASE_URI: string = process.env.DATABASE_URI || 'mongodb://localhost:27017/parse-server-webplugin';
const IS_DEVELOPMENT: boolean = process.env.NODE_ENV !== 'production';
const DASHBOARD_AUTH: string = process.env.DASHBOARD_AUTH || 'denys:isagod';


const app: Express = express();

const parseServerAPI = new ParseServer({
    databaseURI: DATABASE_URI,
    appId: APP_ID,
    masterKey: MASTER_KEY,
    serverURL: `http://${SERVER_HOST}:${SERVER_PORT}/parse`
});

app.get("/",  (req, res) => {
    res.end("IS_DEVELOPMENT => " + IS_DEVELOPMENT);
});

app.use('/parse', parseServerAPI);



if(IS_DEVELOPMENT) {
    let users: {user: string; pass: string}[] = [];
    if (DASHBOARD_AUTH) {
        const [user, pass]: string[] = DASHBOARD_AUTH.split(':');
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
    },
    { allowInsecureHTTP: true });
    app.use("/dashboard", dashboard);
}



app.listen(SERVER_PORT, () => console.log(
    `Notre serveur tourne en mode ${process.env.NODE_ENV || 'development'} sur http://localhost:${SERVER_PORT}`
));
