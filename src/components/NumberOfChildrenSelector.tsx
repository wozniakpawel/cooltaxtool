import { Dropdown, DropdownButton } from 'react-bootstrap';

interface NumberOfChildrenSelectorProps {
  setFieldValue: (field: string, value: number) => void;
  values: { childBenefits: { numberOfChildren: number } };
}

const NumberOfChildrenSelector = ({ setFieldValue, values }: NumberOfChildrenSelectorProps) => {
  const handleSelect = (eventKey: string | null) => {
    if (eventKey) setFieldValue('childBenefits.numberOfChildren', parseInt(eventKey));
  };

  const childrenOptions = Array.from({ length: 6 }, (_, i) => i + 1);

  return (
    <DropdownButton
      id="dropdown-basic-button"
      title={`Number of children: ${values.childBenefits.numberOfChildren}`}
      onSelect={handleSelect}
    >
      {childrenOptions.map((num) => (
        <Dropdown.Item key={num} eventKey={String(num)}>
          {num}
        </Dropdown.Item>
      ))}
    </DropdownButton>
  );
};

export default NumberOfChildrenSelector;
