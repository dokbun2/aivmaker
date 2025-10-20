import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, Copy, Check, Edit2, X, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PromptStructure {
  subject?: string
  style?: string
  composition?: string
  lighting?: string
  colors?: string
  mood?: string
  environment?: string
  quality?: string
  camera?: string
  poseAction?: string
  emotion?: string
  expression?: string
  specialEffects?: string
  details?: string
  parameters?: string
}

interface Motion {
  ko?: string
  en?: string
  speed?: string
}

interface Setting {
  location?: string
  timeOfDay?: string
  atmosphere?: string
}

interface Frame {
  shotType?: string
  duration?: number
  description?: string
  promptStructure?: PromptStructure
  prompt?: string
  parameters?: string
  imageUrl?: string
  videoUrl?: string
  motion?: Motion
}

interface Scene {
  scene?: number
  sceneNumber?: number
  sceneId?: string
  id?: string
  title?: string
  description?: string
  duration?: number
  setting?: Setting
  charactersInScene?: string[]
  frames?: {
    start: Frame
    middle: Frame
    end: Frame
  }
  shots?: {
    start: Frame
    middle: Frame
    end: Frame
  }
  transition?: {
    type?: string
    duration: number
  }
}

interface SceneCardProps {
  scene: Scene
  index: number
}

type FrameType = 'start' | 'middle' | 'end'

const FRAME_LABELS: Record<FrameType, string> = {
  start: '시작',
  middle: '중간',
  end: '끝'
}

const FRAME_COLORS: Record<FrameType, string> = {
  start: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  middle: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  end: 'bg-purple-500/10 border-purple-500/30 text-purple-400'
}

function FramePage({
  frame,
  type,
  sceneId
}: {
  frame: Frame
  type: FrameType
  sceneId: string
}) {
  const [isEditingPrompt, setIsEditingPrompt] = useState(false)
  const [editedPrompt, setEditedPrompt] = useState('')
  const [copied, setCopied] = useState(false)
  const [copiedMotion, setCopiedMotion] = useState(false)
  const [imageUrl, setImageUrl] = useState(() => {
    const cached = localStorage.getItem(`frame_image_${sceneId}_${type}`)
    return cached || frame.imageUrl || ''
  })
  const [videoUrl, setVideoUrl] = useState(() => {
    const cached = localStorage.getItem(`frame_video_${sceneId}_${type}`)
    return cached || frame.videoUrl || ''
  })

  // 프레임 타입이 변경될 때마다 이미지와 비디오 URL 업데이트
  useEffect(() => {
    const cachedImage = localStorage.getItem(`frame_image_${sceneId}_${type}`)
    const cachedVideo = localStorage.getItem(`frame_video_${sceneId}_${type}`)

    setImageUrl(cachedImage || frame.imageUrl || '')
    setVideoUrl(cachedVideo || frame.videoUrl || '')
  }, [sceneId, type, frame.imageUrl, frame.videoUrl])

  const displayPrompt = (() => {
    const cachedPrompt = localStorage.getItem(`frame_prompt_${sceneId}_${type}`)
    if (cachedPrompt) return cachedPrompt

    // prompt가 있으면 그대로 사용
    if (frame.prompt) return frame.prompt

    // promptStructure가 있으면 문자열로 변환
    if (frame.promptStructure) {
      const parts: string[] = []
      const ps = frame.promptStructure

      if (ps.subject) parts.push(ps.subject)
      if (ps.composition) parts.push(ps.composition)
      if (ps.style) parts.push(ps.style)
      if (ps.lighting) parts.push(ps.lighting)
      if (ps.colors) parts.push(ps.colors)
      if (ps.mood) parts.push(ps.mood)
      if (ps.environment) parts.push(ps.environment)
      if (ps.details) parts.push(ps.details)
      if (ps.quality) parts.push(ps.quality)
      if (ps.camera) parts.push(ps.camera)
      if (ps.poseAction) parts.push(ps.poseAction)
      if (ps.emotion) parts.push(ps.emotion)
      if (ps.expression) parts.push(ps.expression)
      if (ps.specialEffects) parts.push(ps.specialEffects)

      return parts.join(' ')
    }

    return ''
  })()

  const handleEditPrompt = () => {
    setEditedPrompt(displayPrompt)
    setIsEditingPrompt(true)
  }

  const handleSavePrompt = () => {
    localStorage.setItem(`frame_prompt_${sceneId}_${type}`, editedPrompt)
    setIsEditingPrompt(false)

    // Update project data in localStorage
    const projectData = JSON.parse(localStorage.getItem('currentProject') || '{}')
    if (projectData.scenes) {
      const scene = projectData.scenes.find((s: any) =>
        (s.sceneId === sceneId) || (s.id === sceneId)
      )
      if (scene?.frames?.[type]) {
        scene.frames[type].prompt = editedPrompt
        localStorage.setItem('currentProject', JSON.stringify(projectData))
      }
    }
  }

  const handleCancelEdit = () => {
    setIsEditingPrompt(false)
    setEditedPrompt('')
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyMotion = async () => {
    if (frame.motion?.en) {
      await navigator.clipboard.writeText(frame.motion.en)
      setCopiedMotion(true)
      setTimeout(() => setCopiedMotion(false), 2000)
    }
  }

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url)
    localStorage.setItem(`frame_image_${sceneId}_${type}`, url)
  }

  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url)
    localStorage.setItem(`frame_video_${sceneId}_${type}`, url)
  }

  return (
    <div className="space-y-6">
      {/* 상단: 프레임 정보 */}
      <div className="space-y-4">
        <div>
          <div className={cn(
            "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium",
            FRAME_COLORS[type]
          )}>
            {FRAME_LABELS[type]} 프레임
          </div>

          {frame.description && (
            <p className="text-sm text-muted-foreground mt-4">{frame.description}</p>
          )}
        </div>

        {/* 프롬프트 - 전체 너비 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">프롬프트</h4>
            <div className="flex gap-2">
              {!isEditingPrompt && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleEditPrompt}
                    className="h-8 px-2"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopy}
                    className="h-8 px-2"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>

          {isEditingPrompt ? (
            <div className="space-y-2">
              <Textarea
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                placeholder="프롬프트를 입력하세요..."
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSavePrompt}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-1" />
                  저장
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelEdit}
                >
                  <X className="h-4 w-4 mr-1" />
                  취소
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-sm font-mono whitespace-pre-wrap">
                {displayPrompt || '프롬프트가 없습니다'}
              </p>
            </div>
          )}
        </div>

        {/* 모션 */}
        {frame.motion && (frame.motion.ko || frame.motion.en) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">모션</h4>
              {frame.motion.en && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyMotion}
                  className="h-8 px-2"
                >
                  {copiedMotion ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <p className="text-sm text-blue-400">
                {frame.motion.ko && frame.motion.en
                  ? `${frame.motion.ko} / ${frame.motion.en}`
                  : frame.motion.ko || frame.motion.en}
                {frame.motion.speed && ` (${frame.motion.speed})`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 하단: 미디어 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium mb-2">이미지 URL</h4>
          <Input
            value={imageUrl}
            onChange={(e) => handleImageUrlChange(e.target.value)}
            placeholder="이미지 URL을 입력하세요..."
            className="font-mono text-sm"
          />
          {imageUrl && (
            <div className="mt-4 h-[300px] rounded-lg overflow-hidden border border-white/10 bg-black/50 flex items-center justify-center">
              <img
                src={imageUrl}
                alt={`${type} frame`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">비디오 URL</h4>
          <Input
            value={videoUrl}
            onChange={(e) => handleVideoUrlChange(e.target.value)}
            placeholder="비디오 URL을 입력하세요..."
            className="font-mono text-sm"
          />
          {videoUrl && (
            <div className="mt-4 h-[300px] rounded-lg overflow-hidden border border-white/10 bg-black/50 flex items-center justify-center">
              <video
                src={videoUrl}
                controls
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              >
                비디오를 재생할 수 없습니다.
              </video>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function SceneCard({ scene, index }: SceneCardProps) {
  const [currentFrame, setCurrentFrame] = useState<FrameType>('start')
  const sceneIdValue = scene.sceneId || scene.id || `scene_${index}`
  const frames = scene.frames || scene.shots

  const frameOrder: FrameType[] = ['start', 'middle', 'end']
  const currentFrameIndex = frameOrder.indexOf(currentFrame)

  const handlePrevious = () => {
    if (currentFrameIndex > 0) {
      setCurrentFrame(frameOrder[currentFrameIndex - 1])
    }
  }

  const handleNext = () => {
    if (currentFrameIndex < frameOrder.length - 1) {
      setCurrentFrame(frameOrder[currentFrameIndex + 1])
    }
  }

  const handleFrameSelect = (frame: FrameType) => {
    setCurrentFrame(frame)
  }

  if (!frames) {
    return (
      <Card className="backdrop-blur-xl bg-card/50 border-white/10">
        <CardContent className="py-8">
          <p className="text-muted-foreground text-center">씬 데이터가 없습니다.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="backdrop-blur-xl bg-card/50 border-white/10">
      <CardContent className="space-y-2 pt-2">
        {/* 프레임 네비게이션 */}
        <div className="flex items-center justify-between gap-4">
          <Button
            size="sm"
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentFrameIndex === 0}
            className="flex-shrink-0"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            이전
          </Button>

          <div className="flex gap-2 flex-1 justify-center">
            {frameOrder.map((frame) => (
              <Button
                key={frame}
                size="sm"
                variant={currentFrame === frame ? "default" : "ghost"}
                onClick={() => handleFrameSelect(frame)}
                className={cn(
                  "min-w-[80px]",
                  currentFrame === frame && "bg-red-900/50 hover:bg-red-900/70 text-white"
                )}
              >
                {FRAME_LABELS[frame]}
              </Button>
            ))}
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleNext}
            disabled={currentFrameIndex === frameOrder.length - 1}
            className="flex-shrink-0"
          >
            다음
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* 프레임 인디케이터 */}
        <div className="flex gap-1 justify-center">
          {frameOrder.map((frame) => (
            <div
              key={frame}
              className={cn(
                "h-1 w-12 rounded-full transition-all",
                currentFrame === frame
                  ? "bg-red-500"
                  : "bg-white/20"
              )}
            />
          ))}
        </div>

        {/* 현재 프레임 콘텐츠 */}
        <div className="min-h-[400px] animate-in fade-in-0 slide-in-from-right-5 duration-300">
          {frames[currentFrame] && (
            <FramePage
              frame={frames[currentFrame]}
              type={currentFrame}
              sceneId={sceneIdValue}
            />
          )}
        </div>

        {/* 전환 효과 */}
        {scene.transition && (
          <div className="mt-6 p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">씬 전환 효과:</span>
              <span>{scene.transition.type}</span>
              <span className="text-muted-foreground">
                ({scene.transition.duration}ms)
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}