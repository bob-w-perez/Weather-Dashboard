const APIkey = "8d8a7d15a98e2a1afa786686ae1f470f";
const cityName = document.getElementById('city-name');
const todayDate = document.getElementById('today-date');
const currentIcon = document.getElementById('current-icon');
const currentTemp = document.getElementById('current-temp');
const currentWind = document.getElementById('current-wind');
const currentHum = document.getElementById('current-humidity');
const currentUvi = document.getElementById('current-uvi');
const searchForm = document.getElementById('search-form');
const stateSelect = document.getElementById('state');
const searchHistory = document.getElementById('search-history');
const stateAbv = [ 'none','AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY' ];


function init() {
    getWeatherInit('Atlanta');
    displayHistory();
    stateAbv.forEach(state => {
        let option = document.createElement("option");
        option.text = state;
        option.value = state;
        stateSelect.appendChild(option);
    });

}

init();


function handleSearch (event) {
    event.preventDefault();
    let query = document.getElementById('query').value.trim(); 
    getWeatherInfo(query);
    document.getElementById('query').value = '';
}


function getWeatherInfo (query) {
    let apiUrl = 'http://api.openweathermap.org/data/2.5/weather?units=imperial&q=' + query + '&appid=' + APIkey;

    fetch(apiUrl).then(function(response){
        if (response.ok) {
            response.json().then(function(data){
                oneCallPass(data.coord.lat, data.coord.lon, data.name);
                //addSearchHistory() called here to ensure name is valid
                addSearchHistory(data.name);
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
function oneCallPass (lat, lon, location) {
    let apiUrl = 'http://api.openweathermap.org/data/2.5/onecall?units=imperial&lat=' + lat + '&lon=' + lon + '&appid=' + APIkey;

    fetch(apiUrl).then(function(response) {
        if(response.ok){ 
            response.json().then(function(data){
                displayCurrent(data.current, location);
                // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%  DELETE
                console.log(data);
                displayCards(data.daily);
            })
        } else {
            // look for alternatives here            
            alert('ERROR');
            console.error(response.status);
        }
    });
}


function displayCurrent(info, location) {
    cityName.innerHTML = location;
    todayDate.textContent = moment().format('MMMM Do, YYYY');
    currentIcon.setAttribute('src', 'http://openweathermap.org/img/w/' + info.weather[0].icon + '.png');
    currentIcon.setAttribute('alt', info.weather[0].description);
    currentTemp.textContent = 'Temp: ' + Math.round(Number(info.temp)) + ' \u00B0F';
    currentWind.textContent = 'Wind: ' + Math.round(Number(info.wind_speed)) + ' mph';
    currentHum.textContent = 'Humidity: ' + Math.round(Number(info.humidity)) + '%';
    currentUvi.textContent = info.uvi;
    
    let uvi = document.getElementById('current-uvi');
    switch (true) {
        case (info.uvi <= 2):
            uvi.style.backgroundColor = 'green';
            uvi.style.color = 'white';
            break;
        case (info.uvi <= 5):
            uvi.style.backgroundColor = 'yellow';
            uvi.style.color = 'black';
            break;
        case (info.uvi <= 7):
            uvi.style.backgroundColor = 'orange';
            uvi.style.color = 'black';
            break;
        case (info.uvi <= 10):
            uvi.style.backgroundColor = 'red';
            uvi.style.color = 'white';
            break;
    }
}

// console log info.dt
function makeCard (info) {    
    let card = document.createElement('div');
    card.setAttribute('class','forecast-card');

    let cardDay = document.createElement('h4');
    cardDay.textContent = moment.unix(info.dt).format('dddd');

    let cardDate = document.createElement('h5');
    cardDate.textContent = moment.unix(info.dt).format('M/D/YY');

    let cardIcon = document.createElement('img');
    cardIcon.setAttribute('src', 'http://openweathermap.org/img/w/' + info.weather[0].icon + '.png');
    cardIcon.setAttribute('alt', info.weather[0].description);
    cardIcon.setAttribute('style', 'position: relative; left: 1.8em;')

    let cardTemp = document.createElement('p');
    cardTemp.textContent = 'Temp: ' + Math.round(Number(info.temp.day)) + ' \u00B0F';

    let cardWind = document.createElement('p');
    cardWind.textContent = 'Wind: ' + Math.round(Number(info.wind_speed)) + ' mph';

    let cardHum = document.createElement('p');
    cardHum.textContent = 'Humidity: ' + Math.round(Number(info.humidity)) + '%'

    card.append(cardDay, cardDate, cardIcon, cardTemp, cardWind, cardHum);
    return card;

}


function displayCards (forecast) {
    const cardWrapper = document.getElementById('forecast-card-wrapper');

    while (cardWrapper.hasChildNodes()) {
        cardWrapper.removeChild(cardWrapper.lastChild);
    }

    let card1 = makeCard(forecast[1]);
    let card2 = makeCard(forecast[2]);
    let card3 = makeCard(forecast[3]);
    let card4 = makeCard(forecast[4]);
    let card5 = makeCard(forecast[5]);

    cardWrapper.append(card1, card2, card3, card4, card5);

}

function addSearchHistory (search) {
    let storedHistory = JSON.parse(localStorage.getItem('history'));
    if (storedHistory && !storedHistory.includes(search)) {
        storedHistory.push(search);
        localStorage.setItem('history', JSON.stringify(storedHistory));
        let savedCity = document.createElement('p');
        savedCity.textContent = search;
        savedCity.classList.add('saved-city');
        searchHistory.append(savedCity);


    } else if (!storedHistory) {
        localStorage.setItem('history', JSON.stringify([search]));
        let savedCity = document.createElement('p');
        savedCity.textContent = search;
        savedCity.classList.add('saved-city');
        searchHistory.append(savedCity);   
    } 
}

function displayHistory() {
    let storedHistory = JSON.parse(localStorage.getItem('history'));
    if (storedHistory) {
        storedHistory.forEach(city => {
            let savedCity = document.createElement('p');
            savedCity.textContent = city;
            savedCity.classList.add('saved-city');
            searchHistory.append(savedCity);

        });
    }
}


// separate function for the initial query so that the default display (Atlanta) 
// does not appear in the user's search history
function getWeatherInit (query) {
    let apiUrl = 'http://api.openweathermap.org/data/2.5/weather?units=imperial&q=' + query + '&appid=' + APIkey;

    fetch(apiUrl).then(function(response){
        if (response.ok) {
            response.json().then(function(data){
                oneCallPass(data.coord.lat, data.coord.lon, data.name);
            });
        } else {
            // look for alternatives here
            alert('ERROR');
            console.error(response.status);
        }
    });
}


function historyQuery (event) {
    let query = event.target;

    if (query.matches('.saved-city')) {
        getWeatherInfo(query.textContent);
    }
}


searchForm.addEventListener('submit', handleSearch);
searchHistory.addEventListener('click', historyQuery)