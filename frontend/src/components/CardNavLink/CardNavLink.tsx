import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import styles from './CardNavLink.module.css';
import { CardNavLinkProps } from './CardNavLink.props';

function CardNavLink({ children, className, ...props }: CardNavLinkProps) {
	return (
		<NavLink {...props} className={classNames(styles['card-button'], styles['no-link'], className)}>
			{children}
		</NavLink>
	);
}

export default CardNavLink;
