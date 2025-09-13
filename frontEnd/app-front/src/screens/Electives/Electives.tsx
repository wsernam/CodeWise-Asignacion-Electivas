import { useState } from "react";
import type { IElective } from "../../api/electives.api";

const Electives:React.FC = () => {
    const [electives, setElectives] = useState<IElective[]>([]);


    return <h1>Electives {electives.length} </h1>
}

export default Electives;
