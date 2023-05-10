import React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';

const NumberOfChildrenSelector = ({ setFieldValue, values }) => {
  const handleSelect = (eventKey) => {
    setFieldValue('childBenefits.numberOfChildren', parseInt(eventKey));
  };

  const childrenOptions = Array.from({ length: 6 }, (_, i) => i + 1);

  return (
    <DropdownButton
      id="dropdown-basic-button"
      title={`Number of children: ${values.childBenefits.numberOfChildren}`}
      onSelect={handleSelect}
    >
      {childrenOptions.map((num) => (
        <Dropdown.Item key={num} eventKey={num}>
          {num}
        </Dropdown.Item>
      ))}
    </DropdownButton>
  );
};

export default NumberOfChildrenSelector;
