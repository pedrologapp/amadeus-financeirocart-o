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
  UserPlus
} from 'lucide-react';
// Importando as imagens
import interiorImage1 from './assets/desfie1.jpg';
import interiorImage2 from './assets/desfile2.jpg';
import jardimImage from './assets/desfile3.jpg';

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

  // Cálculo de preço atualizado
  const calculatePrice = () => {
    const PRECO_BASE = 20.0;
    
    let valorTotal = PRECO_BASE;
    
    if (formData.paymentMethod === 'credit') {
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
    return { valorTotal, valorParcela };
  };

  const { valorTotal, valorParcela } = calculatePrice();

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
      const response = await fetch('https://webhook.escolaamadeus.com/webhook/amadeuseventos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentName: formData.studentName,
          studentGrade: formData.studentGrade,
          studentClass: formData.studentClass,
          parentName: formData.parentName,
          cpf: formData.cpf,
          email: formData.email,
          phone: formData.phone,
          paymentMethod: formData.paymentMethod,
          installments: formData.installments,
          amount: valorTotal,
          timestamp: new Date().toISOString(),
          event: 'Amadeus-Desfile7setembro'
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
              <button onClick={() => scrollToSection('sobre')} className="text-sm hover:text-primary transition-colors">Sobre</button>
              <button onClick={() => scrollToSection('Programação do Evento')} className="text-sm hover:text-primary transition-colors">Programação do Evento</button>
              <button onClick={() => scrollToSection('custos')} className="text-sm hover:text-primary transition-colors">Custos</button>
              <button onClick={() => scrollToSection('Observação')} className="text-sm hover:text-primary transition-colors">Observação</button>
              <button onClick={() => scrollToSection('orientacoes')} className="text-sm hover:text-primary transition-colors">Orientações</button>
              <button onClick={() => scrollToSection('contato')} className="text-sm hover:text-primary transition-colors">Contato</button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section min-h-screen flex items-center justify-center text-white relative">
        <div className="text-center z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Desfile de 7 de Setembro
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            É com grande alegria que convidamos toda a nossa comunidade escolar a participar do tradicional Desfile Cívico em comemoração à independência do Brasil.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-primary px-8 py-3 bg-white text-primary"
              onClick={() => scrollToSection("sobre")}
            >
              Saiba Mais
            </Button>
          </div>
          <div className="mt-12 flex justify-center items-center space-x-8 text-sm">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              14 de Setembro de 2025 - a partir das 13h
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Percurso: Rua Arari até Av. Maranhão - São Gonçalo do Amarante - RN
            </div>
          </div>
        </div>
      </section>

      {/* Sobre o Passeio */}
      <section id="sobre" className="section-padding bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 gradient-text">Tema do Desfile</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              <strong>"CONECTAMOS HOJE, ESCREVEREMOS O AMANHÃ"</strong>
            </p>
          </div>
          <div className="flex justify-center">
            <div className="grid grid-cols-2 gap-4 max-w-2xl">
              <img src={interiorImage1} alt="Interior do Instituto" className="rounded-lg shadow-lg h-48 w-full object-cover" />
              <img src={interiorImage2} alt="Coleções do Instituto" className="rounded-lg shadow-lg h-48 w-full object-cover" />
              <img src={jardimImage} alt="Jardins do Instituto" className="rounded-lg shadow-lg col-span-2 h-64 w-full object-cover" />
            </div>
          </div>
        </div>
      </section>
      
      {/* Itinerário */}
      <section id="itinerario" className="section-padding bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Programação do Evento</h2>
            <p className="text-lg text-muted-foreground">
              Confira o cronograma do nosso desfile
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="card-hover">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>13:00</CardTitle>
                <CardDescription>Horário</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-center">
                  Horário de concentração, no Centro Educacional Amadeus
                </p>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-accent/10 rounded-full w-fit">
                  <MapPin className="h-8 w-8 text-accent" />
                </div>
                <CardTitle>Percurso</CardTitle>
                {/*   <CardDescription>Atividades e diversão</CardDescription>  */}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-center">
                  Rua Arari - Rua Cururupu - Rua Carolina - Avenida Maranhão (Encerramento com o Hino Nacional)
                </p>
              </CardContent>
            </Card>
          </div>
           {/*
          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-2 bg-white p-4 rounded-lg shadow-sm">
              <Bus className="h-5 w-5 text-primary" />
              <span className="font-medium">Término previsto às 17:00</span>
            </div>
          </div>
          */}
        </div>
      </section>

      {/* Documentação */}
      <section id="documentacao" className="section-padding bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trajes e Bonificação</h2>
            <p className="text-lg text-muted-foreground">
              Confira as opções de trajes e suas respectivas bonificações
            </p>
          </div>

          <div className="mt-8 p-6 bg-accent/10 rounded-lg border border-accent/20">
            <div className="space-y-4">
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm">
                    <strong>Fantasia à escolha (de acordo com o tema da sala):</strong> Bonificação de <strong>1,0 ponto</strong> em todas as disciplinas. Ala no desfile: Alunos de fantasia.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm">
                    <strong>Fardamento completo:</strong> Bonificação de <strong>2,0 pontos</strong>, a ser distribuída em uma ou duas disciplinas. Ala no desfile: Alunos de Farda.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm">
                    <strong>Esporte: terno ou fantasia: </strong> Bonificação de <strong>1,0 ponto</strong> em todas as disciplinas. O aluno irá de terno ou de fantasia do esporte (Ballet, Karatê, Futsal ou Handbol).
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm">
                    <strong>Lembrando:</strong> A fantasia será usada novamente na culminancia do projeto em novembro.
                  </p>
                </div>
              </div>
              
               <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm">
                    <strong>Recomendação:</strong> prefiram tecidos com brilho (lamê brocado, tule) e espuma de 3 mm para garantir leveza e destaque. Verificar sugestôes com os professores.
                  </p>
                </div>
              </div>
          
            </div>
          </div>
        </div>
      </section>

        
      {/* Custos e Pagamento */}
      <section id="custos" className="section-padding bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Inscrição e Taxa</h2>
            <p className="text-lg text-muted-foreground">
              Valor único por Aluno
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-primary">R$ 20,00</CardTitle>
              <CardDescription>por aluno</CardDescription>
              {/* 
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <UserPlus className="inline h-4 w-4 mr-1" />
                  <strong>Acompanhantes adicionais:</strong> R$ 20,00 cada 
                </p>
              </div>
             */}
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-accent">O que está incluído:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-accent mr-2" />
                      Bandas convidadas;
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-accent mr-2" />
                      Banners;
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-accent mr-2" />
                      Carro de som;
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-accent mr-2" />
                      Insfraestrutura de apoio;
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-accent mr-2" />
                      Decoração do desfile.
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-destructive">Informações importantes:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <Shield className="h-4 w-4 text-destructive mr-2 mt-0.5" />
                      Pagamento obrigatório até 10 de setembro de 2025;
                    </li>
                    <li className="flex items-start">
                      <Shield className="h-4 w-4 text-destructive mr-2 mt-0.5" />
                      Cada aluno deve desfilar acompanhado de um responsável;
                    </li>
                    <li className="flex items-start">
                      <Shield className="h-4 w-4 text-destructive mr-2 mt-0.5" />
                      Alimentação: não será permitido oferecer alimentos durante o percurso (a não ser que haja alguma emergência). Os alunos poderão levar apenas garrafas com água. 
                    </li>
                  </ul>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="text-center">
                {!showForm ? (
                  <Button 
                    size="lg" 
                    className="bg-orange-600 hover:bg-orange-700 px-8 py-3"
                    onClick={showInscricaoForm}
                  >
                    Realizar Inscrição e Pagamento
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
                  Formulário de Inscrição
                </CardTitle>
                <CardDescription>
                  Preencha todos os dados para garantir sua participação
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
                           {/* 
								<option value="Maternal II">Maternal II</option>
                            <option value="Maternal III">Maternal III</option>
                            <option value="Grupo 4">Grupo 4</option>
                            <option value="Grupo 5">Grupo 5</option>
                            <option value="1º Ano">1º Ano</option>
                            <option value="2º Ano">2º Ano</option>
                            <option value="3º Ano">3º Ano</option>
							*/}
							<option value="4º Ano">4º Ano</option>
							<option value="5º Ano">5º Ano</option>
							<option value="6º Ano">6º Ano</option>
							<option value="7º Ano">7º Ano</option>
							<option value="8º Ano">8º Ano</option>
							<option value="9º Ano">9º Ano</option>
                          </select>
                        </div>
                        {/* 
                        <div>
                          <Label htmlFor="studentClass">Turma do Aluno *</Label>
                          <Input
                            id="studentClass"
                            name="studentClass"
                            value={formData.studentClass}
                            onChange={handleInputChange}
                            required
                            placeholder="Ex: A, B, C"
                          />
                        </div>
                        Dados do Aluno */}
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

                      {/* NOVA SEÇÃO: CATEGORIA */}
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
                          <option value="livros">Livros</option>
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

                  {/* 
                  Acompanhantes Adicionais
                  <div>
                    <div className="space-y-4">
                      <div>
                        <Label>Acompanhantes Adicionais</Label>
                        <p className="text-sm text-gray-600 mb-3">
                          Cada inscrição já inclui: Aluno + Pai + Mãe (3 pessoas)
                        </p>
                        
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div>
                            <div className="font-medium">Adicionar mais acompanhantes</div>
                            <div className="text-sm text-gray-600">R$ 20,00 por pessoa adicional</div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={decreaseCompanions}
                              disabled={formData.additionalCompanions === 0}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-semibold">
                              {formData.additionalCompanions}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={increaseCompanions}
                              disabled={formData.additionalCompanions === 5}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {formData.additionalCompanions > 0 && (
                          <div className="text-sm">
                            <span className="text-green-600 font-medium">
                              + R$ {(formData.additionalCompanions * 20).toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {formData.additionalCompanions > 0 && (
                        <div className="mt-3 text-xs text-blue-700">
                          <strong>Total de pessoas no evento:</strong> {3 + formData.additionalCompanions} pessoas
                          <br />
                          <strong>Composição:</strong> Aluno + Pai + Mãe + {formData.additionalCompanions} acompanhante{formData.additionalCompanions > 1 ? 's' : ''} adicional{formData.additionalCompanions > 1 ? 'is' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                  */}

                  {/* SEÇÃO DE PAGAMENTO MODIFICADA */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Informações de Pagamento *</h3>
                    
                    {/* CAMPO PARA DIGITAR O VALOR */}
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

                    {/* OPÇÃO COM OU SEM JUROS */}
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
                            <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                              formData.hasInterest === false ? 'border-green-400 bg-green-400' : 'border-gray-300'
                            }`}>
                              {formData.hasInterest === false && (
                                <div className="w-full h-full rounded-full bg-green-400"></div>
                              )}
                            </div>
                            <div>
                              <span className="font-medium">Sem Juros</span>
                              <p className="text-xs text-gray-600">Pagamento sem acréscimos</p>
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
                            <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                              formData.hasInterest === true ? 'border-orange-400 bg-orange-400' : 'border-gray-300'
                            }`}>
                              {formData.hasInterest === true && (
                                <div className="w-full h-full rounded-full bg-orange-400"></div>
                              )}
                            </div>
                            <div>
                              <span className="font-medium">Com Juros</span>
                              <p className="text-xs text-gray-600">Pagamento parcelado com acréscimos</p>
                            </div>
                          </div>
                        </div>
                      </div>
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
                          onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'pix', installments: 1 }))}
                        >
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
                          <option value={1}>1x de R$ {(parseFloat(formData.paymentAmount) / 1).toFixed(2).replace('.', ',')}</option>          
                          <option value={2}>2x de R$ {(parseFloat(formData.paymentAmount) / 2).toFixed(2).replace('.', ',')}</option>					        
                          <option value={3}>3x de R$ {(parseFloat(formData.paymentAmount) / 3).toFixed(2).replace('.', ',')}</option>						        
                          <option value={4}>4x de R$ {(parseFloat(formData.paymentAmount) / 4).toFixed(2).replace('.', ',')}</option>
                        </select>
                      </div>
                    )}

                    {/* RESUMO DO VALOR */}
                    {formData.paymentAmount > 0 && (
                      <div className="bg-orange-100 p-4 rounded-lg border border-orange-200">
                        <div className="text-center">
                          <h4 className="text-lg font-bold text-orange-800 mb-1">Resumo do Pagamento</h4>
                          <div className="text-2xl font-bold text-orange-900">
                            R$ {parseFloat(formData.paymentAmount).toFixed(2).replace('.', ',')}
                          </div>
                          {formData.paymentMethod === 'credit' && formData.installments > 1 && (
                            <div className="text-sm text-orange-700 mt-1">
                              {formData.installments}x de R$ {(parseFloat(formData.paymentAmount) / formData.installments).toFixed(2).replace('.', ',')}
                            </div>
                          )}
                          <div className="text-xs text-orange-600 mt-2">
                            {formData.hasInterest === false ? '✓ Sem juros' : '⚠ Com juros'}
                          </div>
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
































