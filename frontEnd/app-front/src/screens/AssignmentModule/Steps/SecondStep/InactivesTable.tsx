import React, { useState, useEffect } from "react";
import { useProgramStore } from "../../../../store/Form/programStore";
import "./InactivesTable.css";

export type InactiveRow = {
  id: number;
  codigo: string;
  nombre: string;
  apellido: string;
  programa: string;
  creditosObligatorios: string;
  periodosMatriculados: string;
  porcentajeAvance: string;
};

interface InactivesTableProps {
  rows: InactiveRow[];
  onRowsChange: (rows: InactiveRow[]) => void;
}

const InactivesTable: React.FC<InactivesTableProps> = ({
  rows,
  onRowsChange,
}) => {
  const { programs, fetchPrograms } = useProgramStore();
  const [programsLoaded, setProgramsLoaded] = useState(false);
  const [validaciones, setValidaciones] = useState<{ [key: string]: boolean }>(
    {}
  );

  // Cargar programas al montar el componente
  useEffect(() => {
    const loadPrograms = async () => {
      await fetchPrograms();
      setProgramsLoaded(true);
    };
    loadPrograms();
  }, [fetchPrograms]);

  const validarSoloLetras = (valor: string): boolean => {
    if (!valor) return true;
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(valor);
  };

  const validarPorcentaje = (valor: string): boolean => {
    if (!valor) return true;
    const num = Number(valor);
    return !isNaN(num) && num >= 0 && num <= 100;
  };

  const validarNumeroPositivo = (valor: string): boolean => {
    if (!valor) return true;
    const num = Number(valor);
    return !isNaN(num) && num >= 0;
  };

  const handleInputChange = (
    rowId: number,
    field: keyof InactiveRow,
    value: string
  ) => {
    const updatedRows = rows.map((row) =>
      row.id === rowId ? { ...row, [field]: value } : row
    );

    // Validaciones específicas por campo
    if (field === "nombre" || field === "apellido") {
      const esValido = validarSoloLetras(value);
      setValidaciones((prev) => ({
        ...prev,
        [`${rowId}-${field}`]: esValido,
      }));
    } else if (field === "porcentajeAvance") {
      const esValido = validarPorcentaje(value);
      setValidaciones((prev) => ({
        ...prev,
        [`${rowId}-${field}`]: esValido,
      }));
    } else if (
      field === "creditosObligatorios" ||
      field === "periodosMatriculados"
    ) {
      const esValido = validarNumeroPositivo(value);
      setValidaciones((prev) => ({
        ...prev,
        [`${rowId}-${field}`]: esValido,
      }));
    }

    onRowsChange(updatedRows);
  };

  const isActive = (row: InactiveRow) => {
    // Validar que todos los campos obligatorios estén llenos
    const camposObligatoriosLlenos =
      row.codigo && row.nombre && row.apellido && row.programa;

    // Validar que nombre y apellido solo tengan letras
    const nombreValido = validarSoloLetras(row.nombre);
    const apellidoValido = validarSoloLetras(row.apellido);

    // Validar que los campos numéricos tengan formato correcto
    const creditosValidos = validarNumeroPositivo(row.creditosObligatorios);
    const periodosValidos = validarNumeroPositivo(row.periodosMatriculados);
    const porcentajeValido = validarPorcentaje(row.porcentajeAvance);

    return (
      camposObligatoriosLlenos &&
      nombreValido &&
      apellidoValido &&
      creditosValidos &&
      periodosValidos &&
      porcentajeValido
    );
  };

  return (
    <div className="inactives-table-container">
      <table className="inactives-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Programa</th>
            <th>Cr. oblig.</th>
            <th>Periodos</th>
            <th>% avance</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <input
                  type="text"
                  defaultValue={row.codigo}
                  onBlur={(e) =>
                    handleInputChange(row.id, "codigo", e.target.value)
                  }
                  className="inactives-input"
                  placeholder="Código"
                />
              </td>
              <td>
                <input
                  type="text"
                  defaultValue={row.nombre}
                  onBlur={(e) =>
                    handleInputChange(row.id, "nombre", e.target.value)
                  }
                  className={`inactives-input ${
                    validaciones[`${row.id}-nombre`] === false
                      ? "input-invalid"
                      : ""
                  }`}
                  placeholder="Nombre"
                />
              </td>
              <td>
                <input
                  type="text"
                  defaultValue={row.apellido}
                  onBlur={(e) =>
                    handleInputChange(row.id, "apellido", e.target.value)
                  }
                  className={`inactives-input ${
                    validaciones[`${row.id}-apellido`] === false
                      ? "input-invalid"
                      : ""
                  }`}
                  placeholder="Apellido"
                />
              </td>
              <td>
                {programsLoaded ? (
                  <select
                    defaultValue={row.programa}
                    onBlur={(e) =>
                      handleInputChange(row.id, "programa", e.target.value)
                    }
                    className="inactives-input"
                  >
                    <option value="">Seleccionar programa</option>
                    {programs
                      .filter((program) => program.pro_activo)
                      .map((program) => (
                        <option
                          key={program.pro_codigo}
                          value={program.pro_codigo}
                        >
                          {program.pro_nombre}
                        </option>
                      ))}
                  </select>
                ) : (
                  <select className="inactives-input" disabled>
                    <option>Cargando programas...</option>
                  </select>
                )}
              </td>
              <td>
                <input
                  type="number"
                  defaultValue={row.creditosObligatorios}
                  onBlur={(e) =>
                    handleInputChange(
                      row.id,
                      "creditosObligatorios",
                      e.target.value
                    )
                  }
                  className={`inactives-input ${
                    validaciones[`${row.id}-creditosObligatorios`] === false
                      ? "input-invalid"
                      : ""
                  }`}
                  placeholder="0"
                  min="0"
                />
              </td>
              <td>
                <input
                  type="number"
                  defaultValue={row.periodosMatriculados}
                  onBlur={(e) =>
                    handleInputChange(
                      row.id,
                      "periodosMatriculados",
                      e.target.value
                    )
                  }
                  className={`inactives-input ${
                    validaciones[`${row.id}-periodosMatriculados`] === false
                      ? "input-invalid"
                      : ""
                  }`}
                  placeholder="0"
                  min="0"
                />
              </td>
              <td>
                <input
                  type="number"
                  defaultValue={row.porcentajeAvance}
                  onBlur={(e) =>
                    handleInputChange(
                      row.id,
                      "porcentajeAvance",
                      e.target.value
                    )
                  }
                  className={`inactives-input ${
                    validaciones[`${row.id}-porcentajeAvance`] === false
                      ? "input-invalid"
                      : ""
                  }`}
                  placeholder="0"
                  step="0.1"
                  min="0"
                  max="100"
                />
              </td>
              <td>
                <span
                  className={`status ${isActive(row) ? "active" : "inactive"}`}
                >
                  {isActive(row) ? "Activo" : "Inactivo"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InactivesTable;
