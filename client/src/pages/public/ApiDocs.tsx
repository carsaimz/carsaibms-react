import { useState } from 'react';
import { Code, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { useTranslation } from 'react-i18next';

const BASE = typeof window !== 'undefined' ? window.location.origin + '/api' : '/api';

const ENDPOINTS = [
  { method: 'GET',  path: '/products',                  auth: false, desc: 'Listar produtos (paginado, filtros)' },
  { method: 'GET',  path: '/products/:id',              auth: false, desc: 'Detalhe de produto por ID ou slug' },
  { method: 'GET',  path: '/services',                  auth: false, desc: 'Listar serviços' },
  { method: 'GET',  path: '/categories',                auth: false, desc: 'Listar categorias' },
  { method: 'POST', path: '/contact',                   auth: false, desc: 'Enviar mensagem de contacto' },
  { method: 'POST', path: '/auth/register',             auth: false, desc: 'Registar nova conta de cliente' },
  { method: 'POST', path: '/auth/login',                auth: false, desc: 'Login — retorna access token' },
  { method: 'POST', path: '/auth/refresh',              auth: false, desc: 'Renovar access token via cookie' },
  { method: 'POST', path: '/auth/logout',               auth: false, desc: 'Terminar sessão' },
  { method: 'GET',  path: '/auth/me',                   auth: true,  desc: 'Perfil do utilizador autenticado' },
  { method: 'GET',  path: '/customer/dashboard',        auth: true,  desc: 'Resumo do dashboard do cliente' },
  { method: 'GET',  path: '/customer/orders',           auth: true,  desc: 'Pedidos do cliente (paginado)' },
  { method: 'GET',  path: '/customer/orders/:id',       auth: true,  desc: 'Detalhe de pedido com itens' },
  { method: 'GET',  path: '/customer/tickets',          auth: true,  desc: 'Tickets de suporte' },
  { method: 'POST', path: '/customer/tickets',          auth: true,  desc: 'Criar ticket' },
  { method: 'POST', path: '/customer/tickets/:id/messages', auth: true, desc: 'Responder a ticket' },
  { method: 'GET',  path: '/customer/profile',          auth: true,  desc: 'Perfil do cliente' },
  { method: 'PUT',  path: '/customer/profile',          auth: true,  desc: 'Actualizar perfil' },
  { method: 'GET',  path: '/customer/notifications',    auth: true,  desc: 'Notificações não lidas' },
  { method: 'POST', path: '/payments/initiate',         auth: true,  desc: 'Iniciar pagamento (M-Pesa, PayPal, Stripe...)' },
  { method: 'GET',  path: '/payments/status/:ref',      auth: true,  desc: 'Estado de um pagamento' },
];

const LANGS: Record<string, (ep: typeof ENDPOINTS[0]) => string> = {
  'cURL': (ep) => `curl -s -X ${ep.method} "${BASE}${ep.path}"${ep.auth ? ' \\\n  -H "Authorization: Bearer {TOKEN}"' : ''}`,
  'JavaScript': (ep) => `const res = await fetch('${BASE}${ep.path}', {\n  method: '${ep.method}',\n  headers: {${ep.auth ? "\n    'Authorization': 'Bearer ' + token," : ''}\n    'Content-Type': 'application/json'\n  }\n});\nconst data = await res.json();`,
  'Python': (ep) => `import requests\nr = requests.${ep.method.toLowerCase()}(\n  '${BASE}${ep.path}',\n  headers=${ep.auth ? "{'Authorization': f'Bearer {token}'}" : '{}'}\n)\nprint(r.json())`,
  'PHP': (ep) => `<?php\n$ch = curl_init('${BASE}${ep.path}');\ncurl_setopt_array($ch, [\n  CURLOPT_CUSTOMREQUEST => '${ep.method}',\n  CURLOPT_RETURNTRANSFER => true,\n  CURLOPT_HTTPHEADER => [${ep.auth ? "\n    'Authorization: Bearer ' . $token," : ''}\n    'Content-Type: application/json'\n  ]\n]);\n$res = json_decode(curl_exec($ch), true);`,
};

const M_COLORS: Record<string, string> = {
  GET: 'bg-green-100 text-green-700', POST: 'bg-blue-100 text-blue-700',
  PUT: 'bg-amber-100 text-amber-700', DELETE: 'bg-red-100 text-red-700',
};

function Endpoint({ ep }: { ep: typeof ENDPOINTS[0] }) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState('cURL');
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
      <button onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-800/50">
        <span className={`rounded px-2 py-0.5 font-mono text-xs font-bold ${M_COLORS[ep.method]}`}>{ep.method}</span>
        <code className="flex-1 text-sm font-semibold">{ep.path}</code>
        {ep.auth && <span className="text-xs text-amber-500">🔒</span>}
        {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>
      {open && (
        <div className="border-t border-gray-100 dark:border-slate-700">
          <p className="px-4 py-2.5 text-sm text-gray-600 dark:text-slate-300">{ep.desc}</p>
          <div className="border-t border-gray-100 dark:border-slate-700">
            <div className="flex gap-0 overflow-x-auto border-b border-gray-100 dark:border-slate-700">
              {Object.keys(LANGS).map((l) => (
                <button key={l} onClick={() => setLang(l)}
                  className={`whitespace-nowrap px-3 py-2 text-xs font-semibold transition-colors ${lang === l ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'}`}>
                  {l}
                </button>
              ))}
            </div>
            <pre className="overflow-x-auto bg-slate-900 p-4 text-xs text-slate-200 font-mono leading-relaxed">
              {LANGS[lang](ep)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApiDocs() {
  const { t } = useTranslation(); // API docs stay technical/English-first by convention
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-6">
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/40">
              <Code className="h-5 w-5 text-primary-600" />
            </div>
            <h1 className="text-3xl font-black">API Reference</h1>
          </div>
          <p className="text-gray-500 dark:text-slate-400">REST API completa — JSON, autenticação Bearer Token</p>
        </div>
        <a href={BASE + '/health'} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:border-primary-300 hover:text-primary-600 dark:border-slate-700">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          API Online <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {[['URL Base', BASE], ['Formato', 'JSON'], ['Auth', 'Bearer Token']].map(([k, v]) => (
          <Card key={k}><CardBody>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{k}</p>
            <p className="mt-1 font-mono text-sm font-semibold">{v}</p>
          </CardBody></Card>
        ))}
      </div>

      <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 dark:border-blue-800/40 dark:bg-blue-900/20 dark:text-blue-300">
        🔒 <strong>Autenticação:</strong> Endpoints marcados com 🔒 requerem o header{' '}
        <code className="rounded bg-blue-100 px-1 dark:bg-blue-900/40">Authorization: Bearer {'{'+'TOKEN}'+'}'}</code>.
        Obtenha o token via <code className="rounded bg-blue-100 px-1 dark:bg-blue-900/40">POST /auth/login</code>.
      </div>

      <Card>
        <CardHeader><CardTitle>Todos os Endpoints ({ENDPOINTS.length})</CardTitle></CardHeader>
        <CardBody className="flex flex-col gap-2">
          {ENDPOINTS.map((ep) => <Endpoint key={ep.method + ep.path} ep={ep} />)}
        </CardBody>
      </Card>
    </div>
  );
}
