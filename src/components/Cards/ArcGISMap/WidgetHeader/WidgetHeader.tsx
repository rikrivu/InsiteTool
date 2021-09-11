import './WidgetHeader.scss';
import { WidgetHeaderBtn, WidgetHeaderPropsModel, WidgetsStateModel } from '../ArcGISModels';
import ClearIcon from '@material-ui/icons/Clear';
import { getIcon } from '../../../../utils/globalUtilityMethods';
import CustomTooltip from '../../../shared/CustomTooltip/CustomTooltip';

function WidgetHeader (props: WidgetHeaderPropsModel) {
    return (
        <div className="widget-head">
            <div>{props.title}</div>
            <div>
                {
                    !!props.buttons?.length && props.buttons.map((btn: WidgetHeaderBtn, i: number) => (
                        <CustomTooltip key={`bookmarkBtn-${i}`} title={btn.tooltip}>
                            <button type="button" className="icon-btn save-btn"
                                onClick={() => btn.onClick()}
                            >
                                {getIcon(btn.icon)}
                            </button>
                        </CustomTooltip>
                    ))
                }
                <button type="button" className="icon-btn"
                    onClick={() => props.setWidgetsState((prev: WidgetsStateModel) => ({
                    ...prev,
                    [props.valueAccessor]: false
                    }))}
                >
                    <ClearIcon />
                </button>
            </div>
        </div>
    );
}

export default WidgetHeader;