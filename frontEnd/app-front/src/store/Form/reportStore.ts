import { create } from "zustand";

interface ReportState {
  selectedYear: number | null;
  selectedSemester: 1 | 2 | null;
  selectedReportType: string;
  studentCode: string;
  isGenerating: boolean;
  generatedReport: string | null;

  // Acciones
  setSelectedYear: (year: number | null) => void;
  setSelectedSemester: (semester: 1 | 2 | null) => void;
  setSelectedReportType: (type: string) => void;
  setStudentCode: (code: string) => void;
  setIsGenerating: (generating: boolean) => void;
  setGeneratedReport: (report: string | null) => void;
  clearReport: () => void;
  resetFilters: () => void;
}

export const useReportStore = create<ReportState>((set) => ({
  // Estado inicial
  selectedYear: null,
  selectedSemester: null,
  selectedReportType: "general-selection",
  studentCode: "",
  isGenerating: false,
  generatedReport: null,

  // Acciones
  setSelectedYear: (year) => set({ selectedYear: year }),
  setSelectedSemester: (semester) => set({ selectedSemester: semester }),
  setSelectedReportType: (type) => set({ selectedReportType: type }),
  setStudentCode: (code) => set({ studentCode: code }),
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  setGeneratedReport: (report) => set({ generatedReport: report }),
  clearReport: () => set({ generatedReport: null, isGenerating: false }),
  resetFilters: () =>
    set({
      selectedYear: null,
      selectedSemester: null,
      studentCode: "",
      generatedReport: null,
    }),
}));
