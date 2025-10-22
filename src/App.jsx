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
  Utensils,
  XCircle,      // <- Adicione este
  AlertTriangle
} from 'lucide-react';
// Importando as imagens
import interiorImage1 from './assets/happy1.jpg';
import interiorImage2 from './assets/happy2.jpg';
import jardimImage from './assets/happy3.jpg';

function App() {
  // Estados para o formulário
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    studentGrade: '',
    studentClass: '',
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
    const PRECO_BASE = 280.0;
    
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
          event: 'Amadeus-venezapark'
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
            Veneza Water Park
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Em comemoração ao Dia da Criança, realizaremos um passeio especial para o Veneza Park Aquático!
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
              18 de Outubro de 2025 - dia todo.
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Veneza Water Park, Pernambuco.
            </div>
          </div>
        </div>
      </section>

      {/* Sobre o Passeio */}
      <section id="sobre" className="section-padding bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 gradient-text">Sobre o Evento</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
             o Veneza Water Park é o maior parque aquático de Pernambuco. Com 90 mil metros quadrados de área, um complexo gastronômico para todos os gostos e mais de trinta atrações entre radicais e relaxantes, o parque compõe o equipamento turístico mais importante do estado.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-6">Uma Experiência Única</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <p>Espaço com segurança e comodidade</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <p>praça de alimentação com oito lanchonetes</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <p>Posto médico que conta com médico, paramédico, enfermeira e ambulância de plantão</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <p>Diversão, segurança e tranquilidade</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
            <h2 className="text-4xl font-bold mb-4">Sobre o passeio</h2>
            <p className="text-lg text-muted-foreground">
              Confira as informações do nosso passeio
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="card-hover">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Data e Horário</CardTitle>
                <CardDescription>Horário</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-center">
                  Saída: 03h da manhã
                </p>
                <p className="text-sm text-center">
                  Retorno previsto: 23h do mesmo dia
                </p>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-accent/10 rounded-full w-fit">
                  <MapPin className="h-8 w-8 text-accent" />
                </div>
                <CardTitle>Local</CardTitle>
                {/*   <CardDescription>Atividades e diversão</CardDescription>  */}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-center">
                  Veneza Water Park - Avenida Dr. Claudio José Gueiros Leite, 10050, Maria Farinha, Paulista – PE
                </p>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-green-500/10 rounded-full w-fit">
                  <Utensils className="h-8 w-8 text-green-500" />
                </div>
                <CardTitle>Lanches Permitidos</CardTitle>
                <CardDescription>Para entrada no parque</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm list-disc list-inside space-y-1 text-left">
                  <li>Biscoitos, salgadinhos, sucos de caixinha e frutas</li>
                  <li>Bolos (comemorativos ou em fatias)</li>
                  <li>Água mineral em garrafas próprias</li>
                  <li>Refrigerantes em lata</li>
                  <li>Todos os itens devem ser transportados em bolsas ou bolsas térmicas</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardHeader className="text-center">
				<div className="mx-auto mb-4 p-3 bg-red-500/10 rounded-full w-fit">
 					 <XCircle className="h-8 w-8 text-red-500" />
					</div>
                <CardTitle>NÃO é Permitidos</CardTitle>
                <CardDescription>Regras</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm list-disc list-inside space-y-1 text-left">
                  <li>Não é permitido o manuseio de alimentos in natura</li>
                  <li>Não serão aceitos: embalagens não industriais, recipientes ou embalagens de vidro, coolers, isopores, garrafas PET (exceto água), objetos cortantes ou perfurantes.</li>
                </ul>
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
            <h2 className="text-4xl font-bold mb-4">Observações importantes</h2>
          </div>

          <div className="mt-8 p-6 bg-accent/10 rounded-lg border border-accent/20">
            <div className="space-y-4">
              
			<div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm">
                  O transporte está incluso no pacote.  
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm">
                    O não comparecimento do aluno no dia do evento não acarretará em reembolso do valor pago. 
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm">
                   Almoço e lanche poderão ser comprados no park.
                  </p>
                </div>
              </div>    
          
            </div>
          </div>
        </div>
      </section>

				{/* Alimentação Opcional */}
      <section id="alimentacao" className="section-padding bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Alimentação Opcional</h2>
			  <p className="text-lg text-muted-foreground">
              Esses são os valores do Veneza Park
            </p>
          </div>

		     <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3 mb-4">
                <Shield className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-2">Informações Importantes</h3>
                  <div className="space-y-2 text-sm text-yellow-700">
                    <p>• Os kits de alimentação são <strong>opcionais</strong> e devem ser pagos separadamente</p>
                    <p>• O pagamento deverá ser feito <strong>diretamente na escola</strong></p>
                    <p>• Prazo para pagamento: até <strong>3 dias úteis antes da visita</strong></p>
                    <p>• Você pode escolher quantos kits desejar ou nenhum</p>
                    <p>• Também é possível levar seus próprios lanches (conforme regras do parque)</p>
                  </div>
                </div>
              </div>
              <div className="text-center pt-4 border-t border-yellow-200">
                <p className="text-sm font-medium text-yellow-800">
                  Para contratar os kits de alimentação, procure a secretaria da escola após confirmar sua inscrição no passeio
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="card-hover border-orange-200">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-fit">
                  <Utensils className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-orange-800">Kit Almoço Grupo</CardTitle>
                <CardDescription>Self service até 1kg</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">R$ 75,00</div>
                <p className="text-sm text-muted-foreground mb-4">por pessoa</p>
                <ul className="text-sm space-y-1 text-left">
                  <li>• Self service (até 1kg)</li>
                  <li>• Loja Veneza Sabores</li>
                  <li>• 1 refrigerante em lata ou suco Del Valle</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-hover border-green-200">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                  <Utensils className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-green-800">Kit Lanche 1</CardTitle>
                <CardDescription>Opção completa</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">R$ 15,00</div>
                <p className="text-sm text-muted-foreground mb-4">por pessoa</p>
                <ul className="text-sm space-y-1 text-left">
                  <li>• Coxinha</li>
                  <li>• Fatia de pizza mussarela</li>
                  <li>• Espetinho de carne ou frango</li>
                  <li>• 1 refrigerante em lata</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-hover border-blue-200">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                  <Utensils className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-blue-800">Kit Lanche 2</CardTitle>
                <CardDescription>Hambúrguer</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">R$ 20,00</div>
                <p className="text-sm text-muted-foreground mb-4">por pessoa</p>
                <ul className="text-sm space-y-1 text-left">
                  <li>• Cheeseburguer</li>
                  <li>• 1 refrigerante em lata</li>
                </ul>
              </CardContent>
            </Card>
          </div>

     
        </div>
      </section>
		
      {/* Custos e Pagamento */}
      <section id="custos" className="section-padding bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Inscrição e Taxa</h2>
            <p className="text-lg text-muted-foreground">
              Valor único por Aluno - À vista ou em até 4x no cartão. 
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-primary">R$ 280,00</CardTitle>
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
                      Transporte ida e volta.
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-accent mr-2" />
                      Entrada para o park.
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-destructive">Informações importantes:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <Shield className="h-4 w-4 text-destructive mr-2 mt-0.5" />
                      Pagamento obrigatório até 10 de Outubro de 2025;
                    </li>
                    <li className="flex items-start">
                      <Shield className="h-4 w-4 text-destructive mr-2 mt-0.5" />
                      O fardamento da escola não será usado nesse passeio, roupas apropriadas livre.
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
                            <p className="text-red-500 text-sm mt-1 flex items-center">
                              <span className="mr-1">⚠️</span>
                              {cpfError}
                            </p>
                          )}
                          {cpfValid && !cpfError && (
                            <p className="text-green-600 text-sm mt-1 flex items-center">
                              <span className="mr-1">✅</span>
                              CPF válido
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seção de Acompanhantes Adicionais 
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <UserPlus className="mr-2 h-5 w-5" />
                      Acompanhantes Adicionais
                    </h3>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                      <p className="text-sm text-blue-800 mb-3">
                        O pacote básico já inclui <strong>pai, mãe e filho</strong>. Você pode adicionar até 5 acompanhantes extras por apenas R$ 20,00 cada.
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Label className="text-sm font-medium">Quantidade de acompanhantes adicionais:</Label>
                          <div className="flex items-center space-x-2">
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
                  {/* Método de Pagamento */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Método de Pagamento*</h3>
                    
                    <div className="space-y-3 mb-6">
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
                            <span className="text-sm">
                              R$ {(280).toFixed(2).replace('.', ',')} (sem taxas)
                            </span>
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
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {formData.paymentMethod === 'credit' && (
                      <div className="mb-6">
                        <Label className="text-sm font-medium">Número de Parcelas</Label>
                        <select
                          value={formData.installments}
                          onChange={(e) => setFormData(prev => ({ ...prev, installments: parseInt(e.target.value) }))}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm mt-2"
                        >
                          <option value={1}>1x de R$ {(valorTotal / 1).toFixed(2).replace('.', ',')}</option>          
                          <option value={2}>2x de R$ {(valorTotal / 2).toFixed(2).replace('.', ',')}</option>					        
                          <option value={3}>3x de R$ {(valorTotal / 3).toFixed(2).replace('.', ',')}</option>						        
                          <option value={4}>4x de R$ {(valorTotal / 4).toFixed(2).replace('.', ',')}</option>
                        </select>
                      </div>
                    )}

                    {/* Valor Total */}
                    <div className="bg-orange-100 p-4 rounded-lg border border-orange-200">
                      <div className="text-center">
                        <h4 className="text-lg font-bold text-orange-800 mb-1">Valor Total</h4>
                        <div className="text-2xl font-bold text-orange-900">
                          R$ {valorTotal.toFixed(2).replace('.', ',')}
                        </div>
                        {formData.paymentMethod === 'credit' && formData.installments > 1 && (
                          <div className="text-sm text-orange-700 mt-1">
                            {formData.installments}x de R$ {valorParcela.toFixed(2).replace('.', ',')}
                          </div>
                        )}
                      </div>
                    </div>
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













































