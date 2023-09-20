import { FormEvent, forwardRef, useEffect, useState } from 'react';
//import { Chat } from './Chat.props';
import styles from './MessageHolder.module.css';
import Headling from '../../components/Headling/Headling';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { auth, userActions } from '../../store/user.slice';
import Search from '../../components/Search/Search';
import { channelActions } from '../../store/channels.slice';
import { ChannelList } from './ChannelList/ChannelList';
import ChatWindow from './ChatWindow/ChatWindow';
import { ChannelPreview } from '../../interfaces/channel.interface';
import { INITIAL_CHANNEL } from '../../helpers/ChatInit';
import { MessageHolderProps } from './MessageHolder.props';
import classNames from 'classnames';
//import {RootState} from '../../store/store'



const MessageHolder
= forwardRef<HTMLDivElement, MessageHolderProps>(
	function MessageHolder({message, appearence = 'self', ...props}, ref
	) {

		return (
			<>
				<div {...props} ref={ref} className={classNames(styles['message'], styles[appearence])}>
					{message.msg}
				</div>
			</>
		);
	});

export default MessageHolder;