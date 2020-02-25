const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const ParseServer = require('parse-server').ParseServer;
const Parse = require('parse/node');
const path = require('path');
const fs = require('fs');
const rimraf = require("rimraf");


describe('Add a plugin from zero', () => {
    
    beforeAll(async() => {
        this.mongod = new MongoMemoryServer();
        this.app = express();
        this.uri = await this.mongod.getConnectionString();
            
        const parseServerAPI = new ParseServer({
            databaseURI: this.uri,
            appId: 'parse-test',
            cloud: path.resolve('src', 'cloud.js'),
            masterKey: 'master-key',
            serverURL: `http://localhost:8080/parse`,
            maxUploadSize: '50mb'
        });

        this.app.use('/parse', parseServerAPI);

        this.app.listen(8080, () => {});

        Parse.initialize('parse-test');
        Parse.serverURL = 'http://localhost:8080/parse';
    });

    it('should create user', async()=> {
        const user = new Parse.User();
        user.set('email', 'test@test.fr');
        user.set('username', 'TestUser');
        user.set('password', 'password');
        await user.save();
        expect(Parse.User.current).not.toBeUndefined();
    });

    it('should create plugin', async()=>{

        const image_file = fs.readFileSync(path.resolve('test', 'resources', 'image.png'));
        const plugin_file = fs.readFileSync(path.resolve('test', 'resources', 'plugin.zip'));

        const values = {
            name: 'Test plugin',
            version: '1.0.0',
            short_description: 'This a plugin creation test',
            long_description: 'This a plugin creation test',
            image: new Parse.File('image.png', {base64:  new Buffer(image_file).toString('base64')}, 'image/png'),
            zip_plugin: new Parse.File('plugin.zip', {base64:  new Buffer(plugin_file).toString('base64')}),
            price: 0,
            category: new (Parse.Object.extend('Category'))({name: 'equalizer'}),
            open_source: false,
            official: false,
            tags: [],
            url: '',
            user: Parse.User.current()
        };

        const plugin = new (Parse.Object.extend('Plugin'))({...values});
        await plugin.save();
        this.idPlugin = plugin.id;
        expect(true).toBe(true);
    });

    afterAll(async() => {
        await this.mongod.stop();
        await new Promise((resolve, reject) => {
            rimraf(path.resolve('plugins', this.idPlugin), resolve);
        });
    });
});
