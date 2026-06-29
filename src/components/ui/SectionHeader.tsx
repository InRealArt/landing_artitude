interface SectionHeaderProps {
  eyebrow: string
  title: string
  titleItalic?: string
  centered?: boolean
}

export default function SectionHeader({
  eyebrow,
  title,
  titleItalic,
  centered = true,
}: SectionHeaderProps) {
  return (
    <div className={`space-y-4 ${centered ? 'text-center max-w-3xl mx-auto' : ''}`}>
      <span className="text-[10px] uppercase tracking-[0.3em] text-grayText font-semibold font-sans block">
        {eyebrow}
      </span>
      <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light leading-tight">
        {title}
        {titleItalic && (
          <>
            {' '}
            <span className="italic text-grayText">{titleItalic}</span>
          </>
        )}
      </h2>
      <div className="w-12 h-[1px] bg-current mx-auto my-6 opacity-60" />
    </div>
  )
}
