import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useTranslation } from 'react-i18next';

const CHANGELOG = [
  { version: '1.0.0', date: 'Junho 2026', type: 'major', changes: [
    'Lançamento da versão React (Node.js + Vite + Tailwind)',
    'Portal do cliente: pedidos, facturas, tickets, pagamentos, orçamentos, serviços',
    'Painel admin completo (22+ páginas)',
    'Staff: tarefas, tickets split-pane, agenda, notificações',
    'POS com carrinho, 5 métodos de pagamento, offline, scanner de barcode',
    'App Android via Capacitor (com.carsaibms.lite)',
    'Firebase: Auth, Analytics, Crashlytics, Remote Config, Firestore, Push',
    'GitHub Actions: CI, APK+AAB, deploy, migrations',
    'SEO: sitemap.xml, robots.txt, RSS — com auto-ping Google/Bing',
  ]},
  { version: '0.9.0', date: 'Maio 2026', type: 'minor', changes: [
    'Versão PHP v1.1.0 concluída',
    'API docs interactiva com 12 linguagens e Try-it',
    'Geração de PDF (TCPDF): facturas A4, recibos A6',
    'Integração M-Pesa C2B com RSA encrypt',
    'SEO completo: OG, JSON-LD, hreflang, sitemap, auto-ping',
  ]},
];

const TYPE_COLORS: Record<string, any> = { major: 'success', minor: 'info', patch: 'default' };

export default function AdminChangelog() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Changelog</h1>
      <p className="text-sm text-gray-500 dark:text-slate-400">Histórico de versões e alterações do Carsai BMS.</p>
      <div className="flex flex-col gap-4">
        {CHANGELOG.map(v => (
          <Card key={v.version}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-primary-600">v{v.version}</span>
                <Badge variant={TYPE_COLORS[v.type]}>{v.type}</Badge>
                <span className="text-sm text-gray-400">{v.date}</span>
              </div>
            </CardHeader>
            <CardBody>
              <ul className="space-y-1.5">
                {v.changes.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-300">
                    <span className="mt-0.5 text-green-500 flex-shrink-0">✓</span>{c}
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
