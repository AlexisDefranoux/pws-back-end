
const unzipper = require('unzipper');
const fs = require('fs');
const axios = require('axios');

Parse.Cloud.afterSave('Plugin', async (request) => {
    const zip_plugin = await request.object.get('zip_plugin');
    const id = request.object.id
    const { data, headers } = await axios({
        url: zip_plugin.url(),
        method: 'GET',
        responseType: 'stream'});
    data.pipe(unzipper.Extract({ path: `plugins/${id}`}));
});