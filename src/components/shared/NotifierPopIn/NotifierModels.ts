export interface NotifierModel {
    show: 'initial' | 'start' | 'end';
    type: 'success' | 'fail' | null;
    message: string;
    icon? : string;
}