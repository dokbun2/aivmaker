import { useState, useEffect, useRef } from 'react'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { ProjectManager } from './components/project/ProjectManager'
import { VisualConceptTabs } from './components/project/VisualConceptTabs'
import { MultiDownloader } from './components/project/MultiDownloader'

interface PromptStructure {
  subject?: string
  composition?: string
  style?: string
  details?: string
  parameters?: string
  // Legacy fields kept for backward compatibility
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

interface Character {
  id: string
  name: string
  role?: string
  description: string
  visualDescription: string
  consistency?: string | {
    age: string
    gender: string
    build?: string
    hair: string
    eyes: string
    outfit: string
    equipment?: string
    features: string
  }
  consistency_tr?: string | {
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

interface Scenario {
  title?: string
  summary?: string
  script?: string
}

interface KeyProp {
  id: string
  name: string
  description: string
  visualDescription: string
  consistency?: string
  consistency_tr?: string
}

interface ProjectData {
  project: {
    title: string
    style: string
    aspectRatio: string
    totalDuration: string | number
    description?: string
    createdAt?: string
  }
  scenario?: string | Scenario
  script?: string
  characters?: Character[]
  keyProps?: KeyProp[]
  scenes: Scene[]
}

// shots → frames 변환 헬퍼 함수
function convertShotsToFrames(data: ProjectData): ProjectData {
  if (!data || !data.scenes) return data

  const convertedScenes = data.scenes.map(scene => {
    // shots가 있고 frames가 없으면 변환
    if (scene.shots && !scene.frames) {
      return {
        ...scene,
        sceneNumber: scene.scene || scene.sceneNumber,
        frames: scene.shots,
        shots: undefined
      }
    }
    // sceneNumber 동기화
    if (scene.scene && !scene.sceneNumber) {
      return { ...scene, sceneNumber: scene.scene }
    }
    return scene
  })

  return {
    ...data,
    scenes: convertedScenes
  }
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [projectData, setProjectData] = useState<ProjectData | null>(null)
  const [showNanoStudio, setShowNanoStudio] = useState(false)
  const [showStart, setShowStart] = useState(true)
  const [showVisualConcept, setShowVisualConcept] = useState(false)
  const [showFrameExtractor, setShowFrameExtractor] = useState(false)
  const [showMultiDownloader, setShowMultiDownloader] = useState(false)
  const [, setNanoStudioError] = useState(false)
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

          // 단일 씬 파일인 경우 (scene 또는 sceneNumber가 있고 project가 없는 경우)
          if ((json.scene !== undefined || json.sceneNumber !== undefined) && !json.project) {
            console.log('단일 씬 파일 감지 - 프로젝트 구조로 변환')

            const singleSceneData: ProjectData = {
              project: {
                title: '테스트 프로젝트',
                style: 'cinematic',
                aspectRatio: '16:9',
                totalDuration: json.duration || 12,
                description: json.description || ''
              },
              scenes: [json]
            }

            // shots → frames 변환
            const convertedData = convertShotsToFrames(singleSceneData)
            setProjectData(convertedData)
          }
          // 새 형식 (백업 데이터 포함) 확인
          else if (json.projectData && json.cachedData) {
            console.log('백업 데이터 감지 - 전체 복원 중...')

            // shots → frames 변환
            const convertedData = convertShotsToFrames(json.projectData)
            setProjectData(convertedData)

            // cachedData를 localStorage에 복원
            Object.entries(json.cachedData).forEach(([key, value]) => {
              localStorage.setItem(key, value as string)
            })

            console.log('캐시 데이터 복원 완료:', Object.keys(json.cachedData).length, '개 항목')
          } else {
            // 구 형식 (프로젝트 데이터만)
            console.log('기본 프로젝트 데이터 로드')
            console.log('캐릭터 데이터:', json.characters)

            // shots → frames 변환
            const convertedData = convertShotsToFrames(json)
            setProjectData(convertedData)
          }

          // 프로젝트 페이지로 이동
          setShowStart(false)
          setShowNanoStudio(false)
          setShowVisualConcept(false)
          setShowFrameExtractor(false)
          setShowMultiDownloader(false)
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

    // localStorage에서 모든 관련 데이터 수집
    const cachedData: Record<string, string> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (
        key.startsWith('frame_image_') ||
        key.startsWith('frame_video_') ||
        key.startsWith('frame_prompt_') ||
        key.startsWith('character_image_')
      )) {
        const value = localStorage.getItem(key)
        if (value) {
          cachedData[key] = value
        }
      }
    }

    // 프로젝트 데이터와 캐시 데이터를 함께 저장
    const exportData = {
      projectData,
      cachedData,
      exportedAt: new Date().toISOString()
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const projectTitle = projectData.project?.title || 'project'
    const exportFileDefaultName = `${projectTitle}_${timestamp}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  // const handleClear = () => {
  //   if (confirm('정말로 프로젝트를 초기화하시겠습니까?')) {
  //     setProjectData(null)

  //     // 모든 localStorage 항목 중 프레임 관련 캐시 삭제
  //     const keysToRemove: string[] = []
  //     for (let i = 0; i < localStorage.length; i++) {
  //       const key = localStorage.key(i)
  //       if (key && (
  //         key.startsWith('frame_image_') ||
  //         key.startsWith('frame_video_') ||
  //         key.startsWith('frame_prompt_')
  //       )) {
  //         keysToRemove.push(key)
  //       }
  //     }
  //     keysToRemove.forEach(key => localStorage.removeItem(key))

  //     // 프로젝트 데이터 삭제
  //     localStorage.removeItem('currentProject')

  //     if (fileInputRef.current) {
  //       fileInputRef.current.value = ''
  //     }
  //   }
  // }

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
          key.startsWith('frame_video_') ||
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
      setShowMultiDownloader(false)
    }
  }

  // const handleVisualConceptClear = () => {
  //   if (confirm('정말로 비주얼 컨셉을 초기화하시겠습니까?')) {
  //     // 캐릭터 이미지 캐시 삭제
  //     const keysToRemove: string[] = []
  //     for (let i = 0; i < localStorage.length; i++) {
  //       const key = localStorage.key(i)
  //       if (key && key.startsWith('character_image_')) {
  //         keysToRemove.push(key)
  //       }
  //     }
  //     keysToRemove.forEach(key => localStorage.removeItem(key))

  //     // 프로젝트 데이터에서 캐릭터 제거
  //     if (projectData) {
  //       const updated = { ...projectData, characters: [] }
  //       setProjectData(updated)
  //     }
  //   }
  // }

  const handleUpdateCharacters = (characters: Character[]) => {
    if (projectData) {
      const updated = { ...projectData, characters }
      setProjectData(updated)
    }
  }

  const handleUpdateKeyProps = (keyProps: KeyProp[]) => {
    if (projectData) {
      const updated = { ...projectData, keyProps }
      setProjectData(updated)
    }
  }

  // const projectInfo = projectData && projectData.project
  //   ? {
  //       title: projectData.project.title || '제목 없음',
  //       style: projectData.project.style || 'cinematic',
  //       aspectRatio: String(projectData.project.aspectRatio) || '16:9',
  //       totalDuration: String(projectData.project.totalDuration) || '미정',
  //       scenesCount: projectData.scenes?.length || 0,
  //     }
  //   : undefined

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
        onBackup={handleDownload}
        scenario={projectData?.scenario}
        script={projectData?.script}
        scenes={projectData?.scenes}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNanoStudioToggle={() => setShowNanoStudio(!showNanoStudio)}
        showNanoStudio={showNanoStudio}
        onStartToggle={() => setShowStart(!showStart)}
        showStart={showStart}
        onVisualConceptToggle={() => setShowVisualConcept(!showVisualConcept)}
        showVisualConcept={showVisualConcept}
        onFrameExtractorToggle={() => setShowFrameExtractor(!showFrameExtractor)}
        showFrameExtractor={showFrameExtractor}
        onMultiDownloaderToggle={() => setShowMultiDownloader(!showMultiDownloader)}
        showMultiDownloader={showMultiDownloader}
      />

      {/* Main Content */}
      <main className="pt-16 lg:pl-56 min-h-screen">
        {showStart ? (
          <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center bg-black relative">
            <img
              src="https://cdn.midjourney.com/f9fe5d85-8abf-42ad-9d22-77806380f095/0_0.png"
              alt="Main"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <a
                href="https://gemini.google.com/gem/1zximT5wRr3zL-y3D_4HKAL909Bzwy8I0?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-red-900/80 hover:bg-red-900 text-white font-bold text-xl rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-105 border border-white/20 mt-24"
              >
                START
              </a>
            </div>
          </div>
        ) : showVisualConcept ? (
          <div className="p-2 lg:p-4">
            <VisualConceptTabs
              characters={projectData?.characters || []}
              keyProps={projectData?.keyProps || []}
              scenes={projectData?.scenes || []}
              onUpdateCharacters={handleUpdateCharacters}
              onUpdateKeyProps={handleUpdateKeyProps}
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
          <div className="fixed inset-0 top-16 lg:left-56">
            <iframe
              src="https://framex-beta.vercel.app/"
              className="w-full h-full border-0"
              title="Frame Extractor"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        ) : showMultiDownloader ? (
          <div className="w-full h-[calc(100vh-4rem)]">
            <MultiDownloader />
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
