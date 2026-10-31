import React, {useEffect, useRef} from 'react';
import {createPortal} from 'react-dom';
import {X} from 'lucide-react';

export default function Modal({title, onClose, children, className = ''}) {
  const dialog = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const before = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.focus();
    function keydown(event) {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const nodes = dialog.current?.querySelectorAll('button:not(:disabled),a[href],input,select,textarea,[tabindex="0"]');
      if (!nodes?.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = before; document.removeEventListener('keydown', keydown); previous?.focus(); };
  }, [onClose]);
  return createPortal(<div className="modal-shade accessible-modal-backdrop" onClick={event => {if (event.target === event.currentTarget) onClose();}}>
    <section ref={dialog} className={'accessible-modal ' + className} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}>
      <button className="close-modal" onClick={onClose} aria-label="Fechar"><X/></button>{children}
    </section>
  </div>, document.body);
}
