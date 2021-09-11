import './NotifierPopIn.scss';
import ClearIcon from '@material-ui/icons/Clear';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import { Fragment, memo } from 'react';
import { NotifierModel } from './NotifierModels';
import { getIcon } from '../../../utils/globalUtilityMethods';

function NotifierPopInUnMemoized ({show, type, message, icon}: NotifierModel) {
    return (
        <div className={`notifier-container${
                show === 'start' ? ' notifier-start slideIn' : show === 'end' ? ' notifier-end slideOut' : ''
            }${
                type === 'success' ? ' notify-success': type === 'fail' ? ' notify-fail' : ''
            }`}
        >
            {
                type === 'success' ?
                <Fragment>
                    {
                        icon ? getIcon(icon) : <FontAwesomeIcon icon={faCloudUploadAlt}/>
                    }
                    {message}
                </Fragment>
                : type === 'fail' ?
                <Fragment>
                    <ClearIcon/>{message}
                </Fragment>
                : null
            }
        </div>
    );
}

const NotifierPopIn = memo(NotifierPopInUnMemoized);

export default NotifierPopIn;