import type { ReactNode } from 'react'
import './NoticeText.css'

type NoticeTextProps = {
  children: ReactNode
}

function NoticeText({ children }: NoticeTextProps) {
  return <div className="notice_text">{children}</div>
}

export default NoticeText
