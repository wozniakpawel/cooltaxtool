import React, { createContext, useState } from 'react';
import { calculateTaxes } from '../utils/TaxCalc';

const TaxDataContext = createContext();

export const TaxDataProvider = ({ children }) => {
  const [taxData, setTaxData] = useState({});

  const updateTaxData = (grossIncome, taxYear, options) => {
    const updatedTaxData = calculateTaxes(grossIncome, taxYear, options);
    setTaxData(updatedTaxData);
  };

  return (
    <TaxDataContext.Provider value={{ taxData, updateTaxData }}>
      {children}
    </TaxDataContext.Provider>
  );
};

export default TaxDataContext;
