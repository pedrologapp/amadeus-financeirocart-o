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
  Check 
} from 'lucide-react';
// Importando as imagens

function App() {
  // Estados para o formulário
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    studentGrade: '',
    studentClass: '',
	category: '',           // Categoria: livros, material ou outros
  	paymentAmount: '',      // Valor do pagamento
  	hasInterest: false,     // Com ou sem juros
    parentName: '',
    cpf: '',
    email: '',
    phone: '',
    paymentMethod: 'pix',
    installments: 1
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [inscriptionSuccess, setInscriptionSuccess] = useState(false);
  
  // Estados para validação de CPF
  const [cpfError, setCpfError] = useState('');
  const [cpfValid, setCpfValid] = useState(false);

  // Função para validar CPF
  const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g, ''); // Remove caracteres não numéricos
    
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false; // CPF com todos dígitos iguais
    
    let soma = 0;
    let resto;
    
    // Primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    
    // Segundo dígito verificador
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

  // Função para mostrar formulário
  const showInscricaoForm = () => {
    setShowForm(true);
    setTimeout(() => {
      document.getElementById('formulario-inscricao')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Função para formatar valor em Real Brasileiro
  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  // Cálculo de preço atualizado
  const calculatePrice = () => {
    // Usa o valor digitado pelo usuário como base
    const valorBase = parseFloat(formData.paymentAmount) || 0;
    
    let valorTotal = valorBase;
    
    // Aplica juros apenas se: Com Juros = true E Cartão de Crédito
    if (formData.hasInterest === true && formData.paymentMethod === 'credit') {
      let taxaPercentual = 0;
      const taxaFixa = 0.49;
      const parcelas = parseInt(formData.installments) || 1;
      
      if (parcelas === 1) {
        taxaPercentual = 0.0299;
      } else if (parcelas >= 2 && parcelas <= 4) {
        taxaPercentual = 0.0349;
      } else {
        taxaPercentual = 0.0399;
      }
      
      valorTotal = valorTotal + (valorTotal * taxaPercentual) + taxaFixa;
    }
    
    const valorParcela = valorTotal / (parseInt(formData.installments) || 1);
    return { valorTotal, valorParcela, valorBase };
  };

  const { valorTotal, valorParcela, valorBase } = calculatePrice();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Aplicar máscara de CPF
    if (name === 'cpf') {
      const cpfValue = value
        .replace(/\D/g, '') // Remove tudo que não é dígito
        .replace(/(\d{3})(\d)/, '$1.$2') // Adiciona primeiro ponto
        .replace(/(\d{3})(\d)/, '$1.$2') // Adiciona segundo ponto
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // Adiciona hífen

      setFormData(prev => ({ ...prev, [name]: cpfValue }));
      
      // Validação em tempo real do CPF
      const cpfSemMascara = cpfValue.replace(/[^\d]/g, '');
      
      if (cpfSemMascara.length === 0) {
        setCpfError('');
        setCpfValid(false);
      } else if (cpfSemMascara.length < 11) {
        setCpfError('CPF deve ter 11 dígitos');
        setCpfValid(false);
      } else if (cpfSemMascara.length === 11) {
        if (validarCPF(cpfSemMascara)) {
          setCpfError('');
          setCpfValid(true);
        } else {
          setCpfError('CPF inválido. Verifique os números digitados.');
          setCpfValid(false);
        }
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Função de validação antes do submit
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulário antes de enviar
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);

    try {  
      // Enviar dados para o webhook do n8n
      const response = await fetch('https://n8n.escolaamadeus.com/webhook-test/amadeusfinanceiro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentName: formData.studentName,
          studentGrade: formData.studentGrade,
          studentClass: formData.studentClass,
		  category: formData.category,
          parentName: formData.parentName,
          cpf: formData.cpf,
          email: formData.email,
          phone: formData.phone,
		  paymentAmount: formData.paymentAmount,    // ⭐ ADICIONE
  		  hasInterest: formData.hasInterest,
          paymentMethod: formData.paymentMethod,
          installments: formData.installments,
          amount: valorTotal,
          timestamp: new Date().toISOString(),
          event: 'Amadeus-gerarcobranca'
        })
      });

      if (response.ok) {
          // Pegar a resposta do n8n PRIMEIRO
          const responseData = await response.json();
          console.log('Resposta do n8n:', responseData); // Para debug
          
          // Verificar se houve erro retornado pelo n8n
          if (responseData.success === false) {
            alert(responseData.message || 'Erro ao processar dados. Tente novamente.');
            return;
          }
          
          // Mostrar tela de sucesso
        setInscriptionSuccess(true);
  
        // Redirecionar para o Asaas após 2 segundos
        setTimeout(() => {
          if (responseData.paymentUrl) {
            window.location.href = responseData.paymentUrl;
          } else {
            console.log('Link de pagamento não encontrado na resposta');
            alert('Erro: Link de pagamento não encontrado. Entre em contato conosco.');
          }
        }, 1000);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Erro ao enviar dados para o servidor');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao processar inscrição. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (inscriptionSuccess) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Aguarde!</CardTitle>
            <CardDescription>Redirecionando para o pagamento...</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Seus dados foram registrados com sucesso. Em instantes você será redirecionado para finalizar o pagamento.
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen smooth-scroll">
      {/* Header/Navigation */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-blue-900">Escola Amadeus</h1>
            <div className="hidden md:flex space-x-6">
              <button onClick={() => scrollToSection('custos')} className="text-sm hover:text-primary transition-colors">Gerar Cobrança</button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section min-h-screen flex items-center justify-center text-white relative">
        <div className="text-center z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
           Escola Amadeus - Geração de Cobranças
          </h1>
        
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
           
          </div>

        </div>
      </section>

        
{/* Custos e Pagamento */}
      <section id="custos" className="section-padding bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Material / Livros / Pagamentos</h2>
            <p className="text-lg text-muted-foreground">
              Preencha o formulário abaixo para gerar sua cobrança
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <Separator className="my-6" />
              
              <div className="text-center">
                {!showForm ? (
                  <Button 
                    size="lg" 
                    className="bg-orange-600 hover:bg-orange-700 px-8 py-3"
                    onClick={showInscricaoForm}
                  >
                    Gerar cobrança
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="px-8 py-3"
                    onClick={() => setShowForm(false)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Fechar Formulário
                  </Button>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {!showForm ? 'Preencha seus dados e escolha a forma de pagamento' : 'Clique acima para fechar o formulário'}
                </p>
              </div>
            </CardContent>
          </Card>

    	
          {/* FORMULÁRIO DE INSCRIÇÃO - SHOW/HIDE */}
          {showForm && (
            <Card id="formulario-inscricao" className="border-orange-200 bg-orange-50/30">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-800">
                  <User className="mr-2 h-5 w-5" />
                  Gerar cobrança
                </CardTitle>
                <CardDescription>
                  Preencha todos os dados para gerar a cobrança
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Dados do Aluno */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      Dados do Aluno
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="studentName">Nome Completo do Aluno *</Label>
                        <Input
                          id="studentName"
                          name="studentName"
                          value={formData.studentName}
                          onChange={handleInputChange}
                          required
                          placeholder="Nome completo do aluno"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="studentGrade">Série do Aluno *</Label>
                          <select
                            id="studentGrade"
                            name="studentGrade"
                            value={formData.studentGrade}
                            onChange={handleInputChange}
                            required
                            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                          >
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
                          <Label htmlFor="studentClass">Turma do Aluno *</Label>
                          <select
                            id="studentClass"
                            name="studentClass"
                            value={formData.studentClass}
                            onChange={handleInputChange}
                            required
                            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                          >
                            <option value="">Selecione a turma</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                          </select>
                        </div>                       
                      </div>

                      {/* ⭐ CAMPO DE CATEGORIA - NOVO */}
                      <div>
                        <Label htmlFor="category">Categoria *</Label>
                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        >
                          <option value="">Selecione a categoria</option>
                          <option value="Livro - Fundamental 1">Livro - Fundamental 1</option>
						  <option value="Livro - Fundamental 2">Livro - Fundamental 2</option>
						  <option value="Livro - Infantil">Livro - Infantil</option>
                          <option value="material">Material</option>
                          <option value="outros">Outros</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Dados do Responsável */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Mail className="mr-2 h-5 w-5" />
                      Dados do Responsável
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="parentName">Nome do Responsável *</Label>
                        <Input
                          id="parentName"
                          name="parentName"
                          value={formData.parentName}
                          onChange={handleInputChange}
                          required
                          placeholder="Nome completo do responsável"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            placeholder="(84) 99999-9999"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">E-mail *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="seu@email.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cpf">CPF do Responsável *</Label>
                          <Input
                            id="cpf"
                            name="cpf"
                            value={formData.cpf}
                            onChange={handleInputChange}
                            required
                            placeholder="000.000.000-00"
                            maxLength="14"
                            className={`${
                              formData.cpf && cpfError 
                                ? 'border-red-500 bg-red-50' 
                                : formData.cpf && cpfValid 
                                ? 'border-green-500 bg-green-50' 
                                : ''
                            }`}
                          />
                          {cpfError && (
                            <span className="text-xs text-red-600 mt-1">{cpfError}</span>
                          )}
                          {cpfValid && (
                            <span className="text-xs text-green-600 mt-1 flex items-center">
                              <Check className="h-3 w-3 mr-1" /> CPF válido
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ⭐ SEÇÃO DE PAGAMENTO - MODIFICADA */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Informações de Pagamento *</h3>
                    
                    {/* ⭐ CAMPO PARA DIGITAR O VALOR - NOVO */}
                    <div className="mb-6">
                      <Label htmlFor="paymentAmount">Valor do Pagamento *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                        <Input
                          id="paymentAmount"
                          name="paymentAmount"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.paymentAmount}
                          onChange={handleInputChange}
                          required
                          placeholder="0,00"
                          className="pl-10"
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Digite o valor a ser pago</p>
                    </div>

                    {/* ⭐ OPÇÃO COM OU SEM JUROS - NOVO */}
                    <div className="mb-6">
                      <Label className="text-sm font-medium mb-3 block">Tipo de Pagamento *</Label>
                      <div className="space-y-3">
                        <div 
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.hasInterest === false
                              ? 'border-green-400 bg-green-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, hasInterest: false }))}
                        >
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded-full border-2 mr-3 flex-shrink-0 ${
                              formData.hasInterest === false ? 'border-green-400 bg-green-400' : 'border-gray-300'
                            }`}>
                              {formData.hasInterest === false && (
                                <div className="w-full h-full rounded-full bg-green-400"></div>
                              )}
                            </div>
                            <div>
                              <span className="font-medium">Sem Juros</span>
                              <p className="text-xs text-gray-600">Você paga exatamente o valor digitado</p>
                            </div>
                          </div>
                        </div>

                        <div 
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.hasInterest === true
                              ? 'border-orange-400 bg-orange-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, hasInterest: true }))}
                        >
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded-full border-2 mr-3 flex-shrink-0 ${
                              formData.hasInterest === true ? 'border-orange-400 bg-orange-400' : 'border-gray-300'
                            }`}>
                              {formData.hasInterest === true && (
                                <div className="w-full h-full rounded-full bg-orange-400"></div>
                              )}
                            </div>
                            <div>
                              <span className="font-medium">Com Juros</span>
                              <p className="text-xs text-gray-600">Taxas aplicadas no cartão de crédito (2,99% a 3,99% + R$ 0,49)</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 italic">
                        ℹ️ Os juros são aplicados apenas em pagamentos com cartão de crédito quando "Com Juros" está selecionado
                      </p>
                    </div>

                    {/* MÉTODO DE PAGAMENTO */}
                    <div className="mb-6">
                      <Label className="text-sm font-medium mb-3 block">Método de Pagamento *</Label>
                      <div className="space-y-3">
                        <div 
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.paymentMethod === 'pix' 
                              ? 'border-orange-400 bg-orange-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'pix', installments: 1, hasInterest: false }))}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                                formData.paymentMethod === 'pix' ? 'border-orange-400 bg-orange-400' : 'border-gray-300'
                              }`}>
                                {formData.paymentMethod === 'pix' && (
                                  <div className="w-full h-full rounded-full bg-orange-400"></div>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold">PIX</span>
                                <span className="text-sm text-gray-600">(pagamento à vista)</span>
                              </div>
                            </div>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                              Sem juros
                            </span>
                          </div>
                        </div>

                        <div 
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.paymentMethod === 'credit' 
                              ? 'border-orange-400 bg-orange-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'credit' }))}
                        >
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                              formData.paymentMethod === 'credit' ? 'border-orange-400 bg-orange-400' : 'border-gray-300'
                            }`}>
                              {formData.paymentMethod === 'credit' && (
                                <div className="w-full h-full rounded-full bg-orange-400"></div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm">💳</span>
                                <span className="text-sm font-medium">Cartão de Crédito</span>
                              </div>
                              <div className="text-xs text-gray-600 ml-6">
                                Parcelamento disponível
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* NÚMERO DE PARCELAS (SE CARTÃO DE CRÉDITO) */}
                    {formData.paymentMethod === 'credit' && formData.paymentAmount > 0 && (
                      <div className="mb-6">
                        <Label className="text-sm font-medium">Número de Parcelas</Label>
                        <select
                          value={formData.installments}
                          onChange={(e) => setFormData(prev => ({ ...prev, installments: parseInt(e.target.value) }))}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm mt-2"
                        >
                          <option value={1}>1x de {formatCurrency(valorTotal / 1)}</option>          
                          <option value={2}>2x de {formatCurrency(valorTotal / 2)}</option>					        
                          <option value={3}>3x de {formatCurrency(valorTotal / 3)}</option>						        
                          <option value={4}>4x de {formatCurrency(valorTotal / 4)}</option>					        
                          <option value={5}>5x de {formatCurrency(valorTotal / 5)}</option>				        
                          <option value={6}>6x de {formatCurrency(valorTotal / 6)}</option>			        
                          <option value={7}>7x de {formatCurrency(valorTotal / 7)}</option>		        
                          <option value={8}>8x de {formatCurrency(valorTotal / 8)}</option>	        
                          <option value={9}>9x de {formatCurrency(valorTotal / 9)}</option>       
                          <option value={10}>10x de {formatCurrency(valorTotal / 10)}</option>       
                          <option value={11}>11x de {formatCurrency(valorTotal / 11)}</option>       
                          <option value={12}>12x de {formatCurrency(valorTotal / 12)}</option>
                        </select>
                      </div>
                    )}

                    {/* RESUMO DO VALOR */}
                    {formData.paymentAmount > 0 && (
                      <div className="bg-orange-100 p-4 rounded-lg border border-orange-200">
                        <div className="text-center">
                          <h4 className="text-lg font-bold text-orange-800 mb-1">Resumo do Pagamento</h4>
                          
                          {/* Valor Base */}
                          {valorBase > 0 && valorTotal !== valorBase && (
                            <div className="text-sm text-gray-600 line-through">
                              Valor base: {formatCurrency(valorBase)}
                            </div>
                          )}
                          
                          {/* Valor Total */}
                          <div className="text-2xl font-bold text-orange-900">
                            {formatCurrency(valorTotal)}
                          </div>
                          
                          {/* Parcelas */}
                          {formData.paymentMethod === 'credit' && formData.installments > 1 && (
                            <div className="text-sm text-orange-700 mt-1">
                              {formData.installments}x de {formatCurrency(valorParcela)}
                            </div>
                          )}
                          
                          {/* Status de Juros */}
                          <div className="text-xs text-orange-600 mt-2">
                            {formData.hasInterest === false ? '✓ Sem juros' : '⚠ Com juros'}
                          </div>
                          
                          {/* Mostrar valor adicional de juros se aplicável */}
                          {valorTotal > valorBase && valorBase > 0 && (
                            <div className="text-xs text-orange-700 mt-1">
                              (+{formatCurrency(valorTotal - valorBase)} de taxas)
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botão de Envio */}
                  <Button 
                    type="submit" 
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-bold"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processando Inscrição...
                      </>
                    ) : (
                      'CONTINUAR PARA PAGAMENTO'
                    )}
                  </Button>

                  <p className="text-xs text-center text-gray-600">
                    Ao finalizar, você será redirecionado para o pagamento via Asaas
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
            <p className="text-lg text-muted-foreground">
              Tire suas dúvidas conosco
            </p>
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
                <p className="text-sm text-muted-foreground">
                  Horário de atendimento: 7h às 19h
                </p>
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
          <p className="text-sm">
            © 2025 Escola Centro Educacional Amadeus. Todos os direitos reservados.
          </p>
          <p className="text-xs mt-2 opacity-80">
            Passeio ao Game Station no Partage Shopping - 15 de Agosto de 2025
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;


















