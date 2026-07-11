import Image from 'next/image';

interface QuestionFigureProps {
  questionId: string;
  figure: string;
  eager?: boolean;
}

export default function QuestionFigure({ questionId, figure, eager = false }: QuestionFigureProps) {
  const figureNumber = figure.match(/t([123])\.jpg$/)?.[1];
  const label = figureNumber ? `Figure T-${figureNumber}` : 'Question figure';

  return (
    <figure className="mb-8 overflow-hidden rounded-xl border border-slate-700 bg-white p-2">
      <Image
        src={figure}
        alt={`${label} referenced by question ${questionId}`}
        width={1800}
        height={1200}
        loading={eager ? 'eager' : 'lazy'}
        sizes="(max-width: 672px) 100vw, 608px"
        className="h-auto w-full"
      />
      <figcaption className="px-2 pb-1 pt-2 text-center text-xs font-semibold text-slate-600">
        {label}
      </figcaption>
    </figure>
  );
}
