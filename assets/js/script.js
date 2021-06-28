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
let cityList = [];
let counter;


// when page loads this function runs a query for 'Atlanta, GA' so that all the
// dynamically created elements are on the page before the user searches
function init() {
    counter = 0;
    loadCityList();
    getWeatherInfo('Atlanta', 'GA');
    displayHistory();
    stateAbv.forEach(state => {
        let option = document.createElement("option");
        option.text = state;
        option.value = state;
        stateSelect.appendChild(option);
    });
}

// init function called
init();


function handleSearch (event) {
    event.preventDefault();
    let query = document.getElementById('query').value.trim(); 
    let state = stateSelect.value;
    getWeatherInfo(query, state);
    document.getElementById('query').value = '';
    document.getElementById('state').value = '';
}


// this function makes an api request based on user input, then gets the 'lat' and 'lon'
// values for that city and passes them to another function
function getWeatherInfo (query, state) {
    if (state == '' || state == 'none') {
        var apiUrl = 'https://api.openweathermap.org/data/2.5/weather?units=imperial&q=' + query + '&appid=' + APIkey;
        var stateName = '';     
    } else {
        var apiUrl = 'https://api.openweathermap.org/data/2.5/weather?units=imperial&q=' + query + ',' + state + ',us&appid=' + APIkey;
        var stateName = ', ' + state;
    }

    fetch(apiUrl).then(function(response){
        if (response.ok) {
            response.json().then(function(data){
                // this conditional uses a counter so that the automatic query that
                // happens when the page loads/refreshes does net get checked -- the 
                // 'cityList' that checkCityID() uses is very large and sometimes doesn't
                // load in time for to bed used for the init() query, resulting in an error
                if (counter > 0){
                    if (checkCityID(data.id, state)) {
                        oneCallPass(data.coord.lat, data.coord.lon, data.name, stateName);
                    } else {
                        alert(query + stateName +' does not exist. Please try another state or leave state blank.')
                    }    
                } else {
                    oneCallPass(data.coord.lat, data.coord.lon, data.name, stateName);
                }
            });
        } else {
            // there might be a better way to handle potential errors, but this works for now
            alert('ERROR: Page not found. Check the spelling of your query and try again.');
            console.error(response.status);
        }
    });
}

// *WORKAROUND*
// the 'weather' endpoint of the API url does not include UVI in its response
// the 'onecall' endpoint does however it only accepts Lat/Lon query parameters
// so this function takes the Lat/Lon values retrieved from the 'weather' results
// and uses them to make a request using 'onecall'
function oneCallPass (lat, lon, location, state) {
    let apiUrl = 'https://api.openweathermap.org/data/2.5/onecall?units=imperial&lat=' + lat + '&lon=' + lon + '&appid=' + APIkey;

    fetch(apiUrl).then(function(response) {
        if(response.ok){ 
            response.json().then(function(data){
                displayCurrent(data.current, location, state);
                displayCards(data.daily);
                // this connditional uses the same counter as the one above so that the 
                // init() query doesn't get stored in the user's search history since
                // it is not something that they input
                if (counter > 0){
                    addSearchHistory(location, state);
                }
                // adds to counter so subsequent queries are checked and added to search history
                counter++;
            })
        } else {
            // there might be a better way to handle potential errors, but this works for now
            alert('ERROR: Page not found.');
            console.error(response.status);
        }
    });
}


function displayCurrent(info, location, state) {
    cityName.innerHTML = location + state;
    todayDate.textContent = moment().format('MMMM Do, YYYY');
    currentIcon.setAttribute('src', 'https://openweathermap.org/img/w/' + info.weather[0].icon + '.png');
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


function makeCard (info) {    
    let card = document.createElement('div');
    card.setAttribute('class','forecast-card');

    let cardDay = document.createElement('h4');
    cardDay.textContent = moment.unix(info.dt).format('dddd');

    let cardDate = document.createElement('h5');
    cardDate.textContent = moment.unix(info.dt).format('M/D/YY');

    let cardIcon = document.createElement('img');
    cardIcon.setAttribute('src', 'https://openweathermap.org/img/w/' + info.weather[0].icon + '.png');
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


function addSearchHistory (search, state) {
    let storedHistory = JSON.parse(localStorage.getItem('history'));
    if (storedHistory && !storedHistory.includes(search + state)) {
        storedHistory.push(search + state);
        localStorage.setItem('history', JSON.stringify(storedHistory));
        let savedCity = document.createElement('p');
        savedCity.textContent = search + state;
        savedCity.classList.add('saved-city');
        searchHistory.append(savedCity);


    } else if (!storedHistory) {
        localStorage.setItem('history', JSON.stringify([search + state]));
        let savedCity = document.createElement('p');
        savedCity.textContent = search + state;
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



function historyQuery (event) {
    let query = event.target;

    if (query.matches('.saved-city')) {
        let qSplit = query.textContent.split(', ');
        if (qSplit.length == 2){
            getWeatherInfo(qSplit[0], qSplit[[1]]);
        } else {
            getWeatherInfo(qSplit[0], 'none')
        }
    }
}

// stores a list of the all the cites used by OpenWeatherMap to a variable
// so that the city/state combination the user inputs can be verified
// as an existing place (e.g., so nothing will display for 'Atlanta, CO' 
// which would not throw an error because the API ignores the state and
// returns their default for that city if a query is made with a 
// non-existent city/state combo)
function loadCityList () {
    fetch('./assets/city.list.min.json').then(function(response){
        return response.json();
    }).then(function(data) {
        cityList = data;
    })
}


function checkCityID(cityID, state){
    if (state != '' && state != 'none'){
        let cityData;
        for (let i = 0; i < cityList.length; i++) {
            if (cityID == cityList[i].id) {
                cityData = cityList[i];
            }
        }
        if (state == cityData.state) {
            return true;
        } else {
            return false;
        }
    } else {
        return true;
    }
}



searchForm.addEventListener('submit', handleSearch);
searchHistory.addEventListener('click', historyQuery)