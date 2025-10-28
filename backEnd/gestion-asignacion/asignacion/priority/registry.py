from .protocol2025 import Protocol2025Strategy
from .contracts import PriorityStrategy

_STRATEGIES: dict[str, PriorityStrategy] = {
    "protocol-2025": Protocol2025Strategy(),
}

def get_strategy(name: str) -> PriorityStrategy:
    try:
        return _STRATEGIES[name]
    except KeyError:
        raise ValueError(f"Estrategia desconocida: {name}")
