'use client';

import * as Dialog from '@radix-ui/react-dialog';

type DeleteConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
  adresse?: string;
};

export default function DeleteConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
  adresse,
}: DeleteConfirmModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/20" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-cream-border bg-cream p-5">
          <Dialog.Title className="text-base font-semibold text-sand-dark">Supprimer ce bien ?</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-sand-dark/80">
            {adresse ? `Le bien "${adresse}" sera supprimé définitivement.` : 'Cette action est définitive.'}
          </Dialog.Description>
          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-xl border border-cream-border bg-cream px-4 py-2 text-xs text-sand-dark transition-colors hover:bg-sand"
                disabled={loading}
              >
                Annuler
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="rounded-xl border border-danger-mid bg-danger-light px-4 py-2 text-xs font-medium text-danger transition-colors hover:bg-danger-mid disabled:opacity-70"
            >
              {loading ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
