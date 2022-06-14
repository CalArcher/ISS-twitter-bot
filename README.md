# **I.S.S. Volcano Alert**

## [API](https://iss-tweet-bot.herokuapp.com/data.json) | [Twitter Bot](https://twitter.com/ISS_ALERT) | [Website](https://iss-data.netlify.app/) 

&nbsp;

### This project has two functionalities, being an API and a Twitter bot. 

- ### The Twitter bot will tweet to a random astronaut aboard the International Space Station when they pass over a volcano on the surface of the Earth. 

- ### The API keeps track of all of the volcanos the I.S.S. passes over, including the number of times, the top three volcanos the I.S.S. has passed over, as well as data about the most recently passed over volcano. 

&nbsp;

## **Inspiration**
---

### I wanted a project that would take me a long time to work on, and allow me to build my own API. Clocking in at well over 100 hours, not only do I have an API, I have also built a twitter bot, and a website to show the data from my API.

&nbsp;

## **How it works**
---
### Everything starts with an Open Notify [API](http://open-notify.org/Open-Notify-API/ISS-Location-Now/) that delivers the location data for the International Space Station, and who is on board. 
&nbsp;
### Every seven seconds, the server hosted on Heroku, checks the coordinates of the I.S.S. to see if it is above a surface volcano. Also within the program, in volcanoLatLongName.js, is a [list](https://volcano.si.edu/projects/vaac-data/) from The Smithsonian Institution, which has all of Earth's volcanos latitude, longitude, and name. 
&nbsp;
### Once the I.S.S. is above a volcano, the variable tweetContent is populated with a message to be tweeted, including a random astronaut name aboard the I.S.S., the coordinates of the volcano, and its name. The tweet is then sent out via a twitter client, and the new volcano data is saved to a JSON file (coords.json). The new volcano, if it does not exist, is added to the passedOverVolcanos object. If the most recent volcano does exist, the number is updated +1. There is also a function that makes and updates the top three most passed over volcanos and makes an array from them.
&nbsp;
### The website takes this data and displays it. It also uses a google maps iframe that updates each time a volcano is passed over to show where the location is what what it looks like. 

&nbsp;

## **Complications**
---

Because Heroku's free dynos filesystem is ephemeral, and the servers restart every 24 hours, the data from my JSON file is reset. At first, I wanted to keep a running tally of the top three volcanos, but because it resets I changed it to be the top three of the day. 

I would eventually like to store my JSON data on AWS or another database so that I can see what the most passed over volcano truly is. 

The second complication I had is that heroku is running the LTS version of Node. The native fetch function in Node was introduced in v18. To get around that, I had to use a fetch polyfill from [gjuoun](https://gist.github.com/gjuoun/f08f5f0298be14f88f32ffb46315e0dd). This however, only supported HTTPS requests, and not HTTP. The API I chose used HTTP, so I took gjuoun's polyfill, and with the help of [Octoshrimpy](https://github.com/octoshrimpy), I made the polyfill support HTTP. 


&nbsp;

## **Credits**
---

The base for my http polyfill was taken from [gjuoun](https://gist.github.com/gjuoun/f08f5f0298be14f88f32ffb46315e0dd).

Special thanks to [Octoshrimpy](https://github.com/octoshrimpy) for the project idea, as well as the #100Devs discord for help when I had questions. 

&nbsp;

&nbsp;

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


