const APIkey = "8d8a7d15a98e2a1afa786686ae1f470f";
const todayDate = document.getElementById('today-date');
const cityName = document.getElementById('city-name');
const searchForm = document.getElementById('search-form');


todayDate.innerHTML = moment().format('MMMM Do, YYYY');


function handleSearch (event) {
    event.preventDefault();
    let query = document.getElementById('query').value.trim(); 
    getCurrentWeather(query);
    document.getElementById('query').value = '';
}


function getCurrentWeather (query) {
    let apiUrl = 'http://api.openweathermap.org/data/2.5/weather?units=imperial&q=' + query + '&appid=' + APIkey;

    fetch(apiUrl).then(function(response){
        if (response.ok) {
            response.json().then(function(data){
                oneCallPass(data.coord.lat, data.coord.lon);
            });
        } else {
            // look for alternatives here
            alert('ERROR');
            console.error(response.status);
        }
    });
}

// *WORKAROUND*
// the 'weather' endpoint of the API url does not include UVI in its response
// the 'onecall' endpoint does however it only accepts Lat/Lon query parameters
// so this function takes the Lat/Lon values retrieved from the 'weather' results
// and uses them to make a request using 'onecall'
function oneCallPass (lat, lon) {
    let apiUrl = 'http://api.openweathermap.org/data/2.5/onecall?units=imperial&lat=' + lat + '&lon=' + lon + '&appid=' + APIkey;

    fetch(apiUrl).then(function(response) {
        if(response.ok){ 
            response.json().then(function(data){
                displayCurrent(data.current);
                console.log(data);
            })
        } else {
            // look for alternatives here            
            alert('ERROR');
            console.error(response.status);
        }
    });
}


function displayCurrent(data) {
    console.log(data);
    document.getElementById('current-temp').innerHTML += ' ' + data.temp + ' \u00B0F';
    document.getElementById('current-wind').innerHTML += ' ' + data.wind_speed + ' mph';
    document.getElementById('current-humidity').innerHTML += ' ' + data.humidity + '%';
    document.getElementById('current-uvi').innerHTML += data.uvi;
    
    let uvi = document.getElementById('current-uvi');
    switch (true) {
        case (data.uvi <= 2):
            uvi.style.backgroundColor = 'green';
            uvi.style.color = 'white';
            break;
        case (data.uvi <= 5):
            uvi.style.backgroundColor = 'yellow';
            break;
        case (data.uvi <= 7):
            uvi.style.backgroundColor = 'orange';
            break;
        case (data.uvi <= 10):
            uvi.style.backgroundColor = 'red';
            uvi.style.color = 'white';
            break;
    }
}


function makeCard () {    
    let card = document.createElement('div');
    card.setAttribute('class','forecast-card');

    let cardDate = document.createElement('h4');
    card1

}


function displayCards () {
    const cardWrapper = document.getElementById('forecast-card-wrapper');


}


searchForm.addEventListener('submit', handleSearch);
