import styles from './Settings.module.css';
import layoutStyles from '../Layout/Layout.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { Profile, UpdateUser } from '../../interfaces/user.interface';
import { GameScheme, Side } from '../../../../pong/static/common';
import Headling from '../../components/Headling/Headling';
import { FormEvent, useEffect, useState } from 'react';
import { disable2fa, enable2fa, getProfile, updateProfile, uploadAvatar, userActions } from '../../store/user.slice';
import { socket } from '../Pong/pong';
import { msToTime } from '../../helpers/functions';
import Button from '../../components/Button/Button';
import GameHistoryItem from '../MemberPreview/GameHistoryItem/GameHistoryItem';
import QRCode from 'qrcode';
import { getCookie } from 'typescript-cookie';


export function Settings() {

	const user = useSelector((s: RootState) => s.user);
	const dispatch = useDispatch<AppDispatch>();
	const [showGH, setShowGH] = useState<boolean>(false);
	const [twoFA, setTwoFA] = useState<boolean>(user.profile ? user.profile.twoFA : false);
	const [changeUsername, setChangeUsername] = useState<boolean>(false);

	const onSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		let username = user.profile?.username;
		console.log(e.currentTarget.side.value);
		console.log(e.currentTarget.scheme.value);
		console.log(e.currentTarget.twoFAbox.checked);
		if (e.currentTarget.username && e.currentTarget.username.value != username) {
			username = e.currentTarget.username.value;
		}
		const updateData: UpdateUser = {
			id: user.profile?.id,
			username: username, //FIXME!!! username from the form
			avatar: user.profile?.avatar, //FIXME!!! avatar from the form
			prefferedTableSide: parseInt(e.currentTarget.side.value),
			pongColorScheme: parseInt(e.currentTarget.scheme.value)
		};
		// if (e.currentTarget.enable.checked === true) {
		// 	dispatch(enable2fa());
		// } else {
		// 	dispatch(disable2fa());
		// }
		if (e.currentTarget.twoFAbox.checked === true && twoFA === false) {
			dispatch(enable2fa());
			setTwoFA(true);
		}
		if (e.currentTarget.twoFAbox.checked === false && twoFA === true) {
			setTwoFA(false);
			dispatch(disable2fa());
		}
		// console.log('new player', user.profile);
		// socket.emit('new player', {name: updateData.username, id: updateData.id, side: updateData.prefferedTableSide, scheme: updateData.pongColorScheme});
		dispatch(userActions.setProfile(updateData));
		dispatch(updateProfile(updateData));
		setChangeUsername(false);
	};

	const updateAvatar = (e: FormEvent<HTMLInputElement>) => {
		const target = e.target as HTMLInputElement;
		const user_id = Number(getCookie('userId'))
		if (user_id && target.files && target.files.length) {
			const avatar = target.files[0];

			const formData = new FormData();
			formData.append('avatar', avatar, );
			const file_name = dispatch(uploadAvatar(formData));
			console.log(`Filename: ${file_name}`);
			let update_user: UpdateUser = {
				id: user.profile?.id,
				username: user.profile?.username, //FIXME!!! username from the form
				avatar: `http://${import.meta.env.VITE_BACK_HOST}:${import.meta.env.VITE_BACK_PORT}/user/avatars/` + user_id + '.png', //FIXME!!! avatar from the form
				prefferedTableSide: user.profile?.prefferedTableSide,
				pongColorScheme: user.profile?.pongColorScheme,
			};
			
			dispatch(userActions.setProfile(update_user));
			dispatch(updateProfile(update_user));
			window.location.reload(false);
		}
		
	}

	useEffect(() => {
		dispatch(getProfile(user.userId));
	}, [dispatch, twoFA]);

	useEffect(() => {
		if (user.profile) {
			dispatch(userActions.getGameHistory(user.profile.id));
		}
	}, [dispatch]);

	useEffect(() => {
		if (user.qrUri) {
			QRCode.toCanvas(document.getElementById('qrcode'), user.qrUri, function (error) {
				if (error) console.error(error)
				console.log('success!');
			});
		}
	}, [user.qrUri, user.statuses]);

	useEffect(() => {
		// if (twoFA === true) {
		// 	dispatch(enable2fa());
		// } else {
		// 	dispatch(disable2fa());
		// }
	}, user.statuses);

	const showGameHistory = () => {
		if (user.profile && user.profile.id) {
			dispatch(userActions.getGameHistory(user.profile.id));
			setShowGH(true);
		}
	};

	return (
		<>
			<div className={styles['profile-card']}>
				<div className={styles['avatar_setting']}>
					<img className={styles['avatar']} src={user.profile?.avatar ? user.profile.avatar : '/default_avatar.png'}/>
					<div className={styles['middle_settings']}>
						<input accept='image/png, image/jpeg, image/jpg' type="file" id='avatar_input' onChange={updateAvatar} hidden/>
						<label htmlFor='avatar_input'><img src='/settings-fill.svg' alt='settings' className={styles['svg']}/></label>
					</div>
				</div>
				<form className={styles['profile-form']} onSubmit={onSubmit}>
					{changeUsername === true
						? <input type='text' name='username' placeholder={`${user.profile?.username}`}/>
						: <Headling onClick={() => (setChangeUsername(true))}>{user.profile?.username}</Headling>}
					<div>{user.profile?.email}</div>
					<fieldset>
						<label htmlFor='side' className={styles['label-head']}>Preffered table side:</label>
						<div id='side' className={styles['radio-set']}>
							<div className={styles['radio']}>
								{user.profile?.prefferedTableSide == Side.LEFT
									? <input type="radio" id="LEFT" name="side" value={Side.LEFT} defaultChecked/>
									: <input type="radio" id="LEFT" name="side" value={Side.LEFT}/>
								}
								<label htmlFor="LEFT">left</label>
							</div>
							<div className={styles['radio']}>
								{user.profile?.prefferedTableSide == Side.RIGHT
									? <input type="radio" id="RIGHT" name="side" value={Side.RIGHT} defaultChecked/>
									: <input type="radio" id="RIGHT" name="side" value={Side.RIGHT}/>
								}
								<label htmlFor="RIGHT">right</label>
							</div>
						</div>
					</fieldset>
					<fieldset>
						<label htmlFor='scheme' className={styles['label-head']}>Pong color scheme:</label>
						<div id='scheme' className={styles['radio-set']}>
							<div className={styles['radio']}>
								{user.profile?.pongColorScheme == GameScheme.GENERAL
									? <input type="radio" id="GENERAL" name="scheme" value={GameScheme.GENERAL} defaultChecked/>
									: <input type="radio" id="GENERAL" name="scheme" value={GameScheme.GENERAL}/>
								}
								<label htmlFor="GENERAL">general</label>
							</div>
							<div className={styles['radio']}>
								{user.profile?.pongColorScheme == GameScheme.REVERSE
									? <input type="radio" id="REVERSE" name="scheme" value={GameScheme.REVERSE} defaultChecked/>
									: <input type="radio" id="REVERSE" name="scheme" value={GameScheme.REVERSE}/>
								}
								<label htmlFor="REVERSE">reverse</label>
							</div>
						</div>
					</fieldset>
					<div className={styles['auth-row']}>
						<label htmlFor='enable' className={styles['label-head']}>Google Authentication</label>
							{twoFA === true
							? <input type='checkbox' name='twoFAbox' defaultChecked/>
							: <input type='checkbox' name='twoFAbox'/>}
					</div>
					<Button className={styles['submit']}>Submit</Button>
				</form>
				{twoFA === true
				? <canvas id='qrcode'/>
				: <></>}
			</div>
			<div className={styles['other']}>
				<div className={styles['stats']}>
					<div className={styles['row']}>
						<h4>Rank:</h4>
						<p>{user.profile?.rank}</p>
					</div>
					<div className={styles['row']}>
						<h4>Score:</h4>
						<p>{user.profile?.score}</p>
					</div>
					<div className={styles['row']}>
						<h4>Play time:</h4>
						<p>{msToTime(user.profile?.playTime)}</p>
					</div>
					<div className={styles['row']}>
						<h4>Wins:</h4>
						<p>{user.profile?.gamesWon}</p>
					</div>
					<div className={styles['row']}>
						<h4>Defeats:</h4>
						<p>{user.profile?.gamesLost}</p>
					</div>
					<div className={styles['row']}>
						<h4>Played total:</h4>
						<p>{user.profile?.gamesPlayed}</p>
					</div>
					{showGH === false
						? <Button className={styles['btn-dark']} onClick={showGameHistory}>Show game history</Button>
						: <> <h3>Game History</h3>
							{user.selectedGameHistory && user.selectedGameHistory.length > 0
								? user.selectedGameHistory.map((game: any) => (<GameHistoryItem data={game}/>))
								: <p>Empty</p>}
						</>
					}
					{/* <h3>Game History</h3>
					{user.selectedGameHistory && user.selectedGameHistory.length > 0
						? user.selectedGameHistory.map((game: any) => (<GameHistoryItem data={game}/>))
						: <p>Empty</p>} */}
				</div>
			</div>
		</>
	);
}