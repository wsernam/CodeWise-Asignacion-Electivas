import React, { useState, useEffect } from "react";
import { Select } from "antd";
import "./Offer.css";

// Components
import Card from "../../../components/ui/Card/Card";
import Button from "../../../components/ui/Button/Button";
import WarningModal from "../../../components/shared/WarningModal/WarningModal";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import SuccessModal from "../../../components/shared/SuccessModal/SuccessModal";
import TooltipInfo from "../../../components/shared/TooltipInfo/TooltipInfo";

// Stores
import { useElectiveStore } from "../../../store/Form/electiveStore";
import { useProgramStore } from "../../../store/Form/programStore";
import type { IOffer } from "../../../models/Form/offer";
import { useOfferStore } from "../../../store/Form/offerStore";
import { useFormStatusStore } from "../../../store/Form/formStatusStore";
import { useAssignmentProcessStore } from "../../../store/Assignment/assignmentProcessStore";
import { getElectivesAmountByProgram } from "../../../services/Form/offerService";

const { Option } = Select;

const Offer: React.FC = () => {
  // ========== STORES ==========
  const { electives, fetchElectives } = useElectiveStore();
  const { programs, fetchPrograms } = useProgramStore();
  const {
    createBulkOffer,
    getOffersByProgram,
    deleteOffer,
    getLastOffersPeriod,
  } = useOfferStore();
  const { formStatus } = useFormStatusStore();
  const { obtenerTodosLosProcesos } = useAssignmentProcessStore();

  // ========== ESTADO LOCAL ==========
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [semester, setSemester] = useState<1 | 2>(1);
  const [cantElectivas, setCantElectivas] = useState<number>(0);
  const [selectedElectives, setSelectedElectives] = useState<{
    [programa: string]: string[];
  }>({});
  const [expandedFacultades, setExpandedFacultades] = useState<{
    [key: string]: boolean;
  }>({});
  const [program, setProgram] = useState<string>("");
  const [, setProcesos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastOfferPeriod, setLastOfferPeriod] = useState<{
    ofe_anio: number;
    ofe_num_semestre: number;
  } | null>(null);

  // Estados para ofertas existentes y cambios
  const [existingOffers, setExistingOffers] = useState<any[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [cambiosPendientes, setCambiosPendientes] = useState<{
    agregar: string[];
    quitar: number[];
  }>({ agregar: [], quitar: [] });
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [warning, setWarning] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  // ========== EFECTOS ==========

  useEffect(() => {
    fetchElectives();
    fetchPrograms();
  }, [fetchElectives, fetchPrograms]);

  // Efecto para cargar el período de la última oferta
  useEffect(() => {
    const cargarUltimoPeriodo = async () => {
      try {
        const periodo = await getLastOffersPeriod();
        setLastOfferPeriod(periodo);
        console.log("[Offer] Último período cargado:", periodo);
      } catch (error) {
        console.error("[Offer] Error cargando último período:", error);
        // Si no hay ofertas en el sistema, establecer como null
        setLastOfferPeriod(null);
      }
    };
    cargarUltimoPeriodo();
  }, [getLastOffersPeriod]);

  // Efecto para cargar ofertas y cant electivas cuando cambie programa, año o semestre
  useEffect(() => {
    if (program) {
      cargarOfertasExistentes();
      cargarCantElectivas();
    } else {
      setExistingOffers([]);
    }
  }, [program, year, semester]);

  // Efecto para sincronizar ofertas existentes al seleccionar programa
  useEffect(() => {
    if (program && existingOffers.length > 0) {
      // Limpiar
      setSelectedElectives({});
      // Crear un mapa temporal para agrupar ofertas por programa
      const ofertasPorPrograma: { [programa: string]: string[] } = {};
      // Agregar automáticamente las electivas ya ofertadas al estado selectedElectives
      existingOffers.forEach((oferta) => {
        const electiva = electives.find(
          (e) => e.ele_codigo === oferta.ele_codigo
        );
        if (electiva) {
          // Encontrar el nombre del programa de esta electiva
          const programaElectiva = programs.find(
            (p) => p.pro_codigo.toString() === electiva.pro_codigo.toString()
          );
          if (programaElectiva) {
            const nombrePrograma = programaElectiva.pro_nombre;
            // Inicializar array si no existe
            if (!ofertasPorPrograma[nombrePrograma]) {
              ofertasPorPrograma[nombrePrograma] = [];
            }
            // Agregar electiva si no está ya en la lista
            if (
              !ofertasPorPrograma[nombrePrograma].includes(oferta.ele_codigo)
            ) {
              ofertasPorPrograma[nombrePrograma].push(oferta.ele_codigo);
            }
          }
        }
      });
      // Actualizar el estado con todas las ofertas agrupadas por programa
      setSelectedElectives(ofertasPorPrograma);
    } else if (program && existingOffers.length === 0) {
      // Si no hay ofertas para este programa, limpiar selecciones
      setSelectedElectives({});
    }
  }, [existingOffers, program, programs, electives]);

  useEffect(() => {
    if (programs.length > 0) {
      const facultades = [
        ...new Set(
          programs
            .filter((program) => program.pro_activo)
            .map((program) => program.fac_nombre)
        ),
      ];

      const initialExpandedState = facultades.reduce((acc, facultad) => {
        acc[facultad] = true;
        return acc;
      }, {} as { [key: string]: boolean });

      setExpandedFacultades(initialExpandedState);
    }
  }, [programs]);

  // ========== FUNCIONES DE VALIDACIÓN ==========

  // Verificar si es la oferta actual
  const isCurrentOffer = (): boolean => {
    // Si no hay última oferta, cualquier período puede ser editado
    if (lastOfferPeriod === null) return true;

    // Solo es actual si es exactamente el mismo período
    return (
      year === lastOfferPeriod.ofe_anio &&
      semester === lastOfferPeriod.ofe_num_semestre
    );
  };

  // Verificar si es un período futurp
  const isFuturePeriod = (): boolean => {
    // Si no hay última oferta, cualquier período es futuro
    if (lastOfferPeriod === null) return true;

    // Un período es futuro si:
    // 1. El año es mayor, O
    // 2. El año es igual pero el semestre es mayor
    return (
      year > lastOfferPeriod.ofe_anio ||
      (year === lastOfferPeriod.ofe_anio &&
        semester > lastOfferPeriod.ofe_num_semestre)
    );
  };

  // Verificar si es un período pasado
  const isPastPeriod = (): boolean => {
    if (lastOfferPeriod === null) return false;

    return (
      year < lastOfferPeriod.ofe_anio ||
      (year === lastOfferPeriod.ofe_anio &&
        semester < lastOfferPeriod.ofe_num_semestre)
    );
  };

  // Verificar si existe proceso finalizado o activo para el período seleccionado
  const verificarPeriodoBloqueado = async (): Promise<{
    bloqueado: boolean;
    mensaje: string;
  }> => {
    try {
      setLoading(true);

      // Obtener todos los procesos
      const todosProcesos = await obtenerTodosLosProcesos();
      setProcesos(todosProcesos);

      // Buscar procesos para este período específico
      const procesosParaPeriodo = todosProcesos.filter(
        (p) => p.pa_anio === year && p.pa_num_semestre === semester
      );

      if (procesosParaPeriodo.length === 0) {
        return { bloqueado: false, mensaje: "" };
      }

      // Verificar si hay proceso FINALIZADO para este período
      const procesoFinalizado = procesosParaPeriodo.find(
        (p) => p.pa_estado === 2
      );

      if (procesoFinalizado) {
        return {
          bloqueado: true,
          mensaje: `Ya se realizó la asignación para el período ${year}-${semester}. No se puede crear una nueva oferta.`,
        };
      }

      // Verificar si hay proceso ACTIVO/EN CURSO para este período
      const procesoActivo = procesosParaPeriodo.find((p) => p.pa_estado === 1);

      if (procesoActivo) {
        return {
          bloqueado: true,
          mensaje: `Hay un proceso de asignación en curso para el período ${year}-${semester}. Debe cancelar el proceso actual para modificar una oferta.`,
        };
      }

      return { bloqueado: false, mensaje: "" };
    } catch (error) {
      console.error("[Offer] Error verificando procesos:", error);
      return {
        bloqueado: false,
        mensaje: "Error verificando procesos. Intente nuevamente.",
      };
    } finally {
      setLoading(false);
    }
  };

  // ========== FUNCIONES PARA CARGAR OFERTAS EXISTENTES ==========

  const cargarOfertasExistentes = async () => {
    if (!program) return;

    try {
      setLoadingOffers(true);
      const ofertas = await getOffersByProgram(program, year, semester);
      setExistingOffers(ofertas);
    } catch (error) {
      console.error("[Offer] Error cargando ofertas existentes:", error);
      // Si no hay ofertas o hay error, limpiar el estado
      setExistingOffers([]);
    } finally {
      setLoadingOffers(false);
    }
  };

  // ================ FUNCION PARA OBTENER LA CANTIDAD DE ELECTIVAS DEL FORM =======
  const cargarCantElectivas = async () => {
    if (!program) return;

    try {
      const cantElectivasForm = await getElectivesAmountByProgram(
        program,
        year,
        semester
      );
      setCantElectivas(cantElectivasForm.ofe_cant_electivas);
    } catch (error) {
      console.error("[Offer] Error cargando la cantidad de electivas:", error);
      // Si no hay ofertas o hay error, limpiar el estado
      setCantElectivas(0);
    } finally {
    }
  };
  // ========== FUNCIÓN PARA OBTENER ELECTIVAS YA OFERTADAS ==========

  const obtenerElectivasOfertadas = () => {
    if (existingOffers.length === 0) return [];

    // Extraer los códigos de electivas de las ofertas existentes
    const codigosElectivasOfertadas = existingOffers.map(
      (oferta) => oferta.ele_codigo
    );

    return codigosElectivasOfertadas;
  };

  // ========== FUNCIÓN PARA CALCULAR CAMBIOS ==========

  const calcularCambios = () => {
    const electivasOfertadas = obtenerElectivasOfertadas();
    const electivasSeleccionadas = Object.values(selectedElectives).flat();

    // Obtener los ofe_codigo de las electivas que se quitarán
    const quitar = existingOffers
      .filter((oferta) => !electivasSeleccionadas.includes(oferta.ele_codigo))
      .map((oferta) => oferta.ofe_codigo);

    // Electivas que se AGREGARÁN (están seleccionadas pero NO estaban ofertadas)
    const agregar = electivasSeleccionadas.filter(
      (codigo) => !electivasOfertadas.includes(codigo)
    );

    return { agregar, quitar };
  };

  // ========== FUNCIÓN PARA OBTENER NOMBRE DE ELECTIVA ==========

  const obtenerNombreElectiva = (codigo: string) => {
    const electiva = electives.find((e) => e.ele_codigo === codigo);
    return electiva ? electiva.ele_nombre : codigo;
  };

  // ========== FUNCIÓN PARA OBTENER NOMBRE DE ELECTIVA POR ofe_codigo ==========

  const obtenerElectivaPorOfeCodigo = (ofe_codigo: number) => {
    const oferta = existingOffers.find((o) => o.ofe_codigo === ofe_codigo);
    if (oferta) {
      return obtenerNombreElectiva(oferta.ele_codigo);
    }
    return `Código ${ofe_codigo}`;
  };

  // ========== ESTRUCTURA DE DATOS ==========

  const facultades = [
    ...new Set(
      programs
        .filter((program) => program.pro_activo)
        .map((program) => program.fac_nombre)
    ),
  ].sort();

  // Filtrar programas que tienen electivas activas
  const programasConElectivasActivas = programs.filter((program) => {
    const electivasDelPrograma = electives.filter(
      (elective) =>
        elective.ele_estado &&
        elective.pro_codigo.toString() === program.pro_codigo.toString()
    );
    return electivasDelPrograma.length > 0;
  });

  // Agrupar programas por facultad
  const programasPorFacultad = facultades.reduce(
    (acc: { [facultad: string]: any[] }, facultad) => {
      const programasDeFacultad = programs
        .filter(
          (program) =>
            program.pro_activo &&
            program.fac_nombre === facultad &&
            programasConElectivasActivas.some(
              (p) => p.pro_codigo === program.pro_codigo
            )
        )
        .sort((a, b) => a.pro_nombre.localeCompare(b.pro_nombre));
      acc[facultad] = programasDeFacultad;
      return acc;
    },
    {}
  );

  const electivasPorPrograma = programs.reduce(
    (acc: { [programa: string]: any[] }, program) => {
      const electivasDelPrograma = electives.filter(
        (elective) =>
          elective.ele_estado &&
          elective.pro_codigo.toString() === program.pro_codigo.toString()
      );
      acc[program.pro_nombre] = electivasDelPrograma;
      return acc;
    },
    {}
  );

  // ========== MANEJADORES ==========

  const toggleFacultad = (facultad: string) => {
    setExpandedFacultades((prev) => ({
      ...prev,
      [facultad]: !prev[facultad],
    }));
  };

  const handleElectiveSelection = (
    programName: string,
    codigo: string,
    isChecked: boolean
  ) => {
    setSelectedElectives((prev) => {
      const programElectives = prev[programName] || [];
      return {
        ...prev,
        [programName]: isChecked
          ? [...programElectives, codigo]
          : programElectives.filter((id) => id !== codigo),
      };
    });
  };

  const getYearOptions = (): number[] => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear + 1, currentYear + 2];
  };

  const handleSave = async () => {
    // 1. Validaciones básicas
    if (!program) {
      setWarning({
        open: true,
        message: "Selecciona un programa para la oferta.",
      });
      return;
    }

    // Para verificar la integridad del número de electivas permitidas
    // Obtener las electivas seleccionadas del programa actual
    const programaSeleccionado = programs.find(
      (p) => p.pro_codigo.toString() === program
    );

    const nombreProgramaSeleccionado = programaSeleccionado?.pro_nombre || "";

    const electivasSeleccionadasParaPrograma =
      selectedElectives[nombreProgramaSeleccionado] || [];

    const cantidadSeleccionadas = electivasSeleccionadasParaPrograma.length;

    // Verificar que no sea menor (?)
    //if (cantidadSeleccionadas < cantElectivas) {
    //  setWarning({
    //    open: true,
    //    message: `La cantidad de electivas seleccionadas (${cantidadSeleccionadas}) es menor a la cantidad configurada (${cantElectivas}).\n\nPor favor, selecciona ${
    //      cantElectivas - cantidadSeleccionadas
    //    } electiva(s) más o reduce la cantidad en el campo "Cantidad de electivas".`,
    //  });
    //  return;
    //}

    // 2. Verificar si es período PASADO (no permitido)
    if (isPastPeriod()) {
      setWarning({
        open: true,
        message: `No puede modificar ofertas de períodos pasados (${year}-${semester}).\n\nSolo se permite:\n1. Editar la oferta actual (${
          lastOfferPeriod!.ofe_anio
        }-${
          lastOfferPeriod!.ofe_num_semestre
        })\n2. Crear una nueva oferta para un período futuro`,
      });
      return;
    }

    // 3. Verificar si el período está bloqueado por procesos de asignación
    const { bloqueado, mensaje } = await verificarPeriodoBloqueado();
    if (bloqueado) {
      setWarning({ open: true, message: mensaje });
      return;
    }

    // 4. Calcular cambios
    const { agregar, quitar } = calcularCambios();

    // 5. Si hay oferta existente pero no hay selecciones
    const electivasOfertadas = obtenerElectivasOfertadas();
    const electivasSeleccionadas = Object.values(selectedElectives).flat();

    if (electivasOfertadas.length > 0 && electivasSeleccionadas.length === 0) {
      // Mostrar confirmación especial para eliminar toda la oferta
      setMensajeConfirmacion(
        `¿Está seguro de eliminar la oferta existente para ${year}-${semester}?\n\n` +
          `Al no seleccionar ninguna electiva, la oferta será eliminada del sistema.`
      );
      setCambiosPendientes({
        agregar: [],
        quitar: electivasOfertadas
          .map((_, index) => existingOffers[index]?.ofe_codigo)
          .filter(Boolean),
      });
      setShowConfirm(true);
      return;
    }
    if (cantElectivas < electivasSeleccionadas.length) {
      setWarning({
        open: true,
        message: `La cantidad de electivas seleccionadas (${cantidadSeleccionadas}) excede la cantidad configurada (${cantElectivas}).\n\nPor favor, quita ${
          cantidadSeleccionadas - cantElectivas
        } electiva(s) o aumenta la cantidad en el campo "Cantidad de electivas".`,
      });
      return;
    }
    // 5. Preparar mensaje de confirmación normal
    let mensajeConfirmacion = `¿Confirmar cambios para el período ${year}-${semester}?\n`;

    if (agregar.length > 0) {
      mensajeConfirmacion += `Se agregará:\n`;
      agregar.forEach((codigo) => {
        mensajeConfirmacion += ` ${obtenerNombreElectiva(
          codigo
        )} (${codigo})\n`;
      });
    }

    if (quitar.length > 0) {
      mensajeConfirmacion += `Se eliminará:\n`;
      quitar.forEach((ofe_codigo) => {
        const nombre = obtenerElectivaPorOfeCodigo(ofe_codigo);
        mensajeConfirmacion += ` ${nombre}\n`;
      });
    }

    if (agregar.length === 0 && quitar.length === 0) {
      setWarning({
        open: true,
        message: `No realizó ningún cambio para el período ${year}-${semester}.`,
      });
      return;
    }

    // Guardar los cambios calculados para usarlos en handleConfirmSave
    setCambiosPendientes({ agregar, quitar });
    setMensajeConfirmacion(mensajeConfirmacion);
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirm(false);
    try {
      if (!program) {
        setWarning({
          open: true,
          message: "Selecciona un programa para crear la oferta.",
        });
        return;
      }

      if (cantElectivas <= 0) {
        setWarning({
          open: true,
          message:
            "La cantidad de electivas a seleccionar en el formulario no puede ser 0 o inferior.",
        });
        return;
      }

      const { agregar, quitar } = cambiosPendientes;
      const errores: string[] = [];

      // 1. ELIMINAR ofertas que ya no están seleccionadas
      if (quitar.length > 0) {
        console.log(`[Offer] Eliminando ${quitar.length} ofertas:`, quitar);

        for (const ofe_codigo of quitar) {
          try {
            await deleteOffer(ofe_codigo);
            console.log(`[Offer] Oferta ${ofe_codigo} eliminada exitosamente`);
          } catch (error) {
            console.error(
              `[Offer] Error eliminando oferta ${ofe_codigo}:`,
              error
            );
            errores.push(`No se pudo eliminar la oferta ${ofe_codigo}`);
          }
        }
      }

      // 2. CREAR nuevas ofertas
      if (agregar.length > 0) {
        // Construir la oferta SOLO con las nuevas electivas
        const oferta = agregar.map((ele_codigo) => ({
          ele_codigo,
          pro_codigo: program,
        }));

        const bulkData: IOffer = {
          ofe_anio: year,
          ofe_num_semestre: semester,
          ofertas: oferta,
          ofe_cant_electivas: cantElectivas,
        };

        console.log("[Offer] Creando nuevas ofertas:", bulkData);
        await createBulkOffer(bulkData);
      }

      // 3. Manejar resultados
      if (errores.length > 0) {
        setWarning({
          open: true,
          message: `Operación completada con errores:\n${errores.join("\n")}`,
        });
      } else {
        // Obtener nombre del programa para el mensaje
        const programaSeleccionado = programs.find(
          (p) => p.pro_codigo.toString() === program
        );
        const nombrePrograma = programaSeleccionado
          ? programaSeleccionado.pro_nombre
          : `Código ${program}`;

        // Mensaje de éxito
        let mensajeExito = `Oferta ${year}-${semester} actualizada para el programa ${nombrePrograma}.`;

        if (agregar.length === 0 && quitar.length === existingOffers.length) {
          mensajeExito = `Oferta ${year}-${semester} eliminada para el programa ${nombrePrograma} (no se seleccionó ninguna electiva).`;
        } else if (agregar.length > 0 && quitar.length > 0) {
          mensajeExito += `\nAgregadas: ${agregar.length} electiva(s)\nEliminadas: ${quitar.length} electiva(s)`;
        } else if (agregar.length > 0) {
          mensajeExito += `\nAgregadas: ${agregar.length} electiva(s)`;
        } else if (quitar.length > 0) {
          mensajeExito += `\nEliminadas: ${quitar.length} electiva(s)`;
        }

        // Actualizar el período de última oferta después de guardar
        try {
          const nuevoPeriodo = await getLastOffersPeriod();
          setLastOfferPeriod(nuevoPeriodo);
          console.log("[Offer] Último período actualizado:", nuevoPeriodo);
        } catch (error) {
          console.error("[Offer] Error actualizando último período:", error);
          // No error al usuario, continuar
        }

        // Mostrar éxito
        setMensajeConfirmacion(mensajeExito);
        setShowSuccess(true);
      }

      // 4. Recargar ofertas
      if (program) {
        await cargarOfertasExistentes();
        await cargarCantElectivas();
      }
    } catch (error) {
      console.error("[Offer] Error al guardar oferta:", error);
      setWarning({
        message: "Error al guardar la oferta. Revisa la configuración.",
        open: true,
      });
    }
  };

  // ========== RENDERIZADO ==========
  return (
    <div className="offer-container">
      <div className="offer-content">
        <div style={{ maxWidth: "1000px", width: "100%" }}>
          <Card className="offer-card" padding="xl">
            {formStatus && (
              <div className="offer-blocking-overlay">
                <div className="offer-blocking-message">
                  <div className="offer-blocking-icon"></div>
                  <h3>Formulario en Modo Activo</h3>
                  <p>
                    No se pueden realizar modificaciones mientras el formulario
                    esté activo para los estudiantes.
                  </p>
                  <p>
                    Desactiva el formulario desde el Inicio para habilitar
                    ediciones.
                  </p>
                </div>
              </div>
            )}
            {/* Título con tooltip */}
            <div
              className="title-with-tooltip"
              style={{ marginBottom: "1rem", justifyContent: "center" }}
            >
              <h2 className="offer-title">
                Configuración de Oferta de Electivas
              </h2>
              <TooltipInfo
                symbol="?"
                title="Guía para Configuración de Ofertas"
                description={
                  <div>
                    <p>
                      <strong>Restricciones:</strong>
                    </p>
                    <ul style={{ marginLeft: "15px", marginBottom: "10px" }}>
                      <li>
                        Se puede crear oferta si <strong>no</strong> hay un
                        proceso de asignación en curso o finalizado para este
                        período.
                      </li>
                      <li>
                        Solo se puede editar la{" "}
                        <strong>última oferta registrada</strong> en el sistema.
                      </li>
                      <li>
                        La oferta se crea para un programa específico
                        seleccionado.
                      </li>
                    </ul>

                    <p>
                      <strong>Funcionamiento:</strong>
                    </p>
                    <ul style={{ marginLeft: "15px", marginBottom: "10px" }}>
                      <li>
                        Al seleccionar un programa, se marcan las electivas que
                        están ofertando en ese periodo.
                      </li>
                      <li>Al guardar, se mostrarán los cambios realizados.</li>
                      <li>
                        <strong>Importante:</strong> Si una oferta existente se
                        queda sin ninguna electiva seleccionada, se eliminará
                        dicha oferta.
                      </li>
                    </ul>
                  </div>
                }
                position="bottom"
                size="small"
              />
            </div>

            {/* Panel de Configuración */}
            <div className="offer-config-panel">
              <div className="offer-config-item">
                <span className="offer-config-label">Año:</span>
                <Select value={year} onChange={setYear} style={{ width: 100 }}>
                  {getYearOptions().map((year) => (
                    <Option key={year} value={year}>
                      {year}
                    </Option>
                  ))}
                </Select>
              </div>

              <div className="offer-config-item">
                <span className="offer-config-label">Semestre:</span>
                <Select
                  value={semester}
                  onChange={setSemester}
                  style={{ width: 80 }}
                >
                  <Option value={1}>1</Option>
                  <Option value={2}>2</Option>
                </Select>
              </div>
              <div className="offer-config-item">
                <span className="offer-config-label">
                  Cantidad de electivas:
                </span>

                <input
                  type="number"
                  value={cantElectivas}
                  onChange={(e) =>
                    setCantElectivas(parseInt(e.target.value, 10))
                  }
                  className="offer-electiva-item"
                  style={{ width: 100 }}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="offer-config-program">
                <span className="offer-config-label">Programa:</span>
                <Select
                  value={program}
                  onChange={(value: string) => setProgram(value)}
                  style={{ width: 320 }}
                  placeholder="Selecciona el programa para el cual se va a crear la oferta"
                >
                  {programs.map((p) => (
                    <Option key={p.pro_codigo} value={p.pro_codigo.toString()}>
                      {p.pro_nombre} ({p.pro_codigo})
                    </Option>
                  ))}
                </Select>
              </div>

              {/* Mensaje del estado de la oferta seleccionada */}
              {lastOfferPeriod !== null && (
                <div
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    fontStyle: "italic",
                    fontSize: "0.9rem",
                    color: isCurrentOffer()
                      ? "#348e0eff"
                      : isFuturePeriod()
                      ? "#12416cff"
                      : "#d44006ff",
                  }}
                >
                  {isCurrentOffer()
                    ? `Editando oferta actual (${lastOfferPeriod.ofe_anio}-${lastOfferPeriod.ofe_num_semestre})`
                    : isFuturePeriod()
                    ? `Creando oferta futura (Actual: ${lastOfferPeriod.ofe_anio}-${lastOfferPeriod.ofe_num_semestre})`
                    : `Período pasado - No editable`}
                </div>
              )}
            </div>

            {/* SECCIONES POR FACULTAD */}
            <div>
              {facultades.map((facultad) => {
                const programasDeEstaFacultad = programasPorFacultad[facultad];
                const isExpanded = expandedFacultades[facultad];

                return (
                  <div key={facultad} className="offer-facultad-container">
                    {/* HEADER DESPLEGABLE */}
                    <div
                      className="offer-facultad-header"
                      onClick={() => toggleFacultad(facultad)}
                    >
                      <h3 className="offer-facultad-title">
                        {facultad}
                        <span className="offer-facultad-count">
                          ({programasDeEstaFacultad.length} programa
                          {programasDeEstaFacultad.length !== 1 ? "s" : ""})
                        </span>
                      </h3>
                      <span
                        className={`offer-facultad-arrow ${
                          isExpanded ? "expanded" : ""
                        }`}
                      >
                        ▼
                      </span>
                    </div>

                    {/* CONTENIDO DESPLEGABLE */}
                    {isExpanded && (
                      <div className="offer-facultad-content">
                        {programasDeEstaFacultad.length === 0 ? (
                          <div className="offer-empty-message">
                            No hay programas asociados a esta facultad
                          </div>
                        ) : (
                          <div className="offer-programas-grid">
                            {programasDeEstaFacultad.map((programa) => {
                              const electivasDeEstePrograma =
                                electivasPorPrograma[programa.pro_nombre] || [];

                              return (
                                <div
                                  key={programa.pro_codigo}
                                  className="offer-programa-card"
                                >
                                  {/* HEADER DEL PROGRAMA */}
                                  <div className="offer-programa-header">
                                    <div className="offer-programa-info">
                                      <h4 className="offer-programa-name">
                                        {programa.pro_nombre}
                                      </h4>
                                      <div className="offer-programa-code">
                                        Código: {programa.pro_codigo}
                                      </div>
                                    </div>
                                    <div className="offer-programa-count">
                                      {selectedElectives[programa.pro_nombre]
                                        ?.length || 0}{" "}
                                      seleccionadas
                                    </div>
                                  </div>

                                  {/* ELECTIVAS DEL PROGRAMA */}
                                  <div className="offer-electivas-list">
                                    {electivasDeEstePrograma.length === 0 ? (
                                      <div className="offer-empty-program">
                                        No hay electivas activas
                                      </div>
                                    ) : (
                                      electivasDeEstePrograma.map(
                                        (elective) => {
                                          return (
                                            <label
                                              key={elective.ele_codigo}
                                              className={`offer-electiva-item ${
                                                selectedElectives[
                                                  programa.pro_nombre
                                                ]?.includes(elective.ele_codigo)
                                                  ? "selected"
                                                  : ""
                                              }`}
                                            >
                                              <input
                                                type="checkbox"
                                                className="offer-electiva-checkbox"
                                                checked={
                                                  selectedElectives[
                                                    programa.pro_nombre
                                                  ]?.includes(
                                                    elective.ele_codigo
                                                  ) || false
                                                }
                                                onChange={(e) =>
                                                  handleElectiveSelection(
                                                    programa.pro_nombre,
                                                    elective.ele_codigo,
                                                    e.target.checked
                                                  )
                                                }
                                              />
                                              <span className="offer-electiva-name">
                                                {elective.ele_nombre}
                                              </span>
                                              <span className="offer-electiva-code">
                                                {elective.ele_codigo}
                                              </span>
                                            </label>
                                          );
                                        }
                                      )
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Botón Guardar */}
            <div className="offer-save-button">
              <Button
                variant="primary"
                size="medium"
                onClick={handleSave}
                disabled={formStatus || loading || loadingOffers}
              >
                {loadingOffers ? "Cargando ofertas..." : "Guardar"}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmModal
        open={showConfirm}
        message={mensajeConfirmacion}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirm(false)}
      />

      <SuccessModal
        open={showSuccess}
        message={mensajeConfirmacion}
        onClose={() => {
          setShowSuccess(false);
          setMensajeConfirmacion("");
        }}
      />

      <WarningModal
        open={warning.open}
        message={warning.message}
        onClose={() => setWarning({ open: false, message: "" })}
      />
    </div>
  );
};

export default Offer;
