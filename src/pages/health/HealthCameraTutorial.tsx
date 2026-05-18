import './HealthCameraTutorial.css'
import tutorialArrowVideo from '../../svg/health/arrow1.svg'
import tutorialArrowPhoto from '../../svg/health/arrow2.svg'
import tutorialArrowRecord from '../../svg/health/arrow3.svg'
import tutorialArrowClose from '../../svg/health/arrow4.svg'

export type CameraTutorialStepId = 'video' | 'photo' | 'record' | 'close'

export const cameraTutorialStepOrder: CameraTutorialStepId[] = ['video', 'photo', 'record', 'close']
export const cameraTutorialStepDurations = [2200, 2200, 2400, 2200]

type Props = {
  step: CameraTutorialStepId
  isCameraTabActive: boolean
  isRecordTabActive: boolean
  onAdvance: () => void
}

function HealthCameraTutorial({ step, isCameraTabActive, isRecordTabActive, onAdvance }: Props) {
  const tabsClassName = [
    'health_cam_tabs',
    'health_cam_tutorial_tabs',
    step === 'video' || step === 'photo' ? 'show_camera_only' : '',
    step === 'record' ? 'show_record_only' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      className="health_cam_tutorial_layer"
      onClick={step === 'close' ? undefined : onAdvance}
      aria-label={step === 'close' ? '촬영 가이드' : '촬영 가이드 다음'}
    >
      <span className="health_cam_tutorial_backdrop" aria-hidden="true" />
      <span className="health_cam_tutorial_focus_box" aria-hidden="true">
        <span />
      </span>
      <span
        className={`health_cam_tabs_wrapper health_cam_tutorial_tabs_wrapper${step === 'close' ? ' is_hidden' : ''}`}
        aria-hidden="true"
      >
        <span className={tabsClassName}>
          <span className={`health_cam_tab${isCameraTabActive ? ' is_active' : ''}`}>
            카메라
          </span>
          <span className={`health_cam_tab${isRecordTabActive ? ' is_active' : ''}`}>
            기록
          </span>
        </span>
      </span>

      {step === 'video' ? (
        <span className="health_cam_tutorial_callout health_cam_tutorial_callout_video">
          <span className="health_cam_tutorial_text">
            <span>동영상은<br />
            <span className="health_cam_tutorial_emphasis">흔들리지 않게</span> 해 주세요!</span>
          </span>
          <img src={tutorialArrowVideo} alt="" aria-hidden="true" />
        </span>
      ) : null}

      {step === 'photo' ? (
        <span className="health_cam_tutorial_callout health_cam_tutorial_callout_photo">
          <span className="health_cam_tutorial_text">
            사진은 <span className="health_cam_tutorial_emphasis">밝은</span> 곳에서
            <br />
            <span className="health_cam_tutorial_emphasis">선명</span>하게 촬영 해주세요!
          </span>
          <img src={tutorialArrowPhoto} alt="" aria-hidden="true" />
        </span>
      ) : null}

      {step === 'record' ? (
        <span className="health_cam_tutorial_callout health_cam_tutorial_callout_record">
          <span className="health_cam_tutorial_text">
            <span className="health_cam_tutorial_emphasis">기록</span>을 저장하거나
            <br />
            <span className="health_cam_tutorial_emphasis">AI 건강 리포트</span>를
            <br />
            받을 수 있어요!
          </span>
          <img src={tutorialArrowRecord} alt="" aria-hidden="true" />
        </span>
      ) : null}

      {step === 'close' ? (
        <span className="health_cam_tutorial_callout health_cam_tutorial_callout_close">
          <span className="health_cam_tutorial_text">
            <span className="health_cam_tutorial_emphasis">닫기</span>를 눌러
            <br />
            나갈 수 있어요!
          </span>
          <img src={tutorialArrowClose} alt="" aria-hidden="true" />
        </span>
      ) : null}
    </button>
  )
}

export default HealthCameraTutorial
