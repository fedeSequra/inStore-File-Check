import React, { useState } from 'react';
import Papa from 'papaparse';
import validateFile from './validation';
import Modal from './Modal';
import { FILE_TYPES } from './constants';
import QuickCheckDropzone from './QuickCheckDropzone';

const QuickCheck = ({ onAnalyzeFile }) => {
  const [results, setResults] = useState({
    Stores: null,
    Catalogue: null,
    Users: null,
  });
  const [error, setError] = useState(null);

  const detectFileType = (file, headers) => {
    const lowerCaseName = file.name.toLowerCase();
    if (lowerCaseName.includes('store') || lowerCaseName.includes('center')) {
      return 'Stores';
    }
    if (headers.includes('Username') && headers.includes('Password')) {
      return 'Users';
    }
    if (headers.includes('price_with_tax') || headers.includes('Price')) {
      return 'Catalogue';
    }
    return null;
  };

  const processFile = (file) => {
    if (!file || file.type !== 'text/csv') {
        setError("Invalid file type. Please upload a CSV file.");
        return;
    }

    Papa.parse(file, {
      preview: 1,
      header: true,
      skipEmptyLines: true,
      complete: (headerResults) => {
        const headers = headerResults.meta.fields;
        const type = detectFileType(file, headers);

        if (!type) {
          setError(`Could not detect file type for "${file.name}". Please check the file content and column headers.`);
          return;
        }

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (fullResults) => {
                if (fullResults.errors.length) {
                    setResults(prev => ({
                        ...prev,
                        [type]: { isValid: false, errors: fullResults.errors, fileName: file.name, data: fullResults.data },
                    }));
                } else {
                    const validationResult = validateFile(type, fullResults.data);
                    setResults(prev => ({
                        ...prev,
                        [type]: { ...validationResult, fileName: file.name, data: fullResults.data },
                    }));
                }
            }
        });
      }
    });
  };

  const processFiles = (files) => {
    setResults({ Stores: null, Catalogue: null, Users: null });
    [...files].slice(0, 3).forEach(processFile);
  };

  const renderResult = (type) => {
    const result = results[type];
    let content;
    if (!result) {
        content = <p className="result-text waiting">Waiting for file...</p>;
    } else {
        const isValid = result.isValid;
        content = (
            <div className={`quick-check-result ${isValid ? 'is-correct' : 'has-errors'}`}>
                <p><b>File:</b> {result.fileName}</p>
                <p>{isValid ? '✅ File is valid.' : `❌ Contains ${result.errors.length} errors.`}</p>
                {!isValid && onAnalyzeFile && (
                    <button 
                        className="button button-primary" 
                        onClick={() => onAnalyzeFile(type, result.data, result.fileName)}
                        style={{marginTop: '10px'}}
                    >
                        Analyze
                    </button>
                )}
            </div>
        );
    }
    return (
        <div className="quick-check-item" key={type}>
            <h3>{type}</h3>
            {content}
        </div>
    )
  };

  return (
    <div>
      <Modal message={error} onClose={() => setError(null)} />
      <p style={{textAlign: 'center', marginBottom: '2rem'}}>Drop up to 3 files (Stores, Catalogue, Users) in the area below.</p>
      
      <QuickCheckDropzone onFiles={processFiles} setResults={setResults} />

      <div className="quick-check-container">
        {FILE_TYPES.map(type => renderResult(type))}
      </div>
    </div>
  );
};

export default QuickCheck;
