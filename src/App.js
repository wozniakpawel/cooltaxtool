import React, { useState } from 'react';
import { UserMenu, defaultInputs } from './components/UserMenu';
import PensionAnalysis from './components/PensionAnalysis';
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
          {(userInputs.showTaxBreakdown && userInputs.grossIncome > 0) && <TaxBreakdown inputs={userInputs}/>}
          {(userInputs.showPensionAnalysis) && <PensionAnalysis inputs={userInputs}/>}
          {(userInputs.showTaxYearOverview) && <TaxYearOverview inputs={userInputs}/>}
        </div>
      </div>
  );
}

export default App;
