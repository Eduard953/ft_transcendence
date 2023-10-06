import { Middleware } from 'redux';
import { io, Socket } from 'socket.io-client';
import { channelActions } from './channels.slice';
import { ChannelsEvent } from './channels.slice';
import { BACK_SOCKET_PREFIX, sockOpt } from '../helpers/API';
import { ChannelPreview } from '../interfaces/channel.interface';
import { Message } from '../interfaces/message.interface';
import { userActions } from './user.slice';
 
const channelsMiddleware: Middleware = store => {
	let socket: Socket;
	return next => (action) => {
		const isConnectionEstablished = socket && store.getState().channel.isConnected;
		console.log(action);
		if (channelActions.startConnecting.match(action)) {
			socket = io(BACK_SOCKET_PREFIX, sockOpt);
			socket.on('connect', () => {
				store.dispatch(channelActions.connectionEstablished());
				store.dispatch(channelActions.getChannels(store.getState().user.profile.email));

				//socket.emit(ChannelsEvent.getPreview, store.getState().user.email, (channels: ChannelPreview[]) => {
				//	store.dispatch(channelActions.getChannels({ channels }));
				//});
			});
			socket.on(ChannelsEvent.updateStatus, (statusMap: any) => {
				console.log(statusMap);
				store.dispatch(userActions.setStatuses(statusMap));
			});
			socket.on(ChannelsEvent.updateSearch, (search: any) => {
				store.dispatch(channelActions.setSearchUpdate(search));
			});
			socket.on(ChannelsEvent.getMessages, (messages: Message[]) => {
				store.dispatch(channelActions.setMessages(messages));
			});
			socket.on(ChannelsEvent.recieveMessage, (message: Message) => {
				store.dispatch(channelActions.recieveMessage(message));
			});
			socket.on(ChannelsEvent.updatePreview, (channels: ChannelPreview[]) => {
				store.dispatch(channelActions.setChannels({channels: channels}));
			});
			socket.on(ChannelsEvent.AddPreview, (channel: ChannelPreview) => {
				store.dispatch(channelActions.setChannel({channel: channel}));
			});
			socket.on(ChannelsEvent.update, () => {
				store.dispatch(channelActions.updateState());
				//socket.emit(ChannelsEvent.getPreview, store.getState().user.email, (channels: ChannelPreview[]) => {
				//	store.dispatch(channelActions.getChannels({ channels }));
				//});
			});
 
			socket.on(ChannelsEvent.getError, (error: string) => {
				store.dispatch(channelActions.setError(error));
			});
			socket.on(ChannelsEvent.getSelectedChannel, (channel: any) => {
				store.dispatch(channelActions.setSelectedChannel(channel));
			})
		}
 
		if (channelActions.createChannel.match(action) && isConnectionEstablished) {
			console.log(action.payload);
			socket.emit(ChannelsEvent.createChannel, action.payload);
		}
		if (channelActions.getChannels.match(action) && isConnectionEstablished) {
			socket.emit(ChannelsEvent.getPreview, action.payload, (channels: ChannelPreview[]) => {
				store.dispatch(channelActions.setChannels({ channels }));
			});
		}
		if (channelActions.sendMessage.match(action) && isConnectionEstablished) {
			console.log(action.payload);
			socket.emit(ChannelsEvent.sendMessage, action.payload);
		}
		if (channelActions.getMessages.match(action) && isConnectionEstablished) {
			if (action.payload != -1) {
				socket.emit(ChannelsEvent.getMessages, action.payload);
			}
		}
		if (channelActions.getChannel.match(action) && isConnectionEstablished) {
			if (action.payload != -1) {
				socket.emit(ChannelsEvent.AddPreview, {email: store.getState().user.profile.email, channelId: action.payload});
			}
		}
		if (channelActions.getUpdateSearch.match(action) && isConnectionEstablished) {
			socket.emit(ChannelsEvent.getUpdateSearch, store.getState().user.profile.email);
		}
		if (channelActions.getSelectedChannel.match(action) && isConnectionEstablished) {
			socket.emit(ChannelsEvent.getSelectedChannel, {email: store.getState().user.profile.email, channelId: action.payload});
		}
		next(action);
	};
};

export default channelsMiddleware;