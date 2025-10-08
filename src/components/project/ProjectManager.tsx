import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { SceneCard } from './SceneCard'
import { EmptyState } from './EmptyState'

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

  if (!projectData) {
    return <EmptyState />
  }

  const currentScene = projectData.scenes[selectedSceneIndex]

  return (
    <div className="space-y-4">
      {/* Project Info & Description Combined */}
      <div className="backdrop-blur-xl bg-card/50 border border-white/10 rounded-2xl p-4">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mb-4">
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
