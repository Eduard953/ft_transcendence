import { FormEvent, useState } from 'react';
import Headling from '../../components/Headling/Headling';
import styles from './ChannelSettings.module.css';
import Input from '../../components/Input/Input';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import Button from '../../components/Button/Button';
import settingStyles from '../CreateChannelForm/CreateChannelForm.module.css';
import classNames from 'classnames';
import CardNavLink from '../../components/CardNavLink/CardNavLink';
import { getUserProfile } from '../../store/user.slice';
import { ChannelShortInfo } from '../../components/ChannelShortInfo/ChannelShortInfo';
import { channelActions } from '../../store/channels.slice';

function ChannelSettings() {
	const [picture, setPicture] = useState<string>('/default_channel_public.png');
	const channelState = useSelector((s: RootState) => s.channel);
	const user = useSelector((s: RootState) => s.user);
	const [isProtected, setIsProtected] = useState<boolean>(false);
	const [changeUsername, setChangeUsername] = useState<boolean>(false);
	const [showMmbrs, setShowMmbrs] = useState<boolean>(false);
	const dispatch = useDispatch<AppDispatch>();

	const onSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
	};

	const updateAvatar = (e: FormEvent<HTMLInputElement>) => {
		// const target = e.target as HTMLInputElement;
		// const user_id = Number(getCookie('userId'))
		// 		if (user_id && target.files && target.files.length) {
		// 	const avatar = target.files[0];

		// 	const formData = new FormData();
		// 	formData.append('avatar', avatar, );
		// 	const file_name = dispatch(uploadAvatar(formData));
		// 				console.log(`Filename: ${file_name}`);
		// 	const old_filename = target.files[0].name;
		// 	const extension = old_filename.split('.').pop()
		// 	let update_user: UpdateUser = {
		// 		id: user.profile?.id,
		// 		username: user.profile?.username, //FIXME!!! username from the form
		// 		avatar: `http://${import.meta.env.VITE_BACK_HOST}:${import.meta.env.VITE_BACK_PORT}/user/avatars/` + user_id + '.png', //FIXME!!! avatar from the form
		// 		prefferedTableSide: user.profile?.prefferedTableSide,
		// 		pongColorScheme: user.profile?.pongColorScheme,
		// 	};
			
		// 	dispatch(updateProfile(update_user));
		// 	window.location.reload(false);
		// }
	}
	const showMembers = () => {
		if (channelState.selectedChannel && channelState.selectedChannel.id && user.profile) {
			dispatch(channelActions.readChannelStatus({channelId: channelState.selectedChannel.id, email: user.profile.email}));
			setShowMmbrs(true);
		}
	};

	const joinChannel = () => {
		if (channelState.selectedChannel && user.profile) {
			const joinData = {
				id: channelState.selectedChannel.id,
				type: channelState.selectedChannel.type,
				email: user.profile.email,
				password: null, //FIXME!!! formData password!
				memberId: -1,
				newPassword: '' //FIXME!!! formData newPassword
			};
			dispatch(channelActions.joinChannel(joinData));
			dispatch(channelActions.readChannelStatus({channelId: channelState.selectedChannel.id, email: user.profile.email}));
		}
		// setShowMmbrs(false);
	};

	const leaveChannel = () => {
		if (channelState.selectedChannel && user.profile) {
			const joinData = {
				id: channelState.selectedChannel.id,
				type: channelState.selectedChannel.type,
				email: user.profile.email,
				password: null, //FIXME!!! formData password!
				memberId: -1,
				newPassword: '' //FIXME!!! formData newPassword
			};
			dispatch(channelActions.leaveChannel(joinData));
		}
	};

	const IAmMember = () => {
		if (channelState.members) {
			for (const member of channelState.members) {
				if (user.profile && user.profile.id === member.id) {
					return true;
				}
			}
		}
		return false;
	}

	return (
		<>
		<div className={styles['channel-card']}>
		<form className={settingStyles['form']} onSubmit={onSubmit}>
			<div className={styles['join']}>
				<div className={settingStyles['avatar_setting']}>
					<img className={settingStyles['avatar']} src={picture}/>
					<div className={settingStyles['middle_settings']}>
						<input accept='image/png, image/jpeg, image/jpg' type="file" id='avatar_input' onChange={updateAvatar} hidden/>
						<label htmlFor='avatar_input'><img src='/settings-fill.svg' alt='settings' className={settingStyles['svg']}/></label>
					</div>
				</div>
				{changeUsername === true
					? <input type='text' name='channelName' placeholder={`${channelState.selectedChannel?.name}`} className={styles['username-input']}/>
					: <Headling onClick={() => (setChangeUsername(true))}>{channelState.selectedChannel?.name}</Headling>}
				{IAmMember() !== true 
				? <Button
					className={classNames(settingStyles['btn-dark'], styles['join-btn'])}
					onClick={joinChannel}>Join</Button>
				: <Button
					className={classNames(settingStyles['btn-dark'], styles['join-btn'])}
					onClick={leaveChannel}>Leave</Button>}
			</div>
			{channelState.error ? <div>{channelState.error}</div> : <></>}

			{/* <Input className={settingStyles['input']} type='text' name='name' placeholder='Channel name' autoComplete='off'/> */}
			<fieldset>
				<label htmlFor='type-radio' className={classNames(settingStyles['radio-set'], styles['radio-set'])}>
					Type of your channel
				</label>
				<div id='type-radio' className={settingStyles['radio-set']}>
					<input type="radio" id="public" name="type" value="public" defaultChecked />
					<label htmlFor="public">public</label>

					<input type="radio" id="private" name="type" value="private" />
					<label htmlFor="private">private</label>

					<input type="radio" id="protected" name="type" value="protected" />
					<label htmlFor="protected">protected</label>
				</div>
			</fieldset>
			{isProtected && <Input type='password' placeholder='Password' name='password' className={settingStyles['input']}/>}
			<Button className={classNames(settingStyles['button'], styles['button'])}>Submit</Button>
				{showMmbrs === false
					? <Button className={classNames(settingStyles['button'], styles['button'])} onClick={showMembers}>Show members</Button>
					: <div className={styles['members']}> <h4 className={'headling'}>Members</h4>
					{channelState.members && channelState.members.length > 0
						? channelState.members.map((member: any) => (
							<ChannelShortInfo key={member.id} appearence='member' props={member}/>
						))
						: <></>}
					</div>
				}
		</form>
			</div>
		</>
	);
}

export default ChannelSettings;