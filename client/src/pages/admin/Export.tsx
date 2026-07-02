import { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { api, ApiClientError } from '../../lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useTranslation } from 'react-i18next';

const EXPORTS = [
  { key: 'products',  label: 'Produtos',        desc: 'SKU, barcode, nome, preço, stock, categoria' },
  { key: 'services',  label: 'Serviços',         desc: 'Nome, preço, duração, categoria' },
  { key: 'orders',    label: 'Pedidos',          desc: 'Número, cliente, estado, total, data' },
  { key: 'customers', label: 'Clientes',         desc: 'Nome, email, telefone, empresa, cidade' },
  { key: 'payments',  label: 'Pagamentos',       desc: 'Referência, método, valor, estado, data' },
  { key: 'sales',     label: 'Vendas POS',       desc: 'Nº venda, vendedor, método, total, data' },
  { key: 'coupons',   label: 'Cupões',           desc: 'Código, tipo, valor, usos, expiração' },
  { key: 'suppliers', label: 'Fornecedores',     desc: 'Nome, email, telefone, NUIT, morada' },
];

export default function AdminExport() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExport(key: string) {
    setLoading(key); setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/export/${key}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('carsai-token') || ''}` },
      });
      if (!res.ok) throw new Error('Erro ao exportar');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${key}-${new Date().toISOString().slice(0,10)}.csv`;
      a.click(); URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Erro ao exportar dados.');
    } finally { setLoading(null); }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <FileSpreadsheet className="h-5 w-5 text-primary-600" />
        <h1 className="text-xl font-bold">Exportação de Dados</h1>
      </div>
      <p className="text-sm text-gray-500 dark:text-slate-400">Exporta dados para CSV. Abre directamente no Excel, LibreOffice ou Google Sheets.</p>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EXPORTS.map(e => (
          <Card key={e.key}>
            <CardBody className="flex flex-col gap-3">
              <div>
                <p className="font-bold text-sm">{e.label}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{e.desc}</p>
              </div>
              <Button variant="secondary" size="sm" icon={<Download className="h-3.5 w-3.5" />}
                loading={loading === e.key} onClick={() => handleExport(e.key)}>
                Exportar CSV
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
