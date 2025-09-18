import { useState, useEffect } from "react";

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




export {
  cleanText,
  formatarData
};