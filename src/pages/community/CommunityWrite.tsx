import './CommunityWrite.css'
import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import { useActionRowSlot } from '../../contexts/ActionRowContext'
import { useLocation, useNavigate } from 'react-router'
import PageHeader from '../../components/PageHeader'
import BackButton from '../../components/html/BackButton'
import Button from '../../components/html/Button'
import Input from '../../components/html/Input'
import { readMyProfileName } from '../../utils/myProfile'
import { showStateBarMessage } from '../../utils/stateBarMessage'
import { addUserNotification } from '../../utils/userNotifications'
import {
  readCommunityCreatedPosts,
  writeCommunityCreatedPosts,
} from '../../utils/communityCreatedPosts'
import communityWriteBg from '../../svg/community_write_bg.svg'
import imageIcon from '../../svg/Image.svg'
import tagsIcon from '../../svg/tags.svg'
import locationIcon from '../../svg/location.svg'
import keyboardIcon from '../../svg/keyboard.svg'
import PostMoreSheet from '../../components/PostMoreSheet'


const boardOptions = ['일상'] as const
type BoardOption = (typeof boardOptions)[number]

const boardDisplayOptions: { value: string; disabled: boolean }[] = [
  { value: '일상', disabled: false },
  { value: '자랑하기', disabled: true },
]

type EditPost = {
  id: number
  tag: string
  title: string
  content?: string
  image: string | null
  images?: string[]
  tags?: string[]
  author?: string
  likes?: number
  comments?: number
  shares?: number
  createdAt?: string
  date?: string
  place?: { name: string; address: string }
}


function CommunityWrite() {
  const navigate = useNavigate()
  const location = useLocation()
  const writeState = (location.state as { editPost?: EditPost; returnTo?: string } | null) ?? null
  const editPost = writeState?.editPost
  const backTarget = writeState?.returnTo

  const [board, setBoard] = useState<BoardOption | ''>(
    editPost && boardOptions.includes(editPost.tag as BoardOption) ? (editPost.tag as BoardOption) : ''
  )
  const [isBoardOpen, setIsBoardOpen] = useState(false)
  const [title, setTitle] = useState(editPost?.title ?? '')
  const [content, setContent] = useState(editPost?.content ?? '')
  const [images, setImages] = useState<string[]>(editPost?.images ?? [])
  const [isPhotoSheetOpen, setIsPhotoSheetOpen] = useState(false)
  const [isKeyboardShown, setIsKeyboardShown] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)
  const boardSelectRef = useRef<HTMLDivElement>(null)
  const actionRowSlot = useActionRowSlot()
  const handleAddTagRef = useRef<() => void>(() => {})
  const handleKeyboardToggleRef = useRef<() => void>(() => {})

  useEffect(() => {
    if (!isBoardOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (!boardSelectRef.current?.contains(e.target as Node)) {
        setIsBoardOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isBoardOpen])

  const handleAlbum = () => { setIsPhotoSheetOpen(false); fileInputRef.current?.click() }
  const handleCamera = () => { setIsPhotoSheetOpen(false); cameraInputRef.current?.click() }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const urls = files.map((f) => URL.createObjectURL(f))
    e.target.value = ''
    if (!urls.length) return
    setImages((prev) => [...prev, ...urls])
  }

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleAddTag = () => {
    setContent((prev) => (prev ? `${prev} #` : '#'))
    contentTextareaRef.current?.focus()
  }
  handleAddTagRef.current = handleAddTag

  const handleKeyboardToggle = () => {
    if (isKeyboardShown) {
      contentTextareaRef.current?.blur()
    } else {
      contentTextareaRef.current?.focus()
    }
  }
  handleKeyboardToggleRef.current = handleKeyboardToggle

  const extractTags = (text: string): string[] => {
    const matches = [...text.matchAll(/#([가-힣ㄱ-ㅣa-zA-Z0-9_]+)/g)]
    return [...new Set(matches.map((m) => m[1]))]
  }

  const stripTags = (text: string): string =>
    text
      .replace(/#[가-힣ㄱ-ㅣa-zA-Z0-9_]+/g, '')
      .split('\n')
      .map((l) => l.replace(/[ \t]+/g, ' ').trim())
      .join('\n')
      .trim()

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault()
    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()
    if (!trimmedTitle || !trimmedContent || !board) return

    const extractedTags = extractTags(trimmedContent)
    const strippedContent = stripTags(trimmedContent)

    if (editPost) {
      const updatedPost = {
        ...editPost,
        tag: board,
        title: trimmedTitle,
        content: strippedContent,
        image: images[0] ?? null,
        images,
        tags: extractedTags,
      }
      try {
        const existing = readCommunityCreatedPosts()
        const updated = existing.some((p) => p.id === editPost.id)
          ? existing.map((p) => (p.id === editPost.id ? updatedPost : p))
          : [updatedPost, ...existing]
        writeCommunityCreatedPosts(updated)
      } catch { /* noop */ }
      showStateBarMessage('게시글이 수정되었어요.')
      navigate(`/community/petstory/detail/${editPost.id}`, {
        state: {
          post: updatedPost,
          returnTo: backTarget,
        },
      })
      return
    }

    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')

    const newPost = {
      id: Date.now(),
      tag: board,
      title: trimmedTitle,
      content: trimmedContent,
      author: readMyProfileName(),
      date: `${year}.${month}.${day}`,
      likes: 0,
      comments: 0,
      shares: 0,
      createdAt: now.toISOString(),
      image: images[0] ?? null,
      images,
      tags: extractedTags,
    }

    try {
      const existing = readCommunityCreatedPosts()
      writeCommunityCreatedPosts([newPost, ...existing])
    } catch { /* noop */ }

    addUserNotification({ title: '커뮤니티', content: '게시글이 등록되었습니다.', path: '/community/petstory' })
    showStateBarMessage('게시글이 등록되었습니다.')
    navigate(backTarget ?? '/community/petstory')
  }

  return (
    <>
      <PageHeader
        title={editPost ? '글수정' : '글작성'}
        leftContent={<BackButton to={backTarget ?? -1} />}
        rightContent={
          <Button
            type="submit"
            form="cw_form"
            className="s_purple_btn"
            disabled={!title.trim() || !content.trim() || !board}
          >
            {editPost ? '수정' : '등록'}
          </Button>
        }
      />

      <main className="page cw_page">
        <form id="cw_form" className="cw_form" style={{ backgroundImage: `url(${communityWriteBg})` }} onSubmit={handleSubmit}>

          <div className="cw_section cw_section_no_bottom_space cw_board_section">
            <div className="cw_board_select" ref={boardSelectRef}>
              <button
                type="button"
                className={`cw_board_toggle${isBoardOpen ? ' is_open' : ''}`}
                onClick={() => setIsBoardOpen((p) => !p)}
                aria-haspopup="listbox"
                aria-expanded={isBoardOpen}
              >
                <span className={board ? '' : 'cw_placeholder'}>{board || '게시글을 선택해주세요'}</span>
                <i className="bx bx-chevron-down cw_chevron_icon" aria-hidden="true" />
              </button>
              <div className={`cw_board_menu${isBoardOpen ? ' open' : ''}`} role="listbox">
                  {boardDisplayOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`cw_board_option${board === opt.value ? ' active' : ''}${opt.disabled ? ' is_disabled' : ''}`}
                      role="option"
                      aria-selected={board === opt.value}
                      disabled={opt.disabled}
                      onClick={() => { setBoard(opt.value as BoardOption); setIsBoardOpen(false) }}
                    >
                      {opt.value}
                    </button>
                  ))}
                </div>
            </div>
          </div>

          <div className="cw_section cw_section_no_bottom_space">
            <Input
              className="cw_title_input"
              value={title}
              onChange={setTitle}
              placeholder="제목을 입력해주세요"
              maxLength={40}
            />
          </div>

          <div className="cw_section cw_section_no_bottom_space cw_content_section">
            <textarea
              ref={contentTextareaRef}
              className="input_field cw_content_textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsKeyboardShown(true)}
              onBlur={() => setIsKeyboardShown(false)}
              placeholder={'오늘의 펫스토리 내용을 작성해 보세요\n#투표 #반려동물 #일상...'}
            />
          </div>

          {images.length > 0 && (
            <div className={`cw_image_gallery${images.length >= 2 ? ' cw_image_gallery_scrollable' : ''}`}>
              {images.map((url, idx) => (
                <div key={idx} className="cw_gallery_item">
                  <img src={url} alt="" className="cw_gallery_image" />
                  <button
                    type="button"
                    className="cw_inline_image_remove"
                    onClick={() => removeImage(idx)}
                    aria-label="사진 삭제"
                  >
                    <i className="bx bx-x" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}

        </form>
      </main>

      <input ref={fileInputRef} type="file" accept="image/*" multiple className="cw_hidden_input" onChange={handleFileChange} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="cw_hidden_input" onChange={handleFileChange} />

      {isPhotoSheetOpen && (
        <PostMoreSheet
          type="photo"
          onClose={() => setIsPhotoSheetOpen(false)}
          onCamera={handleCamera}
          onAlbum={handleAlbum}
        />
      )}

      {actionRowSlot && createPortal(
        <div className="cw_action_row">
          <div className="cw_action_left">
            <button type="button" className="p_regular" onClick={() => setIsPhotoSheetOpen(true)}>
              <img src={imageIcon} className="cw_action_icon" alt="사진" />
              사진
            </button>
            <button type="button" className="p_regular" onClick={() => handleAddTagRef.current()}>
              <img src={tagsIcon} className="cw_action_icon" alt="태그" />
              태그
            </button>
            <button type="button" className="p_regular cw_action_place_btn" disabled>
              <img src={locationIcon} className="cw_action_icon" alt="위" />
              위치
            </button>
          </div>
          <button type="button" className="keyboard" onClick={() => handleKeyboardToggleRef.current()}>
            <img src={keyboardIcon} className="cw_action_icon" alt="키보드" />
          </button>
        </div>,
        actionRowSlot
      )}
    </>
  )
}

export default CommunityWrite
