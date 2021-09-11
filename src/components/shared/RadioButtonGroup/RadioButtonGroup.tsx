import './RadioButtonGroup.scss';
import { RadioButtonComponentProps, RadioButtonOption } from './RadioButtonGroupModels';

function RadioButtonGroup (props: RadioButtonComponentProps) {

    // console.log('RadioButtonGroup', props)
    
    return (
        props.options.length ?
        <div id={props.groupId} className="radio-btn-wrapper">

            {
                props.options.map((option: RadioButtonOption) => (
                    <div key={option.id}>
                        <input
                            id={option.id}
                            type="radio"
                            className="radio-input"
                            name={option.name}
                            value={option.id}
                            onChange={props.handleRadioButtonToggle}
                            checked={props.selected === option.id}
                        />
                        <label htmlFor={option.id}>{option.name}</label>
                    </div>
                ))
            }
        
        </div>
        : <div>No Option to show for Radio Group</div>
    );
}

export default RadioButtonGroup;