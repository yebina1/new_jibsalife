import { GoogleGenerativeAI } from '@google/generative-ai'

const systemPrompt = `
너는 반려생활 커뮤니티 기반 AI 케어 플랫폼의 AI 챗봇이야.

역할:
- 반려동물의 식사, 활동, 배변/배뇨 기록을 바탕으로 짧게 안내해.
- 최근 3일치 기록에서 평소와 다른 변화가 있으면 알려줘.
- 사용자가 기록과 커뮤니티 활동을 자연스럽게 이어갈 수 있도록 도와줘.

말투:
- 따뜻하고 친근하게 답변해.
- 답변은 2문장 이내로 짧게 해.
- 차분하게 안내해.

주의:
- 질병을 진단하지 마.
- 치료법이나 약 복용을 단정하지 마.
- 이상 신호가 의심되면 병원 상담을 권장해.
`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { message, recentMessages, petRecord } = req.body

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `
${systemPrompt}

최근 대화:
${recentMessages?.join('\n') || '없음'}

최근 기록:
${petRecord || '기록 없음'}

사용자 질문:
${message}
`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    res.json({ answer: response })
  } catch (error) {
    console.error(error)
    res.status(500).json({ answer: '답변 생성 실패' })
  }
}
