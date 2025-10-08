import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import {
  corTempo,
  taxaConversao,
  cleanText,
  mediaTempoFechamento,
  corSituacao,
  nomeSituacao,
  valorPorPessoa,
  diferencaEntreDatas,
  Timer,
  formatarData,
  exportToExcel,
} from "./FuncoesGestaoDeOrcamento.js";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, ComposedChart, ReferenceLine,
  Line, LabelList
} from "recharts";

export default function GestaoOrcamento() {
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const [dataInicial, setDataInicial] = useState(`${anoSelecionado}-01-01`);
  const [dataFinal, setDataFinal] = useState(`${anoSelecionado}-12-31`);
  const [orcamentos, setOrcamentos] = useState([]);
  const [orcamentosAnoComparacao, setOrcamentosAnoComparacao] = useState([]);
  const [tipoData, setTipoData] = useState("DTINC");       // escolha do usuário
  const [tipoDataAtivo, setTipoDataAtivo] = useState(tipoData);
  const [vendedorFiltro, setVendedorFiltro] = useState("");
  const [situacaoFiltro, setSituacaoFiltro] = useState("");
  const [descricaoFiltro, setDescricaoFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("OR");
  const [tamanhoFiltro, setTamanhoFiltro] = useState();
  const [convidadosFiltro, setConvidadosFiltro] = useState();
  const [loading, setLoading] = useState(false);
  const [aberto, setAberto] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState("graficos"); // "graficos" ou "tabela"
  const [loadingTabela, setLoadingTabela] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  const maxBotoesVisiveis = 5;
  const [anoBase, setAnoBase] = useState(new Date().getFullYear());
  const [anoComparacao, setAnoComparacao] = useState(new Date().getFullYear() - 1);
  // Adicione este estado junto com os outros 'useState' no topo do seu componente
  const [tipoVisualizacao, setTipoVisualizacao] = useState('quantidade'); // pode ser 'quantidade' ou 'valor'
  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
  // Adicione este estado junto aos outros
  const anoAtual = anoSelecionado;
  const anoAnterior = anoSelecionado - 1;
  const [metricType, setMetricType] = useState('taxa'); // 'taxa' ou 'faturamento'

  // Defina as equipes com os nomes exatos do seu sistema
  const VENDEDORES_EC = [
    'Izabela Rodrigues',
    'Jéssica Dias',
    'Olívia Junqueira',
    'Júnia França',
    'Fabíola Dias'
  ];

  // Adicione este estado junto com os outros 'useState'
  const [visibilidade, setVisibilidade] = useState({
    total: true,
    convertidos: true,
    naoConvertidos: true,
    taxaConversao: false,
    meta: true,
    anoAnterior: false
  });

  // Adicione esta função para lidar com as mudanças nos checkboxes
  const handleVisibilidadeChange = (event) => {
    const { name, checked } = event.target;
    setVisibilidade(prevState => ({
      ...prevState,
      [name]: checked,
    }));
  };

  // As outras duas listas continuam aqui...
  const VENDEDORES_SOCIAIS = [
    'Ana Paula Souza',
    'Luana Vitória',
    'Karine Nogueira',
    'Fernanda Assis',
    'Patrícia',
    'Karina Cunha'
  ];

  const VENDEDORES_CORPORATIVOS = [
    'Cynthia Mendonça',
    'Bruna Gusmão',
    'Rafael Victor',
    'Ana Paula Rancante'
  ];


  const coresCategoria = {
    "Convertidos": "#22c55e",
    "Não Convertidos": "#ef4444",
    "Em Aberto": "#facc15"
  };
  const orcamentosFiltrados = orcamentos.filter((o) => {

    const vendedorOk = vendedorFiltro ? cleanText(o.IDX_VENDEDOR1).toString() === vendedorFiltro : true;
    const situacaoOk = situacaoFiltro ? o.SITUACAO === situacaoFiltro : true;
    const tipoOk = tipoFiltro ? o.TPDOCTO === tipoFiltro : true;
    const descricaoOk = descricaoFiltro ? cleanText(o.DESCRICAO[0]) === descricaoFiltro : true;


    // Verifica o tamanho do orçamento
    const valor = Number(o.AJUSTE_TOTAL) || 0;
    let tamanhoOk = true;

    if (tamanhoFiltro) {
      if (tamanhoFiltro === "Pequeno") {
        tamanhoOk = (valor >= 0 && valor <= 20000); // 0 até 20k
      } else if (tamanhoFiltro === "Médio") {
        tamanhoOk = (valor > 20000 && valor <= 50000); // 20k até 50k
      } else if (tamanhoFiltro === "Grande") {
        tamanhoOk = (valor > 50000 && valor <= 100000); // 50k até 100k
      } else if (tamanhoFiltro === "Gigante") {
        tamanhoOk = valor > 100000; // acima de 100k
      }
    }
    const convidados = Number(o.CONVIDADOS) || 0;
    let convidadosOk = true;
    if (convidadosFiltro) {
      if (convidadosFiltro === "10-20") {
        convidadosOk = convidados >= 10 && convidados <= 20;
      } else if (convidadosFiltro === "20-30") {
        convidadosOk = convidados > 20 && convidados <= 30;
      } else if (convidadosFiltro === "30-50") {
        convidadosOk = convidados > 30 && convidados <= 50;
      } else if (convidadosFiltro === "50+") {
        convidadosOk = convidados > 50;
      }
    }

    return vendedorOk && situacaoOk && tipoOk && tamanhoOk && convidadosOk && descricaoOk;
  });
  const itensPaginados = orcamentosFiltrados.slice(indexPrimeiroItem, indexUltimoItem);
  const totalPaginas = Math.ceil(orcamentosFiltrados.length / itensPorPagina);





  const fetchDados = async () => {
    console.log("Buscando dados dos anos:", anoBase, anoComparacao);
    setLoading(true);
    setTipoDataAtivo(tipoData);
    console.log(tipoData)
    // Para evitar repetição, criamos uma função auxiliar para buscar os dados de um ano
    const buscarDadosPorAno = async (ano) => {
      const url = `http://192.168.1.250/server-pascoa/gestao-de-orcamento?tipoData=${tipoData}&dataInicial=${ano}-01-01&dataFinal=${ano}-12-31`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Falha na busca para o ano ${ano}`);
      }
      return response.json();
    };

    try {
      // 🔹 Se os anos forem os mesmos, busca apenas uma vez
      if (anoBase === anoComparacao) {
        console.log("Anos iguais, buscando apenas uma vez...");
        const data = await buscarDadosPorAno(anoBase);

        // Usa o mesmo resultado para os dois estados
        setOrcamentos(data);

        console.log("Dados únicos aplicados a ambos os estados.");

      } else {
        // 🔹 Se os anos forem diferentes, busca em paralelo para otimizar
        console.log("Anos diferentes, buscando em paralelo com Promise.all...");

        const [dataBase, dataComparacao] = await Promise.all([
          buscarDadosPorAno(anoBase),
          buscarDadosPorAno(anoComparacao)
        ]);

        setOrcamentos(dataBase);
        setOrcamentosAnoComparacao(dataComparacao);

        console.log("Buscas em paralelo concluídas.");
      }
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
      // Adicione um estado de erro para notificar o usuário, se desejar
      // setErro("Não foi possível carregar os dados."); 
    } finally {
      setLoading(false);
    }
  };




  const limparFiltros = () => {
    setVendedorFiltro("");
    setSituacaoFiltro("");
    setTipoFiltro("");       // volta para valor padrão
    setTamanhoFiltro('');
    setConvidadosFiltro('');
    setDescricaoFiltro('')
  };
  // Valor total por vendedor
  const valorPorVendedor = orcamentosFiltrados.reduce((acc, o) => {
    const vendedor = cleanText(o.NOMEINTERNO) || "Sem Vendedor";
    acc[vendedor] = (acc[vendedor] || 0) + (o.AJUSTE_TOTAL || 0);
    return acc;
  }, {});
  const dataVendedores = Object.entries(valorPorVendedor).map(([name, value]) => ({ name, value }));

  // Quantidade por situação
  const qtdPorSituacao = orcamentosFiltrados.reduce((acc, o) => {
    const situacao = nomeSituacao(o.SITUACAO);
    acc[situacao] = (acc[situacao] || 0) + 1;
    return acc;
  }, {});
  const dataSituacoes = Object.entries(qtdPorSituacao).map(([name, value]) => ({ name, value }));

  // Distribuição de tamanhos
  const dataTamanho = [
    { name: "Pequeno (0–20k)", value: orcamentosFiltrados.filter(o => o.AJUSTE_TOTAL <= 20000).length },
    { name: "Médio (20–50k)", value: orcamentosFiltrados.filter(o => o.AJUSTE_TOTAL > 20000 && o.AJUSTE_TOTAL <= 50000).length },
    { name: "Grande (50–100k)", value: orcamentosFiltrados.filter(o => o.AJUSTE_TOTAL > 50000 && o.AJUSTE_TOTAL <= 100000).length },
    { name: "Gigante (100k+)", value: orcamentosFiltrados.filter(o => o.AJUSTE_TOTAL > 100000).length },
  ];


  const dadosExportacao = orcamentosFiltrados.map(o => ({
    Documento: o.DOCUMENTO,
    Tipo: o.TPDOCTO,
    Vendedor: o.NOMEINTERNO,
    Cliente: o.NOME,
    Situação: nomeSituacao(o.SITUACAO),
    Valor: o.AJUSTE_TOTAL,
    DataEvento: o.DTPREVISAO,
    Convidados: o.CONVIDADOS,
    ValorPessoa: valorPorPessoa(o),

  }));

  useEffect(() => {
    fetchDados();

  }, []);
  const gerarBotoes = () => {
    const botoes = [];

    if (totalPaginas <= maxBotoesVisiveis + 2) {
      // todas as páginas cabem
      for (let i = 1; i <= totalPaginas; i++) botoes.push(i);
    } else {
      // primeira página
      botoes.push(1);

      let inicio = Math.max(2, paginaAtual - Math.floor(maxBotoesVisiveis / 2));
      let fim = Math.min(totalPaginas - 1, paginaAtual + Math.floor(maxBotoesVisiveis / 2));

      if (inicio > 2) botoes.push("...");
      for (let i = inicio; i <= fim; i++) botoes.push(i);
      if (fim < totalPaginas - 1) botoes.push("...");

      // última página
      botoes.push(totalPaginas);
    }

    return botoes;
  };

  // useEffect(() => {
  //   console.log("Verificando cookies: ", document.cookie); // Verifique se o cookie está presente
  //   const token = Cookies.get('token'); // Recupera o token do cookie
  //   console.log("Token recuperado: ", token); // Debug do token

  //   if (token) {
  //     try {
  //       const decoded = jwtDecode(token);
  //       console.log(decoded); // Exibe o conteúdo do token, incluindo a data de expiração

  //       // Verifique se o token está expirado
  //       const isExpired = decoded.exp * 1000 < Date.now(); // exp é em segundos, converte para milissegundos

  //       if (isExpired) {
  //         setIsLoggedIn(false);
  //       } else {
  //         if (decoded.username === 'comercial' || decoded.username === 'admin') {
  //           setIsLoggedIn(true);
  //         } else {
  //           setIsLoggedIn(false);
  //           window.location.href = "/";

  //         }
  //       }
  //     } catch (error) {
  //       console.error('Erro ao decodificar o token:', error);
  //     }
  //   } else {
  //     setIsLoggedIn(false);
  //     window.location.href = "/";


  //   }
  // }, []);

  // Vendedores únicos
  const vendedores = [...new Map(
    orcamentos.map(o => [cleanText(o.IDX_VENDEDOR1), { id: cleanText(o.IDX_VENDEDOR1), nome: cleanText(o.NOMEINTERNO) }])
  ).values()];
  // Situações únicas
  const situacoes = [...new Set(orcamentos.map((o) => o.SITUACAO))];
  const tipo = [...new Set(orcamentos.map((o) => o.TPDOCTO))];
  const descricao = [...new Set(orcamentos.map((o) => cleanText(o.DESCRICAO[0])))];


  const dadosComparacaoAnualDetalhado = useMemo(() => {
    const todos = [...orcamentos, ...orcamentosAnoComparacao];
    if (todos.length === 0) return [];

    const agrupado = {};
    const nomesDosMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    todos.forEach((orc) => {
      const dataString = tipoDataAtivo === 'DTINC' ? orc.DTINC[0] : orc.DTPREVISAO;
      if (!dataString) return;

      const dataEvento = new Date(dataString);
      if (isNaN(dataEvento.getTime())) return;

      const mesNumero = dataEvento.getMonth();
      const ano = dataEvento.getFullYear();

      if (ano !== anoBase && ano !== anoComparacao) return;

      if (!agrupado[mesNumero]) {
        agrupado[mesNumero] = { mesNumero, name: nomesDosMeses[mesNumero] };
      }

      const chaveBase = `${ano}_OR`;
      const chaveEC = `${ano}_EC`;

      if (!agrupado[mesNumero][chaveBase]) {
        agrupado[mesNumero][chaveBase] = { Total: 0, Convertidos: 0, NaoConvertidos: 0 };
      }
      if (!agrupado[mesNumero][chaveEC]) {
        agrupado[mesNumero][chaveEC] = { Total: 0, Convertidos: 0, NaoConvertidos: 0 };
      }

      if (orc.TPDOCTO === "OR") {
        agrupado[mesNumero][chaveBase].Total++;
        if (["Z", "F", "B", "V"].includes(orc.SITUACAO)) {
          agrupado[mesNumero][chaveBase].Convertidos++;
        } else {
          agrupado[mesNumero][chaveBase].NaoConvertidos++;
        }
      } else if (orc.TPDOCTO === "EC") {
        agrupado[mesNumero][chaveEC].Total++;
        if (["Z", "F", "B", "V"].includes(orc.SITUACAO)) {
          agrupado[mesNumero][chaveEC].Convertidos++;
        } else {
          agrupado[mesNumero][chaveEC].NaoConvertidos++;
        }
      }
    });

    const resultado = Object.values(agrupado).map((registro) => {
      const flat = { name: registro.name, mesNumero: registro.mesNumero };

      [anoBase, anoComparacao].forEach((ano) => {
        ["OR", "EC"].forEach((tipo) => {
          const chave = `${ano}_${tipo}`;
          if (registro[chave]) {
            flat[`${chave}.Total`] = registro[chave].Total;
            flat[`${chave}.Convertidos`] = registro[chave].Convertidos;
            flat[`${chave}.NaoConvertidos`] = registro[chave].NaoConvertidos;

            flat[`${chave}.TaxaConversao`] =
              registro[chave].Total > 0
                ? Number(((registro[chave].Convertidos / registro[chave].Total) * 100).toFixed(2))
                : 0;
          }
        });
      });

      return flat;
    });

    return resultado.sort((a, b) => a.mesNumero - b.mesNumero);
  }, [orcamentos, orcamentosAnoComparacao, anoBase, anoComparacao]);



  const dashboardData = useMemo(() => {

    // A dependência agora inclui 'metricType'
    if (!orcamentos || orcamentos.length === 0) {
      // Retorna um estado inicial zerado
      const zeroState = { valor: 0, formatado: metricType === 'taxa' ? '0.00%' : 'R$ 0,00' };
      return {
        total: zeroState, ec: zeroState, social: zeroState, corporativo: zeroState,
        vendedoresEC: [], vendedoresSocial: [], vendedoresCorporativo: [],
        metricInfo: {
          titlePrefix: metricType === 'taxa' ? 'Conversão' : 'Faturamento',
          formatter: (value) => (metricType === 'taxa' ? `${value.toFixed(2)}%` : `R$ ${value.toLocaleString('pt-BR')}`)
        }
      };
    }

    const isConvertido = (situacao) => ["Z", "F", "B", "V"].includes(situacao);

    // Função HELPER que calcula AMBAS as métricas para uma lista de orçamentos
    const getPerformance = (listaOrcamentos) => {
      const totalOrcamentos = listaOrcamentos.length;
      const orcamentosConvertidos = listaOrcamentos.filter(o => isConvertido(o.SITUACAO));
      const totalConvertidos = orcamentosConvertidos.length;

      // Calcula a taxa
      const taxa = totalOrcamentos > 0 ? (totalConvertidos / totalOrcamentos) * 100 : 0;

      // Calcula o faturamento (soma dos VALORTOTAL dos convertidos)
      const faturamento = orcamentosConvertidos.reduce((acc, orc) => acc + (orc.AJUSTE_TOTAL || 0), 0);

      return { taxa, faturamento };
    };

    // Função HELPER para performance de vendedores
    const getVendedorPerformance = (listaOrcamentos) => {
      if (!listaOrcamentos.length) return [];

      const vendedorStats = listaOrcamentos.reduce((acc, orc) => {
        const vendedor = cleanText(orc.NOMEINTERNO) || "Sem Vendedor";
        if (!acc[vendedor]) {
          acc[vendedor] = { totalCount: 0, convertedCount: 0, faturamento: 0 };
        }
        acc[vendedor].totalCount++;
        if (isConvertido(orc.SITUACAO)) {
          acc[vendedor].convertedCount++;
          acc[vendedor].faturamento += (orc.AJUSTE_TOTAL || 0);
        }
        return acc;
      }, {});

      return Object.entries(vendedorStats).map(([nome, dados]) => {
        const taxaCalculada = dados.totalCount > 0 ? parseFloat(((dados.convertedCount / dados.totalCount) * 100).toFixed(2)) : 0;

        return {
          name: nome,
          // O valor do gráfico será a taxa ou o faturamento, dependendo da métrica ativa
          value: metricType === 'taxa' ? taxaCalculada : dados.faturamento,
        };
      }).sort((a, b) => b.value - a.value);
    };

    // --- Cálculos por Segmento ---
    const orcamentosSociais = orcamentos.filter(o => VENDEDORES_SOCIAIS.includes(cleanText(o.NOMEINTERNO)));
    const orcamentosCorporativos = orcamentos.filter(o => VENDEDORES_CORPORATIVOS.includes(cleanText(o.NOMEINTERNO)));
    const orcamentosEC = orcamentos.filter(o => o.TPDOCTO === 'EC');
    const orcamentosECFiltradosPorEquipe = orcamentos.filter(o => o.TPDOCTO === 'EC' && VENDEDORES_EC.includes(cleanText(o.NOMEINTERNO)));

    const perfTotal = getPerformance(orcamentos);
    const perfEC = getPerformance(orcamentosEC);
    const perfSocial = getPerformance(orcamentosSociais);
    const perfCorporativo = getPerformance(orcamentosCorporativos);

    // --- Função para formatar a saída ---
    const formatValue = (value) => {
      if (metricType === 'taxa') {
        return `${value.toFixed(2)}%`;
      }
      return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const metricInfo = {
      titlePrefix: metricType === 'taxa' ? 'Conversão' : 'Faturamento',
      formatter: (value) => (metricType === 'taxa' ? `${value}%` : value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }))
    };

    return {
      total: { valor: perfTotal[metricType], formatado: formatValue(perfTotal[metricType]) },
      ec: { valor: perfEC[metricType], formatado: formatValue(perfEC[metricType]) },
      social: { valor: perfSocial[metricType], formatado: formatValue(perfSocial[metricType]) },
      corporativo: { valor: perfCorporativo[metricType], formatado: formatValue(perfCorporativo[metricType]) },
      vendedoresEC: getVendedorPerformance(orcamentosECFiltradosPorEquipe),
      vendedoresSocial: getVendedorPerformance(orcamentosSociais),
      vendedoresCorporativo: getVendedorPerformance(orcamentosCorporativos),
      metricInfo, // Passa informações sobre a métrica para o JSX
    };
  }, [orcamentos, metricType]); // <-- Dependência dupla!


  const alturaBasePorVendedor = 40;
  const alturaMinima = 200;
  const alturaGraficoEC = Math.max(alturaMinima, (dashboardData.vendedoresEC || []).length * alturaBasePorVendedor);
  const alturaGraficoSocial = Math.max(alturaMinima, (dashboardData.vendedoresSocial || []).length * alturaBasePorVendedor);
  const alturaGraficoCorp = Math.max(alturaMinima, (dashboardData.vendedoresCorporativo || []).length * alturaBasePorVendedor);


  const pieData = useMemo(() => {
    // 1. Calcula tanto a quantidade quanto o valor
    const dataCategorias = orcamentos.reduce((acc, o) => {
      const tipo = o.TPDOCTO;
      const situacao = o.SITUACAO;
      const valor = Number(o.AJUSTE_TOTAL) || 0;

      let categoria;
      if (["Z", "F", "B", "V"].includes(situacao)) {
        categoria = "Convertidos";
      } else if (["C", "N", "Y"].includes(situacao)) {
        categoria = "Não Convertidos";
      } else {
        categoria = "Em Aberto";
      }

      if (!acc[tipo]) acc[tipo] = {};
      if (!acc[tipo][categoria]) {
        acc[tipo][categoria] = { quantidade: 0, valor: 0 };
      }

      acc[tipo][categoria].quantidade += 1;
      acc[tipo][categoria].valor += valor;

      return acc;
    }, {});

    // 2. Formata a saída com base no tipo de visualização selecionado
    const formatarSaida = (dadosPorTipo) => {
      if (!dadosPorTipo) return [];
      return Object.entries(dadosPorTipo).map(([name, data]) => ({
        name,
        value: tipoVisualizacao === 'valor' ? data.valor : data.quantidade,
      }));
    };

    return {
      OR: formatarSaida(dataCategorias.OR),
      EC: formatarSaida(dataCategorias.EC)
    };
  }, [orcamentos, tipoVisualizacao]); // Adiciona 'tipoVisualizacao' como dependência

  // Componente para o painel de controle com os checkboxes
  function PainelControleGrafico({ visibilidade, onChange }) {
    return (
      <div className="flex flex-wrap justify-center items-center gap-4 p-2 mb-4 bg-gray-100 rounded-lg">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            name="anoAnterior"
            checked={visibilidade.anoAnterior}
            onChange={onChange}
            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          Ano Anterior
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            name="total"
            checked={visibilidade.total}
            onChange={onChange}
            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          Total
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            name="convertidos"
            checked={visibilidade.convertidos}
            onChange={onChange}
            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          Convertidos
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            name="naoConvertidos"
            checked={visibilidade.naoConvertidos}
            onChange={onChange}
            className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          Não Convertidos
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            name="taxaConversao"
            checked={visibilidade.taxaConversao}
            onChange={onChange}
            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
          />
          Taxa de Conversão
        </label>
      </div>
    );
  }
  // Componente para renderizar o tick do Eixo X com duas linhas
  const CustomXAxisTick = ({ x, y, payload, anoPrincipal, dados, tipo }) => {
    if (!payload || !payload.value) return null;

    // Busca o registro completo do mês
    const dadosDoMes = dados.find(d => d.name === payload.value);
    if (!dadosDoMes) return null;

    let taxa = 0;

    if (anoPrincipal && dadosDoMes) {
      const total = dadosDoMes[`${anoPrincipal}_${tipo}.Total`] || 0;
      const convertidos = dadosDoMes[`${anoPrincipal}_${tipo}.Convertidos`] || 0;
      if (total > 0) {
        taxa = (convertidos / total) * 100;
      }
    }

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="middle"
          fill="#666"
          fontSize={14}
        >
          {payload.value}
        </text>

        <text
          x={0}
          y={15}
          dy={16}
          textAnchor="middle"
          fill={tipo === "OR" ? "#ff7300" : "#ff7300"} // Azul p/ OR, Verde p/ EC
          fontSize={12}
          fontWeight="bold"
        >
          {`${taxa.toFixed(1)}%`}
        </text>
      </g>
    );
  };



  return (
    <div className=" " style={{
      backgroundImage: "url('http://192.168.1.250/pascoa/static/media/background2.a5bf359487e733d4047c.png')", backgroundSize: "1440px 900px", // força a resolução
      width: "100%", minHeight: '100vh', backgroundAttachment: 'fixed'
    }}>
      <div
        className="shadow-md flex justify-between items-center px-2"
        style={{
          backgroundColor: "#ffffff",
          width: "100%",
          height: "71px",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 50,
        }}
      >
        <img
          src="https://souttomayorevoce.com.br/wp-content/themes/soutto/images/logo-soutto.png"
          alt="Célia Soutto Mayor - Buffet em BH | Célia Soutto Mayor"
          title="Célia Soutto Mayor"
          className="webpexpress-processed no-lazy"
          style={{ height: "55px" }}
        />
        <button
          onClick={async () => {
            setLoading(true);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setAbaAtiva((prev) => (prev === "tabela" ? "graficos" : "tabela"));
            setLoading(false);
          }}
          className={`shadow-3xl p-2 rounded flex items-center justify-center gap-2 hover:bg-blue-600 ${abaAtiva === "tabela" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          disabled={loading}
        >
          {loading
            ? "Carregando..."
            : abaAtiva === "tabela"
              ? "Gráfico"
              : "Tabela"}
        </button>
      </div>
      {abaAtiva === "tabela" && (
        <div>
          <div className="p-6 flex flex-wrap gap-4"
            style={{ paddingTop: '90px', }}>
            <select
              className="border rounded p-2 shadow-3xl"
              value={tipoData}
              onChange={async (e) => {
                const novoTipo = e.target.value;
                setTipoData(novoTipo);
                await fetchDados();
              }}
            >
              <option value="DTINC">Data de Lançamento</option>
              <option value="DTPREVISAO">Data do Evento</option>
            </select>

            <input
              type="date"
              className="border rounded p-2 shadow-3xl"
              value={dataInicial}
              onChange={(e) => setDataInicial(e.target.value)}
            />
            <input
              type="date"
              className="border rounded p-2 shadow-3xl"
              value={dataFinal}
              onChange={(e) => setDataFinal(e.target.value)}
            />
            <select className="border rounded shadow-3xl p-2" value={vendedorFiltro} onChange={(e) => setVendedorFiltro(e.target.value)}>
              <option value="">Todos os Vendedores</option>
              {vendedores.map((v) => (
                <option key={v.id} value={v.id}>{v.nome}</option>
              ))}
            </select>


            <select
              className="border shadow-3xl rounded p-2"
              value={situacaoFiltro}
              onChange={(e) => setSituacaoFiltro(e.target.value)}
            >
              <option value="">Todas Situações</option>
              {situacoes.map((s) => (
                <option key={s} value={s}>{nomeSituacao(s)}</option>
              ))}
            </select>
            <select
              className="border shadow-3xl rounded p-2"
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
            >
              <option value="">Todos</option>
              {tipo.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              className="border shadow-3xl rounded p-2"
              value={descricaoFiltro}
              onChange={(e) => setDescricaoFiltro(e.target.value)}
            >
              <option value="">Descrição</option>
              {descricao.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              className="border shadow-3xl rounded p-2"
              value={tamanhoFiltro}
              onChange={(e) => setTamanhoFiltro(e.target.value)}
            >
              <option value="">Todos Tamanhos</option>
              <option value="Pequeno">Pequeno</option>
              <option value="Médio">Medio</option>
              <option value="Grande">Grande</option>
              <option value="Gigante">Gigante</option>
            </select>
            <select
              className="border shadow-3xl rounded p-2"
              value={convidadosFiltro}
              onChange={(e) => setConvidadosFiltro(e.target.value)}
            >
              <option value="">Quant Convidados</option>
              <option value="10-20">10–20</option>
              <option value="20-30">20–30</option>
              <option value="30-50">30–50</option>
              <option value="50+">50+</option>
            </select>

            <button
              onClick={fetchDados}
              disabled={loading}
              className="shadow-3xl bg-blue-500 text-white p-2 rounded flex items-center justify-center gap-2 hover:bg-blue-600 disabled:opacity-50"
            >
              {loading && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3 3 3h-4z"
                  ></path>
                </svg>
              )}
              {loading ? "Carregando..." : "Buscar"}
            </button>
            <button
              onClick={limparFiltros}
              className="shadow-3xl bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Limpar Filtros
            </button>
            <button
              onClick={() => exportToExcel(dadosExportacao)}
              className="shadow-3xl bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Exportar Excel
            </button>

          </div>
          <div className="grid grid-cols-4 gap-4 p-6">
            <div className="p-2 bg-white rounded shadow-3xl">
              <h2 className="font-bold">Quatidade de Orçamentos</h2>
              <p className="text-2xl">{orcamentosFiltrados.length}</p>
            </div>
            <div className="p-2 bg-white rounded shadow-3xl">
              <h2 className="font-bold">Valor Total</h2>
              <p className="text-2xl">
                R$ {orcamentosFiltrados.reduce((acc, o) => acc + o.AJUSTE_TOTAL, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-2 bg-white rounded shadow-3xl">
              <h2 className="font-bold">Valor Médio por Orçamento</h2>
              <p className="text-2xl">
                R$ {(orcamentosFiltrados.reduce((acc, o) => acc + o.AJUSTE_TOTAL, 0) / (orcamentosFiltrados.length || 1)).toLocaleString()}
              </p>
            </div>
            <div className="p-2 bg-white rounded shadow-3xl">
              <h2 className="font-bold">Valor Médio por Pessoa</h2>
              <p className="text-2xl">
                R$ {(orcamentosFiltrados.reduce((acc, o) => acc + valorPorPessoa(o), 0) / (orcamentosFiltrados.length || 1)).toFixed(2)}
              </p>
            </div>
            <div className="p-2 bg-white rounded shadow-3xl">
              <h2 className="font-bold">Tempo Médio Para Fechar</h2>
              <p className="text-2xl">
                {mediaTempoFechamento(orcamentosFiltrados)}
              </p>
            </div>
            <div className="p-2 bg-white rounded shadow-3xl">
              <h2 className="font-bold">Taxa de Conversão</h2>
              <p className="text-2xl">
                {taxaConversao(orcamentosFiltrados)}
              </p>
            </div>
          </div>
        </div>
      )}

      {abaAtiva === "graficos" && (
        <div>
          <div className="p-6 flex flex-wrap gap-4"
            style={{ paddingTop: '90px', }}>
            <select
              className="border rounded p-2 shadow-3xl"
              value={tipoData}
              onChange={(e) => setTipoData(e.target.value)}
            >
              <option value="DTINC">Data de Lançamento</option>
              <option value="DTPREVISAO">Data do Evento</option>
            </select>

            <label className="flex items-center gap-2">
              <span className="font-medium">Ano Base:</span>
              <select
                className="border rounded p-2 shadow-3xl"
                value={anoBase}
                onChange={(e) => setAnoBase(Number(e.target.value))}
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(ano => (
                  <option key={ano} value={ano}>{ano}</option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2">
              <span className="font-medium">Ano Comparação:</span>
              <select
                className="border rounded p-2 shadow-3xl"
                value={anoComparacao}
                onChange={(e) => setAnoComparacao(Number(e.target.value))}
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(ano => (
                  <option key={ano} value={ano}>{ano}</option>
                ))}
              </select>
            </label>

            <button
              onClick={fetchDados}
              disabled={loading}
              className="shadow-3xl bg-blue-500 text-white p-2 rounded flex items-center justify-center gap-2 hover:bg-blue-600 disabled:opacity-50"
            >
              {loading && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3 3 3h-4z"
                  ></path>
                </svg>
              )}
              {loading ? "Carregando..." : "Buscar"}
            </button>
          </div>
        </div>)}

      <div className="flex gap-4 p-4">
        {loadingTabela && (
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3 3 3h-4z"
            ></path>
          </svg>
        )}
      </div>
      {abaAtiva === "tabela" && (
        <div className="p-6">

          <div className="bg-white shadow-3xl rounded ">
            <table className="w-full text-sm text-left border ">
              <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Documento</th>
                  <th className="px-4 py-2">Tipo</th>
                  <th className="px-4 py-2">Vendedor</th>
                  <th className="px-4 py-2">Cliente</th>
                  <th className="px-4 py-2">Sitação</th>
                  <th className="px-4 py-2">Valor</th>
                  <th className="px-4 py-2">Convidados</th>
                  <th className="px-4 py-2">Tempo em Casa</th>
                  <th className="px-4 py-2">Valor/Pessoa</th>
                </tr>
              </thead>
              <tbody>
                {itensPaginados.map((orc) => (
                  <React.Fragment key={orc.DOCUMENTO}>
                    <tr className="border-t">
                      <td className="px-2">
                        <div
                          className="cursor-pointer p-3 hover:bg-gray-200"
                          onClick={() => setAberto(aberto === orc.DOCUMENTO ? null : orc.DOCUMENTO)}
                        >
                          <span>{orc.nome}</span>
                          <span>{aberto === orc.DOCUMENTO ? "▲" : "▼"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 border-gray-400">{orc.DOCUMENTO}</td>
                      <td className="px-4 py-2">{orc.TPDOCTO}</td>
                      <td className="px-4 py-2">{cleanText(orc.NOMEINTERNO)}</td>
                      <td className="px-4 py-2">{orc.NOME}</td>
                      <td className={`px-4 py-2 font-bold ${corSituacao(orc.SITUACAO)}`}>
                        {nomeSituacao(orc.SITUACAO)}
                      </td>
                      <td className="px-4 py-2">R$ {orc.AJUSTE_TOTAL.toLocaleString()}</td>
                      <td className="px-4 py-2">{orc.CONVIDADOS}</td>
                      <td className={corTempo(orc.SITUACAO, orc.DTINC[0])}>
                        {orc.TPDOCTO === 'EC' && orc.SITUACAO !== 'N'
                          ? diferencaEntreDatas(orc.DTINC[0], orc.DTALT)
                          : orc.SITUACAO === "C"
                            ? diferencaEntreDatas(orc.DTINC[0], orc.DTALT)
                            : orc.SITUACAO === 'Z' || orc.SITUACAO === 'V' || orc.SITUACAO === 'B'
                              ? diferencaEntreDatas(orc.DTINC[0], orc.DTINC[1])
                              : <Timer dt={orc.DTINC[0]} />}
                      </td>
                      <td className="px-4 py-2">R$ {valorPorPessoa(orc).toFixed(2)}</td>
                    </tr>
                    <AnimatePresence>
                      {aberto === orc.DOCUMENTO && (
                        <td colSpan={10} className=" bg-gray-50">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="overflow-hidden bg-gray-50"
                          >
                            <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm text-gray-700">
                              <p><strong>Descrição:</strong> {cleanText(orc.DESCRICAO[0])} - {orc.DESCRICAO[1]}</p>
                              <p><strong>CNPJ/CPF:</strong> {orc.CNPJCPF}</p>
                              <p><strong>Cidade:</strong> {orc.CIDADE} - {orc.UF}</p>
                              <p><strong>Endereço:</strong> {orc.LOCAL}</p>
                              <p><strong>Contato:</strong> {orc.CONTATO}</p>
                              <p><strong>Email:</strong> {orc.EMAIL}</p>
                              <p><strong>Telefone:</strong> {orc.TELEFONE}</p>
                              <p><strong>Data da Inclusão:</strong> {formatarData(orc.DTINC[0])}</p>
                              <p><strong>Data do Evento:</strong> {formatarData(orc.DTPREVISAO)}</p>
                            </div>
                          </motion.div>
                        </td>
                      )}
                    </AnimatePresence>

                  </React.Fragment>
                ))}
              </tbody>
              <tr>
                <td colSpan={10} className="p-4 bg-white bottom-0 z-20">
                  <div className="flex justify-center items-center gap-2">
                    <button
                      disabled={paginaAtual === 1}
                      onClick={() => setPaginaAtual(paginaAtual - 1)}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      ◀
                    </button>
                    {gerarBotoes().map((num, idx) =>
                      num === "..." ? (
                        <span key={idx} className="px-2 text-gray-500">
                          ...
                        </span>
                      ) : (
                        <button
                          key={idx}
                          onClick={() => setPaginaAtual(num)}
                          className={`px-3 py-1 border rounded ${paginaAtual === num ? "bg-blue-500 text-white" : "bg-white"
                            }`}
                        >
                          {num}
                        </button>
                      )
                    )}
                    <button
                      disabled={paginaAtual === totalPaginas}
                      onClick={() => setPaginaAtual(paginaAtual + 1)}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      ▶
                    </button>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        </div>)}
      {abaAtiva === "graficos" && (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow-3xl rounded p-4 col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold mb-2">
              Comparação Anual de Conversão de Orçamentos (OR)
            </h3>
            <PainelControleGrafico
              visibilidade={visibilidade}
              onChange={handleVisibilidadeChange}
            />
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={dadosComparacaoAnualDetalhado} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={
                    <CustomXAxisTick
                      anoPrincipal={anoBase}
                      dados={dadosComparacaoAnualDetalhado}
                      tipo="OR"
                    />
                  }
                  height={50}
                  tickLine={false}
                />
                <YAxis
                  label={{ value: 'Total de Orçamentos', angle: -90, position: 'insideLeft' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  label={{ value: 'Taxa de Conversão', angle: 90, position: 'insideRight' }}
                />
                <Tooltip />
                <Legend />
                {visibilidade.total && <Line
                  type="monotone"
                  dataKey={`${anoBase}_OR.Total`} 
                  stroke="#8884d8"
                  name={`Total OR ${anoBase}`}   
                >
                  <LabelList dataKey={`${anoBase}_OR.Total`} position="top" />
                </Line>}
                {visibilidade.anoAnterior && visibilidade.total && <Line
                  type="monotone"
                  dataKey={`${anoComparacao}_OR.Total`} 
                  stroke="#afadd8ff"
                  name={`Total OR ${anoComparacao}`}
                >
                  <LabelList dataKey={`${anoComparacao}_OR.Total`} position="top" />
                </Line>}
                {visibilidade.convertidos && <Bar
                  dataKey={`${anoBase}_OR.Convertidos`}
                  fill="#22c55e" // Verde forte
                  name={`Convertidos ${anoBase}`}
                />}
                {visibilidade.anoAnterior && visibilidade.convertidos && <Bar
                  dataKey={`${anoComparacao}_OR.Convertidos`}
                  fill="#86efadff" // Verde claro
                  name={`Convertidos ${anoComparacao}`}
                />}
                {visibilidade.naoConvertidos && <Bar
                  dataKey={`${anoBase}_OR.NaoConvertidos`}
                  fill="#ef4444" // Vermelho forte
                  name={`Não Convertidos ${anoBase}`}
                />}
                {visibilidade.anoAnterior && visibilidade.naoConvertidos && <Bar
                  dataKey={`${anoComparacao}_OR.NaoConvertidos`}
                  fill="#fca5a5" // Vermelho claro
                  name={`Não Convertidos ${anoComparacao}`}
                />}
                {visibilidade.anoAnterior && visibilidade.taxaConversao && <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey={`${anoComparacao}_OR.TaxaConversao`}
                  stroke="#fcc87bff" // Cinza
                  strokeWidth={2}
                  name={`Taxa Conversão ${anoComparacao} (%)`}
                />}
                {visibilidade.taxaConversao && <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey={`${anoBase}_OR.TaxaConversao`}
                  stroke="#ff7300" // Laranja
                  strokeWidth={2}
                  name={`Taxa Conversão ${anoBase} (%)`}
                />}

                {visibilidade.taxaConversao && <ReferenceLine yAxisId="right" y={30} label="Meta 30%" stroke="#ff0000ff" strokeDasharray="3 3" />}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white shadow-3xl rounded p-4 col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold mb-2">
              Comparação Anual de Conversão de Encomendas (EC)
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={dadosComparacaoAnualDetalhado} margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={
                    <CustomXAxisTick
                      anoPrincipal={anoBase}
                      dados={dadosComparacaoAnualDetalhado}
                      tipo="EC"
                    />
                  }
                  height={50}
                  tickLine={false}
                />
                <YAxis
                  label={{ value: 'Total de Encomendas', angle: -90, position: 'insideLeft' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  label={{ value: 'Taxa de Conversão', angle: 90, position: 'insideRight' }}
                />
                <Tooltip formatter={(value, name) => [name.includes('%') ? `${value}%` : value, name]} />
                <Legend />

                {visibilidade.total && <Line
                  type="monotone"
                  dataKey={`${anoBase}_EC.Total`}  /* Agora funciona */
                  stroke="#8884d8"
                  name={`Total EC ${anoBase}`}     /* Agora funciona */
                >
                  <LabelList dataKey={`${anoBase}_EC.Total`} position="top" />
                </Line>}
                {visibilidade.anoAnterior && visibilidade.total && <Line
                  type="monotone"
                  dataKey={`${anoComparacao}_EC.Total`}  /* Agora funciona */
                  stroke="#afadd8ff"
                  name={`Total EC ${anoComparacao}`}     /* Agora funciona */
                >
                  <LabelList dataKey={`${anoComparacao}_EC.Total`} position="top" />
                </Line>}

                {visibilidade.convertidos && <Bar
                  dataKey={`${anoBase}_EC.Convertidos`}
                  fill="#22c55e" // Verde forte
                  name={`Convertidos ${anoBase}`}
                />}
                {visibilidade.anoAnterior && visibilidade.convertidos && <Bar
                  dataKey={`${anoComparacao}_EC.Convertidos`}
                  fill="#86efadff" // Verde claro
                  name={`Convertidos ${anoComparacao}`}
                />}
                {visibilidade.naoConvertidos && <Bar
                  dataKey={`${anoBase}_EC.NaoConvertidos`}
                  fill="#ef4444" // Vermelho forte
                  name={`Não Convertidos ${anoBase}`}
                />}
                {visibilidade.anoAnterior && visibilidade.naoConvertidos && <Bar
                  dataKey={`${anoComparacao}_EC.NaoConvertidos`}
                  fill="#fca5a5" // Vermelho claro
                  name={`Não Convertidos ${anoComparacao}`}
                />}
                {visibilidade.anoAnterior && visibilidade.taxaConversao && <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey={`${anoComparacao}_EC.TaxaConversao`}
                  stroke="#fcc87bff" // Cinza
                  strokeWidth={2}
                  name={`Taxa Conversão ${anoComparacao} (%)`}
                />}
                {visibilidade.taxaConversao && <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey={`${anoBase}_EC.TaxaConversao`}
                  stroke="#ff7300" // Laranja
                  strokeWidth={2}
                  name={`Taxa Conversão ${anoBase} (%)`}
                />}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white shadow-3xl rounded p-4">

            {/* O restante do seu dashboard vem aqui... */}
            <h2 className="font-bold mb-2">Conversão por tipo de documento</h2>

            {/* Botões para alternar a visualização */}
            <div className="flex justify-center gap-2 mb-4">
              <button
                onClick={() => setTipoVisualizacao('quantidade')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${tipoVisualizacao === 'quantidade' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Por Quantidade
              </button>
              <button
                onClick={() => setTipoVisualizacao('valor')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${tipoVisualizacao === 'valor' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Por Valor (R$)
              </button>
            </div>

            <div className="flex flex-wrap -mx-2">
              {/* Gráfico EC */}
              <div className="w-full md:w-1/2 px-2">
                <h3 className="font-semibold mb-2">EC</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData.EC} dataKey="value" nameKey="name"
                      cx="50%" cy="50%" outerRadius={100}
                      label={({ value }) => tipoVisualizacao === 'valor' ? `R$ ${(value / 1000).toFixed(0)}k` : value}
                    >
                      {pieData.EC.map((entry, index) => (
                        <Cell key={`ec-cell-${index}`} fill={coresCategoria[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => tipoVisualizacao === 'valor' ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : value} />
                    <Legend formatter={(name) => {
                      const total = pieData.EC.reduce((acc, e) => acc + e.value, 0);
                      const entry = pieData.EC.find(e => e.name === name);
                      const perc = entry ? ((entry.value / total) * 100).toFixed(2) : 0;
                      return `${name} (${perc}%)`;
                    }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico OR */}
              <div className="w-full md:w-1/2 px-2 mb-4 md:mb-0">
                <h3 className="font-semibold mb-2">OR</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData.OR} dataKey="value" nameKey="name"
                      cx="50%" cy="50%" outerRadius={100}
                      label={({ value }) => tipoVisualizacao === 'valor' ? `R$ ${(value / 1000).toFixed(0)}k` : value}
                    >
                      {pieData.OR.map((entry, index) => (
                        <Cell key={`or-cell-${index}`} fill={coresCategoria[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => tipoVisualizacao === 'valor' ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : value} />
                    <Legend formatter={(name) => {
                      const total = pieData.OR.reduce((acc, e) => acc + e.value, 0);
                      const entry = pieData.OR.find(e => e.name === name);
                      const perc = entry ? ((entry.value / total) * 100).toFixed(2) : 0;
                      return `${name} (${perc}%)`;
                    }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="bg-white shadow-3xl rounded p-4">
            <h2 className="font-bold mb-2">Distribuição por Tamanho do Orçamento</h2>
            <ResponsiveContainer width="100%" height={370}>
              <BarChart
                data={dataTamanho}
                margin={{ top: 40, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value} orçamentos`} />
                <Bar dataKey="value" fill="#10b981ff">
                  <LabelList
                    dataKey="value"
                    position="top"
                    formatter={(value) => {
                      const total = dataTamanho.reduce((acc, item) => acc + item.value, 0);
                      return `${((value / total) * 100).toFixed(1)}%`;
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>

          </div>
          <div className="bg-white shadow-3xl rounded p-4 col-span-1 md:col-span-2">
            <div className="mb-6 flex justify-center md:justify-start space-x-2">
              <button
                onClick={() => setMetricType('taxa')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${metricType === 'taxa'
                  ? 'bg-cyan-500 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                📊 Taxa de Conversão
              </button>
              <button
                onClick={() => setMetricType('faturamento')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${metricType === 'faturamento'
                  ? 'bg-cyan-500 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                💰 Faturamento
              </button>
            </div>

            {/* Card Total */}
            <div className="gap-6 mb-6">
              <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col justify-center items-center">
                <h3 className="text-lg font-semibold text-gray-500 mb-2">
                  {dashboardData.metricInfo.titlePrefix} Total
                </h3>
                <p className="text-5xl font-bold text-cyan-500">
                  {dashboardData.total.formatado}
                </p>
              </div>
            </div>

            {/* Cards Segmentos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col justify-center items-center">
                <h3 className="text-lg font-semibold text-gray-500 mb-2">
                  {dashboardData.metricInfo.titlePrefix} EC
                </h3>
                <p className="text-5xl font-bold text-green-600">
                  {dashboardData.ec.formatado}
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col justify-center items-center">
                <h3 className="text-lg font-semibold text-gray-500 mb-2">
                  {dashboardData.metricInfo.titlePrefix} Social
                </h3>
                <p className="text-5xl font-bold text-blue-500">
                  {dashboardData.social.formatado}
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col justify-center items-center">
                <h3 className="text-lg font-semibold text-gray-500 mb-2">
                  {dashboardData.metricInfo.titlePrefix} Corporativo
                </h3>
                <p className="text-5xl font-bold text-purple-500">
                  {dashboardData.corporativo.formatado}
                </p>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Gráfico 1: Encomendas (EC) */}
              <div className="bg-white p-6 rounded-2xl shadow-md">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">
                  {dashboardData.metricInfo.titlePrefix} - Encomendas (EC)
                </h3>
                <ResponsiveContainer width="100%" height={alturaGraficoEC}>
                  <BarChart
                    data={dashboardData.vendedoresEC}
                    layout="vertical"
                    margin={{ top: 5, right: 35, left: 30, bottom: 5 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#374151"
                      width={150}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(229, 231, 235, 0.5)' }}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.75rem',
                      }}
                      formatter={(value) =>
                        metricType === 'taxa'
                          ? `${value}%`
                          : `R$ ${value.toLocaleString('pt-BR')}`
                      }
                    />
                    <Bar
                      dataKey="value"
                      fill="#10b981"
                      background={{ fill: '#f3f4f6', radius: 8 }}
                      radius={8}
                    >
                      <LabelList
                        dataKey="value"
                        position="right"
                        formatter={(value) =>
                          metricType === 'taxa'
                            ? `${value}%`
                            : `R$ ${value.toLocaleString('pt-BR')}`
                        }
                        fill="#374151"
                        fontWeight="bold"
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico 2: Orçamentos Sociais */}
              <div className="bg-white p-6 rounded-2xl shadow-md">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">
                  {dashboardData.metricInfo.titlePrefix} - Orçamentos Sociais
                </h3>
                <ResponsiveContainer width="100%" height={alturaGraficoSocial}>
                  <BarChart
                    data={dashboardData.vendedoresSocial}
                    layout="vertical"
                    margin={{ top: 5, right: 35, left: 30, bottom: 5 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#374151"
                      width={150}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(229, 231, 235, 0.5)' }}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.75rem',
                      }}
                      formatter={(value) =>
                        metricType === 'taxa'
                          ? `${value}%`
                          : `R$ ${value.toLocaleString('pt-BR')}`
                      }
                    />
                    <Bar
                      dataKey="value"
                      fill="#3b82f6"
                      background={{ fill: '#f3f4f6', radius: 8 }}
                      radius={8}
                    >
                      <LabelList
                        dataKey="value"
                        position="right"
                        formatter={(value) =>
                          metricType === 'taxa'
                            ? `${value}%`
                            : `R$ ${value.toLocaleString('pt-BR')}`
                        }
                        fill="#374151"
                        fontWeight="bold"
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico 3: Orçamentos Corporativos */}
              <div className="bg-white p-6 rounded-2xl shadow-md">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">
                  {dashboardData.metricInfo.titlePrefix} - Orçamentos Corporativos
                </h3>
                <ResponsiveContainer width="100%" height={alturaGraficoCorp}>
                  <BarChart
                    data={dashboardData.vendedoresCorporativo}
                    layout="vertical"
                    margin={{ top: 5, right: 35, left: 30, bottom: 5 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#374151"
                      width={150}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(229, 231, 235, 0.5)' }}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.75rem',
                      }}
                      formatter={(value) =>
                        metricType === 'taxa'
                          ? `${value}%`
                          : `R$ ${value.toLocaleString('pt-BR')}`
                      }
                    />
                    <Bar
                      dataKey="value"
                      fill="#8b5cf6"
                      background={{ fill: '#f3f4f6', radius: 8 }}
                      radius={8}
                    >
                      <LabelList
                        dataKey="value"
                        position="right"
                        formatter={(value) =>
                          metricType === 'taxa'
                            ? `${value}%`
                            : `R$ ${value.toLocaleString('pt-BR')}`
                        }
                        fill="#374151"
                        fontWeight="bold"
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>)
      }
    </div >
  );
}
