import "./FormAdmin.css";
import React, { useState, useEffect } from "react";
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
import Navbar from "../../components/layout/Navbar/Navbar";
import BackButton from "../../components/ui/BackButton/BackButton";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import ConfirmModal from "../../components/shared/ConfirmModal/ConfirmModal";
import WarningModal from "../../components/shared/WarningModal/WarningModal";
import { useNavigate } from "react-router";
import { useElectiveStore } from "../../store/electiveStore";
import { useFormStore } from "../../store/formAdminStore";
import type { FormAdmin } from "../../models/formAdmin";
// Solo usamos DatePicker de Ant Design
import { DatePicker } from "antd";

const { RangePicker } = DatePicker;

const ManageForm: React.FC = () => {
  const navigate = useNavigate();

  // Stores
  const electives = useElectiveStore((state) => state.electives);
  const fetchElectives = useElectiveStore((state) => state.fetchElectives);

  const forms = useFormStore((state) => state.forms);
  const fetchForms = useFormStore((state) => state.fetchForms);
  const createAndAddForm = useFormStore((state) => state.createAndAddForm);
  const activateAndSetForm = useFormStore((state) => state.activateAndSetForm);
  const deactivateAndUnsetForm = useFormStore(
    (state) => state.deactivateAndUnsetForm
  );

  // Estado local
  const [enabled, setEnabled] = useState(false);
  const [dates, setDates] = useState<any>([]);
  const [selected, setSelected] = useState<{ [programa: string]: string[] }>(
    {}
  );
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "enable" | "disable" | null
  >(null);
  const [warning, setWarning] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  // Cargar electivas y formularios al montar el componente
  useEffect(() => {
    fetchElectives();
    fetchForms();
  }, [fetchElectives, fetchForms]);

  // Agrupa electivas por programa
  const electivesByProgram = electives.reduce((acc: any, curr) => {
    const prog = curr.programa || "Sin programa";
    if (!acc[prog]) acc[prog] = [];
    acc[prog].push(curr);
    return acc;
  }, {});

  // Cargar estado de form activo
  useEffect(() => {
    if (forms.length > 0) {
      const activeForm = forms.find((f) => f.for_estado);
      if (activeForm) {
        setEnabled(true);
        setDates([activeForm.for_fecha_inicio, activeForm.for_fecha_fin]);
        setSelected(activeForm.electivesByProgram);
      } else {
        setEnabled(false);
      }
    }
  }, [forms]);

  // Verifica si hay al menos una electiva seleccionada
  const hasSelectedElectives = Object.values(selected).some(
    (arr) => arr.length > 0
  );

  // Maneja el cambio de fechas
  const handleDateChange = (values: any) => setDates(values);

  // Maneja el cambio de selección de electivas
  const handleCheckboxChange = (
    program: string,
    codigo: string,
    checked: boolean
  ) => {
    setSelected((prev) => {
      const prevArr = prev[program] || [];
      return {
        ...prev,
        [program]: checked
          ? [...prevArr, codigo]
          : prevArr.filter((c) => c !== codigo),
      };
    });
  };

  // Mostrar modal de confirmación antes de habilitar/deshabilitar
  const handleToggle = () => {
    if (enabled) {
      setConfirmAction("disable");
    } else {
      if (!hasSelectedElectives) {
        setWarning({
          open: true,
          message:
            "Debe seleccionar al menos una electiva antes de habilitar el formulario.",
        });
        return;
      }
      setConfirmAction("enable");
    }
    setShowConfirm(true);
  };

  // Ejecuta la acción de habilitar/deshabilitar tras confirmar
  const handleConfirm = async () => {
    setShowConfirm(false);
    if (confirmAction === "disable") {
      const activeForm = forms.find((f) => f.for_estado);
      if (activeForm) {
        try {
          await deactivateAndUnsetForm(activeForm.for_codigo);
          setEnabled(false);
          setWarning({ open: true, message: "Formulario deshabilitado." });
        } catch (error) {
          setWarning({
            open: true,
            message: "Error al deshabilitar el formulario.",
          });
        }
      }
    } else if (confirmAction === "enable") {
      const nuevoForm: FormAdmin = {
        for_codigo: Date.now(),
        for_estado: true,
        for_fecha_inicio: dates[0],
        for_fecha_fin: dates[1],
        electivesByProgram: selected,
      };
      try {
        await createAndAddForm(nuevoForm);
        setEnabled(true);
        setWarning({ open: true, message: "Formulario habilitado." });
      } catch (error) {
        setWarning({
          open: true,
          message: "Error al habilitar el formulario.",
        });
      }
    }
    setConfirmAction(null);
  };

  // Guardar la configuración del formulario
  const handleSave = async () => {
    if (!hasSelectedElectives) {
      setWarning({
        open: true,
        message:
          "Debe seleccionar al menos una electiva antes de guardar la configuración.",
      });
      return;
    }
    const form: FormAdmin = {
      for_codigo: Date.now(),
      for_estado: enabled,
      for_fecha_inicio: dates[0],
      for_fecha_fin: dates[1],
      electivesByProgram: selected,
    };
    try {
      await createAndAddForm(form);
      setWarning({
        open: true,
        message: "Configuración del formulario guardada.",
      });
    } catch (error) {
      setWarning({ open: true, message: "Error al guardar la configuración." });
    }
  };

  return (
    <div className="auth-page">
      <Header />
      <Navbar />
      <div className="auth-page-content">
        <Card padding="xl" className="electives-card">
          <BackButton onClick={() => navigate(-1)} />
          <h2 className="electives-title">
            Gestión del Formulario de Asignación de Electivas
          </h2>
          <div className="actions-bar">
            <span>
              <b>Estado actual:</b> {enabled ? "Habilitado" : "Deshabilitado"}
            </span>
            <RangePicker
              className="manage-form-date-range"
              onChange={handleDateChange}
              value={dates}
              format="DD/MM/YYYY"
            />
            <Button
              type="button"
              className="manage-form-toggle-btn"
              variant="primary"
              onClick={handleToggle}
            >
              {enabled ? "Deshabilitar Formulario" : "Habilitar Formulario"}
            </Button>
          </div>
          <div className="manage-form-programs-row">
            {Object.keys(electivesByProgram).map((program) => (
              <div className="manage-form-program-card" key={program}>
                <div className="manage-form-program-title">
                  <b>{program}</b>
                  <span style={{ color: "#1f297f", marginLeft: 6 }}>
                    Electivas:
                  </span>
                </div>
                <div className="manage-form-electives-list">
                  {electivesByProgram[program].map((e: any) => (
                    <label
                      className="manage-form-checkbox-label"
                      key={e.codigo}
                    >
                      <input
                        type="checkbox"
                        checked={selected[program]?.includes(e.codigo) || false}
                        onChange={(ev) =>
                          handleCheckboxChange(
                            program,
                            e.codigo,
                            ev.target.checked
                          )
                        }
                      />
                      {e.nombre}{" "}
                      <span style={{ color: "#888" }}>({e.codigo})</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Button
              type="button"
              variant="primary"
              size="large"
              onClick={handleSave}
            >
              Guardar Configuración
            </Button>
          </div>
        </Card>
      </div>
      <Footer />
      {/* Modal de confirmación */}
      <ConfirmModal
        open={showConfirm}
        message={
          confirmAction === "enable"
            ? "Habilitar formulario \n¿Está seguro que desea habilitar el formulario?"
            : "Deshabilitar formulario \n¿Está seguro que desea deshabilitar el formulario?"
        }
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
      {/* Modal de advertencia */}
      <WarningModal
        open={warning.open}
        message={warning.message}
        onClose={() => setWarning({ open: false, message: "" })}
      />
    </div>
  );
};

export default ManageForm;
