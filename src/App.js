import React, { useState, useEffect } from 'react';
import UserInputs from './components/UserInputs';
import TaxAnalysis from './components/TaxAnalysis';
import TaxYearOverview from './components/TaxYearOverview';
import { TaxDataProvider } from './context/TaxDataContext';
import './App.css';

function App() {
  const [userInputs, setUserInputs] = useState({});

  const handleUserInputsChange = (inputs) => {
    setUserInputs(inputs);
  };

  useEffect(() => {
    // This effect will be called whenever user inputs change, which is when you can perform tax calculations and pass them to the other components
  }, [userInputs]);

  return (
    <TaxDataProvider>
      <div className="appContainer">
        <div className="inputContainer">
          <UserInputs onUserInputsChange={handleUserInputsChange} />
        </div>
        <div className="taxComponentsContainer">
          <TaxAnalysis />
          <TaxYearOverview />
        </div>
      </div>
    </TaxDataProvider>
  );
  
}

export default App;
