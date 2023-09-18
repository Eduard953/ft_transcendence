import { typeEnum } from '../../../contracts/enums';

export interface ChannelPreview {
	id: number,
	type: typeEnum,
	name: string,
	picture: string,
	updatedAt: Date,
	lastMessage: string,
	unreadCount: number,
	ownerEmail: string,
	ownerId: number
}
