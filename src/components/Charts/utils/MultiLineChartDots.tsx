const MultiLineChartDots = (dotProps: any): JSX.Element => {

    const {dataKey: datakey, plot, flagnd, ...rest}: any = dotProps;
    // console.log('dotProps', dotProps, rest, datakey);

    return (
        (typeof dotProps.cx === 'number') && (typeof dotProps.cy === 'number') ?
        flagnd === 'true' && dotProps.payload[`detectFlag-${plot}`] === 'N' ?
        <circle {...{...rest, datakey: datakey}} fill="var(--color-light-black)"/> :
        <circle {...{...rest, datakey: datakey}} fill="var(--color-graph-blue)"/>
        : <></>
    );
}

export default MultiLineChartDots;