import React, { useState } from 'react';
import './App.css';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';

import { 
  MapPin, 
  Clock, 
  Calendar, 
  Users, 
  CreditCard, 
  FileText, 
  Phone, 
  Mail,
  Bus,
  Camera,
  Shield,
  Heart,
  CheckCircle,
  ArrowRight,
  User,
  X,
  Plus,
  Minus,
  UserPlus,
  Check,
  Send
} from 'lucide-react';

function App() {
  // Estados para o formulário
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    studentGrade: '',
    studentClass: '',
    category: '',
    paymentAmount: '',
    hasInterest: false,
    parentName: '',
    cpf: '',
    email: '',
    phone: '',
    paymentMethod: 'pix',
    installments: 1,
    observations: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [inscriptionSuccess, setInscriptionSuccess] = useState(false);
  
  // Estados para validação de CPF
  const [cpfError, setCpfError] = useState('');
  const [cpfValid, setCpfValid] = useState(false);

  // Estados para envio de link
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  // Função para validar CPF
  const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    let soma = 0;
    let resto;
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    return true;
  };

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const showInscricaoForm = () => {
    setShowForm(true);
    setTimeout(() => {
      document.getElementById('formulario-inscricao')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  // ============================================
  // ⚙️ TAXAS — ajuste aqui para novos eventos
  // ============================================

  // Taxas de antecipação (real Asaas + margem de segurança)
  const TAXA_ANTECIPACAO_VISTA     = 0.025;  // 1,59%/mês real + margem → 2,5%
  const TAXA_ANTECIPACAO_PARCELADO = 0.03;   // 1,59%/mês real + margem → 3,0%

  // Taxas do cartão por faixa de parcelas (Asaas + margem de +1%)
  const TAXAS_CARTAO = {
    1:  0.0399,  // 3,99%  — à vista      (era 2,99%)
    6:  0.0449,  // 4,49%  — de 2 a 6x    (era 3,49%)
    12: 0.0499,  // 4,99%  — de 7 a 12x   (era 3,99%)
  };

  const TAXA_FIXA_CARTAO = 0.49; // R$ 0,49 por transação

  // Retorna a taxa percentual do cartão para N parcelas
  const getTaxaCartao = (numParcelas) => {
    if (numParcelas === 1)                         return TAXAS_CARTAO[1];
    if (numParcelas >= 2 && numParcelas <= 6)      return TAXAS_CARTAO[6];
    if (numParcelas >= 7 && numParcelas <= 12)     return TAXAS_CARTAO[12];
    return TAXAS_CARTAO[1];
  };

  // Calcula taxa de antecipação
  const calcularTaxaAntecipacao = (valorBase, numParcelas) => {
    if (numParcelas === 1) {
      return valorBase * TAXA_ANTECIPACAO_VISTA;
    }
    // Parcelado: soma dos meses (1 + 2 + ... + n)
    const somaMeses   = (numParcelas * (numParcelas + 1)) / 2;
    const valorParcela = valorBase / numParcelas;
    return valorParcela * TAXA_ANTECIPACAO_PARCELADO * somaMeses;
  };

  // Calcula valor da parcela para N parcelas
  const calculateInstallmentValue = (numParcelas) => {
    const valorBase = parseFloat(formData.paymentAmount) || 0;
    if (!formData.hasInterest || formData.paymentMethod !== 'credit') {
      return valorBase / numParcelas;
    }
    const taxaCartao      = valorBase * getTaxaCartao(numParcelas);
    const taxaAntecipacao = calcularTaxaAntecipacao(valorBase, numParcelas);
    const valorTotal      = valorBase + taxaCartao + TAXA_FIXA_CARTAO + taxaAntecipacao;
    return valorTotal / numParcelas;
  };

  // Cálculo completo do preço (para o resumo)
  const calculatePrice = () => {
    const valorBase = parseFloat(formData.paymentAmount) || 0;
    let valorTotal    = valorBase;
    let taxaAntecipacao = 0;
    let taxaCartao      = 0;

    if (formData.hasInterest === true && formData.paymentMethod === 'credit') {
      const parcelas    = parseInt(formData.installments) || 1;
      taxaCartao        = valorBase * getTaxaCartao(parcelas);
      taxaAntecipacao   = calcularTaxaAntecipacao(valorBase, parcelas);
      valorTotal        = valorBase + taxaCartao + TAXA_FIXA_CARTAO + taxaAntecipacao;
    }

    const valorParcela = valorTotal / (parseInt(formData.installments) || 1);
    return { valorTotal, valorParcela, valorBase, taxaAntecipacao, taxaCartao };
  };

  const { valorTotal, valorParcela, valorBase, taxaAntecipacao, taxaCartao } = calculatePrice();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cpf') {
      const cpfValue = value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      setFormData(prev => ({ ...prev, [name]: cpfValue }));
      const cpfSemMascara = cpfValue.replace(/[^\d]/g, '');
      if (cpfSemMascara.length === 0) {
        setCpfError(''); setCpfValid(false);
      } else if (cpfSemMascara.length < 11) {
        setCpfError('CPF deve ter 11 dígitos'); setCpfValid(false);
      } else if (cpfSemMascara.length === 11) {
        if (validarCPF(cpfSemMascara)) { setCpfError(''); setCpfValid(true); }
        else { setCpfError('CPF inválido. Verifique os números digitados.'); setCpfValid(false); }
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const cpfSemMascara = formData.cpf.replace(/[^\d]/g, '');
    if (!cpfSemMascara || cpfSemMascara.length !== 11) {
      alert('Por favor, preencha um CPF válido.');
      return false;
    }
    if (!validarCPF(cpfSemMascara)) {
      alert('CPF inválido. Verifique os números digitados.');
      return false;
    }
    return true;
  };

  const enviarDados = async (enviarLinkCelular = false) => {
    if (!validateForm()) return false;
    try {
      const response = await fetch('https://webhook.escolaamadeus.com/webhook/amadeuseventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          valorTotal,
          valorParcela,
          enviarLinkCelular,
          timestamp: new Date().toISOString(),
          event: 'Amadeus-gerarcobranca'
        }),
      });
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao enviar:', error);
      return { success: false, error };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsProcessing(true);
    try {
      const result = await enviarDados(false);
      if (result.success && result.data.paymentUrl) {
        window.location.href = result.data.paymentUrl;
      } else if (result.success) {
        alert('Inscrição realizada com sucesso! Aguarde instruções de pagamento.');
        setInscriptionSuccess(true);
      } else {
        alert('Erro ao processar inscrição. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao enviar inscrição:', error);
      alert('Erro ao processar inscrição. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendPaymentLink = async () => {
    if (!validateForm()) return;
    if (!formData.phone) {
      alert('Por favor, preencha o telefone/WhatsApp do cliente para enviar o link.');
      return;
    }
    setIsSendingLink(true);
    try {
      const result = await enviarDados(true);
      if (result.success) {
        setLinkSent(true);
        alert('Link de pagamento será enviado para o WhatsApp do cliente!');
      } else {
        alert('Erro ao enviar link. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao enviar link:', error);
      alert('Erro ao enviar link. Tente novamente.');
    } finally {
      setIsSendingLink(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎓</span>
              <span className="text-xl font-bold">Centro Educacional Amadeus</span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <button onClick={() => scrollToSection('sobre')} className="hover:text-primary transition-colors">Sobre</button>
              <button onClick={() => scrollToSection('informacoes')} className="hover:text-primary transition-colors">Informações</button>
              <button onClick={() => scrollToSection('inscricao')} className="hover:text-primary transition-colors">Inscrição</button>
              <button onClick={() => scrollToSection('contato')} className="hover:text-primary transition-colors">Contato</button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="sobre" className="section-padding bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-extrabold mb-6 text-blue-900">
              Pagamento Administrativo
            </h1>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Sistema de pagamento para livros, material escolar e outros serviços do Centro Educacional Amadeus.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button 
                size="lg" 
                onClick={showInscricaoForm}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-bold"
              >
                FAZER PAGAMENTO
                <ArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Informações */}
      <section id="informacoes" className="section-padding">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Informações do Pagamento</h2>
            <p className="text-lg text-muted-foreground">Detalhes sobre o processo de pagamento</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="card-hover">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>Métodos de Pagamento</CardTitle>
                    <CardDescription>Opções disponíveis</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>PIX (sem juros)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Cartão de Crédito (parcelamento até 12x)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Shield className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>Pagamento Seguro</CardTitle>
                    <CardDescription>Seus dados protegidos</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Utilizamos a plataforma Asaas para processar pagamentos com total segurança e criptografia de dados.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Formulário */}
      <section id="inscricao" className="section-padding bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          {!showForm && (
            <div className="text-center">
              <div className="bg-blue-600 text-white p-8 rounded-lg shadow-xl mb-8">
                <h2 className="text-3xl font-bold mb-4">Pronto para fazer o pagamento?</h2>
                <p className="text-lg mb-6">Clique no botão abaixo para preencher o formulário</p>
                <Button
                  size="lg"
                  onClick={showInscricaoForm}
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-bold"
                >
                  INICIAR PAGAMENTO
                  <ArrowRight className="ml-2" />
                </Button>
              </div>
            </div>
          )}

          {showForm && !inscriptionSuccess && (
            <Card id="formulario-inscricao" className="shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl">Formulário de Pagamento</CardTitle>
                <CardDescription>Preencha os dados abaixo para realizar o pagamento</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Dados do Aluno */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Dados do Aluno</h3>
                    <div>
                      <Label htmlFor="studentName">Nome Completo do Aluno *</Label>
                      <Input
                        id="studentName" name="studentName"
                        value={formData.studentName} onChange={handleInputChange}
                        placeholder="Nome completo" required className="mt-2"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="studentGrade">Série <span className="text-gray-400 text-sm ml-1">(opcional)</span></Label>
                        <select id="studentGrade" name="studentGrade" value={formData.studentGrade}
                          onChange={handleInputChange}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm mt-2">
                          <option value="">Selecione a série</option>
                          <option value="Maternal II">Maternal II</option>
                          <option value="Maternal III">Maternal III</option>
                          <option value="Grupo 4">Grupo 4</option>
                          <option value="Grupo 5">Grupo 5</option>
                          <option value="1º Ano">1º Ano</option>
                          <option value="2º Ano">2º Ano</option>
                          <option value="3º Ano">3º Ano</option>
                          <option value="4º Ano">4º Ano</option>
                          <option value="5º Ano">5º Ano</option>
                          <option value="6º Ano">6º Ano</option>
                          <option value="7º Ano">7º Ano</option>
                          <option value="8º Ano">8º Ano</option>
                          <option value="9º Ano">9º Ano</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="studentClass">Turma <span className="text-gray-400 text-sm ml-1">(opcional)</span></Label>
                        <select id="studentClass" name="studentClass" value={formData.studentClass}
                          onChange={handleInputChange}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm mt-2">
                          <option value="">Selecione a turma</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Dados do Responsável */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Dados do Responsável</h3>
                    <div>
                      <Label htmlFor="parentName">Nome Completo do Responsável *</Label>
                      <Input
                        id="parentName" name="parentName"
                        value={formData.parentName} onChange={handleInputChange}
                        placeholder="Nome completo" required className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cpf">
                        CPF do Responsável *
                        {cpfValid && <span className="ml-2 text-green-600">✓ CPF válido</span>}
                      </Label>
                      <Input
                        id="cpf" name="cpf"
                        value={formData.cpf} onChange={handleInputChange}
                        placeholder="000.000.000-00" maxLength={14} required
                        className={`mt-2 ${cpfError ? 'border-red-500' : cpfValid ? 'border-green-500' : ''}`}
                      />
                      {cpfError && <p className="text-red-500 text-sm mt-1">{cpfError}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">E-mail *</Label>
                        <Input
                          id="email" name="email" type="email"
                          value={formData.email} onChange={handleInputChange}
                          placeholder="seu@email.com" required className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                        <Input
                          id="phone" name="phone" type="tel"
                          value={formData.phone} onChange={handleInputChange}
                          placeholder="(84) 99999-9999" required className="mt-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dados do Pagamento */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Dados do Pagamento</h3>

                    <div>
                      <Label htmlFor="category">Categoria *</Label>
                      <select id="category" name="category" value={formData.category}
                        onChange={handleInputChange} required
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm mt-2">
                        <option value="">Selecione a categoria</option>
                        <option value="Livros">Livros</option>
                        <option value="Material Escolar">Material Escolar</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="paymentAmount">Valor do Pagamento (R$) *</Label>
                      <Input
                        id="paymentAmount" name="paymentAmount"
                        type="number" step="0.01" min="0"
                        value={formData.paymentAmount} onChange={handleInputChange}
                        placeholder="0.00" required className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="observations">
                        Observações <span className="text-gray-400 text-sm ml-1">(opcional)</span>
                      </Label>
                      <textarea
                        id="observations" name="observations"
                        value={formData.observations} onChange={handleInputChange}
                        placeholder="Digite aqui qualquer informação adicional..."
                        rows="4" maxLength="500"
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm mt-2 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Máximo de 500 caracteres.</p>
                    </div>

                    {/* Toggle Com/Sem Juros */}
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <Label className="text-sm font-medium mb-3 block">
                        Aplicar Taxas de Cartão de Crédito?
                      </Label>
                      <div className="flex items-center space-x-4">
                        <div
                          className={`flex-1 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.hasInterest === false ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, hasInterest: false }))}
                        >
                          <div className="flex items-center justify-center">
                            <span className="text-sm font-medium">Sem Juros</span>
                          </div>
                        </div>
                        <div
                          className={`flex-1 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.hasInterest === true ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, hasInterest: true }))}
                        >
                          <div className="flex items-center justify-center">
                            <span className="text-sm font-medium">Com Juros</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        {formData.hasInterest
                          ? 'Taxas do cartão (3,99% a 4,99%) + taxa fixa (R$ 0,49) + taxa de antecipação (2,5% à vista / 3,0% ao mês parcelado)'
                          : 'Nenhuma taxa adicional será aplicada'}
                      </p>
                    </div>

                    {/* Método de Pagamento */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Método de Pagamento *</Label>
                      <div className="space-y-3">
                        <div
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.paymentMethod === 'pix' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'pix', installments: 1 }))}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                                formData.paymentMethod === 'pix' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                              }`} />
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm">📱</span>
                                  <span className="text-sm font-medium">PIX</span>
                                </div>
                                <div className="text-xs text-gray-600 ml-6">(pagamento à vista)</div>
                              </div>
                            </div>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Sem juros</span>
                          </div>
                        </div>

                        <div
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.paymentMethod === 'credit' ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'credit' }))}
                        >
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                              formData.paymentMethod === 'credit' ? 'border-orange-400 bg-orange-400' : 'border-gray-300'
                            }`} />
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm">💳</span>
                                <span className="text-sm font-medium">Cartão de Crédito</span>
                              </div>
                              <div className="text-xs text-gray-600 ml-6">Parcelamento disponível em até 12x</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Seletor de Parcelas */}
                    {formData.paymentMethod === 'credit' && formData.paymentAmount > 0 && (
                      <div className="mb-6">
                        <Label className="text-sm font-medium">Número de Parcelas</Label>
                        <select
                          value={formData.installments}
                          onChange={(e) => setFormData(prev => ({ ...prev, installments: parseInt(e.target.value) }))}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm mt-2"
                        >
                          {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                            <option key={n} value={n}>
                              {n}x de {formatCurrency(calculateInstallmentValue(n))}
                              {n >= 2 && n <= 6  ? ' (4,49% a.m.)' : ''}
                              {n >= 7            ? ' (4,99% a.m.)' : ''}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          * 1x: 3,99% | 2x–6x: 4,49% | 7x–12x: 4,99% + taxa de antecipação
                        </p>
                      </div>
                    )}

                    {/* Resumo do Valor */}
                    {formData.paymentAmount > 0 && (
                      <div className="bg-orange-100 p-4 rounded-lg border border-orange-200">
                        <div className="text-center">
                          <h4 className="text-lg font-bold text-orange-800 mb-1">Resumo do Pagamento</h4>
                          {valorBase > 0 && valorTotal !== valorBase && (
                            <div className="text-sm text-gray-600 line-through">
                              Valor base: {formatCurrency(valorBase)}
                            </div>
                          )}
                          <div className="text-2xl font-bold text-orange-900">
                            {formatCurrency(valorTotal)}
                          </div>
                          {formData.paymentMethod === 'credit' && formData.installments > 1 && (
                            <div className="text-sm text-orange-700 mt-1">
                              {formData.installments}x de {formatCurrency(valorParcela)}
                            </div>
                          )}
                          <div className="text-xs text-orange-600 mt-2">
                            {formData.hasInterest === false ? '✓ Sem juros' : '⚠ Com juros'}
                          </div>
                          {valorTotal > valorBase && valorBase > 0 && formData.hasInterest && formData.paymentMethod === 'credit' && (
                            <div className="mt-3 pt-3 border-t border-orange-200 text-left">
                              <p className="text-xs font-semibold text-orange-800 mb-1">Detalhamento das taxas:</p>
                              <div className="text-xs text-orange-700 space-y-1">
                                <div className="flex justify-between">
                                  <span>Taxa do cartão:</span>
                                  <span>{formatCurrency(taxaCartao)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Taxa fixa:</span>
                                  <span>R$ 0,49</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Taxa de antecipação:</span>
                                  <span>{formatCurrency(taxaAntecipacao)}</span>
                                </div>
                                <div className="flex justify-between font-semibold pt-1 border-t border-orange-300">
                                  <span>Total de taxas:</span>
                                  <span>{formatCurrency(valorTotal - valorBase)}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botões */}
                  <div className="space-y-3">
                    <Button
                      type="submit"
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-bold"
                      disabled={isProcessing || isSendingLink}
                    >
                      {isProcessing ? (
                        <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Processando...</>
                      ) : 'CONTINUAR PARA PAGAMENTO'}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">ou</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={handleSendPaymentLink}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-5 text-md font-semibold"
                      disabled={isProcessing || isSendingLink || linkSent}
                    >
                      {isSendingLink ? (
                        <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Enviando Link...</>
                      ) : linkSent ? (
                        <><Check className="mr-2 h-5 w-5" />Link Enviado!</>
                      ) : (
                        <><Send className="mr-2 h-5 w-5" />ENVIAR LINK DE PAGAMENTO PARA O CLIENTE</>
                      )}
                    </Button>

                    {linkSent && (
                      <p className="text-sm text-center text-green-600 font-medium">
                        ✓ Link de pagamento será enviado para {formData.phone}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-center text-gray-600 mt-4">
                    Ao finalizar, o pagamento será processado via Asaas
                  </p>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="section-padding bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Entre em Contato</h2>
            <p className="text-lg text-muted-foreground">Tire suas dúvidas conosco</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="card-hover">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Phone className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>Telefone</CardTitle>
                    <CardDescription>Secretaria da escola</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">(84) 9 8145-0229</p>
                <p className="text-sm text-muted-foreground">Horário de atendimento: 7h às 19h</p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              <strong>Coordenação Pedagógica</strong><br />
              Escola Centro Educacional Amadeus - São Gonçalo do Amarante, RN
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© 2026 Escola Centro Educacional Amadeus. Todos os direitos reservados.</p>
          <p className="text-xs mt-2 opacity-80">Amadeus cobrança</p>
        </div>
      </footer>
    </div>
  );
}

export default App;






















