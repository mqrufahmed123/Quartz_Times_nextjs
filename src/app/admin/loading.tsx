import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
        <Loader2 className="h-7 w-7 animate-spin text-amber-500" />
        <p className="text-sm font-medium">Loading admin page...</p>
      </div>
    </div>
  );
}
