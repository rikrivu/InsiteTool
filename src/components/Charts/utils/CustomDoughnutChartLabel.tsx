import { Text } from 'recharts';

const CustomDoughnutChartLabel = (props: any): JSX.Element => {
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      name,
      fill,
      isMaximized
    } = props;
      const RADIAN: number = Math.PI / 180;
      // let radius: number = (isMaximized ? 175 : 25) + innerRadius + (outerRadius - innerRadius);
      let radius: number = (isMaximized ? 105 : 25) + innerRadius + (outerRadius - innerRadius);
  
      const x: number = cx + radius * Math.cos(-midAngle * RADIAN);
      const y: number = cy + radius * Math.sin(-midAngle * RADIAN);
      
      // console.log("handling label", props, x, y);
    
      return (
        <Text
          x={x}
          y={y}
          fill={fill}
          textAnchor={x > cx ? "start" : "end"}
          dominantBaseline="central"
          fontSize={isMaximized ? 14 : 11}
        >
          {name}
        </Text>
      );
  }
  
  export default CustomDoughnutChartLabel;