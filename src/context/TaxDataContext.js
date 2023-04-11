import React, { createContext, useState } from 'react';
import { fetchTaxConstants } from '../utils/TaxCalc';

const TaxDataContext = createContext();

export const TaxDataProvider = ({ children }) => {
  const [taxData, setTaxData] = useState({});

  const updateTaxData = (taxYear, residentInScotland) => {
    const updatedTaxData = fetchTaxConstants(taxYear, residentInScotland);
    setTaxData(updatedTaxData);
  };

  return (
    <TaxDataContext.Provider value={{ taxData, updateTaxData }}>
      {children}
    </TaxDataContext.Provider>
  );
};

export default TaxDataContext;
