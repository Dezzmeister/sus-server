import { Application, Request, Response } from 'express';
import { jwtMiddleware } from '../auth';
import { clientMiddleware, ClientRequest } from '../client';
import { SusUrl } from '../entity/SusUrl';
import { SusWord } from '../entity/SusWord';
import { routes } from '../routes';
import { getEntityManager } from '../services/database';
import { generateUniqueSusId, withDomain } from '../services/sus-url';

async function listSusWordsPost(req: ClientRequest, res: Response): Promise<void> {
	try {
		const em = getEntityManager();
		const words = await em.getRepository(SusWord).findAll();

		res.send({ words });
	} catch (err) {
		res.status(500).send({ error: JSON.stringify(err) });
	}
}

async function addSusWordsPost(req: ClientRequest, res: Response): Promise<void> {
	try {
		const { words } = req.body;

		if (!words || !words.length) {
			res.status(400).send({ error: 'malformed word array' });
			return;
		}

		const susWords = (words as string[]).map((w) => new SusWord(w));
		const em = getEntityManager();
		await em.persistAndFlush(susWords);

		res.send({ status: 'ok' });
	} catch (err) {
		res.status(500).send({ error: JSON.stringify(err) });
	}
}

async function deleteSusWordsPost(req: ClientRequest, res: Response): Promise<void> {
	try {
		const { words } = req.body;

		if (!words || !words.length) {
			res.status(400).send({ error: 'malformed word array' });
			return;
		}

		const em = getEntityManager();
		await em
			.createQueryBuilder(SusWord)
			.delete()
			.where({ id: { $in: words } })
			.execute();

		await em.flush();

		res.send({ status: 'ok' });
	} catch (err) {
		res.status(500).send({ error: JSON.stringify(err) });
	}
}

async function modifySusWordsPost(req: ClientRequest, res: Response): Promise<void> {
	try {
		const { words } = req.body;

		if (!words || !Object.keys(words).length) {
			res.status(400).send({ error: 'malformed word array' });
			return;
		}

		const em = getEntityManager();
		await Promise.all(
			Object.keys(words).map((id) =>
				em.createQueryBuilder(SusWord).update({ word: words[id] }).where({ id }).execute(),
			),
		);

		await em.flush();

		res.send({ status: 'ok' });
	} catch (err) {
		res.status(500).send({ error: JSON.stringify(err) });
	}
}

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

	app.post(routes.client.word.list, clientMiddleware, listSusWordsPost);
	app.post(routes.client.word.add, clientMiddleware, addSusWordsPost);
	app.post(routes.client.word.delete, clientMiddleware, deleteSusWordsPost);
	app.post(routes.client.word.modify, clientMiddleware, modifySusWordsPost);

	app.post(routes.api.word.crud, jwtMiddleware, susWordPost);
	app.get(routes.api.word.crud, jwtMiddleware, susWordsGet);
	app.put(routes.api.word.crud, jwtMiddleware, susWordPut);
	app.delete(routes.api.word.crud, jwtMiddleware, susWordDelete);
}
