
let mapIframe = document.getElementById('mapIframe')
let lat = 22
let long = 70


document.querySelector('button').addEventListener('click', () => {
    mapIframe.src = `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_KEY}&center=${lat},${long}&zoom=10&maptype=satellite`
})
