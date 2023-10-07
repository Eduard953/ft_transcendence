import { getCookie } from 'typescript-cookie';

export const BACK_PREFIX = `http://${import.meta.env.VITE_BACK_HOST}:${import.meta.env.VITE_BACK_PORT}`;
export const BACK_SOCKET_PREFIX = `ws://${import.meta.env.VITE_BACK_HOST}:${import.meta.env.VITE_BACK_PORT}`;

export const sockOpt = {
	transposts: ["websocket"],
	transportOptions: {
		polling: {
			headers: {},
			extraHeaders: {
				Token: getCookie('accessToken'),
			},
		},
	},
};
