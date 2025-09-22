import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import validateFile from './validation';
import Modal from './Modal';

const FileUploader = ({ title, onFileParsed }) => {
  const [file, setFile] = useState(null);
  const [parsingError, setParsingError] = useState(null);

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

  const handleFile = useCallback((selectedFile) => {
    if (!selectedFile || selectedFile.type !== 'text/csv') {
      setParsingError('Please upload a valid CSV file.');
      setFile(null);
      onFileParsed(title, { analysis: null, fileName: null, rowCount: 0, error: 'Invalid file type', data: null });
      return;
    }

    setFile(selectedFile);
    setParsingError(null);

    // First, parse only headers to detect file type
    Papa.parse(selectedFile, {
      preview: 1,
      header: true,
      skipEmptyLines: true,
      complete: (headerResults) => {
        const headers = headerResults.meta.fields;
        const detectedType = detectFileType(selectedFile, headers);

        if (!detectedType) {
          setParsingError(`Could not detect file type for "${selectedFile.name}". Please check the file content and column headers.`);
          onFileParsed(title, { analysis: null, fileName: selectedFile.name, rowCount: 0, error: 'Detection failed', data: null });
          return;
        }

        if (detectedType !== title) {
          setParsingError(`The uploaded file seems to be a "${detectedType}" file, not a "${title}" file. Please use the correct uploader.`);
          onFileParsed(title, { analysis: null, fileName: selectedFile.name, rowCount: 0, error: 'Wrong file type', data: null });
          return;
        }

        // If detection is successful, parse the full file
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
      }
    });
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

  const closeModal = () => {
    setParsingError(null);
  };

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
      <Modal message={parsingError} onClose={closeModal} />
    </div>
  );
};

export default FileUploader;