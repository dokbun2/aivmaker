import { useState } from 'react'
import { Menu, Upload, FileText, X, RefreshCw, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Motion {
  ko?: string
  en?: string
}

interface Frame {
  shotType?: string
  duration?: number
  description?: string
  prompt?: string
  motion?: Motion
}

interface Setting {
  location?: string
  timeOfDay?: string
  atmosphere?: string
}

interface Scene {
  scene?: number
  sceneNumber?: number
  sceneId?: string
  title?: string
  description?: string
  setting?: Setting
  frames?: {
    start?: Frame
    middle?: Frame
    end?: Frame
  }
  shots?: {
    start?: Frame
    middle?: Frame
    end?: Frame
  }
}

interface ScenarioData {
  title?: string
  summary?: string
  script?: string
  logline?: string
  synopsis?: string
  treatment?: string
}

interface HeaderProps {
  onMenuClick: () => void
  onUpload: () => void
  onReset: () => void
  scenario?: string | ScenarioData
  script?: string
  scenes?: Scene[]
}

export function Header({ onMenuClick, onUpload, onReset, scenario, script, scenes }: HeaderProps) {
  const [showScenario, setShowScenario] = useState(false)
  const [expandedScenes, setExpandedScenes] = useState<Set<number>>(new Set())

  const toggleScene = (index: number) => {
    setExpandedScenes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/10 backdrop-blur-xl bg-background/80">
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <a href="/" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg" />
              <div>
                <h1 className="text-lg font-semibold">AI툴박스</h1>
              </div>
            </a>
          </div>

          <div className="flex items-center gap-3">
            {scenario && (
              <Button
                variant="outline"
                onClick={() => setShowScenario(true)}
                className="rounded-full border-white/20 hover:bg-white/10"
              >
                <FileText className="h-4 w-4 mr-2" />
                시나리오
              </Button>
            )}
            <Button
              onClick={onUpload}
              className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/30 transition-all hover:shadow-purple-500/50 hover:scale-105"
            >
              <Upload className="h-4 w-4 mr-2" />
              업로드
            </Button>
            <Button
              onClick={onReset}
              variant="outline"
              className="rounded-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              초기화
            </Button>
          </div>
        </div>
      </header>

      {/* Scenario Modal */}
      {showScenario && scenario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowScenario(false)}
          />
          <div className="relative bg-card border border-white/20 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold">시나리오</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowScenario(false)}
                className="hover:bg-red-500/10 hover:text-red-500 transition-colors rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content - 단일 탭으로 통합 */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-8rem)]">
              <div className="space-y-8">
                {/* 시나리오 개요 섹션 */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-primary border-b border-primary/30 pb-3">시나리오 개요</h3>
                  <div className="text-lg leading-[2] font-sans text-foreground space-y-6">
                    {(() => {
                      // scenario가 객체인 경우
                      if (scenario && typeof scenario === 'object') {
                        return (
                          <>
                            {scenario.logline && (
                              <div className="p-6 rounded-xl bg-primary/10 border border-primary/30">
                                <p className="text-xl font-bold text-primary mb-3">로그라인</p>
                                <p className="text-foreground/90">{scenario.logline}</p>
                              </div>
                            )}
                            {scenario.synopsis && (
                              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-xl font-bold text-primary mb-3">시놉시스</p>
                                <p className="text-foreground/90">{scenario.synopsis}</p>
                              </div>
                            )}
                            {scenario.treatment && (
                              <div className="space-y-4">
                                <p className="text-xl font-bold text-primary">트리트먼트</p>
                                {(() => {
                                  // treatment를 막 단위로 분리
                                  const treatmentText = scenario.treatment
                                  const parts = treatmentText.split(/(\d+막\s*\([^)]+\):)/)
                                  const elements: React.ReactElement[] = []
                                  let currentText = ''

                                  for (let i = 0; i < parts.length; i++) {
                                    const part = parts[i]

                                    // "X막 (제목):" 패턴인 경우
                                    if (/^\d+막\s*\([^)]+\):$/.test(part)) {
                                      // 이전 텍스트가 있으면 먼저 렌더링
                                      if (currentText.trim()) {
                                        elements.push(
                                          <p key={`text-${i}`} className="text-foreground/90">
                                            {currentText.trim()}
                                          </p>
                                        )
                                        currentText = ''
                                      }

                                      // 다음 부분이 막 내용
                                      const actContent = parts[i + 1]?.trim() || ''
                                      elements.push(
                                        <div key={`act-${i}`} className="p-6 rounded-xl bg-white/5 border border-white/10">
                                          <p className="text-lg font-bold text-primary mb-3">{part}</p>
                                          <p className="text-foreground/90">{actContent}</p>
                                        </div>
                                      )
                                      i++ // 다음 부분은 이미 처리했으므로 스킵
                                    } else {
                                      currentText += part
                                    }
                                  }

                                  // 남은 텍스트 처리
                                  if (currentText.trim()) {
                                    elements.push(
                                      <p key="final" className="text-foreground/90">
                                        {currentText.trim()}
                                      </p>
                                    )
                                  }

                                  return elements.length > 0 ? elements : (
                                    <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                                      <p className="text-foreground/90 whitespace-pre-wrap">{treatmentText}</p>
                                    </div>
                                  )
                                })()}
                              </div>
                            )}
                          </>
                        )
                      }

                      // scenario가 문자열인 경우 (기존 로직)
                      const scenarioText = typeof scenario === 'string' ? scenario : ''
                      const parts = scenarioText.split(/(\d+막:)/)
                      const elements: React.ReactElement[] = []
                      let currentText = ''

                      for (let i = 0; i < parts.length; i++) {
                        const part = parts[i]

                        // "X막:" 패턴인 경우
                        if (/^\d+막:$/.test(part)) {
                          // 이전 텍스트가 있으면 먼저 렌더링
                          if (currentText.trim()) {
                            elements.push(
                              <p key={`text-${i}`} className="text-foreground/90">
                                {currentText.trim()}
                              </p>
                            )
                            currentText = ''
                          }

                          // 다음 부분이 막 내용
                          const actContent = parts[i + 1]?.trim() || ''
                          elements.push(
                            <div key={`act-${i}`} className="p-6 rounded-xl bg-white/5 border border-white/10">
                              <p className="text-xl font-bold text-primary mb-3">{part}</p>
                              <p className="text-foreground/90">{actContent}</p>
                            </div>
                          )
                          i++ // 다음 부분은 이미 처리했으므로 스킵
                        } else {
                          currentText += part
                        }
                      }

                      // 남은 텍스트 처리
                      if (currentText.trim()) {
                        currentText.split('\n\n').forEach((para, idx) => {
                          if (para.trim()) {
                            elements.push(
                              <p key={`final-${idx}`} className="text-foreground/90">
                                {para.trim()}
                              </p>
                            )
                          }
                        })
                      }

                      return elements
                    })()}
                  </div>
                </div>

                {/* 대본 섹션 */}
                {script && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-primary border-b border-primary/30 pb-3">영상 대본</h3>
                    <div className="text-lg leading-[2] whitespace-pre-wrap font-sans text-foreground p-6 rounded-xl bg-white/5 border border-white/10">
                      {script}
                    </div>
                  </div>
                )}

                {/* 씬별 구성 섹션 */}
                {scenes && scenes.length > 0 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-primary border-b border-primary/30 pb-3">씬별 구성</h3>
                    <div className="space-y-4">
                      {scenes.map((scene, index) => {
                        const sceneNum = scene.scene || scene.sceneNumber || index + 1
                        const frames = scene.frames || scene.shots
                        const isExpanded = expandedScenes.has(index)

                        return (
                          <div key={index} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                            {/* 씬 헤더 - 클릭 가능 */}
                            <button
                              onClick={() => toggleScene(index)}
                              className="w-full p-6 text-left hover:bg-white/5 transition-colors"
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                  <span className="px-4 py-2 rounded-full bg-primary/20 text-primary text-lg font-bold flex-shrink-0">
                                    Scene {sceneNum}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    {scene.title && (
                                      <h4 className="font-bold text-xl text-foreground mb-2">{scene.title}</h4>
                                    )}
                                    {scene.description && (
                                      <p className="text-lg text-foreground/70 leading-relaxed line-clamp-2">
                                        {scene.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <ChevronDown
                                  className={`w-6 h-6 text-primary flex-shrink-0 transition-transform duration-200 ${
                                    isExpanded ? 'rotate-180' : ''
                                  }`}
                                />
                              </div>
                            </button>

                            {/* 씬 내용 흐름 - 펼쳐질 때만 표시 */}
                            {isExpanded && frames && (
                              <div className="px-6 pb-6 pt-2 border-t border-white/10">
                                <div className="space-y-5 pl-4 border-l-2 border-primary/20">
                                  {['start', 'middle', 'end'].map((frameType, idx) => {
                                    const frame = frames[frameType as keyof typeof frames]
                                    if (!frame || !frame.description) return null

                                    return (
                                      <div key={frameType} className="flex gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                                          <span className="text-base font-bold text-primary">{idx + 1}</span>
                                        </div>
                                        <div className="flex-1 pt-1">
                                          <p className="text-lg text-foreground/80 leading-relaxed">
                                            {frame.description}
                                          </p>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
