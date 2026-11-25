import { useEffect, useId, useRef } from 'react';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.returnValue = '';
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    let pressedOutside = false;
    const isOutside = (e) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };

    const handlePointerDown = (e) => {
      pressedOutside = isOutside(e);
    };

    const handlePointerUp = (e) => {
      if (pressedOutside && isOutside(e) && !busy) {
        onCancel();
      }
      pressedOutside = false;
    };

    const handleClose = () => {
      const val = dialog.returnValue;
      dialog.returnValue = '';
      if (val !== 'confirmed' && open) {
        onCancel();
      }
    };

    dialog.addEventListener('pointerdown', handlePointerDown);
    dialog.addEventListener('pointerup', handlePointerUp);
    dialog.addEventListener('close', handleClose);
    return () => {
      dialog.removeEventListener('pointerdown', handlePointerDown);
      dialog.removeEventListener('pointerup', handlePointerUp);
      dialog.removeEventListener('close', handleClose);
    };
  }, [busy, onCancel, open]);

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <div className="confirm-dialog-body">
        <h1 id={titleId} className="confirm-dialog-title">
          {title}
        </h1>
        <p id={descId} className="confirm-dialog-desc">
          {message}
        </p>
        <div className="confirm-dialog-actions">
          <button
            type="button"
            className="btn"
            autoFocus
            disabled={busy}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${danger ? 'btn-danger-solid' : 'btn-primary'}`}
            disabled={busy}
            onClick={() => {
              if (dialogRef.current) dialogRef.current.returnValue = 'confirmed';
              onConfirm();
            }}
          >
            {busy ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
