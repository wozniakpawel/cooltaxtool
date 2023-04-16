import React, { useState } from 'react';
import { UserMenu, defaultInputs } from './components/UserMenu';
import TaxAnalysis from './components/TaxAnalysis';
import TaxBreakdown from './components/TaxBreakdown';
import TaxYearOverview from './components/TaxYearOverview';
import './App.css';

function App() {
  const [userInputs, setUserInputs] = useState(defaultInputs);

  const handleUserInputsChange = (newInputs) => {
    setUserInputs(newInputs);
  };

  return (
      <div className="appContainer">
        <div className="inputContainer">
          <UserMenu onUserInputsChange={handleUserInputsChange} />
        </div>
        <div className="taxComponentsContainer">
          <TaxAnalysis inputs={userInputs} />
          {userInputs.grossIncome > 0 && <TaxBreakdown inputs={userInputs} />}
          <TaxYearOverview inputs={userInputs} />
        </div>
      </div>
  );
}

export default App;
