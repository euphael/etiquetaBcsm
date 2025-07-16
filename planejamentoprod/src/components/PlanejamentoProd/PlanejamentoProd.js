import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import SearchIcon from '@mui/icons-material/Search';
import './PlanejamentoProd.css';

const PlanejamentoProd = () => {
  const [startDate, setStartDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [dados, setDados] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false); // Estado de carregamento
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc',
  });
    const [pesoTotal, setPesoTotal] = useState(0); // Estado para o total da quantidade

  const [totalQuantidade, setTotalQuantidade] = useState(0); // Estado para o total da quantidade
  const [setoresSelecionados, setSetoresSelecionados] = useState([]); // Estado para múltiplos setores selecionados


  const cleanText = (str) => {
    return str.replace(/[^\x20-\x7E]/g, ''); // Substitui caracteres não imprimíveis por uma string vazia
  };
  const filterBySearch = (item) => {
    if (!item) return false;

    const removerAcentos = (str) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const termo = removerAcentos(searchTerm.toLowerCase());
    const descricao = removerAcentos(String(item.DESCRICAO || '').toLowerCase());

    return !searchTerm || descricao.includes(termo);
  };
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!startDate || !endDate) return;

    setLoading(true); // Inicia o carregamento

    try {
      const response = await fetch(`http://192.168.1.250/server-pascoa/planejamento-prod?startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) throw new Error('Erro ao buscar dados');
      const json = await response.json();
      setDados(json); // Aqui, os dados serão armazenados conforme a estrutura do backend
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false); // Finaliza o carregamento
    }
  };

  // Função de filtro por setor
  const filterBySetor = (item) => {
    if (setoresSelecionados.length === 0) return true; // Se nenhum setor estiver selecionado, retorna todos
    return setoresSelecionados.includes(cleanText(item.IDX_LINHA)); // Filtra pelos itens que pertencem aos setores selecionados
  };

  const calculaPeso = (item) => {
    let pesagem = 0;
    let unidade = item.UNIDADE;

    if (unidade === 'PP') {
      pesagem = (item.TOTAL_QUANTIDADE / 10) * item.PESOKG;
      unidade = "KG";
    } else if (unidade === 'UD') {
      pesagem = (item.TOTAL_QUANTIDADE / 100) * item.PESOKG;
      unidade = "KG";
    } else if (unidade === 'UM') {
      pesagem = (item.TOTAL_QUANTIDADE / 10) * item.PESOKG;
      unidade = "KG";
    } else if (unidade === 'CT') {
      pesagem = item.TOTAL_QUANTIDADE * (item.PESOKG * 100);
      unidade = "KG";
    } else {
      pesagem = item.TOTAL_QUANTIDADE * item.PESOKG;
    }

    // Se a unidade for "UN" ou "PX", muda para "KG"
    if (unidade === "UN" || unidade === "PX") {
      unidade = "KG";
    }
    return pesagem
  }


  const filteredData = dados?.filter(item => filterBySetor(item) && filterBySearch(item));

  useEffect(() => {
    if (filteredData) {
      calculateTotalQuantity(filteredData);
      calculateTotalPeso(filteredData);
    }
  }, [filteredData]);


  const formatDate = (dateString) => {
    const date = new Date(dateString);

    // Usando UTC para evitar conversão para fuso horário local
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // meses começam em 0
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  };


  // Função para ordenar os dados
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'; // Alterna a direção
    }

    setSortConfig({ key, direction });

    const sortedData = [...dados].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setDados(sortedData);
  };

  const calculateTotalQuantity = (filteredItems) => {
    const total = filteredItems.reduce((acc, item) => {
      const unidade = item.UNIDADE ? item.UNIDADE : 1; // Caso não haja valor de "unidade", considera 1

      if (unidade === 'CT') {
        // Se unidade for 'CT', multiplica apenas esse item por 100
        return acc + item.TOTAL_QUANTIDADE * 100;
      } else {
        // Se unidade não for 'CT', soma normalmente
        return acc + item.TOTAL_QUANTIDADE;
      }
    }, 0);
    setTotalQuantidade(total);
  };
  const calculateTotalPeso = (filteredItems) => {
  const total = filteredItems.reduce((acc, item) => {
    // Soma o peso total diretamente, multiplicando a quantidade pelo PESOKG
    acc.pesoTotal += calculaPeso(item);

    return acc;
  }, { pesoTotal: 0 });

  // Atualiza o estado com o peso total calculado
  setPesoTotal(total.pesoTotal.toFixed(3)); // Formata para 2 casas decimais
};


  // Função para extrair setores únicos dos dados
  const getSetores = () => {
    if (!dados) return [];
    const setores = dados.map(item => cleanText(item.IDX_LINHA)); // Extrai os setores
    return [...new Set(setores)]; // Remove duplicados
  };

  return (
    <div className="container mt-4">
      <h1>Planejamento de Produção</h1>

      <form onSubmit={handleSearch}>
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="startDate">Data de Início:</label>
              <input
                type="date"
                id="startDate"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="endDate">Data de Fim:</label>
              <input
                type="date"
                id="endDate"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        <Button variant="primary" type="submit" disabled={loading}
          className='m-2'>
          {loading ? (
            <>
              <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" />&nbsp;
              Carregando...
            </>
          ) : (
            <>
              <SearchIcon />&nbsp;Pesquisar
            </>
          )}
        </Button>
      </form>

      {loading && (
        <div className="d-flex justify-content-center" style={{ height: '10px' }}>
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      <div className="flex-wrap gap-2 m-2">
        {getSetores()
          .sort()
          .map((setor, index) => (
            <Button
              key={index}
              variant={setoresSelecionados.includes(setor) ? 'primary' : 'outline-primary'}
              onClick={() => {
                // Adiciona ou remove o setor da lista de setores selecionados
                if (setoresSelecionados.includes(setor)) {
                  setSetoresSelecionados(setoresSelecionados.filter(s => s !== setor)); // Remove o setor
                } else {
                  setSetoresSelecionados([...setoresSelecionados, setor]); // Adiciona o setor
                }
              }}
              style={{ minWidth: '60px' }}
              className="m-2"
            >
              {setor}
            </Button>
          ))}
      </div>


      <div className="form-group mt-3">
        <label htmlFor="searchOr">Pesquise pela Descrição:</label>
        <input
          type="search"
          id="searchOr"
          className="form-control"
          placeholder="Pesquise pela Descrição"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-responsive mt-3">
        <h4>Pedidos</h4>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th className={`sortable-header ${sortConfig.key === 'IDX_PRODUTOD' ? 'active' : ''}`} onClick={dados.length > 0 ? () => handleSort('IDX_PRODUTO') : null}>
                Código {sortConfig.key === 'IDX_PRODUTO' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className={`sortable-header ${sortConfig.key === 'DESCRICAO' ? 'active' : ''}`} onClick={dados.length > 0 ? () => handleSort('DESCRICAO') : null}>
                Descrição {sortConfig.key === 'DESCRICAO' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className={`sortable-header ${sortConfig.key === 'TOTAL_QUANTIDADE' ? 'active' : ''}`} onClick={dados.length > 0 ? () => handleSort('TOTAL_QUANTIDADE') : null}>
                Quantidade {sortConfig.key === 'TOTAL_QUANTIDADE' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className={`sortable-header ${sortConfig.key === 'PESOKG' ? 'active' : ''}`} onClick={dados.length > 0 ? () => handleSort('PESOKG') : null}>
                Peso (kg) {sortConfig.key === 'PESOKG' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className={`sortable-header ${sortConfig.key === 'UNIDADE' ? 'active' : ''}`} onClick={dados.length > 0 ? () => handleSort('UNIDADE') : null}>
                Unidade {sortConfig.key === 'UNIDADE' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className={`sortable-header ${sortConfig.key === 'PREVISAO_DATA' ? 'active' : ''}`} onClick={dados.length > 0 ? () => handleSort('PREVISAO_DATA') : null}>
                Data {sortConfig.key === 'PREVISAO_DATA' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className={`sortable-header ${sortConfig.key === 'IDX_LINHA' ? 'active' : ''}`} onClick={dados.length > 0 ? () => handleSort('IDX_LINHA') : null}>
                Setor {sortConfig.key === 'IDX_LINHA' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {dados?.filter(item => filterBySetor(item) && filterBySearch(item)).map((item, index) => {
              return (
                <tr key={index}>
                  <td className="sortable-cell">{index + 1}</td>
                  <td className="sortable-cell">{item.IDX_PRODUTO}</td>
                  <td className="sortable-cell"
                    onDoubleClick={() => setSearchTerm(item.DESCRICAO)}
                  >{cleanText(item.DESCRICAO)}</td>
                  <td className="sortable-cell">{item.TOTAL_QUANTIDADE}</td>
                  <td className="sortable-cell">{calculaPeso(item).toFixed(3)} (g)</td>
                  <td className="sortable-cell">{item.UNIDADE}</td>
                  <td className="sortable-cell">{formatDate(item.PREVISAO_DATA)}</td>
                  <td className="sortable-cell">{cleanText(item.IDX_LINHA)}</td>
                </tr>
              );
            })}
            <tr>
              <td colSpan="3" className="sortable-cell" style={{ fontWeight: 'bold' }}>
                Total:
              </td>
              <td className="sortable-cell" style={{ fontWeight: 'bold' }}>
                {totalQuantidade.toFixed()} (UN)
              </td>
              <td className="sortable-cell" style={{ fontWeight: 'bold' }}>
                {pesoTotal} (g)
              </td>
              
              <td colSpan="3"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlanejamentoProd;
