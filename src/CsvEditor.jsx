import React from 'react';

const CsvEditor = ({ data, onDataChange, errors, onDeleteRow }) => {
  if (!data || data.length === 0) {
    return null;
  }

  const headers = Object.keys(data[0]);

  const handleCellChange = (e, rowIndex, header) => {
    onDataChange(rowIndex, header, e.target.innerText.trim());
  };

  const isCellInvalid = (rowIndex, header) => {
    if (!errors) return false;
    const fileRow = rowIndex + 2;
    return errors.some(err => err.row === fileRow && (err.column === header || err.column === null));
  };

  return (
    <div className="editor-container">
      <table className="csv-editor-table">
        <thead>
          <tr>
            <th className="header-cell" style={{ width: '50px' }}>#</th>
            {headers.map(header => (
              <th key={header} className="header-cell">{header}</th>
            ))}
            <th className="header-cell" style={{ width: '80px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td className="cell row-number">{rowIndex + 1}</td>
              {headers.map(header => (
                <td
                  key={header}
                  contentEditable
                  onBlur={(e) => handleCellChange(e, rowIndex, header)}
                  suppressContentEditableWarning={true}
                  className={`cell ${isCellInvalid(rowIndex, header) ? 'invalid' : ''}`}
                >
                  {row[header]}
                </td>
              ))}
              <td className="cell action-cell">
                <button onClick={() => onDeleteRow(rowIndex)} className="delete-button">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CsvEditor;
