import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
      <div className="text-8xl font-black text-gray-100 dark:text-slate-800">404</div>
      <h1 className="text-2xl font-black">{t('not_found_title')}</h1>
      <p className="text-gray-500 dark:text-slate-400">{t('not_found_desc')}</p>
      <Link to="/" className="rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-700">{t('not_found_btn')}</Link>
    </div>
  );
}
