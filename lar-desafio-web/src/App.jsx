import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Phone, 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  Server, 
  CheckCircle, 
  XCircle, 
  UserPlus, 
  RefreshCw, 
  PhoneCall, 
  ChevronDown, 
  ChevronUp, 
  Settings, 
  Calendar, 
  ShieldCheck,
  AlertCircle,
  X,
  LayoutDashboard,
  UserCheck,
  UserX,
  Lock,
  LogOut,
  User,
  Key
} from 'lucide-react';

// --- INITIAL MOCK DATA ---
const INITIAL_PESSOAS = [
  {
    id: 1,
    nome: "Mariana Albuquerque da Silva",
    cpf: "111.444.777-35",
    dataNascimento: "1988-04-12",
    ativo: true,
    telefones: [
      { id: 1, numero: "(11) 98765-4321", tipo: "Celular", pessoaId: 1 },
      { id: 2, numero: "(11) 3214-5678", tipo: "Comercial", pessoaId: 1 }
    ]
  },
  {
    id: 2,
    nome: "Lucas Gabriel Ferreira",
    cpf: "222.555.888-20",
    dataNascimento: "2001-09-25",
    ativo: true,
    telefones: [
      { id: 3, numero: "(21) 99887-6655", tipo: "Celular", pessoaId: 2 }
    ]
  },
  {
    id: 3,
    nome: "Roberto Mendes de Aragão",
    cpf: "333.666.999-06",
    dataNascimento: "1965-11-03",
    ativo: false,
    telefones: []
  }
];

// --- HELPER MASKS & VALIDATIONS ---
const maskCPF = (value) => {
  if (!value) return '';
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const maskPhone = (value) => {
  if (!value) return '';
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
};

const validateCPF = (cpf) => {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits.charAt(i)) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(digits.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits.charAt(i)) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(digits.charAt(10))) return false;

  return true;
};

// MAIN APP COMPONENT
export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('lar_authenticated') === 'true';
  });
  const [loginUser, setLoginUser] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data State
  const [pessoas, setPessoas] = useState(() => {
    const local = localStorage.getItem('lar_pessoas');
    return local ? JSON.parse(local) : INITIAL_PESSOAS;
  });
  
  const [useLiveApi, setUseLiveApi] = useState(false);
  const [apiUrl, setApiUrl] = useState('https://localhost:7282/api');
  const [apiConnected, setApiConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [phoneModalPessoa, setPhoneModalPessoa] = useState(null);
  const [newPhoneData, setNewPhoneData] = useState({ numero: '', tipo: 'Celular' });

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    dataNascimento: '',
    ativo: true,
    telefones: []
  });

  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem('lar_pessoas', JSON.stringify(pessoas));
  }, [pessoas]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Login Handler
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginUser === 'admin' && loginPassword === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('lar_authenticated', 'true');
      setLoginError('');
      showToast("Autenticado com sucesso! Bem-vindo.", "success");
    } else {
      setLoginError('Usuário ou senha incorretos.');
    }
  };

  // Logout Handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('lar_authenticated');
    setLoginUser('');
    setLoginPassword('');
    showToast("Sessão encerrada.", "success");
  };

  const checkApiConnection = async () => {
    if (!useLiveApi || !isAuthenticated) {
      setApiConnected(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/Pessoas`, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        setPessoas(data);
        setApiConnected(true);
        showToast("Conectado à API .NET com sucesso!", "success");
      } else {
        setApiConnected(false);
        showToast("Não foi possível conectar à API. Modo Mock mantido.", "error");
      }
    } catch (err) {
      setApiConnected(false);
      showToast("Falha de conexão com a API .NET Backend.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (useLiveApi && isAuthenticated) {
      checkApiConnection();
    }
  }, [useLiveApi, apiUrl, isAuthenticated]);

  const metrics = useMemo(() => {
    const ativas = pessoas.filter(p => p.ativo).length;
    const inativas = pessoas.filter(p => !p.ativo).length;
    const totalTelefones = pessoas.reduce((acc, p) => acc + (p.telefones ? p.telefones.length : 0), 0);
    return { ativas, inativas, totalPessoas: pessoas.length, totalTelefones };
  }, [pessoas]);

  const filteredPessoas = useMemo(() => {
    return pessoas.filter(p => {
      const term = searchTerm.toLowerCase();
      const matchesNameOrCpf = p.nome.toLowerCase().includes(term) || p.cpf.includes(term);
      const matchesPhone = p.telefones && p.telefones.some(t => t.numero.includes(term));
      const matchesSearch = matchesNameOrCpf || matchesPhone;

      const matchesStatus = 
        filterStatus === 'all' ? true :
        filterStatus === 'active' ? p.ativo :
        !p.ativo;

      return matchesSearch && matchesStatus;
    });
  }, [pessoas, searchTerm, filterStatus]);

  const handleOpenNewForm = () => {
    setEditingId(null);
    setFormData({
      nome: '',
      cpf: '',
      dataNascimento: '',
      ativo: true,
      telefones: [{ id: Date.now(), numero: '', tipo: 'Celular' }]
    });
    setActiveTab('form');
  };

  const handleOpenEditForm = (pessoa) => {
    setEditingId(pessoa.id);
    setFormData({
      nome: pessoa.nome,
      cpf: pessoa.cpf,
      dataNascimento: pessoa.dataNascimento ? pessoa.dataNascimento.split('T')[0] : '',
      ativo: pessoa.ativo,
      telefones: pessoa.telefones && pessoa.telefones.length > 0
        ? pessoa.telefones.map(t => ({ ...t }))
        : [{ id: Date.now(), numero: '', tipo: 'Celular' }]
    });
    setActiveTab('form');
  };

  const handleAddPhoneField = () => {
    setFormData(prev => ({
      ...prev,
      telefones: [...prev.telefones, { id: Date.now(), numero: '', tipo: 'Celular' }]
    }));
  };

  const handleRemovePhoneField = (index) => {
    setFormData(prev => ({
      ...prev,
      telefones: prev.telefones.filter((_, i) => i !== index)
    }));
  };

  const handlePhoneChange = (index, field, value) => {
    const updatedPhones = [...formData.telefones];
    if (field === 'numero') {
      updatedPhones[index].numero = maskPhone(value);
    } else {
      updatedPhones[index][field] = value;
    }
    setFormData(prev => ({ ...prev, telefones: updatedPhones }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      showToast("O nome é obrigatório.", "error");
      return;
    }

    const unmaskedCPF = formData.cpf.replace(/\D/g, '');
    if (!validateCPF(unmaskedCPF)) {
      showToast("CPF inválido. Verifique os dígitos informados.", "error");
      return;
    }

    const validPhones = formData.telefones
      .filter(t => t.numero.trim().length > 0)
      .map(t => ({
        id: typeof t.id === 'number' && t.id > 1000000000000 ? 0 : t.id,
        numero: t.numero,
        tipo: t.tipo,
        pessoaId: editingId || 0
      }));

    if (useLiveApi && apiConnected) {
      try {
        setLoading(true);
        if (editingId) {
          const resPessoa = await fetch(`${apiUrl}/Pessoas/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nome: formData.nome,
              cpf: unmaskedCPF,
              dataNascimento: formData.dataNascimento,
              ativo: formData.ativo
            })
          });

          if (!resPessoa.ok) throw new Error("Erro ao atualizar pessoa");
          showToast("Pessoa atualizada com sucesso no backend!", "success");
        } else {
          const resPessoa = await fetch(`${apiUrl}/Pessoas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nome: formData.nome,
              cpf: unmaskedCPF,
              dataNascimento: formData.dataNascimento
            })
          });

          if (!resPessoa.ok) throw new Error("Erro ao cadastrar pessoa");
          const newPessoaData = await resPessoa.json();

          for (const phone of validPhones) {
            await fetch(`${apiUrl}/Telefones`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                numero: phone.numero,
                tipo: phone.tipo,
                pessoaId: newPessoaData.id
              })
            });
          }

          showToast("Pessoa e Telefones cadastrados com sucesso!", "success");
        }
        await checkApiConnection();
        setActiveTab('list');
      } catch (err) {
        showToast(err.message || "Erro na integração com a API", "error");
      } finally {
        setLoading(false);
      }
    } else {
      if (editingId) {
        setPessoas(prev => prev.map(p => {
          if (p.id === editingId) {
            return {
              ...p,
              nome: formData.nome,
              cpf: maskCPF(formData.cpf),
              dataNascimento: formData.dataNascimento,
              ativo: formData.ativo,
              telefones: validPhones.map((t, idx) => ({
                id: t.id || Date.now() + idx,
                numero: t.numero,
                tipo: t.tipo,
                pessoaId: editingId
              }))
            };
          }
          return p;
        }));
        showToast("Cadastro de pessoa atualizado com sucesso!", "success");
      } else {
        const newId = pessoas.length > 0 ? Math.max(...pessoas.map(p => p.id)) + 1 : 1;
        const newPessoa = {
          id: newId,
          nome: formData.nome,
          cpf: maskCPF(formData.cpf),
          dataNascimento: formData.dataNascimento,
          ativo: formData.ativo,
          telefones: validPhones.map((t, idx) => ({
            id: Date.now() + idx,
            numero: t.numero,
            tipo: t.tipo,
            pessoaId: newId
          }))
        };
        setPessoas(prev => [newPessoa, ...prev]);
        showToast("Nova pessoa e telefones cadastrados com sucesso!", "success");
      }
      setActiveTab('list');
    }
  };

  const handleQuickAddPhone = async (e) => {
    e.preventDefault();
    if (!newPhoneData.numero.trim()) {
      showToast("Informe o número do telefone.", "error");
      return;
    }

    const formattedNumber = maskPhone(newPhoneData.numero);

    if (useLiveApi && apiConnected) {
      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/Telefones`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            numero: formattedNumber,
            tipo: newPhoneData.tipo,
            pessoaId: phoneModalPessoa.id
          })
        });
        if (!res.ok) throw new Error("Erro ao salvar telefone na API.");
        showToast("Telefone adicionado com sucesso!", "success");
        await checkApiConnection();
      } catch (err) {
        showToast(err.message || "Erro na API", "error");
      } finally {
        setLoading(false);
      }
    } else {
      setPessoas(prev => prev.map(p => {
        if (p.id === phoneModalPessoa.id) {
          const newPhone = {
            id: Date.now(),
            numero: formattedNumber,
            tipo: newPhoneData.tipo,
            pessoaId: p.id
          };
          return { ...p, telefones: [...(p.telefones || []), newPhone] };
        }
        return p;
      }));
      showToast("Telefone adicionado com sucesso!", "success");
    }

    setPhoneModalPessoa(null);
    setNewPhoneData({ numero: '', tipo: 'Celular' });
  };

  const handleToggleStatus = async (pessoa) => {
    const updatedStatus = !pessoa.ativo;
    
    if (useLiveApi && apiConnected) {
      try {
        if (!updatedStatus) {
          await fetch(`${apiUrl}/Pessoas/${pessoa.id}`, { method: 'DELETE' });
        } else {
          await fetch(`${apiUrl}/Pessoas/${pessoa.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...pessoa, ativo: true })
          });
        }
        checkApiConnection();
        showToast(`Status de ${pessoa.nome} alterado com sucesso!`);
      } catch (err) {
        showToast("Erro ao alterar status no servidor", "error");
      }
    } else {
      setPessoas(prev => prev.map(p => p.id === pessoa.id ? { ...p, ativo: updatedStatus } : p));
      showToast(`Status de ${pessoa.nome} alterado para ${updatedStatus ? 'Ativo' : 'Inativo'}.`);
    }
  };

  const handleDeletePermanent = async (id, name) => {
    if (!window.confirm(`Tem certeza de que deseja remover permanentemente ${name}?`)) return;

    if (useLiveApi && apiConnected) {
      try {
        await fetch(`${apiUrl}/Pessoas/${id}`, { method: 'DELETE' });
        checkApiConnection();
        showToast("Pessoa excluída permanentemente.", "success");
      } catch (err) {
        showToast("Erro ao excluir pessoa na API.", "error");
      }
    } else {
      setPessoas(prev => prev.filter(p => p.id !== id));
      showToast("Pessoa removida do sistema.", "success");
    }
  };

  // -------------------------------------------------------------
  // RENDERIZAÇÃO CONDICIONAL: TELA DE LOGIN (PROTEÇÃO DE ACESSO)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-center items-center p-4 relative overflow-hidden">
        {/* Curved Yellow Graphic Element Inspired by Lar Cooperativa Branding */}
        <svg className="absolute -top-10 -left-10 w-[600px] h-[600px] pointer-events-none opacity-20 z-0" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-50 250C50 100 250 50 350 200C450 350 200 450 100 350C0 250 150 100 400 150" stroke="#F5A000" strokeWidth="24" strokeLinecap="round"/>
        </svg>
        <svg className="absolute -bottom-20 -right-20 w-[700px] h-[400px] pointer-events-none opacity-20 z-0" viewBox="0 0 700 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 200C200 150 400 250 700 180" stroke="#F5A000" strokeWidth="28" strokeLinecap="round"/>
        </svg>

        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="bg-[#E52320] w-14 h-14 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-[#2D2926] uppercase tracking-wide">Área Restrita</h1>
            <p className="text-xs text-slate-500 font-medium"> Acesso Administrativo</p>
          </div>

          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Usuário</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Informe seu usuário"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#F5A000] focus:ring-1 focus:ring-[#F5A000] transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Senha</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#F5A000] focus:ring-1 focus:ring-[#F5A000] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#E52320] hover:bg-red-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest shadow-md transition"
            >
              Entrar no Sistema
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 font-mono">Dica de Acesso: admin / admin</p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDERIZAÇÃO DA APLICAÇÃO PRINCIPAL (USUÁRIO AUTENTICADO)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col relative overflow-hidden">
      {/* Curved Yellow Graphic Element Inspired by Lar Cooperativa Branding */}
      <svg className="absolute -top-10 -left-10 w-[600px] h-[600px] pointer-events-none opacity-20 z-0" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M-50 250C50 100 250 50 350 200C450 350 200 450 100 350C0 250 150 100 400 150" stroke="#F5A000" strokeWidth="24" strokeLinecap="round"/>
      </svg>
      <svg className="absolute -bottom-20 -right-20 w-[700px] h-[400px] pointer-events-none opacity-20 z-0" viewBox="0 0 700 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 200C200 150 400 250 700 180" stroke="#F5A000" strokeWidth="28" strokeLinecap="round"/>
      </svg>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl transition-all duration-300 border ${
          toast.type === 'error' 
            ? 'bg-red-50 text-red-800 border-red-200' 
            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-600" /> : <CheckCircle className="w-5 h-5 text-emerald-600" />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header / Top Navbar (Institutional Style) */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#E52320] p-2.5 rounded-xl text-white shadow-md">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#2D2926] uppercase tracking-wide leading-none">
                Gestão de Pessoas & Telefones
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1"> .NET 8 + React</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
              <User className="w-3.5 h-3.5 text-[#F5A000]" />
              <span>admin</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-xl text-xs font-bold transition"
              title="Sair do Sistema"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8 z-10">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#F5A000]/10 text-[#2D2926] border-l-4 border-[#F5A000]'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4 text-[#F5A000]" />
                <span>Dashboard</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'list'
                  ? 'bg-[#F5A000]/10 text-[#2D2926] border-l-4 border-[#F5A000]'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-[#F5A000]" />
                <span>Pessoas</span>
              </div>
              <span className="px-2 py-0.5 rounded-md text-xs bg-slate-100 text-slate-600 font-mono">
                {pessoas.length}
              </span>
            </button>

            <button
              onClick={handleOpenNewForm}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'form'
                  ? 'bg-[#F5A000]/10 text-[#2D2926] border-l-4 border-[#F5A000]'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4 text-[#F5A000]" />
              <span>{editingId ? 'Editar Pessoa' : 'Novo Cadastro'}</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'settings'
                  ? 'bg-[#F5A000]/10 text-[#2D2926] border-l-4 border-[#F5A000]'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Settings className="w-4 h-4 text-[#F5A000]" />
              <span>Conexão & API</span>
            </button>
          </div>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 min-w-0">
          {/* TAB 0: DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-[#2D2926] uppercase tracking-wide">Painel Geral de Métricas</h2>
                  <p className="text-xs text-slate-500 mt-1">Resumo quantitativo de pessoas e telefones associados.</p>
                </div>
                <button
                  onClick={() => setActiveTab('list')}
                  className="flex items-center gap-2 bg-[#E52320] hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition"
                >
                  <Users className="w-4 h-4" />
                  <span>Ver Lista Completa</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total de Pessoas</p>
                    <p className="text-3xl font-black text-[#2D2926] mt-1">{metrics.totalPessoas}</p>
                  </div>
                  <div className="p-3 bg-slate-100 text-[#2D2926] rounded-xl border border-slate-200">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Pessoas Ativas</p>
                    <p className="text-3xl font-black text-emerald-600 mt-1">{metrics.ativas}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                    <UserCheck className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Pessoas Inativas</p>
                    <p className="text-3xl font-black text-red-600 mt-1">{metrics.inativas}</p>
                  </div>
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100">
                    <UserX className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-xs font-bold text-[#F5A000] uppercase tracking-wider">Total Telefones</p>
                    <p className="text-3xl font-black text-[#2D2926] mt-1">{metrics.totalTelefones}</p>
                  </div>
                  <div className="p-3 bg-amber-50 text-[#F5A000] rounded-xl border border-amber-100">
                    <PhoneCall className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: LIST VIEW */}
          {activeTab === 'list' && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por Nome, CPF ou Telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#F5A000] focus:ring-1 focus:ring-[#F5A000] transition"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto">
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    {[
                      { id: 'all', label: 'Todos' },
                      { id: 'active', label: 'Ativos' },
                      { id: 'inactive', label: 'Inativos' }
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setFilterStatus(filter.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          filterStatus === filter.id
                            ? 'bg-[#E52320] text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleOpenNewForm}
                    className="flex items-center gap-1.5 bg-[#E52320] hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" /> Adicionar Pessoa
                  </button>
                </div>
              </div>

              {filteredPessoas.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-700">Nenhuma pessoa encontrada</h3>
                  <p className="text-xs text-slate-500 mt-1">Ajuste os filtros de busca por nome ou telefone.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredPessoas.map((pessoa) => (
                    <PessoaCard
                      key={pessoa.id}
                      pessoa={pessoa}
                      onEdit={() => handleOpenEditForm(pessoa)}
                      onToggleStatus={() => handleToggleStatus(pessoa)}
                      onDeletePermanent={() => handleDeletePermanent(pessoa.id, pessoa.nome)}
                      onAddPhone={() => setPhoneModalPessoa(pessoa)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UNIFIED FORM */}
          {activeTab === 'form' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
                <div>
                  <h2 className="text-lg font-black text-[#2D2926] uppercase tracking-wide flex items-center gap-2">
                    {editingId ? <Edit className="w-5 h-5 text-[#E52320]" /> : <UserPlus className="w-5 h-5 text-[#E52320]" />}
                    {editingId ? 'Editar Cadastro de Pessoa' : 'Novo Cadastro de Pessoa & Telefones'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Preencha os dados pessoais e adicione os números de telefone (1:N).</p>
                </div>
                <button
                  onClick={() => setActiveTab('list')}
                  className="text-slate-500 hover:text-slate-800 text-xs flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200"
                >
                  <X className="w-4 h-4" /> Cancelar
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-[#E52320] uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Dados Pessoais
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Nome Completo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Mariana Albuquerque"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#F5A000] focus:ring-1 focus:ring-[#F5A000] transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">CPF *</label>
                      <input
                        type="text"
                        required
                        placeholder="000.000.000-00"
                        value={formData.cpf}
                        onChange={(e) => setFormData({ ...formData, cpf: maskCPF(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#F5A000] focus:ring-1 focus:ring-[#F5A000] transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Data de Nascimento</label>
                      <input
                        type="date"
                        value={formData.dataNascimento}
                        onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#F5A000] transition"
                      />
                    </div>

                    <div className="space-y-1.5 flex flex-col justify-end">
                      <label className="flex items-center gap-3 bg-slate-50 border border-slate-300 p-2.5 rounded-xl cursor-pointer hover:bg-slate-100 transition">
                        <input
                          type="checkbox"
                          checked={formData.ativo}
                          onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                          className="w-4 h-4 rounded text-[#E52320] focus:ring-[#E52320] bg-white border-slate-300"
                        />
                        <span className="text-xs font-bold text-slate-700">Cadastro Ativo no Sistema</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#E52320] uppercase tracking-wider flex items-center gap-2">
                      <PhoneCall className="w-4 h-4" /> Telefones Associados (1:N)
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddPhoneField}
                      className="inline-flex items-center gap-1.5 text-xs text-[#E52320] hover:text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg transition font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar Telefone
                    </button>
                  </div>

                  {formData.telefones.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">Nenhum telefone adicionado.</p>
                  ) : (
                    <div className="space-y-3">
                      {formData.telefones.map((tel, index) => (
                        <div key={tel.id || index} className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <div className="w-full sm:w-44">
                            <select
                              value={tel.tipo}
                              onChange={(e) => handlePhoneChange(index, 'tipo', e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#F5A000]"
                            >
                              <option value="Celular">Celular</option>
                              <option value="Residencial">Residencial</option>
                              <option value="Comercial">Comercial</option>
                            </select>
                          </div>

                          <div className="w-full flex-1">
                            <input
                              type="text"
                              placeholder="(00) 00000-0000"
                              value={tel.numero}
                              onChange={(e) => handlePhoneChange(index, 'numero', e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#F5A000]"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemovePhoneField(index)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveTab('list')}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition uppercase"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-[#E52320] hover:bg-red-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition disabled:opacity-50"
                  >
                    {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span>{editingId ? 'Salvar Alterações' : 'Concluir Cadastro'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: SETTINGS VIEW */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
              <div>
                <h2 className="text-lg font-black text-[#2D2926] uppercase tracking-wide flex items-center gap-2">
                  <Server className="w-5 h-5 text-[#E52320]" /> Configuração da API Backend
                </h2>
                <p className="text-xs text-slate-500 mt-1">Alterne entre a simulação local (Modo Mock) ou a conexão real com a sua Web API em .NET 8.</p>
              </div>

              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div>
                    <label className="text-sm font-bold text-slate-800">Modo de Operação</label>
                    <p className="text-xs text-slate-500">Ative para efetuar chamadas HTTP diretamente para a controller .NET</p>
                  </div>
                  <button
                    onClick={() => setUseLiveApi(!useLiveApi)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      useLiveApi ? 'bg-[#E52320]' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useLiveApi ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-slate-700">URL Base da API .NET 8</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      disabled={!useLiveApi}
                      placeholder="https://localhost:7282/api"
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#F5A000] disabled:opacity-50"
                    />
                    <button
                      onClick={checkApiConnection}
                      disabled={!useLiveApi || loading}
                      className="flex items-center gap-1.5 bg-[#E52320] hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition disabled:opacity-50 uppercase tracking-wider"
                    >
                      {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      Testar Conexão
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer Banner */}
      <footer className="bg-[#E52320] text-white py-4 mt-auto z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs font-bold uppercase tracking-widest">
          Sistema de Avaliação Técnica .NET 8
        </div>
      </footer>

      {/* QUICK ADD PHONE MODAL */}
      {phoneModalPessoa && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-black text-[#2D2926] uppercase tracking-wide flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#E52320]" />
                Adicionar Telefone para {phoneModalPessoa.nome}
              </h3>
              <button onClick={() => setPhoneModalPessoa(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickAddPhone} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Tipo de Telefone</label>
                <select
                  value={newPhoneData.tipo}
                  onChange={(e) => setNewPhoneData({ ...newPhoneData, tipo: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#F5A000]"
                >
                  <option value="Celular">Celular</option>
                  <option value="Residencial">Residencial</option>
                  <option value="Comercial">Comercial</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Número do Telefone *</label>
                <input
                  type="text"
                  required
                  placeholder="(00) 00000-0000"
                  value={newPhoneData.numero}
                  onChange={(e) => setNewPhoneData({ ...newPhoneData, numero: maskPhone(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#F5A000]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setPhoneModalPessoa(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#E52320] hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Salvar Telefone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENT: PESSOA CARD ITEM (INSTITUTIONAL STYLE) ---
function PessoaCard({ pessoa, onEdit, onToggleStatus, onDeletePermanent, onAddPhone }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`bg-white border rounded-2xl transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md ${
      pessoa.ativo ? 'border-slate-200' : 'border-slate-200 bg-slate-50/80 opacity-75'
    }`}>
      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Person Primary Information */}
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl font-bold text-sm ${
            pessoa.ativo ? 'bg-amber-50 text-[#F5A000] border border-amber-200' : 'bg-slate-100 text-slate-400'
          }`}>
            <Users className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-[#2D2926]">{pessoa.nome}</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                pessoa.ativo 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {pessoa.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap">
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">
                CPF: {pessoa.cpf}
              </span>
              {pessoa.dataNascimento && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(pessoa.dataNascimento).toLocaleDateString('pt-BR')}
                </span>
              )}
              <span className="flex items-center gap-1 text-[#E52320] font-bold">
                <Phone className="w-3.5 h-3.5" />
                {pessoa.telefones ? pessoa.telefones.length : 0} telefone(s)
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
          <button
            onClick={onAddPhone}
            className="flex items-center gap-1.5 text-xs text-[#E52320] hover:text-white bg-red-50 hover:bg-[#E52320] border border-red-200 px-3 py-1.5 rounded-xl transition font-bold"
            title="Adicionar Número de Telefone"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>+ Telefone</span>
          </button>

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition font-medium"
          >
            <span>Telefones</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onEdit}
            className="p-2 text-slate-500 hover:text-[#E52320] hover:bg-red-50 rounded-xl transition border border-slate-200 bg-slate-50"
            title="Alterar todas as informações"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleStatus}
            className={`p-2 rounded-xl transition border border-slate-200 bg-slate-50 ${
              pessoa.ativo 
                ? 'text-slate-500 hover:text-amber-600 hover:bg-amber-50' 
                : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
            title={pessoa.ativo ? 'Inativar (Soft Delete)' : 'Reativar'}
          >
            {pessoa.ativo ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          </button>

          <button
            onClick={onDeletePermanent}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition border border-slate-200 bg-slate-50"
            title="Excluir Permanentemente"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Phone List Sub-panel */}
      {expanded && (
        <div className="bg-slate-50 border-t border-slate-200 p-4 space-y-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Lista de Contatos de {pessoa.nome}:
          </p>
          {!pessoa.telefones || pessoa.telefones.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Nenhum telefone registrado para esta pessoa.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {pessoa.telefones.map((tel) => (
                <div key={tel.id} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs shadow-xs">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#E52320]" />
                    <span className="font-mono font-bold text-slate-800">{tel.numero}</span>
                  </div>
                  <span className="text-[10px] bg-red-50 text-[#E52320] px-2 py-0.5 rounded font-bold border border-red-100">
                    {tel.tipo}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}