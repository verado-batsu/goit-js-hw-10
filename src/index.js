import './css/styles.css';
import { fetchCountries } from './fetchCountries';
import debounce from 'lodash.debounce';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const DEBOUNCE_DELAY = 300;

const refs = {
	inputEl: document.querySelector('#search-box'),
	countryList: document.querySelector('.country-list'),
	countryInfo: document.querySelector('.country-info'),
}

refs.inputEl.addEventListener('input', debounce(onInputEl, DEBOUNCE_DELAY));

function onInputEl(e) {
	const searchValue = e.target.value.trim();
	if (searchValue === '') {
		clearInfo();
		return;
	}
	fetchCountries(searchValue)
		.then(countries => {
			if (countries.length > 10) {
				clearInfo();
				Notify.info('Too many matches found. Please enter a more specific name.');
				return;
			}
			if (countries.length >= 2 && countries.length <= 10) {
				clearInfo();
				renderCountryList(countries);
				return;
			}
			renderCountryInfo(countries[0]);
		})
		.catch(error => {
			clearInfo();
			Notify.failure('Oops, there is no country with that name');
		});
}

function renderCountryInfo({
	name: { common, official },
	capital,
	population,
	flags: { svg },
	languages,
}) {
	clearInfo();
	const languagesString = createLanguageString(languages);

	const markup = `
	<img width="40" src="${svg}" alt="${common}">
	<span class='official-name'>${official}</span>
	<p>Capital: <span class='value'>${capital[0]}</span></p>
	<p>Population: <span class='value'>${population}</span></p>
	<p>Languages: <span class='value'>${languagesString}</span></p>
	`
	refs.countryInfo.insertAdjacentHTML('beforeend', markup);
}

function renderCountryList(countries) {
	const markup = countries.map(country => {
		return `<li>
		<img width="50" src="${country.flags.svg}" alt="${country.name.common}">
		<span>${country.name.common}</span>
		</li>`
	})
		.join('');
	refs.countryList.insertAdjacentHTML('beforeend', markup);
}

function createLanguageString(languages) {
	const keysLangages = Object.keys(languages);
	let markupLanguages = [];
	for (const key of keysLangages) {
		markupLanguages.push(languages[key]);
	}
	return markupLanguages.join(', ');
}

function clearInfo() {
	refs.countryList.innerHTML = '';
	refs.countryInfo.innerHTML = '';
}

