import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


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

function corTempo(situacao, dt) {
    const agora = new Date();
    const inicio = new Date(dt);
    const diffMs = agora - inicio;
    const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (situacao === "C") return "text-black-600 font-bold bg-gray-400";
    if (situacao === "Z" || situacao === "V" || situacao === "B") return "text-black-600 font-bold bg-blue-500";

    if (dias <= 7) return "text-black-600 font-bold bg-green-400";
    if (dias <= 15) return "text-black-500 font-bold bg-yellow-400";
    if (dias <= 30) return "text-black-500 font-bold bg-orange-400";

    return "text-black-600 font-bold bg-red-400";
}
function taxaConversao(orcs) {
    const totalLancados = orcs.length;
    if (totalLancados === 0) return "0%";

    const totalFechados = orcs.filter(o => o.SITUACAO === "V" || o.SITUACAO === "Z" || o.SITUACAO === "B").length;

    const taxa = (totalFechados / totalLancados) * 100;

    return taxa.toFixed(2) + "%";
}

function cleanText(text) {
    if (!text) return "";
    // Remove caracteres de controle (ASCII 0–31) e trim
    return text.replace(/[\x00-\x1F\x7F]/g, "").trim();
}
function diferencaMediaEntreDatas(dtInicio, dtFim) {
    const inicio = new Date(dtInicio);
    const fim = new Date(dtFim);
    const diffMs = fim - inicio;

    const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diffMs % (1000 * 60)) / 1000);

    return { diffMs, dias, horas, minutos, segundos };
}
function mediaTempoFechamento(orcs) {
    // filtra contratos vigentes
    const vigentes = orcs.filter(o => o.SITUACAO === "V");
    if (vigentes.length === 0) return "0d 0h 0m";

    // soma do tempo em ms usando diferencaEntreDatas
    const totalMs = vigentes.reduce((acc, o) => {
        // fallback se DTINICIO não existir
        const { diffMs } = diferencaMediaEntreDatas(o.DTINC[0], o.DTINC[1]);
        return acc + diffMs;
    }, 0);

    // média em ms
    const mediaMs = totalMs / vigentes.length;

    // converte para dias, horas, minutos e segundos
    const dias = Math.floor(mediaMs / (1000 * 60 * 60 * 24));
    const horas = Math.floor((mediaMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((mediaMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${dias}d ${horas}h ${minutos}m`;
}


function corSituacao(situacao) {
    switch (situacao) {
        case "B":
        case "Z":
        case "V":
        case 'F':
            return "bg-green-500"; // verde
        case "N":
            return "bg-yellow-400"; // amarelo
        case "C":
        case "Y":
            return "bg-red-500"; // vermelho
        default:
            return "bg-gray-500"; // caso não previsto
    }
}
function nomeSituacao(situacao) {
    switch (situacao) {
        case "B":
            return "Baixada";
        case "C":
            return "Cancelada";
        case "N":
            return "Não Confirmada";
        case "Z":
            return "Autorizada";
        case "V":
            return "Contrato Vigente";
        case "Y":
            return "Perdido";
        case 'F':
            return 'Confirmado';
        default:
            return situacao; // caso não previsto, mostra o código
    }
}

const valorPorPessoa = (orc) => {
    if (!orc.CONVIDADOS || orc.CONVIDADOS === 0) return 0;
    return orc.AJUSTE_TOTAL / orc.CONVIDADOS;
};

function diferencaEntreDatas(dt1, dt2) {
    const inclusao = new Date(dt1);
    const contrato = new Date(dt2);

    const diffMs = contrato - inclusao;

    const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${dias}d ${horas}h ${minutos}m`;
}
function Timer({ dt }) {
    const [tempo, setTempo] = useState("");

    useEffect(() => {
        const calcularTempo = () => {
            const inicio = new Date(dt);
            const agora = new Date();
            const diffMs = agora - inicio;

            const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const horas = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

            return `${dias}d ${horas}h ${minutos}m`;
        };

        // atualiza imediatamente
        setTempo(calcularTempo());

        // atualiza a cada 1s
        const interval = setInterval(() => {
            setTempo(calcularTempo());
        }, 60000);

        return () => clearInterval(interval);
    }, [dt]);

    return <span>{tempo}</span>;
}
const EventoDropdown = ({ evento }) => {
    const [aberto, setAberto] = useState(false);

    return (
        <div className="border-b border-gray-300">
            {/* Linha clicável */}
            <div
                className="cursor-pointer flex justify-between items-center p-3 hover:bg-gray-100"
                onClick={() => setAberto(!aberto)}
            >
                <span>{evento.nome}</span>
                <span>{aberto ? "▲" : "▼"}</span>
            </div>

            {/* Dropdown (mostra detalhes do evento) */}
            {aberto && (
                <div className="bg-gray-50 p-4 text-sm text-gray-700">
                    <p><strong>Data:</strong> {evento.data}</p>
                    <p><strong>Local:</strong> {evento.local}</p>
                    <p><strong>Descrição:</strong> {evento.descricao}</p>
                </div>
            )}
        </div>
    );
};
function formatarData(dt) {
    const data = new Date(dt);
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();

    return `${dia}/${mes}/${ano}`;
}
function exportToExcel(dados, nomeArquivo = "planejamento.xlsx") {
    // Cria worksheet a partir dos dados
    const ws = XLSX.utils.json_to_sheet(dados);

    // Cria workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orçamentos");

    // Gera buffer e salva arquivo
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, nomeArquivo);
}

const CustomTooltipVendedor = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0].payload;
  const { name, detalhe, metricType } = item;

  const totalOR = detalhe?.OR?.total || 0;
  const convOR = detalhe?.OR?.convertidos || 0;
  const faturamentoOR = detalhe?.OR?.faturamento || 0;

  const totalEC = detalhe?.EC?.total || 0;
  const convEC = detalhe?.EC?.convertidos || 0;
  const faturamentoEC = detalhe?.EC?.faturamento || 0;

  const formatPercent = (value) => `${value.toFixed(1)}%`;
  const formatCurrency = (value) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const taxaOR = totalOR > 0 ? (convOR / totalOR) * 100 : 0;
  const taxaEC = totalEC > 0 ? (convEC / totalEC) * 100 : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
      <strong className="block text-gray-800 mb-2">{name}</strong>

      {metricType === "taxa" ? (
        <>
          <div className="flex justify-between gap-4 mb-1">
            <span className="text-blue-600 font-medium">🧾 OR</span>
            <span className="text-gray-600">
              {convOR}/{totalOR} • {formatPercent(taxaOR)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-green-600 font-medium">📦 EC</span>
            <span className="text-gray-600">
              {convEC}/{totalEC} • {formatPercent(taxaEC)}
            </span>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between gap-4 mb-1">
            <span className="text-blue-600 font-medium">🧾 Faturamento OR</span>
            <span className="text-gray-600">{formatCurrency(faturamentoOR)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-green-600 font-medium">📦 Faturamento EC</span>
            <span className="text-gray-600">{formatCurrency(faturamentoEC)}</span>
          </div>
        </>
      )}
    </div>
  );
};

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

export {
    corTempo,
    taxaConversao,
    cleanText,
    diferencaMediaEntreDatas,
    mediaTempoFechamento,
    corSituacao,
    nomeSituacao,
    valorPorPessoa,
    diferencaEntreDatas,
    Timer,
    EventoDropdown,
    formatarData,
    exportToExcel,
    PainelControleGrafico,
    CustomXAxisTick,
    CustomTooltipVendedor
};
