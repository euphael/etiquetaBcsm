import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
function cleanText(text) {
  if (!text) return "";
  // Remove caracteres de controle (ASCII 0–31) e trim
  return text.replace(/[\x00-\x1F\x7F]/g, "").trim();
}
function formatarData(dt) {
  if (!dt) return "-";

  // Remove o "Z" se existir e separa
  const [dataPart, horaPart] = dt.replace("Z", "").split("T");
  const [ano, mes, dia] = dataPart.split("-");
  const [hora, minuto] = horaPart.split(":");

  return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}

const gerarPDF = (documento, evento, itensDocumento) => {
  const doc = new jsPDF("p", "pt", "a4");

  // Cabeçalho
  doc.setFontSize(16);
  doc.text(`Relatório do Documento ${documento}`, 40, 20);

  // Informações do evento
  const info = [
    ["Cliente", evento.NOME],
    ["Vendedor", evento.NOMEINTERNO],
    ["Data do Evento", formatarData(evento.DTEVENTO)],
    ["Convidados", evento.CONVIDADOS],
    ["Evento", evento.DESCRICAO],
    ["Telefone", `${evento.TPTELEFONE1} ${evento.DDD1} ${evento.TELEFONE1} | ${evento.TPTELEFONE2} ${evento.DDD2} ${evento.TELEFONE2}`],
    ["Local", evento.LOCAL],
    ["OBS Externas", `${evento.TEXTO || ""} ${evento.TXTCONCLUSAO || ""}`],
    ["OBS Internas", evento.TXTHISTORICO || ""],
  ];

  autoTable(doc, {
    startY: 30,
    head: [["Campo", "Valor"]],
    body: info,
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: { 0: { fontStyle: "bold", halign: "left" } },
    theme: "striped",
  });

  let finalY = doc.lastAutoTable.finalY + 20;

  // Itens agrupados por negócio
  const grupos = itensDocumento.reduce((acc, item) => {
    const negocio = cleanText(item.IDX_NEGOCIO) || "Sem Negócio";
    if (!acc[negocio]) acc[negocio] = [];
    acc[negocio].push(item);
    return acc;
  }, {});

  Object.entries(grupos).forEach(([negocio, itens]) => {
    doc.setFontSize(12);
    doc.text(`${negocio}`, 40, finalY);

    autoTable(doc, {
      startY: finalY + 10,
      head: [["Código", "Descrição", "Qtd", "Unidade", "Negócio", "Linha"]],
      body: itens.map((i) => [
        i.CODPRODUTO,
        i.DESCRICAO,
        i.QUANTIDADE_AJUSTADA,
        i.UNIDADE,
        i.IDX_NEGOCIO,
        i.IDX_LINHA,
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      theme: "grid",
    });

    finalY = doc.lastAutoTable.finalY + 20;
  });
  const blob = doc.output("blob");
  const blobURL = URL.createObjectURL(blob);

  // Cria iframe invisível para impressão
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = blobURL;
  document.body.appendChild(iframe);

  iframe.onload = function () {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  };
};




export {
  cleanText,
  formatarData,
  gerarPDF
};