interface Props {
  title: string;
}

export default function MangaRowHeader({ title }: Props) {
  return (
    <div className="flex items-center justify-between mb-4 px-4 md:px-12">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
    </div>
  );
}
