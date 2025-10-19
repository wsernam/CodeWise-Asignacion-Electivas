import React, { useState } from 'react';
import axios from 'axios';
import './MultipleFileUploader.css';

import Button from '../ui/Button/Button';

const MAX_SIZE_MB = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = ['xlsx', 'xls', 'xlsm', 'xltm', 'xltx', 'csv'];

const MultipleFileUploader = () => {
    const [files, setFiles] = useState<File[] | null>(null);
    const [status, setStatus] = useState<
        'initial' | 'uploading' | 'success' | 'fail'>('initial');

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
        setFiles(validFiles.length > 0 ? validFiles : null);

    };

    const handleUpload = async () => {
        if (!files?.length) return;

        setStatus('uploading');
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));


        try {
            const response = await axios.post('https://httpbin.org/post', formData, {
                headers: { ' Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const precentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        console.log(`Upload Progress: ${precentCompleted}%`);
                    };
                }
            });

            console.log('Response:', response.data);
            setStatus('success');
        } catch (error) {
            console.error('Upload failed:', error);
            setStatus('fail');
        }
    };

    return (
        <>
            <label className="custom-file-upload">
                Seleccionar archivos
                <input type="file" multiple onChange={handleFileChange} />
            </label>

            {files && [...files].map((file, index) => (
                <section key={file.name}>
                    File number {index + 1} details:
                    <ul>
                        <li>Name: {file.name}</li>
                        <li>Type: {file.type}</li>
                        <li>Size: {file.size} bytes</li>
                    </ul>
                </section>
            ))}

            {files && (
                <Button
                    className='btn-add'
                    type="submit"
                    variant="primary"
                    size="medium"
                    disabled={files.length === 0 || status === 'uploading'}
                    onClick={handleUpload}
                >
                    Subir archivos {files.length > 1 ? 'files' : 'file'}
                </Button>
            )}

            <Result status={status} />
        </>
    );
};

const Result = ({ status }: { status: string }) => {
    switch (status) {
        case 'uploading':
            return <p>Subiendo archivos...</p>;
        case 'success':
            return <p>Archivos subidos con éxito.</p>;
        case 'fail':
            return <p>Error al subir los archivos.</p>;
        default:
            return null;
    }
};

export default MultipleFileUploader;
