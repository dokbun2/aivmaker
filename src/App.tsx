import { useState, useEffect, useRef } from 'react'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { ProjectManager } from './components/project/ProjectManager'
import { VisualConcept } from './components/project/VisualConcept'

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

interface Character {
  id: string
  name: string
  role: string
  description: string
  visualDescription: string
  consistency: {
    age: string
    gender: string
    build?: string
    hair: string
    eyes: string
    outfit: string
    equipment?: string
    features: string
  }
  consistency_tr?: {
    age: string
    gender: string
    build?: string
    hair: string
    eyes: string
    outfit: string
    equipment?: string
    features: string
  }
}

interface ProjectData {
  project: {
    title: string
    style: string
    aspectRatio: string
    totalDuration: string
    description?: string
    createdAt?: string
  }
  scenario?: string
  script?: string
  characters?: Character[]
  scenes: Scene[]
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [projectData, setProjectData] = useState<ProjectData | null>(null)
  const [showNanoStudio, setShowNanoStudio] = useState(false)
  const [showStart, setShowStart] = useState(true)
  const [showVisualConcept, setShowVisualConcept] = useState(false)
  const [showFrameExtractor, setShowFrameExtractor] = useState(false)
  const [nanoStudioError, setNanoStudioError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 로컬 스토리지에서 프로젝트 로드
  useEffect(() => {
    const saved = localStorage.getItem('currentProject')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setProjectData(data)
      } catch (error) {
        console.error('저장된 데이터 로드 실패:', error)
        localStorage.removeItem('currentProject')
      }
    }
  }, [])

  // 프로젝트 데이터 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    if (projectData) {
      localStorage.setItem('currentProject', JSON.stringify(projectData))
    }
  }, [projectData])

  const handleUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string)
          console.log('JSON 파일 로드 성공:', json)
          console.log('캐릭터 데이터:', json.characters)
          setProjectData(json)
          // 프로젝트 페이지로 이동
          setShowStart(false)
          setShowNanoStudio(false)
          setShowVisualConcept(false)
          setShowFrameExtractor(false)
        } catch (error) {
          alert('JSON 파일 파싱 오류: ' + (error as Error).message)
        }
      }
      reader.onerror = () => {
        alert('파일을 읽을 수 없습니다.')
      }
      reader.readAsText(file)
    }
  }

  const handleDownload = () => {
    if (!projectData) return

    const dataStr = JSON.stringify(projectData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const projectTitle = projectData.project?.title || 'project'
    const exportFileDefaultName = `${projectTitle}_${timestamp}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const handleClear = () => {
    if (confirm('정말로 프로젝트를 초기화하시겠습니까?')) {
      setProjectData(null)

      // 모든 localStorage 항목 중 프레임 관련 캐시 삭제
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.startsWith('frame_image_') || key.startsWith('frame_prompt_'))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))

      // 프로젝트 데이터 삭제
      localStorage.removeItem('currentProject')

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleFullReset = () => {
    if (confirm('프로젝트와 비주얼 컨셉을 포함한 모든 데이터를 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      // 프로젝트 데이터 초기화
      setProjectData(null)

      // 모든 localStorage 데이터 삭제
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (
          key.startsWith('frame_image_') ||
          key.startsWith('frame_prompt_') ||
          key.startsWith('character_image_') ||
          key === 'currentProject'
        )) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))

      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // START 화면으로 이동
      setShowStart(true)
      setShowNanoStudio(false)
      setShowVisualConcept(false)
      setShowFrameExtractor(false)
    }
  }

  const handleVisualConceptClear = () => {
    if (confirm('정말로 비주얼 컨셉을 초기화하시겠습니까?')) {
      // 캐릭터 이미지 캐시 삭제
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('character_image_')) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))

      // 프로젝트 데이터에서 캐릭터 제거
      if (projectData) {
        const updated = { ...projectData, characters: [] }
        setProjectData(updated)
      }
    }
  }

  const handleUpdateCharacters = (characters: Character[]) => {
    if (projectData) {
      const updated = { ...projectData, characters }
      setProjectData(updated)
    }
  }

  const projectInfo = projectData && projectData.project
    ? {
        title: projectData.project.title || '제목 없음',
        style: projectData.project.style || 'cinematic',
        aspectRatio: String(projectData.project.aspectRatio) || '16:9',
        totalDuration: String(projectData.project.totalDuration) || '미정',
        scenesCount: projectData.scenes?.length || 0,
      }
    : undefined

  return (
    <div className="min-h-screen bg-black">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onUpload={handleUpload}
        onReset={handleFullReset}
        scenario={projectData?.scenario}
        script={projectData?.script}
        scenes={projectData?.scenes}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        projectInfo={projectInfo}
        onDownload={handleDownload}
        onClear={handleClear}
        onVisualConceptClear={handleVisualConceptClear}
        onNanoStudioToggle={() => setShowNanoStudio(!showNanoStudio)}
        showNanoStudio={showNanoStudio}
        onStartToggle={() => setShowStart(!showStart)}
        showStart={showStart}
        onVisualConceptToggle={() => setShowVisualConcept(!showVisualConcept)}
        showVisualConcept={showVisualConcept}
        onFrameExtractorToggle={() => setShowFrameExtractor(!showFrameExtractor)}
        showFrameExtractor={showFrameExtractor}
      />

      {/* Main Content */}
      <main className="pt-16 lg:pl-72 min-h-screen">
        {showStart ? (
          <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center bg-black relative">
            <img
              src="https://cdn.midjourney.com/d221c817-6fa3-47dd-9864-6d06c64cc12e/0_1.png"
              alt="Main"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <a
                href="https://gemini.google.com/gem/1zximT5wRr3zL-y3D_4HKAL909Bzwy8I0?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-red-900/80 hover:bg-red-900 text-white font-bold text-xl rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-105 border border-white/20"
              >
                START
              </a>
            </div>
          </div>
        ) : showVisualConcept ? (
          <div className="p-2 lg:p-4">
            <VisualConcept
              characters={projectData?.characters || []}
              onUpdate={handleUpdateCharacters}
            />
          </div>
        ) : showNanoStudio ? (
          <div className="w-full h-[calc(100vh-4rem)] overflow-hidden">
            <iframe
              src="https://nano-studio-252213558759.us-west1.run.app"
              className="w-full h-full"
              title="Nano Studio"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              onError={() => {
                setNanoStudioError(true)
              }}
            />
          </div>
        ) : showFrameExtractor ? (
          <div className="fixed inset-0 top-16 lg:left-72">
            <iframe
              src="https://frameex.netlify.app/"
              className="w-full h-full border-0"
              title="Frame Extractor"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        ) : (
          <div className="p-2 lg:p-4">
            <ProjectManager projectData={projectData} />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
