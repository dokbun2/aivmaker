import { useState } from 'react'
import { Image as ImageIcon, Video, WandSparkles, RefreshCw, Copy, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

type TabType = 'image' | 'video'

export function PromptGenerator() {
  const [activeTab, setActiveTab] = useState<TabType>('image')
  const [showToast, setShowToast] = useState(false)

  // Image form states
  const [imgSubject, setImgSubject] = useState('')
  const [imgAction, setImgAction] = useState('')
  const [imgEnvironment, setImgEnvironment] = useState('')
  const [imgLighting, setImgLighting] = useState('')
  const [imgCamera, setImgCamera] = useState('')
  const [imgStyle, setImgStyle] = useState('')
  const [imgColor, setImgColor] = useState('')
  const [imgQuality, setImgQuality] = useState('')
  const [imgResult, setImgResult] = useState('')

  // Video form states
  const [vidMovement, setVidMovement] = useState('')
  const [vidRotation, setVidRotation] = useState('')
  const [vidParallel, setVidParallel] = useState('')
  const [vidSpecial, setVidSpecial] = useState('')
  const [vidSpeed, setVidSpeed] = useState('')
  const [vidSubject, setVidSubject] = useState('')
  const [vidAction, setVidAction] = useState('')
  const [vidEnvironment, setVidEnvironment] = useState('')
  const [vidLighting, setVidLighting] = useState('')
  const [vidStyle, setVidStyle] = useState('')
  const [vidQuality, setVidQuality] = useState('')
  const [vidResult, setVidResult] = useState('')

  const generateImagePrompt = () => {
    const parts = []
    if (imgSubject) parts.push(imgSubject)
    if (imgAction) parts.push(imgAction)
    if (imgEnvironment) parts.push(imgEnvironment)
    if (imgLighting) parts.push(imgLighting)
    if (imgCamera) parts.push(imgCamera)
    if (imgStyle) parts.push(imgStyle)
    if (imgColor) parts.push(imgColor)
    if (imgQuality) parts.push(imgQuality)

    const prompt = parts.join(', ')
    setImgResult(prompt || '옵션을 선택해주세요.')
  }

  const generateVideoPrompt = () => {
    const cameraParts = []
    const sceneParts = []

    if (vidSpeed) cameraParts.push(vidSpeed)
    if (vidMovement) cameraParts.push(vidMovement)
    if (vidRotation) cameraParts.push(vidRotation)
    if (vidParallel) cameraParts.push(vidParallel)
    if (vidSpecial) cameraParts.push(vidSpecial)

    if (vidSubject) sceneParts.push(vidSubject)
    if (vidAction) sceneParts.push(vidAction)
    if (vidEnvironment) sceneParts.push(vidEnvironment)
    if (vidLighting) sceneParts.push(vidLighting)
    if (vidStyle) sceneParts.push(vidStyle)
    if (vidQuality) sceneParts.push(vidQuality)

    const cameraString = cameraParts.join(' ')
    const sceneString = sceneParts.join(', ')

    let prompt = ''
    if (cameraString && sceneString) {
      prompt = `${cameraString}, ${sceneString}`
    } else if (cameraString) {
      prompt = cameraString
    } else if (sceneString) {
      prompt = sceneString
    } else {
      prompt = '옵션을 선택해주세요.'
    }

    setVidResult(prompt)
  }

  const resetImageForm = () => {
    setImgSubject('')
    setImgAction('')
    setImgEnvironment('')
    setImgLighting('')
    setImgCamera('')
    setImgStyle('')
    setImgColor('')
    setImgQuality('')
    setImgResult('')
  }

  const resetVideoForm = () => {
    setVidMovement('')
    setVidRotation('')
    setVidParallel('')
    setVidSpecial('')
    setVidSpeed('')
    setVidSubject('')
    setVidAction('')
    setVidEnvironment('')
    setVidLighting('')
    setVidStyle('')
    setVidQuality('')
    setVidResult('')
  }

  const copyToClipboard = (text: string) => {
    if (!text || text.includes('옵션을 선택')) {
      return
    }

    navigator.clipboard.writeText(text).then(() => {
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    })
  }

  return (
    <div className="w-full h-full p-1 sm:p-3 md:p-4">
      {/* Tabs */}
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        {/* Tab Headers */}
        <div className="flex bg-white/5 p-1 gap-1">
          <button
            className={`flex-1 py-2.5 px-5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
              activeTab === 'image'
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:text-white'
            }`}
            onClick={() => setActiveTab('image')}
          >
            <ImageIcon className="w-4 h-4" />
            이미지
          </button>
          <button
            className={`flex-1 py-2.5 px-5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
              activeTab === 'video'
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:text-white'
            }`}
            onClick={() => setActiveTab('video')}
          >
            <Video className="w-4 h-4" />
            영상
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-2 sm:p-3 md:p-4">
          {activeTab === 'image' ? (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
                {/* Subject */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/60 font-medium">주제/피사체</label>
                  <select
                    value={imgSubject}
                    onChange={(e) => setImgSubject(e.target.value)}
                    className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="">주제 선택...</option>
                    <option value="a young woman in her 20s">a young woman in her 20s - 20대 젊은 여성</option>
                    <option value="a young man in his 20s">a young man in his 20s - 20대 젊은 남성</option>
                    <option value="a child">a child - 어린이</option>
                    <option value="an elderly person">an elderly person - 노인</option>
                    <option value="a warrior">a warrior - 전사</option>
                    <option value="a knight in armor">a knight in armor - 갑옷을 입은 기사</option>
                    <option value="a scientist in a lab coat">a scientist in a lab coat - 연구복을 입은 과학자</option>
                    <option value="a fashion model">a fashion model - 패션 모델</option>
                    <option value="a musician">a musician - 음악가</option>
                    <option value="an astronaut">an astronaut - 우주비행사</option>
                    <option value="a majestic lion">a majestic lion - 위엄 있는 사자</option>
                    <option value="a white wolf">a white wolf - 흰 늑대</option>
                    <option value="a dragon with scales">a dragon with scales - 비늘이 있는 드래곤</option>
                    <option value="a phoenix rising">a phoenix rising - 날아오르는 불사조</option>
                    <option value="a modern skyscraper">a modern skyscraper - 현대식 고층빌딩</option>
                    <option value="an ancient temple">an ancient temple - 고대 사원</option>
                    <option value="a futuristic spaceship">a futuristic spaceship - 미래형 우주선</option>
                    <option value="a sports car">a sports car - 스포츠카</option>
                  </select>
                </div>

                {/* Action */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/60 font-medium">액션/포즈</label>
                  <select
                    value={imgAction}
                    onChange={(e) => setImgAction(e.target.value)}
                    className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="">액션 선택...</option>
                    <option value="standing confidently">standing confidently - 자신감 있게 서 있는</option>
                    <option value="standing with arms crossed">standing with arms crossed - 팔짱을 낀</option>
                    <option value="walking forward">walking forward - 앞으로 걷는</option>
                    <option value="running at full speed">running at full speed - 전속력으로 달리는</option>
                    <option value="jumping in the air">jumping in the air - 공중에서 점프하는</option>
                    <option value="sitting elegantly">sitting elegantly - 우아하게 앉은</option>
                    <option value="leaning against wall">leaning against wall - 벽에 기댄</option>
                    <option value="fighting stance">fighting stance - 전투 자세</option>
                    <option value="wielding sword">wielding sword - 검을 휘두르는</option>
                    <option value="casting magic spell">casting magic spell - 마법을 시전하는</option>
                    <option value="looking directly at camera">looking directly at camera - 카메라를 똑바로 보는</option>
                    <option value="looking over shoulder">looking over shoulder - 어깨 너머로 보는</option>
                    <option value="reaching out hand">reaching out hand - 손을 뻗는</option>
                    <option value="dancing gracefully">dancing gracefully - 우아하게 춤추는</option>
                    <option value="floating in mid-air">floating in mid-air - 공중에 떠 있는</option>
                  </select>
                </div>

                {/* Environment */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/60 font-medium">환경/배경</label>
                  <select
                    value={imgEnvironment}
                    onChange={(e) => setImgEnvironment(e.target.value)}
                    className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="">환경 선택...</option>
                    <option value="in a dense forest">in a dense forest - 울창한 숲에서</option>
                    <option value="on a mountain peak">on a mountain peak - 산봉우리에서</option>
                    <option value="on a tropical beach">on a tropical beach - 열대 해변에서</option>
                    <option value="in a cyberpunk city">in a cyberpunk city - 사이버펑크 도시에서</option>
                    <option value="in a neon-lit alley">in a neon-lit alley - 네온 조명 골목에서</option>
                    <option value="in downtown city street">in downtown city street - 도심 거리에서</option>
                    <option value="on city rooftop at night">on city rooftop at night - 밤의 도시 옥상에서</option>
                    <option value="in ancient Roman colosseum">in ancient Roman colosseum - 고대 로마 콜로세움에서</option>
                    <option value="in medieval castle hall">in medieval castle hall - 중세 성 홀에서</option>
                    <option value="in Japanese temple garden">in Japanese temple garden - 일본 사원 정원에서</option>
                    <option value="in outer space">in outer space - 우주 공간에서</option>
                    <option value="in futuristic metropolis">in futuristic metropolis - 미래 대도시에서</option>
                    <option value="in enchanted forest">in enchanted forest - 마법의 숲에서</option>
                    <option value="in crystal cave">in crystal cave - 수정 동굴에서</option>
                    <option value="underwater in coral reef">underwater in coral reef - 산호초 수중에서</option>
                    <option value="in vast desert">in vast desert - 광활한 사막에서</option>
                  </select>
                </div>

                {/* Lighting */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/60 font-medium">조명</label>
                  <select
                    value={imgLighting}
                    onChange={(e) => setImgLighting(e.target.value)}
                    className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="">조명 선택...</option>
                    <option value="golden hour lighting">golden hour lighting - 골든아워 조명</option>
                    <option value="sunset lighting">sunset lighting - 일몰 조명</option>
                    <option value="blue hour lighting">blue hour lighting - 블루아워 조명</option>
                    <option value="dramatic side lighting">dramatic side lighting - 극적인 측면 조명</option>
                    <option value="studio lighting setup">studio lighting setup - 스튜디오 조명</option>
                    <option value="rim lighting">rim lighting - 림 라이팅</option>
                    <option value="neon lighting">neon lighting - 네온 조명</option>
                    <option value="warm indoor lighting">warm indoor lighting - 따뜻한 실내 조명</option>
                    <option value="candlelight">candlelight - 촛불빛</option>
                    <option value="volumetric lighting">volumetric lighting - 볼류메트릭 조명</option>
                    <option value="god rays">god rays - 신의 광선</option>
                    <option value="soft diffused light">soft diffused light - 부드럽게 확산된 빛</option>
                    <option value="dramatic chiaroscuro">dramatic chiaroscuro - 극적인 명암대비</option>
                    <option value="bioluminescent glow">bioluminescent glow - 생물발광</option>
                    <option value="magical glow">magical glow - 마법적 빛</option>
                    <option value="backlit by sun">backlit by sun - 태양에 역광</option>
                  </select>
                </div>

                {/* Camera */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/60 font-medium">카메라 앵글</label>
                  <select
                    value={imgCamera}
                    onChange={(e) => setImgCamera(e.target.value)}
                    className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="">카메라 앵글 선택...</option>
                    <option value="close-up">close-up - 클로즈업</option>
                    <option value="medium shot">medium shot - 미디엄 샷</option>
                    <option value="full shot">full shot - 풀 샷</option>
                    <option value="wide shot">wide shot - 와이드 샷</option>
                    <option value="extreme wide shot">extreme wide shot - 익스트림 와이드 샷</option>
                    <option value="eye level">eye level - 아이 레벨</option>
                    <option value="low angle">low angle - 로우 앵글</option>
                    <option value="high angle">high angle - 하이 앵글</option>
                    <option value="bird's eye view">bird's eye view - 버드 아이 뷰</option>
                    <option value="worm's eye view">worm's eye view - 웜스 아이 뷰</option>
                    <option value="three-quarter view">three-quarter view - 3/4 뷰</option>
                    <option value="profile view">profile view - 측면 뷰</option>
                    <option value="over-the-shoulder">over-the-shoulder - 어깨 너머</option>
                    <option value="macro shot">macro shot - 마크로 샷</option>
                  </select>
                </div>

                {/* Style */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/60 font-medium">스타일/무드</label>
                  <select
                    value={imgStyle}
                    onChange={(e) => setImgStyle(e.target.value)}
                    className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="">스타일 선택...</option>
                    <option value="cinematic">cinematic - 영화적</option>
                    <option value="photorealistic">photorealistic - 포토리얼리스틱</option>
                    <option value="hyperrealistic">hyperrealistic - 하이퍼리얼리스틱</option>
                    <option value="dreamy and ethereal">dreamy and ethereal - 꿈같고 영묘한</option>
                    <option value="dark and moody">dark and moody - 어둡고 무드 있는</option>
                    <option value="bright and cheerful">bright and cheerful - 밝고 경쾌한</option>
                    <option value="mysterious">mysterious - 신비로운</option>
                    <option value="serene and peaceful">serene and peaceful - 고요하고 평화로운</option>
                    <option value="dynamic and energetic">dynamic and energetic - 역동적이고 에너제틱한</option>
                    <option value="elegant and sophisticated">elegant and sophisticated - 우아하고 세련된</option>
                    <option value="cyberpunk style">cyberpunk style - 사이버펑크 스타일</option>
                    <option value="steampunk style">steampunk style - 스팀펑크 스타일</option>
                    <option value="vintage 1950s style">vintage 1950s style - 1950년대 빈티지</option>
                    <option value="minimalist">minimalist - 미니멀리스트</option>
                    <option value="surrealism">surrealism - 초현실주의</option>
                  </select>
                </div>

                {/* Color */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/60 font-medium">색감/톤</label>
                  <select
                    value={imgColor}
                    onChange={(e) => setImgColor(e.target.value)}
                    className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="">색감 선택...</option>
                    <option value="warm tones">warm tones - 따뜻한 톤</option>
                    <option value="cool tones">cool tones - 차가운 톤</option>
                    <option value="blue and orange color grading">blue and orange color grading - 블루 앤 오렌지</option>
                    <option value="pink and cyan">pink and cyan - 핑크와 시안</option>
                    <option value="vibrant colors">vibrant colors - 선명한 색상</option>
                    <option value="muted colors">muted colors - 음소거된 색상</option>
                    <option value="pastel colors">pastel colors - 파스텔 색상</option>
                    <option value="neon colors">neon colors - 네온 색상</option>
                    <option value="monochromatic">monochromatic - 단색</option>
                    <option value="high contrast">high contrast - 높은 대비</option>
                    <option value="low contrast">low contrast - 낮은 대비</option>
                    <option value="sepia tones">sepia tones - 세피아 톤</option>
                    <option value="golden tones">golden tones - 골든 톤</option>
                  </select>
                </div>

                {/* Quality */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/60 font-medium">품질</label>
                  <select
                    value={imgQuality}
                    onChange={(e) => setImgQuality(e.target.value)}
                    className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="">품질 선택...</option>
                    <option value="8K resolution, ultra detailed">8K resolution, ultra detailed - 8K 초디테일</option>
                    <option value="4K resolution, highly detailed">4K resolution, highly detailed - 4K 고디테일</option>
                    <option value="photorealistic, sharp focus">photorealistic, sharp focus - 포토리얼, 선명한 초점</option>
                    <option value="ultra high definition">ultra high definition - 초고화질</option>
                    <option value="intricate details">intricate details - 복잡한 디테일</option>
                    <option value="shallow depth of field">shallow depth of field - 얕은 피사계 심도</option>
                    <option value="deep depth of field">deep depth of field - 깊은 피사계 심도</option>
                    <option value="bokeh background">bokeh background - 보케 배경</option>
                    <option value="tack sharp">tack sharp - 완벽하게 선명</option>
                    <option value="film grain">film grain - 필름 그레인</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center mb-3 sm:mb-4">
                <Button
                  onClick={generateImagePrompt}
                  className="bg-white text-black hover:bg-white/90 w-full sm:w-auto"
                >
                  <WandSparkles className="w-4 h-4 mr-2" />
                  생성
                </Button>
                <Button
                  onClick={resetImageForm}
                  variant="outline"
                  className="border-white/20 hover:bg-white/10 w-full sm:w-auto"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  초기화
                </Button>
              </div>

              {/* Result */}
              <div className="bg-white/5 rounded-lg border border-white/10 p-2 sm:p-3 md:p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                  <h3 className="text-sm font-semibold">생성된 프롬프트</h3>
                  <Button
                    onClick={() => copyToClipboard(imgResult)}
                    variant="outline"
                    size="sm"
                    className="border-white/20 hover:bg-white/10 w-full sm:w-auto"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    복사
                  </Button>
                </div>
                <textarea
                  value={imgResult}
                  readOnly
                  placeholder="옵션을 선택하고 '생성' 버튼을 클릭하세요"
                  className="w-full min-h-[120px] p-3.5 rounded-lg bg-black/20 border border-white/10 text-sm text-white resize-y font-mono"
                />
              </div>
            </div>
          ) : (
            <div>
              {/* Camera Movement Section */}
              <h3 className="text-sm font-semibold mb-2 sm:mb-3">카메라 움직임</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
                {/* Movement */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/60 font-medium">줌/이동</label>
                  <select
                    value={vidMovement}
                    onChange={(e) => setVidMovement(e.target.value)}
                    className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="">움직임 선택...</option>
                    <option value="zoom in">zoom in - 줌 인</option>
                    <option value="zoom out">zoom out - 줌 아웃</option>
                    <option value="dolly in">dolly in - 돌리 인</option>
                    <option value="dolly out">dolly out - 돌리 아웃</option>
                  </select>
                </div>

                {/* Rotation */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/60 font-medium">회전</label>
                  <select
                    value={vidRotation}
                    onChange={(e) => setVidRotation(e.target.value)}
                    className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="">회전 선택...</option>
                    <option value="pan left">pan left - 좌측 팬</option>
                    <option value="pan right">pan right - 우측 팬</option>
                    <option value="tilt up">tilt up - 위로 틸트</option>
                    <option value="tilt down">tilt down - 아래로 틸트</option>
                  </select>
                </div>

                {/* Parallel */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/60 font-medium">평행 이동</label>
                  <select
                    value={vidParallel}
                    onChange={(e) => setVidParallel(e.target.value)}
                    className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="">평행 이동 선택...</option>
                    <option value="truck left">truck left - 좌측 트럭</option>
                    <option value="truck right">truck right - 우측 트럭</option>
                    <option value="pedestal up">pedestal up - 페데스탈 업</option>
                    <option value="pedestal down">pedestal down - 페데스탈 다운</option>
                  </select>
                </div>

                {/* Special */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/60 font-medium">특수 효과</label>
                  <select
                    value={vidSpecial}
                    onChange={(e) => setVidSpecial(e.target.value)}
                    className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="">특수 효과 선택...</option>
                    <option value="orbit shot clockwise">orbit shot clockwise - 시계방향 오빗</option>
                    <option value="orbit shot counterclockwise">orbit shot counterclockwise - 반시계방향 오빗</option>
                    <option value="crane up">crane up - 크레인 업</option>
                    <option value="crane down">crane down - 크레인 다운</option>
                    <option value="tracking shot">tracking shot - 트래킹 샷</option>
                    <option value="handheld">handheld - 핸드헬드</option>
                  </select>
                </div>

                {/* Speed */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/60 font-medium">속도/스타일</label>
                  <select
                    value={vidSpeed}
                    onChange={(e) => setVidSpeed(e.target.value)}
                    className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="">속도 선택...</option>
                    <option value="slow">slow - 느린</option>
                    <option value="fast">fast - 빠른</option>
                    <option value="smooth">smooth - 부드러운</option>
                    <option value="dramatic">dramatic - 극적인</option>
                    <option value="gentle">gentle - 부드러운</option>
                    <option value="steady">steady - 안정적인</option>
                  </select>
                </div>
              </div>

              <hr className="border-white/10 my-3 sm:my-4" />

              {/* Scene Composition */}
              <h3 className="text-sm font-semibold mb-2 sm:mb-3">장면 구성</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
                {/* Subject */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/60 font-medium">주제/피사체</label>
                  <select
                    value={vidSubject}
                    onChange={(e) => setVidSubject(e.target.value)}
                    className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="">주제 선택...</option>
                    <option value="a young woman in her 20s">a young woman in her 20s - 20대 젊은 여성</option>
                    <option value="a young man in his 20s">a young man in his 20s - 20대 젊은 남성</option>
                    <option value="a child">a child - 어린이</option>
                    <option value="an elderly person">an elderly person - 노인</option>
                    <option value="a warrior">a warrior - 전사</option>
                    <option value="a knight in armor">a knight in armor - 갑옷을 입은 기사</option>
                    <option value="a scientist in a lab coat">a scientist in a lab coat - 연구복을 입은 과학자</option>
                    <option value="a fashion model">a fashion model - 패션 모델</option>
                    <option value="a musician">a musician - 음악가</option>
                    <option value="an astronaut">an astronaut - 우주비행사</option>
                    <option value="a majestic lion">a majestic lion - 위엄 있는 사자</option>
                    <option value="a dragon with scales">a dragon with scales - 비늘이 있는 드래곤</option>
                    <option value="a futuristic spaceship">a futuristic spaceship - 미래형 우주선</option>
                    <option value="a sports car">a sports car - 스포츠카</option>
                  </select>
                </div>

                {/* Action */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/60 font-medium">액션/포즈</label>
                  <select
                    value={vidAction}
                    onChange={(e) => setVidAction(e.target.value)}
                    className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="">액션 선택...</option>
                    <option value="standing confidently">standing confidently - 자신감 있게 서 있는</option>
                    <option value="walking forward">walking forward - 앞으로 걷는</option>
                    <option value="running at full speed">running at full speed - 전속력으로 달리는</option>
                    <option value="jumping in the air">jumping in the air - 공중에서 점프하는</option>
                    <option value="sitting elegantly">sitting elegantly - 우아하게 앉은</option>
                    <option value="fighting stance">fighting stance - 전투 자세</option>
                    <option value="dancing gracefully">dancing gracefully - 우아하게 춤추는</option>
                    <option value="looking directly at camera">looking directly at camera - 카메라를 똑바로 보는</option>
                  </select>
                </div>

                {/* Environment */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/60 font-medium">환경/배경</label>
                  <select
                    value={vidEnvironment}
                    onChange={(e) => setVidEnvironment(e.target.value)}
                    className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="">환경 선택...</option>
                    <option value="in a dense forest">in a dense forest - 울창한 숲에서</option>
                    <option value="on a mountain peak">on a mountain peak - 산봉우리에서</option>
                    <option value="in a cyberpunk city">in a cyberpunk city - 사이버펑크 도시에서</option>
                    <option value="on city rooftop at night">on city rooftop at night - 밤의 도시 옥상에서</option>
                    <option value="in medieval castle hall">in medieval castle hall - 중세 성 홀에서</option>
                    <option value="in outer space">in outer space - 우주 공간에서</option>
                    <option value="underwater in coral reef">underwater in coral reef - 산호초 수중에서</option>
                  </select>
                </div>

                {/* Lighting */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/60 font-medium">조명</label>
                  <select
                    value={vidLighting}
                    onChange={(e) => setVidLighting(e.target.value)}
                    className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="">조명 선택...</option>
                    <option value="golden hour lighting">golden hour lighting - 골든아워 조명</option>
                    <option value="sunset lighting">sunset lighting - 일몰 조명</option>
                    <option value="dramatic side lighting">dramatic side lighting - 극적인 측면 조명</option>
                    <option value="neon lighting">neon lighting - 네온 조명</option>
                    <option value="volumetric lighting">volumetric lighting - 볼류메트릭 조명</option>
                    <option value="magical glow">magical glow - 마법적 빛</option>
                  </select>
                </div>

                {/* Style */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/60 font-medium">스타일/무드</label>
                  <select
                    value={vidStyle}
                    onChange={(e) => setVidStyle(e.target.value)}
                    className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="">스타일 선택...</option>
                    <option value="cinematic">cinematic - 영화적</option>
                    <option value="photorealistic">photorealistic - 포토리얼리스틱</option>
                    <option value="dreamy and ethereal">dreamy and ethereal - 꿈같고 영묘한</option>
                    <option value="dark and moody">dark and moody - 어둡고 무드 있는</option>
                    <option value="mysterious">mysterious - 신비로운</option>
                    <option value="dynamic and energetic">dynamic and energetic - 역동적이고 에너제틱한</option>
                  </select>
                </div>

                {/* Quality */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/60 font-medium">품질</label>
                  <select
                    value={vidQuality}
                    onChange={(e) => setVidQuality(e.target.value)}
                    className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="">품질 선택...</option>
                    <option value="8K resolution, ultra detailed">8K resolution, ultra detailed - 8K 초디테일</option>
                    <option value="4K resolution, highly detailed">4K resolution, highly detailed - 4K 고디테일</option>
                    <option value="photorealistic, sharp focus">photorealistic, sharp focus - 포토리얼, 선명한 초점</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center mb-3 sm:mb-4">
                <Button
                  onClick={generateVideoPrompt}
                  className="bg-white text-black hover:bg-white/90 w-full sm:w-auto"
                >
                  <WandSparkles className="w-4 h-4 mr-2" />
                  생성
                </Button>
                <Button
                  onClick={resetVideoForm}
                  variant="outline"
                  className="border-white/20 hover:bg-white/10 w-full sm:w-auto"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  초기화
                </Button>
              </div>

              {/* Result */}
              <div className="bg-white/5 rounded-lg border border-white/10 p-2 sm:p-3 md:p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                  <h3 className="text-sm font-semibold">생성된 프롬프트</h3>
                  <Button
                    onClick={() => copyToClipboard(vidResult)}
                    variant="outline"
                    size="sm"
                    className="border-white/20 hover:bg-white/10 w-full sm:w-auto"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    복사
                  </Button>
                </div>
                <textarea
                  value={vidResult}
                  readOnly
                  placeholder="옵션을 선택하고 '생성' 버튼을 클릭하세요"
                  className="w-full min-h-[120px] p-3.5 rounded-lg bg-black/20 border border-white/10 text-sm text-white resize-y font-mono"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 left-3 sm:left-auto bg-white/10 backdrop-blur-xl border border-white/20 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg flex items-center gap-2 shadow-2xl animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle className="w-4.5 h-4.5" />
          <span className="text-sm">복사되었습니다!</span>
        </div>
      )}
    </div>
  )
}
