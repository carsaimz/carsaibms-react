import { useState } from 'react';
import { Shield } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';

const ROLES = [
  { key: 'admin',    label: 'Administrador', color: 'text-red-600 bg-red-50', desc: 'Acesso total ao sistema.' },
  { key: 'manager',  label: 'Gestor',        color: 'text-amber-600 bg-amber-50', desc: 'Gestão de pedidos, produtos, clientes e relatórios. Sem acesso a utilizadores e sistema.' },
  { key: 'seller',   label: 'Vendedor',      color: 'text-blue-600 bg-blue-50', desc: 'POS, stock básico, relatórios de vendas próprias.' },
  { key: 'staff',    label: 'Staff',         color: 'text-purple-600 bg-purple-50', desc: 'Tickets de suporte, tarefas, mensagens internas.' },
  { key: 'customer', label: 'Cliente',       color: 'text-green-600 bg-green-50', desc: 'Portal do cliente: pedidos, facturas, tickets, perfil.' },
];

const PERMISSIONS: Record<string, string[]> = {
  admin:    ['Tudo'],
  manager:  ['Pedidos (CRUD)', 'Produtos (CRUD)', 'Serviços (CRUD)', 'Clientes (leitura)', 'Tickets (responder)', 'Relatórios', 'Definições básicas'],
  seller:   ['POS (vender)', 'Stock (ajuste)', 'Produtos (leitura)', 'Vendas próprias'],
  staff:    ['Tarefas próprias', 'Tickets (responder)', 'Pedidos (leitura)', 'Produtos (leitura)', 'Clientes (leitura)'],
  customer: ['Pedidos próprios', 'Facturas', 'Tickets de suporte', 'Perfil', 'Pagamentos'],
};

export default function AdminRoles() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary-600" />
        <h1 className="text-xl font-bold">Roles e Permissões</h1>
      </div>
      <p className="text-sm text-gray-500 dark:text-slate-400">
        O Carsai BMS usa 5 roles fixos. Para alterar o role de um utilizador, vá a{' '}
        <a href="/admin/users" className="font-semibold text-primary-600 hover:underline">Utilizadores</a>.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ROLES.map(role => (
          <Card key={role.key}
            className={`cursor-pointer transition-all hover:shadow-md ${selected === role.key ? 'ring-2 ring-primary-500' : ''}`}
            onClick={() => setSelected(s => s === role.key ? null : role.key)}>
            <CardBody>
              <div className="flex items-center gap-2 mb-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${role.color}`}>{role.label}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400">{role.desc}</p>
              {selected === role.key && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                  <p className="text-xs font-bold text-gray-600 dark:text-slate-300 mb-1.5">Permissões:</p>
                  <ul className="space-y-1">
                    {PERMISSIONS[role.key].map(p => (
                      <li key={p} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                        <span className="text-green-500">✓</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
