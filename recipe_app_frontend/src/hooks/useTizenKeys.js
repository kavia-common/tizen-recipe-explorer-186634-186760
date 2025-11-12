import { useEffect } from 'react';

/**
 * PUBLIC_INTERFACE
 * useTizenKeys
 * A hook to subscribe to Tizen remote/keyboard key events and call mapped handlers.
 * Handlers: onLeft, onRight, onUp, onDown, onEnter, onBack
 */
export function useTizenKeys(handlers) {
  useEffect(() => {
    function handleKeyDown(e) {
      const code = e?.keyCode ?? e?.which;
      switch (code) {
        case 37: // LEFT
          handlers?.onLeft?.();
          e.preventDefault();
          break;
        case 38: // UP
          handlers?.onUp?.();
          e.preventDefault();
          break;
        case 39: // RIGHT
          handlers?.onRight?.();
          e.preventDefault();
          break;
        case 40: // DOWN
          handlers?.onDown?.();
          e.preventDefault();
          break;
        case 13: // ENTER
          handlers?.onEnter?.();
          e.preventDefault();
          break;
        case 10009: // BACK (Tizen)
        case 461: // Backspace/Back some remotes
          handlers?.onBack?.();
          e.preventDefault();
          break;
        default:
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
