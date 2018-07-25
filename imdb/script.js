/*jshint esversion: 6 */ 
const API_KEY = 'fd58e48d';
const url = `http://www.omdbapi.com/?apikey=${API_KEY}`;
const form = document.forms.search_form;

form.addEventListener('submit', (event) => {
	"use strict";
    event.preventDefault();
    const value = form.title.value.trim();
    if (!value) {
        form.title.classList.add('error');
        setVisibility(form.querySelector('.error-message'), true);
    } else {
        fetch(`${url}&s=${value}`)
            .then( response => response.json() )
            .then( data => generateResultCards(data) );
        form.title.classList.remove('error');
        setVisibility(form.querySelector('.error-message'), false);
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
	var searchArray = data.Search;
	var cardArray = [];
	for (var i = 0; i < searchArray.length; i++) {
		cardArray.push (`
			<div class="card">
				<img src="${searchArray[i].Poster}" alt="Card image cap" class="card-img-top">
				<div class="card-body">
					<h5 class="card-title">${searchArray[i].Title}</h5>
					<ul class="list-group list-group-flush">
						<li class="list-group-item"><b>Year:</b> ${searchArray[i].Year}</li>
						<li class="list-group-item"><b>ID:</b> ${searchArray[i].imdbID}</li>
					</ul>
					<a href="#" class="btn btn-primary btn-card">More info</a>
				</div>
			</div>
		`);
	}
	document.getElementById("search-result").innerHTML = cardArray.join('');
}
