import React from 'react'
import './styles.css'

function AutoComplete(props) {
    const { predictions, getSuggestionItemProps,visible, handleSelectClick } = props
    const className = 'suggestion-item--active'
    return (
        <div {...getSuggestionItemProps('s', {
            className,
          })} className="autocomplete suggestion-item--active" style={{ display: visible ? 'block' : 'none' }}>
            <div className="autocomplete-container">

                {
                    predictions.map(item =>
                        (
                            <div key={item.id} onClick={() => handleSelectClick(item)} className=" autocomplete-prediction">
                                <div className="autocomplete-prediction-title">{item.formattedSuggestion.mainText}</div>
                                <div className="auctocomplete-prediction-address">{item.description}</div>
                            </div>

                        )
                    )}

            </div>
        </div>
    )
}

export default AutoComplete
