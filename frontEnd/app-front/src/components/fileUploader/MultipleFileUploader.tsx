import React, { useState } from "react";
import axios from "axios";
import "./MultipleFileUploader.css";

import Button from "../ui/Button/Button";
import Card from "../ui/Card/Card";
import ConfirModal from "../shared/ConfirmModal/ConfirmModal";
import SuccessModal from "../shared/SuccessModal/SuccessModal";
import WarningModal from "../shared/WarningModal/WarningModal";

const MAX_SIZE_MB = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = ["xlsx", "xls", "xlsm", "xltm", "xltx", "csv"];

const formatSize = (size: number) => {
  if (size >= 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + " MB";
  if (size >= 1024) return (size / 1024).toFixed(2) + " KB";
  return size + " B";
};

type MultipleFileUploaderProps = {
  onFilesUploaded?: (files: File[]) => void;
};

const MultipleFileUploader: React.FC<MultipleFileUploaderProps> = ({
  onFilesUploaded,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [, setStatus] = useState<"initial" | "uploading" | "success" | "fail">(
    "initial"
  );
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    [...e.target.files].forEach((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
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
      alert(errors.join("\n"));
    }

    const updatedFiles = [...files, ...validFiles];
    setFiles(updatedFiles);
    setStatus("initial");

    // Llamar al callback
    if (onFilesUploaded) {
      onFilesUploaded(updatedFiles);
    }

    // reset input value to allow re-selecting same files if needed
    if (e.target) e.target.value = "";
  };

  const handleUpload = async () => {
    setStatus("uploading");
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const response = await axios.post("https://httpbin.org/post", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload Progress: ${percentCompleted}%`);
          }
        },
      });

      setShowSuccess(true);
      console.log("Response:", response.data);
      setStatus("success");
    } catch (error) {
      console.error("Upload failed:", error);
      setStatus("fail");
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);

    // Llamar al callback
    if (onFilesUploaded) {
      onFilesUploaded(updatedFiles);
    }
  };

  const handleClearAll = () => {
    setFiles([]);

    // Llamar al callback
    if (onFilesUploaded) {
      onFilesUploaded([]);
    }
  };

  return (
    <>
      <div
        className="uploader-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        {/* Botón de Seleccionar archivos - CON ESTILO DE BUTTON */}
        <div>
          <input
            id="file-upload-input"
            type="file"
            multiple
            accept=".xlsx,.xls,.xlsm,.xltm,.xltx,.csv"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <Button
            variant="primary"
            size="medium"
            onClick={() =>
              document.getElementById("file-upload-input")?.click()
            }
          >
            Seleccionar archivos
          </Button>
        </div>

        {files.length > 0 && (
          <Button variant="secondary" size="medium" onClick={handleClearAll}>
            Limpiar todo
          </Button>
        )}
      </div>

      <div className="file-list">
        {files.length === 0 ? (
          <div className="no-files-message">
            No se han seleccionado archivos
          </div>
        ) : (
          files.map((file, index) => (
            <Card
              key={`${file.name}-${file.size}-${index}`}
              padding="sm"
              className="file-item-card"
            >
              <div
                className="file-row"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div className="file-info" style={{ flex: 1 }}>
                  <div className="file-name">{file.name}</div>
                  <div className="file-size">{formatSize(file.size)}</div>
                </div>
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
          ))
        )}
      </div>

      {/* Nota: El botón de subir ya no es necesario para el flujo de asignación */}
      {/* Se mantiene solo por compatibilidad pero no se usará */}
      {files.length > 0 && (
        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <small style={{ color: "#666" }}>
            Los archivos están listos para validar. Haz clic en "Continuar" en
            el modal.
          </small>
        </div>
      )}

      <SuccessModal
        open={showSuccess}
        message={`Archivos subidos con éxito.`}
        onClose={() => setShowSuccess(false)}
      />

      <ConfirModal
        open={showConfirm}
        message={`¿Está seguro de subir ${files.length} ${
          files.length > 1 ? "archivos" : "archivo"
        }?`}
        onConfirm={() => {
          handleUpload();
          setShowConfirm(false);
        }}
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
