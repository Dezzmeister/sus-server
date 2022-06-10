export const routes = {
	home: '/',
	login: '/',
	logout: '/logout',
	susUrl: {
		base: '/e',
		full: '/e/:id',
	},
	client: {
		word: {
			list: '/word/list',
			add: '/word/add',
			delete: '/word/delete',
			modify: '/word/modify',
		},
	},
	api: {
		url: {
			createSusUrl: '/api/url/create',
		},
		word: {
			crud: '/api/word',
		},
		account: {
			login: '/api/account/login',
			logout: '/api/account/logout',
		},
	},
};
