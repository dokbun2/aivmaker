import { useState } from 'react'
import { Film, X, Sparkles, Home, Palette, Image, ChevronDown, ChevronUp, Wand2, FileJson } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onNanoStudioToggle: () => void
  showNanoStudio: boolean
  onStartToggle: () => void
  showStart: boolean
  onVisualConceptToggle: () => void
  showVisualConcept: boolean
  onFrameExtractorToggle: () => void
  showFrameExtractor: boolean
  onMultiDownloaderToggle: () => void
  showMultiDownloader: boolean
  onPromptGeneratorToggle: () => void
  showPromptGenerator: boolean
}

type TabType = 'start' | 'project' | 'visual' | 'nano' | 'frameExtractor' | 'multiDownloader' | 'promptGenerator'

export function Sidebar({ isOpen, onClose, onNanoStudioToggle, showNanoStudio, onStartToggle, showStart, onVisualConceptToggle, showVisualConcept, onFrameExtractorToggle, showFrameExtractor, onMultiDownloaderToggle, showMultiDownloader, onPromptGeneratorToggle, showPromptGenerator }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('start')
  const [freeToolsOpen, setFreeToolsOpen] = useState(false)
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-16 left-0 bottom-0 w-56 border-r border-white/10 backdrop-blur-xl bg-background/80 z-40 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Close button for mobile */}
          <div className="lg:hidden p-4 border-b border-white/10">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="p-4 border-b border-white/10">
            <div className="space-y-2">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start rounded-full transition-all",
                  showStart
                    ? "bg-red-900/50 text-white hover:bg-red-900/70"
                    : "hover:bg-white/10 text-foreground"
                )}
                onClick={() => {
                  setActiveTab('start')
                  if (!showStart) onStartToggle()
                  if (showNanoStudio) onNanoStudioToggle()
                  if (showVisualConcept) onVisualConceptToggle()
                  if (showFrameExtractor) onFrameExtractorToggle()
                  onClose()
                }}
              >
                <Home className="h-4 w-4 mr-2" />
                START
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start rounded-full transition-all",
                  activeTab === 'project' && !showStart && !showNanoStudio && !showVisualConcept && !showFrameExtractor
                    ? "bg-red-900/50 text-white hover:bg-red-900/70"
                    : "hover:bg-white/10 text-foreground"
                )}
                onClick={() => {
                  setActiveTab('project')
                  if (showStart) onStartToggle()
                  if (showNanoStudio) onNanoStudioToggle()
                  if (showVisualConcept) onVisualConceptToggle()
                  if (showFrameExtractor) onFrameExtractorToggle()
                  onClose()
                }}
              >
                <Film className="h-4 w-4 mr-2" />
                스토리텔링
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start rounded-full transition-all",
                  showVisualConcept
                    ? "bg-red-900/50 text-white hover:bg-red-900/70"
                    : "hover:bg-white/10 text-foreground"
                )}
                onClick={() => {
                  setActiveTab('visual')
                  if (showStart) onStartToggle()
                  if (showNanoStudio) onNanoStudioToggle()
                  if (showFrameExtractor) onFrameExtractorToggle()
                  if (!showVisualConcept) onVisualConceptToggle()
                  onClose()
                }}
              >
                <Palette className="h-4 w-4 mr-2" />
                비주얼컨셉
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start rounded-full transition-all",
                  showNanoStudio
                    ? "bg-red-900/50 text-white hover:bg-red-900/70"
                    : "hover:bg-white/10 text-foreground"
                )}
                onClick={() => {
                  setActiveTab('nano')
                  if (showStart) onStartToggle()
                  if (showVisualConcept) onVisualConceptToggle()
                  if (showFrameExtractor) onFrameExtractorToggle()
                  if (!showNanoStudio) onNanoStudioToggle()
                  onClose()
                }}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                툴비스튜디오
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start rounded-full transition-all",
                  showFrameExtractor
                    ? "bg-red-900/50 text-white hover:bg-red-900/70"
                    : "hover:bg-white/10 text-foreground"
                )}
                onClick={() => {
                  setActiveTab('frameExtractor')
                  if (showStart) onStartToggle()
                  if (showVisualConcept) onVisualConceptToggle()
                  if (showNanoStudio) onNanoStudioToggle()
                  if (!showFrameExtractor) onFrameExtractorToggle()
                  onClose()
                }}
              >
                <Image className="h-4 w-4 mr-2" />
                툴비추출기
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start rounded-full hover:bg-white/10 text-foreground"
                onClick={() => {
                  window.open('https://json.aitoolb.com/', '_blank')
                  onClose()
                }}
              >
                <FileJson className="h-4 w-4 mr-2" />
                Json에디터
              </Button>

              {/* 무료툴 드롭다운 */}
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-between rounded-full hover:bg-white/10 text-foreground"
                  onClick={() => setFreeToolsOpen(!freeToolsOpen)}
                >
                  <span className="flex items-center">
                    <Wand2 className="h-4 w-4 mr-2" />
                    무료툴
                  </span>
                  {freeToolsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>

                {freeToolsOpen && (
                  <div className="pl-6 space-y-1">
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start rounded-full text-sm transition-all",
                        showMultiDownloader
                          ? "bg-red-900/50 text-white hover:bg-red-900/70"
                          : "hover:bg-white/10 text-foreground"
                      )}
                      onClick={() => {
                        setActiveTab('multiDownloader')
                        if (showStart) onStartToggle()
                        if (showVisualConcept) onVisualConceptToggle()
                        if (showNanoStudio) onNanoStudioToggle()
                        if (showFrameExtractor) onFrameExtractorToggle()
                        if (showPromptGenerator) onPromptGeneratorToggle()
                        if (!showMultiDownloader) onMultiDownloaderToggle()
                        onClose()
                      }}
                    >
                      미드저니 다운
                    </Button>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start rounded-full text-sm transition-all",
                        showPromptGenerator
                          ? "bg-red-900/50 text-white hover:bg-red-900/70"
                          : "hover:bg-white/10 text-foreground"
                      )}
                      onClick={() => {
                        setActiveTab('promptGenerator')
                        if (showStart) onStartToggle()
                        if (showVisualConcept) onVisualConceptToggle()
                        if (showNanoStudio) onNanoStudioToggle()
                        if (showFrameExtractor) onFrameExtractorToggle()
                        if (showMultiDownloader) onMultiDownloaderToggle()
                        if (!showPromptGenerator) onPromptGeneratorToggle()
                        onClose()
                      }}
                    >
                      프롬프트생성기
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tab Content - 현재는 비어있음 */}
          <div className="flex-1 p-4 overflow-y-auto">
            {/* 필요시 여기에 탭별 추가 콘텐츠를 넣을 수 있습니다 */}
          </div>
        </div>
      </aside>
    </>
  )
}
