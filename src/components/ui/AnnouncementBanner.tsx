interface AnnouncementBannerProps {
  text: string
  highlight: string
}

export default function AnnouncementBanner({ text, highlight }: AnnouncementBannerProps) {
  return (
    <div className="bg-[#1a1a1a] border-b border-white/10 text-center py-2.5 px-4">
      <p className="text-[11px] uppercase tracking-[0.15em] text-grayText font-light font-sans">
        {text}{' '}
        <span className="text-gold font-medium">{highlight}</span>
      </p>
    </div>
  )
}
