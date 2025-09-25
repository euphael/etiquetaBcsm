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
  EventoDropdown,
  formatarData,
  exportToExcel
} from "./FuncoesGestaoDeOrcamento.js";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart,
  Line,LabelList
} from "recharts";

export default function GestaoOrcamento() {
  const [orcamentos, setOrcamentos] = useState([]);
  const [tipoData, setTipoData] = useState("DTINC");
  const hoje = new Date().toISOString().split("T")[0];
  const [dataInicial, setDataInicial] = useState(hoje);
  const [dataFinal, setDataFinal] = useState(hoje);
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
  const coresCategoria = {
    "Convertidos": "#22c55e",
    "Não Convertidos": "#ef4444",
    "Em Aberto": "#facc15"
  };

  // Agrupar orçamentos por categoria








  const fetchDados = async () => {
    setLoading(true); // inicia o spinner

    try {
      const response = await fetch(
        `http://192.168.1.250/server-pascoa/gestao-de-orcamento?tipoData=${tipoData}&dataInicial=${dataInicial}&dataFinal=${dataFinal}`
      );
      const data = await response.json();
      setOrcamentos(data);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    }
    finally {
      setLoading(false); // inicia o spinner
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
    DataEvento: o.DTEVENTO,
    Convidados: o.CONVIDADOS,
    ValorPessoa: valorPorPessoa(o),

  }));

  useEffect(() => {
    fetchDados();

  }, []);

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

  const dataMeses = useMemo(() => {
    const agrupado = {};

    orcamentosFiltrados.forEach((orc) => {
      if (!orc.DTINC[0]) return;

      const data = formatarData(orc.DTINC[0]); // dd/mm/aaaa
      const [dia, mes, ano] = data.split("/");

      const chave = `${ano}-${mes}`; // yyyy-mm para ordenar

      if (!agrupado[chave]) {
        agrupado[chave] = { convertidos: 0, naoConvertidos: 0 };
      }

      const convertidos = ["Z", "F", "B", "V"];

      if (convertidos.includes(orc.SITUACAO)) {
        agrupado[chave].convertidos += 1;
      } else {
        agrupado[chave].naoConvertidos += 1;
      }
    });

    return Object.keys(agrupado)
      .sort((a, b) => new Date(a + "-01") - new Date(b + "-01"))
      .map((chave) => {
        const [ano, mes] = chave.split("-");
        const convertidos = agrupado[chave].convertidos;
        const naoConvertidos = agrupado[chave].naoConvertidos;

        return {
          mesAno: `${mes}/${ano}`,
          convertidos: agrupado[chave].convertidos,
          naoConvertidos: agrupado[chave].naoConvertidos,
          total: convertidos + naoConvertidos
        };
      });
  }, [orcamentosFiltrados]);




  const dataCategorias = orcamentosFiltrados.reduce((acc, o) => {
    const situacao = o.SITUACAO;
    let categoria;

    if (["Z", "F", "B", "V"].includes(situacao)) {
      categoria = "Convertidos";
    } else if (["C", "N", "Y"].includes(situacao)) {
      categoria = "Não Convertidos";
    } else {
      categoria = "Outros";
    }

    acc[categoria] = (acc[categoria] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(dataCategorias).map(([name, value]) => ({ name, value }));



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
        {/* Logo */}
        <img
          src="https://souttomayorevoce.com.br/wp-content/themes/soutto/images/logo-soutto.png"
          alt="Célia Soutto Mayor - Buffet em BH | Célia Soutto Mayor"
          title="Célia Soutto Mayor"
          className="webpexpress-processed no-lazy"
          style={{ height: "55px" }}
        />

        {/* Botão Login/Logout */}
        <button
          onClick={() => {
            if (isLoggedIn) {
              Cookies.remove("token");
              setIsLoggedIn(false);
            } else {
              window.location.href = "/";
            }
          }}
          className={`px-4 py-2 rounded ${isLoggedIn
            ? "border border-red-500 text-red-500 hover:bg-red-50"
            : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
        >
          {isLoggedIn ? "Sair" : "Entrar"}
        </button>
      </div>


      {/* Filtros */}
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

      {/* Cards Resumo */}
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
      <div className="flex gap-4 p-4">
        <button
          onClick={() => setAbaAtiva("graficos")}
          className={`shadow-3xl px-4 py-2 rounded ${abaAtiva === "graficos" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Gráficos
        </button>
        <button
          onClick={async () => {
            setLoadingTabela(true);
            // Simula carregamento, aqui você poderia chamar fetchDados ou outro processo
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setAbaAtiva("tabela");
            setLoadingTabela(false);
          }}
          className={`shadow-3xl p-2 rounded flex items-center justify-center gap-2 hover:bg-blue-600 ${abaAtiva === "tabela" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          disabled={loadingTabela}
        >
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
          {loadingTabela ? "Carregando..." : "Mostrar Tabela"}
        </button>
      </div>

      {/* Tabela */}
      {abaAtiva === "tabela" && (
        <div className="p-6">

          <div className="bg-white shadow-3xl rounded   max-h-[500px] overflow-auto">
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
                {orcamentosFiltrados.map((orc) => (
                  <React.Fragment key={orc.DOCUMENTO}>
                    {/* Linha principal */}
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

                    {/* Dropdown de detalhes */}
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
                              <p><strong>Data do Evento:</strong> {formatarData(orc.DTEVENTO)}</p>
                            </div>
                          </motion.div>
                        </td>
                      )}
                    </AnimatePresence>

                  </React.Fragment>
                ))}

              </tbody>
            </table>
          </div>
        </div>)}
      {abaAtiva === "graficos" && (

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="bg-white shadow-3xl rounded p-4">

            <h2 className="font-bold mb-2">Quantidade por Situação</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => {
                  const total = pieData.reduce((acc, entry) => acc + entry.value, 0);
                  const percentual = ((value / total) * 100).toFixed(2); // 1 casa decimal
                  return `${name}: ${percentual}%`;
                }}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={coresCategoria[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>


          </div>

          {/* Quantidade por situação */}
          <div className="bg-white shadow-3xl rounded p-4">
            <h2 className="font-bold mb-2">Distribuição por Tamanho do Orçamento</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataTamanho}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value} orçamentos`} />
                <Bar dataKey="value" fill="#10b981">
                  <LabelList
                    dataKey="value"
                    position="top"
                    formatter={(value) => {
                      const total = dataTamanho.reduce((acc, item) => acc + item.value, 0);
                      return `${((value / total) * 100).toFixed(1)}%`; // Mostra percentual
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white shadow-3xl rounded p-4 col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold mb-2">
              Orçamentos por Mês
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dataMeses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="mesAno"
                  interval={0}
                  tick={({ x, y, payload }) => {
                    const dados = dataMeses.find(d => d.mesAno === payload.value);
                    const porcentagem = dados ? ((dados.convertidos / dados.total) * 100).toFixed(0) + "%" : "";

                    return (
                      <g transform={`translate(${x},${y + 10})`}>
                        <text textAnchor="middle" fill="#666" fontSize={12}>
                          {payload.value}  {/* data */}
                        </text>
                        <text textAnchor="middle" fill="#22c55e" fontSize={12} y={15}>
                          {porcentagem}  {/* % de convertidos */}
                        </text>
                      </g>
                    );
                  }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Total Orçamentos"
                />
                <Line type="monotone" dataKey="convertidos" stroke="#22c55e" name="Convertidos" />
                <Line type="monotone" dataKey="naoConvertidos" stroke="#ef4444" name="Não Convertidos" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>)}
    </div>
  );
}
