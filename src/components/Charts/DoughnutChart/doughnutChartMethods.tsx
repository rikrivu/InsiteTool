import { Sector } from 'recharts';

export const renderActiveShape = (props: any): any => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      isMaximized
    } = props;
    // console.log('renderActiveShape Props', props);
    return (
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + (isMaximized ? 20 : 10)}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    );
  };
  
export const renderLabelLine = (props: any): any => {
  
  // console.log('Label Line Props', props);

  const { cx, cy, midAngle, innerRadius, outerRadius, isMaximized, stroke } = props;

  const RADIAN = Math.PI / 180;

  // const radius1 = (isMaximized ? 165 : 20) + innerRadius + (outerRadius - innerRadius);
  const radius1 = (isMaximized ? 95 : 20) + innerRadius + (outerRadius - innerRadius);
  const radius2 = innerRadius + (outerRadius - innerRadius);

  const x2 = cx + radius1 * Math.cos(-midAngle * RADIAN);
  const y2 = cy + radius1 * Math.sin(-midAngle * RADIAN);

  const x1 = cx + radius2 * Math.cos(-midAngle * RADIAN);
  const y1 = cy + radius2 * Math.sin(-midAngle * RADIAN);

  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={1}>
    </line>
  );
}

export const getColorIndex = (index: number): number => {
  return (index > 5 ) ? (index % 6) : index;
}