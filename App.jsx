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
  Database,
  LayoutDashboard,
  UserCheck,
  UserX
} from 'lucide-react';

// --- INITIAL MOCK DATA ---
const INITIAL_PESSOAS = [
  {
    id: 1,
    nome: "Ricardo Silva",
    cpf: "123.456.789-01",
    dataNascimento: "1990-05-15",
    ativo: true,
    telefones: [
      { id: 1, numero: "(51) 99999-8888", tipo: "Celular", pessoaId: 1 },
      { id: 2, numero: "(51) 3333-2222", tipo: "Residencial", pessoaId: 1 }
    ]
  },
  {
    id: 2,
    nome: "Ana Beatriz Santos",
    cpf: "987.654.321-09",
    dataNascimento: "1985-11-20",
    ativo: true,
    telefones: [
      { id: 3, numero: "(11) 98888-7777", tipo: "Celular", pessoaId: 2 },
      { id: 4, numero: "(11) 3456-7890", tipo: "Comercial", pessoaId: 2 }
    ]
  },
  {
    id: 3,
    nome: "Carlos Eduardo Oliveira",
    cpf: "456.789.123-45",
    dataNascimento: "2000-01-10",
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

// Main App Component
export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'list' | 'form' | 'settings'
  
  // App Data State
  const [pessoas, setPessoas] = useState(() => {
    const local = localStorage.getItem('lar_pessoas');
    return local ? JSON.parse(local) : INITIAL_PESSOAS;
  });
  
  // API & Connection Settings
  const [useLiveApi, setUseLiveApi] = useState(false);
  const [apiUrl, setApiUrl] = useState('https://localhost:7282/api');
  const [apiConnected, setApiConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'inactive'

  // Modal State for Quick Add Phone
  const [phoneModalPessoa, setPhoneModalPessoa] = useState(null);
  const [newPhoneData, setNewPhoneData] = useState({ numero: '', tipo: 'Celular' });

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    dataNascimento: '',
    ativo: true,
    telefones: []
  });

  // UI Toast State
  const [toast, setToast] = useState(null);

  // Save to LocalStorage whenever mock data changes
  useEffect(() => {
    localStorage.setItem('lar_pessoas', JSON.stringify(pessoas));
  }, [pessoas]);

  // Show Toast Helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --- API / MOCK SYNC LOGIC ---
  const checkApiConnection = async () => {
    if (!useLiveApi) {
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
    if (useLiveApi) {
      checkApiConnection();
    }
  }, [useLiveApi, apiUrl]);

  // Compute Dashboard Metrics
  const metrics = useMemo(() => {
    const ativas = pessoas.filter(p => p.ativo).length;
    const inativas = pessoas.filter(p => !p.ativo).length;
    const totalTelefones = pessoas.reduce((acc, p) => acc + (p.telefones ? p.telefones.length : 0), 0);
    return { ativas, inativas, totalPessoas: pessoas.length, totalTelefones };
  }, [pessoas]);

  // Enhanced Filtered List Computation (Filter by Name, CPF or Phone Number)
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

  // --- FORM HANDLERS ---
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

  // Quick Add Single Phone Handler
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

  // --- ACTIONS (DELETE / TOGGLE STATUS) ---
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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl transition-all duration-300 border ${
          toast.type === 'error' 
            ? 'bg-red-900/90 text-red-100 border-red-700' 
            : 'bg-emerald-900/90 text-emerald-100 border-emerald-700'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-400" /> : <CheckCircle className="w-5 h-5 text-emerald-400" />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header / Top Navbar */}
      <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-600/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-none">
                Gestão de Pessoas & Telefones
              </h1>
              <p className="text-xs text-slate-400 mt-1">Desenvolvimento .NET 8 Web API + React</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-700 text-xs">
              <Server className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300 font-mono text-[11px]">{apiUrl}</span>
              <span className={`w-2 h-2 rounded-full ${useLiveApi && apiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="font-semibold text-slate-200">
                {useLiveApi ? (apiConnected ? 'API Conectada' : 'API Desconectada') : 'Modo Mock Ativo'}
              </span>
            </div>

            <button
              onClick={handleOpenNewForm}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Pessoa</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-slate-800/50 rounded-2xl p-3 border border-slate-700/50 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-slate-700/40 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'list'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-slate-700/40 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Pessoas</span>
              </div>
              <span className="px-2 py-0.5 rounded-md text-xs bg-slate-900/60 text-slate-400 font-mono">
                {pessoas.length}
              </span>
            </button>

            <button
              onClick={handleOpenNewForm}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'form'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-slate-700/40 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{editingId ? 'Editar Pessoa' : 'Novo Cadastro'}</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'settings'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-slate-700/40 hover:text-slate-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Conexão & API</span>
            </button>
          </div>

          <div className="mt-6 bg-gradient-to-br from-indigo-900/30 to-slate-800/40 border border-indigo-500/20 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <Database className="w-4 h-4" />
              <span>Estrutura 1:N</span>
            </div>
            <p className="leading-relaxed">
              Cada <strong className="text-slate-200">Pessoa</strong> possui uma chave primária e pode conter múltiplos <strong className="text-slate-200">Telefones</strong>.
            </p>
          </div>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 min-w-0">
          {/* TAB 0: DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Painel Geral de Métricas</h2>
                  <p className="text-xs text-slate-400 mt-1">Resumo quantitativo de registros ativos, inativos e números de telefone.</p>
                </div>
                <button
                  onClick={() => setActiveTab('list')}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition"
                >
                  <Users className="w-4 h-4" />
                  <span>Ver Lista Completa</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total de Pessoas</p>
                    <p className="text-2xl font-extrabold text-white mt-1">{metrics.totalPessoas}</p>
                  </div>
                  <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/20">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Pessoas Ativas</p>
                    <p className="text-2xl font-extrabold text-emerald-300 mt-1">{metrics.ativas}</p>
                  </div>
                  <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/20">
                    <UserCheck className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-red-400 uppercase tracking-wider">Pessoas Inativas</p>
                    <p className="text-2xl font-extrabold text-red-300 mt-1">{metrics.inativas}</p>
                  </div>
                  <div className="p-3 bg-red-500/20 text-red-400 rounded-xl border border-red-500/20">
                    <UserX className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-indigo-400 uppercase tracking-wider">Total Telefones</p>
                    <p className="text-2xl font-extrabold text-indigo-300 mt-1">{metrics.totalTelefones}</p>
                  </div>
                  <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/20">
                    <PhoneCall className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: LIST VIEW */}
          {activeTab === 'list' && (
            <div className="space-y-6">
              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por Nome, CPF ou Telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto">
                  <div className="flex items-center gap-1.5 bg-slate-900/50 p-1 rounded-xl border border-slate-700/70">
                    {[
                      { id: 'all', label: 'Todos' },
                      { id: 'active', label: 'Ativos' },
                      { id: 'inactive', label: 'Inativos' }
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setFilterStatus(filter.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          filterStatus === filter.id
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleOpenNewForm}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-md whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" /> Adicionar Pessoa
                  </button>
                </div>
              </div>

              {filteredPessoas.length === 0 ? (
                <div className="bg-slate-800/30 border border-dashed border-slate-700 rounded-2xl p-12 text-center">
                  <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-slate-300">Nenhuma pessoa encontrada</h3>
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
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-700/60">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    {editingId ? <Edit className="w-5 h-5 text-indigo-400" /> : <UserPlus className="w-5 h-5 text-indigo-400" />}
                    {editingId ? 'Editar Cadastro de Pessoa' : 'Novo Cadastro de Pessoa & Telefones'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Preencha os dados pessoais e adicione um ou mais números de telefone (1:N).</p>
                </div>
                <button
                  onClick={() => setActiveTab('list')}
                  className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700"
                >
                  <X className="w-4 h-4" /> Cancelar
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Dados Pessoais
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Nome Completo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Ricardo Silva"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">CPF *</label>
                      <input
                        type="text"
                        required
                        placeholder="000.000.000-00"
                        value={formData.cpf}
                        onChange={(e) => setFormData({ ...formData, cpf: maskCPF(e.target.value) })}
                        className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Data de Nascimento</label>
                      <input
                        type="date"
                        value={formData.dataNascimento}
                        onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                        className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>

                    <div className="space-y-1.5 flex flex-col justify-end">
                      <label className="flex items-center gap-3 bg-slate-900/50 border border-slate-700/80 p-2.5 rounded-xl cursor-pointer hover:bg-slate-900/80 transition">
                        <input
                          type="checkbox"
                          checked={formData.ativo}
                          onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-600"
                        />
                        <span className="text-xs font-medium text-slate-200">Cadastro Ativo no Sistema</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-700/60">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                      <PhoneCall className="w-4 h-4" /> Telefones Associados (1:N)
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddPhoneField}
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-600/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar Telefone
                    </button>
                  </div>

                  {formData.telefones.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">Nenhum telefone adicionado.</p>
                  ) : (
                    <div className="space-y-3">
                      {formData.telefones.map((tel, index) => (
                        <div key={tel.id || index} className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-700/70">
                          <div className="w-full sm:w-44">
                            <select
                              value={tel.tipo}
                              onChange={(e) => handlePhoneChange(index, 'tipo', e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
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
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemovePhoneField(index)}
                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => setActiveTab('list')}
                    className="px-5 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
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
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-indigo-400" /> Configuração da API Backend
                </h2>
                <p className="text-xs text-slate-400 mt-1">Alterne entre a simulação local (Modo Mock) ou a conexão real com a sua Web API em .NET 8.</p>
              </div>

              <div className="space-y-4 bg-slate-900/60 p-4 rounded-xl border border-slate-700">
                <div className="flex items-center justify-between pb-4 border-b border-slate-700/80">
                  <div>
                    <label className="text-sm font-semibold text-slate-200">Modo de Operação</label>
                    <p className="text-xs text-slate-400">Ative para efetuar chamadas HTTP diretamente para a controller .NET</p>
                  </div>
                  <button
                    onClick={() => setUseLiveApi(!useLiveApi)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      useLiveApi ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useLiveApi ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-medium text-slate-300">URL Base da API .NET 8</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      disabled={!useLiveApi}
                      placeholder="https://localhost:7282/api"
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                    />
                    <button
                      onClick={checkApiConnection}
                      disabled={!useLiveApi || loading}
                      className="flex items-center gap-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-4 py-2 rounded-xl text-xs font-medium transition disabled:opacity-50"
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

      {/* QUICK ADD PHONE MODAL */}
      {phoneModalPessoa && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-indigo-400" />
                Adicionar Telefone para {phoneModalPessoa.nome}
              </h3>
              <button onClick={() => setPhoneModalPessoa(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickAddPhone} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Tipo de Telefone</label>
                <select
                  value={newPhoneData.tipo}
                  onChange={(e) => setNewPhoneData({ ...newPhoneData, tipo: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Celular">Celular</option>
                  <option value="Residencial">Residencial</option>
                  <option value="Comercial">Comercial</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Número do Telefone *</label>
                <input
                  type="text"
                  required
                  placeholder="(00) 00000-0000"
                  value={newPhoneData.numero}
                  onChange={(e) => setNewPhoneData({ ...newPhoneData, numero: maskPhone(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setPhoneModalPessoa(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold"
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

// --- SUB-COMPONENT: PESSOA CARD ITEM ---
function PessoaCard({ pessoa, onEdit, onToggleStatus, onDeletePermanent, onAddPhone }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`bg-slate-800/50 border rounded-2xl transition-all duration-200 overflow-hidden ${
      pessoa.ativo ? 'border-slate-700/70 hover:border-slate-600' : 'border-slate-800 bg-slate-900/40 opacity-75'
    }`}>
      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Person Primary Information */}
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl text-white font-bold text-sm ${
            pessoa.ativo ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20' : 'bg-slate-800 text-slate-500'
          }`}>
            <Users className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white">{pessoa.nome}</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                pessoa.ativo 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {pessoa.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 mt-1 flex-wrap">
              <span className="font-mono bg-slate-900/60 px-2 py-0.5 rounded text-slate-300">
                CPF: {pessoa.cpf}
              </span>
              {pessoa.dataNascimento && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {new Date(pessoa.dataNascimento).toLocaleDateString('pt-BR')}
                </span>
              )}
              <span className="flex items-center gap-1 text-indigo-400 font-medium">
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
            className="flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 px-3 py-1.5 rounded-xl transition font-medium"
            title="Adicionar Número de Telefone"
          >
            <PhoneCall className="w-3.5 h-3.5 text-indigo-400" />
            <span>+ Telefone</span>
          </button>

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-900/50 border border-slate-700/60 px-3 py-1.5 rounded-xl transition"
          >
            <span>Telefones</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onEdit}
            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition border border-slate-700/50 bg-slate-900/40"
            title="Alterar todas as informações"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleStatus}
            className={`p-2 rounded-xl transition border border-slate-700/50 bg-slate-900/40 ${
              pessoa.ativo 
                ? 'text-slate-400 hover:text-amber-400 hover:bg-amber-500/10' 
                : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10'
            }`}
            title={pessoa.ativo ? 'Inativar (Soft Delete)' : 'Reativar'}
          >
            {pessoa.ativo ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          </button>

          <button
            onClick={onDeletePermanent}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition border border-slate-700/50 bg-slate-900/40"
            title="Excluir Permanentemente"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Phone List Sub-panel */}
      {expanded && (
        <div className="bg-slate-900/60 border-t border-slate-700/60 p-4 space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Lista de Contatos de {pessoa.nome}:
          </p>
          {!pessoa.telefones || pessoa.telefones.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Nenhum telefone registrado para esta pessoa.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {pessoa.telefones.map((tel) => (
                <div key={tel.id} className="flex items-center justify-between bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700/50 text-xs">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-mono font-medium text-slate-200">{tel.numero}</span>
                  </div>
                  <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded font-medium border border-indigo-800/50">
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