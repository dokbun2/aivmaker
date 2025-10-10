import { useState } from 'react'
import { Menu, Upload, FileText, X, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Scene {
  sceneNumber?: number
  title?: string
  description?: string
}

interface ScenarioData {
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
  const [activeTab, setActiveTab] = useState<'synopsis' | 'script' | 'scenes'>('synopsis')
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
                <h1 className="text-lg font-semibold">AI무비메이커</h1>
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

            {/* Tabs */}
            <div className="flex gap-1 px-6 pt-4 border-b border-white/10">
              <button
                onClick={() => setActiveTab('synopsis')}
                className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                  activeTab === 'synopsis'
                    ? 'bg-white/10 text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                시놉시스
              </button>
              {script && (
                <button
                  onClick={() => setActiveTab('script')}
                  className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                    activeTab === 'script'
                      ? 'bg-white/10 text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  대본
                </button>
              )}
              {scenes && scenes.length > 0 && (
                <button
                  onClick={() => setActiveTab('scenes')}
                  className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                    activeTab === 'scenes'
                      ? 'bg-white/10 text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  씬별 구성
                </button>
              )}
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-10rem)]">
              {activeTab === 'synopsis' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-primary">전체 개요</h3>
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
                              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-xl font-bold text-primary mb-3">트리트먼트</p>
                                <p className="text-foreground/90 whitespace-pre-wrap">{scenario.treatment}</p>
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
              )}

              {activeTab === 'script' && script && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-primary">영상 대본</h3>
                  <div className="text-lg leading-[2] whitespace-pre-wrap font-sans text-foreground">
                    {script}
                  </div>
                </div>
              )}

              {activeTab === 'scenes' && scenes && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-primary">씬별 스토리</h3>
                  {scenes.map((scene, index) => (
                    <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 rounded-md bg-primary/20 text-primary text-xs font-semibold">
                          씬 {scene.sceneNumber || index + 1}
                        </span>
                        {scene.title && (
                          <h4 className="font-semibold">{scene.title}</h4>
                        )}
                      </div>
                      {scene.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {scene.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
