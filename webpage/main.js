// const { append } = require("express/lib/response")

let mapIframe = document.getElementById('mapIframe')
let lat = 22
let long = 70


document.querySelector('#change').addEventListener('click', () => {
    mapIframe.src = `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_KEY}&center=${lat},${long}&zoom=10&maptype=satellite`
})

document.querySelector('#testData').addEventListener('click', fetchData)

function hi(){
    console.log('SUCCESS')
}

function fetchData(){
    console.log('tested')
    fetch('http://api.open-notify.org/astros.json', {}, true)
    .then(res => res.json())
    .then(data => {
       console.log(data)
    })
    .catch(err => {
        console.log(err)
    })
}

