// JavaScript Document
function initCalc() {
	"use strict";
	var num_1 = +prompt ('Введите первое значение', '');
	var num_2 = +prompt ('Введите второе значение', '');
	var arithmetic = prompt ('Введите математический оператор', '');
	alert ( 'Результат: '+num_1+arithmetic+num_2+'='+eval(num_1+arithmetic+num_2) );
}

function balls(i) {
	"use strict";
	if ( i <= 100 && i >= 95 ) { return alert( 'A' ); }
	if ( i <= 94  && i >= 85 ) { return alert( 'B' ); }
	if ( i <= 84  && i >= 75 ) { return alert( 'C' ); }
	if ( i <= 74  && i >= 65 ) { return alert( 'D' ); }
	if ( i <= 64  && i >= 60 ) { return alert( 'E' ); }
	if ( i <= 59  && i >= 0  ) { return alert( 'FX'); }
}
function initBalls() {
	"use strict";
	balls( +prompt('Введите баллы') );
}

function initCar() {
	"use strict";
	var array = [];
	for (var i=0; i<5; i++) {
		var carObj = { FirmName:'', ModelName:'', EngineName:'' };
		for (var key in carObj) {
			if (carObj.hasOwnProperty(key)) {
				carObj[key] = prompt(key, '');
				if (key === 'EngineName') { carObj[key] = parseFloat(carObj[key]); }
			}
		}
		array.push (carObj);
	}
	for (i in array) {
		if (array[i].EngineName > 2.0) {
			alert ('Car: ' + array[i].FirmName + '. Engine: ' + array[i].EngineName);
		}
	}
}