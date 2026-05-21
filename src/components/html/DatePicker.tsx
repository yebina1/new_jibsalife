import { useEffect, useRef, useState } from 'react'
import './DatePicker.css'

const ITEM_HEIGHT = 44

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

type ColumnItem = { value: number; label: string }

type ColumnProps = {
  items: ColumnItem[]
  value: number
  onChange: (v: number) => void
}

function Column({ items, value, onChange }: ColumnProps) {
  const ref = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wheelEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const targetIndexRef = useRef(0)
  const isScrollingRef = useRef(false)
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, items.findIndex((item) => item.value === value))
  )

  useEffect(() => {
    if (isScrollingRef.current) return
    const el = ref.current
    if (!el) return
    const index = items.findIndex((item) => item.value === value)
    const targetIndex = Math.max(0, index)

    targetIndexRef.current = targetIndex
    setActiveIndex(targetIndex)

    if (wheelTimerRef.current) return
    el.scrollTop = targetIndex * ITEM_HEIGHT
  }, [items, value])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current)
      if (wheelEndTimerRef.current) clearTimeout(wheelEndTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return

      e.preventDefault()
      e.stopPropagation()

      if (wheelEndTimerRef.current) clearTimeout(wheelEndTimerRef.current)
      wheelEndTimerRef.current = setTimeout(() => {
        wheelTimerRef.current = null
      }, 180)

      if (wheelTimerRef.current) return

      const direction = e.deltaY > 0 ? 1 : -1
      const nextIndex = Math.max(
        0,
        Math.min(targetIndexRef.current + direction, items.length - 1),
      )

      targetIndexRef.current = nextIndex
      wheelTimerRef.current = setTimeout(() => {
        wheelTimerRef.current = null
      }, 180)

      el.scrollTo({
        top: nextIndex * ITEM_HEIGHT,
        behavior: 'smooth',
      })
      setActiveIndex(nextIndex)
      onChange(items[nextIndex].value)
    }

    el.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      el.removeEventListener('wheel', handleWheel)
    }
  }, [items, onChange])

  const handleScroll = () => {
    const el = ref.current
    if (!el) return
    const index = Math.round(el.scrollTop / ITEM_HEIGHT)
    const clamped = Math.max(0, Math.min(index, items.length - 1))
    setActiveIndex(clamped)
    isScrollingRef.current = true

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      isScrollingRef.current = false
      onChange(items[clamped].value)
    }, 80)
  }

  const selectItem = (index: number) => {
    const el = ref.current
    const clamped = Math.max(0, Math.min(index, items.length - 1))

    targetIndexRef.current = clamped
    setActiveIndex(clamped)
    onChange(items[clamped].value)

    if (el) {
      el.scrollTo({
        top: clamped * ITEM_HEIGHT,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="date_picker_column" ref={ref} onScroll={handleScroll}>
      <div className="date_picker_spacer" />
      {items.map((item, i) => (
        <button
          type="button"
          key={item.value}
          className={`date_picker_item${i === activeIndex ? ' active' : ''}`}
          onClick={() => selectItem(i)}
        >
          {item.label}
        </button>
      ))}
      <div className="date_picker_spacer" />
    </div>
  )
}

type DatePickerProps = {
  year: number
  month: number
  day: number
  dropdownTop?: number
  inline?: boolean
  flat?: boolean
  onConfirm: (year: number, month: number, day: number) => void
  onCancel: () => void
}

function DatePicker({ year, month, day, dropdownTop, inline = false, flat = false, onConfirm, onCancel }: DatePickerProps) {
  const [tempYear, setTempYear] = useState(year)
  const [tempMonth, setTempMonth] = useState(month)
  const [tempDay, setTempDay] = useState(day)

  const years = Array.from({ length: 11 }, (_, i) => ({
    value: 2020 + i,
    label: `${2020 + i}년`,
  }))
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `${String(i + 1).padStart(2, '0')}월`,
  }))
  const daysInMonth = getDaysInMonth(tempYear, tempMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => ({
    value: i + 1,
    label: `${String(i + 1).padStart(2, '0')}일`,
  }))
  const clampedDay = Math.min(tempDay, daysInMonth)

  const isDropdown = dropdownTop !== undefined
  const picker = (
    <div className={`date_picker${inline ? ' inline' : ''}${flat ? ' flat' : ''}`} onClick={(e) => e.stopPropagation()}>
      <div className="date_picker_columns">
        <Column items={years} value={tempYear} onChange={setTempYear} />
        <Column items={months} value={tempMonth} onChange={setTempMonth} />
        <Column
          key={`${tempYear}-${tempMonth}`}
          items={days}
          value={clampedDay}
          onChange={setTempDay}
        />
        <div className="date_picker_selector" />
      </div>
      <div className="date_picker_actions">
        <button type="button" onClick={onCancel}>이전</button>
        <span className="date_picker_divider" />
        <button type="button" onClick={() => onConfirm(tempYear, tempMonth, clampedDay)}>완료</button>
      </div>
    </div>
  )

  if (inline) {
    return picker
  }

  return (
    <div
      className={`date_picker_overlay${isDropdown ? ' dropdown' : ''}`}
      style={isDropdown ? { '--picker-top': `${dropdownTop}px` } as React.CSSProperties : undefined}
      onClick={onCancel}
    >
      <div className="date_picker" onClick={(e) => e.stopPropagation()}>
        <div className="date_picker_columns">
          <Column items={years} value={tempYear} onChange={setTempYear} />
          <Column items={months} value={tempMonth} onChange={setTempMonth} />
          <Column
            key={`${tempYear}-${tempMonth}`}
            items={days}
            value={clampedDay}
            onChange={setTempDay}
          />
          <div className="date_picker_selector" />
        </div>
        <div className="date_picker_actions">
          <button type="button" onClick={onCancel}>이전</button>
          <span className="date_picker_divider" />
          <button type="button" onClick={() => onConfirm(tempYear, tempMonth, clampedDay)}>완료</button>
        </div>
      </div>
    </div>
  )
}

export default DatePicker
