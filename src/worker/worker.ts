import { APIResponse } from '../models/APIModels';
import { FiltersStateObject } from '../models/FilterCardModels';
import { getDrillDownSummary } from '../services/data-service';

export async function processData(filtersState: FiltersStateObject): Promise<any> {

    return await getDrillDownSummary(filtersState).then((res: APIResponse<any>) => {
        // console.log('Response downloading DrillDown Summary', res);
        if (res.resultSet.length) {
            return res.resultSet;
        } else {
            return [];
        }
        // if (res) {
        //     return res.soilSummary;
        // } else {
        //     return [];
        // }
    }).catch(err => {
        console.log('Error downloading DrillDown Summary', err);
        return [];
    });
}