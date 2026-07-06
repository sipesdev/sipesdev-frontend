import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

// Markdown element overrides, styled with matte-black `mb-*` tokens. Each
// override takes only the props it needs (never spreads react-markdown's
// `node` prop onto the DOM). Fenced code blocks are handled by the wrapper's
// `[&_pre_code]` rules below, so the `code` override only styles inline code.
const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-mb-accent text-2xl font-bold mt-6 mb-3">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-mb-accent text-xl font-bold mt-6 mb-3">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-mb-bright text-lg font-semibold mt-5 mb-2">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-mb-text my-3 leading-relaxed">{children}</p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-mb-blue hover:text-mb-blue-bright hover:underline"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="text-mb-bright font-semibold">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-mb-subtext0">{children}</em>,
  ul: ({ children }) => (
    <ul className="list-disc list-outside pl-6 text-mb-text my-3 space-y-2">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside pl-6 text-mb-text my-3 space-y-2">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-mb-subtext1 leading-relaxed">{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-mb-accent bg-mb-surface0 rounded-r pl-4 pr-3 py-2 my-4 text-mb-subtext0">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-mb-surface1 my-6" />,
  pre: ({ children }) => (
    <pre className="bg-mb-bar text-mb-text rounded-md p-4 my-4 overflow-x-auto text-sm whitespace-pre">
      {children}
    </pre>
  ),
  code: ({ children }) => (
    <code className="bg-mb-surface0 text-mb-accent2 rounded px-1 py-0.5 text-[0.9em]">
      {children}
    </code>
  ),
  img: ({ src, alt }) => (
    // Markdown carries no intrinsic dimensions, so next/image is unsuitable here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={typeof src === "string" ? src : ""}
      alt={alt ?? ""}
      className="max-w-full rounded-md my-4 border border-mb-surface1"
    />
  ),
  table: ({ children }) => (
    <table className="border-collapse my-4 text-mb-text">{children}</table>
  ),
  th: ({ children }) => (
    <th className="border border-mb-surface1 px-3 py-1 text-left text-mb-subtext0">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-mb-surface1 px-3 py-1">{children}</td>
  ),
};

interface PostBodyProps {
  body: string;
}

// Shared renderer for a post's markdown body. Used both inline in the terminal
// (BlogPostOutput) and on the standalone article page (app/blog/[slug]).
// `whitespace-normal` resets the terminal's inherited `whitespace-pre-wrap`;
// the `[&_pre_code]` rules keep fenced code blocks flush inside their <pre> box.
export function PostBody({ body }: PostBodyProps) {
  return (
    <div className="whitespace-normal max-w-2xl [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-mb-text">
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {body}
      </Markdown>
    </div>
  );
}
