const emergencyKeywords = [
  '피를 토',
  '혈변',
  '호흡곤란',
  '숨을 못',
  '경련',
  '의식',
  '쓰러',
  '마비',
  '중독',
  '초콜릿',
  '양파',
  '포도',
]

const localAnswerRules = [
  {
    keywords: ['산책', '활동량', '운동', '스트레스'],
    answer:
      '산책은 스트레스 완화와 체중 관리에 도움이 돼요. 갑자기 오래 걷기보다 10-15분 정도부터 늘리고, 헐떡임이나 절뚝거림이 보이면 바로 쉬게 해주세요.',
  },
  {
    keywords: ['밥', '사료', '식사', '간식', '급하게 먹', '밥 거부', '식욕'],
    answer:
      '식사 변화는 소화에 영향을 줄 수 있어요. 사료를 바꿀 때는 기존 사료와 섞어 5-7일 정도 천천히 교체하고, 밥 거부가 하루 이상 이어지거나 구토가 동반되면 진료를 권장해요.',
  },
  {
    keywords: ['물', '음수', '많이 마심', '소변'],
    answer:
      '물을 평소보다 많이 마시거나 소변 변화가 계속되면 신장, 당 조절, 염증 같은 원인도 확인이 필요해요. 음수량과 소변 색, 냄새를 캘린더에 함께 기록해두면 진료 상담에 도움이 됩니다.',
  },
  {
    keywords: ['구토', '설사', '변비', '배변', '혈변', '소화'],
    answer:
      '소화/배변 이상은 횟수, 색, 냄새, 식욕 변화를 같이 보는 게 좋아요. 반복되는 구토나 설사, 혈변은 가볍게 넘기지 말고 병원 상담을 추천드려요.',
  },
  {
    keywords: ['기침', '재채기', '숨', '헐떡', '호흡', '코 분비물'],
    answer:
      '호흡 관련 증상은 지속 시간과 숨소리 변화가 중요해요. 기침이나 재채기가 반복되거나 숨이 가빠 보이면 활동을 줄이고 빠르게 진료 상담을 받아보세요.',
  },
  {
    keywords: ['피부', '가려움', '귀 긁', '눈물', '눈 충혈', '털 빠짐', '발진', '입 냄새'],
    answer:
      '피부나 눈, 귀 증상은 알레르기나 염증과 이어질 수 있어요. 긁는 부위, 분비물, 냄새 변화가 있는지 기록하고 증상이 반복되면 검진을 받아보는 편이 좋아요.',
  },
  {
    keywords: ['절뚝', '계단', '관절', '점프', '통증', '산책 거부'],
    answer:
      '움직임 변화는 근육이나 관절 통증 신호일 수 있어요. 무리한 산책과 점프를 피하고, 절뚝거림이 반복되면 관절 상태를 확인해보는 것을 권장해요.',
  },
  {
    keywords: ['건강체크', '점수', 'AI 건강'],
    answer:
      'AI 건강체크 점수는 등록한 사진/메모와 캘린더 누적 기록을 함께 참고해요. 식사, 배변, 활동, 증상 기록이 많을수록 변화 흐름을 더 잘 볼 수 있습니다.',
  },
  {
    keywords: ['캘린더', '기록', '저장', '등록'],
    answer:
      '산책 시간, 식사량, 증상, 배변 내용을 채팅에 적으면 캘린더 기록으로 자동 연동돼요. 예를 들어 “산책 30분”, “사료 60g”, “설사”처럼 입력하면 됩니다.',
  },
] as const

function hasKeyword(message: string, keywords: readonly string[]) {
  return keywords.some((keyword) => message.includes(keyword))
}

export function createLocalChatbotAnswer(message: string) {
  const normalizedMessage = message.replace(/\s+/g, ' ').trim()

  if (!normalizedMessage) return null

  if (hasKeyword(normalizedMessage, emergencyKeywords)) {
    return '응급 가능성이 있는 내용이 포함되어 있어요. 증상이 심하거나 반복된다면 앱 답변만 기다리지 말고 가까운 동물병원에 바로 문의해 주세요.'
  }

  const matchedRule = localAnswerRules.find((rule) => hasKeyword(normalizedMessage, rule.keywords))

  if (matchedRule) return matchedRule.answer

  return '인터넷 검색 없이 앱에 저장된 건강 가이드 기준으로 답변드릴게요. 산책, 식사량, 배변, 증상처럼 구체적으로 적어주시면 더 정확히 안내하고 캘린더 기록도 함께 확인할 수 있어요.'
}
