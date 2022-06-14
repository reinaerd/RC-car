"use strict";
const url = "http://192.168.1.44:8080/direction"

//INDEX DB
const DB_NAME = "dikkeWaggieDatabase";
const DB_VERSION = 1;
const OBJ_STORE = "buttonPushed";

const request = window.indexedDB.open(DB_NAME, DB_VERSION);

// ServiceWorker
function registerServiceWorker(){
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register("/sw.js", { scope: '/' })
          .then(function(registration) {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          }, function(err) {
            console.log('ServiceWorker registration failed: ', err);
          });
        });
    }else{
        console.log("No serviceworker found");
    } 
}


// DOM
window.addEventListener('DOMContentLoaded', event => {

    registerServiceWorker();

    // Bootstrap Template
    // Navbar shrink function
    let navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }

    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 72,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    // Eventhandler to generate data and call functions
    document.querySelectorAll(".car-btn").forEach(item => {
        item.addEventListener('click', function handleClick(event){
            let currentDate = new Date();
            let id = getLatestId();
            let direction = event.target.name;
            const data = {
                id: id,
                direction: direction,
                timestamp: currentDate.toLocaleString()
            }
            sendToLocalStorage(data);
            postDirection(data);
        });
    });

    document.querySelector(".update-statistics").addEventListener('click', e => {
        location.reload();
    });

});

function loadStatistics(db){
    const trx = db.transaction(OBJ_STORE, "readwrite");
    let data = trx.objectStore(OBJ_STORE).getAll();
    data.onsuccess = function(event){
        let newData = data.result;
        console.log(newData);
        let orderedData = newData.sort(function(a, b) { 
            return a.id - b.id  ||  a.direction.localeCompare(b.direction);
          });
        console.log(orderedData);
        orderedData.forEach(item => {
            document.querySelector(".statistics").innerHTML += 
            `
            <th scope="row">${item.id}<td>
            <td>${item.direction}<td>
            <td>${item.timestamp}<td>
            `;
        });
    }
}

function sendToLocalStorage(data){
    let dataStringified = JSON.stringify(data);
    localStorage.setItem(data.id, dataStringified);
}

function getLatestId(){
    if(sessionStorage.length == 0){
        return 0;
    }else{
        if(sessionStorage.getItem("id")){
            return sessionStorage.getItem("id");
        }
    }
}

//INDEXEDDB used documentation: https://developer.mozilla.org/en-US/docs/Web/API/IDBIndex
request.addEventListener("error", e => console.error(`A problem occured: ${e.target.errorCode}`));

request.addEventListener("upgradeneeded", e => {
    const db = e.target.result;
    const store = db.createObjectStore(OBJ_STORE, { keyPath: "id", autoIncrement:true });
    console.log("Object store created succesfully.")
    store.createIndex("direction", "direction", { unique: false });
});


request.addEventListener("success", e => {
    const db = e.target.result;    
    saveButtonPushed(db);
    loadStatistics(db);
    const trx = db.transaction(OBJ_STORE, "readwrite");
    const store = trx.objectStore(OBJ_STORE, { keyPath: "id" });
   
    // Returns the last Id in IndexedDB
    let index = store.index("direction");
    let countRequest = index.count();
    countRequest.onsuccess = function(event){
        let lastId = countRequest.result;
        sessionStorage.setItem("id", lastId);
    }
});


// Create a R/W transaction, connect to object store and add product
// First we write all data to localstorage, when page gets reloaded it puts all the data into indexedDB
// Localstorage gets deleted when it is pushed to the indexedDB
function saveButtonPushed(db){
    const trx = db.transaction(OBJ_STORE, "readwrite");
    if(localStorage.length == 0){
            console.log("No Localstorage was found");
    }else{
        for (let i = 0; i < localStorage.length; i++){
            let data = JSON.parse(localStorage.getItem(localStorage.key(i)));
            trx.objectStore(OBJ_STORE).add(data);
        }
    }
    localStorage.clear();
    trx.oncomplete = function(event){
        return;
    }
} 


// Function to retreive info about our data
function loadPushedButton(db, id){
    const trx = db.transaction(OBJ_STORE);
    const store = trx.objectStore(OBJ_STORE, { keyPath: "id" });

    store.get(id).addEventListener("success", e => {
        const pushedButtonInfo = e.target.result;
});
}



//api call to flask app.py
async function postDirection(data){
    try{
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            //body: JSON.stringify(data,null,'\t')
            body: JSON.stringify(data)
        });
        if (!response.ok){
            throw new Error(`Error! status: ${response.status}`);
        }
        const result = await response.json();
        // console.log(result);
        return result;
    } catch (err){
        console.log(err);
    }
}
