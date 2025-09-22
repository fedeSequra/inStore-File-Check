import React, { useState } from 'react';
import {
  retailStoresExample,
  retailCatalogueExample,
  retailUsersExample,
  eduCentersExample,
  eduCatalogueExample,
  eduUsersExample
} from './examples';

const Table = ({ data }) => {
  if (!data || data.length === 0) return null;
  const headers = Object.keys(data[0]);
  return (
    <div className="editor-container" style={{marginTop: '20px', maxHeight: 'none'}}>
      <table className="csv-editor-table">
        <thead>
          <tr>
            {headers.map(header => <th key={header} className="header-cell">{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map(header => <td key={header} className="cell">{row[header]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const HelpModal = ({ onClose }) => {
  const [selectedExample, setSelectedExample] = useState('Retail Stores');

  const examples = {
    'Retail Stores': retailStoresExample,
    'Retail Catalogue': retailCatalogueExample,
    'Retail Users': retailUsersExample,
    'eduQa Centers': eduCentersExample,
    'eduQa Catalogue': eduCatalogueExample,
    'eduQa Users': eduUsersExample,
  };

  const handleSelectChange = (event) => {
    setSelectedExample(event.target.value);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{width: '1000px', maxWidth: '90vw'}}>
        <h2>Template Examples</h2>
        <select onChange={handleSelectChange} value={selectedExample} className="button" style={{width: '100%', justifyContent: 'center', border: '1px solid var(--border-color)'}}>
          {Object.keys(examples).map(title => (
            <option key={title} value={title}>{title}</option>
          ))}
        </select>
        <Table data={examples[selectedExample]} />
        <button onClick={onClose} className="button button-primary" style={{marginTop: '20px'}}>Close</button>
      </div>
    </div>
  );
};

export default HelpModal;
