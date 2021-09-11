import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { ChartFilterProps } from '../../../models/LayoutCardHeaderModels';

export function useChartFilterWidget (initState: ChartFilterProps['filters'])
: [ChartFilterProps['filters'], (checked: boolean, key: string) => void] {

    const [chartFilterState, setChartFilterState]: [ChartFilterProps['filters'], Dispatch<SetStateAction<ChartFilterProps['filters']>>]
    = useState<ChartFilterProps['filters']>(initState)

    const changeChartFilterState = useCallback((checked: boolean, key: string) => {
        setChartFilterState((prev: ChartFilterProps['filters']) => ({
            ...prev,
            [key]: {
                ...prev[key as keyof ChartFilterProps['filters']],
                isActive: checked
            }
        }))
    }, [])

    return [chartFilterState, changeChartFilterState]

}