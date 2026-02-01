import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-b from-white via-gray-100 to-gray-400 bg-clip-text text-transparent mb-6 leading-tight">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl md:text-3xl font-semibold text-white mt-8 mb-4">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl md:text-2xl font-semibold text-gray-100 mt-6 mb-3">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="text-gray-300 leading-relaxed mb-4">{children}</p>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
      >
        {children}
      </a>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-2">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 my-4 text-gray-400 italic">
        {children}
      </blockquote>
    ),
    code: ({ children }) => (
      <code className="bg-gray-800 text-gray-200 px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="bg-gray-900 border border-gray-800 rounded-lg p-4 overflow-x-auto mb-4">
        {children}
      </pre>
    ),
    hr: () => <hr className="border-gray-700 my-8" />,
    table: ({ children }) => (
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm text-left text-gray-300 border-collapse">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="text-xs uppercase bg-gray-800 text-gray-400">
        {children}
      </thead>
    ),
    tbody: ({ children }) => (
      <tbody className="divide-y divide-gray-700">{children}</tbody>
    ),
    tr: ({ children }) => (
      <tr className="border-b border-gray-700 hover:bg-gray-800/50">
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className="px-4 py-3 font-semibold text-gray-200">{children}</th>
    ),
    td: ({ children }) => <td className="px-4 py-3">{children}</td>,
    ...components,
  };
}
