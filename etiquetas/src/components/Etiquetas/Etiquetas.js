import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';


function formatarData(dataISO) {
  if (!dataISO) return '';
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}

function formatarProduto(str) {
  if (!str) return '';
  return str
    .normalize("NFD")
     // eslint-disable-next-line no-control-regex
    .replace(/\u0000/g, '').trim();
}

function normalizarTexto(texto) {
  // Remove acentos combinados, deixando apenas o caractere base ou acentuado simples
  return texto ? texto.normalize("NFC") : '';
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
  const [mostrarObs, setMostrarObs] = useState(true);
  const [setor, setSetor] = useState("");

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

  // Função para quebrar texto em várias linhas (simples)
  function splitTextToSize(text, maxLen) {
    if (!text) return [''];
    const words = text.split(' ');
    let lines = [];
    let current = '';
    for (let word of words) {
      if ((current + ' ' + word).trim().length > maxLen) {
        lines.push(current.trim());
        current = word;
      } else {
        current += ' ' + word;
      }
    }
    if (current) lines.push(current.trim());
    return lines;
  }

  // Gera etiquetas em PDF para impressão usando pdf-lib
  const gerarImpressao = async () => {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const fontSize = 10;
    const pageWidth = 297; // A4 landscape mm
    const pageHeight = 210;

    for (let copia = 0; copia < quantidadeEtiquetas; copia++) {
      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - 10; // Começa do topo
      const left = 10;

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

      // Produto
      page.drawText(normalizarTexto('Produto:'), { x: left, y, size: fontSize, font });
      // Quebra de linha automática para o nome do produto
      const nomeProdutoLines = splitTextToSize(normalizarTexto(etiquetas[0].nome) || '', 40); // ajuste 35 conforme largura da etiqueta
      let yProduto = y;
      for (let line of nomeProdutoLines) {
        page.drawText(line, { x: left + 40, y: yProduto, size: fontSize, font });
        yProduto -= 12; // mesmo espaçamento das outras linhas
      }
      
      y -= 16 + (nomeProdutoLines.length - 1) * 8; // ajusta y para as próximas linhas
      // Fabricação
      page.drawText(normalizarTexto(`Fab.: ${formatarData(etiquetas[0].fab) || ''}`), { x: left, y, size: fontSize, font });
      y -= 12;
      // Validade
      page.drawText(normalizarTexto(`Val.: ${validadeFormatada || ''}`), { x: left, y, size: fontSize, font });
      y -= 12;
      // Conservação
      const linhasCons = [
        normalizarTexto(`(${conservacao === "Congelado" ? "X" : "  "}) Congelado <0ºC a – 18 ºC`),
        normalizarTexto(`(${conservacao === "Refrigerado" ? "X" : "  "}) Resfriado 0ºC a 10ºC`),
        normalizarTexto(`(${conservacao === "Ambiente" ? "X" : "  "}) Ambiente`)
      ];
      for (let linha of linhasCons) {
        page.drawText(linha, { x: left, y, size: fontSize, font });
        y -= 12;
      }
      // Observação ou setor
      if (mostrarObs) {
        const obsLines = splitTextToSize(normalizarTexto("OBS: Regenerar em forno. Consumo imediato"), 60);
        for (let linha of obsLines) {
          page.drawText(linha, { x: left, y, size: fontSize, font });
          y -= 12;
        }
      } else if (setor) {
        const setorLines = splitTextToSize(normalizarTexto(setor), 60);
        for (let linha of setorLines) {
          page.drawText(linha, { x: left, y, size: fontSize, font });
          y -= 12;
        }
      }
    }

    // Abrir PDF em nova aba para impressão
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(blob);
    const printWindow = window.open(pdfUrl);
    if (printWindow) {
      printWindow.onload = function() {
        printWindow.focus();
        printWindow.print();
      };
    }
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
      <div className="mb-3">
        <input
          type="checkbox"
          id="mostrarObs"
          checked={mostrarObs}
          onChange={e => setMostrarObs(e.target.checked)}
        />
        <label htmlFor="mostrarObs" className="ms-2">Exibir OBS: Regenerar em forno. Consumo imediato</label>
      </div>
      {!mostrarObs && (
        <div className="mb-3">
          <label htmlFor="setor">Setor:</label>
          <input
            type="text"
            id="setor"
            className="form-control"
            value={setor}
            onChange={e => setSetor(e.target.value)}
            placeholder="Digite o setor"
          />
        </div>
      )}
      <Button variant="primary" onClick={gerarImpressao}>Imprimir etiquetas</Button>
    </div>
  );
};

export default Etiquetas;



