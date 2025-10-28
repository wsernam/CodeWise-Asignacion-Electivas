import React, { useState } from 'react';
import axios from 'axios';
import './MultipleFileUploader.css';

import Button from '../ui/Button/Button';
import Card from '../ui/Card/Card';
import ConfirModal from '../shared/ConfirmModal/ConfirmModal';
import SuccessModal from '../shared/SuccessModal/SuccessModal';
import WarningModal from '../shared/WarningModal/WarningModal';

const MAX_SIZE_MB = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = ['xlsx', 'xls', 'xlsm', 'xltm', 'xltx', 'csv'];

const formatSize = (size: number) => {
    if (size >= 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + ' MB';
    if (size >= 1024) return (size / 1024).toFixed(2) + ' KB';
    return size + ' B';
};

const MultipleFileUploader = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [status, setStatus] = useState<'initial' | 'uploading' | 'success' | 'fail'>('initial');
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showWarning, setShowWarning] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const validFiles: File[] = [];
        const errors: string[] = [];

        [...e.target.files].forEach(file => {
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
                errors.push(`${file.name} no tiene la extensión permitida.`);
                return;
            }
            if (file.size > MAX_SIZE_MB) {
                errors.push(`${file.name} excede el tamaño máximo de 10 MB.`);
                return;
            }
            validFiles.push(file);
        });

        if (errors.length > 0) {
            alert(errors.join('\n'));
        }

        setStatus('initial');
        setFiles(validFiles);
        // reset input value to allow re-selecting same files if needed
        if (e.target) e.target.value = '';
    };

    const handleButtonClick = () => {
        if (!files.length) return setShowWarning(true);

        setShowConfirm(true);
    }

    const handleUpload = async () => {
        
        setStatus('uploading');
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        try {
            const response = await axios.post('https://httpbin.org/post', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        console.log(`Upload Progress: ${percentCompleted}%`);
                    }
                }
            });

            setShowSuccess(true);
            console.log('Response:', response.data);
            setStatus('success');
        } catch (error) {
            console.error('Upload failed:', error);
            setStatus('fail');
        }
    };

    const handleRemoveFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <>
            <label className="custom-file-upload">
                Seleccionar archivos
                <input
                    type="file"
                    multiple
                    accept=".xlsx,.xls,.xlsm,.xltm,.xltx,.csv"
                    onChange={handleFileChange}
                />
            </label>

            <div className="file-list">
                {files.map((file, index) => (
                    <Card key={`${file.name}-${file.size}-${index}`} padding="sm" className="file-item-card">
                        <div className="file-row">
                            <div className="file-name">{file.name}</div>
                            <div className="file-size">{formatSize(file.size)}</div>
                            <button
                                className="remove-btn"
                                onClick={() => handleRemoveFile(index)}
                                type="button"
                                aria-label={`Eliminar ${file.name}`}
                                title="Eliminar"
                            >
                                🗑
                            </button>
                        </div>
                    </Card>
                ))}
            </div>

            {files.length > 0 && (
                <Button
                    className="upload-button"
                    type="button"
                    variant="primary"
                    size="medium"
                    disabled={status === 'uploading'}
                    onClick={handleButtonClick}
                >
                    Subir {files.length > 1 ? 'archivos' : 'archivo'}
                </Button>
            )}

            <SuccessModal
                open={showSuccess}
                message={`Archivos subidos con éxito.`}
                onClose={() => setShowSuccess(false)}
            />

            <ConfirModal
                open={showConfirm}
                message={`¿Está seguro de subir ${files.length} ${files.length > 1 ? 'archivos' : 'archivo'}?`}
                onConfirm={() => {handleUpload(); setShowConfirm(false);}}
                onCancel={() => setShowConfirm(false)}
            />

            <WarningModal
                open={showWarning}
                message={`No ha seleccionado ningún archivo para subir.`}
                onClose={() => setShowWarning(false)}
            />
        </>
    );
};

export default MultipleFileUploader;