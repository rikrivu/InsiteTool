import { format } from 'date-fns';
import { FC} from 'react';
import { getIcon } from '../../../utils/globalUtilityMethods';

const MultiLineChartTooltip: FC = (props: any) => {

    // console.log('MultiLineChartTooltip Props', props);

    const {payload} = props;

    return payload?.length ? (
        <div className="custom-chart-tooltip ml-tooltip-grid">
            {
                payload.map((item: any, index: number) => {

                    const chemical: string = item.dataKey.substring(item.dataKey.indexOf('-') + 1);

                    return (
                        <div key={`multi-line-${chemical}-${index}`} className="ml-tooltip">
                            <div className="tooltip-head">
                                {chemical}
                                <div style={{background: item.color}} className="tooltip-legend"></div>
                            </div>
                            <div className="tooltip-details">
                                <span className="tooltip-val">
                                    <span>{getIcon('info')}</span>
                                    <span>{item.value.toFixed(2)}</span>
                                </span>
                                <span className="tooltip-flag">
                                    <span
                                        style={{
                                            color: item.payload[`detectFlag-${chemical}`] === 'Y' ?
                                            'var(--color-green-alt)' : 'var(--color-red)'
                                        }}
                                    >{getIcon('flag')}</span>
                                    <span>{item.payload[`detectFlag-${chemical}`]}</span>
                                </span>
                            </div>
                            <div className="tooltip-date">
                                <span>{getIcon('date')}</span>
                                <span>{format(new Date(item.payload.timeStamp), "dd MMM yyyy")}</span>
                            </div>
                        </div>
                    );
                })
            }
        </div>
    ) : <div>No Data Availabe</div>;
}

export default MultiLineChartTooltip;