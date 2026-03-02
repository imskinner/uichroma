import { useState, useCallback } from 'react';

interface PermalinkBarProps {
  permalink: string;
}

export function PermalinkBar({ permalink }: PermalinkBarProps) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/palette/${permalink}`;

  const handleCopy = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  }, [url]);

  return (
    <div className="w-full text-center mt-8">
      <a
        href={url}
        onClick={handleCopy}
        className="block px-5 py-3 bg-[#EEEDEC] text-[#585451] text-sm rounded-lg no-underline hover:bg-[#CECCCA] transition-colors"
      >
        {copied ? 'Link copied to clipboard' : url}
      </a>
    </div>
  );
}
