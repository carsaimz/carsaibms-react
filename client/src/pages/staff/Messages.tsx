import { MessageSquare } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import { useTranslation } from 'react-i18next';

export default function StaffMessages() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Mensagens Internas</h1>
      <EmptyState
        icon={<MessageSquare className="h-8 w-8" />}
        title="Mensagens em breve"
        description="Sistema de mensagens internas entre staff. Planeado para a próxima versão."
      />
    </div>
  );
}
