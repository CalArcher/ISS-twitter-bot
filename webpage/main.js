
let mapIframe = document.getElementById('mapIframe')
let lat = 5
let long = 6

document.querySelector('button').addEventListener('click', () => {
    mapIframe.src = `https://www.google.com/maps/embed/v1/view?key=AIzaSyDodhFFW3Wz6zw0c9TmzMMSdrsANKgBIEU&center=${lat},${long}&zoom=10&maptype=satellite`
})
