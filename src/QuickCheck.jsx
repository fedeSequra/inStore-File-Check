import React, { useState, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import validateFile from './validation';

const FILE_TYPES = ['Stores', 'Catalogue', 'Users'];

const QuickCheck = ({ onAnalyzeFile }) => {
  const [results, setResults] = useState({
    Stores: null,
    Catalogue: null,
    Users: null,
  });
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

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
        console.error("Invalid file type:", file.name);
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
          console.error("Could not detect file type for:", file.name);
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

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    processFiles(event.dataTransfer.files);
  }, []);

  const handleFileSelect = (event) => {
    processFiles(event.target.files);
  };

  const handleZoneClick = () => {
    inputRef.current.click();
  };

  const handleDragOver = useCallback((event) => { event.preventDefault(); event.stopPropagation(); }, []);
  const handleDragEnter = useCallback((event) => { event.preventDefault(); event.stopPropagation(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((event) => { event.preventDefault(); event.stopPropagation(); setIsDragging(false); }, []);

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
      <p style={{textAlign: 'center', marginBottom: '2rem'}}>Drop up to 3 files (Stores, Catalogue, Users) in the area below.</p>
      
      <div 
        className={`quick-check-dropzone ${isDragging ? 'dragging' : ''}`}
        onClick={handleZoneClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <input 
            type="file" 
            ref={inputRef} 
            multiple 
            accept=".csv" 
            style={{ display: 'none' }} 
            onChange={handleFileSelect} 
        />
        <p>Drag your files here or click to select</p>
      </div>

      <div className="quick-check-container">
        {FILE_TYPES.map(type => renderResult(type))}
      </div>
    </div>
  );
};

export default QuickCheck;
