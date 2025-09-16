import React from 'react';

const AnalyzeIcon = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="3em" width="3em" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);

const CreateIcon = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="3em" width="3em" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
);

const QuickCheckIcon = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="3em" width="3em" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

const LandingPage = ({ onNavigate }) => {
  return (
    <div className="landing-container">
      <h1 className="landing-title">SalesApp Files Check</h1>
      <p className="landing-subtitle">Choose an option to get started</p>
      <div className="landing-options">
        <button className="landing-option-button" onClick={() => onNavigate('analyze')}>
          <AnalyzeIcon />
          <h2>Analyze Files</h2>
          <p>Upload an existing CSV file to validate its content and edit it.</p>
        </button>
        <button className="landing-option-button" onClick={() => onNavigate('create')}>
          <CreateIcon />
          <h2>Create Files</h2>
          <p>Create a new CSV file from scratch using a predefined template.</p>
        </button>
        <button className="landing-option-button" onClick={() => onNavigate('quickCheck')}>
          <QuickCheckIcon />
          <h2>QuickCheck</h2>
          <p>Upload up to 3 files at once for a quick validation summary.</p>
        </button>
      </div>
    </div>
  );
};

export default LandingPage;