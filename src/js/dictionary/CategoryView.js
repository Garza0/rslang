import DOMElementCreator from '../utils/DOMElementCreator';
import TAGS from '../shared/Tags.json';
import APIMethods from '../words_service/APIMethods';
import {
	CATEGORIES,
} from '../shared/Constants';
import {
	DICTIONARY_BUTTONS,
} from '../shared/Text';
import Settings from '../settings/Settings';
import WORDS_EVENTS from '../observer/WordsEvents';
import eventObserver from '../observer/Observer';

function createDictionaryWords(words) {
	const newElem = new DOMElementCreator();
	const categoryWords = words.map(wordData => {
		const word = newElem.create({
			elem: TAGS.SPAN,
			classes: ['word__word'],
			child: [wordData.word],
		});

		const audio = newElem.create({
			elem: TAGS.AUDIO,
			classes: ['word__audio'],
			attr: [{
				src: wordData.audio,
				'data-settings': 'playWord',
			}, ],
		});

		const transcription = newElem.create({
			elem: TAGS.SPAN,
			classes: ['word__transcription'],
			attr: [{
				'data-settings': 'transcription',
			}, ],
			child: [wordData.transcription],
		});

		const translate = newElem.create({
			elem: TAGS.SPAN,
			classes: ['word__trarnslate'],
			attr: [{
				'data-settings': 'translate',
			}, ],
			child: [wordData.translate],
		});

		const image = newElem.create({
			elem: TAGS.IMG,
			classes: ['word__image'],
			attr: [{
				src: wordData.image,
				alt: wordData.word,
				'data-settings': 'picture',
			}, ],
		});

		const meaning = newElem.create({
			elem: TAGS.SPAN,
			classes: ['word__meaning'],
			attr: [{
				'data-settings': 'meaning',
			}, ],
			child: [wordData.textMeaning],
		});

		const meaningAudio = newElem.create({
			elem: TAGS.AUDIO,
			classes: ['word__meaning-audio'],
			attr: [{
				src: wordData.meaningAudio
			}],
		});

		const meaningTranslate = newElem.create({
			elem: TAGS.SPAN,
			classes: ['word__meaning-translate'],
			attr: [{
				'data-settings': 'meaningTranslate',
			}, ],
			child: [wordData.textMeaningTranslate],
		});

		const example = newElem.create({
			elem: TAGS.SPAN,
			classes: ['word__example'],
			attr: [{
				'data-settings': 'example',
			}, ],
			child: [wordData.example],
		});

		const exampleAudio = newElem.create({
			elem: TAGS.AUDIO,
			classes: ['word__example-audio'],
			attr: [{
				src: wordData.exampleAudio
			}],
		});

		const exampleTranslate = newElem.create({
			elem: TAGS.SPAN,
			classes: ['word__example-translate'],
			attr: [{
				'data-settings': 'exampleTranslate',
			}, ],
			child: [wordData.example],
		});

		const progress = newElem.create({
			elem: TAGS.SPAN,
			classes: ['word__progress'],
			child: [wordData.optional.progress],
		});

		const showedCount = newElem.create({
			elem: TAGS.SPAN,
			classes: ['word__showed-count'],
			child: [wordData.optional.showedCount],
		});

		const showedDate = newElem.create({
			elem: TAGS.SPAN,
			classes: ['word__showed-date'],
			child: [wordData.optional.showedDate],
		});

		const nextShowDate = newElem.create({
			elem: TAGS.SPAN,
			classes: ['word__showed-date'],
			child: [wordData.optional.nextShowDate],
		});

		const optionalData = newElem.create({
			elem: TAGS.DIV,
			classes: ['word__optional'],
			child: [progress, showedCount, showedDate, nextShowDate],
		});

		const container = newElem.create({
			elem: TAGS.DIV,
			classes: ['category__word'],
			child: [word,
				audio,
				transcription,
				translate,
				image,
				meaning,
				meaningAudio,
				meaningTranslate,
				example,
				exampleAudio,
				exampleTranslate,
				optionalData
			],
		});
		return container;
	});

	const arr = [].slice.call(categoryWords);
	const category = newElem.create({
		elem: TAGS.DIV,
		classes: ['category__container'],
		child: arr,
	});
	return category;
}

async function updateWordViewWithUserSettings() {
	const settings = await Settings.getInstance();
	const wordsData = document.querySelectorAll('[data-settings]');
	wordsData.forEach(prop => {
		const attr = prop.getAttribute('data-settings');
		if (settings[attr] === false) {
			prop.classList.add('none');
		}
	});
}

function addRecoverButtonsToWords(categoryName, objWord) {
	const newElem = new DOMElementCreator();
	if (categoryName === CATEGORIES.REMOVED || categoryName === CATEGORIES.DIFFICULT) {
		document.querySelectorAll('.category__word').forEach((word, i) => {
			const recoverRemovedWordButton = newElem.create({
				elem: TAGS.BUTTON,
				id: 'recover-removed-word',
				classes: ['word__recover'],
				child: DICTIONARY_BUTTONS.RECOVER,
			});
			const recoverWordEvent = new CustomEvent(
				WORDS_EVENTS.RECOVER_WORD, {
					detail: objWord[i],
				}
			);
			recoverRemovedWordButton.addEventListener('click', () => {
				recoverRemovedWordButton.dispatchEvent(recoverWordEvent);
				eventObserver.call(recoverWordEvent);
				// eventObserver.unsubscribe.bind(eventObserver)(recoverWordEvent);
			});
			word.append(recoverRemovedWordButton);
		});
	}
}

export default function showWordsCategory(categoryName) {
	new Promise(resolve => {
		const words = APIMethods.getUserWordsByCategory(categoryName);
		resolve(words);
	})
		.then(words => {
			const category = createDictionaryWords(words);
			const categoryContainer = document.querySelector('.dictionary__category');
			if (categoryContainer.firstChild) {
				categoryContainer.firstChild.remove();
			}
			categoryContainer.append(category);
			addRecoverButtonsToWords(categoryName, words);
			updateWordViewWithUserSettings();
		});
}
