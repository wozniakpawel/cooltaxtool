import React, { useState, useEffect, useContext } from 'react';
import TaxDataContext from '../context/TaxDataContext';

const UserInputs = ({ onUserInputsChange }) => {
    const { updateTaxData } = useContext(TaxDataContext);
    const [inputs, setInputs] = useState({
        taxYear: '2023/24',
        residentInScotland: false,
        married: false,
        blind: false,
        noNI: false,
        grossSalary: 0,
        salaryPeriod: 'annual',
        pensionContributions: {
            autoEnrollment: { value: 0, type: '%' },
            employer: { value: 0, type: '%' },
            salarySacrifice: { value: 0, type: '%' },
            personal: { value: 0, type: '%' },
        },
        studentLoan: 'none',
    });

    useEffect(() => {
        onUserInputsChange(inputs);
    }, [inputs, onUserInputsChange]);

    useEffect(() => {
        const residentInScotland = inputs.residentInScotland;
        updateTaxData(inputs.taxYear, residentInScotland);
    }, [inputs.taxYear, inputs.residentInScotland, updateTaxData]);

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
                <label htmlFor="taxYear">Tax Year:</label>
                <select name="taxYear" value={inputs.taxYear} onChange={handleInputChange}>
                    <option value="2023/24">2023/24</option>
                    {/* Add more tax years if needed */}
                </select>

                <label htmlFor="residentInScotland">Resident in Scotland:</label>
                <input
                    type="checkbox"
                    name="residentInScotland"
                    checked={inputs.residentInScotland}
                    onChange={handleInputChange}
                />

                <label htmlFor="married">Married:</label>
                <input
                    type="checkbox"
                    name="married"
                    checked={inputs.married}
                    onChange={handleInputChange}
                />

                <label htmlFor="blind">Blind:</label>
                <input
                    type="checkbox"
                    name="blind"
                    checked={inputs.blind}
                    onChange={handleInputChange}
                />

                <label htmlFor="noNI">No NI:</label>
                <input
                    type="checkbox"
                    name="noNI"
                    checked={inputs.noNI}
                    onChange={handleInputChange}
                />

                <label htmlFor="grossSalary">Gross Salary:</label>
                <input
                    type="number"
                    name="grossSalary"
                    value={inputs.grossSalary}
                    onChange={handleInputChange}
                />

                <label htmlFor="salaryPeriod">Salary Period:</label>
                <select
                    name="salaryPeriod"
                    value={inputs.salaryPeriod}
                    onChange={handleInputChange}
                >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                </select>

                <fieldset>
                    <legend>Pension Contributions:</legend>
                    {['autoEnrollment', 'employer', 'salarySacrifice', 'personal'].map((type) => (
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

                <label htmlFor="studentLoan">Student Loan:</label>
                <select name="studentLoan" value={inputs.studentLoan} onChange={handleInputChange}>
                    <option value="none">None</option>
                    <option value="plan1">Plan 1</option>
                    <option value="plan2">Plan 2</option>
                    <option value="plan4">Plan 4</option>
                    <option value="postgrad">Postgraduate</option>
                </select>
            </form>
        </div>
    );
};

export default UserInputs;
