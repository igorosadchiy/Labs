/*jshint esversion: 6 */
const API_KEY = 'fd58e48d';
const url = `https://www.omdbapi.com/?apikey=${API_KEY}`;
const form = document.forms.search_form;
const alertMessage = form.querySelector('.alert-message');
const navLinkHome = document.getElementsByClassName('nav-item')[0];
const navLinkFavorites = document.getElementsByClassName('nav-item')[1];

form.addEventListener('submit', (event) => {
	"use strict";
    event.preventDefault();
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
        fetch(`${url}&s=${searchValue}&type=${typeValue}`)
            .then( response => response.json() )
            .then( data => generateResultCards(data) );
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
	if (data.Response === "False") {
		alertMessage.classList.remove('text-success');
		alertMessage.classList.add('text-danger');
		alertMessage.innerHTML = `Not Found!`;
		setVisibility(alertMessage, true);
		return;
	}
	const searchArray = data.Search;
	const localstorage = JSON.stringify(localStorage);
	let cardArray = [];
	let favorite = '';
	alertMessage.classList.remove('text-danger');
	alertMessage.classList.add('text-success');
	alertMessage.innerHTML = `Found ${data.totalResults} movies`;
    setVisibility(alertMessage, true);
	for (var i = 0; i < searchArray.length; i++) {
		if (localstorage.indexOf(searchArray[i].imdbID) > 0) {
			favorite = 'active';
		} else {
			favorite = '';
		}
		cardArray.push (renderCard (searchArray[i].imdbID, searchArray[i].Poster, searchArray[i].Title, searchArray[i].Year, favorite));
	}
	document.getElementById("card-container").innerHTML = cardArray.join('');
	addCardListeners();
}

addFavoritesListeners();

function addFavoritesListeners() {
	"use strict";
	navLinkFavorites.addEventListener('click', () => {
		event.preventDefault();
		navLinkHome.classList.remove('active');
		navLinkFavorites.classList.add('active');
		generateFavoritesCards();
	});
}

function generateFavoritesCards() {
	"use strict";
	let i = 0;
	let cardArray = [];
	for (var key in localStorage) {if (localStorage[key] === 'id') {sendRequest(key);}}
	function sendRequest(id) {
		fetch(`${url}&i=${id}&plot=full`)
			.then( response => response.json() )
			.then( data => {
				cardArray.push(renderCard (data.imdbID, data.Poster, data.Title, data.Year, "active"));
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

function renderCard (imdbID, Poster, Title, Year, favorite) {
	"use strict";
	if (Poster === "N/A") {Poster = "no-image.png";}
	return (`
		<div class="card">
			<a href="#" class="poster-wrap" data-id="${imdbID}" title="Click to more info" >
				<img src="${Poster}" alt="" class="card-img-top">
			</a>
			<div class="card-body">
				<h5 class="card-title">${Title}</h5>
				<ul class="list-group list-group-flush">
					<li class="list-group-item"><b>Year:</b> ${Year}</li>
					<li class="list-group-item"><b>ID:</b> ${imdbID}</li>
				</ul>
				<button type="button" class="btn-more-info btn btn-primary mt-3" data-id="${imdbID}">More info</button>
				<button type="button" class="btn-favorite btn btn-outline-warning mt-3 float-right ${favorite}" id="${imdbID}" data-id="${imdbID}"><i class="fa fa-star-o"></i></button>
			</div>
		</div>
	`);
}

function addCardListeners() {
	"use strict";
	const btnMoreInfo = document.querySelectorAll('.btn-more-info');
	const CardPoster = document.querySelectorAll('.poster-wrap');
	const btnFavorite = document.querySelectorAll('.btn-favorite');
	const elements = [btnMoreInfo, CardPoster, btnFavorite];
	for (let i = 0; i < elements.length; i++) {
		forEachSelector (elements[i], i);
	}
	function forEachSelector (selector, i) {
		selector.forEach( elem => {
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
					.then( response => response.json() )
					.then( data => generateModalMoreInfo(data) );
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
	let favorite ='';
	if (localstorage.indexOf(data.imdbID) > 0) {favorite = 'active';}
	for (let i = 0; i < arrayKeys.length; i++) {
		if (data.Plot !== "N/A") {
			plot = `<ul class="list-group list-group-flush">
				  		<li class="list-group-item text-justify">${data.Plot}</li>
			  		</ul>`;
		}
		if (data[arrayKeys[i]] !== "N/A" && data[arrayKeys[i]] !== undefined) {
			if (arrayKeys[i] === "Website") {
				modalDescription += `<span class="modal-description small"><strong>${arrayKeys[i]}:</strong> <a href="${data[arrayKeys[i]]}" target="_blank">${data[arrayKeys[i]]}</a></span><br>`;
			} else {
				modalDescription += `<span class="modal-description small"><strong>${arrayKeys[i]}:</strong> ${data[arrayKeys[i]]}</span><br>`;
			}
		}
	}
	const modalContent = `
	  <div class="modal-header">
        <h5 class="modal-title" id="ModalTitle">${data.Title}</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
		  <img src="${data.Poster}" alt="" class="modal-poster">
		  <div class="modal-about">
			  ${plot}
			  ${modalDescription} 
		  </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="button" class="btn-modal-favorite btn btn-outline-warning ${favorite}" data-id="${data.imdbID}"><i class="fa fa-star-o"></i> Favorites</button>
      </div>
	`;
	document.getElementsByClassName('modal-content')[0].innerHTML = modalContent;
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