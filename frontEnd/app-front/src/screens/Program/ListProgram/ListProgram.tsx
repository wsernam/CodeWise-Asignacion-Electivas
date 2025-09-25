import './ListProgram.css';
import React from 'react';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { useNavigate } from 'react-router';
import { Input, Button, Table, Space } from 'antd';
import { EditOutlined, EyeOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useProgramStore } from '../../../store/programStore';
import type { Program } from '../../../models/program';
import Navbar from '../../../components/Navbar/Navbar';

const ListProgram: React.FC = () => {

    const navigate = useNavigate();
    const programs = useProgramStore(state => state.programs);
    const fetchPrograms = useProgramStore(state => state.fetchPrograms);

    const [search, setSearch] = React.useState('');

    React.useEffect(() => {
        fetchPrograms();
    }, [fetchPrograms])
        ;

    // Filtrado
    const filteredPrograms = programs.filter(
        p =>
            p.nombre.toLowerCase().includes(search.toLowerCase()) ||
            p.codigo.toLowerCase().includes(search.toLowerCase()) ||
            p.facultad.toLowerCase().includes(search.toLowerCase())
    );

    // Columnas de la tabla
    const columns = [
        { title: 'Código', dataIndex: 'codigo', key: 'codigo' },
        { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
        { title: 'Facultad', dataIndex: 'facultad', key: 'facultad' },
        {
            title: 'Opciones',
            key: 'opciones',
            render: (_: any, record: Program) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/program/view/${record.codigo}`)}
                    />
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/program/edit/${record.codigo}`)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <>
            <div className='consult-program-container'>
                <Header />
                <Navbar />
                <div className="consult-program-content">
                    <div className="consult-program-actions">
                        <Input
                            className="consult-program-search"
                            placeholder='Buscar programa'
                            prefix={<SearchOutlined />}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            allowClear
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            className="consult-program-add-button"
                            onClick={() => navigate('/program/createProgram')}
                        >
                            Agregar Programa
                        </Button>
                    </div>
                    <div className="consult-program-table">
                        <Table
                            dataSource={filteredPrograms}
                            columns={columns}
                            rowKey="codigo"
                            pagination={{ pageSize: 5 }}
                            locale={{ emptyText: 'No se encontraron programas' }}
                            bordered
                        />
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
};

export default ListProgram;