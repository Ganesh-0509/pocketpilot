import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SemesterLiability } from '@/lib/types';

interface Props {
  liability: SemesterLiability;
  onDelete: (id: string) => void;
}

export function SemesterLiabilityCard({ liability, onDelete }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="font-semibold">{liability.title}</p>
        <p className="text-sm text-muted-foreground">{liability.category} • Due {format(new Date(liability.dueDate), 'MMM d, yyyy')}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Amount</p>
          <p className="text-lg font-bold">₹{liability.amount.toFixed(0)}</p>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={() => onDelete(liability.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
