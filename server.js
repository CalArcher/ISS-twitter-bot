//basic server set up with express
const fs = require('fs')
const express = require('express')
const path = require('path')
const app = express()
const cors = require('cors')        //needed so api data can be accessed by anyone
app.use(cors({
    origin: '*',
    methods: ["GET", "POST"]        //fetch methods allowed 
}))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'webpage/index.html'))
})

const PORT = process.env.PORT || 8080

app.listen(PORT, _ => {
    console.log(`app deployed at port ${PORT}`)
})

//tweet function setup 
const _fetch = require("./fetch")
const rwClient = require("./twitterClient") 
const v = require("./volcanoLatLongName")

class App {
    constructor(){
        this.coordsData
        this.namesArr = []
        this.astronautLat 
        this.astronautLong
        this.closestLat
        this.randomAstronaut
        this.closestLatIdx
        this.matchingLong
        this.matchingName
        this.tweetContent
        this.passedOverVolcanos = {
        }
        this.top3 = [["0",0],["0",0],["0",0]] //starting list data, will get replaced within a day for an accurate top3 list
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
            console.dir(err + ' coords')
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
                this.tweetContent = undefined
            }else if(this.tweetContent === undefined){
                console.log(this.tweetContent + ' this is tweetContent')
            }
        } catch (error) {
            console.log(error + ' line 117')
        }
    }

    //generates the top 3 volcanos and keeps track of all volcanos passed over

    //NEED TO FIX SO ARRAY CAN START EMPTY
    makeTop3(name){
        const thisObj = this
        try{
            if(thisObj.tweetContent){ 
                    var data = fs.readFileSync('./coords.json', 'utf-8')
                    var dataParsed = JSON.parse(data)
                    var volcanoList = dataParsed.passedOverVolcanos
                    thisObj.passedOverVolcanos = volcanoList

                    var top3 = dataParsed.top3
                    thisObj.top3 = top3

                    //checks if volcano exists in passedOver list, and if it is bigger than top3[2] it replaces top3[2]
                    if(volcanoList[name] == undefined){
                        thisObj.passedOverVolcanos[name] = 1
                        console.log(thisObj.passedOverVolcanos)
                        if(thisObj.top3[2][0] === '0'){   //from null to '0'
                            thisObj.top3[2] = [name, thisObj.passedOverVolcanos[name]]
                            thisObj.top3.sort((a,b) => b[1] - a[1])
                        }
                    }

                    else if(volcanoList[name] >= 1 ){
                        thisObj.passedOverVolcanos[name] = thisObj.passedOverVolcanos[name] + 1
                        if(thisObj.top3[0][0] === name){  
                            thisObj.top3[0][1] = top3[0][1] + 1
                            thisObj.top3.sort((a,b) => b[1] - a[1])
                        }else if(thisObj.top3[1][0] === name){  
                            thisObj.top3[1][1] = top3[1][1] + 1
                            thisObj.top3.sort((a,b) => b[1] - a[1])
                        }else if(thisObj.top3[2][0] === name){  
                            thisObj.top3[2][1] = top3[2][1] + 1
                            thisObj.top3.sort((a,b) => b[1] - a[1])
                        }else if(volcanoList[name] > thisObj.top3[2][1]){   
                            thisObj.top3.sort((a,b) => b[1] - a[1])
                            thisObj.top3[2] = [name, thisObj.passedOverVolcanos[name]]
                            thisObj.top3.sort((a,b) => b[1] - a[1])
                        }
                    }
                }     
        } catch(e){
            console.log(e)
        } 
    }
 
    //if a new volcano is found, updates coords.json with new data
    updateJSON(){
        if(this.tweetContent){
            try {
                let spaceData = {
                    'latISS': this.astronautLat,
                    'longISS': this.astronautLong,
                    'volcanoLat': this.closestLat,
                    'volcanoLong': this.matchingLong,
                    'volcanoName': this.matchingName,
                    'passedOverVolcanos': this.passedOverVolcanos,
                    'top3': this.top3
                }
                let spaceDataStr = JSON.stringify(spaceData, null, 2)
                fs.writeFileSync('coords.json', spaceDataStr, ShowError)
               
                function ShowError(err){
                    console.log(err)
                }
            } catch (error) {
                console.log(error)
            }
        }
    }

    //updates the variable coordsData with current data from coords.json
    getData(){
            try{
                let dataStr = fs.readFileSync('./coords.json', 'utf-8')
                this.coordsData = JSON.parse(dataStr)
            } catch(e){
                console.log(e)
            }    
    }

    //creates path to get api data
    getJSON(){
        let thisObj = this
        try {
            app.get('/data.json', function(req,res) {
                res.json(thisObj.coordsData)
            })
        } catch (error) {
            console.log(error)
        }        
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
            setTimeout(function(){
                 thisObj.makeTop3(thisObj.matchingName)
            }, 500)
            setTimeout(function() {
                thisObj.updateJSON()
                thisObj.getData()
                thisObj.getJSON()
                thisObj.tweet()  
            }, 800)        
        }, 2000);
    }

    //repeats callOrder() every x seconds
    repeater(){
        const thisObj = this
        let callRepeat = setInterval(function() {
            thisObj.callOrder()
        }, 8000)
    }
}

let ISSTweet = new App()

ISSTweet.repeater()


//used to ping my heroku dyno so the server does not sleep
var https = require("https");
setInterval(function() {
    https.get("https://iss-tweet-bot.herokuapp.com/");
    console.log('pinged')
}, 700000)

