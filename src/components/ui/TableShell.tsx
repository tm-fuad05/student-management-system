export function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="scrollbar-thin -mx-1 overflow-x-auto px-1">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  );
}

export function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`border-b border-white/10 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`border-b border-white/5 px-3 py-3 text-slate-300 ${className}`}>
      {children}
    </td>
  );
}
