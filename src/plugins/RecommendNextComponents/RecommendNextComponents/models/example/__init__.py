from collections import Counter
from typing import Union

from PySpice.Spice.Netlist import Circuit, SubCircuit


def analyze(circuit: Union[Circuit, SubCircuit]):
    component_counts = Counter(type(element).__name__ for element in circuit.elements)

    for subckt in circuit.subcircuits:
        component_counts.update(type(element).__name__ for element in subckt.elements)

    total = sum(component_counts.values())

    recommendations = dict(
        ((element, count / total) for (element, count) in component_counts.items())
    )
    return recommendations
