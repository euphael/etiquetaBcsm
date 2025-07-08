import React, { useEffect, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import jsPDF from "jspdf";
import axios from 'axios';
import Select from 'react-select';
import { isCookie, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import * as pdfjsLib from 'pdfjs-dist';

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
  const [confirmacaoAtiva, setConfirmacaoAtiva] = useState(false);
  const [showModalConfirmacao, setShowModalConfirmacao] = useState(false);
  const navigate = useNavigate();







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

  const [valoresReferencia, setValoresReferencia] = useState('Valores Diários de referência com base em\numa dieta de 2.000 kcal ou 8400 kj. Seus\nvalores diários podem ser maiores ou\nmenores de suas necessidades\nenergéticas.')

  const [ingredientes, setIngredientes] = useState('');

  const [lactose, setLactose] = useState('');
  const [glutem, setGlutem] = useState('');
  const [alergenicos, setAlergenicos] = useState('');

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

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [erros, setErros] = useState({});
  const maxLineWidth = 45; // Defina o limite de largura em milímetros para a linha (ajuste conforme necessário)

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
    if (!isFieldValid(acucarVD)) novosErros.acucarVD = true;
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
    if (!isFieldValid(alergenicos)) novosErros.alergenicos = true;
    if (!isFieldValid(glutem)) novosErros.glutem = true;
    if (!isFieldValid(lactose)) novosErros.lactose = true;
    // if (!isFieldValid(quantidade)) novosErros.quantidade = true;
    // if (!isFieldValid(valorQuant)) novosErros.valorQuant = true;
    if (!isFieldValid(valorTotal)) novosErros.valorTotal = true;
    if (!isFieldValid(validade)) novosErros.validade = true;

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
      quantidade, valorQuant, valorTotal, alergenicos, valoresReferencia, lactose
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

      const maxLineWidth = 220; // Largura máxima para ingredientes em mm

      // Função para quebrar o texto automaticamente
      const wrapText = (text, maxWidth, doc) => {
        const words = text.split(" "); // Divide o texto em palavras
        let line = "";
        let lines = [];

        words.forEach(word => {
          // Verifica se a palavra atual cabe na linha
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

      let y = 5; // Posição inicial para as informações nutricionais
      doc.setFont("helvetica", "normal");

      // Título da seção de informações nutricionais
      // doc.line(2, y + 12, 47, y + 12); // Linha horizontal após cada item

      y += 8; // Aumenta a posição para deixar um espaço após o título

      // Desenhando a linha de cabeçalho com os rótulos
      // doc.text("Nutrientes", 3, y + 7);
      // doc.text("100g", 30, y + 7);
      // doc.text(`${String(porcao)}g`, 36, y + 7);
      // doc.text("VD%", 42, y + 7);

      y += 6;

      // Adicionando os itens nutricionais
      // informacoesNutricionais.forEach(info => {
      //   doc.text(info.nome, 3, y + 4); // Nome do nutriente
      //   doc.text(String(info.valor100g), 30, y + 4); // Valor para 100g
      //   doc.text(String(info.valor120g), 36, y + 4); // Valor para 120g
      //   doc.text(String(info.VD), 42, y + 4); // Valor para 120g

      //   y += 3; // Aumenta a posição para o próximo item

      //   // Linha de separação entre os itens
      //   doc.line(2, y + 2, 47, y + 2); // Linha horizontal após cada item
      // });

      // doc.line(29, y - 32, 29, y + 2); // Linha vertical entre "Nutriente" e "100g"
      // doc.line(35, y - 32, 35, y + 2); // Linha vertical entre "100g" e "120g"
      // doc.line(41, y - 32, 41, y + 2); // Linha vertical entre "100g" e "120g"
      // doc.line(47, y - 39, 47, y + 8); // Linha vertical entre "100g" e "120g"
      // doc.line(2, y - 39, 2, y + 8); // Linha vertical entre "100g" e "120g"
      // doc.line(2, y - 39, 47, y - 39); // Linha horizontal após cada item
      // doc.line(2, y - 28, 47, y - 28); // Linha horizontal após cada item
      // doc.line(2, y + 8, 47, y + 8); // Linha horizontal após cada item

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text("INFORMAÇÃO NUTRICIONAL", 1, y - 9)
      doc.line(1.5, y - 8, 78.5, y - 8)

      doc.setFont("helvetica", "normal");
      doc.text(`Porções de ${String(porcao)} g (${String(caseira)})`, 1, y - 5);
      doc.setLineWidth(0.8)
      doc.line(1.5, y - 3.5, 78.5, y - 3.5)
      doc.setLineWidth(0.2)


      const texto = `Por 100 g (${porcao} g, %VD*): Valor energético ${energia100g} kcal (${energiag} kcal, ${energiaVD}%), • Carboidratos ${carb100g} g (${carbg} g, ${carbVD}%), dos quais: Açúcares totais ${acucar100g} g (${acucarg} g, ${acucarVD}%), Açúcares adicionados ${acucarad100g} g (${acucaradg} g, ${acucaradVD}%), • Proteínas ${proteina100g} g (${proteinag} g, ${proteinaVD}%) • Gorduras totais ${gorduraTotal100g} g (${gorduraTotalg} g, ${gorduraTotalVD}%), das quais: Gorduras saturadas ${gorduraSaturada100g} g (${gorduraSaturadag} g, ${gorduraSaturadaVD}%) Gorduras trans ${gorduraTrans100g} g (${gorduraTransg} g, ${gorduraTransVD}%) • Fibras alimentares ${fibra100g} g (${fibrag} g, ${fibraVD}%) • Sódio ${sodio100g} mg (${sodiog} mg, ${sodioVD}%).`;

      // Quebra o texto se ele exceder 90 mm
      const textoQuebrado = wrapText(texto, maxLineWidth, doc);


      doc.text(textoQuebrado, 1, y);

      doc.line(0.5, y - 12, 79.5, y - 12)
      doc.line(1.5, y + 16, 78.5, y + 16)
      doc.line(0.5, y + 20, 79.5, y + 20)

      doc.line(0.5, y - 12, 0.5, y + 20)
      doc.line(79.5, y - 12, 79.5, y + 20)
      doc.text('*Percentual de valores diários fornecidos pela porção.', 1, y + 19)



      // doc.text(`${valoresReferencia}`, 3, y + 4);



      doc.setFont("helvetica", "normal");
      // doc.text(String(armazenamento), 48, y + 5);

      doc.setFontSize(6);

      const textoIngredientes = (`INGREDIENTES: ${ingredientes}`)
      const ingredientesQuebrados = wrapText(String(textoIngredientes), maxLineWidth, doc);


      doc.text(`${ingredientesQuebrados}`, 1, y + 23);
      // doc.text(String(ingredientesQuebrados), 48, y - 36);

      doc.setFontSize(7);

      doc.setFont("helvetica", "bold");
      const textoAlergenicos = (`ALERGÊNICOS: ${alergenicos}`)
      const alergenicosQuebrados = wrapText(String(textoAlergenicos), maxLineWidth, doc);

      doc.text(`${alergenicosQuebrados}`, 1, y + 46);
      doc.text(`${String(glutem)} GLÚTEN. | ${String(lactose)} LACTOSE.`, 1, y + 43);

      doc.setFontSize(15);
      doc.setFont("helvetica", "bold");
      doc.text(String(nomeProduto), 1, y - 14)

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("Fab.:", 2, y + 54);
      doc.text("Val.:", 2, y + 57);

      doc.text(formatDate(fabricacao), 10, y + 54);
      doc.text(formatDate(validade), 10, y + 57);



      doc.text(`TOTAL: R$${String(valorTotal)}`, 2, y + 60);


      const imgBase64Transgenico = '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'; // Substitua com o valor Base64 da sua imagem

      // Adicionar a imagem no PDF a partir do Base64
      doc.addImage(imgBase64Transgenico, 'PNG', 69, 69, 10, 10);

      const imgBase64AltoEm = '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'
      doc.addImage(imgBase64AltoEm, 'PNG', 35, 69, 30, 10);

    }
    debugger
    // Gerar o blob do PDF
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    // PdfToImage (pdfUrl)

    // Verifica se a janela foi aberta com sucesso
    const printWindow = window.open(pdfUrl);

    if (printWindow) {
      // Aguarda a janela carregar e então imprime
      setTimeout(() => {
        printWindow.focus();
        // printWindow.print();
      }, 500);
    } else {
      console.error("Não foi possível abrir a janela para impressão.");
    }
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

  // useEffect(() => {
  //   async function buscarDiasValidade() {
  //     if (!itemSelecionado || !itemSelecionado.id) return;

  //     try {
  //       const response = await axios.get(`http://192.168.1.168:4000/etiqueta/${itemSelecionado.id}`);
  //       const diasValidade = response.data.validade; // Supondo que a API retorne { dias: 10 }

  //       const dataFabricacao = new Date(fabricacao);
  //       dataFabricacao.setDate(dataFabricacao.getDate() + diasValidade);

  //       setValidade(dataFabricacao.toISOString().split('T')[0]);
  //     } catch (error) {
  //       console.error('Erro ao buscar validade:', error);
  //     }
  //   }

  //   buscarDiasValidade();
  // }, [itemSelecionado, fabricacao]);

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
          <div className="modal-dialog" style={{ minWidth: '600px', overflowY: 'auto' }}>
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
                    className="form-control"
                    style={{ maxWidth: '300px', border: erros.produto ? '1px solid red' : undefined }}
                  />
                  {erros.produto && <small className="text-danger">Campo obrigatório</small>}
                </div>

                {/* Porção e Medida Caseira */}
                <div>
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
                      ['Valor Energético', energia100g, setEnergia100g, 'energia100g', energiag, setEnergiag, 'energiag', energiaVD, setEnergiaVD, 'energiaVD'],
                      ['Carboidratos', carb100g, setCarb100g, 'carb100g', carbg, setCarbg, 'carbg', carbVD, setCarbVD, 'carbVD'],
                      ['Açúcares Totais', acucar100g, setAcucar100g, 'acucar100g', acucarg, setAcucarg, 'acucarg', acucarVD, setAcucarVD, 'acucarVD'],
                      ['Açúcares Adicionados', acucarad100g, setAcucarad100g, 'acucarad100g', acucaradg, setAcucaradg, 'acucaradg', acucaradVD, setAcucaradVD, 'acucaradVD'],
                      ['Proteínas', proteina100g, setProteina100g, 'proteina100g', proteinag, setProteinag, 'proteinag', proteinaVD, setProteinaVD, 'proteinaVD'],
                      ['Gorduras Totais', gorduraTotal100g, setGorduraTotal100g, 'gorduraTotal100g', gorduraTotalg, setGorduraTotalg, 'gorduraTotalg', gorduraTotalVD, setGorduraTotalVD, 'gorduraTotalVD'],
                      ['Gorduras Saturadas', gorduraSaturada100g, setGorduraSaturada100g, 'gorduraSaturada100g', gorduraSaturadag, setGorduraSaturadag, 'gorduraSaturadag', gorduraSaturadaVD, setGorduraSaturadaVD, 'gorduraSaturadaVD'],
                      ['Gorduras Trans', gorduraTrans100g, setGorduraTrans100g, 'gorduraTrans100g', gorduraTransg, setGorduraTransg, 'gorduraTransg', gorduraTransVD, setGorduraTransVD, 'gorduraTransVD'],
                      ['Fibras Alimentares', fibra100g, setFibra100g, 'fibra100g', fibrag, setFibrag, 'fibrag', fibraVD, setFibraVD, 'fibraVD'],
                      ['Sódio', sodio100g, setSodio100g, 'sodio100g', sodiog, setSodiog, 'sodiog', sodioVD, setSodioVD, 'sodioVD'],
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

                <div className='d-flex mb-3'>
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
                      style={{ width: '250px', minHeight: '100px', whiteSpace: 'nowrap', border: erros.ingredientes ? '1px solid red' : undefined }} // Aumenta a altura para uma boa visualização
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
                      style={{ width: '250px', minHeight: '100px', whiteSpace: 'nowrap', border: erros.valoresReferencia ? '1px solid red' : undefined }} // Aumenta a altura para uma boa visualização
                    />
                    {erros.valoresReferencia && <small className="text-danger">Campo obrigatório</small>}
                  </div>
                </div>
                <div className='d-flex'>
                  {/* <div className='me-4'>
                    <label>Armazenamento</label>
                    <textarea
                      value={armazenamento}
                      onChange={(e) => {
                        setArmazenamento(e.target.value);
                        if (erros.armazenamento && e.target.value.trim() !== '') {
                          setErros(prev => ({ ...prev, armazenamento: false }));
                        }
                      }}
                      className="form-control"
                      style={{ width: '250px', minHeight: '100px', whiteSpace: 'nowrap', border: erros.armazenamento ? '1px solid red' : undefined }} // Aumenta a altura para uma boa visualização
                    />
                    {erros.armazenamento && <small className="text-danger">Campo obrigatório</small>}
                  </div> */}
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
                      style={{ width: '250px', minHeight: '100px', whiteSpace: 'nowrap', border: erros.alergenicos ? '1px solid red' : undefined }} // Aumenta a altura para uma boa visualização
                    />
                    {erros.alergenicos && <small className="text-danger">Campo obrigatório</small>}
                  </div>
                </div>
                <div className='d-flex mb-3'>
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
                </div>
                <div className='d-flex mb-3'>
                  {/* <div className='me-4'>

                    <label>Quantidade</label>
                    <input
                      type='number'
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
                  </div> */}
                  {/* <div className='me-4'>

                    <label>Valor Unidade</label>
                    <input
                      value={valorQuant}
                      onChange={(e) => {
                        setValorQuant(e.target.value);
                        if (erros.valorQuant && e.target.value.trim() !== '') {
                          setErros(prev => ({ ...prev, valorQuant: false }));
                        }
                      }}
                      className="form-control"
                      style={{ maxWidth: '60px', border: erros.valorQuant ? '1px solid red' : undefined }}
                    />
                    {erros.valorQuant && <small className="text-danger">Campo obrigatório</small>}
                  </div> */}
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
                      style={{ maxWidth: '60px', border: erros.valorTotal ? '1px solid red' : undefined }}
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
                      style={{ maxWidth: '60px', border: erros.validade ? '1px solid red' : undefined }}
                    />
                    {erros.validade && <small className="text-danger">Campo obrigatório</small>}
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
