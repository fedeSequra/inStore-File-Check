import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import validateFile from './validation';

const FileUploader = ({ title, onFileParsed }) => {
  const [file, setFile] = useState(null);
  const [parsingError, setParsingError] = useState(null);

  const handleFile = useCallback((selectedFile) => {
    if (selectedFile && selectedFile.type === 'text/csv') {
      const lowerCaseName = selectedFile.name.toLowerCase();
      if (title === 'Stores' && !lowerCaseName.includes('store') && !lowerCaseName.includes('center')) {
        const errorMsg = 'The Stores file name must contain "store(s)" or "center(s)".';
        setParsingError(errorMsg);
        setFile(null);
        onFileParsed(title, { analysis: null, fileName: selectedFile.name, rowCount: 0, error: errorMsg, data: null });
        return;
      }

      setFile(selectedFile);
      setParsingError(null);

      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length) {
            const errorMsg = results.errors[0].message;
            setParsingError(errorMsg);
            onFileParsed(title, { analysis: null, fileName: selectedFile.name, rowCount: 0, error: errorMsg, data: null });
          } else {
            const validationResult = validateFile(title, results.data);
            onFileParsed(title, {
              analysis: validationResult,
              fileName: selectedFile.name,
              rowCount: results.data.length,
              error: null,
              data: results.data,
            });
          }
        },
        error: (error) => {
          const errorMsg = error.message;
          setParsingError(errorMsg);
          onFileParsed(title, { analysis: null, fileName: selectedFile.name, rowCount: 0, error: errorMsg, data: null });
        }
      });
    } else {
      const errorMsg = 'Please upload a valid CSV file.';
      setFile(null);
      setParsingError(errorMsg);
      onFileParsed(title, { analysis: null, fileName: null, rowCount: 0, error: errorMsg, data: null });
    }
  }, [title, onFileParsed]);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleFileInput = useCallback((event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  return (
    <div className="file-uploader" onDrop={handleDrop} onDragOver={handleDragOver}>
      <h3>{title}</h3>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileInput}
        className="file-input"
        id={`file-upload-${title}`}
      />
      <label htmlFor={`file-upload-${title}`} className="file-label button button-primary">
        {file ? file.name : 'Drag & drop or click to upload CSV'}
      </label>
      {parsingError && <p className="error-text">{parsingError}</p>}
    </div>
  );
};

export default FileUploader;