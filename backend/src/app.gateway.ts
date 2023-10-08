import { JwtService } from '@nestjs/jwt';
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsException,
} from '@nestjs/websockets';
import {
	CreateChannel,
	DirectChannel,
	//CreateDirectChannel,
	UpdateChannel,
} from 'contracts/channel.schema';
import { Status } from 'contracts/enums';
import { Server, Socket } from 'socket.io';
import { ChannelGateway } from './channel/channel.gateway';
import { ChannelService } from './channel/channel.service';
import { UserService } from './user/user.service';
import { SaveGame } from 'contracts/game.schema';
import { GameService } from './game/game.service';
import { JwtAuthGuard } from './auth/jwt.guard';
import { UseGuards } from '@nestjs/common/decorators';
import { Options } from 'pong/static/options';

// @UseGuards(JwtAuthGuard)
@WebSocketGateway({ cors: true })
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private readonly jwtService: JwtService,
		private readonly userService: UserService,
		private readonly channelGateway: ChannelGateway,
		private readonly channelService: ChannelService,
		private readonly gameService: GameService,
	) {}

	userStatusMap = new Map<number, Status>();
	clientSocket = new Map<number, Socket>();

	@WebSocketServer()
	server: Server;

	async handleConnection(client: Socket) {
		try {
			const UserId: number = this.jwtService.verify(
				String(client.handshake.headers.token),
				{ secret: process.env.JWT_SECRET },
			).sub;
			const user = this.userService.getUserById(UserId);
			client.data.id = UserId;
			if (!user) throw new WsException('Invalid token.');
			client.join('all');
			//setting status as online
			this.userStatusMap.set(client.data.id, Status.online);
			const serializedMap = [...this.userStatusMap.entries()];
			this.server.emit('update-status', serializedMap);
			//add to clientSocket
			const oldClient = this.clientSocket.get(UserId)
			if (oldClient) {
				oldClient.disconnect();
			}
			this.clientSocket.set(UserId, client);
			console.log('connect userId', UserId, client.id);
			await this.channelGateway.handleJoinSocket(UserId, client);
		} catch (e) {
			console.log(e);
			return false;
		}
	}

	async handleDisconnect(client: Socket) {
		if (client.data.id != undefined) {
			this.userStatusMap.set(client.data.id, Status.offline);
			const serializedMap = [...this.userStatusMap.entries()];
			this.server.emit('update-status', serializedMap);
			this.clientSocket.delete(client.data.id);
			console.log('disconnect userId', client.data.id, client.id);
		}
		//if (IN A GAME) //FIXME!!!
		client.removeAllListeners();
	}

	@SubscribeMessage('get new channel')
	async getNewChannel(@MessageBody() channelData: CreateChannel.Request) {
		channelData.members.map(async (member) => {
			if (this.clientSocket.has(member.id)) {
				const client = this.clientSocket.get(member.id);
				client.join(channelData.name);
				client.emit('update channel request');
			}
		});
	}

	@SubscribeMessage('get new direct messages')
	async getNewDirectMessages(
		@MessageBody() channelData: DirectChannel.Request,
	) {
		const channelName = await this.channelService.getChannelNameById(
			channelData.channelId,
		);
		if (this.clientSocket.has(channelData.userId)) {
			const client = this.clientSocket.get(channelData.userId);
			client.join(channelName);
			client.emit('update channel request');
		}
	}

	@SubscribeMessage('get new invite')
	async getNewInvite(@MessageBody() channelData: UpdateChannel.Request) {
		if (this.clientSocket.has(channelData.memberId)) {
			const client = this.clientSocket.get(channelData.memberId);
			const channelName = await this.channelService.getChannelNameById(
				channelData.id,
			);
			client.join(channelName);
			client.emit('update channel request');
		}
	}

	@SubscribeMessage('add friend')
	async addFriend(
		@MessageBody() data: {selfId: number, friendId: number},
	) {
		console.log('add friend event, ids: ', data.selfId, data.friendId);
		if (await this.userService.isAdding(data.selfId, data.friendId)) {
			console.log(this.userService.isAdding(data.selfId, data.friendId));
			return;
		}
		const client = this.clientSocket.get(data.selfId);
		try {
			const friends = await this.userService.addFriend(data.selfId, data.friendId);
			const client1 = this.clientSocket.get(data.friendId);
			client.emit('update profile', friends[0]);
			client1.emit('update profile', friends[1]);
		} catch (e) {
			client.emit('exception', 'Failed to add friend');
		}
	}

	@SubscribeMessage('remove friend')
	async removeFriend(
		@MessageBody() data: {selfId: number, friendId: number},
	) {
		console.log('remove friend event, ids: ', data.selfId, data.friendId);
		const client = this.clientSocket.get(data.selfId);
		try {
			await this.userService.removeFriend(data.selfId, data.friendId);
			const friends = await this.userService.removeAdding(data.selfId, data.friendId);
			const client1 = this.clientSocket.get(data.friendId);
			client.emit('update profile', friends[0]);
			client1.emit('update profile', friends[1]);
		} catch (e) {
			client.emit('exception', 'Failed to remove friend');
		}
	}

	@SubscribeMessage('block user')
	async blockUser(@MessageBody() data: {selfId: number, friendId: number}) {
		console.log('BLOCK user event, ids: ', data.selfId, data.friendId);
		const client = this.clientSocket.get(data.selfId);
		try {
			const blockers = await this.userService.blockUser(data.selfId, data.friendId);
			const client1 = this.clientSocket.get(data.friendId);
			client.emit('update profile', blockers[0]);
			client1.emit('update profile', blockers[1]);
		} catch (e) {
			client.emit('exception', 'Failed to block friend');
		}
	}

	@SubscribeMessage('unblock user')
	async unblockUser(@MessageBody() data: {selfId: number, friendId: number}) {
		console.log('unblock user event, ids: ', data.selfId, data.friendId);
		const client = this.clientSocket.get(data.selfId);
		try {
			const blockers = await this.userService.unblockUser(data.selfId, data.friendId);
			const client1 = this.clientSocket.get(data.friendId);
			client.emit('update profile', blockers[0]);
			client1.emit('update profile', blockers[1]);
		} catch (e) {
			client.emit('exception', 'Failed to block friend');
		}
	}

	@SubscribeMessage('save game')
	async saveGame(@MessageBody() gameData: SaveGame.Request) {
		try {
			let serializedMap;
			// game just started
			if (gameData.score1 === 0 && gameData.score2 === 0) {
				this.userStatusMap.set(gameData.player1, Status.playing);
				this.userStatusMap.set(gameData.player2, Status.playing);
			}
			// game was interrupted
			else if (gameData.score1 === Options.maxWins && gameData.score2 === Options.maxWins) {
				const playerStatus1 = this.userStatusMap?.get(gameData.player1);
				const playerStatus2 = this.userStatusMap?.get(gameData.player2);
				if (playerStatus1 && playerStatus1 === Status.playing) {
					this.userStatusMap.set(gameData.player1, Status.online);
				}
				if (playerStatus2 && playerStatus2 === Status.playing) {
					this.userStatusMap.set(gameData.player2, Status.online);
				}
			}
			// game is finished
			else {
				await this.gameService.saveGame(gameData);
				this.userStatusMap.set(gameData.player1, Status.online);
				this.userStatusMap.set(gameData.player2, Status.online);
			}
			serializedMap = [...this.userStatusMap.entries()];
			this.server.emit('update-status', serializedMap);
		} catch (e) {
			throw e;
		}
	}

	@SubscribeMessage('get gameHistory')
	async	getGameHistory(
		@MessageBody() userId: number,
		@ConnectedSocket() client: Socket,
	) {
		const gameHistory = await this.gameService.getGameHistory(userId);
		client.emit('get gameHistory', gameHistory);
	}

	@SubscribeMessage('get friends')
	async	getFriends(
		@MessageBody() userId: number,
		@ConnectedSocket() client: Socket
	) {
		const friends = await this.userService.getFriends(userId);
		client.emit('get friends', friends);
	}
}
