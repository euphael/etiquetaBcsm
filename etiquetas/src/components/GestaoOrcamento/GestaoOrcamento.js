import React, { useState, useEffect } from "react";
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

export default function GestaoOrcamento() {
  const [orcamentos, setOrcamentos] = useState([]);
  const [tipoData, setTipoData] = useState("DTINC");
  const hoje = new Date().toISOString().split("T")[0];
  const [dataInicial, setDataInicial] = useState(hoje);
  const [dataFinal, setDataFinal] = useState(hoje);
  const [vendedorFiltro, setVendedorFiltro] = useState("");
  const [situacaoFiltro, setSituacaoFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("OR");
  const [tamanhoFiltro, setTamanhoFiltro] = useState();
  const [convidadosFiltro, setConvidadosFiltro] = useState();
  const [loading, setLoading] = useState(false);
  const [aberto, setAberto] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);





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
  };

  const orcamentosFiltrados = orcamentos.filter((o) => {
    const vendedorOk = vendedorFiltro ? cleanText(o.IDX_VENDEDOR1).toString() === vendedorFiltro : true;
    const situacaoOk = situacaoFiltro ? o.SITUACAO === situacaoFiltro : true;
    const tipoOk = tipoFiltro ? o.TPDOCTO === tipoFiltro : true;

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

    return vendedorOk && situacaoOk && tipoOk && tamanhoOk && convidadosOk;
  });


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

      {/* Tabela */}
      <div className="p-6">

        <div className="bg-white shadow-3xl rounded overflow-hidden">
          <table className="w-full text-sm text-left border ">
            <thead className="bg-gray-100 text-gray-700">
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
      </div>
    </div>
  );
}
