import React, { useState, useCallback } from 'react';
import EditorView from './EditorView';
import QuickCheck from './QuickCheck';
import LandingPage from './LandingPage';
import HelpButton from './HelpButton';

function App() {
  const [mainView, setMainView] = useState('landing'); // landing, analyze, create, quickCheck
  const [fileToLoadFromQuickCheck, setFileToLoadFromQuickCheck] = useState(null);

  const navigate = (view) => {
    setMainView(view);
  };

  const handleAnalyzeQuickCheckFile = useCallback((fileType, fileData, fileName) => {
    console.log("App.jsx: handleAnalyzeQuickCheckFile called with:", { fileType, fileData, fileName });
    setFileToLoadFromQuickCheck({ type: fileType, data: fileData, fileName: fileName });
    navigate('analyze');
  }, []);

  const handleEditorViewLoaded = useCallback(() => {
    setFileToLoadFromQuickCheck(null);
  }, []);

  const renderHeader = () => {
    if (mainView === 'landing') {
      return (
        <header className="app-header">
          <HelpButton />
        </header>
      );
    }

    return (
      <header className="app-header">
        <h1 className="app-title" onClick={() => navigate('landing')}>
          SalesApp Files Check
        </h1>
        <HelpButton />
      </header>
    );
  };

  const renderView = () => {
    switch (mainView) {
      case 'landing':
        return <LandingPage onNavigate={navigate} />;
      case 'quickCheck':
        return <QuickCheck onAnalyzeFile={handleAnalyzeQuickCheckFile} />;
      case 'analyze':
        return <EditorView mode="analyze" fileToLoad={fileToLoadFromQuickCheck} onEditorViewLoaded={handleEditorViewLoaded} />;
      case 'create':
        return <EditorView mode="create" />;
      default:
        return <LandingPage onNavigate={navigate} />;
    }
  }

  return (
    <div className="app-container">
      {renderHeader()}
      <main>
        {renderView()}
      </main>
    </div>
  );
}

export default App;