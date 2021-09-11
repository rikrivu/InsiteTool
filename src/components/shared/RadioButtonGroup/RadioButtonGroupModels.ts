export interface RadioButtonOption {
    name: string;
    id: string;
}

export interface RadioButtonComponentProps {
    groupId: string;
    options: RadioButtonOption[];
    handleRadioButtonToggle(event: any): void;
    selected: string;
}