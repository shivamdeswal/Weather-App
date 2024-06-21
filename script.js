const userWeather = document.querySelector("[data-user-weather]");
const searchWeather = document.querySelector("[data-search-weather]");
const searchForm = document.querySelector("[data-search-form]");
const userLocation = document.querySelector("[data-user-location]");
const weatherDisplay = document.querySelector("[data-weather-show]");
const loading = document.querySelector("[data-loading]");
const accessBtn = document.querySelector("[data-grant-access]");
const searchCity = document.querySelector("[search-city]");
const error = document.querySelector("[data-erorr]");
const searchBtn = document.querySelector("[data-searchBtn]");

getSessionStorage();
const API_KEY = 'd1845658f92b31c64bd94f06f7188c9c';
let currentTab = userWeather; 
userWeather.classList.add("current-tab");
// Below 2 event listener will tell which tab is clicked tab to help switching between clicked tab and current tab
userWeather.addEventListener('click' , ()=> (switchTab(userWeather))) ;          
searchWeather.addEventListener('click' , ()=> (switchTab(searchWeather)));

function switchTab(clickedTab){
    if(clickedTab != currentTab){
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab; 
        currentTab.classList.add("current-tab");

         // this means we were on usertab(have 2 thing in it grant location and userInfo make them hidden) and clicked on search tab so we have to make search ui visible and grantAccess and userInfo Ui hidden
        
        if(!searchForm.classList.contains("active")){
            weatherDisplay.classList.remove("active");
            searchForm.classList.add("active");
            userLocation.classList.remove("active");
        }
         //this means we are switching to usertab from searchtab(having userinfo in it) so we have to hide searchtab ui
        else{
            searchForm.classList.remove("active");
            weatherDisplay.classList.remove("active");
        //since we are in your weather tab (usertab) we have to display weather  for that we will use below function to find corrdinates 
            getSessionStorage();
        }
    }
}

// check if coordinated are already present in session storage
function getSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");

      // if local coordinates are not present    
    if(!localCoordinates){
        userLocation.classList.add("active");
    }
    else{
        const coordinates = JSON.parse(localCoordinates);
        getUserWeatherInfo(coordinates);
    }
}

async function getUserWeatherInfo(coordinates){   
              
    const {lat, lon} = coordinates;
    // make grant container invisilbe
    userLocation.classList.remove("active");
    // make loader visible
    loading.classList.add("active");

    try{
        let result = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        let data = await result.json();
        loading.classList.remove("active")  ;                
        renderWeatherInfo(data);
    }
    catch(error){
        loading.classList.remove("active");
        console.log("Your location is not working");
    }
}

function renderWeatherInfo(data){  
    //firsty we have to fetch element                        
    const cityName = document.querySelector("[data-cityName]");
    const countyFlag = document.querySelector("[data-countyFlag]");
    const weatherDescription = document.querySelector("[data-weatherDescription]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-cityTemp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloud = document.querySelector("[data-cloud]");

    // put data in ui
    cityName.textContent = data?.name;
    countyFlag.src = `https://flagcdn.com/144x108/${data?.sys?.country?.toLowerCase()}.png`;
    weatherDescription.textContent = data?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`;
    temp.textContent = `${data?.main?.temp}°C` ;
    windspeed.textContent = `${data?.wind?.speed}m/s`;
    humidity.textContent = `${data?.main?.humidity}%`;;    cloud.textContent = `${data?.clouds?.all}%`  ;    
    weatherDisplay.classList.add("active");
}

accessBtn.addEventListener('click' , ()=> {
    getLocation();
} )

function getLocation(){                         
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(getCurentCordinates);
    }
    else{
        console.log("Cordinates not available");
    }                                          
}

function getCurentCordinates(position){       
    let currentCordinates = {
        lat : position.coords.latitude,
        lon : position.coords.longitude
    };

    sessionStorage.setItem("user-coordinates" , JSON.stringify(currentCordinates));

    getUserWeatherInfo(currentCordinates);
}

const apiErrorContainer = document.querySelector(".api-error-container");
const apiErrorImg = document.querySelector("[data-notFoundImg]");
const apiErrorMessage = document.querySelector("[data-apiErrorText]");
const apiErrorBtn = document.querySelector("[data-apiErrorBtn]");

async function getCityWeatherInfo(city){
    loading.classList.add("active");
    weatherDisplay.classList.remove("active");
    apiErrorContainer.classList.remove("active");
  
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();
      if (!data.sys) {
        throw data;
      }
      loading.classList.remove("active");
      weatherDisplay.classList.add("active");
      renderWeatherInfo(data);
    } catch (error) {
      loading.classList.remove("active");
      apiErrorContainer.classList.add("active");
      apiErrorMessage.innerText = `${error?.message}`;
      apiErrorBtn.style.display = "none";
    }
  }

searchForm.addEventListener("submit", (e) =>{
    e.preventDefault();
    let city = searchCity.value;
    if(city === "") 
        return;
    else
        getCityWeatherInfo(city);

})
