
import React from 'react';

const ErrorList = ({ errors }) => {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div style={{
      marginTop: '20px',
      padding: '15px',
      borderRadius: '8px',
      backgroundColor: '#fff0f0',
      border: '1px solid #ffcccc',
      width: '100%',
      textAlign: 'left'
    }}>
      <h4 style={{
        color: '#d9534f',
        marginTop: 0,
        marginBottom: '10px',
        borderBottom: '1px solid #ffcccc',
        paddingBottom: '10px'
      }}>
        ❌ Archivo inválido. {errors.length} {errors.length > 1 ? 'errores encontrados' : 'error encontrado'}:
      </h4>
      <ul style={{
        color: '#d9534f',
        maxHeight: '150px',
        overflowY: 'auto',
        paddingLeft: '20px',
        margin: 0,
        fontSize: '0.9em',
        listStyleType: 'none'
      }}>
        {errors.map((error, index) => (
          <li key={index} style={{ marginBottom: '8px', paddingLeft: '1.4em', textIndent: '-1.4em' }}>
            <span style={{ marginRight: '0.5em' }}>🚨</span> {error}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ErrorList;
