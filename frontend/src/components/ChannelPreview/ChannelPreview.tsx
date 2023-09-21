import axios, { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { BACK_PREFIX } from '../../helpers/API';
import { ChannelShortInfo } from '../ChannelShortInfo/ChannelShortInfo';
import styles from './ChannelPreview.module.css';
import { ChannelPreviewProps } from './ChannelPreview.props';
//import { ChannelPreviewProps } from './ChannelPreview.props';

function ChannelPreview(props: ChannelPreviewProps) {
	const	formatedDate = new Intl.DateTimeFormat('lt-LT').format(new Date(props.data.updatedAt));
	return (
		<div className={styles['preview']}>
			<ChannelShortInfo appearence='list' props={props.data}/>
			<div className={styles['time']}>{formatedDate}</div>
		</div>
	);
}

export default ChannelPreview;