import { BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SemesterLiability } from '@/lib/types';
import { SemesterLiabilityCard } from './semester-liability-card';

interface Props {
  liabilities: SemesterLiability[];
  onDelete: (id: string) => void;
}

export function SemesterLiabilityList({ liabilities, onDelete }: Props) {
  // Sort liabilities by due date (ascending)
  const sortedLiabilities = [...liabilities].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Planned Academic Costs
        </CardTitle>
        <CardDescription>Stored under your user record as semester liabilities.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedLiabilities.length > 0 ? (
          sortedLiabilities.map((liability) => (
            <SemesterLiabilityCard key={liability.id} liability={liability} onDelete={onDelete} />
          ))
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No semester costs added yet. Start with tuition, books, exam fees, projects, or fest budgets.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
