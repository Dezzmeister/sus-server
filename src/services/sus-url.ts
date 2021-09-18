import { config } from '../config';
import { SusUrl } from '../entity/SusUrl';
import { SusWord } from '../entity/SusWord';
import { getEntityManager } from './database';
import { base64Url } from './session';
import crypto from 'crypto';

const RAND_BYTES = 4;

const DOMAINS =
	config.env === 'dev'
		? [`${config.server.hostname}:${config.server.port}`]
		: ['bigboobi.es', 'hugetitti.es', 'smalltitti.es', 'cooltitti.es'];

export function withDomain(susId: string): string {
	const domain = DOMAINS[Math.floor(Math.random() * DOMAINS.length)];

	return `http://${domain}/e/${susId}`;
}

export async function generateUniqueSusId(numSusWords: number): Promise<string | null> {
	let susId = await generateSusId(numSusWords);

	if (!susId) {
		return null;
	}

	const em = await getEntityManager();
	let existingSusUrl = await em.findOne(SusUrl, { id: susId });

	while (existingSusUrl !== null) {
		susId = await generateSusId(numSusWords);
		existingSusUrl = await em.findOne(SusUrl, { id: susId });
	}

	return susId;
}

async function generateSusId(numWords: number): Promise<string | null> {
	const em = getEntityManager();
	const [susWords, _] = await em.findAndCount(SusWord, {});

	if (susWords.length === 0) {
		return null;
	}

	const words = susWords.map((sus) => sus.word);

	return pickRandomWords(numWords, words).reduce(
		(prev, curr, i) => (i === 0 ? `${prev}-${curr}` : `${prev}${pickDelimiter()}${curr}`),
		base64Url(crypto.randomBytes(RAND_BYTES).toString('base64')),
	);
}

function pickDelimiter(): string {
	const choice = Math.random();

	if (choice < 0.1) {
		return '-';
	} else if (choice < 0.5) {
		return `-${base64Url(crypto.randomBytes(RAND_BYTES).toString('base64'))}`;
	}

	return `-${base64Url(crypto.randomBytes(RAND_BYTES).toString('base64'))}-`;
}

function pickRandomWords(numWords: number, words: string[]): string[] {
	if (numWords === 0) {
		return [];
	}

	const index = rand(words.length);
	const newWords = words.filter((_, i) => i !== index);

	return [words[index], ...pickRandomWords(numWords - 1, newWords)];
}

function rand(max: number): number {
	return Math.floor(Math.random() * max);
}
