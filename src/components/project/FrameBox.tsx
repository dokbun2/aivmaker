import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, Check, Play, Circle, Square, Image as ImageIcon } from 'lucide-react'
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
}

interface Frame {
  shotType?: string
  duration?: number
  description?: string
  promptStructure?: PromptStructure
  prompt?: string
  parameters?: string
  imageUrl?: string
}

interface FrameBoxProps {
  frame: Frame
  type: 'start' | 'middle' | 'end'
  sceneId: string
}

export function FrameBox({ frame, type, sceneId }: FrameBoxProps) {
  const cacheKey = `frame_image_${sceneId}_${type}`
  const promptCacheKey = `frame_prompt_${sceneId}_${type}`

  // 캐시에서 이미지 URL 불러오기
  const getCachedUrl = () => {
    const cached = localStorage.getItem(cacheKey)
    return cached || frame.imageUrl || ''
  }

  // 캐시에서 프롬프트 불러오기
  const getCachedPrompt = () => {
    const cached = localStorage.getItem(promptCacheKey)
    return cached || frame.prompt || ''
  }

  const [copied, setCopied] = useState(false)
  const [imageUrl, setImageUrl] = useState(getCachedUrl())
  const [showImage, setShowImage] = useState(!!getCachedUrl())
  const [prompt, setPrompt] = useState(getCachedPrompt())
  const [isEditingPrompt, setIsEditingPrompt] = useState(false)
  const [showPromptStructure, setShowPromptStructure] = useState(false)

  // 비디오 URL 상태
  const videoCacheKey = `frame_video_${sceneId}_${type}`
  const getCachedVideoUrl = () => localStorage.getItem(videoCacheKey) || ''
  const [videoUrl, setVideoUrl] = useState(getCachedVideoUrl())
  const [showVideo, setShowVideo] = useState(!!getCachedVideoUrl())

  // 이미지 URL 변경 시 localStorage에 저장
  useEffect(() => {
    if (imageUrl.trim()) {
      localStorage.setItem(cacheKey, imageUrl)
    }
  }, [imageUrl, cacheKey])

  // 프롬프트 변경 시 localStorage에 저장
  useEffect(() => {
    if (prompt.trim()) {
      localStorage.setItem(promptCacheKey, prompt)
    }
  }, [prompt, promptCacheKey])

  // 비디오 URL 변경 시 localStorage에 저장
  useEffect(() => {
    if (videoUrl.trim()) {
      localStorage.setItem(videoCacheKey, videoUrl)
    }
  }, [videoUrl, videoCacheKey])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setShowImage(true)
      localStorage.setItem(cacheKey, imageUrl)
    }
  }

  const handleAddVideo = () => {
    if (videoUrl.trim()) {
      setShowVideo(true)
      localStorage.setItem(videoCacheKey, videoUrl)
    }
  }

  const Icon = type === 'start' ? Play : type === 'middle' ? Circle : Square
  const typeColor = type === 'start' ? 'text-green-500' : type === 'middle' ? 'text-blue-500' : 'text-red-500'
  const typeLabel = type === 'start' ? 'START' : type === 'middle' ? 'MIDDLE' : 'END'

  const shotTypeLabel = frame.shotType
    ? frame.shotType.charAt(0).toUpperCase() + frame.shotType.slice(1).replace('-', ' ')
    : 'Unknown'

  return (
    <div className="space-y-4 p-6 rounded-xl border border-white/10 backdrop-blur-xl bg-background/30">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-5 w-5', typeColor)} />
          <h3 className={cn('font-semibold text-lg', typeColor)}>{typeLabel}</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
            {shotTypeLabel}
          </span>
          {frame.duration && (
            <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
              {frame.duration}초
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {frame.description && (
        <p className="text-sm text-muted-foreground">{frame.description}</p>
      )}

      {/* Prompt Structure Toggle */}
      {frame.promptStructure && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPromptStructure(!showPromptStructure)}
          className="w-full justify-start text-xs text-muted-foreground hover:text-foreground"
        >
          {showPromptStructure ? '▼' : '▶'} Prompt Structure
        </Button>
      )}

      {/* Prompt Structure Details */}
      {showPromptStructure && frame.promptStructure && (
        <div className="p-3 rounded-lg bg-background/50 border border-white/10 space-y-1 text-xs">
          {Object.entries(frame.promptStructure).map(([key, value]) => (
            value && (
              <div key={key} className="flex gap-2">
                <span className="text-muted-foreground min-w-[100px]">{key}:</span>
                <span className="text-foreground">{value}</span>
              </div>
            )
          ))}
        </div>
      )}

      {/* Prompt */}
      <div className="relative">
        <div className="p-4 rounded-lg bg-background/50 border border-white/10 backdrop-blur-xl">
          {isEditingPrompt ? (
            <div className="space-y-2">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-background border border-white/20 rounded-lg px-3 py-2 text-sm font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setPrompt(getCachedPrompt())
                    setIsEditingPrompt(false)
                  }}
                >
                  취소
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsEditingPrompt(false)}
                >
                  저장
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <p
                className="text-sm font-mono leading-relaxed flex-1 break-words cursor-pointer hover:text-primary/80 transition-colors"
                onClick={() => setIsEditingPrompt(true)}
              >
                {prompt}
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-3">
        <Input
          placeholder="이미지 URL 입력 (Enter로 추가)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAddImage()
            }
          }}
          className="bg-background/50 border-white/10"
        />

        {/* Image Preview */}
        {showImage && imageUrl && (
          <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black">
            <img
              src={imageUrl}
              alt={`${typeLabel} 미리보기`}
              className="w-full h-auto object-contain"
              onError={() => setShowImage(false)}
            />
          </div>
        )}
      </div>

      {/* Video Upload */}
      <div className="space-y-3">
        <Input
          placeholder="비디오 URL 입력 (Enter로 추가)"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAddVideo()
            }
          }}
          className="bg-background/50 border-white/10"
        />

        {/* Video Preview */}
        {showVideo && videoUrl && (
          <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black">
            <video
              src={videoUrl}
              controls
              className="w-full h-auto"
              onError={() => setShowVideo(false)}
            >
              브라우저가 비디오를 지원하지 않습니다.
            </video>
          </div>
        )}
      </div>
    </div>
  )
}
