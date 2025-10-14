import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FrameBox } from './FrameBox'
import { ArrowRight } from 'lucide-react'

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

export function SceneCard({ scene, index }: SceneCardProps) {
  const sceneNumber = scene.sceneNumber || index + 1
  const sceneIdValue = scene.sceneId || scene.id || `scene_${index}`

  // duration 표시 로직
  const durationDisplay = scene.duration ? `${scene.duration}초` : null

  return (
    <Card className="backdrop-blur-xl bg-card/50 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            {scene.title || `씬 ${sceneNumber}`}
          </CardTitle>
          <Badge variant="secondary" className="backdrop-blur-xl">
            씬 {sceneNumber}
          </Badge>
        </div>
        {scene.description && (
          <CardDescription className="mt-2">{scene.description}</CardDescription>
        )}
        {durationDisplay && (
          <div className="mt-2 text-sm text-muted-foreground">
            길이: {durationDisplay}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {scene.frames ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <FrameBox
              frame={scene.frames.start}
              type="start"
              sceneId={sceneIdValue}
            />
            <FrameBox
              frame={scene.frames.middle}
              type="middle"
              sceneId={sceneIdValue}
            />
            <FrameBox
              frame={scene.frames.end}
              type="end"
              sceneId={sceneIdValue}
            />
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">씬 데이터가 없습니다.</p>
        )}

        {scene.transition && (
          <div className="mt-6 p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm">
              <ArrowRight className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">전환 효과:</span>
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
