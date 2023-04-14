import React, { useState, useEffect } from 'react';

export const defaultInputs = {
    taxYear: '2023/24',
    residentInScotland: false,
    married: false,
    blind: false,
    noNI: false,
    grossIncome: 0,
    pensionContributions: {
      autoEnrolment: { value: 0 },
      salarySacrifice: { value: 0 },
      personal: { value: 0 },
    },
    studentLoan: 'none',
  };

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

export function UserMenu ({ onUserInputsChange }) {
    const [inputs, setInputs] = useState(defaultInputs);

    const pensionLabels = {
        autoEnrolment: 'Auto Enrolment (%)',
        salarySacrifice: 'Salary/Bonus Sacrifice (£)',
        personal: 'Personal Contributions (£)',
    };

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
                    <label htmlFor="grossIncome">Annual Gross Income (£) </label>
                    <input
                        type="number"
                        name="grossIncome"
                        value={inputs.grossIncome}
                        onChange={handleInputChange}
                        min={0}
                        step={1000}
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

                <div className="pension-input-container">
                    <fieldset>
                        <legend>Pension</legend>
                        {['autoEnrolment', 'salarySacrifice', 'personal'].map((type) => {
                            return (
                                <div key={type} className="pension-input">
                                    <label htmlFor={`pensionContributions.${type}`}>{pensionLabels[type]}</label>
                                    <input
                                        type="number"
                                        name={`pensionContributions.${type}.value`}
                                        value={inputs.pensionContributions[type].value}
                                        onChange={handleInputChange}
                                        min={0}
                                        step={type === 'autoEnrolment' ? 1 : 100}
                                    />
                                </div>
                            );
                        })}
                    </fieldset>
                </div>

            </form>
        </div>
    );
};
