import React, { useState, useEffect } from "react";
import "../AssignmentProcessSteps.css";
import {
  FaUserSlash,
  FaUserCheck,
  FaFileAlt,
  FaClipboardList,
} from "react-icons/fa";
import NextButton from "../../../components/ui/NextButton/NextButton";
import SimpleModal from "../../../components/shared/SimpleModal/SimpleModal";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import Button from "../../../components/ui/Button/Button";
import { useExcelProcessingStore } from "../../../store/Assignment";
import InactivesTable, { type InactiveRow } from "./InactivesTable";
import * as XLSX from "xlsx";
import { useProgramStore } from "../../../store/Form/programStore";

type AssignmentProcessProps = {
  onNext: () => void;
  onCancel: () => void;
  onStepClick: (stepNumber: number) => void;
  currentStep: number;
  completedSteps: number[];
  getStepBorderClass: (stepNumber: number) => string;
};

const cards = [
  {
    id: 1,
    title: "\nCargar archivos\n\n",
    icon: <FaFileAlt className="aps-icon aps-file" />,
    stepNumber: 1,
  },
  {
    id: 2,
    title: "Gestion de potenciales\ninactivos",
    icon: <FaUserSlash className="aps-icon aps-user-slash" />,
    stepNumber: 2,
  },
  {
    id: 3,
    title: "Gestion de potenciales\nnivelados",
    icon: <FaUserCheck className="aps-icon aps-user-check" />,
    stepNumber: 3,
  },
  {
    id: 4,
    title: "\nAsignacion\n\n",
    icon: <FaClipboardList className="aps-icon aps-clipboard" />,
    stepNumber: 4,
  },
];

const InactivesManagementAP: React.FC<AssignmentProcessProps> = ({
  onNext,
  onStepClick,
  currentStep,
  getStepBorderClass,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState<string>(
    "¿Está seguro de guardar este paso y continuar?"
  );

  const [inactiveRows, setInactiveRows] = useState<InactiveRow[]>([]);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const { programs } = useProgramStore();

  const {
    incompleteRows,
    previsualizarIncompletos,
    completarYProcesar,
    uploadedFiles,
    loading,
    error,
    clearError,
  } = useExcelProcessingStore();

  // 1. Leer Excel cada vez que se abra el modal
  useEffect(() => {
    if (showModal && uploadedFiles.length > 0) {
      leerExcel(uploadedFiles[0]);
    }
  }, [showModal, uploadedFiles]);

  const leerExcel = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);
      setExcelData(data);
      console.log("[DEBUG] Excel leído:", data.length, "filas");
    } catch (error) {
      console.error("Error leyendo Excel:", error);
    }
  };

  // 2. Buscar programa por nombre
  const buscarProgramaCodigo = (nombrePrograma: string): string => {
    if (!nombrePrograma || !programs.length) return "";

    const programaEncontrado = programs.find(
      (program) =>
        program.pro_nombre
          .toLowerCase()
          .includes(nombrePrograma.toLowerCase()) ||
        nombrePrograma.toLowerCase().includes(program.pro_nombre.toLowerCase())
    );

    return programaEncontrado?.pro_codigo?.toString() || "";
  };

  // 3. Buscar estudiante en Excel
  const buscarEnExcel = (codigo: string) => {
    const estudiante = excelData.find((row: any) => {
      const rowCodigo = row.CODIGO?.toString();
      const searchCodigo = codigo?.toString();
      return rowCodigo === searchCodigo;
    });

    if (estudiante) {
      const programaNombre = estudiante.PROGRAMA || "";
      const programaCodigo = buscarProgramaCodigo(programaNombre);

      return {
        nombre: estudiante.NOMBRES || estudiante.NOMBRE || "",
        apellido: estudiante.APELLIDOS || estudiante.APELLIDO || "",
        programa: programaCodigo,
        programaNombre: programaNombre,
        creditos: estudiante.CREDITOS_APROBADOS?.toString() || "",
        aprobadas:
          (
            estudiante.APROBADAS ?? estudiante.NUM_ELECTIVAS_CURSADAS
          )?.toString() || "",
        periodos: estudiante.PERIODOS_MATRICULADOS?.toString() || "",
        porcentaje: estudiante.PROMEDIO_CARRERA?.toString() || "",
      };
    }

    return null;
  };

  // 4. Cargar inactivos ¿
  useEffect(() => {
    if (showModal && uploadedFiles.length > 0 && excelData.length > 0) {
      cargarInactivos();
    }
  }, [showModal, uploadedFiles, excelData]);

  const cargarInactivos = async () => {
    setIsLoadingData(true);
    clearError();

    try {
      console.log("[DEBUG] Buscando inactivos...");
      const result = await previsualizarIncompletos(uploadedFiles);
      console.log("[DEBUG] Resultado:", result);

      if (result.filas_incompletas && result.filas_incompletas.length > 0) {
        const convertedRows: InactiveRow[] = [];

        for (const row of result.filas_incompletas) {
          const datos = buscarEnExcel(row.codigo.toString());

          convertedRows.push({
            id: convertedRows.length + 1,
            codigo: row.codigo?.toString() || "",
            nombre: datos?.nombre || "",
            apellido: datos?.apellido || "",
            programa: datos?.programa || "",
            creditosObligatorios: datos?.creditos || "",
            aprobadas: datos?.aprobadas || "",
            periodosMatriculados: datos?.periodos || "",
            porcentajeAvance: datos?.porcentaje || "",
          });
        }

        console.log("[DEBUG] Filas encontradas:", convertedRows.length);
        setInactiveRows(convertedRows);
      } else {
        console.log("[DEBUG] No se encontraron inactivos");
        setInactiveRows([]);
      }
    } catch (error) {
      console.error("Error cargando inactivos:", error);
      setInactiveRows([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleCardClick = (stepNumber: number) => {
    if (stepNumber === currentStep) {
      setShowModal(true);
      clearError();
    } else {
      onStepClick(stepNumber);
    }
  };

  // Envía los datos al backend
  const handleSave = async () => {
    // 1. Calcular cuántas filas están COMPLETAS
    const filasCompletas = inactiveRows.filter((row) => {
      const camposObligatoriosLlenos =
        row.codigo &&
        row.codigo.trim() !== "" &&
        row.nombre &&
        row.nombre.trim() !== "" &&
        row.apellido &&
        row.apellido.trim() !== "" &&
        row.programa &&
        row.programa.trim() !== "";

      const validarNumeroPositivo = (valor: string): boolean => {
        if (!valor) return false;
        const num = Number(valor);
        return !isNaN(num) && num >= 0;
      };

      const validarPorcentaje = (valor: string): boolean => {
        if (!valor) return false;
        const num = Number(valor);
        return !isNaN(num) && num >= 0 && num <= 100;
      };

      const validarSoloLetras = (valor: string): boolean => {
        if (!valor) return false;
        return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(valor);
      };

      const creditosValidos =
        row.creditosObligatorios &&
        validarNumeroPositivo(row.creditosObligatorios);
      const aprobadasValidas =
        row.aprobadas && validarNumeroPositivo(row.aprobadas);
      const periodosValidos =
        row.periodosMatriculados &&
        validarNumeroPositivo(row.periodosMatriculados);
      const porcentajeValido =
        row.porcentajeAvance && validarPorcentaje(row.porcentajeAvance);
      const nombreValido = validarSoloLetras(row.nombre);
      const apellidoValido = validarSoloLetras(row.apellido);

      return (
        camposObligatoriosLlenos &&
        nombreValido &&
        apellidoValido &&
        creditosValidos &&
        aprobadasValidas &&
        periodosValidos &&
        porcentajeValido
      );
    });

    console.log(
      `[DEBUG] Filas completas: ${filasCompletas.length} de ${inactiveRows.length}`
    );

    // 2. Si hay inactivos pero no todos están completos, preguntar
    if (
      inactiveRows.length > 0 &&
      filasCompletas.length < inactiveRows.length
    ) {
      const incompletas = inactiveRows.length - filasCompletas.length;
      setConfirmMessage(
        `${incompletas} estudiante(s) tienen datos incompletos y NO se incluirán en la asignación. ` +
          `Solo se procesarán ${filasCompletas.length} estudiante(s) completos. ¿Desea continuar?`
      );
      setShowConfirm(true);
      return;
    }
    // 3. Si todos están completos o no hay inactivos, continuar directamente
    await procesarYContinuar();
  };

  const procesarYContinuar = async () => {
    try {
      const filasACompletar = inactiveRows
        .filter((row) => row.codigo && row.codigo.trim() !== "")
        .map((row) => {
          const originalRow = incompleteRows.find(
            (ir) => ir.codigo.toString() === row.codigo
          );
          return {
            archivo:
              originalRow?.archivo || uploadedFiles[0]?.name || "archivo.xlsx",
            fila: originalRow?.fila || 0,
            datos: {
              CREDITOS_APROBADOS: parseInt(row.creditosObligatorios) || 0,
              PROMEDIO_CARRERA: parseFloat(row.porcentajeAvance) || 0,
              APROBADAS: parseInt(row.aprobadas) || 0,
              PERIODOS_MATRICULADOS: parseInt(row.periodosMatriculados) || 0,
            },
          };
        });

      await completarYProcesar(filasACompletar);

      setShowConfirm(false);
      setShowModal(false);
      onNext();
    } catch (error) {
      console.error("Error guardando cambios:", error);
      alert(
        `Error: ${error instanceof Error ? error.message : "Error desconocido"}`
      );
    }
  };

  return (
    <div className="aps-wrapper">
      <div className="aps-grid">
        {cards.map((card) => {
          const borderClass = getStepBorderClass(card.stepNumber);
          return (
            <div
              key={card.id}
              className={`aps-card-wrap ${borderClass}`}
              onClick={() => handleCardClick(card.stepNumber)}
            >
              <div className="aps-inner">
                <div className="aps-icon-box">{card.icon}</div>
              </div>
              <div className="aps-title">{card.title}</div>
            </div>
          );
        })}
      </div>

      {currentStep === 2 && (
        <SimpleModal
          open={showModal}
          title="Gestión de potenciales inactivos"
          onClose={() => setShowModal(false)}
        >
          <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {isLoadingData ? (
              <div className="inactives-empty">
                <p>Cargando estudiantes inactivos...</p>
              </div>
            ) : inactiveRows.length === 0 ? (
              <div className="inactives-empty">
                <p>No se han identificado posibles estudiantes inactivos</p>
                {error && (
                  <div style={{ color: "red", margin: "10px 0" }}>
                    Error: {error}
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "20px",
                  }}
                >
                  <Button
                    variant="primary"
                    size="medium"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    Confirmar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <InactivesTable
                  rows={inactiveRows}
                  onRowsChange={setInactiveRows}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "16px",
                  }}
                >
                  <div style={{ width: "120px" }}>
                    <NextButton onClick={handleSave} text="Confirmar" />
                  </div>
                </div>
              </>
            )}
          </div>
        </SimpleModal>
      )}

      <ConfirmModal
        open={showConfirm}
        message={confirmMessage}
        onConfirm={procesarYContinuar}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default InactivesManagementAP;
