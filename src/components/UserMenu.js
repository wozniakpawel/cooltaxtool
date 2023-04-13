import React, { useState, useEffect } from 'react';
import { defaultInputs } from '../utils/DefaultInputs';

const ToggleButton = ({ name, label, checked, onChange }) => {
    const handleClick = () => {
        onChange({ target: { name, type: 'checkbox', checked: !checked } });
    };

    return (
        <button
            type="button"
            name={name}
            onClick={handleClick}
            className={`toggle-button ${checked ? 'active' : ''}`}
        >
            {label}
        </button>
    );
};

const UserMenu = ({ onUserInputsChange }) => {
    const [inputs, setInputs] = useState(defaultInputs);

    useEffect(() => {
        onUserInputsChange(inputs);
    }, [inputs, onUserInputsChange]);

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        const input = type === 'checkbox' ? checked : value;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setInputs((prevState) => ({
                ...prevState,
                [parent]: { ...prevState[parent], [child]: input },
            }));
        } else {
            setInputs((prevState) => ({ ...prevState, [name]: input }));
        }
    };

    return (
        <div className="UserInputs">
            <form>
                <div className="form-group">
                    <select name="taxYear" value={inputs.taxYear} onChange={handleInputChange}>
                        <option value="2023/24">Tax Year 2023/24</option>
                        {/* Add more tax years if needed */}
                    </select>
                </div>

                <div className="form-group">
                    <select name="studentLoan" value={inputs.studentLoan} onChange={handleInputChange}>
                        <option value="none">No Student Loan</option>
                        <option value="plan1">Student Loan Plan 1</option>
                        <option value="plan2">Student Loan Plan 2</option>
                        <option value="plan4">Student Loan Plan 4</option>
                        <option value="plan5">Student Loan Plan 5</option>
                        <option value="postgrad">Postgraduate Student Loan</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="grossIncome">Annual Gross Income: £</label>
                    <input
                        type="number"
                        name="grossIncome"
                        value={inputs.grossIncome}
                        onChange={handleInputChange}
                    />
                </div>


                <div className="form-group">
                    <fieldset>
                        <legend>Additional options</legend>
                        <ToggleButton
                            name="residentInScotland"
                            label="Resident in Scotland"
                            checked={inputs.residentInScotland}
                            onChange={handleInputChange}
                        />

                        <ToggleButton
                            name="married"
                            label="Married"
                            checked={inputs.married}
                            onChange={handleInputChange}
                        />

                        <ToggleButton
                            name="blind"
                            label="Blind"
                            checked={inputs.blind}
                            onChange={handleInputChange}
                        />

                        <ToggleButton
                            name="noNI"
                            label="Not paying NI"
                            checked={inputs.noNI}
                            onChange={handleInputChange}
                        />
                    </fieldset>
                </div>

                <fieldset>
                    <legend>Pension Contributions</legend>
                    {['autoEnrolment', 'salarySacrifice', 'employer', 'personal'].map((type) => (
                        <div key={type}>
                            <label htmlFor={`pensionContributions.${type}`}>{type}:</label>
                            <input
                                type="number"
                                name={`pensionContributions.${type}.value`}
                                value={inputs.pensionContributions[type].value}
                                onChange={handleInputChange}
                            />
                            <select
                                name={`pensionContributions.${type}.type`}
                                value={inputs.pensionContributions[type].type}
                                onChange={handleInputChange}
                            >
                                <option value="%">%</option>
                                <option value="£">£</option>
                            </select>
                        </div>
                    ))}
                </fieldset>

            </form>
        </div>
    );
};

export default UserMenu;
