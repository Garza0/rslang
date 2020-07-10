export const ARRAY_LENGTH_INDEX_CORRECTION = 1;
export const CHART_COLOR = 'rgba(82, 34, 208, 0.3)';

export const TEXT_STATISTICS = {
	DATE: 'date',
	NUMBER: '',
	RESULT: 'result',
};

export const CHART_SETTINGS = {
	WIDTH: 500,
	HEIGHT: 400,
};

const date0 = new Date();
date0.setHours(0, 0, 0, 0);

const date1 = new Date();
date1.setDate(15);
date1.setHours(0, 0, 0, 0);

const date2 = new Date();
date2.setDate(16);
date2.setHours(0, 0, 0, 0);

const date3 = new Date();
date3.setDate(18);
date3.setHours(0, 0, 0, 0);

const myDates = [date0, date1, date2, date3];

export const MOCA = {
	statistics: {
		dates : myDates,
		data: [0, 5, 25, 27],
		labels: [0, 15, 110, 250],
	},
	games: [
		{
			name: 'english Puzzle1',
			data: [
				{ date: new Date(), result: 1 },
				{ date: new Date(), result: 11 },
				{ date: new Date(), result: 111 },
				{ date: new Date(), result: 1111 },
			],
		},
		{
			name: 'english Puzzle2',
			data: [
				{ date: new Date(), result: 22 },
				{ date: new Date(), result: 222 },
			],
		},
		{
			name: 'english Puzzle3',
			data: [
				{ date: new Date(), result: 333 },
				{ date: new Date(), result: 3333 },
				{ date: new Date(), result: 33333 },
			],
		},
		{ name: 'english Puzzle4', data: [] },
		{
			name: 'english Puzzle5',
			data: [
				{ date: new Date(), result: 55555 },
				{ date: new Date(), result: 555 },
			],
		},
	],
};

