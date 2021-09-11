import { to2DecimalPlacesPipe } from '../../../utils/globalUtilityMethods';

const createTooltipLayout = (props: any): JSX.Element => {

  // console.log('Tooltip Props', props);

  const {chartType, payload, label, color} = props;

  switch (chartType) {

    case 'doughnut': {
      return payload?.length ? (
        <div className="custom-chart-tooltip">
          <div className="tooltip-label">{payload[0].name}</div>
          <div className="tooltip-data">
            <div className="tooltip-legend">
              <div style={{background: payload[0].payload.color}}></div>
            </div>
            <div>{to2DecimalPlacesPipe(payload[0].value, 'number')}</div>
            {
              !!payload[0].payload.percentage &&
              <div>({to2DecimalPlacesPipe(payload[0].payload.percentage, 'percent')})</div>
            }
          </div>
        </div>
      ) : <div>No Data Available</div>;
    }

    case 'brush-bar': case 'horizontal-bar': {
      return payload?.length ? (
        <div className="custom-chart-tooltip">
          <div className="tooltip-label">{label}</div>
          <div className="tooltip-data">
            <div className="tooltip-legend">
              <div style={{background: color}}></div>
            </div>
            <div>{payload[0].name} :</div>
            <div>{to2DecimalPlacesPipe(payload[0].value, 'number')}</div>
          </div>
        </div>
      ) : <div>No Data Available</div>;
    }

    case 'stacked-bar': {
      return payload?.length ? (
        <div className="custom-chart-tooltip">
          {
            Object.keys(payload[0].payload).map((key: string, index: number) => {
              // console.log('Tooltip key', key, index, payload[0].payload);
              return key !== 'name' && payload[0].payload[key].graphic !== 'NONE' ?
              (
                <div key={`sb-tooltip-${label}-${key}-${index}`} className="sb-tooltip-data">
                  <div>{payload[0].payload[key].graphic}:</div>
                  <div>{payload[0].payload[key].value} ft</div>
                </div>
              )
              : null;
            })
          }
        </div>
      ) : <div>No Data Availabe</div>;
    }

    default: {
      return (
        <div>No Data Available</div>
      );
    }    
  }
} 

const CustomChartTooltip = (props: any) => {

  // console.log('Tooltip Props', props);

  return props.active ? createTooltipLayout(props) : null;
};

export default CustomChartTooltip;