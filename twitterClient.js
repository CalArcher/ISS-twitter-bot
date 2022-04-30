require('dotenv').config()
const {TwitterApi} = require("twitter-api-v2"); 

let APP_KEY = process.env.APP_KEY
let APP_SECRET = process.env.APP_SECRET
let ACCESS_TOKEN = process.env.ACCESS_TOKEN
let ACCESS_SECRET = process.env.ACCESS_SECRET

const client = new TwitterApi({
    appKey: APP_KEY,
    appSecret: APP_SECRET,
    accessToken: ACCESS_TOKEN,
    accessSecret: ACCESS_SECRET
})

const rwClient = client.readWrite

module.exports = rwClient

