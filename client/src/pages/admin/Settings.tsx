import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { api, ApiClientError } from '../../lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { useTranslation } from 'react-i18next';

const SETTINGS_FIELDS = [
  { group: 'Empresa', fields: [
    { key: 'company_name',    label: 'Nome da empresa', type: 'text' },
    { key: 'company_email',   label: 'Email de contacto', type: 'email' },
    { key: 'company_phone',   label: 'Telefone', type: 'text' },
    { key: 'company_address', label: 'Morada', type: 'text' },
    { key: 'company_nuit',    label: 'NUIT', type: 'text' },
    { key: 'currency',        label: 'Moeda (ex: MZN)', type: 'text' },
    { key: 'currency_symbol', label: 'Símbolo (ex: MT)', type: 'text' },
  ]},
  { group: 'SEO', fields: [
    { key: 'site_title',       label: 'Título do site', type: 'text' },
    { key: 'site_description', label: 'Descrição (meta)', type: 'text' },
    { key: 'og_image',         label: 'Imagem OG (URL)', type: 'text' },
    { key: 'google_analytics_id', label: 'Google Analytics ID', type: 'text' },
  ]},
  { group: 'Pagamentos — M-Pesa', fields: [
    { key: 'mpesa_api_key',    label: 'API Key',    type: 'password' },
    { key: 'mpesa_public_key', label: 'Public Key', type: 'password' },
    { key: 'mpesa_agent_id',   label: 'Agent ID',   type: 'text' },
    { key: 'mpesa_env',        label: 'Ambiente (development | production)', type: 'text' },
  ]},
  { group: 'Pagamentos — PayPal', fields: [
    { key: 'paypal_client_id', label: 'Client ID',     type: 'text' },
    { key: 'paypal_secret',    label: 'Client Secret', type: 'password' },
    { key: 'paypal_env',       label: 'Ambiente (sandbox | live)', type: 'text' },
  ]},
  { group: 'Pagamentos — Stripe', fields: [
    { key: 'stripe_publishable_key', label: 'Publishable Key', type: 'text' },
    { key: 'stripe_secret_key',      label: 'Secret Key',      type: 'password' },
    { key: 'stripe_webhook_secret',  label: 'Webhook Secret',  type: 'password' },
  ]},
  { group: 'Email (SMTP)', fields: [
    { key: 'smtp_host', label: 'Host SMTP', type: 'text' },
    { key: 'smtp_port', label: 'Porto SMTP', type: 'text' },
    { key: 'smtp_user', label: 'Utilizador SMTP', type: 'text' },
    { key: 'smtp_pass', label: 'Senha SMTP', type: 'password' },
    { key: 'mail_from', label: 'Email remetente', type: 'email' },
  ]},
];

export default function AdminSettings() {
  const { t } = useTranslation();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => api.get<{ data: Record<string, string> }>('/admin/settings').then((r) => r.data),
  });

  useEffect(() => { if (data) setValues(data); }, [data]);

  const save = useMutation({
    mutationFn: (vals: Record<string, string>) => api.post('/admin/settings', vals),
    onSuccess: () => { setSaved(true); setError(null); setTimeout(() => setSaved(false), 3000); },
    onError: (err) => setError(err instanceof ApiClientError ? err.message : 'Erro ao guardar.'),
  });

  if (isLoading) return <Spinner />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold">Definições</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Configurações globais do sistema</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-green-600 font-semibold">✓ Guardado</span>}
          {error && <span className="text-sm text-red-500">{error}</span>}
          <Button icon={<Save className="h-4 w-4" />} loading={save.isPending} onClick={() => save.mutate(values)}>
            Guardar Tudo
          </Button>
        </div>
      </div>

      {SETTINGS_FIELDS.map(({ group, fields }) => (
        <Card key={group}>
          <CardHeader><CardTitle>{group}</CardTitle></CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fields.map(({ key, label, type }) => (
                <div key={key}>
                  <Input
                    label={label}
                    type={type}
                    value={values[key] ?? ''}
                    onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                    autoComplete="off"
                  />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
