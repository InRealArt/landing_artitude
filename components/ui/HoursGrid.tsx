'use client'

export type DayHours = {
  day: string
  open: boolean
  openTime: string
  closeTime: string
}

interface HoursGridProps {
  value: DayHours[]
  onChange: (hours: DayHours[]) => void
  labels: {
    monday: string
    tuesday: string
    wednesday: string
    thursday: string
    friday: string
    saturday: string
    sunday: string
    closed: string
    openTime: string
    closeTime: string
  }
}

const DAYS = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY',
] as const

const DAY_LABEL_KEYS: Record<string, keyof HoursGridProps['labels']> = {
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday',
  SUNDAY: 'sunday',
}

export function defaultHours(): DayHours[] {
  return DAYS.map((day) => ({
    day,
    open: day !== 'SUNDAY',
    openTime: '10:00',
    closeTime: '18:00',
  }))
}

export default function HoursGrid({ value, onChange, labels }: HoursGridProps) {
  const update = (index: number, patch: Partial<DayHours>) => {
    const next = value.map((h, i) => (i === index ? { ...h, ...patch } : h))
    onChange(next)
  }

  return (
    <div className="space-y-2">
      {value.map((dayHours, i) => {
        const labelKey = DAY_LABEL_KEYS[dayHours.day]
        return (
          <div key={dayHours.day} className="grid grid-cols-[100px_1fr] items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dayHours.open}
                onChange={(e) => update(i, { open: e.target.checked })}
                className="h-3.5 w-3.5 accent-inkBlack"
              />
              <span className="text-[10px] uppercase tracking-wider font-display text-inkBlack">
                {labels[labelKey]}
              </span>
            </label>

            {dayHours.open ? (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={dayHours.openTime}
                  onChange={(e) => update(i, { openTime: e.target.value })}
                  className="bg-white border border-borderLight px-2 py-1.5 text-xs text-inkBlack font-sans outline-none focus:border-inkBlack transition-colors"
                />
                <span className="text-[10px] text-grayText">→</span>
                <input
                  type="time"
                  value={dayHours.closeTime}
                  onChange={(e) => update(i, { closeTime: e.target.value })}
                  className="bg-white border border-borderLight px-2 py-1.5 text-xs text-inkBlack font-sans outline-none focus:border-inkBlack transition-colors"
                />
              </div>
            ) : (
              <span className="text-[10px] text-grayText font-sans italic">{labels.closed}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
