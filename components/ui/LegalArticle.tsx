interface LegalArticleProps {
  id?: string
  title: string
  children: React.ReactNode
}

export default function LegalArticle({ id, title, children }: LegalArticleProps) {
  return (
    <article id={id} className="py-8 border-b border-borderLight last:border-b-0 scroll-mt-24">
      <h3 className="font-serif text-xl sm:text-2xl font-light mb-4">{title}</h3>
      <div className="font-sans text-[13px] sm:text-sm text-grayText leading-relaxed space-y-3">
        {children}
      </div>
    </article>
  )
}
