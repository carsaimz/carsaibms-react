import { MessageSquare } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';

export default function StaffMessages() {
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
