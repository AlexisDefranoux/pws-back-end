import express, {Express} from 'express';
import cors from 'cors';
import path from 'path';

const ParseServer = require('parse-server').ParseServer;
const ParseDashboard = require('parse-dashboard');

const SERVER_PORT: string | number = process.env.PORT || 8080;
const SERVER_HOST: string = process.env.HOST || 'localhost';
const APP_ID: string = process.env.APP_ID || 'parse-server-webplugin';
const MASTER_KEY: string = process.env.MASTER_KEY || 'UQdRmQLQwxV5NT8L6a74kqF8aPqIM9F';
const DATABASE_URI: string = process.env.DATABASE_URI || 'mongodb://localhost:27017/parse-server-webplugin';
const IS_DEVELOPMENT: boolean = process.env.NODE_ENV !== 'production';
const DASHBOARD_AUTH: string = process.env.DASHBOARD_AUTH || 'parseuser:parsepwd';


const app: Express = express();

const parseServerAPI = new ParseServer({
    databaseURI: DATABASE_URI,
    appId: APP_ID,
    cloud: path.resolve(__dirname, 'cloud.js'),
    masterKey: MASTER_KEY,
    serverURL: `http://${SERVER_HOST}:${SERVER_PORT}/parse`,
    maxUploadSize: '50mb'
});


app.use(cors());

app.get("/", (req, res) => {
    res.end("IS_DEVELOPMENT => " + IS_DEVELOPMENT);
});

app.get("/forkplugin", (req, res) => {
    const idPlugin = req.query.idPlugin;
    const idUser = req.query.idUser;

    let user: any;
    const queryUse = new Parse.Query(Parse.Object.extend("User"));
    queryUse.get(idUser).then(queryUserResult => {
        user = queryUserResult;
    });

    const query = new Parse.Query(Parse.Object.extend("Plugin"));
    query.get(idPlugin).then(queryResult => {
        const cloned = queryResult.clone();
        delete cloned.attributes.objectId;
        cloned.set("user", user);
        cloned.set("official", false);
        cloned.set("name", cloned.get("name")+"-forked");
        cloned.save()
            .then((clonedSaved) => {
                res.send({
                    newid: clonedSaved.id
                });
            }, (err) => {
                res.send({ error : err});
            });
    }).catch(err => {
        res.send({
            error: err
        });
    });
});

app.use('/parse', parseServerAPI);

app.use('/plugins', express.static(path.resolve(process.cwd(), 'plugins')));

app.get('/music', (req, res) => {
   res.sendFile(path.resolve(process.cwd(), 'music','CleanGuitarRiff.mp3'))
});


if (IS_DEVELOPMENT) {
    let users: { user: string; pass: string }[] = [];
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
        {allowInsecureHTTP: true});
    app.use("/dashboard", dashboard);
    checkInit();
}

app.listen(SERVER_PORT, () => console.log(
    `Notre serveur tourne en mode ${process.env.NODE_ENV || 'development'} sur http://localhost:${SERVER_PORT}`
));

/*
Due to issues on dockerized mongodb (https://github.com/docker-library/mongo/issues/74), we can't initalize the database
with categories, so we use a method that will create the class Category and three categories
 */
function checkInit() {
    const Category = Parse.Object.extend("Category");
    const query = new Parse.Query(Category);
    query.find().then( (results) => {
        if(results.length === 0){
            const equalizer = new Category();
            equalizer.set("name", "Equalizer");
            const synthetizer = new Category();
            synthetizer.set("name", "Synthetizer");
            const tuner = new Category();
            tuner.set("name", "Tuner");
            const distortion = new Category();
            distortion.set("name", "Distortion");

            equalizer.save();
            synthetizer.save();
            tuner.save();
            distortion.save();
        }
    });
}