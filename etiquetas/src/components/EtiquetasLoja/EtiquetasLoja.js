import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import jsPDF from "jspdf";
import axios from 'axios';
import Select from 'react-select';
import { isCookie, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';


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
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const [erros, setErros] = useState({});
  // Token esperado


  useEffect(() => {
    const tokenEsperado = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxNCIsImVtYWlsIjoidXNlckBxdWFsaWRhZGUiLCJ1c2VybmFtZSI6InF1YWxpZGFkZSIsInJvbGUiOiJxdWFsaWRhZGUiLCJleHAiOjE3NTE0NzI3MzEsImlzcyI6InlvdXJfYXBwIiwiYXVkIjoieW91cl91c2VycyJ9.WWHIEswrZZ9kDH_uFaPsV14LGOo9R0Z52IjrQ_IVLDg";
    const token = Cookies.get("token");
    if (token === tokenEsperado) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);


  const validarCamposObrigatorios = () => {
    const novosErros = {};

    if (!produto) novosErros.produto = true;
    if (!porcao) novosErros.porcao = true;
    if (!caseira) novosErros.caseira = true;
    if (!energia100g) novosErros.energia100g = true;
    if (!energiag) novosErros.energiag = true;
    if (!energiaVD) novosErros.energiaVD = true;
    if (!carb100g) novosErros.carb100g = true;
    if (!carbg) novosErros.carbg = true;
    if (!carbVD) novosErros.carbVD = true;
    if (!acucar100g) novosErros.acucar100g = true;
    if (!acucarg) novosErros.acucarg = true;
    if (!acucarVD) novosErros.acucarVD = true;
    if (!acucarad100g) novosErros.acucarad100g = true;
    if (!acucaradg) novosErros.acucaradg = true;
    if (!acucaradVD) novosErros.acucaradVD = true;
    if (!proteina100g) novosErros.proteina100g = true;
    if (!proteinag) novosErros.proteinag = true;
    if (!proteinaVD) novosErros.proteinaVD = true;
    if (!gorduraTotal100g) novosErros.gorduraTotal100g = true;
    if (!gorduraTotalg) novosErros.gorduraTotalg = true;
    if (!gorduraTotalVD) novosErros.gorduraTotalVD = true;
    if (!gorduraSaturada100g) novosErros.gorduraSaturada100g = true;
    if (!gorduraSaturadag) novosErros.gorduraSaturadag = true;
    if (!gorduraSaturadaVD) novosErros.gorduraSaturadaVD = true;
    if (!gorduraTrans100g) novosErros.gorduraTrans100g = true;
    if (!gorduraTransg) novosErros.gorduraTransg = true;
    if (!gorduraTransVD) novosErros.gorduraTransVD = true;
    if (!fibra100g) novosErros.fibra100g = true;
    if (!fibrag) novosErros.fibrag = true;
    if (!fibraVD) novosErros.fibraVD = true;
    if (!sodio100g) novosErros.sodio100g = true;
    if (!sodiog) novosErros.sodiog = true;
    if (!sodioVD) novosErros.sodioVD = true;
    if (!ingredientes) novosErros.ingredientes = true;
    if (!valoresReferencia) novosErros.valoresReferencia = true;
    if (!armazenamento) novosErros.armazenamento = true;
    if (!alergenicos) novosErros.alergenicos = true;
    if (!glutem) novosErros.glutem = true;
    if (!lactose) novosErros.lactose = true;
    if (!quantidade) novosErros.quantidade = true;
    if (!valorQuant) novosErros.valorQuant = true;
    if (!valorTotal) novosErros.valorTotal = true;
    if (!validade) novosErros.validade = true;

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

      let y = 5; // Posição inicial para as informações nutricionais
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);

      // Título da seção de informações nutricionais
      doc.setFont("helvetica", "bold");
      doc.text("INFORMAÇÃO NUTRICIONAL", 3, y + 8)
      doc.setFont("helvetica", "normal");
      doc.text(`Porções de ${String(porcao)} g (${String(caseira)})`, 3, y + 11);
      doc.line(2, y + 12, 47, y + 12); // Linha horizontal após cada item

      y += 8; // Aumenta a posição para deixar um espaço após o título

      // Desenhando a linha de cabeçalho com os rótulos
      doc.text("Nutrientes", 3, y + 7);
      doc.text("100g", 30, y + 7);
      doc.text(`${String(porcao)}g`, 36, y + 7);
      doc.text("VD%", 42, y + 7);

      y += 6;

      // Adicionando os itens nutricionais
      informacoesNutricionais.forEach(info => {
        doc.text(info.nome, 3, y + 4); // Nome do nutriente
        doc.text(String(info.valor100g), 30, y + 4); // Valor para 100g
        doc.text(String(info.valor120g), 36, y + 4); // Valor para 120g
        doc.text(String(info.VD), 42, y + 4); // Valor para 120g

        y += 3; // Aumenta a posição para o próximo item

        // Linha de separação entre os itens
        doc.line(2, y + 2, 47, y + 2); // Linha horizontal após cada item
      });

      doc.line(29, y - 32, 29, y + 2); // Linha vertical entre "Nutriente" e "100g"
      doc.line(35, y - 32, 35, y + 2); // Linha vertical entre "100g" e "120g"
      doc.line(41, y - 32, 41, y + 2); // Linha vertical entre "100g" e "120g"
      doc.line(47, y - 39, 47, y + 15); // Linha vertical entre "100g" e "120g"
      doc.line(2, y - 39, 2, y + 15); // Linha vertical entre "100g" e "120g"
      doc.line(2, y - 39, 47, y - 39); // Linha horizontal após cada item
      doc.line(2, y - 28, 47, y - 28); // Linha horizontal após cada item
      doc.line(2, y + 15, 47, y + 15); // Linha horizontal após cada item

      doc.text(`${valoresReferencia}`, 3, y + 4);

      doc.text(`INGREDIENTES:`, 48, y - 37);
      doc.text(String(ingredientes), 48, y - 34);

      doc.setFont("helvetica", "bold");
      doc.text(`${String(glutem)} GLÚTEN.\n${String(lactose)} LACTOSE.`, 48, y - 18);
      doc.text(`ALERGÊNICOS:`, 48, y - 13);
      doc.text(String(alergenicos), 48, y - 10);

      doc.setFont("helvetica", "normal");
      doc.text(String(armazenamento), 48, y + 5);

      doc.setFontSize(15);
      doc.setFont("helvetica", "bold");
      doc.text(String(nomeProduto), 3, y - 43)

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("DATA:", 3, y + 22);
      doc.text("VALIDADE:", 3, y + 28);

      doc.text(formatDate(fabricacao), 25, y + 22);
      doc.text(formatDate(validade), 25, y + 28);

      doc.text(`QUANT.: ${String(quantidade)}`, 50, y + 18);
      doc.text(`R$/Unid.: ${String(valorQuant)}`, 50, y + 22);
      doc.line(49, y + 31, 75, y + 31);

      doc.text(`TOTAL: R$${String(valorTotal)}`, 50, y + 28);
    }
    // Gerar o blob do PDF
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

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
                  <div className='me-4'>
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
                  </div>
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
                  <div className='me-4'>

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
                  </div>
                  <div className='me-4'>

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
                  </div>
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
