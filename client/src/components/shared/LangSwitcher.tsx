import { useTranslation } from 'react-i18next';

const FLAGS: Record<string, string> = { pt: '🇲🇿', en: '🇬🇧' };
const LABELS: Record<string, string> = { pt: 'PT', en: 'EN' };

export default function LangSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n } = useTranslation();
  const current = i18n.resolvedLanguage ?? 'pt';

  function toggle() {
    const next = current === 'pt' ? 'en' : 'pt';
    i18n.changeLanguage(next);
  }

  return (
    <button
      onClick={toggle}
      title={current === 'pt' ? 'Switch to English' : 'Mudar para Português'}
      className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors dark:text-slate-400 dark:hover:bg-slate-700"
    >
      <span>{FLAGS[current]}</span>
      {!compact && <span>{LABELS[current]}</span>}
    </button>
  );
}
