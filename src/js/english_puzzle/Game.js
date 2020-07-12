import { appContainer, rounds, levels, lines, API_URL, puzzlesGap, RESULT_WINDOW_BTN_CONTINUE, PICTURE_HEIGHT, PICTURE_WIDTH } from './constants';
import paintings from './paintingsData';
import DOMElementCreator from '../utils/DOMElementCreator';
import Result from '../game_result/Result';
import TAGS from '../shared/Tags.json';
import GameField from './GameField';
import Hints from './Hints';
import LevelSelect from './LevelSelect';
import Tooltips from './Tooltips';

const gameField = new GameField();
const hints = new Hints();
const levelSelect = new LevelSelect();
const tooltips = new Tooltips();
const result = new Result();
const factory = new DOMElementCreator();

export default class Game {
	constructor() {
		this.initState = JSON.parse(sessionStorage.getItem('en-puzzle-state')) || {};
		this.sentenceArr = [];
		this.sentenceTranslate = '';
		this.sentenceAudioLink = '';
		this.autoListeningBtnState = this.initState.auto || false;
		this.showTranslationBtnState = this.initState.translation || false;
		this.showListenBtnState = this.initState.audio || false;
		this.showBgImageBtnState = this.initState.picture || false;
		this.currentLine = 0;
		this.currentRound = this.initState.round || 0;
		this.currentLevel = this.initState.level || 0;
		this.sentencesJSON = {};
		this.eventListenersAddedState = false;
		this.numberOfPuzzles = 0;
		this.activePuzzleContainers = [];
		this.cypher = [];
		this.wrongAnswersResult = [];
		this.rightAnswersResult = [];
		this.currentLineSentenceObj = {};
		this.resultForCurrentLineState = false;
	}

	addEventListenersToControls() {
		this.eventListenersAddedState = true;
		this.autoListeningBtn = document.querySelector('.controls__auto-listening');
		this.showTranslationBtn = document.querySelector('.controls__translation');
		this.showListenBtn = document.querySelector('.controls__listening');
		this.showBgImageBtn = document.querySelector('.controls__background');
		this.playAudioBtn = document.querySelector('.tooltips__play');
		this.translationContainer = document.querySelector('.tooltips__translate');
		this.iDontKnowBtn = document.querySelector('.controls__btn-i-dont-know');
		this.checkBtn = document.querySelector('.controls__btn-check');
		this.continueBtn = document.querySelector('.controls__btn-continue');
		this.resulsBtn = document.querySelector('.controls__btn-results');
		this.levelSelectBtn = document.querySelector('.controls__dropdown-level');
		this.roundSelectBtn = document.querySelector('.controls__dropdown-round');

		this.autoListBtnHand = this.autoListeningBtnHandler.bind(this);
		this.autoListeningBtn.addEventListener('click', this.autoListBtnHand);

		this.showTransBtnHand = this.showTranslationBtnHandler.bind(this);
		this.showTranslationBtn.addEventListener('click', this.showTransBtnHand);

		this.showListenBtnHand = this.showListeningBtnHandler.bind(this);
		this.showListenBtn.addEventListener('click', this.showListenBtnHand);

		this.playCurrentAudio = this.playAudio.bind(this);
		this.playAudioBtn.addEventListener('click', this.playCurrentAudio);

		this.checkBtnHand = this.checkBtnHandler.bind(this);
		this.checkBtn.addEventListener('click', this.checkBtnHand);

		this.dontKnowBtnHand = this.iDontKnowBtnHandler.bind(this);
		this.iDontKnowBtn.addEventListener('click', this.dontKnowBtnHand);

		this.continueBtnHand = this.continueBtnHandler.bind(this);
		this.continueBtn.addEventListener('click', this.continueBtnHand);

		this.resultsBtnHand = this.resultsBtnHandler.bind(this);
		this.resulsBtn.addEventListener('click', this.resultsBtnHand);

		this.levelSelectBtnHand = this.levelSelectBtnHandler.bind(this);
		this.levelSelectBtn.addEventListener('change', this.levelSelectBtnHand);

		this.roundSelectBtnHand = this.roundSelectBtnHandler.bind(this);
		this.roundSelectBtn.addEventListener('change', this.roundSelectBtnHand);

		this.showHideBg = this.showHideBackground.bind(this);
		this.showBgImageBtn.addEventListener('click', this.showHideBg);

		this.addEventListenerForWindowResize();
	}

	addEventListenerForWindowResize() {
		this.windowResizeHand = this.windowResizeHandler.bind(this);
		window.addEventListener('resize', this.windowResizeHand);
	}

	windowResizeHandler() {
		console.log(this.cypher);
		this.puzzlesHomeContainer = document.querySelector('.game__puzzles');
		if (this.homeWidth !== this.puzzlesHomeContainer.offsetWidth) {
			this.homeWidth = this.puzzlesHomeContainer.offsetWidth;
			const puzzlesInLines = [];
			const activePuzzles = document.querySelectorAll('.game__jigsaw--active');
			const boardLines = document.querySelectorAll('.board__line');
			boardLines.forEach(line => {
				const puzzlesInLine = line.querySelectorAll('.game__jigsaw');
				if (puzzlesInLine.length > 0) {
					if (!puzzlesInLine[0].classList.contains('game__jigsaw--active')) {
						puzzlesInLines.push(puzzlesInLine);
					}
				}
			});
			const allPuzzlesOnPage = puzzlesInLines;
			if (activePuzzles.length > 0) {
				allPuzzlesOnPage.push(activePuzzles);
			}
			allPuzzlesOnPage.forEach(line => {
				this.calculatePuzzlesSize(line);
				this.calculateBackgroundPosition(line);
			});
		}
	}

	removeEventListeners() {
		this.autoListeningBtn.removeEventListener('click', this.autoListBtnHand);
		this.showTranslationBtn.removeEventListener('click', this.showTransBtnHand);
		this.showListenBtn.removeEventListener('click', this.showListenBtnHand);
		this.checkBtn.removeEventListener('click', this.checkBtnHand);
		this.iDontKnowBtn.removeEventListener('click', this.dontKnowBtnHand);
		this.continueBtn.removeEventListener('click', this.continueBtnHand);
		this.resulsBtn.removeEventListener('click', this.resultsBtnHand);
		this.showBgImageBtn.removeEventListener('click', this.showHideBg);
		this.levelSelectBtn.removeEventListener('change', this.levelSelectBtnHand);
		this.roundSelectBtn.removeEventListener('change', this.roundSelectBtnHand);
	}

	saveStateToSessionStorage() {
		const stateObj = {
			'level': this.currentLevel,
			'round': this.currentRound,
			'auto': this.autoListeningBtnState,
			'translation': this.showTranslationBtnState,
			'audio': this.showBgImageBtnState,
			'picture': this.showBgImageBtnState
		};
		sessionStorage.setItem('en-puzzle-state', JSON.stringify(stateObj));
	}

	controlsStateUpgrade() {
		this.levelSelectBtn.selectedIndex = this.currentLevel;
		this.roundSelectBtn.selectedIndex = this.currentRound;
		if (this.initState.auto) {
			this.autoListeningBtn.classList.add('btn-icon--active');
		}
		if (this.initState.translation) {
			this.showTranslationBtn.classList.add('btn-icon--active');
			this.translationContainer.innerText = this.sentenceTranslate;
		}
		if (this.initState.audio) {
			this.showListenBtn.classList.add('btn-icon--active');
		}
		if (this.initState.picture) {
			this.showBgImageBtn.classList.add('btn-icon--active');
		}
	}

	levelSelectBtnHandler(event) {
		const level = +event.target.value - 1;
		this.loadCustomLevelAndRound(level, this.currentRound);
	}

	roundSelectBtnHandler(event) {
		const round = +event.target.value - 1;
		this.loadCustomLevelAndRound(this.currentLevel, round);
	}

	continueBtnHandler() {
		this.currentLine += 1;
		this.puzzlesInActiveLine.forEach(puzzle => puzzle.removeEventListener('mouseup', this.puzzlesAtHomeHand));
		this.currentActiveLine = document.querySelector('.board__line--active');
		this.currentActiveLine.classList.remove('board__line--active');
		this.currentActiveElements = document.querySelectorAll('.game__jigsaw--active');
		this.currentActiveElements.forEach(element => {
			element.removeAttribute('draggable');
			element.classList.remove('game__jigsaw--active', 'game__jigsaw--correct', 'game__jigsaw--wrong');
		});
		this.puzzleContainer = document.querySelectorAll('.puzzle-container--active');
		this.puzzleContainer.forEach(element => element.classList.remove('puzzle-container--active'));
		this.iDontKnowBtn.classList.remove('none');
		this.continueBtn.classList.add('none');
		if (this.currentLine < lines) {
			this.addLine();
			this.currentLineSentenceObj = this.sentencesJSON[this.currentLine];
			this.sentenceTranslate = this.sentencesJSON[this.currentLine].textExampleTranslate;
			this.sentenceAudioLink = this.sentencesJSON[this.currentLine].audioExample;
			this.getSentences(this.sentencesJSON, this.currentLine);
		} else {
			this.loadNextRound();
		}
	}

	loadNextRound() {
		if (this.currentRound + 1 < rounds) {
			this.clearField();
			this.addLine();
			this.currentLine = 0;
			this.currentRound += 1;
			this.roundSelectBtn.selectedIndex = this.currentRound;
			this.cypher = [];
			this.wrongAnswersResult = [];
			this.rightAnswersResult = [];
			this.resulsBtn.classList.add('none');
			this.continueBtn.classList.add('none');
			this.getData();
			this.iDontKnowBtn.classList.remove('none');
		} else {
			this.loadNextLevel();
		}
	}

	loadNextLevel() {
		if (this.currentLevel + 1 < levels) {
			this.clearField();
			this.addLine();
			this.currentLine = 0;
			this.currentRound = 0;
			this.currentLevel += 1;
			this.roundSelectBtn.selectedIndex = this.currentRound;
			this.levelSelectBtn.selectedIndex = this.currentLevel;
			this.cypher = [];
			this.wrongAnswersResult = [];
			this.rightAnswersResult = [];
			this.resulsBtn.classList.add('none');
			this.getData();

		} else {
			console.log('finish');

		}
	}

	resultsBtnHandler() {
		this.saveStateToSessionStorage();

		const resultContinueBtn = factory.create({
			elem: TAGS.BUTTON,
			classes: ['result__button', 'result__continue-btn'],
			child: RESULT_WINDOW_BTN_CONTINUE
		});

		resultContinueBtn.addEventListener('click', () => {
			result.closeResultWindow();
			this.loadNextRound();
		});

		result.showResult({
			rightAnswersSentences: this.rightAnswersResult,
			wrongAnswersSentences: this.wrongAnswersResult,
			buttons: [resultContinueBtn]
		});
	}

	loadCustomLevelAndRound(level, round) {
		this.cypher = [];
		this.wrongAnswersResult = [];
		this.rightAnswersResult = [];
		this.currentLevel = level;
		this.currentRound = round;
		this.clearField();
		this.clearPuzzlesContainer();
		this.addLine();
		this.currentLine = 0;
		this.iDontKnowBtn.classList.remove('none');
		this.checkBtn.classList.add('none');
		this.continueBtn.classList.add('none');
		this.resulsBtn.classList.add('none');
		this.getData(level, round);
		this.roundSelectBtn.selectedIndex = this.currentRound;


	}

	clearPuzzlesContainer() {
		this.puzzlesBottomContainer = document.querySelector('.game__puzzles');
		while (this.puzzlesBottomContainer.firstChild) {
			this.puzzlesBottomContainer.removeChild(this.puzzlesBottomContainer.firstChild);
		}
	}

	clearField() {
		this.board = document.querySelector('.board');
		while (this.board.firstChild) {
			this.board.removeChild(this.board.firstChild);
		}
	}

	iDontKnowBtnHandler() {
		if (this.resultForCurrentLineState === false) {
			this.wrongAnswersResult.push(this.currentLineSentenceObj);
			this.resultForCurrentLineState = true;
		}
		this.activePuzzles = document.querySelectorAll('.game__jigsaw--active');
		this.activePuzzleContainers = document.querySelectorAll('.puzzle-container--active');
		this.activePuzzleContainers.forEach(container => {
			const curContainer = container;
			curContainer.style.width = null;
			curContainer.classList.remove('puzzle-container--active');
		});
		const puzzleNodes = [];
		this.activePuzzles.forEach(puzzle => {
			puzzle.classList.remove('game__jigsaw--active');
			puzzle.removeAttribute('draggable');
			puzzle.classList.remove('game__jigsaw--wrong', 'game__jigsaw--correct');
			puzzleNodes.push(puzzle);
			puzzle.remove();
		});
		this.iDontKnowBtn.classList.add('none');
		this.checkBtn.classList.add('none');
		this.continueBtn.classList.remove('none');
		this.appendPuzzlesToFieldLine(this.sortPuzzles(puzzleNodes));
		this.updatePuzzlesAtActiveLine();
		if (this.currentLine === 9) {
			this.resulsBtn.classList.remove('none');
		}
	}

	sortPuzzles(puzzles) {
		const sorted = [];
		puzzles.forEach(puzzle => {
			sorted[this.cypher[+puzzle.dataset.line][0].indexOf(+puzzle.dataset.positionCrypted)] = puzzle;
		});
		return sorted;
	}

	checkBtnHandler() {
		this.currentLineElements = [...this.boardLine.children].map(i => i.children[0]);
		this.currentLineWords = [];
		for (let i = 0; i < this.sentenceArr.length; i += 1) {
			this.currentLineWords.push(this.boardLine.children[i].children[0].dataset.word);
		}
		this.checkedArr = this.compareTwoSameLengthArraysAndReturnArrayOfBoolean(this.currentLineWords, this.sentenceArr);
		this.showWrongAndRightAnswers(this.currentLineElements, this.checkedArr);
	}

	appendPuzzlesToFieldLine(sortedPuzzles) {
		this.activeFieldLineContainers = document.querySelector('.board__line--active').children;
		for (let i = 0; i < sortedPuzzles.length; i += 1) {
			this.activeFieldLineContainers[i].append(sortedPuzzles[i]);
		}
	}

	playAudio() {
		this.audio = new Audio(`https://raw.githubusercontent.com/garza0/rslang-data/master/${this.sentenceAudioLink}`);
		this.audio.play();
	}

	showListeningBtnHandler() {
		this.showListenBtnState = !this.showListenBtnState;
		this.showListenBtn.classList.toggle('btn-icon--active');

		if (this.showListenBtnState) {
			this.playAudioBtn.removeAttribute('disabled');
		} else {
			this.playAudioBtn.setAttribute('disabled', true);
		}
	}

	showTranslationBtnHandler() {
		this.showTranslationBtnState = !this.showTranslationBtnState;
		this.showTranslationBtn.classList.toggle('btn-icon--active');
		if (this.showTranslationBtnState) {
			this.translationContainer.innerText = this.sentenceTranslate;
		} else {
			this.translationContainer.innerText = '';
		}
	}

	autoListeningBtnHandler() {
		this.autoListeningBtnState = !this.autoListeningBtnState;
		this.autoListeningBtn.classList.toggle('btn-icon--active');

	}

	getData(level = this.currentLevel, round = this.currentRound) {

		const url = `${API_URL}words?group=${level}&page=${round}&wordsPerExampleSentenceLTE=10&wordsPerPage=10`;
		fetch(url)
			.then(response => {
				return response.json();
			}).then(myJson => {
				this.handleJson(myJson);
			});
	}

	handleJson(myJson) {
		this.sentencesJSON = myJson;
		this.sentenceTranslate = myJson[0].textExampleTranslate;
		this.sentenceAudioLink = myJson[0].audioExample;
		this.getSentences(myJson, this.currentLine);
		this.controlsStateUpgrade();
	}

	getSentences(arr, line) {
		const sentencesArr = [];
		arr.forEach(word => sentencesArr.push(word.textExample.replace(/<[^>]*>/g, '')));
		this.generatePuzzle(sentencesArr[line]);
	}

	addLine() {
		this.board = document.querySelector('.board');
		this.boardLine = factory.create({
			elem: TAGS.DIV,
			classes: ['board__line', 'board__line--active'],
			attr: { 'data-line': this.currentLine }
		});
		this.lineIsFull = false;
		this.resultForCurrentLineState = false;
		this.currentActiveLine = this.boardLine;
		this.board.append(this.boardLine);

	}

	generatePuzzle(sentence) {
		const wordsArray = sentence.split(' ');
		this.sentenceArr = wordsArray;
		this.numberOfPuzzles = wordsArray.length;
		const puzzles = this.populatePuzzle(wordsArray);
		const shuffledPuzzleArr = this.shuffleArray(puzzles);
		this.appendPuzzlesToContainer(shuffledPuzzleArr);
	}

	shuffleArray(arr) {
		let counter = arr.length;
		this.arr = [...arr];
		while (counter > 0) {
			this.index = Math.floor(Math.random() * counter);
			counter -= 1;
			this.temp = this.arr[counter];
			this.arr[counter] = this.arr[this.index];
			this.arr[this.index] = this.temp;
		}

		return this.arr;
	}

	populatePuzzle(sentenceArr) {
		const cypher = this.encryptPuzzlePlace(sentenceArr.length);
		this.puzzles = sentenceArr.map((word, index) => {

			this.newElement = factory.create({
				elem: TAGS.DIV,
				classes: ['game__jigsaw', 'game__jigsaw--active'],
				attr: [{ 'data-word': word }, { 'data-position-crypted': cypher[0][index] }, { 'data-line': this.currentLine }, { 'draggable': true }],
				child: word
			});
			if (this.showBgImageBtnState) {
				this.addBackgroundToPuzzles(this.newElement);
			}

			return this.newElement;
		});
		return this.puzzles;
	}

	encryptPuzzlePlace(length) {
		const cryptArray = [];
		const arr = [];
		for (let i = 0; i < length; i += 1) {
			arr.push(i);
		}
		cryptArray.push(this.shuffleArray(arr));
		this.cypher.push(cryptArray);

		return cryptArray;

	}

	appendPuzzlesToContainer(puzzles) {
		const puzzlesContainer = document.querySelector('.game__puzzles');
		puzzlesContainer.append(...puzzles);
		this.calculatePuzzlesSize(puzzles);
		this.currentLineSentenceObj = this.sentencesJSON[this.currentLine];

		this.addPuzzleContainersToLine(puzzles.length);
		this.dragAndDrop();
		if (this.currentLine === 0 && this.eventListenersAddedState === false) {
			this.addEventListenersToControls();
		}
		if (this.autoListeningBtnState) {
			this.playAudio(this.sentenceAudioLink);
		}
		this.calculateBackgroundPosition(puzzles);
		this.addEventListenerToPuzzlesAtHome();
	}

	updateFreePuzzleContainers() {
		this.freePuzzleContainers = [];
		this.activePuzzleContainers.forEach(container => {
			if (container.classList.contains('container--full') === false) {
				this.freePuzzleContainers.push(container);
			}
		});
	}

	updatePuzzlesAtHome() {
		this.puzzlesAtHome = this.puzzlesHomeContainer.querySelectorAll('.game__jigsaw--active');

	}

	addEventListenerToPuzzlesAtHome() {
		this.updateFreePuzzleContainers();
		this.updatePuzzlesAtHome();

		this.puzzlesAtHomeHand = this.puzzlesAtHomeHandler.bind(this);
		this.puzzlesAtHome.forEach(puzzle => puzzle.addEventListener('mouseup', this.puzzlesAtHomeHand));
	}

	puzzlesAtHomeHandler(event) {
		if (event.target.closest('.game__puzzles') && event.button === 0) {
			this.updateFreePuzzleContainers();
			this.updatePuzzlesAtHome();
			const puzzleWidth = event.target.dataset.width;
			this.freePuzzleContainers[0].append(event.target);
			this.freePuzzleContainers[0].style.width = puzzleWidth;
			this.freePuzzleContainers[0].classList.add('container--full');
			this.updatePuzzlesAtActiveLine();
			this.checkIfLineIsFull();
		} else if (event.target.closest('.puzzle-container--active') && event.button === 0) {
			const currentContainer = event.target.closest('.puzzle-container--active');
			if (this.lineIsFull) {
				Game.removeCorrectAndWrongIndicatorFromPuzzles();
			}
			currentContainer.classList.remove('container--full');
			currentContainer.style.width = null;
			this.updateFreePuzzleContainers();
			this.puzzlesHomeContainer.append(event.target.closest('.game__jigsaw--active'));
			this.updatePuzzlesAtActiveLine();
			this.updatePuzzlesAtHome();
			this.checkIfLineIsFull();
		}

	}

	updatePuzzlesAtActiveLine() {
		this.puzzlesInActiveLine = this.currentActiveLine.querySelectorAll('.game__jigsaw--active');
	}



	dragAndDrop() {
		this.puzzleItem = document.querySelectorAll('.game__jigsaw--active');
		this.activePuzzleContainers = document.querySelectorAll('.puzzle-container--active');
		this.puzzlesField = document.querySelector('.game__puzzles');
		this.selectedItem = '';
		let selectedItemWidth;

		const dragStart = (event) => {
			this.selectedItem = event.target.closest('.game__jigsaw--active');
			selectedItemWidth = this.selectedItem.dataset.width;


			if (event.target.closest('.puzzle-container--active')) {
				const container = event.target.closest('.puzzle-container--active');
				container.classList.remove('container--full');
				container.style.width = null;
			}

			setTimeout(() => {
				this.selectedItem.classList.add('none');
			}, 0);
		};

		const dragEnd = (event) => {
			event.target.classList.remove('none');
		};

		const dragOver = (event) => {
			event.preventDefault();
		};

		const dragEnter = (event) => {
			event.preventDefault();

			if (event.target.classList.contains('puzzle-container--active') || event.target.classList.contains('game__puzzles')) {
				event.target.classList.add('hovered');
				if (event.target.classList.contains('puzzle-container--active')) {
					event.target.classList.add('hovered--animation');
				}
			}
		};

		const dragLeave = (event) => {

			event.target.classList.remove('hovered', 'hovered--animation');
		};

		const dragDrop = (event) => {
			const targetContainer = event.target;
			if (targetContainer.classList.contains('puzzle-container--active') || targetContainer.closest('.game__puzzles')) {
				this.updatePuzzlesAtActiveLine();
				if (targetContainer.closest('.game__puzzles')) {
					this.puzzlesHomeContainer.append(this.selectedItem);
					if (this.lineIsFull) {
						Game.removeCorrectAndWrongIndicatorFromPuzzles();
					}
				} else {
					targetContainer.append(this.selectedItem);
				}
				targetContainer.classList.remove('hovered', 'hovered--animation');
				if (targetContainer.classList.contains('puzzle-container--active')) {
					targetContainer.classList.add('container--full');
					targetContainer.style.width = selectedItemWidth;
				}
				this.checkIfLineIsFull();

			}
		};

		this.activePuzzleContainers.forEach(cell => {
			cell.addEventListener('dragover', dragOver);
			cell.addEventListener('dragenter', dragEnter);
			cell.addEventListener('dragleave', dragLeave);
			cell.addEventListener('drop', dragDrop);
		});

		this.puzzlesField.addEventListener('dragover', dragOver);
		this.puzzlesField.addEventListener('dragenter', dragEnter);
		this.puzzlesField.addEventListener('dragleave', dragLeave);
		this.puzzlesField.addEventListener('drop', dragDrop);


		this.puzzleItem.forEach(item => item.addEventListener('dragstart', dragStart));
		this.puzzleItem.forEach(item => item.addEventListener('dragend', dragEnd));
	}

	static removeCorrectAndWrongIndicatorFromPuzzles() {
		document.querySelectorAll('.game__jigsaw--active').forEach(puzzle => puzzle.classList.remove('game__jigsaw--correct', 'game__jigsaw--wrong'));
	}



	checkIfLineIsFull() {
		this.numberOfFullContainers = 0;
		this.activePuzzleContainers.forEach(container => {
			if (container.classList.contains('container--full')) {
				this.numberOfFullContainers += 1;
			}
		});
		if (this.numberOfFullContainers === this.numberOfPuzzles) {
			this.lineIsFullHandler();

		} else {
			this.checkBtn.classList.add('none');
			this.lineIsFull = false;
		}

	}

	lineIsFullHandler() {
		this.lineIsFull = true;
		this.checkBtn.classList.remove('none');
	}

	addPuzzleContainersToLine(numberOfPuzzles) {
		this.arrOfPuzzleContainer = [];
		for (let i = 0; i < numberOfPuzzles; i += 1) {
			this.arrOfPuzzleContainer.push(
				factory.create({
					elem: TAGS.DIV,
					classes: ['puzzle-container', 'puzzle-container--active'],
					attr: { 'data-container-position': i }
				})
			);
		}
		this.boardLine.append(...this.arrOfPuzzleContainer);
	}

	showWrongAndRightAnswers(currentLineElements, arrOfBoolean) {
		this.rightAnswers = 0;
		for (let i = 0; i < currentLineElements.length; i += 1) {
			currentLineElements[i].classList.remove('game__jigsaw--correct', 'game__jigsaw--wrong');
			if (arrOfBoolean[i]) {
				this.rightAnswers += 1;
				currentLineElements[i].classList.add('game__jigsaw--correct');
			} else {
				currentLineElements[i].classList.add('game__jigsaw--wrong');
			}
		}
		if (this.rightAnswers === currentLineElements.length) {
			this.allIsRightHandler();
		} else {
			this.notAllIsRigthHandler();
		}
	}

	notAllIsRigthHandler() {
		if (this.resultForCurrentLineState === false) {
			this.wrongAnswersResult.push(this.currentLineSentenceObj);
			this.resultForCurrentLineState = true;
		}
	}

	allIsRightHandler() {
		if (this.resultForCurrentLineState === false) {
			this.rightAnswersResult.push(this.currentLineSentenceObj);
			this.resultForCurrentLineState = true;
		}
		if (this.currentLine < 10) {
			this.iDontKnowBtn.classList.add('none');
			this.checkBtn.classList.add('none');
			this.continueBtn.classList.remove('none');
			if (this.currentLine === rounds - 1) {
				this.resulsBtn.classList.remove('none');
			}
		}
	}

	compareTwoSameLengthArraysAndReturnArrayOfBoolean(arr1, arr2) {
		this.arrayOfBoolean = [];
		for (let i = 0; i < arr1.length; i += 1) {
			if (arr1[i] === arr2[i]) {
				this.arrayOfBoolean.push(true);
			} else {
				this.arrayOfBoolean.push(false);
			}
		}
		return this.arrayOfBoolean;
	}

	init() {

		this.controlsContainer = factory.create({
			elem: TAGS.DIV,
			classes: 'controls'
		});
		this.tooltips = factory.create({
			elem: TAGS.DIV,
			classes: 'tooltips'
		});
		this.gameBoard = factory.create({
			elem: TAGS.DIV,
			classes: 'game__main'
		});

		this.gameContainer = factory.create({
			elem: TAGS.DIV,
			classes: 'game-container',
			child: [this.controlsContainer, this.tooltips, this.gameBoard]
		});

		this.wrapper = factory.create({
			elem: TAGS.DIV,
			classes: 'wrapper__en_puzzle',
			child: this.gameContainer
		});

		appContainer.append(this.wrapper);
		gameField.init();
		levelSelect.init();
		hints.init();
		tooltips.init();
	}

	start() {
		this.getData();
		this.addLine();
	}

	calculatePuzzlesSize(puzzlesLine) {
		this.puzzlesHomeContainer = document.querySelector('.game__puzzles');
		const homeContainerWidth = this.puzzlesHomeContainer.offsetWidth;
		const neededBoardHeight = ((PICTURE_HEIGHT * homeContainerWidth / PICTURE_WIDTH) + 9 * 2).toFixed();
		const gameBoard = document.querySelector('.game__board');
		gameBoard.style.height = `${neededBoardHeight}px`;
		this.board.style.width = `${homeContainerWidth}px`;
		const puzzleHeight = ((neededBoardHeight - 9 * 2) / 10).toFixed();
		this.puzzlesHomeContainer.style.height = `${puzzleHeight}px`;
		gameBoard.style.height = `${puzzleHeight * 10 + 18}px`;
		const boardLines = document.querySelectorAll('.board__line');
		boardLines.forEach(line => {
			const curLine = line;
			curLine.style.height = `${puzzleHeight}px`;
		});
		const lengthOfEachPuzzleInLine = [];
		let finishWidthOfEachPuzzle = [];
		puzzlesLine.forEach(puzzle => {
			lengthOfEachPuzzleInLine.push(puzzle.dataset.word.length);
		});
		const lengthOfLine = lengthOfEachPuzzleInLine.reduce((a, b) => a + b, 0);
		const sumWidthOfPuzzles = homeContainerWidth - (lengthOfEachPuzzleInLine.length - 1) * puzzlesGap;
		const widthForOneSymbol = sumWidthOfPuzzles / lengthOfLine;
		const widthOfEachPuzzle = lengthOfEachPuzzleInLine.map(puzzleLength => Math.round(puzzleLength * widthForOneSymbol));
		const sumOfEachPuzzleWidth = widthOfEachPuzzle.reduce((a, b) => a + b, 0);
		if (sumOfEachPuzzleWidth === sumWidthOfPuzzles) {
			finishWidthOfEachPuzzle = [...widthOfEachPuzzle];
		} else if (sumOfEachPuzzleWidth < sumWidthOfPuzzles) {
			let difference = sumWidthOfPuzzles - sumOfEachPuzzleWidth;
			let index = 0;
			do {
				widthOfEachPuzzle[index] += 1;
				index += 1;
				difference -= 1;
			}
			while (difference > 0);
			finishWidthOfEachPuzzle = [...widthOfEachPuzzle];
		} else {
			let difference = sumOfEachPuzzleWidth - sumWidthOfPuzzles;
			let index = 0;
			do {
				widthOfEachPuzzle[index] -= 1;
				index += 1;
				difference -= 1;
			}
			while (difference > 0);
			finishWidthOfEachPuzzle = [...widthOfEachPuzzle];
		}

		puzzlesLine.forEach((puzzle, index) => {
			const curPuzzle = puzzle;
			curPuzzle.setAttribute('data-width', `${finishWidthOfEachPuzzle[index]}px`);
			curPuzzle.style.width = `${finishWidthOfEachPuzzle[index]}px`;
			curPuzzle.style.height = `${puzzleHeight}px`;
		});
	}

	addBackgroundToPuzzles(puzzle) {
		const thisPuzzle = puzzle;
		this.backgroundPicture = paintings[this.currentLevel][this.currentRound];
		thisPuzzle.style.backgroundImage = `url(https://raw.githubusercontent.com/Garza0/rslang_data_paintings/master/${this.backgroundPicture.cutSrc})`;

	}

	calculateBackgroundPosition(elements) {
		console.log(elements);
		const sortedPuzzles = this.sortPuzzles(elements);
		console.log(sortedPuzzles);
		const elementsLine = elements[0].dataset.line;
		const puzzleHeight = elements[0].offsetHeight;
		const bgWidth = this.board.offsetWidth;
		let previosPuzzlesWidth = 0;

		sortedPuzzles.forEach(element => {
			const puzzle = element;
			puzzle.style.backgroundPosition = `${-previosPuzzlesWidth}px ${-elementsLine * puzzleHeight}px`;
			puzzle.style.backgroundSize = `${bgWidth}px`;
			previosPuzzlesWidth += puzzle.offsetWidth;
		});
	}

	showHideBackground() {
		this.showBgImageBtnState = !this.showBgImageBtnState;
		this.showBgImageBtn.classList.toggle('btn-icon--active');

		const puzzles = document.querySelectorAll('.game__jigsaw');
		if (this.showBgImageBtnState) {
			puzzles.forEach(element => {
				this.addBackgroundToPuzzles(element);
			});
		} else {
			puzzles.forEach(element => element.style.removeProperty('background-image'));
		}
	}

}
