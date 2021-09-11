const CustomBarChartLabel = (props: any): JSX.Element => {
      
    // console.log("handling bar chart label", props);
    
    const isVert = props.axisType === 'yAxis';
    const cx = isVert ? props.viewBox.x : props.viewBox.x + (props.viewBox.width / 2);
    const cy = isVert ? (props.viewBox.height / 2) + props.viewBox.y : props.viewBox.y + props.viewBox.height + 10;
    const rot = isVert ? `270 ${cx} ${cy}` : 0;

    return (
      <text
        x={cx}
        y={cy - (props.labelOffset ? props.labelOffset : 0)}
        transform={`rotate(${rot})`}
        textAnchor="middle"
        fill={props.fill}
      >
        {props.children}
      </text>
    );
  }
  
  export default CustomBarChartLabel;