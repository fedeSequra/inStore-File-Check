import React, { useState, useEffect, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import CsvEditor from './CsvEditor';
import validateFile from './validation';
import Modal from './Modal';

const AddIcon = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TrashIcon = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const RefreshIcon = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>;
const DownloadIcon = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const CreateIcon = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
);

const TABS = ['Stores', 'Catalogue', 'Users'];
const initialAnalysisState = { analysis: null, fileName: null, rowCount: 0, data: null, error: null };

const initialState = {
  Stores: initialAnalysisState,
  Catalogue: initialAnalysisState,
  Users: initialAnalysisState,
};

const EditorView = ({ mode, fileToLoad, onEditorViewLoaded }) => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [analysisData, setAnalysisData] = useState(initialState);
  const [isAccordionOpen, setAccordionOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (fileToLoad && mode === 'analyze') {
      const { type, data, fileName } = fileToLoad;
      const validationResult = validateFile(type, data);
      const invalidHeadersError = validationResult.errors.find(e => e.code === 'INVALID_HEADERS');

      if (invalidHeadersError) {
        setError(invalidHeadersError.message);
        setAnalysisData(initialState);
      } else {
        setAnalysisData(prevData => ({
          ...prevData,
          [type]: {
            analysis: validationResult,
            fileName: fileName,
            rowCount: data.length,
            data: data,
            error: null,
          },
        }));
      }
      
      setActiveTab(type);
      setTimeout(() => {
        onEditorViewLoaded(); 
      }, 0);
    } else if (mode === 'analyze') {
      try {
        const savedData = localStorage.getItem('instoreFilesCheckData');
        if (savedData) {
          setAnalysisData(JSON.parse(savedData));
        }
      } catch (error) {
        console.error("Failed to parse data from localStorage", error);
      }
    } else if (mode === 'create') {
      setAnalysisData(initialState);
      setActiveTab(TABS[0]);
    }
  }, [fileToLoad, mode, onEditorViewLoaded]);

  useEffect(() => {
    localStorage.setItem('instoreFilesCheckData', JSON.stringify(analysisData));
  }, [analysisData]);

  const handleFileParsed = (type, result) => {
    const invalidHeadersError = result.analysis.errors.find(e => e.code === 'INVALID_HEADERS');
    if (invalidHeadersError) {
      setError(invalidHeadersError.message);
      setAnalysisData(initialState);
    } else {
      const newState = mode === 'analyze' ? initialState : analysisData;
      setAnalysisData({
        ...newState,
        [type]: result,
      });
    }
    setAccordionOpen(false);
  };

  const handleCreateFromTemplate = (templateName, tabName) => {
    setActiveTab(tabName);
    fetch(`/templates/${templateName}.csv`)
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const headers = results.meta.fields;
            const emptyRow = headers.reduce((acc, header) => ({ ...acc, [header]: '' }), {});
            const initialData = [emptyRow];
            const validationResult = validateFile(tabName, initialData);

            setAnalysisData(prevData => ({
              ...prevData,
              [tabName]: {
                analysis: validationResult,
                fileName: `${templateName}.csv`,
                rowCount: 1,
                error: null,
                data: initialData,
              }
            }));
          }
        });
      });
  };

  const handleDataChange = (rowIndex, header, value) => {
    const currentData = analysisData[activeTab].data;
    const newData = [...currentData];
    newData[rowIndex][header] = value;

    setAnalysisData(prevData => ({
      ...prevData,
      [activeTab]: { ...prevData[activeTab], data: newData },
    }));
  };

  const handleAddRow = () => {
    const currentData = analysisData[activeTab].data;
    if (!currentData || currentData.length === 0) return;

    const headers = Object.keys(currentData[0]);
    const newRow = headers.reduce((acc, header) => {
        acc[header] = '';
        return acc;
    }, {});

    const newData = [...currentData, newRow];

    setAnalysisData(prevData => ({
        ...prevData,
        [activeTab]: {
            ...prevData[activeTab],
            data: newData,
        },
    }));
  };

  const handleDeleteRow = (rowIndex) => {
    const currentData = analysisData[activeTab].data;
    if (currentData.length <= 1) {
        alert("You cannot delete the last row.");
        return;
    }
    const newData = currentData.filter((_, index) => index !== rowIndex);

    setAnalysisData(prevData => ({
      ...prevData,
      [activeTab]: { ...prevData[activeTab], data: newData },
    }));
  };

  const handleReanalyze = () => {
    const currentResult = analysisData[activeTab];
    if (currentResult && currentResult.data) {
      const validationResult = validateFile(activeTab, currentResult.data);
      setAnalysisData(prevData => ({
        ...prevData,
        [activeTab]: { ...prevData[activeTab], analysis: validationResult },
      }));
    }
  };

  const handleAddMissingColumns = (missingFields) => {
    const currentData = analysisData[activeTab].data;
    const newData = currentData.map(row => {
      const newRow = { ...row };
      missingFields.forEach(field => {
        newRow[field] = '';
      });
      return newRow;
    });

    const validationResult = validateFile(activeTab, newData);

    setAnalysisData(prevData => ({
      ...prevData,
      [activeTab]: {
        ...prevData[activeTab],
        data: newData,
        analysis: validationResult,
      },
    }));
  };

  const handleDeleteEmptyRows = () => {
    if (window.confirm("Are you sure you want to delete all empty rows?")) {
      const currentData = analysisData[activeTab].data;
      const newData = currentData.filter(row => 
        !Object.values(row).every(val => val === '' || val === null || val === undefined)
      );
      if (newData.length === 0) {
        alert("This action would delete all rows. Please leave at least one row.");
        return;
      }
      setAnalysisData(prevData => ({
        ...prevData,
        [activeTab]: { ...prevData[activeTab], data: newData },
      }));
    }
  };

  const handleDownload = () => {
    const currentResult = analysisData[activeTab];
    if (currentResult && currentResult.data) {
      const merchantRef = window.prompt("Please enter the MerchantRef:");
      if (!merchantRef) return;

      const lowerCaseMerchantRef = merchantRef.toLowerCase();
      let fileName = `corrected_${currentResult.fileName}`;

      switch (activeTab) {
        case 'Stores': fileName = `${lowerCaseMerchantRef} - stores.csv`; break;
        case 'Catalogue': fileName = `${lowerCaseMerchantRef} - catalogue.csv`; break;
        case 'Users': fileName = `${lowerCaseMerchantRef} - users.csv`; break;
      }

      const csvString = Papa.unparse(currentResult.data);
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderAccordion = (type, result) => {
    if (!result || !result.fileName) return null;
    const { analysis } = result;
    const hasErrors = analysis && !analysis.isValid;
    const errorCount = hasErrors ? analysis.errors.length : 0;

    let titleText = `Analysis of ${type}`;
    if (type === 'Catalogue' && analysis && analysis.catalogueType && analysis.catalogueType !== 'N/A' && analysis.catalogueType !== 'Unknown') {
      titleText = `Analysis of ${analysis.catalogueType} Catalogue`;
    }

    const title = hasErrors ? (
      <>
        {titleText} | Errors detected: <strong>{errorCount}</strong>
      </>
    ) : (
      `${titleText} | All correct`
    );

    const accordionClasses = `accordion ${hasErrors ? 'has-errors' : 'is-correct'}`;

    let errorString = '';
    let missingColumnsError = null;
    if (hasErrors) {
      missingColumnsError = analysis.errors.find(e => e.code === 'MISSING_COLUMNS');
      const errorsByRow = analysis.errors.reduce((acc, error) => {
        const rowKey = error.row ? `Row ${error.row}` : 'General Errors';
        if (!acc[rowKey]) acc[rowKey] = [];
        acc[rowKey].push(error.message);
        return acc;
      }, {});
      errorString = Object.entries(errorsByRow).map(([row, errors]) => `${row}:\n${errors.map(e => `  - ${e}`).join('\n')}`).join('\n\n');
    }

    return (
      <div className={accordionClasses}>
        <div className="accordion-header" onClick={() => setAccordionOpen(!isAccordionOpen)}>
            <span>{title}</span>
            <span className="accordion-toggle-text">
                {isAccordionOpen ? 'Hide Details' : 'View Details'}
            </span>
        </div>
        {isAccordionOpen && (
          <div className="accordion-content">
            <p><b>File:</b> {result.fileName}</p>
            {result.error ? <p className="error-text">Processing error: {result.error}</p> : analysis && (
              <div>
                {hasErrors ? (
                  <div>
                    <textarea readOnly className="error-textarea" value={errorString} rows={Math.min(10, errorString.split('\n').length)} />
                    {missingColumnsError && 
                      <button onClick={() => handleAddMissingColumns(missingColumnsError.missingFields)} className="button button-primary" style={{marginTop: '10px'}}>
                        <AddIcon /> Add missing columns
                      </button>
                    }
                  </div>
                ) : (
                  <p className="success-text"><b>File analyzed correctly.</b></p>
                )}
                {type === 'Catalogue' && analysis.catalogueType && analysis.catalogueType !== "N/A" && analysis.catalogueType !== "Unknown" && (
                  <p><b>Merchant type:</b> {analysis.catalogueType}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const AnalysisDropzone = ({ setError }) => {
    const inputRef = useRef(null);

    const detectFileType = (file, headers) => {
        const lowerCaseName = file.name.toLowerCase();
        if (lowerCaseName.includes('store') || lowerCaseName.includes('center')) return 'Stores';
        if (headers.includes('Username') && headers.includes('Password')) return 'Users';
        if (headers.includes('price_with_tax') || headers.includes('Price')) return 'Catalogue';
        return null;
    };

    const processFile = (file) => {
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
                handleFileParsed(type, { 
                    analysis: analysisResult, 
                    fileName: file.name,
                    data: fullResults.data,
                    rowCount: fullResults.data.length,
                    error: null
                });
            }});
        }});
    };

    const handleDrop = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            setAnalysisData(initialState);
            processFile(event.dataTransfer.files[0]);
        }
    }, []);

    const handleFileSelect = (event) => {
        if (event.target.files && event.target.files.length > 0) {
            setAnalysisData(initialState);
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

  const renderCreateTemplateOptions = () => {
    return (
      <div className="landing-options-grid">
        <div className="landing-options-column">
          <h3>Retail</h3>
          <button className="landing-option-button-small" onClick={() => handleCreateFromTemplate('retail_stores', 'Stores')}> 
            <CreateIcon />
            <h4>Create Stores CSV</h4>
          </button>
          <button className="landing-option-button-small" onClick={() => handleCreateFromTemplate('retail_catalogue', 'Catalogue')}> 
            <CreateIcon />
            <h4>Create Catalogue CSV</h4>
          </button>
          <button className="landing-option-button-small" onClick={() => handleCreateFromTemplate('retail_users', 'Users')}> 
            <CreateIcon />
            <h4>Create Users CSV</h4>
          </button>
        </div>
        <div className="landing-options-column">
          <h3>eduQa</h3>
          <button className="landing-option-button-small" onClick={() => handleCreateFromTemplate('edu_centers', 'Stores')}> 
            <CreateIcon />
            <h4>Create Centers CSV</h4>
          </button>
          <button className="landing-option-button-small" onClick={() => handleCreateFromTemplate('edu_catalogue', 'Catalogue')}> 
            <CreateIcon />
            <h4>Create Catalogue CSV</h4>
          </button>
          <button className="landing-option-button-small" onClick={() => handleCreateFromTemplate('edu_users', 'Users')}> 
            <CreateIcon />
            <h4>Create Users CSV</h4>
          </button>
        </div>
      </div>
    );
  };

  const renderInitialView = () => {
    if (mode === 'analyze') return <AnalysisDropzone setError={setError} />;
    return null; 
  };

  const dataForActiveTab = analysisData[activeTab] && analysisData[activeTab].data;
  const isDownloadDisabled = !analysisData[activeTab]?.analysis?.isValid;
  const invalidHeadersError = analysisData[activeTab]?.analysis?.errors.find(e => e.code === 'INVALID_HEADERS');

  return (
    <>
      <Modal message={error} onClose={() => setError(null)} />
      <div className="tab-content">
        {mode === 'create' && dataForActiveTab ? (
          // Render CsvEditor when in create mode and data is loaded
          <div>
            {renderAccordion(activeTab, analysisData[activeTab])}
            <div className="action-buttons">
                <div className="button-group">
                    <button onClick={handleAddRow} className="button"><AddIcon /> Add Row</button>
                    <button onClick={handleDeleteEmptyRows} className="button button-danger"><TrashIcon/> Delete empty rows</button>
                </div>
                <div className="button-group">
                    <button onClick={handleReanalyze} className="button button-success"><RefreshIcon /> Re-analyze</button>
                    <button onClick={handleDownload} className="button button-primary" disabled={isDownloadDisabled}><DownloadIcon /> Download Corrected CSV</button>
                </div>
            </div>
            <CsvEditor data={dataForActiveTab} onDataChange={handleDataChange} errors={analysisData[activeTab].analysis ? analysisData[activeTab].analysis.errors : []} onDeleteRow={handleDeleteRow} />
          </div>
        ) : mode === 'create' ? (
          // Render template selection when in create mode and no data is loaded
          <div className="create-mode-container">
            {renderCreateTemplateOptions()}
          </div>
        ) : (
          // Render analyze mode options or editor
          !dataForActiveTab || invalidHeadersError ? renderInitialView() : (
          <div>
            {renderAccordion(activeTab, analysisData[activeTab])}
            <div className="action-buttons">
                <div className="button-group">
                    <button onClick={handleAddRow} className="button"><AddIcon /> Add Row</button>
                    <button onClick={handleDeleteEmptyRows} className="button button-danger"><TrashIcon/> Delete empty rows</button>
                </div>
                <div className="button-group">
                    <button onClick={handleReanalyze} className="button button-success"><RefreshIcon /> Re-analyze</button>
                    <button onClick={handleDownload} className="button button-primary" disabled={isDownloadDisabled}><DownloadIcon /> Download Corrected CSV</button>
                </div>
            </div>
            <CsvEditor data={dataForActiveTab} onDataChange={handleDataChange} errors={analysisData[activeTab].analysis ? analysisData[activeTab].analysis.errors : []} onDeleteRow={handleDeleteRow} />
          </div>
          )
        )}
      </div>
    </>
  );
}

export default EditorView;
