/*jshint esversion: 6 */ 
const API_KEY = 'fd58e48d';
const url = `http://www.omdbapi.com/?apikey=${API_KEY}`;
const form = document.forms.search_form;
const alertMessage = form.querySelector('.alert-message');

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
		document.getElementById("card-container").innerHTML = '';
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
	let searchArray = data.Search;
	let cardArray = [];
	let localstorege = JSON.stringify(localStorage);
	let favorite ='';
	alertMessage.classList.remove('text-danger');
	alertMessage.classList.add('text-success');
	alertMessage.innerHTML = `Found ${data.totalResults} movies`;
    setVisibility(alertMessage, true);
	for (var i = 0; i < searchArray.length; i++) {
		if (localstorege.indexOf(searchArray[i].imdbID) > 0) {
			favorite = 'active';
		} else {
			favorite = '';
		}
		cardArray.push (`
			<div class="card">
				<a href="#" class="poster-wrap" data-id="${searchArray[i].imdbID}" title="Click to more info" >
					<img src="${searchArray[i].Poster}" alt="${searchArray[i].Title}" class="card-img-top">
				</a>
				<div class="card-body">
					<h5 class="card-title">${searchArray[i].Title}</h5>
					<ul class="list-group list-group-flush">
						<li class="list-group-item"><b>Year:</b> ${searchArray[i].Year}</li>
						<li class="list-group-item"><b>ID:</b> ${searchArray[i].imdbID}</li>
					</ul>
					<button type="button" class="btn-more-info btn btn-primary mt-3" data-id="${searchArray[i].imdbID}">More info</button>
					<button type="button" class="btn-favorite btn btn-outline-warning mt-3 float-right ${favorite}" id="${searchArray[i].imdbID}" data-id="${searchArray[i].imdbID}"><i class="fa fa-star-o"></i></button>
				</div>
			</div>
		`);
	}
	document.getElementById("card-container").innerHTML = cardArray.join('');
	addCardListeners();
}

function addCardListeners() {
	"use strict";
	const btnMoreInfo = document.querySelectorAll('.btn-more-info');
	const CardPoster = document.querySelectorAll('.poster-wrap');
	const btnFavorite = document.querySelectorAll('.btn-favorite');
	const elements = [btnMoreInfo, CardPoster, btnFavorite];
	for (let i = 0; i < elements.length; i++) {
		forEachElem (elements[i], i);
	}
	function forEachElem (element, i) {
		element.forEach( elem => {
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
	let modalDescription = '';
	const localstorege = JSON.stringify(localStorage);
	let favorite ='';
	if (localstorege.indexOf(data.imdbID) > 0) {favorite = 'active';}
	for (let i = 0; i < arrayKeys.length; i++) {
		if (data[arrayKeys[i]] !== "N/A" && data[arrayKeys[i]] !== undefined) {
			modalDescription += `<span class="modal-description small"><strong>${arrayKeys[i]}:</strong> ${data[arrayKeys[i]]}</span><br>`;
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
			  <h5 class="modal-subtitle">Plot</h5>
			  <ul class="list-group list-group-flush">
				  <li class="list-group-item text-justify">${data.Plot}</li>
			  </ul>
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