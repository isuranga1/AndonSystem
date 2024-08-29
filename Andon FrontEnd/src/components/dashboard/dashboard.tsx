import classNames from 'classnames';
import styles from './dashboard.module.scss';

export interface DashboardProps {
    className?: string;
}

/**
 * This component was created using Codux's Default new component template.
 * To create custom component templates, see https://help.codux.com/kb/en/article/kb16522
 */
export const Dashboard = ({ className }: DashboardProps) => {
    return <div className={classNames(styles.root, className)}>Dashboard</div>;
};
