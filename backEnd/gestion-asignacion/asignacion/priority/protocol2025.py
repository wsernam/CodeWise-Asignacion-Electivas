from typing import Iterable, List
from .contracts import StudentRow, PriorityStrategy

class Protocol2025Strategy(PriorityStrategy):
    UMBRAL = 60.0  # avance mínimo del protocolo

    def rank(self, rows: Iterable[StudentRow]) -> List[StudentRow]:
        # 1) Filtros: activo y avance >=60 (nivelado => 100)
        elegibles: list[tuple[StudentRow, float]] = []
        for r in rows:
            if not r.estado_activo:
                continue
            avance = 100.0 if r.nivelado else float(r.porcentaje_avance or 0.0)
            if avance < self.UMBRAL:
                continue
            elegibles.append((r, avance))

        # 2) Orden: avance desc, promedio desc, MÁS electivas cursadas (≈ menos por ver)
        elegibles.sort(key=lambda t: (
            -t[1],
            -(t[0].promedio or 0.0),
            -(t[0].num_electivas_cursadas or 0),
            str(t[0].est_codigo)  # estabilidad final
        ))
        # 3) usa “menos por ver” como 3er criterio
        elegibles.sort(key=lambda t: (
            -t[1],                              # avance efectivo desc
            -(t[0].promedio or 0.0),            # promedio desc
            (t[0].electivas_pendientes or 1e6), # MENOS por ver asc  ✅
            str(t[0].est_codigo)
        ))

        # 3) Solo devolvemos los StudentRow ordenados
        return [t[0] for t in elegibles]
