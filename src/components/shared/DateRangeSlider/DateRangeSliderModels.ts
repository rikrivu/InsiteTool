export interface DateRangeSliderPropsCreate {
    today: Date;
    domainStart: Date;
    step: number;
    dateTicks: number[];
};

export interface DateRangeSliderProps extends DateRangeSliderPropsCreate{
    startDate: Date;
    endDate: Date;
    onDateRangeChange([sDate, eDate]: [Date, Date]): void;
    isMaximized?: boolean;
}