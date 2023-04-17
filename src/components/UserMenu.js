import React, { useState, useEffect } from 'react';

export const defaultInputs = {
    taxYear: '2023/24',
    studentLoan: 'none',
    grossIncome: 0,
    residentInScotland: false,
    noNI: false,
    pensionContributions: {
        autoEnrolment: 0,
        salarySacrifice: 0,
        personal: 0,
    },
    autoEnrolmentAsSalarySacrifice: true,
    taxReliefAtSource: true,
};

const ToggleButton = ({ name, label, checked, onChange, classname }) => {
    const handleClick = () => {
        onChange({ target: { name, type: 'checkbox', checked: !checked } });
    };

    return (
        <button
            type="button"
            name={name}
            onClick={handleClick}
            className={`toggle-button ${checked ? 'active' : ''} ${classname}`}
        >
            {label}
        </button>
    );
};

export function UserMenu({ onUserInputsChange }) {
    const [inputs, setInputs] = useState(defaultInputs);
    const [warningMessage, setWarningMessage] = useState('');

    useEffect(() => {
        onUserInputsChange(inputs);
    }, [inputs, onUserInputsChange]);

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        let input = type === 'checkbox' ? checked : value;

        // Convert pension input value to a number
        if (name.startsWith('pensionContributions') || name === 'grossIncome') {
            input = parseInt(value, 10);
        }

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setInputs((prevState) => ({
                ...prevState,
                [parent]: { ...prevState[parent], [child]: input },
            }));
        } else {
            setInputs((prevState) => ({ ...prevState, [name]: input }));
        }

        if (name === 'taxYear' && value === '2022/23') {
            setWarningMessage('Warning: NI calculations for the 2022/23 tax year might not be accurate due to the varying rates and thresholds. Effective rates and thresholds are being used to estimate the Employer and Employee NI contributions.');
        } else if (name === 'taxYear') {
            setWarningMessage('');
        }
    };

    return (
        <div className="UserInputs">
            <form>
                <div className="form-group">
                    <select name="taxYear" value={inputs.taxYear} onChange={handleInputChange}>
                        <option value="2023/24">Tax Year 2023/24</option>
                        <option value="2022/23">Tax Year 2022/23</option>
                        <option value="2021/22">Tax Year 2021/22</option>
                        <option value="2020/21">Tax Year 2020/21</option>
                        <option value="2019/20">Tax Year 2019/20</option>
                        <option value="2018/19">Tax Year 2018/19</option>
                        <option value="2017/18">Tax Year 2017/18</option>
                    </select>
                    {warningMessage && <p className="warning-message">{warningMessage}</p>}
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
                            name="noNI"
                            label="Exclude NI"
                            checked={inputs.noNI}
                            onChange={handleInputChange}
                        />
                    </fieldset>
                </div>

                <div className="pension-input-container">
                    <fieldset>
                        <legend>Pension</legend>
                        <div className="pension-input">
                            <label htmlFor="pensionContributions.autoEnrolment">Auto Enrolment (%)</label>
                            <input
                                type="number"
                                name="pensionContributions.autoEnrolment"
                                value={inputs.pensionContributions.autoEnrolment}
                                onChange={handleInputChange}
                                min={0}
                                max={100}
                                step={1}
                            />
                            <ToggleButton
                                classname="toggle-button-small"
                                name="autoEnrolmentAsSalarySacrifice"
                                label="As salary sacrifice"
                                checked={inputs.autoEnrolmentAsSalarySacrifice}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="pension-input">
                            <label htmlFor="pensionContributions.salarySacrifice">Salary/Bonus Sacrifice (£)</label>
                            <input
                                type="number"
                                name="pensionContributions.salarySacrifice"
                                value={inputs.pensionContributions.salarySacrifice}
                                onChange={handleInputChange}
                                min={0}
                                step={100}
                            />
                        </div>
                        <div className="pension-input">
                            <label htmlFor="pensionContributions.personal">Personal Contributions (£)</label>
                            <input
                                type="number"
                                name="pensionContributions.personal"
                                value={inputs.pensionContributions.personal}
                                onChange={handleInputChange}
                                min={0}
                                step={100}
                            />
                            <ToggleButton
                                classname="toggle-button-small"
                                name="taxReliefAtSource"
                                label="Relief at source"
                                checked={inputs.taxReliefAtSource}
                                onChange={handleInputChange}
                            />
                        </div>

                    </fieldset>
                </div>

            </form >
        </div >
    );
};
