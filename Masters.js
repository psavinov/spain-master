var Langs = {
	"Español": "испанский",
	"Catalán": "каталанский",
	"Inglés": "английский"
};

var Masters = {
	byCity: [],
	byLanguage: [],
	bySpec: [],

	openLink: function(link) {
		var win = window.open(link, '_blank');

		win.focus();
	},

	priceRequest: function(id) {
		$.getJSON(
			'json/' + id + '.json',
			function(data) {
				var masterInfo = document.getElementById('masterInfo');

				var div = '<div class="card text-left"><div class="card-body">';
				div += '<h6 class="card-title">' + data.name + '</h6>';
				div += ' <h6 class="card-subtitle mb-2 text-muted">' + data.university + '</h6>';
				div += '<div><span class="text-muted">Доступные города:</span>&nbsp;<span class="text-info">';

				data.cities.forEach(
					function(city) {
						if (!div.endsWith('>')) {
							div +=",&nbsp;";
						}
						div += city;
					}
				);

				div += '</span></div><div><span class="text-muted">Доступные языки:</span>&nbsp;<span class="text-success">';

				data.languages.forEach(
					function(language) {
						if (!div.endsWith('>')) {
							div +=",&nbsp;";
						}
						div += Langs[language];
					}
				);

				div += '</span></div></div></div>';

				document.getElementById('masterId').value = data.id;
				document.getElementById('masterName').value = data.name;
				document.getElementById('masterUniversity').value = data.university;

				masterInfo.innerHTML = div;

				$("#priceModal").modal();
			}
		);
	},

	submitForm: function() {
		document.getElementById('requestForm').submit();

		$("#priceModal").modal('hide');
	},

	refreshList: function() {
		var cross = Masters.bySpec.concat(Masters.byLanguage).concat(Masters.byCity);

		cross = cross.filter(
			function(id, idx) {
				if (cross.lastIndexOf(id) > 0 && cross.lastIndexOf(id) !== idx) {
					return false;
				}

				if (Masters.byCity.length > 0 && Masters.byCity.indexOf(id) === -1) {
					return false;
				}

				if (Masters.byLanguage.length > 0 && Masters.byLanguage.indexOf(id) === -1) {
					return false;
				}

				if (Masters.bySpec.length > 0 && Masters.bySpec.indexOf(id) === -1) {
					return false;
				}

				return true;
			}
		);

		var masters = document.getElementById('masters');

		if (cross.length > 0) {
			masters.innerHTML = '<div class="lds-hourglass"></div>';

			var content = '';

			var counter = 0;

			cross.forEach(
				function(id) {
					$.getJSON(
						'json/' + id + '.json',
						function(data) {
							var div = '<div class="card text-left"><div class="card-body">';
							div += '<h6 class="card-title">' + data.name + '</h6>';
							div += ' <h6 class="card-subtitle mb-2 text-muted">' + data.university + '</h6>';
							div += '<div><span class="text-muted">Доступные города:</span>&nbsp;<span class="text-info">';

							data.cities.forEach(
								function(city) {
									if (!div.endsWith('>')) {
										div +=",&nbsp;";
									}
									div += city;
								}
							);

							div += '</span></div><div><span class="text-muted">Доступные языки:</span>&nbsp;<span class="text-success">';

							data.languages.forEach(
								function(language) {
									if (!div.endsWith('>')) {
										div +=",&nbsp;";
									}
									div += Langs[language];
								}
							);

							div += '</span></div></div><div class="button-row">';

							div += '<button class="btn btn-sm btn-primary" onclick="Masters.openLink(\'' + data.link + '\')" data-toggle="tooltip" title="Информация на сайте ВУЗа">@</button>';

							if (data.priceAvailable) {
								div += '&nbsp;<button class="btn btn-sm btn-success" onclick="Masters.priceRequest(' + data.id + ')" data-toggle="tooltip" title="Запрос цены и условий">$</button>';
							}

							div += '</div></div>';

							content += div;

							counter++;

							if (counter == cross.length) {
								masters.innerHTML = content;

								$('[data-toggle="tooltip"]').tooltip();
							}
						}
					);
				}
			);
		}
		else {
			masters.innerHTML='<div class="text-center"><h3>Уточните параметры поиска</h3></div>';
		}

		Masters.bySpec = [];
	}
};

$(document).ready(
	function() {
		$.getJSON(
			"by_lang.json",
			function(data) {
				var items = [];

				items.push("<option value='-'>Любой</option>");
				$.each(data, function(key, val) {
					items.push( "<option value='" + key + "'>" + key + "</option>" );
				});

				document.getElementById("language").innerHTML = items.join("");

				$("#language").on(
					'change',
					function() {
						var language =  document.getElementById("language");
						var selectedLanguage = language.options[language.selectedIndex].value;

						Masters.byLanguage = selectedLanguage !== '-' ? data[selectedLanguage] : [];

						Masters.refreshList();
					}
				);
			}
		);

		$.getJSON(
			"by_city.json",
			function(data) {
				const ordered = {};

				Object.keys(data).sort().forEach(function(key) {
					ordered[key] = data[key];
				});

				var items = [];

				items.push("<option value='-'>Любой</option>");
				$.each(ordered, function(key, val) {
					items.push( "<option value='" + key + "'>" + key + "</option>" );
				});

				document.getElementById("city").innerHTML = items.join("");

				$("#city").on(
					'change',
					function() {
						var city =  document.getElementById("city");
						var selectedCity = city.options[city.selectedIndex].value;

						Masters.byCity = selectedCity !== '-' ? data[selectedCity] : [];

						Masters.refreshList();
					}
				);
			}
		);

		$.getJSON(
			"by_name_ru.json",
			function(data) {
				$("#spec").autocomplete({
					source: function (search, response) {
						response(Object.keys(data).filter(
							function(key) {
								return key.toLowerCase().indexOf(search.term.toLowerCase()) != -1;
							}
						).map(
							function(value) {
								return {label: value.toLowerCase(), value: value};
							}
						));
					},
					minLength: 2,
					select: function(event, ui) {
						Masters.bySpec = data[ui.item.value];

						Masters.refreshList();
					}
				});
			}
		);

		$("#spec").on(
			'keypress',
			function() {
				if (document.getElementById('spec').value === '') {
					Masters.bySpec = [];

					Masters.refreshList();
				}
			}
		);

		Masters.refreshList();
	}
);