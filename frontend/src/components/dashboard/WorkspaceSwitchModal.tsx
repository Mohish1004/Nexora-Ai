import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Briefcase, PiggyBank, AlertTriangle } from 'lucide-react';

interface WorkspaceSwitchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  currentWorkspace: 'business' | 'personal';
}

export default function WorkspaceSwitchModal({
  open,
  onOpenChange,
  onConfirm,
  currentWorkspace,
}: WorkspaceSwitchModalProps) {
  const nextWorkspace = currentWorkspace === 'business' ? 'personal' : 'business';
  const Icon = nextWorkspace === 'business' ? Briefcase : PiggyBank;
  const accent = nextWorkspace === 'business' ? 'text-primary' : 'text-primary-emerald';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-warning shrink-0" />
            <DialogTitle>Switch Workspace?</DialogTitle>
          </div>
          <DialogDescription className="mt-2">
            You're switching from <strong className="text-foreground">{currentWorkspace.charAt(0).toUpperCase() + currentWorkspace.slice(1)}</strong> to <strong className={accent}>{nextWorkspace.charAt(0).toUpperCase() + nextWorkspace.slice(1)}</strong>. The AI copilot will reset its context for the new workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 border border-border">
          <Icon size={24} className={accent} />
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {nextWorkspace === 'business' ? 'Business' : 'Personal'}
            </span>
            <span> workspace: {nextWorkspace === 'business' ? 'inventory, receivables, payables, vendors, customers' : 'expenses, savings goals, personal reports'}</span>
          </div>
        </div>

        <DialogFooter showCloseButton={false}>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <DialogClose
            render={
              <Button
                className={nextWorkspace === 'business' ? 'bg-primary text-black hover:bg-cyan-400' : 'bg-primary-emerald text-black hover:bg-emerald-400'}
                onClick={onConfirm}
              >
                Switch to {nextWorkspace.charAt(0).toUpperCase() + nextWorkspace.slice(1)}
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
