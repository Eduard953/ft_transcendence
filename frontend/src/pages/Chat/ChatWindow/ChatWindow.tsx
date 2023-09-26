import { ChatWindowProps } from './ChatWindow.props';
import styles from './ChatWindow.module.css';
import layoutStyles from '../../Layout/Layout.module.css';
import Headling from '../../../components/Headling/Headling';
import { ChannelShortInfo } from '../../../components/ChannelShortInfo/ChannelShortInfo';
import Input from '../../../components/Input/Input';
import { ChangeEvent, createRef, useEffect, useRef, useState } from 'react';
import { CreateMessage } from '../../../interfaces/createMessage.interface';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { channelActions } from '../../../store/channels.slice';
import MessageHolder from '../../../components/MessageHolder/MessageHolder';
import { Message } from '../../../interfaces/message.interface';
import Modal from 'react-modal';
import Button from '../../../components/Button/Button';
import { MembersList } from '../../Members/MembersList/MembersList';

const customStyles = {
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		transform: 'translate(-50%, -50%)',
		background: 'var(--white-color)'
	}
};

function ChatWindow({ data }: ChatWindowProps) {
	const dispatch = useDispatch<AppDispatch>();
	const [message, setMessage] = useState<string>('');
	const email = useSelector((s: RootState) => s.user.email);
	const [value, setValue] = useState<string>('');
	const messages: Message[] = useSelector((s: RootState) => s.channel.messages);

	const sendMessage = (event: React.KeyboardEvent) => {
		if (event.key == 'Enter' && /\S/.test(message)) {
			setValue('');
			const newMessage: CreateMessage = {
				message: message,
				email: email,
				channelId: data.id
			};
			dispatch(channelActions.sendMessage(newMessage));
		}
	};

	const onChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
		setValue(event.target.value);
		setMessage(event.target.value);
		console.log(`'${event.target.value}'`);
	};

	useEffect(() => {
		dispatch(channelActions.getMessages(data.id));
	}, [dispatch, data.id]);

	let subtitle;
	const [modalIsOpen, setIsOpen] = useState(false);

	const openModal = () => {
		setIsOpen(true);
	};

	const afterOpenModal = () => {
		// references are now sync'd and can be accessed.
		subtitle.style.color = '#f00';
	};

	const closeModal = () => {
		setIsOpen(false);
	};

	return (
		<div className={styles['window']}>
			<div className={styles['head']}>
				<ChannelShortInfo appearence='chat' props={data}/>
				<button className={styles['see-members']} onClick={openModal}>
					<img className={styles['svg']} src='/members.svg' alt='members'/>
				</button>
				<Modal
					isOpen={modalIsOpen}
					onAfterOpen={afterOpenModal}
					onRequestClose={closeModal}
					style={customStyles}
					contentLabel="Example Modal"
				>
					<MembersList onClick={closeModal}/>
				</Modal>
			</div>
			<hr/>
			<div className={styles['chat-area']}>
				<div className={styles['rotate']}>
					{messages?.map(message => (
						<MessageHolder
							key={message.id}
							appearence={message.owner.email == email
								? 'self'
								: 'other'}
							message={message}/>
					))}
				</div>
			</div>
			{data.id === -1
				? <div></div>
				: <textarea
					name='messageInput'
					placeholder='Enter your message...'
					className={styles['text-area']}
					onChange={onChange}
					onKeyDown={sendMessage}
					value={value}/>}
			{/*: <Input name="messageInput" placeholder='Enter your message...' className={styles['text-area']} onChange={onChange} onKeyDown={onSendMessage} value={value.messageInput}/>}*/}
		</div>
	);
}

export default ChatWindow;
