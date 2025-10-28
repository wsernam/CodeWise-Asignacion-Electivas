from dataclasses import dataclass
from typing import Protocol, Iterable, List

@dataclass(frozen=True)
class StudentRow:
    est_codigo: int | str
    pro_codigo: str
    estado_activo: bool        # True=Activo (tu BooleanField)
    nivelado: bool
    porcentaje_avance: float   # 0..100 (ya lo tienes en tu modelo)
    promedio: float
    num_electivas_cursadas: int
    electivas_pendientes: int   

class PriorityStrategy(Protocol):
    def rank(self, rows: Iterable[StudentRow]) -> List[StudentRow]: ...
