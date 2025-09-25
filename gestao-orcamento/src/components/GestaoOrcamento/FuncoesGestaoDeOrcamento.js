import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";



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
  exportToExcel
};
