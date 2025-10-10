import { useState } from 'react'
import { ChevronDown, Image as ImageIcon, Video } from 'lucide-react'
import { SceneCard } from './SceneCard'
import { EmptyState } from './EmptyState'
import { Button } from '@/components/ui/button'
import JSZip from 'jszip'

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

interface Scene {
  sceneNumber?: number
  sceneId?: string
  id?: string
  title?: string
  description?: string
  duration?: number
  charactersInScene?: string[]
  frames?: {
    start: Frame
    middle: Frame
    end: Frame
  }
  transition?: {
    type?: string
    duration: number
  }
}

interface ProjectData {
  project: {
    title: string
    style: string
    aspectRatio: string
    totalDuration: string
    description?: string
  }
  scenes: Scene[]
}

interface ProjectManagerProps {
  projectData: ProjectData | null
}

export function ProjectManager({ projectData }: ProjectManagerProps) {
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0)
  const [downloading, setDownloading] = useState(false)

  if (!projectData) {
    return <EmptyState />
  }

  const currentScene = projectData.scenes[selectedSceneIndex]

  // localStorage에서 모든 이미지/비디오 URL 수집
  const collectMediaUrls = (type: 'image' | 'video') => {
    const urls: { url: string; name: string }[] = []
    projectData.scenes.forEach((scene) => {
      const sceneId = scene.sceneId || scene.id || `scene_${scene.sceneNumber}`
      const types = ['start', 'middle', 'end']

      types.forEach((frameType) => {
        const key = type === 'image'
          ? `frame_image_${sceneId}_${frameType}`
          : `frame_video_${sceneId}_${frameType}`
        const url = localStorage.getItem(key)

        if (url) {
          const sceneNum = scene.sceneNumber || 0
          const fileName = `scene${sceneNum}_${frameType}.${type === 'image' ? 'jpg' : 'mp4'}`
          urls.push({ url, name: fileName })
        }
      })
    })
    return urls
  }

  // ZIP 다운로드 함수
  const downloadMediaAsZip = async (type: 'image' | 'video') => {
    setDownloading(true)
    try {
      const mediaUrls = collectMediaUrls(type)

      if (mediaUrls.length === 0) {
        alert(`다운로드할 ${type === 'image' ? '이미지' : '비디오'}가 없습니다.`)
        setDownloading(false)
        return
      }

      const zip = new JSZip()
      const folder = zip.folder(type === 'image' ? 'images' : 'videos')

      // 모든 파일을 fetch하여 zip에 추가
      await Promise.all(
        mediaUrls.map(async ({ url, name }) => {
          try {
            const response = await fetch(url)
            const blob = await response.blob()
            folder?.file(name, blob)
          } catch (error) {
            console.error(`Failed to fetch ${name}:`, error)
          }
        })
      )

      // ZIP 생성 및 다운로드
      const content = await zip.generateAsync({ type: 'blob' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(content)
      link.download = `${projectData.project.title}_${type}s.zip`
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (error) {
      console.error('Download failed:', error)
      alert('다운로드에 실패했습니다.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Project Info & Description Combined */}
      <div className="backdrop-blur-xl bg-card/50 border border-white/10 rounded-2xl p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm flex-1">
            <div className="flex gap-2">
              <span className="text-muted-foreground">제목:</span>
              <span className="font-medium">{projectData.project.title}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground">스타일:</span>
              <span className="font-medium">{projectData.project.style}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground">화면 비율:</span>
              <span className="font-medium">{projectData.project.aspectRatio}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground">총 길이:</span>
              <span className="font-medium">{projectData.project.totalDuration}</span>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="flex gap-2 shrink-0">
            <Button
              onClick={() => downloadMediaAsZip('image')}
              disabled={downloading}
              variant="outline"
              size="sm"
              className="rounded-full border-white/20 hover:bg-white/10"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              이미지 다운
            </Button>
            <Button
              onClick={() => downloadMediaAsZip('video')}
              disabled={downloading}
              variant="outline"
              size="sm"
              className="rounded-full border-white/20 hover:bg-white/10"
            >
              <Video className="h-4 w-4 mr-2" />
              비디오 다운
            </Button>
          </div>
        </div>
        {projectData.project.description && (
          <div className="pt-3 border-t border-white/10">
            <p className="text-sm text-muted-foreground">{projectData.project.description}</p>
          </div>
        )}
      </div>

      {/* Scene Selector Dropdown */}
      <div className="backdrop-blur-xl bg-card/50 border border-white/10 rounded-2xl p-4">
        <label className="block text-sm font-medium mb-2">씬 선택</label>
        <div className="relative">
          <select
            value={selectedSceneIndex}
            onChange={(e) => setSelectedSceneIndex(Number(e.target.value))}
            className="w-full bg-secondary border border-white/20 rounded-lg px-4 py-3 pr-10 text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
          >
            {projectData.scenes.map((scene, index) => (
              <option key={scene.sceneId || scene.id || index} value={index}>
                Scene {scene.sceneNumber || index + 1} {scene.title ? `- ${scene.title}` : ''}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Selected Scene */}
      {currentScene && (
        <SceneCard key={currentScene.sceneId || currentScene.id || selectedSceneIndex} scene={currentScene} index={selectedSceneIndex} />
      )}
    </div>
  )
}
