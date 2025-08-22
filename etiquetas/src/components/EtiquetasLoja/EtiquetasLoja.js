import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import jsPDF from "jspdf";
import axios from 'axios';
import Select from 'react-select';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import * as pdfjsLib from 'pdfjs-dist';
import acucar from '../assets/acucar.png';
import acucarGordura from '../assets/acucarGordura.png';
import acucarSodio from '../assets/acucarSodio.png';
import gordura from '../assets/gordura.png';
import sodio from '../assets/sodio.png';
import sodioGordura from '../assets/sodioGordura.png';
import todos from '../assets/todos.png';
import imgtransgenico from '../assets/transgenicos.png';
import JsBarcode from "jsbarcode";


pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function formatarProduto(str) {
  if (!str) return '';
  return str
    .normalize("NFD")
    .replace(/\u0000/g, '').trim();
}
const EtiquetasLoja = () => {
  // Função para obter a data de hoje no formato yyyy-mm-dd
  const [showModal, setShowModal] = useState(false); // Controle do modal
  const [showModalConfirmacao, setShowModalConfirmacao] = useState(false);

  function getHojeISO() {
    const hoje = new Date();
    const yyyy = hoje.getFullYear();
    const mm = String(hoje.getMonth() + 1).padStart(2, '0');
    const dd = String(hoje.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  const [porcao, setPorcao] = useState('');
  const [caseira, setCaseira] = useState('');
  const [energia100g, setEnergia100g] = useState('');
  const [energiag, setEnergiag] = useState('');
  const [energiaVD, setEnergiaVD] = useState('');
  const [carb100g, setCarb100g] = useState('');
  const [carbg, setCarbg] = useState('');
  const [carbVD, setCarbVD] = useState('');
  const [acucar100g, setAcucar100g] = useState('');
  const [acucarg, setAcucarg] = useState('');
  const [acucarVD, setAcucarVD] = useState('');
  const [acucarad100g, setAcucarad100g] = useState('');
  const [acucaradg, setAcucaradg] = useState('');
  const [acucaradVD, setAcucaradVD] = useState('');
  const [proteina100g, setProteina100g] = useState('');
  const [proteinag, setProteinag] = useState('');
  const [proteinaVD, setProteinaVD] = useState('');
  const [gorduraTotal100g, setGorduraTotal100g] = useState('');
  const [gorduraTotalg, setGorduraTotalg] = useState('');
  const [gorduraTotalVD, setGorduraTotalVD] = useState('');
  const [gorduraSaturada100g, setGorduraSaturada100g] = useState('');
  const [gorduraSaturadag, setGorduraSaturadag] = useState('');
  const [gorduraSaturadaVD, setGorduraSaturadaVD] = useState('');
  const [gorduraTrans100g, setGorduraTrans100g] = useState('');
  const [gorduraTransg, setGorduraTransg] = useState('');
  const [gorduraTransVD, setGorduraTransVD] = useState('');
  const [fibra100g, setFibra100g] = useState('');
  const [fibrag, setFibrag] = useState('');
  const [fibraVD, setFibraVD] = useState('');
  const [sodio100g, setSodio100g] = useState('');
  const [sodiog, setSodiog] = useState('');
  const [sodioVD, setSodioVD] = useState('');
  const [valoresReferencia, setValoresReferencia] = useState('*Percentual de valores diários fornecidos pela porção.')
  const [ingredientes, setIngredientes] = useState('');
  const [lactose, setLactose] = useState('');
  const [glutem, setGlutem] = useState('');
  const [alergenicos, setAlergenicos] = useState('');
  const [transgenico, setTransgenico] = useState('');
  const [selo_alto_em, setselo_alto_em] = useState('');
  const [armazenamento, setArmazenamento] = useState('');
  const [produto, setProduto] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [valorQuant, setValorQuant] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [quantidadeEtiquetas, setQuantidadeEtiquetas] = useState(1);
  const [produtos, setProdutos] = useState([]);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [fabricacao, setFabricacao] = useState(() => new Date().toISOString().split('T')[0]);
  const [validade, setValidade] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [erros, setErros] = useState({});

  const wrapText = (text, maxWidth, doc) => {
    const words = text.split(" "); // Divide o texto em palavras
    let line = "";
    let lines = [];

    words.forEach(word => {
      // Verifique se a palavra atual cabe na linha
      const testLine = line ? line + " " + word : word;
      const width = doc.getStringUnitWidth(testLine) * doc.getFontSize();

      // Se a largura exceder o limite, adiciona a linha e começa uma nova
      if (width > maxWidth) {
        lines.push(line);
        line = word; // Começa uma nova linha com a palavra atual
      } else {
        line = testLine;
      }
    });

    // Adiciona a última linha restante
    lines.push(line);
    return lines.join("\n");
  };
  // Token esperado
  useEffect(() => {
    console.log("Verificando cookies: ", document.cookie); // Verifique se o cookie está presente
    const token = Cookies.get('token'); // Recupera o token do cookie
    console.log("Token recuperado: ", token); // Debug do token

    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log(decoded); // Exibe o conteúdo do token, incluindo a data de expiração

        // Verifique se o token está expirado
        const isExpired = decoded.exp * 1000 < Date.now(); // exp é em segundos, converte para milissegundos

        if (isExpired) {
          setIsLoggedIn(false);
        } else {
          if (decoded.username === 'qualidade' || decoded.username === 'admin') {
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
          }
        }
      } catch (error) {
        console.error('Erro ao decodificar o token:', error);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const validarCamposObrigatorios = () => {
    const novosErros = {};

    const isFieldValid = (value) => {
      return value !== null && value !== undefined && value !== '';  // Permite 0 como valor válido
    };
    function isValidEAN(code) {
      if (!code) return true; // nulo, undefined ou string vazia
      if (!/^\d+$/.test(code)) return false; // só números

      const len = code.length;
      if (len !== 8 && len !== 13) return false; // só EAN-8 ou EAN-13

      // separar dígito verificador
      const digits = code.split("").map(Number);
      const checkDigit = digits.pop();

      // cálculo do dígito esperado
      let sum = 0;
      for (let i = digits.length - 1; i >= 0; i--) {
        let num = digits[i];
        if ((digits.length - i) % 2 === (len === 13 ? 1 : 0)) {
          num *= 3; // peso 3 nas posições certas
        }
        sum += num;
      }
      const expectedCheck = (10 - (sum % 10)) % 10;

      return checkDigit === expectedCheck;
    }


    // Verificar todos os campos
    if (!isFieldValid(produto)) novosErros.produto = true;
    if (!isFieldValid(porcao)) novosErros.porcao = true;
    if (!isFieldValid(caseira)) novosErros.caseira = true;
    if (!isFieldValid(energia100g)) novosErros.energia100g = true;
    if (!isFieldValid(energiag)) novosErros.energiag = true;
    if (!isFieldValid(energiaVD)) novosErros.energiaVD = true;
    if (!isFieldValid(carb100g)) novosErros.carb100g = true;
    if (!isFieldValid(carbg)) novosErros.carbg = true;
    if (!isFieldValid(carbVD)) novosErros.carbVD = true;
    if (!isFieldValid(acucar100g)) novosErros.acucar100g = true;
    if (!isFieldValid(acucarg)) novosErros.acucarg = true;
    // if (!isFieldValid(acucarVD)) novosErros.acucarVD = true;
    if (!isFieldValid(acucarad100g)) novosErros.acucarad100g = true;
    if (!isFieldValid(acucaradg)) novosErros.acucaradg = true;
    if (!isFieldValid(acucaradVD)) novosErros.acucaradVD = true;
    if (!isFieldValid(proteina100g)) novosErros.proteina100g = true;
    if (!isFieldValid(proteinag)) novosErros.proteinag = true;
    if (!isFieldValid(proteinaVD)) novosErros.proteinaVD = true;
    if (!isFieldValid(gorduraTotal100g)) novosErros.gorduraTotal100g = true;
    if (!isFieldValid(gorduraTotalg)) novosErros.gorduraTotalg = true;
    if (!isFieldValid(gorduraTotalVD)) novosErros.gorduraTotalVD = true;
    if (!isFieldValid(gorduraSaturada100g)) novosErros.gorduraSaturada100g = true;
    if (!isFieldValid(gorduraSaturadag)) novosErros.gorduraSaturadag = true;
    if (!isFieldValid(gorduraSaturadaVD)) novosErros.gorduraSaturadaVD = true;
    if (!isFieldValid(gorduraTrans100g)) novosErros.gorduraTrans100g = true;
    if (!isFieldValid(gorduraTransg)) novosErros.gorduraTransg = true;
    if (!isFieldValid(gorduraTransVD)) novosErros.gorduraTransVD = true;
    if (!isFieldValid(fibra100g)) novosErros.fibra100g = true;
    if (!isFieldValid(fibrag)) novosErros.fibrag = true;
    if (!isFieldValid(fibraVD)) novosErros.fibraVD = true;
    if (!isFieldValid(sodio100g)) novosErros.sodio100g = true;
    if (!isFieldValid(sodiog)) novosErros.sodiog = true;
    if (!isFieldValid(sodioVD)) novosErros.sodioVD = true;
    if (!isFieldValid(ingredientes)) novosErros.ingredientes = true;
    if (!isFieldValid(valoresReferencia)) novosErros.valoresReferencia = true;
    // if (!isFieldValid(armazenamento)) novosErros.armazenamento = true;
    // if (!isFieldValid(alergenicos)) novosErros.alergenicos = true;
    if (!isFieldValid(glutem)) novosErros.glutem = true;
    if (!isFieldValid(lactose)) novosErros.lactose = true;
    if (!isFieldValid(quantidade)) novosErros.quantidade = true;
    if (!isValidEAN(valorQuant)) novosErros.valorQuant = true;
    if (!isFieldValid(valorTotal)) novosErros.valorTotal = true;
    if (!isFieldValid(validade)) novosErros.validade = true;
    // if (!isFieldValid(transgenico)) novosErros.transgenico = true;
    // if (!isFieldValid(selo_alto_em)) novosErros.selo_alto_em = true;


    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const opcoesProdutos = produtos.map(produto => ({
    value: produto.id,
    label: `${produto.id} - ${formatarProduto(produto.produto)}`
  }));

  const handleCriar = () => {
    // limparCampos(); // opcional, se quiser limpar os campos
    setProduto('');
    setPorcao('');
    setCaseira('');
    setEnergia100g('');
    setEnergiag('');
    setEnergiaVD('');
    setCarb100g('');
    setCarbg('');
    setCarbVD('');
    setAcucar100g('');
    setAcucarg('');
    setAcucarVD('');
    setAcucarad100g('');
    setAcucaradg('');
    setAcucaradVD('');
    setProteina100g('');
    setProteinag('');
    setProteinaVD('');
    setGorduraTotal100g('');
    setGorduraTotalg('');
    setGorduraTotalVD('');
    setGorduraSaturada100g('');
    setGorduraSaturadag('');
    setGorduraSaturadaVD('');
    setGorduraTrans100g('');
    setGorduraTransg('');
    setGorduraTransVD('');
    setFibra100g('');
    setFibrag('');
    setFibraVD('');
    setSodio100g('');
    setSodiog('');
    setSodioVD('');
    setIngredientes('');
    setGlutem('');
    setAlergenicos('');
    setArmazenamento('');
    setQuantidade('');
    setValorQuant('');
    setValorTotal('');
    setLactose('');
    setValidade('');
    setselo_alto_em('');
    setTransgenico('');

    setModoEdicao(false);
    setShowModal(true);
  };

  const handleExcluir = () => {
    if (!itemSelecionado || !itemSelecionado.id) {
      alert("Nenhum item selecionado para exclusão.");
      return;
    }

    axios.delete(`http://192.168.1.250/server-pascoa/etiquetas/${itemSelecionado.id}`)
      .then((response) => {
        console.log('Etiqueta excluída com sucesso:', response.data);

        // Atualiza a lista local removendo a etiqueta excluída
        setProdutos(produtos.filter(p => p.id !== itemSelecionado.id));

        // Resetar item selecionado e fechar modal
        setItemSelecionado(null);
        setShowModalConfirmacao(false);
      })
      .catch((error) => {
        console.error('Erro ao excluir a etiqueta:', error);
        alert('Erro ao excluir a etiqueta. Tente novamente.');
      });
  };

  const [etiquetas, setEtiquetas] = useState([
    { nome: '', fab: getHojeISO(), conservacao: '' }
  ]);

  const formatDate = (date) => {
    try {
      if (!date) return '';
      const data = new Date(date);
      if (isNaN(data.getTime())) return '';

      data.setDate(data.getDate() + 1); // ✅ Soma 1 dia

      return data.toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return '';
    }
  };

  const buscarProdutos = () => {
    axios.get('http://192.168.1.250/server-pascoa/etiquetas')
      .then(response => {
        setProdutos(response.data.etiquetas);
      })
      .catch(error => {
        console.error('Erro ao buscar produtos:', error);
        alert('Erro ao buscar produtos. Tente novamente.');
      });
  };

  useEffect(() => {
    buscarProdutos();
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
      unit: "mm",
      format: [80, 80]
    });

    const {
      produto, porcao, caseira, energia100g, energiag, energiaVD, carb100g, carbg, carbVD,
      acucar100g, acucarg, acucarVD, acucarad100g, acucaradg, acucaradVD,
      proteina100g, proteinag, proteinaVD, gorduraTotal100g, gorduraTotalg,
      gorduraTotalVD, gorduraSaturada100g, gorduraSaturadag, gorduraSaturadaVD,
      gorduraTrans100g, gorduraTransg, gorduraTransVD, fibra100g, fibrag,
      fibraVD, sodio100g, sodiog, sodioVD, ingredientes, glutem, armazenamento,
      quantidade, valorQuant, valorTotal, alergenicos, valoresReferencia, lactose,
      selo_alto_em, transgenico
    } = itemSelecionado;

    for (let copia = 0; copia < quantidadeEtiquetas; copia++) { // Gerar as etiquetas com a quantidade especificada
      if (copia > 0) doc.addPage();

      // Convertendo todos os valores para strings
      const nomeProduto = String(produto);


      const informacoesNutricionais = [
        { nome: 'Valor energético (kcal)', valor100g: energia100g, valor120g: energiag, VD: energiaVD },
        { nome: 'Carboidratos (g)', valor100g: carb100g, valor120g: carbg, VD: carbVD },
        { nome: ' Açúcares totais (g)', valor100g: acucar100g, valor120g: acucarg, VD: acucarVD },
        { nome: '  Açúcares adicionados (g)', valor100g: acucarad100g, valor120g: acucaradg, VD: acucaradVD },
        { nome: 'Proteínas (g)', valor100g: proteina100g, valor120g: proteinag, VD: proteinaVD },
        { nome: 'Gorduras totais (g)', valor100g: gorduraTotal100g, valor120g: gorduraTotalg, VD: gorduraTotalVD },
        { nome: ' Gorduras saturadas (g)', valor100g: gorduraSaturada100g, valor120g: gorduraSaturadag, VD: gorduraSaturadaVD },
        { nome: ' Gorduras trans (g)', valor100g: gorduraTrans100g, valor120g: gorduraTransg, VD: gorduraTransVD },
        { nome: 'Fibras alimentares (g)', valor100g: fibra100g, valor120g: fibrag, VD: fibraVD },
        { nome: 'Sódio (mg)', valor100g: sodio100g, valor120g: sodiog, VD: sodioVD },
      ];

      const maxLineWidth = 78; // Largura máxima para ingredientes em mm

      // Função para quebrar o texto automaticamente
      const wrapText = (text, maxWidth, doc) => {
        const words = text.split(" ");
        let line = "";
        let lines = [];

        words.forEach(word => {
          const testLine = line ? line + " " + word : word;
          const width = doc.getStringUnitWidth(testLine) * doc.internal.getFontSize() / doc.internal.scaleFactor;

          if (width > maxWidth) {
            lines.push(line);
            line = word;
          } else {
            line = testLine;
          }
        });
        lines.push(line);
        return lines.join("\n");
      };

      let y = 5;
      doc.setFont("helvetica", "normal");
      y += 8;
      y += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text("INFORMAÇÃO NUTRICIONAL", 1, y - 2.5)
      doc.setFont("helvetica", "normal");
      doc.text(`Porções por embalagem: ${quantidade} • Porção de ${String(porcao)} g (${String(caseira)})`, 1, y + 0.5);
      doc.setLineWidth(0.8)
      doc.line(1.5, y + 2, 78, y + 2)
      doc.setLineWidth(0.2)
      const texto = `Por 100 g (${porcao} g, %VD*): Valor energético ${energia100g} kcal (${energiag} kcal, ${energiaVD}%), • Carboidratos ${carb100g} g (${carbg} g, ${carbVD}%), dos quais: Açúcares totais ${acucar100g} g (${acucarg} g), Açúcares adicionados ${acucarad100g} g (${acucaradg} g, ${acucaradVD}%), • Proteínas ${proteina100g} g (${proteinag} g, ${proteinaVD}%) • Gorduras totais ${gorduraTotal100g} g (${gorduraTotalg} g, ${gorduraTotalVD}%), das quais: Gorduras saturadas ${gorduraSaturada100g} g (${gorduraSaturadag} g, ${gorduraSaturadaVD}%) Gorduras trans ${gorduraTrans100g} g (${gorduraTransg} g, ${gorduraTransVD}%) • Fibras alimentares ${fibra100g} g (${fibrag} g, ${fibraVD}%) • Sódio ${sodio100g} mg (${sodiog} mg, ${sodioVD}%).`;
      const textoQuebrado = wrapText(texto, maxLineWidth, doc);
      doc.text(textoQuebrado, 1, y + 5);
      doc.line(0.5, y - 5, 79, y - 5)
      doc.line(1.5, y - 2, 78, y - 2)
      doc.line(1.5, y + 20.3, 78, y + 20.3)
      doc.setFontSize(5.8)

      let posY

      if (armazenamento) {
        // ARMAZENAMENTO
        const textoArmazenamento = wrapText(String(armazenamento), maxLineWidth, doc);
        const linhasArmazenamento = textoArmazenamento.split("\n");

        linhasArmazenamento.forEach((linha, i) => {
          doc.text(linha, 1, y + 22.5 + (i * 2)); // espaçamento de 5 por linha
        });

        // posição após bloco de armazenamento
        posY = y + 22.5 + (linhasArmazenamento.length * 2);

        // linha separadora
        doc.line(1.5, posY - 1, 78, posY - 1);
        doc.setLineWidth(0.2);

        // REFERÊNCIA
        const textoReferencia = wrapText(String(valoresReferencia), maxLineWidth, doc);
        const linhasReferencia = textoReferencia.split("\n");

        linhasReferencia.forEach((linha, i) => {
          doc.text(linha, 1, posY + 1 + (i * 2));
        });

        posY += (linhasReferencia.length * 2);

        // bordas
        doc.line(0.5, y - 5, 0.5, posY);
        doc.line(79, y - 5, 79, posY);
        doc.line(0.5, posY, 79, posY);

      } else {
        // REFERÊNCIA sem armazenamento
        const textoReferencia = wrapText(String(valoresReferencia), maxLineWidth, doc);
        const linhasReferencia = textoReferencia.split("\n");

        linhasReferencia.forEach((linha, i) => {
          doc.text(linha, 1, y + 22.5 + (i * 2));
        });

        posY = y + 22.5 + (linhasReferencia.length * 2);

        // bordas
        doc.line(0.5, y - 5, 0.5, posY);
        doc.line(79, y - 5, 79, posY);
        doc.line(0.5, posY, 79, posY);
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      const textoIngredientes = (`INGREDIENTES: ${ingredientes}`)

      doc.setFontSize(6);
      // Ingredientes
      const ingredientesQuebrados = wrapText(String(textoIngredientes), maxLineWidth, doc).split("\n");
      posY += 2.5
      ingredientesQuebrados.forEach((linha, i) => {
        doc.text(linha, 1, posY + (i * 2.2)); // 5 = espaçamento entre linhas
      });
      doc.setFont("helvetica", "bold");

      // pega a última posição ocupada
      let posicaoY = posY + (ingredientesQuebrados.length * 2);

      // Glúten / Lactose
      doc.text(`${String(glutem)} GLÚTEN. | ${String(lactose)} LACTOSE.`, 1, posicaoY + 1.5);

      // atualiza posição
      posicaoY += 4;

      // Alérgicos
      if (alergenicos) {
        const textoAlergenicos = `ALÉRGICOS: ${alergenicos}`;
        const alergenicosQuebrados = wrapText(String(textoAlergenicos), maxLineWidth, doc).split("\n");

        alergenicosQuebrados.forEach((linha, i) => {
          doc.text(linha, 1, posicaoY + (i * 2.5));
        });

        // atualiza posição para uso futuro
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(String(nomeProduto), 0.5, y - 6)
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("Fab.:", 2, 8.5);
      doc.text("Val.:", 2, 5.5);
      doc.text(formatDate(fabricacao), 10, 8.5);
      doc.text(formatDate(validade), 10, 5.5);
      doc.text(`TOTAL: R$${String(valorTotal)}`, 2, 2.5);
      if (transgenico) {
        if (selo_alto_em !== '') {
          doc.addImage(imgtransgenico, 'PNG', 45, 0.5, 8, 8);
        } else {
          doc.addImage(imgtransgenico, 'PNG', 70.5, 0.5, 8, 8);
        }
      }
      switch (selo_alto_em) {
        case 'acucar':
          doc.addImage(acucar, 'PNG', 53.5, 0.5, 25, 8);
          break;
        case 'gordura':
          doc.addImage(gordura, 'PNG', 53.5, 0.5, 25, 8);
          break;
        case 'sodio':
          doc.addImage(sodio, 'PNG', 53.5, 0.5, 25, 8);
          break;
        case 'acucarGordura':
          doc.addImage(acucarGordura, 'PNG', 54, 0.5, 25, 8);
          break;
        case 'acucarSodio':
          doc.addImage(acucarSodio, 'PNG', 53.5, 0.5, 25, 8);
          break;
        case 'sodioGordura':
          doc.addImage(sodioGordura, 'PNG', 53.5, 0.5, 25, 8);
          break;
        case 'todos':
          doc.addImage(todos, 'PNG', 53.5, 0.5, 25, 8);
          break;
        // e assim por diante...
      }

    }
    // Gerar o blob do PDF
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Cria um iframe oculto
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';

    // Defina o src do iframe para o PDF
    iframe.src = pdfUrl;

    // Quando o PDF estiver carregado, dispara a impressão
    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    };

    // Adiciona o iframe ao body para carregar o PDF
    document.body.appendChild(iframe);

  };
  const gerarImpressaoAraujo = () => {
    // Cria PDF com tamanho padrão (A4 landscape)
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [70, 80]
    });

    const {
      produto, porcao, caseira, energia100g, energiag, energiaVD, carb100g, carbg, carbVD,
      acucar100g, acucarg, acucarVD, acucarad100g, acucaradg, acucaradVD,
      proteina100g, proteinag, proteinaVD, gorduraTotal100g, gorduraTotalg,
      gorduraTotalVD, gorduraSaturada100g, gorduraSaturadag, gorduraSaturadaVD,
      gorduraTrans100g, gorduraTransg, gorduraTransVD, fibra100g, fibrag,
      fibraVD, sodio100g, sodiog, sodioVD, ingredientes, glutem, armazenamento,
      quantidade, valorQuant, valorTotal, alergenicos, valoresReferencia, lactose,
      selo_alto_em, transgenico
    } = itemSelecionado;

    for (let copia = 0; copia < quantidadeEtiquetas; copia++) { // Gerar as etiquetas com a quantidade especificada
      if (copia > 0) doc.addPage();

      // Convertendo todos os valores para strings
      const nomeProduto = String(produto);


      const informacoesNutricionais = [
        { nome: 'Valor energético (kcal)', valor100g: energia100g, valor120g: energiag, VD: energiaVD },
        { nome: 'Carboidratos (g)', valor100g: carb100g, valor120g: carbg, VD: carbVD },
        { nome: ' Açúcares totais (g)', valor100g: acucar100g, valor120g: acucarg, VD: acucarVD },
        { nome: '  Açúcares adicionados (g)', valor100g: acucarad100g, valor120g: acucaradg, VD: acucaradVD },
        { nome: 'Proteínas (g)', valor100g: proteina100g, valor120g: proteinag, VD: proteinaVD },
        { nome: 'Gorduras totais (g)', valor100g: gorduraTotal100g, valor120g: gorduraTotalg, VD: gorduraTotalVD },
        { nome: ' Gorduras saturadas (g)', valor100g: gorduraSaturada100g, valor120g: gorduraSaturadag, VD: gorduraSaturadaVD },
        { nome: ' Gorduras trans (g)', valor100g: gorduraTrans100g, valor120g: gorduraTransg, VD: gorduraTransVD },
        { nome: 'Fibras alimentares (g)', valor100g: fibra100g, valor120g: fibrag, VD: fibraVD },
        { nome: 'Sódio (mg)', valor100g: sodio100g, valor120g: sodiog, VD: sodioVD },
      ];

      const maxLineWidth = 78; // Largura máxima para ingredientes em mm

      // Função para quebrar o texto automaticamente
      const wrapText = (text, maxWidth, doc) => {
        const words = text.split(" ");
        let line = "";
        let lines = [];

        words.forEach(word => {
          const testLine = line ? line + " " + word : word;
          const width = doc.getStringUnitWidth(testLine) * doc.internal.getFontSize() / doc.internal.scaleFactor;

          if (width > maxWidth) {
            lines.push(line);
            line = word;
          } else {
            line = testLine;
          }
        });
        lines.push(line);
        return lines.join("\n");
      };

      let y = 10
      doc.setFont("helvetica", "normal");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text("INFORMAÇÃO NUTRICIONAL", 1, y - 2.5)
      doc.setFont("helvetica", "normal");
      doc.text(`Porções por embalagem: ${quantidade} • Porção de ${String(porcao)} g (${String(caseira)})`, 1, y + 0.5);
      doc.setLineWidth(0.8)
      doc.line(1.5, y + 2, 78, y + 2)
      doc.setLineWidth(0.2)
      const texto = `Por 100 g (${porcao} g, %VD*): Valor energético ${energia100g} kcal (${energiag} kcal, ${energiaVD}%), • Carboidratos ${carb100g} g (${carbg} g, ${carbVD}%), dos quais: Açúcares totais ${acucar100g} g (${acucarg} g), Açúcares adicionados ${acucarad100g} g (${acucaradg} g, ${acucaradVD}%), • Proteínas ${proteina100g} g (${proteinag} g, ${proteinaVD}%) • Gorduras totais ${gorduraTotal100g} g (${gorduraTotalg} g, ${gorduraTotalVD}%), das quais: Gorduras saturadas ${gorduraSaturada100g} g (${gorduraSaturadag} g, ${gorduraSaturadaVD}%) Gorduras trans ${gorduraTrans100g} g (${gorduraTransg} g, ${gorduraTransVD}%) • Fibras alimentares ${fibra100g} g (${fibrag} g, ${fibraVD}%) • Sódio ${sodio100g} mg (${sodiog} mg, ${sodioVD}%).`;
      const textoQuebrado = wrapText(texto, maxLineWidth, doc);
      doc.text(textoQuebrado, 1, y + 5);
      doc.line(0.5, y - 5, 79, y - 5)
      doc.line(1.5, y - 2, 78, y - 2)
      doc.line(1.5, y + 20.3, 78, y + 20.3)
      doc.setFontSize(5.8)

      let posY

      if (armazenamento) {
        // ARMAZENAMENTO
        const textoArmazenamento = wrapText(String(armazenamento), maxLineWidth, doc);
        const linhasArmazenamento = textoArmazenamento.split("\n");

        linhasArmazenamento.forEach((linha, i) => {
          doc.text(linha, 1, y + 22.5 + (i * 2)); // espaçamento de 5 por linha
        });

        // posição após bloco de armazenamento
        posY = y + 22.5 + (linhasArmazenamento.length * 2);

        // linha separadora
        doc.line(1.5, posY - 1, 78, posY - 1);
        doc.setLineWidth(0.2);

        // REFERÊNCIA
        const textoReferencia = wrapText(String(valoresReferencia), maxLineWidth, doc);
        const linhasReferencia = textoReferencia.split("\n");

        linhasReferencia.forEach((linha, i) => {
          doc.text(linha, 1, posY + 1 + (i * 2));
        });

        posY += (linhasReferencia.length * 2);

        // bordas
        doc.line(0.5, y - 5, 0.5, posY);
        doc.line(79, y - 5, 79, posY);
        doc.line(0.5, posY, 79, posY);

      } else {
        // REFERÊNCIA sem armazenamento
        const textoReferencia = wrapText(String(valoresReferencia), maxLineWidth, doc);
        const linhasReferencia = textoReferencia.split("\n");

        linhasReferencia.forEach((linha, i) => {
          doc.text(linha, 1, y + 22.5 + (i * 2));
        });

        posY = y + 22.5 + (linhasReferencia.length * 2);

        // bordas
        doc.line(0.5, y - 5, 0.5, posY);
        doc.line(79, y - 5, 79, posY);
        doc.line(0.5, posY, 79, posY);
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      const textoIngredientes = (`INGREDIENTES: ${ingredientes}`)

      doc.setFontSize(6);
      // Ingredientes
      const ingredientesQuebrados = wrapText(String(textoIngredientes), maxLineWidth, doc).split("\n");
      posY += 2.5
      ingredientesQuebrados.forEach((linha, i) => {
        doc.text(linha, 1, posY + (i * 2.2)); // 5 = espaçamento entre linhas
      });
      doc.setFont("helvetica", "bold");

      // pega a última posição ocupada
      let posicaoY = posY + (ingredientesQuebrados.length * 2);

      // Glúten / Lactose
      doc.text(`${String(glutem)} GLÚTEN. | ${String(lactose)} LACTOSE.`, 1, posicaoY + 1.5);

      // atualiza posição
      posicaoY += 4;

      // Alérgicos
      if (alergenicos) {
        const textoAlergenicos = `ALÉRGICOS: ${alergenicos}`;
        const alergenicosQuebrados = wrapText(String(textoAlergenicos), maxLineWidth, doc).split("\n");

        alergenicosQuebrados.forEach((linha, i) => {
          doc.text(linha, 1, posicaoY + (i * 2.5));
        });

        // atualiza posição para uso futuro
        posicaoY += (alergenicosQuebrados.length * 2.5);

      }

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(String(nomeProduto), 0.5, y - 6)
      doc.setFontSize(5);
      doc.setFont("helvetica", "normal");
      doc.text('Produzido por: Solar Das Festas LTDA.\nRua Marabá, 122 - Santo Antônio CEP: 30350-160\nBelo Horizonte - MG - Brasil CNPJ:41.922.238/0001-51\nAtendimento ao consumidor: (31) 3526-3131', 1, posicaoY)
      doc.text("Fab.:", 1, posicaoY + 8.5);
      doc.text("Val.:", 1, posicaoY + 10.5);
      doc.text(formatDate(fabricacao), 6, posicaoY + 8.5);
      doc.text(formatDate(validade), 6, posicaoY + 10.5);
      if (valorQuant) {

        const base12 = valorQuant;
        const codigo = base12;
        const scale = 3;

        // gerar barcode em canvas
        const canvas = document.createElement("canvas");
        canvas.width = 60;   // largura em pixels
        canvas.height = 20;
        JsBarcode(canvas, codigo, {

          format: "EAN13",
          displayValue: true,
          fontSize: 14 * scale,
          width: 2 * scale, // largura das barras
          height: 80 * scale,
          margin: 0,
        });

        // converter para imagem base64
        const imgData = canvas.toDataURL("image/png");
        doc.addImage(imgData, "PNG", 45, posicaoY - 1.5, 33, 12);
      }

      // doc.text(`TOTAL: R$${String(valorTotal)}`, 2, 2.5);
      // if (transgenico) {
      //   if (selo_alto_em !== '') {
      //     doc.addImage(imgtransgenico, 'PNG', 45, 0.5, 8, 8);
      //   } else {
      //     doc.addImage(imgtransgenico, 'PNG', 70.5, 0.5, 8, 8);
      //   }
      // }
      // switch (selo_alto_em) {
      //   case 'acucar':
      //     doc.addImage(acucar, 'PNG', 53.5, 0.5, 25, 8);
      //     break;
      //   case 'gordura':
      //     doc.addImage(gordura, 'PNG', 53.5, 0.5, 25, 8);
      //     break;
      //   case 'sodio':
      //     doc.addImage(sodio, 'PNG', 53.5, 0.5, 25, 8);
      //     break;
      //   case 'acucarGordura':
      //     doc.addImage(acucarGordura, 'PNG', 54, 0.5, 25, 8);
      //     break;
      //   case 'acucarSodio':
      //     doc.addImage(acucarSodio, 'PNG', 53.5, 0.5, 25, 8);
      //     break;
      //   case 'sodioGordura':
      //     doc.addImage(sodioGordura, 'PNG', 53.5, 0.5, 25, 8);
      //     break;
      //   case 'todos':
      //     doc.addImage(todos, 'PNG', 53.5, 0.5, 25, 8);
      //     break;
      //   // e assim por diante...
      // }

    }
    // Gerar o blob do PDF
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Cria um iframe oculto
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';

    // Defina o src do iframe para o PDF
    iframe.src = pdfUrl;

    // Quando o PDF estiver carregado, dispara a impressão
    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    };

    // Adiciona o iframe ao body para carregar o PDF
    document.body.appendChild(iframe);

  };

  const handleCriarProduto = () => {
    if (!validarCamposObrigatorios()) {
      return;
    }
    const novoProduto = {
      produto,
      porcao,
      caseira,
      energia100g,
      energiag,
      energiaVD,
      carb100g,
      carbg,
      carbVD,
      acucar100g,
      acucarg,
      acucarVD,
      acucarad100g,
      acucaradg,
      acucaradVD,
      proteina100g,
      proteinag,
      proteinaVD,
      gorduraTotal100g,
      gorduraTotalg,
      gorduraTotalVD,
      gorduraSaturada100g,
      gorduraSaturadag,
      gorduraSaturadaVD,
      gorduraTrans100g,
      gorduraTransg,
      gorduraTransVD,
      fibra100g,
      fibrag,
      fibraVD,
      sodio100g,
      sodiog,
      sodioVD,
      ingredientes,
      glutem,
      armazenamento,
      quantidade,
      valorQuant,
      valorTotal,
      alergenicos,
      validade,
      valoresReferencia,
      lactose,
      transgenico,
      selo_alto_em
    };

    // Enviando os dados para o backend (servidor Node.js)
    axios.post('http://192.168.1.250/server-pascoa/etiquetas', novoProduto)
      .then(response => {
        console.log('Produto criado com sucesso:', response.data);
        alert('Produto criado com sucesso!');
        buscarProdutos();
        setItemSelecionado(null)
        // <-- atualiza a lista com os dados atualizados
        setShowModal(false);
        // Aqui você pode limpar os campos ou atualizar o estado conforme necessário
      })
      .catch(error => {
        console.error('Erro ao criar produto:', error);
        alert('Erro ao criar produto. Tente novamente.');
      });






  };

  const handleEditar = (item) => {
    // Preencher os campos do formulário com as informações da etiqueta selecionada
    setModoEdicao(true); // Habilitar modo de edição
    setShowModal(true); // Mostrar o modal

    // Atualiza o estado do produto selecionado
    setProduto(item.produto);
    setPorcao(item.porcao);
    setCaseira(item.caseira);
    setEnergia100g(item.energia100g);
    setEnergiag(item.energiag);
    setEnergiaVD(item.energiaVD);
    setCarb100g(item.carb100g);
    setCarbg(item.carbg);
    setCarbVD(item.carbVD);
    setAcucar100g(item.acucar100g);
    setAcucarg(item.acucarg);
    setAcucarVD(item.acucarVD);
    setAcucarad100g(item.acucarad100g);
    setAcucaradg(item.acucaradg);
    setAcucaradVD(item.acucaradVD);
    setProteina100g(item.proteina100g);
    setProteinag(item.proteinag);
    setProteinaVD(item.proteinaVD);
    setGorduraTotal100g(item.gorduraTotal100g);
    setGorduraTotalg(item.gorduraTotalg);
    setGorduraTotalVD(item.gorduraTotalVD);
    setGorduraSaturada100g(item.gorduraSaturada100g);
    setGorduraSaturadag(item.gorduraSaturadag);
    setGorduraSaturadaVD(item.gorduraSaturadaVD);
    setGorduraTrans100g(item.gorduraTrans100g);
    setGorduraTransg(item.gorduraTransg);
    setGorduraTransVD(item.gorduraTransVD);
    setFibra100g(item.fibra100g);
    setFibrag(item.fibrag);
    setFibraVD(item.fibraVD);
    setSodio100g(item.sodio100g);
    setSodiog(item.sodiog);
    setSodioVD(item.sodioVD);
    setIngredientes(item.ingredientes);
    setGlutem(item.glutem);
    setAlergenicos(item.alergenicos);
    setArmazenamento(item.armazenamento);
    setQuantidade(item.quantidade);
    setValorQuant(item.valorQuant);
    setValorTotal(item.valorTotal);
    setValoresReferencia(item.valoresReferencia);
    setValidade(item.validade);
    setLactose(item.lactose);
    setTransgenico(item.transgenico);
    setselo_alto_em(item.selo_alto_em);

  };

  const handleConfirmarEdicao = () => {
    if (!validarCamposObrigatorios()) {
      return;
    }

    const produtoEditado = {
      id: itemSelecionado.id, // Presumindo que você tem um id para identificar o produto
      produto,
      porcao,
      caseira,
      energia100g,
      energiag,
      energiaVD,
      carb100g,
      carbg,
      carbVD,
      acucar100g,
      acucarg,
      acucarVD,
      acucarad100g,
      acucaradg,
      acucaradVD,
      proteina100g,
      proteinag,
      proteinaVD,
      gorduraTotal100g,
      gorduraTotalg,
      gorduraTotalVD,
      gorduraSaturada100g,
      gorduraSaturadag,
      gorduraSaturadaVD,
      gorduraTrans100g,
      gorduraTransg,
      gorduraTransVD,
      fibra100g,
      fibrag,
      fibraVD,
      sodio100g,
      sodiog,
      sodioVD,
      ingredientes,
      glutem,
      armazenamento,
      quantidade,
      valorQuant,
      valorTotal,
      alergenicos,
      valoresReferencia,
      validade,
      lactose,
      transgenico,
      selo_alto_em
    };

    // Enviar os dados para o servidor usando a rota PUT
    axios
      .put(`http://192.168.1.250/server-pascoa/etiquetas/${itemSelecionado.id}`, produtoEditado)
      .then((response) => {
        console.log('Produto atualizado com sucesso:', response.data);
        alert('Produto atualizado com sucesso!');
        buscarProdutos();
        setItemSelecionado(null)
        setShowModal(false); // Fecha o modal após a confirmação
        // Aqui você pode atualizar a lista de produtos ou fazer o que for necessário
      })
      .catch((error) => {
        console.error('Erro ao atualizar o produto:', error);
        alert('Erro ao atualizar o produto. Tente novamente.');
      });
  };

  const handleSelectChange = (e) => {
    const selectedProductId = e.target.value; // O ID do produto selecionado
    const selectedProduct = produtos.find(p => p.id === parseInt(selectedProductId)); // Encontrar o produto pelo ID
    setItemSelecionado(selectedProduct); // Atualizar o estado com o produto selecionado
  };

  useEffect(() => {
    if (itemSelecionado && itemSelecionado.validade) {
      const diasValidade = parseInt(itemSelecionado.validade);
      if (!isNaN(diasValidade)) {
        const dataFabricacao = new Date(fabricacao);
        dataFabricacao.setDate(dataFabricacao.getDate() + diasValidade);
        setValidade(dataFabricacao.toISOString().split('T')[0]);
      }
    }
  }, [fabricacao, itemSelecionado]);

  return (
    <div className="container mt-4">
      <h2>Preencher Etiquetas</h2>
      <div className="d-flex mb-2 align-items-center">
        <Select
          options={opcoesProdutos}
          value={opcoesProdutos.find(opt => opt.value === itemSelecionado?.id) || null}
          onChange={(selectedOption) => {
            if (!selectedOption) {
              setItemSelecionado(null);
              return;
            }

            const produto = produtos.find(p => p.id === selectedOption.value);
            setItemSelecionado(produto);

            const diasValidade = parseInt(produto.validade);
            const dataFabricacao = new Date(fabricacao);
            dataFabricacao.setDate(dataFabricacao.getDate() + diasValidade);
            setValidade(dataFabricacao.toISOString().split('T')[0]);
          }}
          placeholder="Selecione ou pesquise um produto"
          isClearable
          styles={{ container: (base) => ({ ...base, width: 400 }) }}
          className="me-3"
        />

        <div className="d-flex align-items-center me-3">
          <label className="me-2 mb-0">Fabricação:</label>
          <input
            value={fabricacao}
            className="form-control"
            type="date"
            style={{ maxWidth: '180px' }}
            onChange={(e) => setFabricacao(e.target.value)}
            disabled={!isLoggedIn}
          />
        </div>

        <div className="d-flex align-items-center me-3">
          <label className="me-2 mb-0">Validade:</label>
          <input
            value={validade}
            className="form-control"
            type="date"
            style={{ maxWidth: '180px' }}
            onChange={(e) => setValidade(e.target.value)}
            disabled={!isLoggedIn}
          />
        </div>

        <div className="ms-auto">
          <Button
            onClick={() => {
              if (isLoggedIn) {
                Cookies.remove("token"); // Remove o cookie chamado "token"
                setIsLoggedIn(false);
              } else {
                window.location.href = '/';
              }
            }}
            className="mb-3"
            variant={isLoggedIn ? 'outline-danger' : 'primary'}
          >
            {isLoggedIn ? 'Logout' : 'Login'}
          </Button>
        </div>
      </div>
      <div className='d-flex justify-content-start'>


        <Button variant="primary" className='me-2' onClick={gerarImpressao}
          disabled={!itemSelecionado}
        >Imprimir etiqueta</Button>
        <Button variant="primary" className='me-2' onClick={gerarImpressaoAraujo}
          disabled={!itemSelecionado}
        >Imprimir etiqueta Araujo</Button>
        <Button variant="success"
          onClick={handleCriar}
          className='me-2'
          disabled={!isLoggedIn}
        >Criar etiqueta</Button>
        <Button variant="warning"
          onClick={() => handleEditar(itemSelecionado)}
          disabled={!isLoggedIn || !itemSelecionado}
          className='me-2'
        >Editar etiqueta</Button>
        <Button
          variant="danger"
          disabled={!isLoggedIn || !itemSelecionado}
          onClick={() => setShowModalConfirmacao(true)} // Abre o modal de confirmação
        >
          Excluir etiqueta
        </Button>
      </div>
      {showModalConfirmacao && (
        <div className="modal show" style={{ display: 'block', background: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog" style={{ minWidth: '400px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar Exclusão</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModalConfirmacao(false)} // Fecha o modal se o usuário clicar no "X"
                ></button>
              </div>
              <div className="modal-body">
                <p>Tem certeza de que deseja excluir esta etiqueta?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModalConfirmacao(false)} // Fecha o modal sem excluir
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleExcluir} // Chama a função para excluir a etiqueta
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showModal && (
        <div className="modal show" style={{ display: 'block', background: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog" style={{ minWidth: '800px', overflowY: 'auto' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modoEdicao ? 'Editar Etiqueta' : 'Criar Etiqueta'}</h5>
                <button type="button" className="btn-close" onClick={() => {
                  setShowModal(false);
                  setErros({}); // Limpa todos os erros ao fechar
                }}></button>
              </div>
              <div className="modal-body text-start">
                {/* Produto */}
                <div>
                  <label>Produto</label>
                  <input
                    type="text"
                    value={produto}
                    onChange={(e) => {
                      setProduto(e.target.value);
                      if (erros.produto && e.target.value.trim() !== '') {
                        setErros(prev => ({ ...prev, produto: false }));
                      }
                    }}
                    maxLength={25}
                    className="form-control"
                    style={{ maxWidth: '300px', border: erros.produto ? '1px solid red' : undefined }}
                  />
                  {erros.produto && <small className="text-danger">Campo obrigatório</small>}
                </div>
                {/* Porção e Medida Caseira */}
                <div>
                  <label>Porção por embalagem</label>
                  <input
                    type="text"
                    value={quantidade}
                    onChange={(e) => {
                      setQuantidade(e.target.value);
                      if (erros.quantidade && e.target.value.trim() !== '') {
                        setErros(prev => ({ ...prev, quantidade: false }));
                      }
                    }}
                    className="form-control"
                    style={{ maxWidth: '60px', border: erros.quantidade ? '1px solid red' : undefined }}
                  />
                  {erros.quantidade && <small className="text-danger">Campo obrigatório</small>}
                  <label>Porção (g)</label>
                  <input
                    type="text"
                    value={porcao}
                    onChange={(e) => {
                      setPorcao(e.target.value);
                      if (erros.porcao && e.target.value.trim() !== '') {
                        setErros(prev => ({ ...prev, porcao: false }));
                      }
                    }}
                    className="form-control"
                    style={{ maxWidth: '60px', border: erros.porcao ? '1px solid red' : undefined }}
                  />
                  {erros.porcao && <small className="text-danger">Campo obrigatório</small>}
                  <label>Medida caseira</label>
                  <input
                    type="text"
                    value={caseira}
                    onChange={(e) => {
                      setCaseira(e.target.value);
                      if (erros.caseira && e.target.value.trim() !== '') {
                        setErros(prev => ({ ...prev, caseira: false }));
                      }
                    }}
                    className="form-control"
                    style={{ maxWidth: '300px', border: erros.caseira ? '1px solid red' : undefined }}
                  />
                  {erros.caseira && <small className="text-danger">Campo obrigatório</small>}
                </div>
                {/* Tabela Nutricional */}
                <table className="table">
                  <thead>
                    <tr>
                      <th>Item Nutricional</th>
                      <th>100g</th>
                      <th>Porção</th>
                      <th>VD%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Valor Energético (kcal)', energia100g, setEnergia100g, 'energia100g', energiag, setEnergiag, 'energiag', energiaVD, setEnergiaVD, 'energiaVD'],
                      ['Carboidratos (g)', carb100g, setCarb100g, 'carb100g', carbg, setCarbg, 'carbg', carbVD, setCarbVD, 'carbVD'],
                      ['Açúcares Totais (g)', acucar100g, setAcucar100g, 'acucar100g', acucarg, setAcucarg, 'acucarg', acucarVD, setAcucarVD, 'acucarVD'],
                      ['Açúcares Adicionados (g)', acucarad100g, setAcucarad100g, 'acucarad100g', acucaradg, setAcucaradg, 'acucaradg', acucaradVD, setAcucaradVD, 'acucaradVD'],
                      ['Proteínas (g)', proteina100g, setProteina100g, 'proteina100g', proteinag, setProteinag, 'proteinag', proteinaVD, setProteinaVD, 'proteinaVD'],
                      ['Gorduras Totais (g)', gorduraTotal100g, setGorduraTotal100g, 'gorduraTotal100g', gorduraTotalg, setGorduraTotalg, 'gorduraTotalg', gorduraTotalVD, setGorduraTotalVD, 'gorduraTotalVD'],
                      ['Gorduras Saturadas (g)', gorduraSaturada100g, setGorduraSaturada100g, 'gorduraSaturada100g', gorduraSaturadag, setGorduraSaturadag, 'gorduraSaturadag', gorduraSaturadaVD, setGorduraSaturadaVD, 'gorduraSaturadaVD'],
                      ['Gorduras Trans (g)', gorduraTrans100g, setGorduraTrans100g, 'gorduraTrans100g', gorduraTransg, setGorduraTransg, 'gorduraTransg', gorduraTransVD, setGorduraTransVD, 'gorduraTransVD'],
                      ['Fibras Alimentares (g)', fibra100g, setFibra100g, 'fibra100g', fibrag, setFibrag, 'fibrag', fibraVD, setFibraVD, 'fibraVD'],
                      ['Sódio (mg)', sodio100g, setSodio100g, 'sodio100g', sodiog, setSodiog, 'sodiog', sodioVD, setSodioVD, 'sodioVD'],
                    ].map(([label, val100, setVal100, err100, valPorc, setValPorc, errPorc, valVD, setValVD, errVD]) => (
                      <tr key={label}>
                        <td>{label}</td>
                        <td>
                          <input
                            type="text"
                            value={val100}
                            onChange={(e) => {
                              setVal100(e.target.value);
                              if (erros[err100] && e.target.value.trim() !== '') {
                                setErros(prev => ({ ...prev, [err100]: false }));
                              }
                            }}
                            className="form-control"
                            style={{ maxWidth: '60px', border: erros[err100] ? '1px solid red' : undefined }}
                          />
                          {erros[err100] && <small className="text-danger">Campo obrigatório</small>}
                        </td>
                        <td>
                          <input
                            type="text"
                            value={valPorc}
                            onChange={(e) => {
                              setValPorc(e.target.value);
                              if (erros[errPorc] && e.target.value.trim() !== '') {
                                setErros(prev => ({ ...prev, [errPorc]: false }));
                              }
                            }}
                            className="form-control"
                            style={{ maxWidth: '60px', border: erros[errPorc] ? '1px solid red' : undefined }}
                          />
                          {erros[errPorc] && <small className="text-danger">Campo obrigatório</small>}
                        </td>
                        <td>
                          <input
                            type="text"
                            value={valVD}
                            onChange={(e) => {
                              setValVD(e.target.value);
                              if (erros[errVD] && e.target.value.trim() !== '') {
                                setErros(prev => ({ ...prev, [errVD]: false }));
                              }
                            }}
                            className="form-control"
                            style={{ maxWidth: '60px', border: erros[errVD] ? '1px solid red' : undefined }}
                          />
                          {erros[errVD] && <small className="text-danger">Campo obrigatório</small>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className='d-flex mb-3'
                  style={{ justifyContent: 'space-evenly' }}>
                  <div className='me-4'>
                    <label>Ingredientes</label>
                    <textarea
                      value={ingredientes}
                      onChange={(e) => {
                        setIngredientes(e.target.value);
                        if (erros.ingredientes && e.target.value.trim() !== '') {
                          setErros(prev => ({ ...prev, ingredientes: false }));
                        }
                      }}
                      className="form-control"
                      style={{ width: '350px', minHeight: '200px', whiteSpace: 'pre-wrap', border: erros.ingredientes ? '1px solid red' : undefined }} // Aumenta a altura para uma boa visualização
                    />
                    {erros.ingredientes && <small className="text-danger">Campo obrigatório</small>}
                  </div>
                  <div className='me-4'>
                    <label>Valores de Referencia</label>
                    <textarea
                      value={valoresReferencia}
                      onChange={(e) => {
                        setValoresReferencia(e.target.value);
                        if (erros.valoresReferencia && e.target.value.trim() !== '') {
                          setErros(prev => ({ ...prev, valoresReferencia: false }));
                        }
                      }}
                      className="form-control"
                      style={{ width: '350px', minHeight: '200px', whiteSpace: 'pre-wrap', border: erros.valoresReferencia ? '1px solid red' : undefined }} // Aumenta a altura para uma boa visualização
                    />
                    {erros.valoresReferencia && <small className="text-danger">Campo obrigatório</small>}
                  </div>
                </div>
                <div className='d-flex'
                  style={{ justifyContent: 'space-evenly' }}>
                  <div className='me-4'>
                    <label>Alergenicos</label>
                    <textarea
                      value={alergenicos}
                      onChange={(e) => {
                        setAlergenicos(e.target.value);
                        if (erros.alergenicos && e.target.value.trim() !== '') {
                          setErros(prev => ({ ...prev, alergenicos: false }));
                        }
                      }}
                      className="form-control"
                      style={{ width: '350px', minHeight: '200px', whiteSpace: 'pre-wrap', border: erros.alergenicos ? '1px solid red' : undefined }} // Aumenta a altura para uma boa visualização
                    />
                    {erros.alergenicos && <small className="text-danger">Campo obrigatório</small>}
                  </div>
                  <div className='me-4'>
                    <label>Quantidades significativas</label>
                    <textarea
                      value={armazenamento}
                      onChange={(e) => {
                        setArmazenamento(e.target.value);
                        if (erros.armazenamento && e.target.value.trim() !== '') {
                          setErros(prev => ({ ...prev, armazenamento: false }));
                        }
                      }}
                      className="form-control"
                      style={{ width: '350px', minHeight: '200px', whiteSpace: 'pre-wrap', border: erros.armazenamento ? '1px solid red' : undefined }} // Aumenta a altura para uma boa visualização
                    />
                    {erros.armazenamento && <small className="text-danger">Campo obrigatório</small>}
                  </div>
                </div>
                <div className='d-flex mb-3'
                  style={{ justifyContent: 'space-evenly' }}>
                  <div className='me-2'>
                    <label>Glútem</label>
                    <select
                      value={glutem}
                      onChange={(e) => {
                        setGlutem(e.target.value);
                        if (erros.glutem && e.target.value.trim() !== '') {
                          setErros(prev => ({ ...prev, glutem: false }));
                        }
                      }}
                      className="form-control"
                      style={{ maxWidth: '110px', whiteSpace: 'nowrap', border: erros.glutem ? '1px solid red' : undefined }} // Aumenta a altura para uma boa visualização                
                    >
                      <option value="" disabled hidden>Selecione</option>
                      <option value="CONTÉM">Contém</option>
                      <option value="NÃO CONTÉM">Não Contém</option>
                    </select>
                    {erros.glutem && <small className="text-danger">Campo obrigatório</small>}
                  </div>
                  <div className='me-2'>
                    <label>Lactose</label>
                    <select
                      value={lactose}
                      onChange={(e) => {
                        setLactose(e.target.value);
                        if (erros.lactose && e.target.value.trim() !== '') {
                          setErros(prev => ({ ...prev, lactose: false }));
                        }
                      }}
                      className="form-control"
                      style={{ maxWidth: '110px', whiteSpace: 'nowrap', border: erros.lactose ? '1px solid red' : undefined }} // Aumenta a altura para uma boa visualização                
                    >
                      <option value="" disabled hidden>Selecione</option>
                      <option value="CONTÉM">Contém</option>
                      <option value="NÃO CONTÉM">Não Contém</option>
                    </select>
                    {erros.lactose && <small className="text-danger">Campo obrigatório</small>}
                  </div>
                  <div className='me-2'>
                    <label>Transgenicos</label>
                    <select
                      value={transgenico}
                      onChange={(e) => {
                        setTransgenico(e.target.value);
                        if (erros.transgenico && e.target.value.trim() !== '') {
                          setErros(prev => ({ ...prev, transgenico: false }));
                        }
                      }}
                      className="form-control"
                      style={{ maxWidth: '110px', whiteSpace: 'nowrap', border: erros.transgenico ? '1px solid red' : undefined }} // Aumenta a altura para uma boa visualização                
                    >
                      <option value="" disabled hidden>Selecione</option>
                      <option value='1'>Contém</option>
                      <option value='0'>Não Contém</option>
                    </select>
                    {erros.transgenico && <small className="text-danger">Campo obrigatório</small>}
                  </div>
                  <div className='me-2'>
                    <label>Alto em</label>
                    <select
                      value={selo_alto_em}
                      onChange={(e) => {
                        setselo_alto_em(e.target.value);
                        if (erros.selo_alto_em && e.target.value.trim() !== '') {
                          setErros(prev => ({ ...prev, selo_alto_em: false }));
                        }
                      }}
                      className="form-control"
                      style={{ maxWidth: '110px', whiteSpace: 'nowrap', border: erros.selo_alto_em ? '1px solid red' : undefined }}>
                      <option value="" disabled hidden>Selecione</option>
                      <option value="">Não contém</option>
                      <option value="sodio">Sódio</option>
                      <option value="gordura">Gordura</option>
                      <option value="acucar">Açucar</option>
                      <option value="acucarGordura">Açucar e Gordura</option>
                      <option value="sodioGordura">Sódio e Gordura</option>
                      <option value="acucarSodio">Sódio e Açucar</option>
                      <option value="todos">Todos</option>
                    </select>
                    {erros.selo_alto_em && <small className="text-danger">Campo obrigatório</small>}
                  </div>
                </div>
                <div className='d-flex mb-3'
                  style={{ justifyContent: 'space-evenly' }}>
                  <div className='me-4'>
                    <label>Valor Total</label>
                    <input
                      value={valorTotal}
                      onChange={(e) => {
                        setValorTotal(e.target.value);
                        if (erros.valorTotal && e.target.value.trim() !== '') {
                          setErros(prev => ({ ...prev, valorTotal: false }));
                        }
                      }}
                      className="form-control"
                      style={{ maxWidth: '80px', border: erros.valorTotal ? '1px solid red' : undefined }}
                    />
                    {erros.porcao && <small className="text-danger">Campo obrigatório</small>}
                  </div>
                  <div className='me-4'>
                    <label>Validade em dias</label>
                    <input
                      type='number'
                      value={validade}
                      onChange={(e) => {
                        setValidade(e.target.value);
                        if (erros.validade && e.target.value.trim() !== '') {
                          setErros(prev => ({ ...prev, validade: false }));
                        }
                      }}
                      className="form-control"
                      style={{ maxWidth: '80px', border: erros.validade ? '1px solid red' : undefined }}
                    />
                    {erros.validade && <small className="text-danger">Campo obrigatório</small>}
                  </div>
                  <div className='me-4'>
                    <label>Codigo EAN</label>
                    <input
                      type='text'
                      value={valorQuant}
                      onChange={(e) => {
                        setValorQuant(e.target.value);
                        if (erros.valorQuant && e.target.value.trim() !== '') {
                          setErros(prev => ({ ...prev, validade: false }));
                        }
                      }}
                      className="form-control"
                      style={{ maxWidth: '150px', border: erros.valorQuant ? '1px solid red' : undefined }}
                    />
                    {erros.valorQuant && <small className="text-danger">EAN Inválido</small>}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-danger" onClick={() => {
                  setShowModal(false);
                  setErros({}); // Limpa todos os erros ao fechar
                }}>Fechar</button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={modoEdicao ? handleConfirmarEdicao : handleCriarProduto}>
                  {modoEdicao ? "Salvar Edição" : "Salvar Novo Produto"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};
export default EtiquetasLoja;
