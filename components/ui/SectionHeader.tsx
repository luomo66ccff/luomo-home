interface Props {
  eyebrow: string;
  title: string;
  subtitle?: string;
  className?: string;
}

export default function SectionHeader({ eyebrow, title, subtitle, className = "" }: Props) {
  return (
    <div className={"section-heading " + className}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}
