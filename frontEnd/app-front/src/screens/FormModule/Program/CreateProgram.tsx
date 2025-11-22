import React, { useState, useEffect } from "react";
import { Form, Input, Select } from "antd";
import { useNavigate } from "react-router";
import { useProgramStore } from "../../../store/Form/programStore";
import type { IProgram as Program } from "../../../models/Form/program";
import WarningModal from "../../../components/shared/WarningModal/WarningModal";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import SuccessModal from "../../../components/shared/SuccessModal/SuccessModal";
import Card from "../../../components/ui/Card/Card";
import Button from "../../../components/ui/Button/Button";

const { Option } = Select;

/**
 * COMPONENTE: CreateProgram
 *
 * Pantalla para crear nuevos programas académicos en el sistema.
 * Incluye validación de datos, manejo de estados y comunicación con el backend.
 *
 * Características principales:
 * - Formulario con validación en tiempo real
 * - Lista dinámica de facultades desde el backend
 * - Manejo de errores y estados de carga
 * - Modales de confirmación y retroalimentación
 */
const CreateProgram: React.FC = () => {
  // ========== HOOKS Y ESTADO ==========

  /**
   * Hook de formulario de Ant Design para manejar el estado y validación
   */
  const [form] = Form.useForm();
  const navigate = useNavigate();

  /**
   * Observador de cambios en los valores del formulario
   * Se usa para validación en tiempo real
   */
  const formValues = Form.useWatch([], form);

  /**
   * Estado para controlar qué campos han sido tocados/interactuados
   * Esto permite mostrar feedback de validación solo después de la interacción
   */
  const [touchedFields, setTouchedFields] = useState({
    pro_codigo: false,
    pro_nombre: false,
    fac_nombre: false,
  });

  /**
   * Estado que indica si el formulario es válido
   * Controla la habilitación del botón de guardar
   */
  const [isFormValid, setIsFormValid] = useState(false);

  /**
   * Estado para mostrar modal de advertencia/error
   */
  const [warning, setWarning] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  /**
   * Estado para mostrar modal de confirmación (ej: reactivar programa inactivo)
   */
  const [confirm, setConfirm] = useState<{
    open: boolean;
    pro_codigo: string;
    pro_nombre: string;
  }>({
    open: false,
    pro_codigo: "",
    pro_nombre: "",
  });

  /**
   * Estado para mostrar modal de éxito
   */
  const [success, setSuccess] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  // ========== STORE Y DATOS ==========

  /**
   * Funciones y datos del store global de programas
   */
  const addProgram = useProgramStore((state) => state.addProgram);
  const faculties = useProgramStore((state) => state.faculties);
  const fetchFaculties = useProgramStore((state) => state.fetchFaculties);

  /**
   * Efecto para cargar las facultades al montar el componente
   * Solo hace la llamada si no hay facultades cargadas
   */
  useEffect(() => {
    if (faculties.length === 0) {
      fetchFaculties();
    }
  }, [fetchFaculties, faculties.length]);

  /**
   * Extrae los nombres únicos de las facultades para el dropdown
   * Se filtran valores nulos o vacíos
   */
  const facultades = Array.from(
    new Set(faculties.map((f) => f.fac_nombre))
  ).filter(Boolean);

  // ========== VALIDACIONES ==========

  /**
   * Valida el campo de código del programa
   * @param _ - No usado (parámetro de Ant Design)
   * @param value - Valor del campo a validar
   * @returns Promise que se resuelve si es válido, o rechaza con mensaje de error
   */
  const validateCodigo = (_: any, value: string) => {
    if (!value) return Promise.reject("Por favor ingresa el código");
    if (value.length < 2 || value.length > 10)
      return Promise.reject("El código debe tener entre 2 y 10 dígitos");
    return Promise.resolve();
  };

  /**
   * Valida el campo de nombre del programa
   * @param _ - No usado (parámetro de Ant Design)
   * @param value - Valor del campo a validar
   * @returns Promise que se resuelve si es válido, o rechaza con mensaje de error
   */
  const validateNombre = (_: any, value: string) => {
    if (!value)
      return Promise.reject("Por favor ingresa el nombre del programa");
    if (value.length < 5)
      return Promise.reject("El nombre debe tener al menos 5 caracteres");
    if (value.length > 150)
      return Promise.reject("El nombre no puede exceder 150 caracteres");
    if (/^\s+|\s+$/.test(value))
      return Promise.reject(
        "El nombre no puede empezar o terminar con espacios"
      );
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value))
      return Promise.reject("El nombre solo puede contener letras y espacios");
    return Promise.resolve();
  };

  // ========== MANEJADORES DE EVENTOS ==========

  /**
   * Marca un campo como "tocado" para mostrar feedback de validación
   * @param fieldName - Nombre del campo que fue interactuado
   */
  const handleFieldTouch = (fieldName: keyof typeof touchedFields) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  /**
   * Efecto para validar el formulario en tiempo real
   * Se ejecuta cuando cambian los valores del formulario o los campos tocados
   */
  React.useEffect(() => {
    const checkValidity = async () => {
      try {
        await form.validateFields();
        setIsFormValid(true);
      } catch {
        setIsFormValid(false);
      }
    };

    if (
      touchedFields.pro_codigo ||
      touchedFields.pro_nombre ||
      touchedFields.fac_nombre
    ) {
      checkValidity();
    }
  }, [form, formValues, touchedFields]);

  /**
   * Maneja el envío del formulario cuando todos los datos son válidos
   * @param values - Objeto con los valores del formulario
   */
  const onFinish = async (values: any) => {
    try {
      // Buscar la facultad seleccionada para obtener su código
      const facultadSeleccionada = faculties.find(
        (f) => f.fac_nombre === values.fac_nombre
      );

      if (!facultadSeleccionada) {
        setWarning({
          open: true,
          message: "Facultad no válida seleccionada",
        });
        return;
      }

      // Preparar datos para enviar al backend
      const cleanedValues: Program = {
        pro_codigo: values.pro_codigo,
        pro_nombre: values.pro_nombre.trim().replace(/\s+/g, " "),
        fac_codigo: facultadSeleccionada.fac_codigo,
        fac_nombre: values.fac_nombre,
        pro_activo: true,
      };

      // Llamar al servicio para crear el programa
      await addProgram(cleanedValues);

      // Mostrar mensaje de éxito
      setSuccess({
        open: true,
        message: "Programa creado correctamente",
      });
    } catch (err: any) {
      // Manejar diferentes tipos de errores del backend
      if (err.message === "EXISTS_INACTIVE" && err.existing) {
        setWarning({
          open: true,
          message: `Ya existe un programa "${err.existing.pro_nombre}" con el código "${err.existing.pro_codigo}" pero está inactivo.`,
        });
        setConfirm({
          open: true,
          pro_codigo: err.existing.pro_codigo,
          pro_nombre: err.existing.pro_nombre,
        });
      } else if (err.message === "EXISTS_ACTIVE" && err.existing) {
        setWarning({
          open: true,
          message: `Ya existe un programa activo con el código "${err.existing.pro_codigo}" o nombre "${err.existing.pro_nombre}"`,
        });
      } else {
        setWarning({
          open: true,
          message: "Error inesperado al crear el programa",
        });
      }
    }
  };

  /**
   * Maneja el cierre del modal de éxito
   * Limpia el formulario y redirige a la lista de programas
   */
  const handleSuccessClose = () => {
    setSuccess({ open: false, message: "" });
    form.resetFields();
    setTouchedFields({
      pro_codigo: false,
      pro_nombre: false,
      fac_nombre: false,
    });
    navigate("/programs");
  };

  /**
   * Maneja el cierre del modal de advertencia
   */
  const handleWarningClose = () => {
    setWarning({ open: false, message: "" });
  };

  /**
   * Maneja la cancelación del modal de confirmación
   */
  const handleConfirmCancel = () => {
    setConfirm({ open: false, pro_codigo: "", pro_nombre: "" });
    setWarning({ open: false, message: "" });
  };

  // ========== RENDERIZADO ==========
  return (
    <div className="form-page-container">
      <div className="form-page-content">
        <Card className="form-card" padding="xl">
          <h2 className="form-title">Agregar Nuevo Programa</h2>

          {/* Formulario principal para crear programas */}
          <Form
            form={form}
            name="create-program-form"
            onFinish={onFinish}
            layout="vertical"
            autoComplete="off"
          >
            {/* Campo: Código del Programa */}
            <Form.Item
              name="pro_codigo"
              label="Código"
              rules={[{ validator: validateCodigo }]}
              hasFeedback={touchedFields.pro_codigo}
              validateStatus={touchedFields.pro_codigo ? undefined : ""}
            >
              <Input
                placeholder="Ejemplo: 09"
                size="large"
                maxLength={10}
                showCount
                onBlur={() => handleFieldTouch("pro_codigo")}
              />
            </Form.Item>

            {/* Campo: Nombre del Programa */}
            <Form.Item
              name="pro_nombre"
              label="Nombre"
              rules={[{ validator: validateNombre }]}
              hasFeedback={touchedFields.pro_nombre}
              validateStatus={touchedFields.pro_nombre ? undefined : ""}
            >
              <Input
                placeholder="Ejemplo: Ingeniería de Software"
                size="large"
                maxLength={150}
                showCount
                onBlur={() => handleFieldTouch("pro_nombre")}
              />
            </Form.Item>

            {/* Campo: Facultad */}
            <Form.Item
              name="fac_nombre"
              label="Facultad"
              rules={[
                { required: true, message: "Por favor selecciona la facultad" },
              ]}
              hasFeedback={touchedFields.fac_nombre}
              validateStatus={touchedFields.fac_nombre ? undefined : ""}
            >
              <Select
                placeholder="Selecciona una facultad"
                size="large"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children
                    ?.toString()
                    .toLowerCase()
                    .includes(input.toLowerCase()) ?? false
                }
                onBlur={() => handleFieldTouch("fac_nombre")}
                onSelect={() => handleFieldTouch("fac_nombre")}
              >
                {facultades.map((facultad) => (
                  <Option key={facultad} value={facultad}>
                    {facultad}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Botón de Guardar */}
            <Form.Item>
              <Button
                type="submit"
                variant="primary"
                size="medium"
                disabled={!isFormValid}
              >
                Guardar
              </Button>
            </Form.Item>

            {/* Botón de Volver */}
            <Form.Item>
              <Button
                variant="ghost"
                onClick={() => navigate("/programs")}
                size="medium"
              >
                Volver
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>

      {/* Modal de Advertencia/Error */}
      <WarningModal
        open={warning.open}
        message={warning.message}
        onClose={handleWarningClose}
      />

      {/* Modal de Éxito */}
      <SuccessModal
        open={success.open}
        message={success.message}
        onClose={handleSuccessClose}
      />

      {/* Modal de Confirmación (para reactivación de programas) */}
      <ConfirmModal
        open={confirm.open}
        message={`¿Deseas reactivar el programa "${confirm.pro_nombre}"?`}
        onConfirm={() => {
          // TODO: Implementar lógica de reactivación cuando sea necesario
          setWarning({
            open: true,
            message: "Funcionalidad de reactivación no implementada",
          });
          setConfirm({ open: false, pro_codigo: "", pro_nombre: "" });
        }}
        onCancel={handleConfirmCancel}
      />
    </div>
  );
};

export default CreateProgram;
