import React, { useState, useEffect, FC, ChangeEvent, useRef, useContext, createContext } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import OpenAI from 'openai';
import * as pdfjsLib from 'pdfjs-dist';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Configuração do worker para pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.5.136/build/pdf.worker.mjs';

// ===================================================================================
// ===================================================================================
//  ATENÇÃO: Insira sua chave de API da OpenAI aqui
//
//  Substitua o texto "COLE_SUA_CHAVE_API_AQUI" pela sua chave de API da OpenAI.
//  Exemplo: const OPENAI_API_KEY = "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
//
//  Lembre-se: Expor sua chave de API no código do frontend é um GRANDE RISCO DE
//  SEGURANÇA. Qualquer pessoa que acessar o site poderá ver e usar sua chave.
// ===================================================================================
// ===================================================================================
const OPENAI_API_KEY = "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";


// --- Ícones SVG ---
const EyeIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const EyeOffIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
);

const PencilIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const TrashIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const SpinnerIcon: FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ChatAltIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
    </svg>
);

const DownloadIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const BrainIcon: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 01-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 013.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 013.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 01-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 21.75l-.648-1.188a2.25 2.25 0 01-1.423-1.423L13.5 18.75l1.188-.648a2.25 2.25 0 011.423-1.423L16.25 16.5l.648 1.188a2.25 2.25 0 011.423 1.423L18.75 19.5l-1.188.648a2.25 2.25 0 01-1.423 1.423z" />
  </svg>
);

const ReportIcon: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.25 9h-4.5m4.5 3h-4.5M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const ChartBarIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);

const ChevronDownIcon: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);


// --- OpenAI API e Helpers ---
const renderPageToImage = async (page: pdfjsLib.PDFPageProxy): Promise<{b64: string, mimeType: string}> => {
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (!context) {
        throw new Error('Could not get canvas context');
    }

    await page.render({
        canvas,
        canvasContext: context,
        viewport: viewport,
    }).promise;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    return {
      b64: dataUrl.split(',')[1],
      mimeType: 'image/jpeg'
    };
};

const processPdfForMultimodal = async (file: File): Promise<any[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    
    const parts: any[] = [];
    const maxPagesToProcess = 25; 
    const numPages = Math.min(pdf.numPages, maxPagesToProcess);

    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        
        const { b64, mimeType } = await renderPageToImage(page);
        parts.push({
            inlineData: {
                mimeType,
                data: b64,
            },
        });

        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
        if (pageText.trim().length > 10) {
             parts.push({ text: `Texto extraído da página ${i}:\n${pageText}` });
        }
    }

    if (pdf.numPages > maxPagesToProcess) {
        parts.push({ text: `\n[AVISO: Apenas as primeiras ${maxPagesToProcess} de ${pdf.numPages} páginas foram processadas para otimizar o desempenho.]` });
    }
    
    return parts;
};


// --- IndexedDB ---
const DB_NAME = 'LudusAIQuizDB';
const DB_VERSION = 1;
const STORE_NAME = 'quizzes';

// --- Global Types ---
type Difficulty = 'Fácil' | 'Médio' | 'Difícil';
type ViewType = 'user' | 'adminLogin' | 'dashboard' | 'studentDashboard';
type StudentData = { fullName: string; phone: string; store: string; };

interface Quiz {
    id: number;
    theme: string;
    difficulty: Difficulty;
    isActive: boolean;
    youtubeUrl?: string;
    planJson: string;
    summaryText: string;
}

// --- Sistema de Notificação ---
interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface NotificationContextType {
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const NotificationToast: FC<{ notification: Notification; onDismiss: () => void }> = ({ notification, onDismiss }) => {
    const { message, type } = notification;
    const colors = {
        success: 'bg-green-500/90',
        error: 'bg-red-500/90',
        info: 'bg-cyan-500/90',
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -50, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`relative ${colors[type]} backdrop-blur-md text-white font-bold py-3 pl-6 pr-10 rounded-lg shadow-lg flex items-center`}
        >
            {message}
            <button onClick={onDismiss} className="absolute top-1/2 right-2 -translate-y-1/2 text-white/70 hover:text-white text-2xl leading-none">&times;</button>
        </motion.div>
    );
};

const NotificationProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = (message: string, type: 'success' | 'error' | 'info') => {
        const id = Date.now() + Math.random();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            removeNotification(id);
        }, 5000);
    };
    
    const removeNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ addNotification }}>
            {children}
            <div className="fixed top-5 right-5 z-[100] space-y-3">
                <AnimatePresence>
                    {notifications.map(n => (
                        <NotificationToast key={n.id} notification={n} onDismiss={() => removeNotification(n.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};

const dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject("Erro ao abrir IndexedDB");
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
    };
});

// --- Componente: LoadingSpinner ---
const LoadingSpinner: FC<{ text?: string }> = ({ text = "Acessando sistema..." }) => (
    <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
    >
        <motion.div
            className="w-16 h-16 border-4 border-t-4 border-gray-600 border-t-cyan-400 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, ease: "linear", repeat: Infinity }}
        />
        <motion.p
            className="mt-4 text-lg font-medium text-cyan-300"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
            {text}
        </motion.p>
    </motion.div>
);

// --- Componente: InputField ---
interface InputFieldProps {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  inputMode?: 'text' | 'tel' | 'email' | 'search' | 'url' | 'none' | 'numeric' | 'decimal';
}

const InputField: FC<InputFieldProps> = ({ id, label, ...props }) => (
  <div className="w-full">
    <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
      {label}
    </label>
    <input
      id={id}
      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 transition-colors duration-200 ease-in-out
                 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
      {...props}
    />
  </div>
);

// --- Componente: PrimaryButton ---
interface PrimaryButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    disabled?: boolean;
}

const PrimaryButton: FC<PrimaryButtonProps> = ({ onClick, children, disabled }) => (
    <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        onClick={onClick}
        disabled={disabled}
        className="w-full bg-cyan-400 text-black font-bold py-3 px-4 rounded-lg shadow-md
                   hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-400
                   transition-all duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
    >
        {children}
    </motion.button>
);


// --- Componente: AdminAccessButton ---
interface AdminAccessButtonProps {
    onClick: () => void;
}
const AdminAccessButton: FC<AdminAccessButtonProps> = ({ onClick }) => (
    <motion.a
        onClick={onClick}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-cyan-400 font-medium py-2 px-4
                   border border-cyan-400 rounded-lg shadow-lg hover:bg-cyan-400 hover:text-black cursor-pointer
                   transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-400
                   focus:ring-offset-2 focus:ring-offset-gray-900"
    >
        <span className="text-lg" role="img" aria-label="Escudo">🛡️</span>
        <span>Acesso administrativo</span>
    </motion.a>
);

// --- Componente: UserLoginForm ---
interface UserLoginFormProps {
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setView: (view: ViewType) => void;
    setStudentData: (data: { fullName: string; phone: string; store: string; }) => void;
    setStudentMaterials: (materials: Quiz[]) => void;
    setAnsweredQuizIds: (ids: Set<number>) => void;
}

const UserLoginForm: FC<UserLoginFormProps> = ({ setIsLoading, setView, setStudentData, setStudentMaterials, setAnsweredQuizIds }) => {
  const [formData, setFormData] = useState({ fullName: '', phone: '', store: '' });
  const [isFormReady, setIsFormReady] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    const { fullName, phone, store } = formData;
    setIsFormReady(fullName.trim() !== '' && phone.trim() !== '' && store.trim() !== '');
  }, [formData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({...prev, [id]: value}));
  };
  
  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 11);
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    setFormData(prev => ({ ...prev, phone: value }));
  };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            // Etapa 1: Autenticar o usuário
            const authResponse = await fetch('https://webhook.triad3.io/webhook/acessousuario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!authResponse.ok) {
                throw new Error('Falha na autenticação. Verifique seus dados.');
            }
            
            const authData = await authResponse.json();
            
            if (authData.resposta !== "Seja Bem-vindo(a)!") {
                 throw new Error(authData.resposta || 'Credenciais inválidas.');
            }
            
            // Processar quizzes já respondidos
            const answeredQuizzes = authData.quizzquejarespondeu;
            if (typeof answeredQuizzes === 'string' && answeredQuizzes.trim()) {
                const ids = answeredQuizzes.split(',')
                    .map(id => parseInt(id.trim(), 10))
                    .filter(id => !isNaN(id));
                setAnsweredQuizIds(new Set(ids));
            } else {
                setAnsweredQuizIds(new Set());
            }


            // Etapa 2: Buscar os materiais
            const materialsResponse = await fetch('https://webhook.triad3.io/webhook/buscarmaterial-ludus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: formData.fullName })
            });

            if (!materialsResponse.ok) {
                throw new Error('Não foi possível carregar os materiais de estudo.');
            }

            const materialsData = await materialsResponse.json();
            
            const materialsArray = Array.isArray(materialsData)
                ? materialsData
                : materialsData.resultado || [];

             const activeMaterials: Quiz[] = materialsArray
                .filter(m => m.isActive === 'true')
                .map(m => ({
                    id: m.id,
                    theme: m.tema_quizz,
                    difficulty: m.dificuldade,
                    isActive: m.isActive === 'true',
                    planJson: m.planJson,
                    summaryText: m.summaryText,
                    youtubeUrl: m.youtubeUrl || undefined,
                }));


            // Etapa 3: Atualizar o estado e a visão
            setStudentData(formData);
            setStudentMaterials(activeMaterials);
            setView('studentDashboard');

        } catch (error: any) {
            console.error("Falha no acesso do aluno:", error);
            addNotification(error.message, 'error');
            setAnsweredQuizIds(new Set()); // Limpar em caso de erro
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md p-8 space-y-6 bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl"
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold text-cyan-400">LUDUS AI</h1>
        <p className="mt-2 text-md text-gray-300">
          Preencha seus dados para iniciar sua experiência.
        </p>
      </div>
      <div className="space-y-5">
        <InputField id="fullName" label="Nome completo" placeholder="Digite seu nome completo" value={formData.fullName} onChange={handleChange}/>
        <InputField id="phone" label="Telefone com DDD" placeholder="(00) 00000-0000" type="tel" inputMode="tel" value={formData.phone} onChange={handlePhoneChange}/>
        <InputField id="store" label="Loja onde trabalha" placeholder="Nome da loja onde você trabalha" value={formData.store} onChange={handleChange}/>
      </div>
      <div className="h-14">
        <AnimatePresence>
            {isFormReady && <PrimaryButton onClick={handleSubmit}>Começar agora</PrimaryButton>}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// --- Componente: AdminLoginForm ---
interface AdminLoginFormProps {
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setView: (view: ViewType) => void;
    setAdminName: (name: string) => void;
}

const AdminLoginForm: FC<AdminLoginFormProps> = ({ setIsLoading, setView, setAdminName }) => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const { addNotification } = useNotification();
    const isFormReady = credentials.email.trim() !== '' && credentials.password.trim() !== '';

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setCredentials(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const apiCall = fetch('https://webhook.triad3.io/webhook/loginadm-ludus2-0', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            const timer = new Promise(resolve => setTimeout(resolve, 5000));
            const [response] = await Promise.all([apiCall, timer]);
            
            if (!response.ok) {
                 const errorData = await response.json().catch(() => ({ resposta: "Credenciais inválidas" }));
                 throw new Error(errorData.resposta || `Erro: ${response.statusText}`);
            }

            const result = await response.json();
            if (result.resposta === "Seja Bem-vindo(a)!" && result.nome) {
                setAdminName(result.nome);
                setView('dashboard');
            } else {
                throw new Error(result.resposta || "Resposta inesperada da API.");
            }
        } catch (error: any) {
            console.error("Falha no login:", error);
            addNotification(`Erro no login: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md p-8 space-y-6 bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl"
        >
            <div className="text-center">
                <h1 className="text-3xl font-bold text-cyan-400">Acesso Administrativo</h1>
                <p className="mt-2 text-md text-gray-300">Faça login para gerenciar o sistema.</p>
            </div>
            <div className="space-y-5">
                <InputField id="email" label="E-mail" placeholder="seu@email.com" type="email" value={credentials.email} onChange={handleChange} />
                <div className="relative">
                    <InputField id="password" label="Senha" placeholder="********" type={showPassword ? 'text' : 'password'} value={credentials.password} onChange={handleChange} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-400 hover:text-cyan-400">
                        {showPassword ? <EyeOffIcon className="h-6 w-6" /> : <EyeIcon className="h-6 w-6" />}
                    </button>
                </div>
            </div>
            <div className="space-y-4 pt-2">
                <PrimaryButton onClick={handleSubmit} disabled={!isFormReady}>Entrar</PrimaryButton>
                <button onClick={() => setView('user')} className="w-full text-center text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                    Voltar
                </button>
            </div>
        </motion.div>
    );
};

// --- Componentes do Painel Administrativo ---

const ToggleSwitch: FC<{ isActive: boolean; onToggle: () => void; }> = ({ isActive, onToggle }) => {
    const spring = { type: "spring", stiffness: 700, damping: 30 } as const;
    return (
        <div
            className={`flex items-center w-11 h-6 p-1 rounded-full cursor-pointer ${isActive ? 'bg-cyan-500 justify-end' : 'bg-gray-700 justify-start'}`}
            onClick={onToggle}
        >
            <motion.div className="w-4 h-4 bg-white rounded-full shadow-md" layout transition={spring} />
        </div>
    );
};


type ChatMessage = { role: 'user' | 'model', text: string };

interface QuizChatAssistantProps {
    isOpen: boolean;
    onClose: () => void;
    planJson: string;
    summaryText: string;
    messages: ChatMessage[];
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    openAiModel?: string;
    apiKey?: string;
}

const QuizChatAssistant: FC<QuizChatAssistantProps> = ({ isOpen, onClose, planJson, summaryText, messages, setMessages, openAiModel, apiKey }) => {
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const { addNotification } = useNotification();

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isThinking) return;

        const userMessage = { role: 'user' as const, text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsThinking(true);

        try {
            const key = apiKey || OPENAI_API_KEY;
            const model = openAiModel || localStorage.getItem('ludusAdminOpenAiModel') || 'gpt-4o-mini';

            if (!key || key === "COLE_SUA_CHAVE_API_AQUI") {
                addNotification("Chave de API não configurada para o chat.", 'error');
                throw new Error("API Key not configured for chat.");
            }
            
            const openai = new OpenAI({ apiKey: key, dangerouslyAllowBrowser: true });

            const systemInstruction = `Você é o LUDUS, um tutor de IA amigável e prestativo. Sua única função é ajudar o usuário a entender o material de um quiz. Use o plano do quiz e o resumo fornecidos como seu único contexto para responder às perguntas do usuário. Seja claro, objetivo e didático.
            ---
            CONTEXTO - PLANO DO QUIZ (Regras e Questões):
            ${planJson}
            ---
            CONTEXTO - RESUMO DO MATERIAL DE ESTUDO:
            ${summaryText}
            ---
            `;
            
            const apiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
                { role: 'system', content: systemInstruction },
                ...messages.map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.text })),
                { role: 'user', content: input }
            ];

            const response = await openai.chat.completions.create({
                model: model,
                messages: apiMessages,
            });

            const modelMessageText = response.choices[0].message.content || 'Não foi possível obter uma resposta.';
            const modelMessage = { role: 'model' as const, text: modelMessageText };
            setMessages(prev => [...prev, modelMessage]);

        } catch (error) {
            console.error("Erro no chat com a IA:", error);
            const errorMessage = { role: 'model' as const, text: 'Desculpe, não consegui processar sua pergunta no momento. Verifique a chave de API e tente novamente.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsThinking(false);
        }
    };
    
    if (!isOpen) return null;

    return (
         <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-[#0D1117] border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl h-[70vh] flex flex-col"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-4 border-b border-gray-700 flex justify-between items-center shrink-0">
                    <h3 className="text-lg font-bold text-cyan-400">Assistente LUDUS AI</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </header>
                <div ref={chatContainerRef} className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg ${msg.role === 'user' ? 'bg-cyan-500 text-black' : 'bg-gray-800 text-gray-200'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isThinking && (
                        <div className="flex justify-start">
                             <div className="max-w-xs p-3 rounded-lg bg-gray-800 text-gray-200 flex items-center gap-2">
                                <SpinnerIcon className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Digitando...</span>
                             </div>
                        </div>
                    )}
                </div>
                <footer className="p-4 border-t border-gray-700 flex gap-2 shrink-0">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Pergunte sobre o quiz..."
                        className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <button onClick={handleSend} disabled={!input.trim() || isThinking} className="bg-cyan-400 text-black font-bold px-4 py-2 rounded-lg disabled:bg-gray-600">
                        Enviar
                    </button>
                </footer>
            </motion.div>
        </motion.div>
    )
};


interface Question {
    questionText: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
}
interface QuizPlan {
    questions: Question[];
    finalFeedbackRules: string;
}
interface QuizResult {
    score: number;
    feedback: string;
    correctAnswers: number;
    totalQuestions: number;
}

interface InteractiveQuizProps {
    planJson: string;
    summaryText: string;
    quizId: number;
    quizTitle: string;
    studentData: StudentData | null;
    onExit?: () => void;
    openAiModel?: string;
    onQuizComplete?: (quizId: number) => void;
    apiKey?: string;
}

const InteractiveQuiz: FC<InteractiveQuizProps> = ({ planJson, summaryText, quizId, quizTitle, studentData, onExit, openAiModel, onQuizComplete, apiKey }) => {
    const [plan, setPlan] = useState<QuizPlan | null>(null);
    const [answers, setAnswers] = useState<{ [key: number]: number }>({});
    const [result, setResult] = useState<QuizResult | null>(null);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const resultsRef = useRef<HTMLDivElement>(null);
    const downloadableContentRef = useRef<HTMLDivElement>(null);
    const { addNotification } = useNotification();

    useEffect(() => {
        try {
            setPlan(JSON.parse(planJson));
        } catch (e) {
            console.error("Erro ao analisar o plano do quiz JSON:", e);
        }
    }, [planJson]);

    useEffect(() => {
        if (result && resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [result]);

    const handleAnswerChange = (questionIndex: number, optionIndex: number) => {
        setAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
    };

    const handleEvaluate = async () => {
        if (!plan) return;
        setIsEvaluating(true);
        try {
            const key = apiKey || OPENAI_API_KEY;
            const model = openAiModel || 'gpt-4o-mini';
            
            if (!key || key === "COLE_SUA_CHAVE_API_AQUI") {
                addNotification("Não foi possível avaliar. A chave de API não foi configurada.", 'error');
                setIsEvaluating(false);
                return;
            }

            const openai = new OpenAI({ apiKey: key, dangerouslyAllowBrowser: true });
            
            const prompt = `Com base neste plano de quiz JSON e nas respostas do usuário, calcule a pontuação e gere um feedback personalizado. O plano é: ${planJson}. As respostas do usuário são: ${JSON.stringify(answers)}. Responda APENAS com um objeto JSON com o seguinte formato: { "score": number (0-100), "feedback": string, "correctAnswers": number, "totalQuestions": number }.`;
            
            const response = await openai.chat.completions.create({
                model: model,
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: "json_object" },
            });
            
            const resultText = response.choices[0].message.content;
            if (!resultText) throw new Error("A API não retornou um resultado.");

            const resultJson = JSON.parse(resultText);
            setResult(resultJson);

            if (onQuizComplete) {
                onQuizComplete(quizId);
            }

            // Salvar resultados silenciosamente "por debaixo dos panos"
            if (studentData && resultJson) {
                const payload = {
                    student: studentData,
                    quizId: quizId,
                    quizTitle: quizTitle,
                    score: resultJson.score,
                    correctAnswers: resultJson.correctAnswers,
                    wrongAnswers: resultJson.totalQuestions - resultJson.correctAnswers,
                    totalQuestions: resultJson.totalQuestions,
                    answers: answers,
                    feedback: resultJson.feedback,
                    evaluatedAt: new Date().toISOString()
                };

                try {
                    fetch('https://webhook.triad3.io/webhook/salvarrespostasquizz', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    // Nenhuma notificação para o usuário, apenas log no console para debug
                    console.log("Resultado do aluno salvo com sucesso.");
                } catch (saveError) {
                    console.error("Falha ao salvar o resultado do aluno:", saveError);
                }
            }

        } catch (error) {
            console.error("Erro ao avaliar o quiz:", error);
            addNotification("Não foi possível avaliar o quiz. Verifique a chave de API e tente novamente.", 'error');
        } finally {
            setIsEvaluating(false);
        }
    };
    
    const handleDownloadPdf = async () => {
        const content = downloadableContentRef.current;
        if (!content) {
            addNotification('Não foi possível gerar o PDF. Conteúdo não encontrado.', 'error');
            return;
        }

        try {
            const canvas = await html2canvas(content, {
                backgroundColor: '#0D1117', // Match the theme background for consistency
                scale: 2, // Higher resolution for better quality
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`Resumo-${quizTitle.replace(/\s+/g, '_')}.pdf`);
            addNotification('PDF gerado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            addNotification('Falha ao gerar o PDF.', 'error');
        }
    };

    const handleConfirmEvaluation = async () => {
        await handleEvaluate();
        setShowConfirmation(false);
    };
    
    if (!plan) {
        return <div className="p-8 text-center text-gray-400">Carregando pré-visualização...</div>;
    }
    
    const allQuestionsAnswered = Object.keys(answers).length === plan.questions.length;

    return (
        <div className="bg-[#0D1117] text-white rounded-lg h-full flex flex-col relative">
            <AnimatePresence>
                {isChatOpen && (
                    <QuizChatAssistant
                        isOpen={isChatOpen}
                        onClose={() => setIsChatOpen(false)}
                        planJson={planJson}
                        summaryText={summaryText}
                        messages={chatMessages}
                        setMessages={setChatMessages}
                        openAiModel={openAiModel}
                        apiKey={apiKey}
                    />
                )}
            </AnimatePresence>

            <ConfirmationModal
                isOpen={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                onConfirm={handleConfirmEvaluation}
                title="Finalizar Avaliação"
                isConfirming={isEvaluating}
            >
                <p>Você tem certeza que deseja finalizar e enviar suas respostas? Após a confirmação, você não poderá alterá-las.</p>
            </ConfirmationModal>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="space-y-8">
                    {plan.questions.map((q, qIndex) => {
                        const userAnswer = answers[qIndex];
                        const isCorrect = userAnswer === q.correctOptionIndex;
                        
                        return (
                            <div key={qIndex} className={`p-5 rounded-lg border transition-colors ${result ? (isCorrect ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10') : 'border-gray-800 bg-[#161B22]'}`}>
                                <p className="font-semibold text-lg mb-4 text-gray-200">{qIndex + 1}. {q.questionText}</p>
                                <div className="space-y-3">
                                    {q.options.map((option, oIndex) => {
                                        const isUserAnswer = userAnswer === oIndex;
                                        const isCorrectAnswer = q.correctOptionIndex === oIndex;
                                        let ringColor = 'ring-gray-600';
                                        if(result){
                                            if(isCorrectAnswer) ringColor = 'ring-green-500';
                                            else if (isUserAnswer) ringColor = 'ring-red-500';
                                        }
                                        return (
                                            <label key={oIndex} className={`flex items-center p-3 rounded-md cursor-pointer transition-all duration-200 border border-gray-700 hover:bg-gray-800/50 ${isUserAnswer ? `ring-2 ${ringColor} bg-gray-800` : ''}`}>
                                                <input
                                                    type="radio"
                                                    name={`question-${qIndex}`}
                                                    checked={isUserAnswer}
                                                    onChange={() => handleAnswerChange(qIndex, oIndex)}
                                                    disabled={!!result}
                                                    className="h-4 w-4 text-cyan-400 bg-gray-700 border-gray-600 focus:ring-cyan-500"
                                                />
                                                <span className="ml-3 text-gray-300">{option}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                                {result && (
                                    <div className="mt-4 p-3 bg-gray-900/70 rounded-md border border-gray-700">
                                        <p className="text-sm font-semibold text-cyan-400">Explicação:</p>
                                        <p className="text-sm text-gray-400 mt-1">{q.explanation}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                
                {!result && (
                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={() => setShowConfirmation(true)}
                            disabled={!allQuestionsAnswered || isEvaluating}
                            className="px-8 py-3 rounded-lg font-bold text-black bg-cyan-400 hover:bg-cyan-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isEvaluating ? (
                                <>
                                    <SpinnerIcon className="animate-spin h-5 w-5" />
                                    <span>Avaliando...</span>
                                </>
                            ) : (
                            'Enviar Respostas'
                            )}
                        </button>
                    </div>
                )}
                
                <AnimatePresence>
                    {result && (
                         <motion.div
                            ref={resultsRef}
                            className="shrink-0 p-6 mt-8 border-t border-gray-800"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                         >
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-cyan-400">Resultado da Avaliação</h2>
                                <p className="text-5xl font-bold my-4">{result.score}<span className="text-2xl text-gray-400">%</span></p>
                                <p className="text-lg">{`Você acertou ${result.correctAnswers} de ${result.totalQuestions} questões.`}</p>
                            </div>

                            <div ref={downloadableContentRef} className="space-y-8 p-1">
                                <div className="p-5 bg-[#161B22]/70 rounded-lg border border-cyan-500/30 backdrop-blur-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                        <BrainIcon className="h-6 w-6 text-cyan-400 flex-shrink-0" />
                                        <h3 className="text-lg font-bold text-cyan-400">Feedback do Tutor Ludus</h3>
                                    </div>
                                    <p className="text-gray-300 whitespace-pre-wrap text-base leading-relaxed">{result.feedback}</p>
                                </div>

                                <div className="p-5 bg-[#161B22]/70 rounded-lg border border-gray-700 backdrop-blur-sm">
                                    <div className="flex items-center gap-3 mb-4">
                                        <ReportIcon className="h-6 w-6 text-cyan-400 flex-shrink-0" />
                                        <h3 className="text-lg font-bold text-cyan-400">Resumo em Destaques: <span className="text-gray-400 font-normal">{quizTitle}</span></h3>
                                    </div>
                                    <div className="relative pl-6 border-l-2 border-cyan-800/50">
                                        {summaryText.split('\n\n').filter(p => p.trim()).map((paragraph, index, arr) => (
                                            <div key={index} className={`relative ${index === arr.length - 1 ? '' : 'pb-8'}`}>
                                                <div className="absolute -left-[33px] top-1.5 h-4 w-4 rounded-full bg-cyan-500 ring-4 ring-[#161B22] z-10"></div>
                                                <div className="pl-4">
                                                    <p className="text-gray-300 whitespace-pre-wrap text-base leading-relaxed">
                                                        {paragraph.trim()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                           
                            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                                {onExit && (
                                     <button
                                        onClick={onExit}
                                        className="w-full sm:w-auto px-8 py-3 rounded-lg font-bold text-black bg-cyan-400 hover:bg-cyan-500 transition-colors"
                                    >
                                        Voltar ao Painel
                                    </button>
                                )}
                                <button
                                    onClick={handleDownloadPdf}
                                    className="w-full sm:w-auto px-8 py-3 rounded-lg font-bold text-cyan-400 bg-transparent border border-cyan-400 hover:bg-cyan-400/10 transition-colors flex items-center justify-center gap-2"
                                >
                                    <DownloadIcon className="h-5 w-5" />
                                    Baixar Resumo
                                </button>
                            </div>
                         </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
             <AnimatePresence>
                {result && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute bottom-6 right-6 bg-cyan-400 text-black rounded-full h-16 w-16 flex items-center justify-center shadow-lg hover:bg-cyan-500 z-10"
                        onClick={() => setIsChatOpen(true)}
                        aria-label="Converse com o Assistente"
                    >
                        <ChatAltIcon className="h-8 w-8" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};


interface QuizPreviewModalProps {
    pendingQuizData: PendingQuizData;
    onApprove: () => void;
    onReject: () => void;
    openAiModel: string;
    apiKey: string;
}

const QuizPreviewModal: FC<QuizPreviewModalProps> = ({ pendingQuizData, onApprove, onReject, openAiModel, apiKey }) => {
    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-[#161B22] border border-gray-700 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <header className="p-4 border-b border-gray-700">
                    <h3 className="text-lg font-bold text-cyan-400">Pré-visualização Interativa do Quiz</h3>
                </header>
                <div className="flex-1 overflow-hidden">
                    <InteractiveQuiz 
                        planJson={pendingQuizData.planJson} 
                        summaryText={pendingQuizData.summaryText} 
                        quizId={0} // Not relevant for admin preview
                        quizTitle={pendingQuizData.theme}
                        studentData={null} // No student data in admin preview
                        openAiModel={openAiModel}
                        apiKey={apiKey}
                    />
                </div>
                <footer className="p-4 flex justify-end space-x-4 border-t border-gray-700">
                    <button onClick={onReject} className="px-6 py-2 rounded-lg text-sm font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors">
                        Rejeitar e Tentar Novamente
                    </button>
                    <button onClick={onApprove} className="px-6 py-2 rounded-lg text-sm font-bold text-black bg-cyan-400 hover:bg-cyan-500 transition-colors">
                        Aprovar e Adicionar à Lista
                    </button>
                </footer>
            </motion.div>
        </motion.div>
    );
};


type PendingQuizData = Omit<Quiz, 'id' | 'isActive'>;

const SavingSpinner: FC<{text?: string}> = ({text = "Salvando Quiz..."}) => (
    <motion.div
        className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
    >
        <motion.div
            className="w-16 h-16 border-4 border-t-4 border-gray-600 border-t-cyan-400 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, ease: "linear", repeat: Infinity }}
        />
        <p className="mt-4 text-lg font-medium text-cyan-300">{text}</p>
    </motion.div>
);

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
    isConfirming?: boolean;
}

const ConfirmationModal: FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, children, isConfirming }) => {
    if (!isOpen) return null;

    return (
        <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-[#161B22] border border-gray-700 rounded-xl shadow-2xl w-full max-w-md p-6"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-xl font-bold text-cyan-400 mb-4">{title}</h3>
                <div className="text-gray-300">
                    {children}
                </div>
                <div className="flex justify-end space-x-4 mt-8">
                    <button onClick={onClose} disabled={isConfirming} className="px-6 py-2 rounded-lg text-sm font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors disabled:opacity-50">
                        Cancelar
                    </button>
                    <button onClick={onConfirm} disabled={isConfirming} className="px-6 py-2 rounded-lg text-sm font-bold text-black bg-cyan-400 hover:bg-cyan-500 transition-colors flex items-center gap-2 disabled:bg-gray-600">
                        {isConfirming && <SpinnerIcon className="h-5 w-5 animate-spin" />}
                        Confirmar
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const EditQuizModal: FC<{
    isOpen: boolean;
    onClose: () => void;
    quiz: Quiz | null;
    onSave: (quizId: number, newTheme: string, newDifficulty: Difficulty) => Promise<void>;
}> = ({ isOpen, onClose, quiz, onSave }) => {
    const [theme, setTheme] = useState('');
    const [difficulty, setDifficulty] = useState<Difficulty>('Médio');
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        if (quiz) {
            setTheme(quiz.theme);
            setDifficulty(quiz.difficulty);
        }
    }, [quiz]);

    if (!isOpen || !quiz) return null;

    const handleSave = async () => {
        setIsSaving(true);
        await onSave(quiz.id, theme, difficulty);
        setIsSaving(false);
    };

    return (
         <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                className="bg-[#161B22] border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg p-6"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-xl font-bold text-cyan-400 mb-6">Editar Quiz</h3>
                <div className="space-y-4">
                     <div>
                        <label htmlFor="edit-quiz-theme" className="block text-sm font-medium text-gray-400 mb-2">Tema do Quiz</label>
                        <input id="edit-quiz-theme" type="text" value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"/>
                    </div>
                    <div>
                        <label htmlFor="edit-difficulty" className="block text-sm font-medium text-gray-400 mb-2">Dificuldade</label>
                        <div className="relative">
                            <select id="edit-difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} className="appearance-none w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 pr-8">
                                <option>Fácil</option>
                                <option>Médio</option>
                                <option>Difícil</option>
                            </select>
                             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end space-x-4 mt-8">
                    <button onClick={onClose} disabled={isSaving} className="px-6 py-2 rounded-lg text-sm font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors disabled:opacity-50">
                        Cancelar
                    </button>
                    <button onClick={handleSave} disabled={isSaving || !theme.trim()} className="px-6 py-2 rounded-lg text-sm font-bold text-black bg-cyan-400 hover:bg-cyan-500 transition-colors flex items-center gap-2 disabled:bg-gray-600">
                        {isSaving && <SpinnerIcon className="h-5 w-5 animate-spin" />}
                        Salvar Alterações
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- Types for Ranking ---
interface RankingEntry {
    id: number;
    nome: string;
    telefone: string;
    loja: string;
    quizz: string;
    pontos: string;
    porcentagem: string;
}

interface QuizAttempt {
    quizz: string;
    pontos: number;
    porcentagem: number;
}

interface AggregatedRanking {
    nome: string;
    telefone: string;
    loja: string;
    totalPontos: number;
    avgPorcentagem: number;
    quizzesCount: number;
    attempts: QuizAttempt[];
}


// --- Component: RankingView ---
const RankingView: FC = () => {
    const [ranking, setRanking] = useState<AggregatedRanking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const { addNotification } = useNotification();

    const toggleRow = (telefone: string) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(telefone)) {
                newSet.delete(telefone);
            } else {
                newSet.add(telefone);
            }
            return newSet;
        });
    };

    const fetchRanking = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('https://webhook.triad3.io/webhook/vizualizarpontos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                throw new Error('Falha ao buscar o ranking do servidor.');
            }

            const data: RankingEntry[] = await response.json();
            
            // Aggregate data
            const userScores: { [telefone: string]: Omit<AggregatedRanking, 'avgPorcentagem' | 'quizzesCount'> & { totalPorcentagemRaw: number } } = {};
            
            data.forEach(entry => {
                const tel = entry.telefone;
                if (!userScores[tel]) {
                    userScores[tel] = {
                        nome: entry.nome,
                        telefone: tel,
                        loja: entry.loja,
                        totalPontos: 0,
                        totalPorcentagemRaw: 0,
                        attempts: []
                    };
                }
                const pontos = parseInt(entry.pontos, 10) || 0;
                const porcentagem = parseFloat(entry.porcentagem.replace('%', '')) || 0;
                
                userScores[tel].totalPontos += pontos;
                userScores[tel].totalPorcentagemRaw += porcentagem;
                userScores[tel].attempts.push({
                    quizz: entry.quizz,
                    pontos: pontos,
                    porcentagem: porcentagem
                });
            });
            
            const aggregatedList: AggregatedRanking[] = Object.values(userScores).map(user => ({
                ...user,
                quizzesCount: user.attempts.length,
                avgPorcentagem: user.attempts.length > 0 ? user.totalPorcentagemRaw / user.attempts.length : 0,
            })).sort((a, b) => b.totalPontos - a.totalPontos);

            setRanking(aggregatedList);
            
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro desconhecido.");
            addNotification(err.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRanking();
    }, []);

    const filteredRanking = ranking.filter(user =>
        user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.loja.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const downloadCSV = () => {
        const headers = ["Posição", "Nome", "Loja", "Telefone", "Total de Pontos", "Quizzes Respondidos", "Média de Acerto (%)", "Detalhes dos Quizzes"];
        const rows = filteredRanking.map((user, index) => {
            const quizDetails = user.attempts
                .map(a => `${a.quizz} (${a.pontos} pts, ${a.porcentagem.toFixed(1)}%)`)
                .join('; ');

            return [
                index + 1,
                `"${user.nome}"`,
                `"${user.loja}"`,
                user.telefone,
                user.totalPontos,
                user.quizzesCount,
                user.avgPorcentagem.toFixed(2),
                `"${quizDetails}"`
            ];
        });

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "ranking_ludus_ai.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addNotification("Download do CSV iniciado.", 'success');
    };


    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                 <motion.div
                    className="flex flex-col items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <SpinnerIcon className="h-12 w-12 animate-spin text-cyan-400" />
                    <p className="mt-4 text-gray-400">Carregando Ranking...</p>
                 </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16 px-4 text-red-400 bg-[#161B22] border border-red-500/30 rounded-xl">
                <p><strong>Erro:</strong> {error}</p>
                <button onClick={fetchRanking} className="mt-4 px-4 py-2 bg-cyan-500 text-black font-semibold rounded-lg">Tentar Novamente</button>
            </div>
        );
    }

    return (
        <section className="p-6 md:p-8 bg-[#161B22] border border-gray-800 rounded-xl">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-5 gap-4">
                <h2 className="text-xl font-bold text-cyan-400">Ranking Geral de Alunos</h2>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Buscar por nome ou loja..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200"
                    />
                     <button
                        onClick={downloadCSV}
                        disabled={filteredRanking.length === 0}
                        className="p-2.5 bg-gray-700 text-gray-200 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Baixar CSV"
                    >
                        <DownloadIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <div className="min-w-full">
                     <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-[#0D1117] text-left text-xs font-semibold text-gray-400 uppercase tracking-wider rounded-t-md">
                        <div className="col-span-1 text-center">#</div>
                        <div className="col-span-3">Nome</div>
                        <div className="col-span-3">Loja</div>
                        <div className="col-span-2">Pontos</div>
                        <div className="col-span-1 text-center">Quizzes</div>
                        <div className="col-span-2 text-center">Média %</div>
                    </div>
                    <div className="bg-[#161B22] rounded-b-md">
                        {filteredRanking.length === 0 ? (
                            <div className="text-center py-16 px-4 text-gray-500">
                                {ranking.length === 0 ? "Nenhum dado de ranking encontrado." : "Nenhum resultado para a sua busca."}
                            </div>
                        ) : (
                            filteredRanking.map((user, index) => {
                                const isExpanded = expandedRows.has(user.telefone);
                                return (
                                    <div key={user.telefone} className="border-b border-gray-800 last:border-b-0">
                                        <div 
                                            className="grid grid-cols-12 gap-4 px-4 py-4 items-center text-sm text-gray-200 cursor-pointer hover:bg-gray-800/50 transition-colors"
                                            onClick={() => toggleRow(user.telefone)}
                                        >
                                            <div className="col-span-1 text-center font-bold text-lg flex items-center justify-center gap-2">
                                                <span>{index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}</span>
                                                <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                            </div>
                                            <div className="col-span-3 font-medium">{user.nome}</div>
                                            <div className="col-span-3 text-gray-400">{user.loja}</div>
                                            <div className="col-span-2 font-bold text-cyan-400 text-base">{user.totalPontos}</div>
                                            <div className="col-span-1 text-center text-gray-400">{user.quizzesCount}</div>
                                            <div className="col-span-2 text-center text-gray-400">{user.avgPorcentagem.toFixed(1)}%</div>
                                        </div>
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-8 py-4 bg-gray-900/50">
                                                        <h4 className="text-sm font-semibold text-gray-400 mb-3 ml-1">Detalhes dos Quizzes</h4>
                                                        <ul className="space-y-2">
                                                            {user.attempts.map((attempt, idx) => (
                                                                <li key={idx} className="grid grid-cols-5 gap-4 text-xs p-3 rounded-lg bg-[#0D1117]">
                                                                    <span className="col-span-3 text-gray-300 truncate my-auto">{attempt.quizz}</span>
                                                                    <span className="font-semibold text-cyan-300 text-center my-auto">{attempt.pontos} Pontos</span>
                                                                    <span className="text-green-400 font-bold text-center my-auto">{attempt.porcentagem.toFixed(1)}%</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

const AdminDashboard: FC<{ adminName: string; onLogout: () => void }> = ({ adminName, onLogout }) => {
    const [activeTab, setActiveTab] = useState('Quizzes');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [quizTheme, setQuizTheme] = useState('');
    const [quizDifficulty, setQuizDifficulty] = useState<Difficulty>('Médio');
    const [adminApiKey, setAdminApiKey] = useState('');
    const [openAiModel, setOpenAiModel] = useState('gpt-4o-mini');
    const [sourceType, setSourceType] = useState<'pdf' | 'youtube'>('pdf');
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [youtubeUrl, setYoutubeUrl] = useState('');

    const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
    const [creationError, setCreationError] = useState<string | null>(null);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    
    const [showQuizPreview, setShowQuizPreview] = useState(false);
    const [pendingQuizData, setPendingQuizData] = useState<PendingQuizData | null>(null);
    const [isSavingQuiz, setIsSavingQuiz] = useState(false);
    const [quizToToggle, setQuizToToggle] = useState<Quiz | null>(null);
    const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);
    const [quizToEdit, setQuizToEdit] = useState<Quiz | null>(null);
    
    const [isDeletingQuiz, setIsDeletingQuiz] = useState(false);
    const { addNotification } = useNotification();

    const openAiModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];


    const fetchQuizzes = async () => {
        try {
            const response = await fetch('https://webhook.triad3.io/webhook/verificarferramentasadm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });

            if (!response.ok) {
                throw new Error('Falha ao buscar os quizzes do servidor.');
            }
            
            const data: any[] = await response.json();

            const mappedQuizzes: Quiz[] = data.map(item => ({
                id: item.Id,
                theme: item["Tema Do Quizz"],
                difficulty: item.Dificuldade,
                isActive: !!item.isActive,
                planJson: item.planJson || '',
                summaryText: item.summaryText || '',
                youtubeUrl: item.youtubeUrl || undefined,
            }));

            setQuizzes(mappedQuizzes.sort((a,b) => b.id - a.id));
        } catch (error) {
            console.error("Erro ao carregar quizzes do servidor:", error);
            addNotification("Não foi possível carregar os quizzes do servidor.", 'error');
        }
    };

    useEffect(() => {
        if (activeTab === 'Quizzes') {
            fetchQuizzes();
        }
        const savedKey = localStorage.getItem('ludusAdminOpenAiKey');
        if (savedKey) {
            setAdminApiKey(savedKey);
        }
        const savedModel = localStorage.getItem('ludusAdminOpenAiModel');
        if (savedModel) {
            setOpenAiModel(savedModel);
        }
    }, [activeTab]);

    const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAdminApiKey(e.target.value);
    };

    const handleSaveApiKey = () => {
        localStorage.setItem('ludusAdminOpenAiKey', adminApiKey);
        addNotification('Chave de API da OpenAI salva com sucesso!', 'success');
    };

    const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newModel = e.target.value;
        setOpenAiModel(newModel);
        localStorage.setItem('ludusAdminOpenAiModel', newModel);
        addNotification(`Modelo OpenAI padrão definido como: ${newModel}`, 'info');
    };

    const navItems = ['Quizzes', 'Ranking'];

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            if (e.target.files[0].type === 'application/pdf') {
                setPdfFile(e.target.files[0]);
                setCreationError(null);
            } else {
                addNotification('Por favor, selecione um arquivo PDF.', 'error');
                setPdfFile(null);
                if(fileInputRef.current) fileInputRef.current.value = '';
            }
        } else {
            setPdfFile(null);
        }
    };
    
    const handleToggleClick = (quiz: Quiz) => {
        setQuizToToggle(quiz);
    };

    const handleConfirmToggle = async () => {
        if (!quizToToggle) return;
    
        setIsSavingQuiz(true);
        
        const newIsActive = !quizToToggle.isActive;
        
        try {
            const response = await fetch('https://webhook.triad3.io/webhook/desligarquizz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Id: quizToToggle.id,
                    isActive: newIsActive
                })
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Falha ao comunicar com o servidor: ${errorText}`);
            }
    
            const result = await response.json();
            
            if (result.resposta !== "Quizz editado com sucesso!") {
                throw new Error(result.resposta || "Resposta inesperada do servidor.");
            }
    
            setQuizzes(prevQuizzes => 
                prevQuizzes.map(q => 
                    q.id === quizToToggle.id ? { ...q, isActive: newIsActive } : q
                )
            );
            
            addNotification(result.resposta, 'success');
    
        } catch (error: any) {
            console.error("Erro ao alterar o status do quiz:", error);
            addNotification(`Não foi possível alterar o status do quiz: ${error.message}`, 'error');
        } finally {
            setIsSavingQuiz(false);
            setQuizToToggle(null);
        }
    };
    
    const handleUpdateQuiz = async (quizId: number, newTheme: string, newDifficulty: Difficulty) => {
        setIsSavingQuiz(true);
        try {
            const response = await fetch('https://webhook.triad3.io/webhook/editarquizz-ludus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Id: quizId,
                    "Tema Do Quizz": newTheme,
                    "Dificuldade": newDifficulty,
                })
            });
            if (!response.ok) {
                 const errorText = await response.text();
                 throw new Error(`Falha ao atualizar o quiz: ${errorText}`);
            }
            const result = await response.json();
            if (result.resposta !== "Quizz editado com sucesso!") {
                 throw new Error(result.resposta || "Resposta inesperada do servidor.");
            }
            addNotification('Quiz atualizado com sucesso!', 'success');
            setQuizToEdit(null);
            await fetchQuizzes();
        } catch (error: any) {
            console.error("Erro ao atualizar o quiz:", error);
            addNotification(`Não foi possível atualizar o quiz: ${error.message}`, 'error');
        } finally {
            setIsSavingQuiz(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!quizToDelete) return;
    
        setIsDeletingQuiz(true);
        
        try {
            const response = await fetch('https://webhook.triad3.io/webhook/excluirquizz-ludus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({Id: quizToDelete.id})
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `Falha ao comunicar com o servidor: ${response.statusText}`);
            }

            // Gracefully handle empty or non-JSON success responses from the delete endpoint.
            const responseText = await response.text();
            const successMessage = "Quizz excluido com sucesso!";

            // The delete endpoint might return an empty body or a non-JSON string on success.
            // We check for an empty body or if the success message string is present.
            if (!responseText.trim() || responseText.includes(successMessage)) {
                setQuizzes(prevQuizzes => prevQuizzes.filter(q => q.id !== quizToDelete.id));
                addNotification(successMessage, 'success');
            } else {
                // If there's a response body but it's not the success message, it might be a JSON error.
                let errorMessage = responseText;
                try {
                    const result = JSON.parse(responseText);
                    errorMessage = result.resposta || errorMessage;
                } catch (e) {
                    // It's not JSON, so we'll use the raw text as the error message.
                }
                throw new Error(errorMessage);
            }
    
        } catch (error: any) {
            console.error("Erro ao excluir quiz:", error);
            addNotification(`Não foi possível excluir o quiz: ${error.message}`, 'error');
        } finally {
            setIsDeletingQuiz(false);
            setQuizToDelete(null);
        }
    };

    const resetForm = () => {
        setQuizTheme('');
        setQuizDifficulty('Médio');
        setPdfFile(null);
        setYoutubeUrl('');
        setSourceType('pdf');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setCreationError(null);
    };

    const handleCreateQuiz = async () => {
        setCreationError(null);
        const keyToUse = adminApiKey || OPENAI_API_KEY;

        if (keyToUse === "COLE_SUA_CHAVE_API_AQUI" || !keyToUse.trim()) {
            setCreationError("Erro: A chave de API da OpenAI precisa ser configurada no painel ou no código-fonte.");
            return;
        }

        const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        if (!quizTheme.trim() || (sourceType === 'pdf' && !pdfFile) || (sourceType === 'youtube' && !youtubeUrlPattern.test(youtubeUrl))) {
            setCreationError('Por favor, preencha o tema e forneça uma fonte de conteúdo válida (PDF ou link do YouTube).');
            return;
        }
        setIsCreatingQuiz(true);
    
        try {
            const openai = new OpenAI({ apiKey: keyToUse, dangerouslyAllowBrowser: true });
            let planPromise: Promise<OpenAI.Chat.Completions.ChatCompletion>;
            let summaryPromise: Promise<OpenAI.Chat.Completions.ChatCompletion>;
            let sourceForSaving: { youtubeUrl?: string; };
    
            const quizPlanJsonInstruction = `Sua resposta DEVE ser um objeto JSON válido que corresponda estritamente a este esquema: { "questions": Array<{ "questionText": string, "options": Array<string>[4], "correctOptionIndex": integer(0-3), "explanation": string }>[15], "finalFeedbackRules": string }. NÃO inclua markdown, comentários ou qualquer outro texto fora do objeto JSON.`;
            
            if (sourceType === 'pdf' && pdfFile) {
                const contentParts = await processPdfForMultimodal(pdfFile);
                sourceForSaving = {};
                
                const openAiContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = contentParts.map(part => {
                    if (part.inlineData) {
                        return { type: 'image_url', image_url: { url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` } };
                    }
                    return { type: 'text', text: part.text };
                });

                const planSystemInstruction = `Você é um designer instrucional especialista. Sua tarefa é criar um plano detalhado para um quiz de 15 questões de múltipla escolha com base no conteúdo do documento fornecido (que inclui imagens e texto). O quiz deve ter uma dificuldade '${quizDifficulty}'. É fundamental que todo o conteúdo gerado seja 100% baseado no que está no documento. NÃO use nenhum conhecimento externo.`;
                const planPrompt = `Com base nas páginas do documento a seguir (fornecidas como imagens e texto extraído), crie o plano do quiz.`;
                const planMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
                    { role: 'system', content: planSystemInstruction },
                    { role: 'user', content: [ { type: 'text', text: `${planPrompt}\n\n${quizPlanJsonInstruction}` }, ...openAiContent ]}
                ];

                planPromise = openai.chat.completions.create({
                    model: 'gpt-4o', // Force gpt-4o for multimodal input
                    messages: planMessages,
                    response_format: { type: "json_object" }
                });

                const summarySystemInstruction = `Você é um especialista em educação de adultos. Sua tarefa é criar um resumo envolvente e fácil de entender do conteúdo do documento fornecido (que inclui imagens e texto), usando títulos, listas e destacando os pontos mais importantes. É fundamental que o resumo seja 100% baseado no que está no documento. NÃO use nenhum conhecimento externo.`;
                const summaryPrompt = `Com base nas páginas do documento a seguir (fornecidas como imagens e texto extraído), crie um resumo do conteúdo.`;
                const summaryMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
                    { role: 'system', content: summarySystemInstruction },
                    { role: 'user', content: [ { type: 'text', text: summaryPrompt }, ...openAiContent ]}
                ];
                
                summaryPromise = openai.chat.completions.create({
                    model: 'gpt-4o', // Force gpt-4o for multimodal input
                    messages: summaryMessages,
                });

            } else if (sourceType === 'youtube' && youtubeUrl.trim()) {
                sourceForSaving = { youtubeUrl };

                const planSystemInstruction = `Você é um designer instrucional especialista. Sua tarefa é criar um plano detalhado para um quiz de 15 questões de múltipla escolha com base no conteúdo de um vídeo do YouTube. O quiz deve ter uma dificuldade '${quizDifficulty}'.`;
                const planContents = `O vídeo está no link: ${youtubeUrl}. O tema principal é: '${quizTheme}'. Com base nessas informações, crie o conteúdo do quiz. NÃO tente acessar a URL, mas use o tema e o link como contexto para gerar um quiz relevante. Gere 15 questões de múltipla escolha. É fundamental que o conteúdo gerado seja consistente com o que se esperaria de um vídeo sobre este tema.`;

                planPromise = openai.chat.completions.create({
                    model: openAiModel,
                    messages: [
                        { role: 'system', content: planSystemInstruction },
                        { role: 'user', content: `${planContents}\n\n${quizPlanJsonInstruction}` }
                    ],
                    response_format: { type: "json_object" }
                });

                const summarySystemInstruction = `Você é um especialista em educação de adultos. Sua tarefa é criar um resumo envolvente e fácil de entender do conteúdo de um vídeo do YouTube, usando títulos, listas e destacando os pontos mais importantes.`;
                const summaryContents = `O vídeo está no link: ${youtubeUrl}. O tema principal é: '${quizTheme}'. Com base nessas informações, crie um resumo do conteúdo. NÃO tente acessar a URL, mas use o tema e o link como contexto para gerar um resumo relevante e bem estruturado.`;
                summaryPromise = openai.chat.completions.create({
                    model: openAiModel,
                    messages: [
                        { role: 'system', content: summarySystemInstruction },
                        { role: 'user', content: summaryContents }
                    ],
                });
            } else {
                 throw new Error("Fonte de conteúdo inválida.");
            }

            const [planResponse, summaryResponse] = await Promise.all([planPromise, summaryPromise]);
            const planJson = planResponse.choices[0].message.content;
            const summaryText = summaryResponse.choices[0].message.content;

            if (!planJson || !summaryText) {
                throw new Error("A API não retornou conteúdo para o plano ou resumo.");
            }
    
            setPendingQuizData({ 
                theme: quizTheme, 
                difficulty: quizDifficulty, 
                ...sourceForSaving,
                planJson, 
                summaryText, 
            });
            setShowQuizPreview(true);
    
        } catch (error) {
            console.error("Erro ao criar quiz com a IA:", error);
            setCreationError("Ocorreu uma falha ao gerar o quiz com a IA. Verifique sua chave de API e tente novamente.");
        } finally {
            setIsCreatingQuiz(false);
        }
    };
    
    const handleApproveQuiz = async () => {
        if (!pendingQuizData) return;
    
        setShowQuizPreview(false);
        setIsSavingQuiz(true);
    
        const quizDataForApi = {
            "Tema Do Quizz": pendingQuizData.theme,
            "Dificuldade": pendingQuizData.difficulty,
            "isActive": true,
            "planJson": pendingQuizData.planJson,
            "summaryText": pendingQuizData.summaryText,
            "youtubeUrl": pendingQuizData.youtubeUrl,
        };
    
        try {
            const cleanedData = Object.fromEntries(Object.entries(quizDataForApi).filter(([_, v]) => v != null));

            const response = await fetch('https://webhook.triad3.io/webhook/salvarquizz-ludus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cleanedData)
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Server Response on Error:", errorText);
                throw new Error(`Falha ao salvar o quiz no servidor. Status: ${response.status}`);
            }
    
            const result = await response.json();
    
            await fetchQuizzes();
    
            addNotification(result.resposta || "Quiz salvo com sucesso!", 'success');
    
        } catch (error: any) {
            console.error("Erro ao salvar o quiz:", error);
            addNotification("Ocorreu um erro ao salvar o quiz: " + error.message, 'error');
        } finally {
            setIsSavingQuiz(false);
            setPendingQuizData(null);
            resetForm();
        }
    };
    
    const handleRejectQuiz = () => {
        setShowQuizPreview(false);
        setPendingQuizData(null);
        addNotification('Criação do quiz rejeitada. Ajuste os dados e tente novamente.', 'info');
    };
    
    const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    const isFormValid = quizTheme.trim() !== '' && (sourceType === 'pdf' ? !!pdfFile : youtubeUrlPattern.test(youtubeUrl));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8"
        >
            <AnimatePresence>
                {showQuizPreview && pendingQuizData && (
                    <QuizPreviewModal
                        pendingQuizData={pendingQuizData}
                        onApprove={handleApproveQuiz}
                        onReject={handleRejectQuiz}
                        openAiModel={openAiModel}
                        apiKey={adminApiKey}
                    />
                )}
                 {quizToEdit && (
                    <EditQuizModal
                        isOpen={!!quizToEdit}
                        onClose={() => setQuizToEdit(null)}
                        quiz={quizToEdit}
                        onSave={handleUpdateQuiz}
                    />
                )}
                {isSavingQuiz && <SavingSpinner text={quizToEdit ? "Atualizando quiz..." : "Salvando quiz..."} />}
                 {quizToToggle && (
                    <ConfirmationModal
                        isOpen={!!quizToToggle}
                        onClose={() => setQuizToToggle(null)}
                        onConfirm={handleConfirmToggle}
                        title="Confirmar Alteração de Status"
                        isConfirming={isSavingQuiz}
                    >
                        <p>Você tem certeza que deseja <strong>{quizToToggle.isActive ? 'desativar' : 'ativar'}</strong> este quiz?</p>
                        <p className="mt-2 text-sm text-gray-500">Tema: "{quizToToggle.theme}"</p>
                    </ConfirmationModal>
                )}
                {quizToDelete && (
                    <ConfirmationModal
                        isOpen={!!quizToDelete}
                        onClose={() => setQuizToDelete(null)}
                        onConfirm={handleConfirmDelete}
                        title="Confirmar Exclusão"
                        isConfirming={isDeletingQuiz}
                    >
                        <p>Você tem certeza que deseja <strong>excluir permanentemente</strong> este quiz?</p>
                        <p className="mt-2 text-sm text-gray-500">Tema: "{quizToDelete.theme}"</p>
                        <p className="mt-4 text-xs text-red-400">Esta ação não pode ser desfeita.</p>
                    </ConfirmationModal>
                )}
            </AnimatePresence>

            <header className="flex justify-between items-center pb-4 border-b border-gray-800">
                <h1 className="text-2xl md:text-3xl font-bold text-cyan-400">Painel do Administrador</h1>
                <button onClick={onLogout} className="text-sm font-semibold border border-gray-700 rounded-md px-4 py-2 hover:bg-gray-800 hover:border-cyan-400 transition-colors duration-200">
                    SAIR
                </button>
            </header>

            <nav className="flex items-center space-x-2 md:space-x-4 border-b border-gray-800 mt-4 overflow-x-auto pb-2">
                {navItems.map(item => (
                    <button
                        key={item}
                        onClick={() => setActiveTab(item)}
                        className={`py-2 px-3 md:px-4 text-sm md:text-base font-medium transition-all duration-200 rounded-lg whitespace-nowrap
                            ${activeTab === item
                                ? 'text-cyan-400 border border-cyan-400 bg-cyan-400/10'
                                : 'text-gray-400 hover:text-white border border-transparent'
                            }`}
                    >
                        {item}
                    </button>
                ))}
            </nav>

            <main className="mt-8 space-y-8">
                {activeTab === 'Quizzes' && (
                  <>
                    <section className="p-6 md:p-8 bg-[#161B22] border border-gray-800 rounded-xl">
                        <h2 className="text-xl font-bold text-cyan-400 mb-2">Gerar Novo Quiz com OpenAI</h2>
                        <p className="text-sm text-gray-400 mb-6">Crie um quiz interativo a partir de um PDF ou um link do YouTube.</p>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                <div className="md:col-span-1">
                                    <label htmlFor="quiz-theme" className="block text-sm font-medium text-gray-400 mb-2">Tema do Quiz</label>
                                    <input id="quiz-theme" type="text" placeholder="Ex: Protocolos de Segurança" value={quizTheme} onChange={(e) => setQuizTheme(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"/>
                                </div>
                                
                                <div className="md:col-span-1">
                                    <label htmlFor="difficulty" className="block text-sm font-medium text-gray-400 mb-2">Dificuldade</label>
                                    <div className="relative">
                                        <select id="difficulty" value={quizDifficulty} onChange={(e) => setQuizDifficulty(e.target.value as Difficulty)} className="appearance-none w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 pr-8">
                                            <option>Fácil</option>
                                            <option>Médio</option>
                                            <option>Difícil</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="admin-api-key" className="block text-sm font-medium text-gray-400 mb-2">Chave API OpenAI</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            id="admin-api-key"
                                            type="password"
                                            placeholder="Cole sua chave aqui (ex: sk-...)"
                                            value={adminApiKey}
                                            onChange={handleApiKeyChange}
                                            className="flex-1 w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
                                        />
                                        <button
                                            onClick={handleSaveApiKey}
                                            className="bg-gray-700 text-gray-200 px-4 py-2.5 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors text-sm font-medium"
                                        >
                                            Salvar
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">A chave salva aqui será usada para gerar e pré-visualizar quizzes. Se vazia, usará a chave do sistema.</p>
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="openai-model" className="block text-sm font-medium text-gray-400 mb-2">Modelo OpenAI Padrão</label>
                                    <div className="relative">
                                        <select id="openai-model" value={openAiModel} onChange={handleModelChange} className="appearance-none w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 pr-8">
                                            {openAiModels.map(model => <option key={model} value={model}>{model}</option>)}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Este modelo será usado para fontes de conteúdo que não sejam PDF.</p>
                                 </div>
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Fonte do Conteúdo</label>
                                 <div className="flex items-center gap-4 rounded-lg bg-gray-900 p-1">
                                    <button onClick={() => setSourceType('pdf')} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${sourceType === 'pdf' ? 'bg-cyan-400 text-black' : 'hover:bg-gray-800'}`}>
                                        Arquivo PDF
                                    </button>
                                    <button onClick={() => setSourceType('youtube')} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${sourceType === 'youtube' ? 'bg-cyan-400 text-black' : 'hover:bg-gray-800'}`}>
                                        Link do YouTube
                                    </button>
                                 </div>
                            </div>

                            <AnimatePresence mode="wait">
                            <motion.div
                                key={sourceType}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {sourceType === 'pdf' ? (
                                    <div>
                                        <label htmlFor="pdf-file" className="block text-sm font-medium text-gray-400 mb-2">Arquivo PDF <span className="text-xs text-gray-500">(usará gpt-4o)</span></label>
                                        <div className="flex items-center">
                                            <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-gray-700 text-gray-200 px-4 py-2.5 rounded-l-lg hover:bg-gray-600 transition-colors duration-200 z-10 whitespace-nowrap text-sm font-medium">Escolher arquivo</button>
                                            <div className="flex-1 bg-gray-900 border border-l-0 border-gray-700 rounded-r-lg px-3 py-2.5 text-gray-500 truncate text-sm">
                                                {pdfFile?.name || 'Nenhum arquivo escolhido'}
                                            </div>
                                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf"/>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label htmlFor="youtube-url" className="block text-sm font-medium text-gray-400 mb-2">Link do YouTube</label>
                                        <input id="youtube-url" type="url" placeholder="https://www.youtube.com/watch?v=..." value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"/>
                                    </div>
                                )}
                            </motion.div>
                            </AnimatePresence>

                             <div className="pt-2">
                                <button onClick={handleCreateQuiz} disabled={!isFormValid || isCreatingQuiz} className="w-auto bg-cyan-400 text-black font-bold px-8 py-2.5 rounded-lg hover:bg-cyan-500 transition-colors shadow-md hover:shadow-lg shadow-cyan-500/10 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2">
                                    {isCreatingQuiz ? (
                                        <>
                                            <SpinnerIcon className="animate-spin h-5 w-5" />
                                            <span>Criando Quiz...</span>
                                        </>
                                    ) : (
                                        'GERAR QUIZ'
                                    )}
                                </button>
                                <AnimatePresence>
                                    {creationError && (
                                        <motion.p
                                            className="mt-4 text-sm text-red-400"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                        >
                                            {creationError}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </section>

                    <section className="p-6 md:p-8 bg-[#161B22] border border-gray-800 rounded-xl">
                        <h2 className="text-xl font-bold text-cyan-400 mb-5">Quizzes Existentes</h2>
                        <div className="overflow-x-auto">
                            <div className="min-w-full">
                                 <div className="grid grid-cols-10 gap-4 px-4 py-3 bg-[#0D1117] text-left text-xs font-semibold text-gray-400 uppercase tracking-wider rounded-t-md">
                                    <div className="col-span-1">Ativo</div>
                                    <div className="col-span-5">Tema</div>
                                    <div className="col-span-2">Dificuldade</div>
                                    <div className="col-span-2 text-left">Ações</div>
                                </div>
                                <div className="bg-[#161B22] rounded-b-md">
                                    {quizzes.length === 0 ? (
                                        <div className="text-center py-16 px-4 text-gray-500">
                                            Nenhum quiz cadastrado.
                                        </div>
                                    ) : (
                                        quizzes.map((quiz, index) => (
                                           <div key={quiz.id} className={`grid grid-cols-10 gap-4 px-4 py-4 items-center text-sm text-gray-200 ${index < quizzes.length -1 ? 'border-b border-gray-800' : ''}`}>
                                                <div className="col-span-1">
                                                    <ToggleSwitch isActive={quiz.isActive} onToggle={() => handleToggleClick(quiz)} />
                                                </div>
                                                <div className="col-span-5 font-medium">{quiz.theme}</div>
                                                <div className="col-span-2">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                        quiz.difficulty === 'Fácil' ? 'bg-green-500/20 text-green-300' :
                                                        quiz.difficulty === 'Médio' ? 'bg-yellow-500/20 text-yellow-300' :
                                                        'bg-red-500/20 text-red-300'
                                                    }`}>
                                                        {quiz.difficulty}
                                                    </span>
                                                </div>
                                                <div className="col-span-2 flex items-center space-x-4">
                                                    <button onClick={() => setQuizToEdit(quiz)} className="text-gray-400 hover:text-cyan-400 transition-colors" aria-label="Editar Quiz">
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                    <button onClick={() => setQuizToDelete(quiz)} className="text-gray-400 hover:text-red-500 transition-colors" aria-label="Excluir Quiz">
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                           </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                  </>
                )}
                {activeTab === 'Ranking' && (
                  <RankingView />
                )}
            </main>
        </motion.div>
    );
};


// --- Componentes do Aluno ---

const StudentQuizView: FC<{ 
    quiz: Quiz; 
    studentData: StudentData | null; 
    onExit: () => void; 
    onQuizComplete: (quizId: number) => void;
}> = ({ quiz, studentData, onExit, onQuizComplete }) => {
    return (
        <motion.div
            className="fixed inset-0 z-[80] bg-[#0D1117] flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <header className="flex-shrink-0 bg-[#161B22] p-4 flex justify-between items-center border-b border-gray-800">
                <h2 className="text-lg font-bold text-cyan-400 truncate">{quiz.theme}</h2>
            </header>
            <div className="flex-1 overflow-hidden">
                <InteractiveQuiz 
                    planJson={quiz.planJson} 
                    summaryText={quiz.summaryText}
                    quizId={quiz.id}
                    quizTitle={quiz.theme}
                    studentData={studentData}
                    onExit={onExit}
                    onQuizComplete={onQuizComplete}
                />
            </div>
        </motion.div>
    );
};


const StudentDashboard: FC<{ 
    studentName: string | undefined; 
    materials: Quiz[]; 
    onStartQuiz: (quiz: Quiz) => void; 
    onLogout: () => void; 
    answeredQuizIds: Set<number>;
}> = ({ studentName, materials, onStartQuiz, onLogout, answeredQuizIds }) => {
    return (
         <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8"
        >
             <header className="flex justify-between items-center pb-4 border-b border-gray-800">
                <div>
                    <p className="text-gray-400 mt-1 text-2xl">Bem-vindo(a), <span className="font-bold text-cyan-400">{studentName || 'Aluno(a)'}</span>!</p>
                </div>
                <button onClick={onLogout} className="text-sm font-semibold border border-gray-700 rounded-md px-4 py-2 hover:bg-gray-800 hover:border-cyan-400 transition-colors duration-200">
                    SAIR
                </button>
            </header>
            
            <main className="mt-8">
                 <section className="p-6 md:p-8 bg-[#161B22] border border-gray-800 rounded-xl">
                    <h2 className="text-xl font-bold text-cyan-400 mb-5">Materiais Disponíveis</h2>
                    {materials.length === 0 ? (
                        <div className="text-center py-16 px-4 text-gray-500">
                            Nenhum material de estudo disponível no momento.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <div className="min-w-full">
                                <div className="grid grid-cols-10 gap-4 px-4 py-3 bg-[#0D1117] text-left text-xs font-semibold text-gray-400 uppercase tracking-wider rounded-t-md">
                                    <div className="col-span-6">Tema</div>
                                    <div className="col-span-2">Dificuldade</div>
                                    <div className="col-span-2 text-left">Ação</div>
                                </div>
                                <div className="bg-[#161B22] rounded-b-md">
                                    {materials.map((material, index) => {
                                       const isAnswered = answeredQuizIds.has(material.id);
                                       return (
                                           <div key={material.id} className={`grid grid-cols-10 gap-4 px-4 py-4 items-center text-sm text-gray-200 ${index < materials.length - 1 ? 'border-b border-gray-800' : ''}`}>
                                                <div className="col-span-6 font-medium">{material.theme}</div>
                                                <div className="col-span-2">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                        material.difficulty === 'Fácil' ? 'bg-green-500/20 text-green-300' :
                                                        material.difficulty === 'Médio' ? 'bg-yellow-500/20 text-yellow-300' :
                                                        'bg-red-500/20 text-red-300'
                                                    }`}>
                                                        {material.difficulty}
                                                    </span>
                                                </div>
                                                <div className="col-span-2 text-left">
                                                    <button
                                                        onClick={() => onStartQuiz(material)}
                                                        disabled={isAnswered}
                                                        className="bg-cyan-400 text-black font-bold py-2 px-4 rounded-lg shadow-md text-xs hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-400 transition-all duration-200
                                                                   disabled:bg-green-600 disabled:text-white disabled:cursor-not-allowed disabled:opacity-75"
                                                    >
                                                        {isAnswered ? 'Respondido' : 'Iniciar Quiz'}
                                                    </button>
                                                </div>
                                           </div>
                                       );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                 </section>
            </main>
        </motion.div>
    );
};

// --- Componente Principal: App ---
const App: FC = () => {
    // --- State Management ---
    const [view, setView] = useState<ViewType>('user');
    const [isLoading, setIsLoading] = useState(false);
    const [studentData, setStudentData] = useState<StudentData | null>(null);
    const [adminName, setAdminName] = useState('');
    const [studentMaterials, setStudentMaterials] = useState<Quiz[]>([]);
    const [answeredQuizIds, setAnsweredQuizIds] = useState(new Set<number>());
    const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);

    // --- Handlers ---
    const handleStartQuiz = (quiz: Quiz) => {
        setCurrentQuiz(quiz);
    };

    const handleQuizComplete = (quizId: number) => {
        setAnsweredQuizIds(prev => new Set(prev).add(quizId));
        // A navegação de volta para o painel é tratada por handleExitQuiz
    };

    const handleExitQuiz = () => {
        setCurrentQuiz(null);
    };

    const handleLogout = () => {
        setIsLoading(true);
        setTimeout(() => {
            setView('user');
            setStudentData(null);
            setAdminName('');
            setStudentMaterials([]);
            setAnsweredQuizIds(new Set());
            setCurrentQuiz(null);
            setIsLoading(false);
        }, 300);
    };


    // --- Render Logic ---
    const renderContent = () => {
        switch (view) {
            case 'user':
            case 'adminLogin':
                return (
                    <div className="w-full min-h-full flex items-center justify-center p-4">
                        {view === 'user' ? (
                            <>
                                <UserLoginForm
                                    setIsLoading={setIsLoading}
                                    setView={setView}
                                    setStudentData={setStudentData}
                                    setStudentMaterials={setStudentMaterials}
                                    setAnsweredQuizIds={setAnsweredQuizIds}
                                />
                                <AdminAccessButton onClick={() => setView('adminLogin')} />
                            </>
                        ) : (
                            <AdminLoginForm setIsLoading={setIsLoading} setView={setView} setAdminName={setAdminName} />
                        )}
                    </div>
                );
            case 'dashboard':
                return <AdminDashboard adminName={adminName} onLogout={handleLogout} />;
            case 'studentDashboard':
                return <StudentDashboard
                    studentName={studentData?.fullName}
                    materials={studentMaterials}
                    onStartQuiz={handleStartQuiz}
                    onLogout={handleLogout}
                    answeredQuizIds={answeredQuizIds}
                />;
            default:
                setView('user');
                return null;
        }
    };
    
    return (
        <div className="relative min-h-full w-full bg-gray-900 text-gray-200 overflow-y-auto">
            <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
            <style>{`.bg-grid-pattern { background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px); background-size: 20px 20px; }`}</style>
            
            <AnimatePresence mode="wait">
                {isLoading && <LoadingSpinner text={view.includes('Login') ? 'Verificando credenciais...' : 'Carregando...'} />}
            </AnimatePresence>
            
            <AnimatePresence>
                {currentQuiz && (
                    <StudentQuizView
                        quiz={currentQuiz}
                        studentData={studentData}
                        onExit={handleExitQuiz}
                        onQuizComplete={handleQuizComplete}
                    />
                )}
            </AnimatePresence>

            {renderContent()}
        </div>
    );
};


const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Elemento root não foi encontrado no DOM.");
}

const root = createRoot(rootElement);

root.render(
    <React.StrictMode>
        <NotificationProvider>
            <App />
        </NotificationProvider>
    </React.StrictMode>
);