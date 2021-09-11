export interface ResizerComponentProps {
    components: ResizerComponent[];
}

export interface ResizerComponent {
    component: JSX.Element;
    maxHeight?: string;
    minHeight?: string;
    maxWidth?: string;
    minWidth?: string;
}

export interface ResizerCompProps {
   style: React.CSSProperties | undefined;
}