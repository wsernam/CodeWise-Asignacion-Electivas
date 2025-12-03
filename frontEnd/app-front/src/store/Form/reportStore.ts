import { create } from "zustand";

interface ReportState {
  selectedYear: number;
  selectedSemester: 1 | 2;
  selectedReportType: string;
  studentCode: string;
  isGenerating: boolean;
  generatedReport: string | null;

  // Acciones
  setSelectedYear: (year: number) => void;
  setSelectedSemester: (semester: 1 | 2) => void;
  setSelectedReportType: (type: string) => void;
  setStudentCode: (code: string) => void;
  setIsGenerating: (generating: boolean) => void;
  setGeneratedReport: (report: string | null) => void;
  clearReport: () => void;
  resetFilters: () => void;
}

export const useReportStore = create<ReportState>((set) => ({
  // Estado inicial
  selectedYear: 2025,
  selectedSemester: 1,
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
      selectedYear: 2025,
      selectedSemester: 2,
      studentCode: "",
      generatedReport: null,
    }),
}));
