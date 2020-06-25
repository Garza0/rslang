import DOMElementCreator from '../utils/DOMElementCreator';
import {
	TEXT_EXAMPLE_OPEN_TAG,
	TEXT_EXAMPLE_CLOSE_TAG,
	TEXT_MEANING_OPEN_TAG,
	TEXT_MEANING_CLOSE_TAG,
	INPUT_ID,
	HIDDEN_CLASS,
} from './CardConstants';
import { BUTTONS_WORDS } from '../shared/Text';
import TAGS from '../shared/Tags.json';
import WORDS_EVENTS from '../observer/WordsEvents';

const fab = new DOMElementCreator();

export default class Card {
	constructor(word) {
		this.card = word;
	}

	static getObjectOfTextExample(text) {
		const obj = {};
		[obj.first, obj.word] = text.split(TEXT_EXAMPLE_OPEN_TAG);
		[obj.word, obj.last] = obj.word.split(TEXT_EXAMPLE_CLOSE_TAG);
		return obj;
	}

	static getObjectOfTextMeaning(text) {
		const obj = {};
		[obj.first, obj.word] = text.split(TEXT_MEANING_OPEN_TAG);
		[obj.word, obj.last] = obj.word.split(TEXT_MEANING_CLOSE_TAG);
		return obj;
	}

	static getTextMeaning(text) {
		const textMeaningObject = Card.getObjectOfTextMeaning(text);

		const textPartLeft = fab.create({
			elem: TAGS.SPAN,
			classes: 'card__meaning_part',
			id: 'meaning-part-first',
			child: textMeaningObject.first,
		});

		const textPartRight = fab.create({
			elem: TAGS.SPAN,
			classes: 'card__meaning_part',
			id: 'meaning-part-last',
			child: textMeaningObject.last,
		});

		const textWord = fab.create({
			elem: TAGS.SPAN,
			classes: 'card__meaning_word',
			id: 'meaning-part-word',
			child: textMeaningObject.word,
		});

		const textMeaning = fab.create({
			elem: TAGS.DIV,
			classes: 'card__text',
			id: 'text-meaning',
			child: [textPartLeft, textWord, textPartRight],
		});

		return textMeaning;
	}

	correctAnswerHandler() {
		console.log('correct answer');
		const currentWord = this.card;
		const correctEvent = new CustomEvent(WORDS_EVENTS.CORRECT_ANSWER, {
			detail: currentWord,
		});
		document.dispatchEvent(correctEvent);
	}

	errorAnswerHandler() {
		console.log('error answer');
		const currentWord = this.card;
		const correctEvent = new CustomEvent(WORDS_EVENTS.INCORRECT_ANSWER, {
			detail: currentWord,
		});
		document.dispatchEvent(correctEvent);
	}

	isCorrectReaction() {
		const isCorrectAnswer = this.isCorrect();
		if (isCorrectAnswer) {
			this.correctAnswerHandler();
		} else {
			this.errorAnswerHandler();
		}
	}

	create() {
		this.elem = document.createDocumentFragment();

		const img = fab.create({
			elem: TAGS.IMG,
			id: 'image-card-example',
			attr: [{ src: this.card.image }, { alt: this.card.word }],
		});

		const imgContainer = fab.create({
			elem: TAGS.DIV,
			classes: 'card__image',
			child: img,
		});

		const transcription = fab.create({
			elem: TAGS.DIV,
			classes: ['card__text', 'card__text_transcription'],
			id: 'transcription',
			child: this.card.transcription,
		});

		const wordTranslate = fab.create({
			elem: TAGS.DIV,
			classes: ['card__text', 'card__text_translate'],
			id: 'word-translate',
			child: this.card.translate,
		});

		const textExampleTranslate = fab.create({
			elem: TAGS.DIV,
			classes: ['card__text', HIDDEN_CLASS],
			id: 'text-example-translate',
			child: this.card.exampleTranslate,
		});

		const textMeaning = Card.getTextMeaning(this.card.textMeaning);

		const textMeaningTranslate = fab.create({
			elem: TAGS.DIV,
			classes: ['card__text', HIDDEN_CLASS],
			id: 'text-meaning-translate',
			child: this.card.textMeaningTranslate,
		});

		const textExampleObject = Card.getObjectOfTextExample(this.card.example);

		const textPartLeft = fab.create({
			elem: TAGS.SPAN,
			classes: 'card__text_part',
			id: 'example-part-first',
			child: textExampleObject.first,
		});

		const textPartRight = fab.create({
			elem: TAGS.SPAN,
			classes: 'card__text_part',
			id: 'example-part-last',
			child: textExampleObject.last,
		});

		const letters = textExampleObject.word.split('').map((letter) =>
			fab.create({
				elem: TAGS.SPAN,
				classes: 'card__text_letter',
				child: letter,
			})
		);

		const textWord = fab.create({
			elem: TAGS.SPAN,
			classes: ['card__text_word', 'card__text_answer', HIDDEN_CLASS],
			id: 'example-part-word',
			attr: [{ 'data-word': textExampleObject.word }],
			child: letters,
		});

		const textInput = fab.create({
			elem: TAGS.INPUT,
			classes: 'card__text_input',
			id: INPUT_ID,
			attr: [{ type: 'text' }, { name: 'input' } ],
			name: INPUT_ID,
		});

		const inputContainer = fab.create({
			elem: TAGS.DIV,
			classes: ['card__text_container'],
			child: [textWord, textInput],
		});

		const textExample = fab.create({
			elem: TAGS.DIV,
			classes: 'card__text',
			id: 'text-example',
			child: [textPartLeft, inputContainer, textPartRight],
		});

		const againButton = fab.create({
			elem: TAGS.BUTTON,
			classes: 'button',
			id: 'again-word-button',
			attr: [{ type: 'button' }],
			child: BUTTONS_WORDS.again,
		});

		const currentWord = this.card;

		const againButtonEvent = new CustomEvent(WORDS_EVENTS.PUSHED_AGAIN, {
			detail: currentWord,
		});

		const hardButton = fab.create({
			elem: TAGS.BUTTON,
			classes: 'button',
			id: 'hard-word-button',
			attr: [{ type: 'button' }],
			child: BUTTONS_WORDS.hard,
		});

		const hardButtonEvent = new CustomEvent(WORDS_EVENTS.PUSHED_HARD, {
			detail: currentWord,
		});

		const goodButton = fab.create({
			elem: TAGS.BUTTON,
			classes: 'button',
			id: 'good-word-button',
			attr: [{ type: 'button' }],
			child: BUTTONS_WORDS.good,
		});

		const goodButtonEvent = new CustomEvent(WORDS_EVENTS.PUSHED_GOOD, {
			detail: currentWord,
		});

		const easyButton = fab.create({
			elem: TAGS.BUTTON,
			classes: 'button',
			id: 'easy-word-button',
			attr: [{ type: 'button' }],
			child: BUTTONS_WORDS.easy,
		});

		const easyButtonEvent = new CustomEvent(WORDS_EVENTS.PUSHED_EASY, {
			detail: currentWord,
		});

		const buttonGroupComplexity = fab.create({
			elem: TAGS.DIV,
			classes: ['button-group', 'button-group__complexity', /* HIDDEN_CLASS */ ],
			child: [againButton, hardButton, goodButton, easyButton],
		});

		const addToDifficultButton = fab.create({
			elem: TAGS.BUTTON,
			classes: 'button',
			id: 'add-to-difficult-button',
			attr: [{ type: 'button' }],
			child: BUTTONS_WORDS.addToDifficult,
		});

		const addToEasyButtonEvent = new CustomEvent(
			WORDS_EVENTS.PUSHED_ADD_TO_DIFFICULT,
			{ detail: currentWord }
		);
		addToDifficultButton.addEventListener('click', () =>
			addToDifficultButton.dispatchEvent(addToEasyButtonEvent)
		);

		const deleteFromDictionaryButton = fab.create({
			elem: TAGS.BUTTON,
			classes: 'button',
			id: 'delete-from-dictionary-button',
			attr: [{ type: 'button' }],
			child: BUTTONS_WORDS.deleteFromDictionary,
		});

		const deleteFromDictionaryEvent = new CustomEvent(
			WORDS_EVENTS.PUSHED_REMOVE_FROM_DICTIONARY,
			{ detail: currentWord }
		);

		deleteFromDictionaryButton.addEventListener('click', () =>
			deleteFromDictionaryButton.dispatchEvent(deleteFromDictionaryEvent)
		);

		const buttonGroupDictionary = fab.create({
			elem: TAGS.DIV,
			classes: ['button-group', 'button-group__dictionary'],
			child: [addToDifficultButton, deleteFromDictionaryButton],
		});

		const showAnswerButton = fab.create({
			elem: TAGS.BUTTON,
			classes: 'button',
			id: 'show-answer-button',
			attr: [{ type: 'button' }],
			child: BUTTONS_WORDS.showAnswer,
		});

		const continueButton = fab.create({
			elem: TAGS.BUTTON,
			classes: 'button',
			id: 'continue-button',
			attr: [{ type: 'button' }],
			child: BUTTONS_WORDS.continue,
		});

		const continueButtonEvent = new CustomEvent(WORDS_EVENTS.CORRECT_ANSWER, {
			detail: currentWord,
		});

		const showAnswerButtonEvent = new CustomEvent(
			WORDS_EVENTS.PUSHED_SHOW_ANSWER_BUTTON,
			{ detail: currentWord }
		);

		const buttonGroupShowAnswer = fab.create({
			elem: TAGS.DIV,
			classes: ['button-group', 'button-group__answer'],
			child: [showAnswerButton, continueButton],
		});

		const audioWord = fab.create({
			elem: TAGS.AUDIO,
			id: 'audio-word',
			attr: [{ src: this.card.audio }],
		});

		const audioMeaning = fab.create({
			elem: TAGS.AUDIO,
			id: 'audio-meaning',
			attr: [{ src: this.card.meaningAudio }],
		});

		const audioExample = fab.create({
			elem: TAGS.AUDIO,
			id: 'audio-example',
			attr: [{ src: this.card.exampleAudio }],
		});

		const card = fab.create({
			elem: TAGS.FORM,
			classes: 'card',
			id: 'card-container',
			child: [
				imgContainer,
				transcription,
				wordTranslate,
				audioWord,
				textExample,
				textExampleTranslate,
				audioExample,
				textMeaning,
				textMeaningTranslate,
				audioMeaning,
				buttonGroupComplexity,
				buttonGroupDictionary,
				buttonGroupDictionary,
				buttonGroupShowAnswer,
			],
		});

		const submitEvent = new Event('submit');

		card.addEventListener('submit', (event) => {
			event.preventDefault();
			this.isCorrectReaction();
		});

		showAnswerButton.addEventListener('click', () => {
			showAnswerButton.dispatchEvent(showAnswerButtonEvent);
			textInput.value = textWord.innerText;
		});

		continueButton.addEventListener('click', () => {
			continueButton.dispatchEvent(continueButtonEvent);
			card.dispatchEvent(submitEvent);
		});

		easyButton.addEventListener('click', () => {
			easyButton.dispatchEvent(easyButtonEvent);
			card.dispatchEvent(submitEvent);
		});

		goodButton.addEventListener('click', () => {
			goodButton.dispatchEvent(goodButtonEvent);
			card.dispatchEvent(submitEvent);
		});

		againButton.addEventListener('click', () => {
			againButton.dispatchEvent(againButtonEvent);
			document.dispatchEvent(againButtonEvent);
			card.dispatchEvent(submitEvent);
		});

		hardButton.addEventListener('click', () => {
			hardButton.dispatchEvent(hardButtonEvent);
			card.dispatchEvent(submitEvent);
		});

		this.elem = card;
		return this.elem;
	}

	static makeStringComparable(str) {
		return str.trim().toUpperCase();
	}

	isCorrect() {
		const value = Card.makeStringComparable(
			this.elem.querySelector('#word').value
		);
		const answer = Card.makeStringComparable(
			this.elem.querySelector('#example-part-word').innerText
		);
		return value === answer;
	}
}
