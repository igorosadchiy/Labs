/*jshint esversion: 6 */
const API_KEY = 'fd58e48d';
const url = `https://www.omdbapi.com/?apikey=${API_KEY}`;
const form = document.forms.search_form;
const alertMessage = form.querySelector('.alert-message');
const navLinkHome = document.getElementsByClassName('nav-item')[0];
const navLinkFavorites = document.getElementsByClassName('nav-item')[1];
const background = document.querySelector('.background-wrap');
const quant = 10;
var page = 1;


form.addEventListener('submit', (event) => {
    "use strict";
    event.preventDefault();
    page = 1;
    const searchValue = form.title.value.trim();
    const typeValue = form.typeCheck.value;
    if (!searchValue) {
        form.title.classList.add('error');
        alertMessage.classList.add('text-danger');
        alertMessage.innerHTML = 'This field is required!';
        setVisibility(alertMessage, true);
    } else {
        navLinkHome.classList.add('active');
        navLinkFavorites.classList.remove('active');
        fetch(`${url}&s=${searchValue}&type=${typeValue}&page=${page}`)
            .then(response => response.json())
            .then(data => generateResultCards(data));
    }
});

form.title.addEventListener('focus', (event) => {
    "use strict";
    event.preventDefault();
    if (alertMessage.classList.value.indexOf("text-danger") > 0) {
        form.title.classList.remove('error');
        alertMessage.classList.remove('text-danger');
        setVisibility(alertMessage, false);
    }
});

function setVisibility(element, isError) {
    "use strict";
    if (isError) {
        element.classList.add('visible');
    } else {
        element.classList.remove('visible');
    }
}

function generateResultCards(data) {
    "use strict";
    background.classList.add('invisible');
    if (data.Response === "False") {
        alertMessage.classList.remove('text-success');
        alertMessage.classList.add('text-danger');
        alertMessage.innerHTML = 'Not Found!';
        setVisibility(alertMessage, true);
        document.getElementById("card-container").innerHTML = '';
        return;
    }
    const searchArray = data.Search;
    const localstorage = JSON.stringify(localStorage);
    const totalResults = data.totalResults;
    let cardArray = [];
    let favorite = '';
    alertMessage.classList.remove('text-danger');
    alertMessage.classList.add('text-success');
    alertMessage.innerHTML = `Found ${totalResults} movies`;
    setVisibility(alertMessage, true);
    for (var i = 0; i < searchArray.length; i++) {
        if (localstorage.indexOf(searchArray[i].imdbID) > 0) {
            favorite = 'active';
        } else {
            favorite = '';
        }
        cardArray.push(renderCard(searchArray[i].imdbID, searchArray[i].Poster, searchArray[i].Title, searchArray[i].Year, favorite));
    }
    document.getElementById("card-container").innerHTML = cardArray.join('');
    renderPagination(totalResults);
    addCardListeners();
}

addFavoritesListeners();

function addFavoritesListeners() {
    "use strict";
    navLinkFavorites.addEventListener('click', () => {
        event.preventDefault();
        navLinkHome.classList.remove('active');
        navLinkFavorites.classList.add('active');
        background.classList.add('invisible');
        generateFavoritesCards();
    });
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
                document.getElementById("card-container").innerHTML = cardArray.join('');
                addCardListeners();
            });
        i++;
    }
    alertMessage.classList.remove('text-danger');
    alertMessage.classList.add('text-success');
    alertMessage.innerHTML = `Found ${i} favorite movies`;
    setVisibility(alertMessage, true);
}

function renderCard(imdbID, Poster, Title, Year, favorite) {
    "use strict";
    if (Poster === "N/A") {
        Poster = "img/no-image.png";
    }
    return (`
        <div class="card m-2">
            <a href="#" class="poster-wrap" data-id="${imdbID}" title="Click to more info" >
                <img src="${Poster}" alt="" class="card-img-top">
            </a>
            <div class="card-body">
                <h5 class="card-title">${Title}</h5>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item"><b>Year:</b> ${Year}</li>
                </ul>
                <button type="button" class="btn-more-info btn btn-primary mt-3" data-id="${imdbID}">More info</button>
                <button type="button" class="btn-favorite btn btn-outline-warning mt-3 float-right ${favorite}" id="${imdbID}" data-id="${imdbID}"><i class="fa fa-star-o"></i></button>
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
        <img src="${data.Poster}" alt="" class="modal-poster w-100">
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
    if (data.Poster === "N/A") {
            document.querySelector('.modal-poster').classList.remove('w-100');
    }
    addModalListeners();
    $('#modalMoreInfo').modal('show');
}

function addModalListeners() {
    "use strict";
    const btnModalFavorite = document.querySelector('.btn-modal-favorite');
    const id = btnModalFavorite.dataset.id;
    btnModalFavorite.addEventListener('click', () => {
        if (JSON.stringify(localStorage).indexOf(id) > 0) {
            localStorage.removeItem(id);
            btnModalFavorite.classList.remove('active');
            document.getElementById(id).classList.remove('active');
        } else {
            localStorage.setItem(id, 'id');
            btnModalFavorite.classList.add('active');
            document.getElementById(id).classList.add('active');
        }
    });
}

function renderPagination(total) {
    "use strict";
    let max = Math.ceil(total / quant);
    const pageButtonsArray = [];
    let previous = `<li class="page-item"><a class="page-link" href="${page-1}">Previous</a></li>`;
    let next = `<li class="page-item"><a class="page-link" href="${page+1}">Next</a></li>`;
    
    if (page === 1) {
        previous = `<li class="page-item disabled"><a class="page-link" href="#">Previous</a></li>`;
    } else if (page === total) {
        next = `<li class="page-item disabled"><a class="page-link" href="#">Next</a></li>`;
    }
    
    const paginationArray = paginationMath(page, 2, max);
    for (var i = 0; i < paginationArray.length; i++) {
        if (paginationArray[i] === page) {
            pageButtonsArray.push(`<li class="page-item active"><a class="page-link href="#" style="pointer-events: none;">${paginationArray[i]}</a></li>`);
        } else {
            pageButtonsArray.push(`<li class="page-item"><a class="page-link" href="${paginationArray[i]}">${paginationArray[i]}</a></li>`);
            if (paginationArray[i+1] - paginationArray[i] !== 1) {
                pageButtonsArray.push(`<li class="page-item disabled"><a class="page-link href="#" style="pointer-events: none;">...</a></li>`);
            }
        }
    }
    const resultString = `
    <nav aria-label="Page navigation example">
        <ul class="pagination">
            ${previous}
            ${pageButtonsArray.join('')}
            ${next}
        </ul>
    </nav>`;
    document.getElementById('paginationContainer').innerHTML = resultString;
    document.getElementById('paginationContainer').querySelectorAll('li a').forEach((item) => {
        if (paginationArray[i] !== +page) {
            item.addEventListener('click', (event) => {
                event.preventDefault();
                page = +item.getAttribute('href');
                getSearch();
            });
        }
    });
}

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
   //paginationArray(current,step,max ) step = 0 полный диапазон
//alert(paginationArray(13, 2, 14));

function getSearch() {
    "use strict";
    const searchValue = form.title.value.trim();
    const typeValue = form.typeCheck.value;
    fetch(`${url}&s=${searchValue}&type=${typeValue}&page=${page}`)
        .then(response => response.json())
        .then(data => generateResultCards(data));
}