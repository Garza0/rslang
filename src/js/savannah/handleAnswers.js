import {requestedWords, arrayWithRightAnswers, arrayWithWrongAnswers, NEW_OPACITY, NEW_WIDTH, NEW_FONTSIZE} from './consts';

function handleWrongAnswer() {
	const mainWordContainer = document.querySelector('.main-word');
	const allAnswers = document.querySelectorAll('.answers p');
	const lifeIcon = document.querySelector('.health-point-scale IMG');
	const volumeContainer = document.querySelector('.volume-settings');
	const errorSound = document.querySelector('.error-sound');
	if (!volumeContainer.classList.contains('silence-mode')) {
		errorSound.play();
	}
	mainWordContainer.style.opacity = NEW_OPACITY;
	mainWordContainer.style.fontSize = NEW_FONTSIZE;
	allAnswers.forEach(answer => {
		if (answer.textContent === mainWordContainer.dataset.translate) {
			answer.classList.add('right-answer__active');
		}
	});
	arrayWithWrongAnswers.push(requestedWords.filter(item => item.id === mainWordContainer.dataset.id)[0]);
	if (lifeIcon !== null) {
		lifeIcon.remove();
	}
}

function handleRightAnswer() {
	const mainWordContainer = document.querySelector('.main-word');
	const correctSound = document.querySelector('.correct-sound');
	const volumeContainer = document.querySelector('.volume-settings');
	if (!volumeContainer.classList.contains('silence-mode')) {
		correctSound.play();
	}
	mainWordContainer.style.marginLeft = `${mainWordContainer.style.width / 2}px`;
	mainWordContainer.style.width = NEW_WIDTH;
	mainWordContainer.style.overflow = 'hidden';
	arrayWithRightAnswers.push(requestedWords.filter(item => item.id === mainWordContainer.dataset.id)[0]);
}

export {handleWrongAnswer, handleRightAnswer};
