import { Theme, withStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';

const CustomSwitch = withStyles((theme: Theme) => ({
    root: {
        // width: 54,
        // height: 40,
        // padding: 12,
        width: 30,
        height: 16,
        padding: 0,
        display: 'flex',
    },
    switchBase: {
        position: 'absolute',
        // top: 12,
        // left: 13,
        left: 1,
        padding: 2,
        color: theme.palette.common.white,
        '&$checked': {
            transform: 'translateX(12px)',
            color: theme.palette.common.white,
            '& + $track': {
                opacity: 1,
                backgroundColor: 'var(--color-green-alt)',
                borderColor: 'var(--color-green-alt)',
            },
        },
    },
    thumb: {
        width: 12,
        height: 12,
        boxShadow: 'none',
    },
    track: {
        border: 'none',
        borderRadius: 16 / 2,
        opacity: 1,
        backgroundColor: theme.palette.grey[500]
    },
    checked: {},
}))(Switch);

export default CustomSwitch;
