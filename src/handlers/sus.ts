import { Application, Request, Response } from 'express';
import { authMiddleware } from '../auth';
import { SusUrl } from '../entity/SusUrl';
import { SusWord } from '../entity/SusWord';
import { routes } from '../routes';
import { getEntityManager } from '../services/database';
import { generateUniqueSusId, withDomain } from '../services/sus-url';

async function createSusUrlPost(req: Request, res: Response): Promise<void> {
	const { url, numWords } = req.body;

	if (!url) {
		res.status(400).send({ status: 'error', error: 'Missing URL' });
		return;
	}

	if (!numWords) {
		res.status(400).send({ status: 'error', error: 'Need at least one sus word' });
		return;
	}

	const susId = await generateUniqueSusId(numWords);

	if (!susId) {
		res.status(400).send({ status: 'error', error: 'Need at least one sus word' });
		return;
	}

	const susUrl = new SusUrl(susId, url);
	const em = getEntityManager();

	await em.persistAndFlush(susUrl);

	res.status(200).send({ status: 'ok', url: withDomain(susId) });
}

async function susWordPost(req: Request, res: Response): Promise<void> {
	const { word } = req.body;

	if (!word) {
		res.status(400).send({ status: 'error', error: 'Missing word' });
		return;
	}

	const susWord = new SusWord(word);

	const em = getEntityManager();
	await em.persistAndFlush(susWord);

	res.status(200).send({ status: 'ok' });
}

async function susWordDelete(req: Request, res: Response): Promise<void> {
	const { id } = req.body;

	if (!id) {
		res.status(400).send({ status: 'error', error: 'Missing word' });
		return;
	}

	const em = getEntityManager();
	const susWord = await em.findOne(SusWord, { id });

	if (!susWord) {
		res.status(404).send({ status: 'error', error: 'Word does not exist' });
		return;
	}

	await em.removeAndFlush(susWord);

	res.status(200).send({ status: 'ok' });
}

async function susWordPut(req: Request, res: Response): Promise<void> {
	const { id, word } = req.body;

	if (!id) {
		res.status(400).send({ status: 'error', error: 'Missing id' });
		return;
	}

	if (!word) {
		res.status(400).send({ status: 'error', error: 'Missing word' });
		return;
	}

	const em = getEntityManager();
	const susWord = await em.findOne(SusWord, { id });

	if (!susWord) {
		res.status(404).send({ status: 'error', error: 'Word does not exist' });
		return;
	}

	susWord.word = word;

	await em.persistAndFlush(susWord);

	res.status(200).send({ status: 'ok' });
}

async function susWordsGet(req: Request, res: Response): Promise<void> {
	const em = getEntityManager();

	const [words, _] = await em.findAndCount(SusWord, {});

	res.status(200).send({ status: 'ok', words });
}

async function susPageGet(req: Request, res: Response): Promise<void> {
	const { id } = req.params;

	if (!id) {
		res.status(400).send({ status: 'error', error: 'Missing id' });
		return;
	}

	const em = getEntityManager();
	const susUrl = await em.findOne(SusUrl, { id });

	if (!susUrl) {
		res.status(404).send({ status: 'error', error: 'URL does not exist' });
		return;
	}

	res.redirect(susUrl.originalUrl);
}

export function addRoutes(app: Application): void {
	app.get(routes.susUrl.full, susPageGet);
	app.post(routes.api.url.createSusUrl, createSusUrlPost);

	app.post(routes.api.word.crud, authMiddleware, susWordPost);
	app.get(routes.api.word.crud, authMiddleware, susWordsGet);
	app.put(routes.api.word.crud, authMiddleware, susWordPut);
	app.delete(routes.api.word.crud, authMiddleware, susWordDelete);
}
