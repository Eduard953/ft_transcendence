import { FormEvent, useEffect, useState } from 'react';
//import { Chat } from './Chat.props';
import styles from './Chat.module.css';
import Headling from '../../components/Headling/Headling';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { auth, userActions } from '../../store/user.slice';
import Search from '../../components/Search/Search';
import { getChannels } from '../../store/channel.slice';
import { ChannelList } from './ChannelList/ChannelList';
import ChatWindow from './ChatWindow/ChatWindow';
import { ChannelPreview } from '../../interfaces/channel.interface';
import { io } from 'socket.io-client';
import { INITIAL_CHANNEL, socket } from '../../helpers/ChatInit';


socket.emit('hello', 1);

socket.on('message', (data) => {
	console.log(data);
});
export function Chat() {
	const dispatch = useDispatch<AppDispatch>();
	const [channels, setChannels] = useState<ChannelPreview[]>();
	//const channels = useSelector((s: RootState) => s.channel.items);
	const [selectedChannel, setSelectedChannel] = useState<ChannelPreview>(INITIAL_CHANNEL);

	useEffect(() => {
		socket.emit('get preview', 'uryvaeva.anna@gmail.com', (previews: ChannelPreview[]) => {
			if(previews) {
				setChannels(previews);
			}
			console.log(previews);
		});
	}, []);


	return (
		<div className={styles['page']}>
			<div className={styles['left-panel']}>
				<div className={styles['head']}>
					<Headling>Channels</Headling>
					<Search placeholder='Search'></Search>
				</div>
				<ChannelList channels={channels} setChannel={setSelectedChannel}/>
			</div>
			<ChatWindow data={selectedChannel}/>
		</div>
	);
}