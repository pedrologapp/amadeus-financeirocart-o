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

       // Função para calcular valor da parcela para um número específico de parcelas
       const calculateInstallmentValue = (numParcelas) => {
              const valorBase = parseFloat(formData.paymentAmount) || 0;
              
              if (!formData.hasInterest || formData.paymentMethod !== 'credit') {
                     return valorBase / numParcelas;
              }
              
              let taxaPercentual = 0;
              const taxaFixa = 0.49;
              
              if (numParcelas === 1) {
                     taxaPercentual = 0.0299; // 2,99% à vista
              } else if (numParcelas >= 2 && numParcelas <= 6) {
                     taxaPercentual = 0.0349; // 3,49% de 2 a 6 parcelas
              } else if (numParcelas >= 7 && numParcelas <= 12) {
                     taxaPercentual = 0.0399; // 3,99% de 7 a 12 parcelas
              }
              
              const valorTotalComTaxa = valorBase + (valorBase * taxaPercentual) + taxaFixa;
              return valorTotalComTaxa / numParcelas;
       };

       // Cálculo de preço atualizado (para o resumo)
       const calculatePrice = () => {
              const valorBase = parseFloat(formData.paymentAmount) || 0;
              
              let valorTotal = valorBase;
              
              // Aplica juros apenas se: Com Juros = true E Cartão de Crédito
              if (formData.hasInterest === true && formData.paymentMethod === 'credit') {
                     let taxaPercentual = 0;
                     const taxaFixa = 0.49;
                     const parcelas = parseInt(formData.installments) || 1;
                     
                     if (parcelas === 1) {
                            taxaPercentual = 0.0299; // 2,99% à vista
                     } else if (parcelas >= 2 && parcelas <= 6) {
                            taxaPercentual = 0.0349; // 3,49% de 2 a 6 parcelas
                     } else if (parcelas >= 7 && parcelas <= 12) {
                            taxaPercentual = 0.0399; // 3,99% de 7 a 12 parcelas
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
    
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);

    try {
      const response = await fetch('https://n8n.escolaamadeus.com/webhook-test/amadeusfinanceiro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
          event: 'Amadeus-gerarcobranca'
        }),
      });

      const data = await response.json();

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert('Inscrição realizada com sucesso! Aguarde instruções de pagamento.');
        setInscriptionSuccess(true);
      }
    } catch (error) {
      console.error('Erro ao enviar inscrição:', error);
      alert('Erro ao processar inscrição. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎓</span>
              <span className="text-xl font-bold">Centro Educacional Amadeus</span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <button onClick={() => scrollToSection('sobre')} className="hover:text-primary transition-colors">
                Sobre
              </button>
              <button onClick={() => scrollToSection('informacoes')} className="hover:text-primary transition-colors">
                Informações
              </button>
              <button onClick={() => scrollToSection('inscricao')} className="hover:text-primary transition-colors">
                Inscrição
              </button>
              <button onClick={() => scrollToSection('contato')} className="hover:text-primary transition-colors">
                Contato
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
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

      {/* Informações Gerais */}
      <section id="informacoes" className="section-padding">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Informações do Pagamento</h2>
            <p className="text-lg text-muted-foreground">
              Detalhes sobre o processo de pagamento
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Métodos de Pagamento */}
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

            {/* Segurança */}
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

      {/* Seção de Inscrição */}
      <section id="inscricao" className="section-padding bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          {!showForm && (
            <div className="text-center">
              <div className="bg-blue-600 text-white p-8 rounded-lg shadow-xl mb-8">
                <h2 className="text-3xl font-bold mb-4">Pronto para fazer o pagamento?</h2>
                <p className="text-lg mb-6">
                  Clique no botão abaixo para preencher o formulário
                </p>
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
                <CardDescription>
                  Preencha os dados abaixo para realizar o pagamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Dados do Aluno */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Dados do Aluno</h3>
                    
                    <div>
                      <Label htmlFor="studentName">Nome Completo do Aluno *</Label>
                      <Input
                        id="studentName"
                        name="studentName"
                        value={formData.studentName}
                        onChange={handleInputChange}
                        placeholder="Nome completo"
                        required
                        className="mt-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="studentGrade">
                          Série 
                          <span className="text-gray-400 text-sm ml-1">(opcional)</span>
                        </Label>
                        <select
                          id="studentGrade"
                          name="studentGrade"
                          value={formData.studentGrade}
                          onChange={handleInputChange}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm mt-2"
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
                        <Label htmlFor="studentClass">
                          Turma 
                          <span className="text-gray-400 text-sm ml-1">(opcional)</span>
                        </Label>
                        <select
                          id="studentClass"
                          name="studentClass"
                          value={formData.studentClass}
                          onChange={handleInputChange}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm mt-2"
                        >
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
                        id="parentName"
                        name="parentName"
                        value={formData.parentName}
                        onChange={handleInputChange}
                        placeholder="Nome completo"
                        required
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="cpf">
                        CPF do Responsável *
                        {cpfValid && <span className="ml-2 text-green-600">✓ CPF válido</span>}
                      </Label>
                      <Input
                        id="cpf"
                        name="cpf"
                        value={formData.cpf}
                        onChange={handleInputChange}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        required
                        className={`mt-2 ${cpfError ? 'border-red-500' : cpfValid ? 'border-green-500' : ''}`}
                      />
                      {cpfError && (
                        <p className="text-red-500 text-sm mt-1">{cpfError}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">E-mail *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="seu@email.com"
                          required
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="(84) 99999-9999"
                          required
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dados do Pagamento */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Dados do Pagamento</h3>
                    
                    <div>
                      <Label htmlFor="category">Categoria *</Label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm mt-2"
                      >
                        <option value="">Selecione a categoria</option>
                        <option value="Livros">Livros</option>
                        <option value="Material Escolar">Material Escolar</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="paymentAmount">Valor do Pagamento (R$) *</Label>
                      <Input
                        id="paymentAmount"
                        name="paymentAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.paymentAmount}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        required
                        className="mt-2"
                      />
                    </div>

                    {/* CAMPO DE OBSERVAÇÕES */}
                    <div>
                      <Label htmlFor="observations">
                        Observações 
                        <span className="text-gray-400 text-sm ml-1">(opcional)</span>
                      </Label>
                      <textarea
                        id="observations"
                        name="observations"
                        value={formData.observations}
                        onChange={handleInputChange}
                        placeholder="Digite aqui qualquer informação adicional que julgar necessária..."
                        rows="4"
                        maxLength="500"
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm mt-2 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Este campo é opcional. Máximo de 500 caracteres.
                      </p>
                    </div>

                    {/* TOGGLE COM JUROS / SEM JUROS */}
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <Label className="text-sm font-medium mb-3 block">
                        Aplicar Taxas de Cartão de Crédito?
                      </Label>
                      <div className="flex items-center space-x-4">
                        <div
                          className={`flex-1 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.hasInterest === false
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, hasInterest: false }))}
                        >
                          <div className="flex items-center justify-center">
                            <span className="text-sm font-medium">Sem Juros</span>
                          </div>
                        </div>
                        <div
                          className={`flex-1 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.hasInterest === true
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
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
                          ? 'Taxas de 2,99% a 3,99% + R$ 0,49 serão aplicadas ao cartão de crédito'
                          : 'Nenhuma taxa adicional será aplicada'}
                      </p>
                    </div>

                    {/* MÉTODO DE PAGAMENTO */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Método de Pagamento *</Label>
                      <div className="space-y-3">
                        <div 
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.paymentMethod === 'pix' 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'pix', installments: 1 }))}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                                formData.paymentMethod === 'pix' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                              }`}>
                                {formData.paymentMethod === 'pix' && (
                                  <div className="w-full h-full rounded-full bg-green-500"></div>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm">📱</span>
                                  <span className="text-sm font-medium">PIX</span>
                                </div>
                                <div className="text-xs text-gray-600 ml-6">
                                  (pagamento à vista)
                                </div>
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
                          <option value={1}>1x de {formatCurrency(calculateInstallmentValue(1))}</option>
                          <option value={2}>2x de {formatCurrency(calculateInstallmentValue(2))}</option>
                          <option value={3}>3x de {formatCurrency(calculateInstallmentValue(3))}</option>
                          <option value={4}>4x de {formatCurrency(calculateInstallmentValue(4))}</option>
                          <option value={5}>5x de {formatCurrency(calculateInstallmentValue(5))}</option>
                          <option value={6}>6x de {formatCurrency(calculateInstallmentValue(6))}</option>
                          <option value={7}>7x de {formatCurrency(calculateInstallmentValue(7))}</option>
                          <option value={8}>8x de {formatCurrency(calculateInstallmentValue(8))}</option>
                          <option value={9}>9x de {formatCurrency(calculateInstallmentValue(9))}</option>
                          <option value={10}>10x de {formatCurrency(calculateInstallmentValue(10))}</option>
                          <option value={11}>11x de {formatCurrency(calculateInstallmentValue(11))}</option>
                          <option value={12}>12x de {formatCurrency(calculateInstallmentValue(12))}</option>
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
























