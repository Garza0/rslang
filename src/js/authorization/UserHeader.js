import {
	USER_COOKIE_NAME
} from './Constants';
import {
	AUTHORIZATION_BUTTONS,
	LINKS
} from '../shared/Text';
import DOMElementCreator from '../utils/DOMElementCreator';
import TAGS from '../shared/Tags.json';
import showStartPage from './StartPage';
import {
	deleteUserCookie
} from './Cookie';
// import {
// 	createHeaderButtons
// } from './Header';

const newElem = new DOMElementCreator();
const settingsLink = newElem.create({
	elem: TAGS.LI,
	classes: 'navigation__link',
	id: 'link_settings',
	attr: {
		type: 'userElement'
	},
	child: LINKS.settings,
});

const statisticLink = newElem.create({
	elem: TAGS.LI,
	classes: 'navigation__link',
	id: 'link_statistic',
	attr: {
		type: 'userElement'
	},
	child: LINKS.statistic,
});

const gamesLink = newElem.create({
	elem: TAGS.LI,
	classes: 'navigation__link',
	id: 'link_games',
	attr: {
		type: 'userElement'
	},
	child: LINKS.games,
});

const dictionaryLink = newElem.create({
	elem: TAGS.LI,
	classes: 'navigation__link',
	id: 'link_dictionary',
	attr: {
		type: 'userElement'
	},
	child: LINKS.dictionary,
});

const logOutButton = newElem.create({
	elem: TAGS.BUTTON,
	classes: ['button', 'button_colored-add'],
	id: 'log-out',
	attr: {
		type: 'userElement'
	},
	child: AUTHORIZATION_BUTTONS.logOut,
});

const userName = newElem.create({
	elem: TAGS.SPAN,
	classes: ['user__name'],
});

const userIcon = newElem.create({
	elem: TAGS.SPAN,
	classes: ['icon', 'user__icon'],
});

const user = newElem.create({
	elem: TAGS.SPAN,
	classes: ['user'],
	attr: {
		type: 'userElement'
	},
	child: [userIcon, userName],
});

export function createUserNavigation() {
	const navigation = document.querySelector('.navigation');
	navigation.prepend(settingsLink, statisticLink, gamesLink, dictionaryLink);
}

function hideUserHeader() {
	document.querySelectorAll('[type=userElement]').forEach(element => element.remove());
	showStartPage();
}

export function createUserButtons(username) {
	const buttons = document.querySelector('.header__buttons');
	buttons.querySelectorAll('.button_unauthorized').forEach(button => button.remove());
	userName.innerText = `${username}`;
	buttons.append(logOutButton, user);
	logOutButton.addEventListener('click', () => {
		hideUserHeader();
		deleteUserCookie(USER_COOKIE_NAME.NAME);
		deleteUserCookie(USER_COOKIE_NAME.TOKEN);
	});
}