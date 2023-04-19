import React, { useState } from 'react';
import { UserMenu, defaultInputs } from './components/UserMenu';
import PensionAnalysis from './components/PensionAnalysis';
import TaxBreakdown from './components/TaxBreakdown';
import TaxYearOverview from './components/TaxYearOverview';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [userInputs, setUserInputs] = useState(defaultInputs);

  const handleUserInputsChange = (newInputs) => {
    setUserInputs(newInputs);
  };

  return (
    <div className="App">
      <div className="main-container">
        <aside className="sidebar">
          <h1 className="appTitle">
            Cool<span className="highlight">Tax</span>Tool
          </h1>
          <UserMenu onUserInputsChange={handleUserInputsChange} />
          <TaxBreakdown inputs={userInputs} />
        </aside>
        <main className="content">
          <PensionAnalysis inputs={userInputs} />
          <TaxYearOverview inputs={userInputs} />
          <PensionAnalysis inputs={userInputs} />
          <TaxYearOverview inputs={userInputs} />
        </main>
      </div>
      <footer className="footer">
        <Footer />
      </footer>
    </div>
  );
}

export default App;
