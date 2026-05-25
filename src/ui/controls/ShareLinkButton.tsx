import { useState } from 'react';
import { buildShareUrl } from '../../lib/shareState';

export function ShareLinkButton() {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    const url = buildShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      // Also update the browser address bar so refresh keeps the same shot
      window.history.replaceState(null, '', url);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: just put it in the address bar
      window.location.hash = url.split('#')[1] ?? '';
    }
  };

  return (
    <button type="button" className="ghost-btn" onClick={onClick}>
      {copied ? 'Copied!' : 'Copy Link'}
    </button>
  );
}
