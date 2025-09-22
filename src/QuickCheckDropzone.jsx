import React, { useState, useCallback, useRef } from 'react';

const QuickCheckDropzone = ({ onFiles }) => {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef(null);

    const handleDrop = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        onFiles(event.dataTransfer.files);
    }, [onFiles]);

    const handleFileSelect = (event) => {
        onFiles(event.target.files);
    };

    const handleZoneClick = () => {
        inputRef.current.click();
    };

    const handleDragOver = useCallback((event) => { event.preventDefault(); event.stopPropagation(); }, []);
    const handleDragEnter = useCallback((event) => { event.preventDefault(); event.stopPropagation(); setIsDragging(true); }, []);
    const handleDragLeave = useCallback((event) => { event.preventDefault(); event.stopPropagation(); setIsDragging(false); }, []);

    return (
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
            <p>Drag and drop files to check them</p>
            <button className="button button-primary" style={{marginTop: '10px'}}>Or select files</button>
        </div>
    );
};

export default QuickCheckDropzone;