//basic server set up with express
var fs = require('fs')
const express = require('express')
const { fstat } = require('fs')
const path = require('path')
const app = express()
const cors = require('cors')
app.use(cors({
    origin: '*',
    methods: ["GET"]
}))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/webpage/index.html'))
})

const PORT = process.env.PORT || 8080

app.listen(PORT, _ => {
    console.log(`app deployed at port ${PORT}`)
})

//tweet function setup 
const _fetch = require("./fetch")
const rwClient = require("./twitterClient") 
const v = require("./volcanoLatLongName")
const coordData = require('./coords.json')

class App {
    constructor(){
        this.namesArr = []
        this.astronautLat 
        this.astronautLong
        this.closestLat
        this.randomAstronaut
        this.closestLatIdx
        this.matchingLong
        this.matchingName
        this.tweetContent
    }
    
    //gets a list of all people in space and on the ISS, assigns to namesArr
    fetchPeople(){
        this.namesArr = []
        _fetch('http://api.open-notify.org/astros.json', {}, true)
        .then(res => res.json())
        .then(data => {
            let p = data.people
            for(let i = 0; i < p.length; i++){
                if (p[i].craft === 'ISS'){
                this.namesArr.push(p[i].name )
                }
            }
        })
        .catch(err => {
            console.dir(err + ' names')
        })
    }

    //gets the ISS latitude and longitude, assigns them as variables 
    fetchCoords(){
        _fetch('http://api.open-notify.org/iss-now.json', {}, true)
        .then(res => res.json())
        .then(data => {
            this.astronautLat = data.iss_position.latitude
            this.astronautLong = data.iss_position.longitude 
        })
        .catch(err => {
            console.dir(err + ' coords err')
        })
    }

    //provides a random name from the namesArr to tweet at
    pickName(arr){
        let decider = Math.floor(Math.random() * (arr.length)) 
        this.randomAstronaut = this.namesArr[decider]
    }

    //finds the closest volcano latitude from the volcanoLat array and its matching index
    findClose(){
        const thisObj = this
        this.closestLat = v.volcanoLat.reduce(function(prev, curr) {
            //gets the closest latitude (to the current astro lat) from the volcanoLat array
            return (Math.abs(curr - thisObj.astronautLat) < Math.abs(prev - thisObj.astronautLat) ? curr : prev)      
        })  
        this.closestLatIdx = v.volcanoLat.indexOf(this.closestLat) 
    }

    //finds the closest latitude's corresponding longitude and volcano name
    findMatching(){
        const thisObj = this
        this.matchingName = v.volcanoNames[this.closestLatIdx]      
        if (Math.abs(this.closestLat - this.astronautLat) < .75){      
            this.matchingLong = v.volcanoLong[this.closestLatIdx]       
        }
    }

    //sends a tweet if the astronauts longitude is close enough to volcanos longitude
    setTweetCondition(){
        if (Math.abs(this.astronautLong - this.matchingLong) < .85){
            this.tweetContent = `${this.randomAstronaut}, watch out! You are directly above the ${this.matchingName}, a volcano at ${this.closestLat} Latitude, ${this.matchingLong} Longitude.`
        }
    }

    //sends the tweet when the tweetContent is defined
    tweet = async() => {
        try {
            if(this.tweetContent != undefined){
                await rwClient.v1.tweet(this.tweetContent)
                console.log(this.tweetContent)
                this.tweetContent = undefined
            }else if(this.tweetContent === undefined){
                console.log(this.tweetContent + ' this is tweetcontent')
            }
                      
        } catch (error) {
            console.log(error)
        }
    }

    updateJSON(){
        if(this.tweetContent){
            let spaceData = {
                'latISS': this.astronautLat,
                'longISS': this.astronautLong,
                'volcanoLat': this.closestLat,
                'volcanoLong': this.matchingLong,
                'volcanoName': this.matchingName
            }
            let spaceDataStr = JSON.stringify(spaceData, null, 2)
            fs.writeFile('coords.json', spaceDataStr, ShowError)
            function ShowError(err){
                console.log(err)
            }
        }
    }
    getJSON(){
        app.get('/data.json', function(req,res) {
            res.json(coordData)
        })
    }
    

    //order to call functions  
    callOrder(){
        this.fetchPeople()
        this.fetchCoords()
        const thisObj = this
        setTimeout(function() {
            thisObj.pickName(thisObj.namesArr)
            thisObj.findClose()
            thisObj.findMatching()
            thisObj.setTweetCondition()
            thisObj.updateJSON()
            thisObj.getJSON()
            thisObj.tweet()
        }, 1500);
    }

    //repeats callOrder() every x seconds
    repeater(){
        const thisObj = this
        let callRepeat = setInterval(function() {
            thisObj.callOrder()
        }, 7000)
    }
}

let ISSTweet = new App()

ISSTweet.repeater()

