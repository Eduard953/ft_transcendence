import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { Socket } from 'socket.io-client';
import { typeEnum } from '../../../contracts/enums';
import { BACK_PREFIX } from '../helpers/API';
import { ChannelPreview } from '../interfaces/channel.interface';
import { CreateChannel } from '../interfaces/createChannel.interface';
import { CreateMessage } from '../interfaces/createMessage.interface';
import { Message } from '../interfaces/message.interface';
import { loadState } from './storage';


export enum ChannelsEvent {
	AddPreview = 'add preview', // add channel
	getBlocked = 'get blocked',
	getError = 'exception',
	update = 'update channel request',
	updatePreview = 'update preview',
	getPreview = 'get preview',
	getMembers = 'get members',
	updateSearch = 'update search',
	getOwners = 'get owners',
	getAdmins = 'get admins',
	getInvoteds = 'get inviteds',
	getOwner = 'get owner',
	filter = 'filter',
	getMessages = 'get messages',
	getRole = 'get role',
	sendMessage = 'new message',
	recieveMessage = 'broadcast',
	createChannel = 'create channel'
}

export interface ChannelsState {
	channels: ChannelPreview[];
	messages: Message[];
	selectedChannel: ChannelPreview;


	isEstablishingConnection: boolean;
	isConnected: boolean;
	state: number;
}
 
const initialState: ChannelsState = {
	channels: [],
	messages: loadState<Message[]>('messages') ?? [],
	selectedChannel: loadState<ChannelPreview>('selectedChannel') ?? {
		id: -1,
		type: typeEnum.PUBLIC,
		name: '',
		picture: '',
		updatedAt: new Date('now').toDateString(),
		lastMessage: '',
		unreadCount: 0,
		ownerEmail: '',
		ownerId: -1
	},
	isEstablishingConnection: false,
	isConnected: false,
	state: 0
};
 
const channelSlice = createSlice({
	name: 'channels',
	initialState,
	reducers: {
		logout: (state) => {
			state.channels = [];
			state.isConnected = false;
			state.isEstablishingConnection = false;
			state.messages = [];
			state.selectedChannel = {
				id: -1,
				type: typeEnum.PUBLIC,
				name: '',
				picture: '',
				updatedAt: new Date('now').toDateString(),
				lastMessage: '',
				unreadCount: 0,
				ownerEmail: '',
				ownerId: -1
			};
		},
		startConnecting: (state => {
			state.isEstablishingConnection = true;
		}),
		connectionEstablished: (state => {
			state.isConnected = true;
			state.isEstablishingConnection = true;
		}),
		getChannel: ((state, action: PayloadAction<number>) => {
			return;
		}),
		setChannel: ((state, action: PayloadAction<{
			channel: ChannelPreview
		}>) => {
			state.selectedChannel = action.payload.channel;
			console.log(state.selectedChannel.updatedAt);
		}),
		getChannels: ((state, action: PayloadAction<string | undefined>) => {
			return;
		}),
		setChannels: ((state, action: PayloadAction<{ channels: ChannelPreview[] }>) => {
			state.channels = action.payload.channels;
		}),
		sendMessage: ((state, action: PayloadAction<CreateMessage>) => {
			return;
		}),
		getMessages: ((state, action: PayloadAction<number>) => {
			return;			
		}),
		setMessages: ((state, action: PayloadAction<Message[]>) => {
			console.log('state messages: ', action.payload);
			state.messages = action.payload;
		}),
		recieveMessage: ((state, action: PayloadAction<Message>) => {
			state.messages.push(action.payload);
		}),
		createChannel: ((state, action: PayloadAction<CreateChannel>) => {
			return;
		}),
		updateState: (state => {
			state.state = state.state + 1;
		})
	}
});
 
export const channelActions = channelSlice.actions;
 
export default channelSlice.reducer;

//export const CART_PERSISTENT_STATE = 'cartData';
//export interface ChatState {
//	items: ChannelPreview[];

//}

//const initialState: ChatState = loadState<ChatState>(CART_PERSISTENT_STATE) ?? {
//	items: []
//};

//export const socketMiddleware = (socket: Socket) => (params: any) => (next: ) => (action) => {
//	const { dispatch, getState } = params;
//	const { type } = action;

//	switch (type) {
//	case 'socket/connect':
//		socket.connect('wss://example.com');

//		socket.on('open', () => {});
//		socket.on('message', (data) => {});
//		socket.on('close', () => {});
//		break;

//	case 'socket/disconnect':
//		socket.disconnect();
//		break;

//	default:
//		break;
//	}

//	return next(action);
//};

//export const getChannels = createAsyncThunk('channel/show',
//	async () => {
//		try {
//			//console.log(params);
//			//const { data } = await axios.get(`${BACK_PREFIX}/channel/show`);
//			//console.log(data);
//			//return data;
//		} catch (e) {
//			if (e instanceof AxiosError) {
//				throw new Error(e.response?.data.message);
//			}
//		}
//	}
//);

//export const channelSlice = createSlice({
//	name: 'channel',
//	initialState,
//	reducers: {

//	},
//	extraReducers: (builder) => {
//		builder.addCase(getChannels.fulfilled, (state, action) => {
//			if (!action.payload) {
//				return;
//			}
//			action.payload.map(i => state.items.push(i));
//			state = action.payload;
//		});
//		builder.addCase(getChannels.rejected, () => {
//			//state.authErrorMessage = action.error.message;
//		});

//	}
//});

//export default channelSlice.reducer;
//export const channelActions = channelSlice.actions;