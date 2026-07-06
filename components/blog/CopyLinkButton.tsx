"use client";

import { useState } from "react";

interface CopyLinkButtonProps {
  url: string;
}

// Small client island so the article page stays a server component (crawlable).
export function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="text-mb-blue hover:text-mb-blue-bright hover:underline cursor-pointer"
      aria-label="Copy link to this post"
    >
      {copied ? "link copied ✓" : "copy link"}
    </button>
  );
}
