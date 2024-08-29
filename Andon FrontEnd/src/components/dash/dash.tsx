import classNames from 'classnames';
import styles from './dash.module.scss';

export interface DashProps {
    className?: string;
}

/**
 * This component was created using Codux's Default new component template.
 * To create custom component templates, see https://help.codux.com/kb/en/article/kb16522
 */
export const Dash = ({ className }: DashProps) => {
    return (
        <div className={classNames(styles.root, className)}>
            <div className={styles.dashboard}>
                <h1 className={styles.boardname}>Heading 1</h1>
            </div>
        </div>
    );
};
