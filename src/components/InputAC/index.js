import React from 'react'
import './styles.css'

export default function InputAC(props) {

    const { placeautocomplete, getInputProps, styleInput, type, label, styles, value, handleChange, handleFocusAutoComplete, defaultValue, handleBlur, name } = props;
    return (
        <div className="input-container">
            <div className="input-group">
                        <input
                            defaultValue={defaultValue}
                            name={name}
                            onFocus={handleFocusAutoComplete}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={value} 
                            type={type}
                            {...getInputProps({
                                className: 'location-search-input',
                                name: 'name'
                            })} />
            </div>
        </div>
    )
}
