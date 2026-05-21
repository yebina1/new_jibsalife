import './PostMoreSheet.css'
import AddSheet from './AddSheet'
import Button from './html/Button'

type PostMoreSheetProps =
  | { type: 'own';   onClose: () => void; onDelete: () => void; onEdit: () => void; onReport?: never; onBlock?: never; onCamera?: never; onAlbum?: never }
  | { type: 'other'; onClose: () => void; onReport: () => void; onBlock: () => void; onDelete?: never; onEdit?: never; onCamera?: never; onAlbum?: never }
  | { type: 'photo'; onClose: () => void; onCamera: () => void; onAlbum: () => void; onDelete?: never; onEdit?: never; onReport?: never; onBlock?: never }

function PostMoreSheet({ type, onClose, onDelete, onEdit, onReport, onBlock, onCamera, onAlbum }: PostMoreSheetProps) {
  return (
    <AddSheet onClose={onClose}>
      <ul className="post_more_sheet_list">
        {type === 'own' ? (
          <>
            <li><button type="button" onClick={onDelete}>삭제하기</button></li>
            <li><button type="button" onClick={onEdit}>수정하기</button></li>
          </>
        ) : type === 'photo' ? (
          <>
            <li><button type="button" onClick={onCamera}>사진 촬영하기</button></li>
            <li><button type="button" onClick={onAlbum}>갤러리에서 업로드</button></li>
          </>
        ) : (
          <>
            <li><button type="button" onClick={onReport}>신고하기</button></li>
            <li><button type="button" onClick={onBlock}>차단하기</button></li>
          </>
        )}
      </ul>
      <Button type="button" className="purple_btn post_more_sheet_close" onClick={onClose}>
        닫기
      </Button>
    </AddSheet>
  )
}

export default PostMoreSheet
