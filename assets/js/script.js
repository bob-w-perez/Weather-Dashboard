const APIkey = "8d8a7d15a98e2a1afa786686ae1f470f";
const todayDate = document.getElementById('today-date');
const cityName = document.getElementById('city-name');
const searchForm = document.getElementById('search-form');


todayDate.innerHTML = moment().format('MMMM Do, YYYY');




searchForm.addEventListener('submit', handleSearch);
