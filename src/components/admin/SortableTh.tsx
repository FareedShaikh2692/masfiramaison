export default function SortableTh({
  label,
  active,
  dir,
  onClick
}: {
  label: string;
  active: boolean;
  dir: 1 | -1;
  onClick: () => void;
}) {
  return (
    <th className="px-5 py-3 font-medium cursor-pointer select-none" onClick={onClick}>
      {label} {active ? (dir === 1 ? "▲" : "▼") : ""}
    </th>
  );
}
