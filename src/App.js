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
        <h1 className="appTitle">
          Cool<span className="highlight">Tax</span>Tool
        </h1>
        <UserMenu onUserInputsChange={handleUserInputsChange} />
        <TaxBreakdown inputs={userInputs} />
      </div>
      <div className="taxComponentsContainer">
        <PensionAnalysis inputs={userInputs} />
        <TaxYearOverview inputs={userInputs} />
      </div>
    </div>
  );
}

export default App;
