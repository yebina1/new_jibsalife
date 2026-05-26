import './CommunityWrite.css'
import './VoteWrite.css'
import { createPortal } from 'react-dom'
import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import PageHeader from '../../components/PageHeader'
import BackButton from '../../components/html/BackButton'
import Button from '../../components/html/Button'
import Input from '../../components/html/Input'
import ConfirmDialog from '../../components/ConfirmDialog'
import OxVoteOptions from '../../components/OxVoteOptions'
import communityWriteBg from '../../svg/community_write_bg.svg'
import imageIcon from '../../svg/Image.svg'
import keyboardIcon from '../../svg/keyboard.svg'
import blueCheckIcon from '../../img/blue-check.png'
import grayCheckIcon from '../../img/gray-check.png'
import { saveUserVote } from '../../utils/savedVotes'
import { showStateBarMessage } from '../../utils/stateBarMessage'
import { addUserNotification } from '../../utils/userNotifications'
import { useActionRowSlot } from '../../contexts/ActionRowContext'

const VOTE_DURATION_OPTIONS = [3, 7, 10] as const
const VOTE_ITEM_LABEL_MAX_LENGTH = 10
const VOTE_TEXT_LABEL_MAX_LENGTH = 12
type VoteDuration = (typeof VOTE_DURATION_OPTIONS)[number]

const VOTE_TYPE_OPTIONS = ['일반 투표', '사진 투표', 'OX'] as const
type VoteType = (typeof VOTE_TYPE_OPTIONS)[number] | ''

type VoteItem = { id: number; image: string | null; label: string }

function VoteWrite() {
  const navigate = useNavigate()

  const [voteType, setVoteType] = useState<VoteType>('')
  const [isVoteTypeOpen, setIsVoteTypeOpen] = useState(false)
  const [voteTitle, setVoteTitle] = useState('')
  const [voteContent, setVoteContent] = useState('')
  const [isContentFocused, setIsContentFocused] = useState(false)
  const [voteDuration, setVoteDuration] = useState<VoteDuration>(3)
  const [voteItems, setVoteItems] = useState<VoteItem[]>([
    { id: 1, image: null, label: '' },
    { id: 2, image: null, label: '' },
  ])
  const [isVoteConfirmOpen, setIsVoteConfirmOpen] = useState(false)
  const [pendingPhotoUploadIndex, setPendingPhotoUploadIndex] = useState<number | null>(null)
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)
  const voteItemFileRefs = useRef<(HTMLInputElement | null)[]>([])
  const voteTypeSelectRef = useRef<HTMLDivElement>(null)
  const actionRowSlot = useActionRowSlot()

  useEffect(() => {
    if (!isVoteTypeOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (!voteTypeSelectRef.current?.contains(e.target as Node)) {
        setIsVoteTypeOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isVoteTypeOpen])

  const isVoteReady =
    voteType !== '' &&
    voteTitle.trim() !== '' &&
    (voteType === 'OX' || voteType === '사진 투표' || voteItems.every((it) => it.label.trim() !== '')) &&
    (voteType !== '사진 투표' || voteItems.every((it) => it.image !== null))

  const handleVoteItemImageChange = (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setVoteItems((prev) => prev.map((it, i) => i === idx ? { ...it, image: url } : it))
    e.target.value = ''
  }

  const handlePhotoActionClick = () => {
    const emptyItemIndex = voteItems.findIndex((item) => item.image === null)
    setPendingPhotoUploadIndex(emptyItemIndex === -1 ? 0 : emptyItemIndex)

    if (voteType !== '사진 투표') {
      setVoteType('사진 투표')
      setIsVoteTypeOpen(false)
    }
  }

  const handleKeyboardToggle = () => {
    if (isContentFocused) {
      contentTextareaRef.current?.blur()
    } else {
      contentTextareaRef.current?.focus()
    }
  }

  useEffect(() => {
    if (pendingPhotoUploadIndex === null || voteType !== '사진 투표') return

    voteItemFileRefs.current[pendingPhotoUploadIndex]?.click()
    setPendingPhotoUploadIndex(null)
  }, [pendingPhotoUploadIndex, voteType])

  const handleVoteConfirm = () => {
    saveUserVote({
      id: Date.now(),
      title: voteTitle,
      content: voteContent,
      voteType: voteType as '사진 투표' | '일반 투표' | 'OX',
      voteDuration,
      voteItems: voteItems.map((item) => ({
        ...item,
        label: item.label.trim().slice(0, VOTE_ITEM_LABEL_MAX_LENGTH),
      })),
      createdAt: new Date().toISOString(),
    })
    setIsVoteConfirmOpen(false)
    addUserNotification({ title: '커뮤니티', content: '투표글이 등록되었습니다.', path: '/community/vote?sub=regular' })
    showStateBarMessage('투표글이 등록되었습니다.')
    navigate('/community/vote?sub=regular')
  }

  return (
    <>
      <PageHeader
        title="집사 투표 글쓰기"
        leftContent={<BackButton />}
        rightContent={
          <Button
            type="button"
            className={`s_purple_btn vw_submit_btn${!isVoteReady ? ' is_disabled' : ''}`}
            disabled={!isVoteReady}
            onClick={() => setIsVoteConfirmOpen(true)}
          >
            등록
          </Button>
        }
      />

      <main className="page cw_page cw_page_vote">
        <div className="cw_form">

          {/* 투표 방식 + 제목/내용 */}
          <div className="vw_form_top_group">
          {/* 투표 방식 선택 */}
          <div className="cw_section cw_section_no_bottom_space cw_board_section">
            <div className="cw_board_select" ref={voteTypeSelectRef}>
              <button
                type="button"
                className={`cw_board_toggle${isVoteTypeOpen ? ' is_open' : ''}`}
                onClick={() => setIsVoteTypeOpen((p) => !p)}
                aria-haspopup="listbox"
                aria-expanded={isVoteTypeOpen}
              >
                <span className={voteType ? '' : 'cw_placeholder'}>
                  {voteType || '투표 방식을 선택해주세요'}
                </span>
                <i className="bx bx-chevron-down cw_chevron_icon" aria-hidden="true" />
              </button>
              <div className={`cw_board_menu${isVoteTypeOpen ? ' open' : ''}`} role="listbox">
                {VOTE_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`cw_board_option${voteType === opt ? ' active' : ''}`}
                    role="option"
                    aria-selected={voteType === opt}
                    onClick={() => { setVoteType(opt); setIsVoteTypeOpen(false) }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 투표 제목 + 내용 */}
          <div className="vw_title_content_group">
            <div className="cw_section cw_section_no_bottom_space">
              <Input
                className="cw_title_input"
                value={voteTitle}
                onChange={setVoteTitle}
                placeholder="투표 제목을 입력해 주세요."
              />
            </div>

            <div
              className={`cw_section cw_section_no_bottom_space cw_content_section${isContentFocused || voteContent.trim() !== '' ? ' is_bg_hidden' : ''}`}
              style={{ '--cw-write-bg-image': `url(${communityWriteBg})` } as CSSProperties}
            >
              <textarea
                ref={contentTextareaRef}
                className="input_field cw_content_textarea"
                value={voteContent}
                maxLength={40}
                onChange={(event) => setVoteContent(event.target.value)}
                placeholder={'사소한 고민부터 진지한 고민까지, 무엇이든 남겨보세요.\n예) 목줄끼고 산책 하시나요, 안 하시나요?'}
                rows={2}
                onFocus={() => setIsContentFocused(true)}
                onBlur={() => setIsContentFocused(false)}
              />
            </div>
          </div>
          </div>

          {/* 투표 기간 */}
          <div className="vw_duration_row">
            <span className="vw_duration_label">투표 기간</span>
            {VOTE_DURATION_OPTIONS.map((day) => (
              <button
                key={day}
                type="button"
                className={`vw_duration_btn${voteDuration === day ? ' active' : ''}`}
                onClick={() => setVoteDuration(day)}
              >
                <img
                  src={voteDuration === day ? blueCheckIcon : grayCheckIcon}
                  className="vw_duration_check_icon"
                  alt=""
                  aria-hidden="true"
                />
                {day}일
              </button>
            ))}
          </div>

          {/* 투표 항목 — 사진 투표 */}
          {voteType === '사진 투표' && (
            <div className="vw_items_section vw_photo_items_section">
              <strong className="vw_items_title">투표 항목</strong>
              <div className="vw_items_list">
              {voteItems.map((item, i) => (
                <div key={item.id} className="vw_item">
                  <button
                    type="button"
                    className="vw_item_image_btn"
                    onClick={() => voteItemFileRefs.current[i]?.click()}
                  >
                    {item.image
                      ? <img src={item.image} alt="" className="vw_item_image_preview" />
                      : <span className="vw_item_image_plus">+</span>}
                  </button>
                  <input
                    ref={(el) => { voteItemFileRefs.current[i] = el }}
                    type="file"
                    accept="image/*"
                    className="cw_hidden_input"
                    onChange={handleVoteItemImageChange(i)}
                  />
                  <div className="vw_item_label_row">
                    <Input
                      className="vw_item_label_input"
                      value={item.label}
                      maxLength={VOTE_ITEM_LABEL_MAX_LENGTH}
                      onChange={(v) => setVoteItems((prev) => prev.map((it, j) => j === i ? { ...it, label: v.slice(0, VOTE_ITEM_LABEL_MAX_LENGTH) } : it))}
                      placeholder="내용을 입력해 주세요."
                    />
                  </div>
                </div>
              ))}
              </div>
            </div>
          )}

          {/* 투표 항목 — 일반 투표 */}
          {voteType === '일반 투표' && (
            <div className="vw_items_section vw_text_items_section">
              <strong className="vw_items_title">투표 항목</strong>
              <div className="vw_text_items_list">
                {voteItems.map((item, i) => (
                  <div key={item.id} className="vw_text_item">
                    <span className="vw_text_item_circle" aria-hidden="true" />
                    <input
                      type="text"
                      className="vw_text_item_input"
                      value={item.label}
                      maxLength={VOTE_TEXT_LABEL_MAX_LENGTH}
                      onChange={(e) =>
                        setVoteItems((prev) =>
                          prev.map((it, j) =>
                            j === i ? { ...it, label: e.target.value.slice(0, VOTE_TEXT_LABEL_MAX_LENGTH) } : it,
                          ),
                        )
                      }
                      placeholder="내용을 입력해 주세요."
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 투표 항목 — OX */}
          {voteType === 'OX' && (
            <div className="vw_items_section vw_ox_items_section">
              <strong className="vw_items_title">투표 항목</strong>
              <OxVoteOptions />
            </div>
          )}

        </div>
      </main>

      {isVoteConfirmOpen && (
        <ConfirmDialog
          message="투표를 등록할까요?"
          description={(
            <>
              투표 게시글은 작성 후
              <br />
              수정할 수 없고 삭제만 가능해요.
            </>
          )}
          cancelLabel="취소"
          confirmLabel="확인"
          dialogClassName="confirm_dialog_vote_submit"
          onCancel={() => setIsVoteConfirmOpen(false)}
          onConfirm={handleVoteConfirm}
        />
      )}

      {actionRowSlot && createPortal(
        <div className="cw_action_row">
          <button type="button" className="p_regular" onClick={handlePhotoActionClick}>
            <img src={imageIcon} className="cw_action_icon" alt="" />
            사진
          </button>
          <button type="button" className="keyboard" onClick={handleKeyboardToggle}>
            <img src={keyboardIcon} className="cw_action_icon" alt="키보드" />
          </button>
        </div>,
        actionRowSlot
      )}
    </>
  )
}

export default VoteWrite
