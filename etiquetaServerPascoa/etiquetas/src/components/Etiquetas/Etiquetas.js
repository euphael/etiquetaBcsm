import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import jsPDF from "jspdf";

function formatarData(dataISO) {
  if (!dataISO) return '';
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}

function formatarProduto(str) {
  if (!str) return '';
  return str
    .normalize("NFD")
    .replace(/\u0000/g, '').trim();
}

const Etiquetas = () => {
  // Função para obter a data de hoje no formato yyyy-mm-dd
  function getHojeISO() {
    const hoje = new Date();
    const yyyy = hoje.getFullYear();
    const mm = String(hoje.getMonth() + 1).padStart(2, '0');
    const dd = String(hoje.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  const [etiquetas, setEtiquetas] = useState([
    { nome: '', fab: getHojeISO(), conservacao: '' }
  ]);
  const [quantidadeEtiquetas, setQuantidadeEtiquetas] = useState(1);
  const [produtos, setProdutos] = useState([]);
  const [validade, setValidade] = useState([]);

  useEffect(() => {
    fetch('http://192.168.1.250/server-pascoa/api/produtos')
    .then(res => res.json())
    .then(data => setProdutos(data));
  }, []);

  // Atualiza o campo de uma etiqueta
  const handleChange = (index, field, value) => {
    const novasEtiquetas = [...etiquetas];
    novasEtiquetas[index][field] = value;
    setEtiquetas(novasEtiquetas);
  };

  // Gera etiquetas em PDF para impressão
  const gerarImpressao = () => {
    // Cria PDF com tamanho padrão (A4 landscape)
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm"
    });

    for (let copia = 0; copia < quantidadeEtiquetas; copia++) {
      if (copia > 0) doc.addPage();

      const data = new Date();
      let dia = data.getDate();
      let mes = data.getMonth();
      let ano = data.getFullYear();

      const produtoSelecionado = produtos.find(
        p => formatarProduto(p.DESCRICAO) === etiquetas[0].nome
      );

      if (produtoSelecionado) {
        if (produtoSelecionado.TPVALIDADE === "D") {
          dia += Number(produtoSelecionado.VALIDADE);
        } else if (produtoSelecionado.TPVALIDADE === "M") {
          mes += Number(produtoSelecionado.VALIDADE);
        } else if (produtoSelecionado.TPVALIDADE === "A") {
          ano += Number(produtoSelecionado.VALIDADE);
        }
      }

      let dataValidade = new Date(ano, mes, dia);
      const validadeFormatada = `${String(dataValidade.getDate()).padStart(2, '0')}/${String(dataValidade.getMonth() + 1).padStart(2, '0')}/${dataValidade.getFullYear()}`;
      const conservacao = etiquetas[0].conservacao || "";

      // fonte e tamanho para caber na etiqueta (fonte menor)
      let y = 6;
      doc.setFont("Arial", "normal");
      doc.setFontSize(10);
      doc.text(`Produto:`, 5, y);
      doc.setFont("Arial", "normal");
      doc.text(doc.splitTextToSize(etiquetas[0].nome || '', 80), 18, y);
      y += 5;
      doc.setFont("Arial", "normal");
      doc.text(`Fab.: ${formatarData(etiquetas[0].fab) || ''}`, 5, y);
      y += 4;
      doc.text(`Val.: ${validadeFormatada || ''}`, 5, y);
      y += 4;
      doc.text(doc.splitTextToSize(`(${conservacao === "Congelado" ? "X" : "  "}) Congelado <0ºC a – 18 ºC`, 80), 5, y);
      y += 4;
      doc.text(doc.splitTextToSize(`(${conservacao === "Refrigerado" ? "X" : "  "}) Resfriado 0ºC a 10ºC`, 80), 5, y);
      y += 4;
      doc.text(doc.splitTextToSize(`(${conservacao === "Ambiente" ? "X" : "  "}) Ambiente`, 80), 5, y);
      y += 4;
      doc.setFont("Arial", "bold");
      doc.text(doc.splitTextToSize("OBS: Regenerar em forno. Consumo imediato", 80), 5, y);
    }

    // Abrir PDF em nova aba para impressão
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(pdfUrl);
    // Aguarda o PDF carregar antes de chamar print
    printWindow.onload = function() {
      printWindow.focus();
      printWindow.print();
    };
  };
  return (
    <div className="container mt-4">
      <h2>Preencher Etiquetas</h2>
      {etiquetas.map((etiqueta, idx) => (
        <div key={idx} className="mb-3 d-flex align-items-center">

          <select
            value={etiqueta.nome}
            onChange={e => handleChange(idx, 'nome', e.target.value)}
            className="form-control me-2"
          >
            <option value="">Selecione o produto</option>
            {produtos.map((produto, i) => (
              <option key={i} value={formatarProduto(produto.DESCRICAO)}>
                {formatarProduto(produto.DESCRICAO)}
              </option>
            ))}
          </select>

          <label htmlFor="fab">Fabricação:</label>
          <input
            type="date"
            value={etiqueta.fab}
            onChange={e => handleChange(idx, 'fab', e.target.value)}
            className="form-control me-2"
          />
        <select
          value={etiqueta.conservacao || ''}
          onChange={e => handleChange(idx, 'conservacao', e.target.value)}
          className="form-control me-2"
        >
          <option value="" disabled hidden>Selecione a conservação</option>
          <option value="Congelado">Congelado</option>
          <option value="Refrigerado">Refrigerado</option>
          <option value="Ambiente">Ambiente</option>
        </select>
        </div>
      ))}
      <label htmlFor="quantidadeEtiquetas">Quantidade de etiquetas:</label>
      <input
        type="number"
        id="quantidadeEtiquetas"
        min="1"
        className="form-control"
        value={quantidadeEtiquetas}
        onChange={e => setQuantidadeEtiquetas(Number(e.target.value))}
        />
      <br></br>
      <Button variant="primary" onClick={gerarImpressao}>Imprimir etiquetas</Button>
    </div>
  );
};

export default Etiquetas;



