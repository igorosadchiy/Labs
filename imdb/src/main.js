/*jshint esversion: 6 */
const API_KEY = 'fd58e48d';
const url = `https://www.omdbapi.com/?apikey=${API_KEY}`;
const form = document.forms.search_form;
const alertMessage = form.querySelector('.alert-message');
const navLinkHome = document.getElementsByClassName('nav-item')[0];
const navLinkFavorites = document.getElementsByClassName('nav-item')[1];
const background = document.querySelector('.background-wrap');
const paginationContainers = document.querySelectorAll('.paginationContainer');
const cardContainer = document.getElementById("card-container");
var searchValue = form.title.value.trim();
var typeValue = form.typeCheck.value;
const quant = 10;
var page = 1;

const homeLinks = [navLinkHome, document.querySelector('.navbar-brand')];
homeLinks.forEach(link => {
    "use strict";
    link.addEventListener('click', () => {
        navLinkHome.classList.add('active');
        navLinkFavorites.classList.remove('active');
        cardContainer.innerHTML = '';
        paginationContainers.forEach (container => {container.innerHTML = '';});
        form.title.value = '';
        background.classList.remove('display-none');
    });
});

navLinkFavorites.addEventListener('click', () => {
    "use strict";
    navLinkHome.classList.remove('active');
    navLinkFavorites.classList.add('active');
    background.classList.add('display-none');
    cardContainer.innerHTML = '';
    paginationContainers.forEach(container => {container.innerHTML = '';});
    form.title.value = '';
    generateFavoritesCards();
});

function showAlertMessage(message, color) {
    "use strict";
    alertMessage.classList.add(color);
    alertMessage.innerHTML = message;
    alertMessage.style.opacity = "1";
    alertMessage.classList.remove('display-none');
    setTimeout(function(){ alertMessage.style.opacity = "0"; }, 3000);
    setTimeout(function(){ alertMessage.classList.add('display-none'); alertMessage.classList.remove(color); }, 4000);
}

form.addEventListener('submit', event => {
    "use strict";
    event.preventDefault();
    page = 1;
    searchValue = form.title.value.trim();
    typeValue = form.typeCheck.value;
    if (!searchValue) {
        form.title.classList.add('error');
        showAlertMessage('This field is required!', 'alert-danger');
    } else {
        navLinkHome.classList.add('active');
        navLinkFavorites.classList.remove('active');
        fetch(`${url}&s=${searchValue}&type=${typeValue}&page=${page}`)
            .then(response => response.json())
            .then(data => checkData(data));
    }
});

form.title.addEventListener('focus', () => {
    "use strict";
    form.title.classList.remove('error');
});

function checkData(data) {
    "use strict";
    if (data.Response === "False") {
        showAlertMessage('Not Found!', 'alert-danger');
        paginationContainers.forEach (container => {container.innerHTML = '';});
        cardContainer.innerHTML = '';
    } else {
        generateResultCards(data);
        showAlertMessage(`Found ${data.totalResults} movies`, 'alert-success');
    }
}

function generateResultCards(data) {
    "use strict";
    background.classList.add('display-none');
    const searchArray = data.Search;
    const localstorage = JSON.stringify(localStorage);
    const totalResults = data.totalResults;
    let cardArray = [];
    let favorite = '';
    for (var i = 0; i < searchArray.length; i++) {
        if (localstorage.indexOf(searchArray[i].imdbID) > 0) {
            favorite = 'active';
        } else {
            favorite = '';
        }
        cardArray.push(renderCard(searchArray[i].imdbID, searchArray[i].Poster, searchArray[i].Title, searchArray[i].Year, favorite));
    }
    cardContainer.innerHTML = cardArray.join('');
    addCardListeners();
    paginationContainers.forEach (container => {container.innerHTML = '';});
    if (totalResults > 10) {renderPagination(totalResults);}
}

function generateFavoritesCards() {
    "use strict";
    let i = 0;
    let cardArray = [];
    for (var key in localStorage) {
        if (localStorage[key] === 'id') {
            sendRequest(key);
        }
    }
    function sendRequest(id) {
        fetch(`${url}&i=${id}&plot=full`)
            .then(response => response.json())
            .then(data => {
                cardArray.push(renderCard(data.imdbID, data.Poster, data.Title, data.Year, "active"));
                cardContainer.innerHTML = cardArray.join('');
                addCardListeners();
            });
        i++;
    }
    showAlertMessage(`Found ${i} favorite movies`, 'alert-success');
}

function renderCard(imdbID, Poster, Title, Year, favorite) {
    "use strict";
    if (Poster === "N/A") {
        Poster = "img/no-image.png";
    }
    return (`
        <div class="card m-2">
            <a href="#" class="poster-wrap" data-id="${imdbID}" title="Click to more info">
                <img src="${Poster}" alt="" class="card-img-top" onerror="this.src = 'img/no-image.png'">
            </a>
            <div class="card-body d-flex flex-column justify-content-between">
                <h5 class="card-title">${Title}</h5>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item"><b>Year:</b> ${Year}</li>
                </ul>
                <div class="card-foot">
                    <button type="button" class="btn-more-info btn btn-primary mt-3" data-id="${imdbID}">More info</button>
                    <button type="button" class="btn-favorite btn btn-outline-warning mt-3 float-right ${favorite}" id="${imdbID}" data-id="${imdbID}"><i class="fa fa-star-o"></i></button>
                </div>
            </div>
        </div>`);
}

function addCardListeners() {
    "use strict";
    const btnMoreInfo = document.querySelectorAll('.btn-more-info');
    const CardPoster = document.querySelectorAll('.poster-wrap');
    const btnFavorite = document.querySelectorAll('.btn-favorite');
    const elements = [btnMoreInfo, CardPoster, btnFavorite];
    for (let i = 0; i < elements.length; i++) {
        forEachSelector(elements[i], i);
    }

    function forEachSelector(selector, i) {
        selector.forEach(elem => {
            const id = elem.dataset.id;
            if (i === 2) {
                elem.addEventListener('click', () => {
                    if (JSON.stringify(localStorage).indexOf(id) > 0) {
                        localStorage.removeItem(id);
                        elem.classList.remove('active');
                    } else {
                        localStorage.setItem(id, 'id');
                        elem.classList.add('active');
                    }
                });
            } else {
                elem.addEventListener('click', () => {
                    fetch(`${url}&i=${id}&plot=full`)
                        .then(response => response.json())
                        .then(data => generateModalMoreInfo(data));
                });
            }
        });
    }
}

function generateModalMoreInfo(data) {
    "use strict";
    const arrayKeys = ['Released', 'Genre', 'Country', 'Director', 'Actors', 'Runtime', 'Language', 'Production', 'Website', 'BoxOffice', 'imdbRating', 'imdbVotes'];
    let plot = '';
    let modalDescription = '';
    const localstorage = JSON.stringify(localStorage);
    let favorite = '';
    if (localstorage.indexOf(data.imdbID) > 0) {
        favorite = 'active';
    }
    for (let i = 0; i < arrayKeys.length; i++) {
        if (data.Plot !== "N/A") {
            plot = `
            <ul class="list-group list-group-flush">
                <li class="list-group-item text-justify">${data.Plot}</li>
            </ul>`;
        }
        if (data[arrayKeys[i]] !== "N/A" && data[arrayKeys[i]] !== undefined) {
            if (arrayKeys[i] === "Website") {
                modalDescription += `<li class="modal-description ml-4 mb-1 small text-truncate"><strong>${arrayKeys[i]}:</strong> <a href="${data[arrayKeys[i]]}" target="_blank">${data[arrayKeys[i]]}</a></li>`;
            } else {
                modalDescription += `<li class="modal-description ml-4 mb-1 small"><strong>${arrayKeys[i]}:</strong> ${data[arrayKeys[i]]}</li>`;
            }
        }
    }
    const modalContent = `
    <div class="modal-header">
        <h5 class="modal-title" id="ModalTitle">${data.Title}</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">×</span>
        </button>
    </div>
    <div class="modal-body d-flex flex-row align-items-start flex-sm-nowrap flex-wrap justify-content-center">
        <img src="${data.Poster}" alt="" class="modal-poster w-100" onerror="this.classList.remove('w-100')">
        <div class="modal-about w-100">
            ${plot}
            <ul class="modal-description-group list-unstyled mt-2">
                ${modalDescription}
            </ul>
        </div>
    </div>
    <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="button" class="btn-modal-favorite btn btn-outline-warning ${favorite}" data-id="${data.imdbID}"><i class="fa fa-star-o"></i> Favorites</button>
    </div>`;
    document.getElementsByClassName('modal-content')[0].innerHTML = modalContent;
    addModalListeners();
    $('#modalMoreInfo').modal('show');
}

function addModalListeners() {
    "use strict";
    const btnModalFavorite = document.querySelector('.btn-modal-favorite');
    const id = btnModalFavorite.dataset.id;
    const btnCardFavorite = document.getElementById(id);
    btnModalFavorite.addEventListener('click', () => {
        if (JSON.stringify(localStorage).indexOf(id) > 0) {
            localStorage.removeItem(id);
            btnModalFavorite.classList.remove('active');
            btnCardFavorite.classList.remove('active');
        } else {
            localStorage.setItem(id, 'id');
            btnModalFavorite.classList.add('active');
            btnCardFavorite.classList.add('active');
        }
    });
}

function renderPagination(total) {
    "use strict";
    const pageButtonsArray = [];
    let max = Math.ceil(total / quant);
    let previous = `<li class="page-item"><a class="page-link" href="${page-1}">«</a></li>`;
    let next = `<li class="page-item"><a class="page-link" href="${page+1}">»</a></li>`;
    
    if (page === 1) {
        previous = `<li class="page-item disabled"><a class="page-link" href="#">«</a></li>`;
    } else if (page === max) {
        next = `<li class="page-item disabled"><a class="page-link" href="#">»</a></li>`;
    }
    
    const paginationArray = paginationMath(page, 2, max);
    for (var i = 0; i < paginationArray.length; i++) {
        if (paginationArray[i] === page) {
            pageButtonsArray.push(`<li class="page-item active"><a class="page-link href="#" style="pointer-events: none;">${paginationArray[i]}</a></li>`);
        } else {
            pageButtonsArray.push(`<li class="page-item"><a class="page-link" href="${paginationArray[i]}">${paginationArray[i]}</a></li>`);
            if (paginationArray[i+1] - paginationArray[i] > 1) {
                pageButtonsArray.push(`<li class="page-item disabled"><a class="page-link href="#" style="pointer-events: none;">...</a></li>`);
            }
        }
    }
    const resultString = `
    <nav aria-label="Search results pages">
        <ul class="pagination pagination-sm">
            ${previous}
            ${pageButtonsArray.join('')}
            ${next}
        </ul>
    </nav>`;
    paginationContainers.forEach((container) =>{
    container.innerHTML = resultString;
    container.querySelectorAll('li a').forEach((item) => {
        if (paginationArray[i] !== page) {
            item.addEventListener('click', event => {
                event.preventDefault();
                page = +item.getAttribute('href');
                fetch(`${url}&s=${searchValue}&type=${typeValue}&page=${page}`)
                    .then(response => response.json())
                    .then(data => generateResultCards(data));
            });
        }
    });
    });
}

//paginationArray(current,step,max) step = 0 полный диапазон
//alert(paginationArray(13, 2, 14));
function paginationMath(current, step, max) {
    "use strict";
    return Array(max + 1).join("1").split("").map(
        function(a, current) {
            return current + 1;
        }).filter(
            function(a) {
                return step ? 1 === a || a === current || a === max || a <= current + step && a >= current - step : !0;
            });
}