import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { cleanText, formatarData, gerarPDF } from "./FuncoesSeparacaoMateriais.js";

export default function SeparacaoMateriais() {
    const [documentos, setDocumentos] = useState([]);
    const hoje = new Date().toISOString().split("T")[0];
    const [data, setData] = useState(hoje);
    const [loading, setLoading] = useState(false);
    const [aberto, setAberto] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState({});
    const [modalAberto, setModalAberto] = useState(false);
    const [itensDocumento, setItensDocumento] = useState([]);
    const [documentoSelecionado, setDocumentoSelecionado] = useState(null);
    const [loadingItens, setLoadingItens] = useState(false);
    const [busca, setBusca] = useState("");

    const fetchDados = async () => {
        setLoading(true); // inicia o spinner

        try {
            const response = await fetch(
                `http://192.168.1.250/server-pascoa/separacao-de-materiais/buscar-doc-sep?data=${data}`
            );
            const dados = await response.json();
            setDocumentos(dados);
        } catch (err) {
            console.error("Erro ao buscar dados:", err);
        }
        finally {
            setLoading(false); // inicia o spinner
        }

    };
    const fetchItensDocumento = async (documento) => {
        setLoadingItens( prev => ({ ...prev, [documento]: true }));
        try {
            const response = await fetch(
                `http://192.168.1.250/server-pascoa/separacao-de-materiais/buscar-materiais?documento=${documento}`
            );
            const dados = await response.json();
            setItensDocumento(dados);
            setDocumentoSelecionado(documento);
        } catch (err) {
            console.error("Erro ao buscar itens do documento:", err);
        } finally {
            setModalAberto(true);
            setLoadingItens( prev => ({ ...prev, [documento]: false }));
        }
    };




    const documentosFiltrados = documentos.filter((doc) => {
        const termo = busca.toLowerCase();
        return (
            doc.DOCUMENTO.toString().includes(termo) ||
            (doc.NOME && doc.NOME.toLowerCase().includes(termo))
        );
    });

    //     Documento: o.DOCUMENTO,
    //     Tipo: o.TPDOCTO,
    //     Vendedor: o.NOMEINTERNO,
    //     Cliente: o.NOME,
    //     Situação: nomeSituacao(o.SITUACAO),
    //     Valor: o.AJUSTE_TOTAL,
    //     DataEvento: o.DTEVENTO,
    //     Convidados: o.CONVIDADOS,
    //     ValorPessoa: valorPorPessoa(o),

    //   }));

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

                {/* <button
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
                </button> */}
            </div>


            {/* Filtros */}
            <div className="p-6 flex flex-wrap gap-4"
                style={{ paddingTop: '90px', }}>
                <input
                    type="date"
                    className="border rounded p-2 shadow-3xl"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                />
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
            <div className="p-6">
                <div className="mb-4 flex gap-2">
                    <input
                        type="text"
                        placeholder="Pesquisar por nº documento ou cliente..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="border px-4 py-2 rounded w-full focus:outline-none focus:ring focus:ring-blue-300"
                    />
                </div>
                <div className="bg-white shadow-3xl rounded overflow-hidden">
                    <table className="w-full text-sm text-left border ">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="px-4 py-2">Documento</th>
                                <th className="px-4 py-2">Tipo</th>
                                <th className="px-4 py-2">Vendedor</th>
                                <th className="px-4 py-2">Cliente</th>
                                <th className="px-4 py-2">Data</th>
                                <th className="px-4 py-2">Convidados</th>
                                <th className="px-4 py-2">Visualizar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documentosFiltrados.map((orc) => (
                                <React.Fragment key={orc.DOCUMENTO}>
                                    <tr className="border-t">

                                        <td className="px-4 py-2 border-gray-400">{orc.DOCUMENTO}</td>
                                        <td className="px-4 py-2">{orc.TPDOCTO}</td>
                                        <td className="px-4 py-2">{cleanText(orc.NOMEINTERNO)}</td>
                                        <td className="px-4 py-2">{orc.NOME}</td>
                                        <td className="px-4 py-2">{formatarData(orc.DTEVENTO)}</td>
                                        <td className="px-4 py-2">{orc.CONVIDADOS}</td>
                                        <td><button
                                            onClick={() => fetchItensDocumento(orc.DOCUMENTO)}
                                            className="bg-blue-500 text-white p-2 rounded flex items-center justify-center gap-2 hover:bg-blue-600 disabled:opacity-50"
                                        >{loadingItens[orc.DOCUMENTO] && (
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
                    {loadingItens[orc.DOCUMENTO] ? "Carregando..." : "Visualizar"}</button></td>
                                    </tr>
                                    <AnimatePresence>
                                        {modalAberto && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                                            >
                                                <motion.div
                                                    initial={{ scale: 0.8 }}
                                                    animate={{ scale: 1 }}
                                                    exit={{ scale: 0.8 }}
                                                    className="bg-white rounded p-6 w-11/12 md:w-2/3 max-h-[80vh] overflow-y-auto"
                                                >
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h2 className="text-xl font-bold">
                                                            Itens do Documento {documentoSelecionado}
                                                        </h2>

                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() =>
                                                                    gerarPDF(
                                                                        documentoSelecionado,
                                                                        documentos.find((d) => d.DOCUMENTO === documentoSelecionado),
                                                                        itensDocumento
                                                                    )
                                                                }
                                                                className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                                                            >
                                                                Imprimir
                                                            </button>
                                                            <button
                                                                onClick={() => setModalAberto(false)}
                                                                className="bg-red-400 text-white font-bold p-2 rounded hover:bg-red-500"
                                                            >
                                                                X
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {loadingItens[orc.DOCUMENTO] ? (
                                                        <p>Carregando...</p>
                                                    ) : (
                                                        <>
                                                            {documentos.find(d => d.DOCUMENTO === documentoSelecionado) && (
                                                                <div className="mb-6 p-4 bg-gray-50 rounded shadow">
                                                                    <h3 className="text-lg font-semibold mb-2">Informações do Evento</h3>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                                        <p><strong>Cliente:</strong> {documentos.find(d => d.DOCUMENTO === documentoSelecionado).NOME}</p>
                                                                        <p><strong>Vendedor:</strong> {cleanText(documentos.find(d => d.DOCUMENTO === documentoSelecionado).NOMEINTERNO)}</p>
                                                                        <p><strong>Data do Evento:</strong> {formatarData(documentos.find(d => d.DOCUMENTO === documentoSelecionado).DTEVENTO)}</p>
                                                                        <p><strong>Convidados:</strong> {documentos.find(d => d.DOCUMENTO === documentoSelecionado).CONVIDADOS}</p>
                                                                        <p><strong>Evento:</strong> {cleanText(documentos.find(d => d.DOCUMENTO === documentoSelecionado).DESCRICAO)}</p>
                                                                        <p><strong>Telefone:</strong> <strong>{cleanText(documentos.find(d => d.DOCUMENTO === documentoSelecionado).TPTELEFONE1)}</strong> {cleanText(documentos.find(d => d.DOCUMENTO === documentoSelecionado).DDD1)} {cleanText(documentos.find(d => d.DOCUMENTO === documentoSelecionado).TELEFONE1)} <strong>{cleanText(documentos.find(d => d.DOCUMENTO === documentoSelecionado).TPTELEFONE2)}</strong> {cleanText(documentos.find(d => d.DOCUMENTO === documentoSelecionado).DDD2)} {cleanText(documentos.find(d => d.DOCUMENTO === documentoSelecionado).TELEFONE2)}</p>
                                                                        <p><strong>Local:</strong> {documentos.find(d => d.DOCUMENTO === documentoSelecionado).LOCAL}</p>
                                                                        <p><strong>OBS Externas:</strong> {documentos.find(d => d.DOCUMENTO === documentoSelecionado).TEXTO}<br></br>{documentos.find(d => d.DOCUMENTO === documentoSelecionado).TXTCONCLUSAO}</p>
                                                                        <p><strong>OBS Internas:</strong> {documentos.find(d => d.DOCUMENTO === documentoSelecionado).TXTHISTORICO}</p>

                                                                    </div>
                                                                </div>
                                                            )}
                                                            {Object.entries(
                                                                itensDocumento.reduce((acc, item) => {
                                                                    const negocio = cleanText(item.IDX_NEGOCIO) || "Sem Negócio";
                                                                    if (!acc[negocio]) acc[negocio] = [];
                                                                    acc[negocio].push(item);
                                                                    return acc;
                                                                }, {})
                                                            ).map(([negocio, itens]) => (
                                                                <div key={negocio} className="mb-8">
                                                                    <h3 className="text-lg font-bold mb-2">{negocio}</h3>
                                                                    <table className="w-full text-sm text-left border">
                                                                        <thead className="bg-gray-100">
                                                                            <tr>
                                                                                <th className="px-4 py-2 border">Código</th>
                                                                                <th className="px-4 py-2 border">Descrição</th>
                                                                                <th className="px-4 py-2 border">Quantidade</th>
                                                                                <th className="px-4 py-2 border">Unidade</th>
                                                                                <th className="px-4 py-2 border">Negócio</th>
                                                                                <th className="px-4 py-2 border">Linha</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {itens.map((item, index) => (
                                                                                <tr key={index} className="border-t">
                                                                                    <td className="px-4 py-2 border">{cleanText(item.CODPRODUTO)}</td>
                                                                                    <td className="px-4 py-2 border">{item.DESCRICAO}</td>
                                                                                    <td className="px-4 py-2 border">{item.QUANTIDADE_AJUSTADA}</td>
                                                                                    <td className="px-4 py-2 border">{item.UNIDADE}</td>
                                                                                    <td className="px-4 py-2 border">{cleanText(item.IDX_NEGOCIO)}</td>
                                                                                    <td className="px-4 py-2 border">{cleanText(item.IDX_LINHA)}</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            ))}
                                                        </>
                                                    )}

                                                </motion.div>
                                            </motion.div>
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
