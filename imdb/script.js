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
	var searchArray = data.Search;
	var cardArray = [];
	alertMessage.classList.remove('text-danger');
	alertMessage.classList.add('text-success');
	alertMessage.innerHTML = `Found ${data.totalResults} movies`;
    setVisibility(alertMessage, true);
	for (var i = 0; i < searchArray.length; i++) {
		cardArray.push (`
			<div class="card">
				<a href="#" class="poster-wrap" data-toggle="modal" data-id="${searchArray[i].imdbID}" data-target="#modalMoreInfo" title="Click to more info" >
					<img src="${searchArray[i].Poster}" alt="${searchArray[i].Title}" class="card-img-top">
				</a>
				<div class="card-body">
					<h5 class="card-title">${searchArray[i].Title}</h5>
					<ul class="list-group list-group-flush">
						<li class="list-group-item"><b>Year:</b> ${searchArray[i].Year}</li>
						<li class="list-group-item"><b>ID:</b> ${searchArray[i].imdbID}</li>
					</ul>
					<button type="button" class="btn btn-primary mt-3" data-toggle="modal" data-id="${searchArray[i].imdbID}" data-target="#modalMoreInfo">More info</button>
					<button type="button" class="btn btn-outline-warning mt-3 float-right" data-id="${searchArray[i].imdbID}"><i class="fa fa-star-o"></i></button>
				</div>
			</div>
		`);
	}
	document.getElementById("card-container").innerHTML = cardArray.join('');
}
