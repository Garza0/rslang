import DOMElementCreator from '../utils/DOMElementCreator';
import TAGS from '../shared/Tags.json';
import {arrayWithWords, NUMBER_OF_WORDS} from './consts';

export default function createElements() {
	const creator = new DOMElementCreator();
	const main = document.querySelector('.info-wrapper');
	let numberOfWords = NUMBER_OF_WORDS;
	if (arrayWithWords.length < NUMBER_OF_WORDS) {
		numberOfWords = arrayWithWords.length;
	}
	const answersContainer = creator.create({
		elem: TAGS.DIV,
		classes: 'answers'
	});
	for (let i = 0; i < numberOfWords; i += 1) {
		const wordTranslation = creator.create({
			elem: TAGS.P,
			classes: 'answer',
			child: `${arrayWithWords[i].translate}`
		});
		answersContainer.append(wordTranslation);
		main.append(answersContainer);
	}
}
