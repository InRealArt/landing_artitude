import Image from 'next/image'

interface AtelierCardProps {
  name: string
  role: string
  service: string
  description: string
  imageSrc: string
}

export default function AtelierCard({ name, role, service, description, imageSrc }: AtelierCardProps) {
  return (
    <div className="member-card bg-softGray border border-borderLight p-6 flex flex-col justify-between h-full">
      <div className="space-y-6">
        <div className="border-b border-borderLight pb-4 space-y-4">
          <div className="aspect-square w-full bg-neutral-200 overflow-hidden border border-borderLight artwork-image">
            <Image
              src={imageSrc}
              alt={name}
              width={300}
              height={300}
              className="member-image w-full h-full object-cover brightness-95"
              unoptimized={imageSrc.startsWith('http')}
            />
          </div>
          <div>
            <h4 className="font-serif font-bold text-base text-inkBlack">{name}</h4>
            <p className="text-[10px] uppercase tracking-wider text-grayText font-display">{role}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h5 className="text-xs uppercase tracking-widest text-inkBlack font-semibold font-display">
            Service Dédié :
          </h5>
          <p className="text-sm font-serif italic text-inkBlack font-semibold">{service}</p>
          <p className="text-sm text-inkBlack/80 font-light leading-relaxed font-sans">{description}</p>
        </div>
      </div>
    </div>
  )
}
