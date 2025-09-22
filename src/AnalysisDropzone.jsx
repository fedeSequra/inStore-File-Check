import React, { useState, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import validateFile from './validation';

const AnalysisDropzone = ({ onFileParsed, setAnalysisData, setError, setActiveTab }) => {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef(null);

    const detectFileType = (file, headers) => {
        const lowerCaseName = file.name.toLowerCase();
        if (lowerCaseName.includes('store') || lowerCaseName.includes('center')) return 'Stores';
        if (headers.includes('Username') && headers.includes('Password')) return 'Users';
        if (headers.includes('price_with_tax') || headers.includes('Price')) return 'Catalogue';
        return null;
    };

    const processFile = useCallback((file) => {
        if (!file || file.type !== 'text/csv') {
            setError("Invalid file type. Please upload a CSV file.");
            return;
        }
        Papa.parse(file, { preview: 1, header: true, skipEmptyLines: true, complete: (headerResults) => {
            const type = detectFileType(file, headerResults.meta.fields);
            if (!type) { 
                setError(`Could not detect file type for "${file.name}". Please check the file content and column headers.`);
                return; 
            }
            setActiveTab(type);
            Papa.parse(file, { header: true, skipEmptyLines: true, complete: (fullResults) => {
                let analysisResult;
                if (fullResults.errors.length) {
                    analysisResult = { isValid: false, errors: fullResults.errors };
                } else {
                    analysisResult = validateFile(type, fullResults.data);
                }
                onFileParsed(type, { 
                    analysis: analysisResult, 
                    fileName: file.name,
                    data: fullResults.data,
                    rowCount: fullResults.data.length,
                    error: null
                });
            }});
        }});
    }, [onFileParsed, setActiveTab, setError]);

    const handleDrop = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            setAnalysisData({ Stores: null, Catalogue: null, Users: null });
            processFile(event.dataTransfer.files[0]);
        }
    }, [processFile, setAnalysisData]);

    const handleFileSelect = (event) => {
        if (event.target.files && event.target.files.length > 0) {
            setAnalysisData({ Stores: null, Catalogue: null, Users: null });
            processFile(event.target.files[0]);
        }
    };

    const handleZoneClick = () => {
        inputRef.current.click();
    };

    const handleDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation(); }, []);
    const handleDragEnter = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }, []);
    const handleDragLeave = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }, []);

    return (
        <div 
            className={`quick-check-dropzone ${isDragging ? 'dragging' : ''}`}
            onClick={handleZoneClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
        >
            <input type="file" ref={inputRef} accept=".csv" style={{ display: 'none' }} onChange={handleFileSelect} />
            <p>Drag & drop a single file to analyze and edit</p>
        </div>
    );
};

export default AnalysisDropzone;