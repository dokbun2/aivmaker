import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, User, Copy, Check, MapPin, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { generateBlockPrompt } from '@/lib/promptBuilder'
import type { Library, PromptBlock } from '@/types/schema'

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

interface KeyProp {
  id: string
  name: string
  description: string
  visualDescription: string
  consistency?: string
  consistency_tr?: string
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
  id?: string
  title?: string
  description?: string
  duration?: number
  setting?: Setting
  [key: string]: any
}

interface VisualConceptTabsProps {
  characters: Character[]
  keyProps?: KeyProp[]
  scenes?: Scene[]
  library?: any  // V8 library 지원
  onUpdateCharacters?: (characters: Character[]) => void
  onUpdateKeyProps?: (keyProps: KeyProp[]) => void
}

type TabType = 'characters' | 'locations' | 'keyProps'

interface LocationData {
  id: string
  scene: number
  title: string
  location: string
  timeOfDay: string
  atmosphere: string
}

export function VisualConceptTabs({
  characters = [],
  keyProps = [],
  scenes = [],
  library,
  onUpdateCharacters,
  onUpdateKeyProps
}: VisualConceptTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('characters')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [characterImages, setCharacterImages] = useState<Record<string, string>>({})
  const [keyPropImages, setKeyPropImages] = useState<Record<string, string>>({})
  const [locationImages, setLocationImages] = useState<Record<string, string>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [locationOverrides, setLocationOverrides] = useState<Record<string, LocationData>>({})
  const [fullPromptOverrides, setFullPromptOverrides] = useState<Record<string, string>>({})

  // V8 데이터를 레거시 포맷으로 변환하는 헬퍼 함수
  const convertV8ToCharacter = (id: string, data: any): Character & { blocks?: any } => {
    const blocks = data.blocks || {}
    return {
      id,
      name: data.name || id,
      role: blocks.genre || '',
      description: blocks.char_desc || '',
      visualDescription: Object.entries(blocks)
        .filter(([key]) => key.startsWith('char_') || key === 'style_main')
        .map(([key, value]) => `${key}: ${value}`)
        .join(', '),
      blocks // V8 blocks 데이터 보존
    }
  }

  const convertV8ToKeyProp = (id: string, data: any): KeyProp & { blocks?: any } => {
    const blocks = data.blocks || {}
    return {
      id,
      name: data.name || id,
      description: blocks.prop_name || blocks.prop_detail || '',
      visualDescription: Object.entries(blocks)
        .filter(([key]) => key.startsWith('prop_'))
        .map(([key, value]) => `${key}: ${value}`)
        .join(', '),
      blocks // V8 blocks 데이터 보존
    }
  }

  const convertV8ToLocation = (id: string, data: any): LocationData & { blocks?: any } => {
    const blocks = data.blocks || {}
    return {
      id,
      scene: 0,
      title: data.name || id,
      location: blocks.loc_main || data.name || id,
      timeOfDay: blocks.loc_light_mood || '',
      atmosphere: blocks.atmosphere || '',
      blocks // V8 blocks 데이터 보존
    }
  }

  // V8 라이브러리에서 캐릭터와 장소 추출
  const v8Characters = library?.characters
    ? Object.entries(library.characters).map(([id, data]: [string, any]) =>
        convertV8ToCharacter(id, data))
    : []

  const v8Locations = library?.locations
    ? Object.entries(library.locations).map(([id, data]: [string, any]) =>
        convertV8ToLocation(id, data))
    : []

  const v8Props = library?.props
    ? Object.entries(library.props).map(([id, data]: [string, any]) =>
        convertV8ToKeyProp(id, data))
    : []

  // 레거시와 V8 캐릭터 병합
  const allCharacters: Character[] = [
    ...characters,
    ...v8Characters.filter(v8 => !characters.find(c => c.id === v8.id))
  ]

  // 레거시와 V8 소품 병합
  const allKeyProps: KeyProp[] = [
    ...keyProps,
    ...v8Props.filter(v8 => !keyProps.find(p => p.id === v8.id))
  ]

  // 장소 정보 추출 (씬에서 중복 제거) - 오버라이드 적용
  const locations: LocationData[] = scenes
    .filter(scene => scene.setting?.location)
    .map(scene => {
      const locId = `loc_${scene.sceneId || scene.id || scene.scene || scene.sceneNumber}`
      const override = locationOverrides[locId]

      return {
        id: locId,
        scene: scene.scene || scene.sceneNumber || 0,
        title: scene.title || '',
        location: override?.location || scene.setting!.location!,
        timeOfDay: override?.timeOfDay || scene.setting?.timeOfDay || '',
        atmosphere: override?.atmosphere || scene.setting?.atmosphere || ''
      }
    })
    .reduce<LocationData[]>((acc, curr) => {
      // 중복된 location 제거
      const exists = acc.find((l: LocationData) => l.location === curr.location)
      if (!exists) {
        acc.push(curr)
      }
      return acc
    }, [])

  // 레거시와 V8 장소 병합
  const allLocations: LocationData[] = [
    ...locations,
    ...v8Locations.filter(v8 => !locations.find(l => l.location === v8.location))
  ]

  // 탭 변경 시 첫 번째 아이템 자동 선택
  useEffect(() => {
    if (activeTab === 'characters') {
      if (allCharacters.length > 0) {
        setSelectedId(allCharacters[0].id)
      }
    } else if (activeTab === 'keyProps') {
      if (allKeyProps.length > 0) {
        setSelectedId(allKeyProps[0].id)
      }
    } else if (activeTab === 'locations') {
      if (allLocations.length > 0) {
        setSelectedId(allLocations[0].id)
      }
    }
  }, [activeTab])

  // localStorage에서 이미지와 장소 데이터 로드
  useEffect(() => {
    const charImages: Record<string, string> = {}
    const propImages: Record<string, string> = {}
    const locImages: Record<string, string> = {}
    const locOverrides: Record<string, LocationData> = {}
    const fullPrompts: Record<string, string> = {}

    characters.forEach(char => {
      const saved = localStorage.getItem(`character_image_${char.id}`)
      if (saved) charImages[char.id] = saved
    })

    keyProps.forEach(prop => {
      const saved = localStorage.getItem(`keyprop_image_${prop.id}`)
      if (saved) propImages[prop.id] = saved
    })

    // 장소 이미지와 오버라이드 데이터 로드
    scenes.forEach(scene => {
      if (scene.setting?.location) {
        const locId = `loc_${scene.sceneId || scene.id || scene.scene || scene.sceneNumber}`
        const savedImage = localStorage.getItem(`location_image_${locId}`)
        if (savedImage) locImages[locId] = savedImage

        const savedData = localStorage.getItem(`location_data_${locId}`)
        if (savedData) {
          try {
            locOverrides[locId] = JSON.parse(savedData)
          } catch (e) {
            console.error('Failed to parse location data:', e)
          }
        }

        const savedFullPrompt = localStorage.getItem(`location_full_prompt_${locId}`)
        if (savedFullPrompt) fullPrompts[locId] = savedFullPrompt
      }
    })

    setCharacterImages(charImages)
    setKeyPropImages(propImages)
    setLocationImages(locImages)
    setLocationOverrides(locOverrides)
    setFullPromptOverrides(fullPrompts)
  }, [characters, keyProps, scenes])

  const handleAddCharacter = () => {
    if (!onUpdateCharacters) return
    const newCharacter: Character = {
      id: `char_${Date.now()}`,
      name: '새 캐릭터',
      role: '',
      description: '',
      visualDescription: ''
    }
    onUpdateCharacters([...characters, newCharacter])
    setSelectedId(newCharacter.id)
    setEditingId(newCharacter.id)
  }

  const handleAddKeyProp = () => {
    if (!onUpdateKeyProps) return
    const newProp: KeyProp = {
      id: `prop_${Date.now()}`,
      name: '새 소품',
      description: '',
      visualDescription: ''
    }
    onUpdateKeyProps([...keyProps, newProp])
    setSelectedId(newProp.id)
    setEditingId(newProp.id)
  }

  const handleDeleteCharacter = (id: string) => {
    if (!onUpdateCharacters) return
    if (confirm('이 캐릭터를 삭제하시겠습니까?')) {
      onUpdateCharacters(characters.filter(c => c.id !== id))
      localStorage.removeItem(`character_image_${id}`)
      if (selectedId === id) {
        setSelectedId(characters[0]?.id || null)
      }
    }
  }

  const handleDeleteKeyProp = (id: string) => {
    if (!onUpdateKeyProps) return
    if (confirm('이 소품을 삭제하시겠습니까?')) {
      onUpdateKeyProps(keyProps.filter(p => p.id !== id))
      localStorage.removeItem(`keyprop_image_${id}`)
      if (selectedId === id) {
        setSelectedId(keyProps[0]?.id || null)
      }
    }
  }

  const handleUpdateCharacter = (id: string, field: string, value: string) => {
    if (!onUpdateCharacters) return
    onUpdateCharacters(characters.map(char =>
      char.id === id ? { ...char, [field]: value } : char
    ))
  }

  const handleUpdateKeyProp = (id: string, field: string, value: string) => {
    if (!onUpdateKeyProps) return
    onUpdateKeyProps(keyProps.map(prop =>
      prop.id === id ? { ...prop, [field]: value } : prop
    ))
  }

  const handleImageUrlChange = (type: 'character' | 'keyprop' | 'location', id: string, url: string) => {
    if (type === 'character') {
      setCharacterImages(prev => ({ ...prev, [id]: url }))
      localStorage.setItem(`character_image_${id}`, url)
    } else if (type === 'keyprop') {
      setKeyPropImages(prev => ({ ...prev, [id]: url }))
      localStorage.setItem(`keyprop_image_${id}`, url)
    } else {
      setLocationImages(prev => ({ ...prev, [id]: url }))
      localStorage.setItem(`location_image_${id}`, url)
    }
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // 현재 탭에 따른 선택된 아이템
  const selectedCharacter = activeTab === 'characters'
    ? allCharacters.find(c => c.id === selectedId)
    : null
  const selectedKeyProp = activeTab === 'keyProps'
    ? allKeyProps.find(p => p.id === selectedId)
    : null
  const selectedLocation = activeTab === 'locations'
    ? allLocations.find(l => l.id === selectedId)
    : null

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">비주얼 컨셉</h2>
        {activeTab === 'characters' && (
          <Button onClick={handleAddCharacter} size="sm" className="rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            캐릭터 추가
          </Button>
        )}
        {activeTab === 'keyProps' && (
          <Button onClick={handleAddKeyProp} size="sm" className="rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            소품 추가
          </Button>
        )}
      </div>

      {/* Main Tabs */}
      <div className="border-b border-white/10">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => setActiveTab('characters')}
            className={cn(
              "rounded-t-lg rounded-b-none border-b-2 transition-all",
              activeTab === 'characters'
                ? "border-red-900 bg-red-900/20 hover:bg-red-900/30"
                : "border-transparent hover:bg-white/10"
            )}
          >
            <User className="h-4 w-4 mr-2" />
            캐릭터 ({allCharacters.length})
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('locations')}
            className={cn(
              "rounded-t-lg rounded-b-none border-b-2 transition-all",
              activeTab === 'locations'
                ? "border-red-900 bg-red-900/20 hover:bg-red-900/30"
                : "border-transparent hover:bg-white/10"
            )}
          >
            <MapPin className="h-4 w-4 mr-2" />
            장소 ({allLocations.length})
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('keyProps')}
            className={cn(
              "rounded-t-lg rounded-b-none border-b-2 transition-all",
              activeTab === 'keyProps'
                ? "border-red-900 bg-red-900/20 hover:bg-red-900/30"
                : "border-transparent hover:bg-white/10"
            )}
          >
            <Package className="h-4 w-4 mr-2" />
            소품 ({allKeyProps.length})
          </Button>
        </div>
      </div>

      {/* Character Tab Content */}
      {activeTab === 'characters' && allCharacters.length > 0 && (
        <>
          {/* Character Sub-tabs */}
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 border-b border-white/10 pb-2 min-w-fit">
              {allCharacters.map((character) => (
                <Button
                  key={character.id}
                  variant="ghost"
                  onClick={() => setSelectedId(character.id)}
                  className={cn(
                    "rounded-full transition-all whitespace-nowrap flex-shrink-0",
                    selectedId === character.id
                      ? "bg-red-900/50 text-white hover:bg-red-900/70"
                      : "hover:bg-white/10 text-foreground"
                  )}
                >
                  <User className="h-4 w-4 mr-2" />
                  {character.name || '이름 없음'}
                </Button>
              ))}
            </div>
          </div>

          {selectedCharacter && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="backdrop-blur-xl bg-card/50 border-white/10">
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <User className="h-5 w-5 text-primary flex-shrink-0" />
                    {editingId === selectedCharacter.id ? (
                      <Input
                        value={selectedCharacter.name}
                        onChange={(e) => handleUpdateCharacter(selectedCharacter.id, 'name', e.target.value)}
                        onBlur={() => setEditingId(null)}
                        placeholder="캐릭터 이름"
                        className="h-8 max-w-[120px] sm:max-w-[160px] bg-background/50 border-white/10"
                      />
                    ) : (
                      <CardTitle className="cursor-pointer truncate" onClick={() => setEditingId(selectedCharacter.id)}>
                        {selectedCharacter.name || '이름 없음'}
                      </CardTitle>
                    )}
                    <Badge variant="secondary" className="flex-shrink-0 text-xs">
                      {selectedCharacter.role || '역할'}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteCharacter(selectedCharacter.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* V8 Blocks 데이터 표시 */}
                  {(selectedCharacter as any).blocks ? (
                    <>
                      {/* V8 프롬프트 표시 */}
                      {library && (() => {
                        try {
                          // 임시 promptBlock 생성 (캐릭터 데이터만 있을 경우)
                          const tempPromptBlock: PromptBlock = {
                            base_character_id: selectedCharacter.id,
                            base_location_id: '', // 빈 장소
                            override: {}
                          }
                          const generatedPrompt = generateBlockPrompt(library as Library, tempPromptBlock)

                          return (
                            <div>
                              <label className="text-xs text-muted-foreground mb-2 block">생성된 프롬프트</label>
                              <div className="relative">
                                <div className="bg-background/50 border border-white/10 rounded-lg px-3 py-2 pr-10 text-sm font-mono min-h-[300px] overflow-y-auto">
                                  {generatedPrompt}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopy(generatedPrompt, `char_prompt_${selectedCharacter.id}`)}
                                  className="absolute top-2 right-2 h-8 w-8 p-0 rounded-md hover:bg-white/10 active:bg-white/20 transition-colors"
                                >
                                  {copiedId === `char_prompt_${selectedCharacter.id}` ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          )
                        } catch (e) {
                          console.error('프롬프트 생성 실패:', e)
                          return null
                        }
                      })()}
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-xs text-muted-foreground">역할</label>
                        <Input
                          value={selectedCharacter.role}
                          onChange={(e) => handleUpdateCharacter(selectedCharacter.id, 'role', e.target.value)}
                          placeholder="주인공, 조연 등"
                          className="bg-background/50 border-white/10"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">설명</label>
                        <textarea
                          value={selectedCharacter.description}
                          onChange={(e) => handleUpdateCharacter(selectedCharacter.id, 'description', e.target.value)}
                          placeholder="캐릭터 설명"
                          className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">비주얼 프롬프트</label>
                        <div className="relative mt-1">
                          <textarea
                            value={selectedCharacter.visualDescription}
                            onChange={(e) => handleUpdateCharacter(selectedCharacter.id, 'visualDescription', e.target.value)}
                            placeholder="A young man with silver hair..."
                            className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 pr-10 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                            rows={4}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(selectedCharacter.visualDescription, `char_visual_${selectedCharacter.id}`)}
                            className="absolute top-2 right-2 h-8 w-8 p-0 rounded-md hover:bg-white/10 active:bg-white/20 transition-colors"
                          >
                            {copiedId === `char_visual_${selectedCharacter.id}` ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-card/50 border-white/10">
                <CardHeader>
                  <CardTitle>캐릭터 이미지</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground">이미지 URL</label>
                    <Input
                      value={characterImages[selectedCharacter.id] || ''}
                      onChange={(e) => handleImageUrlChange('character', selectedCharacter.id, e.target.value)}
                      placeholder="https://..."
                      className="bg-background/50 border-white/10"
                    />
                  </div>
                  {characterImages[selectedCharacter.id] && (
                    <div className="h-[300px] border border-white/10 rounded-lg overflow-hidden bg-black/50 flex items-center justify-center">
                      <img
                        src={characterImages[selectedCharacter.id]}
                        alt={selectedCharacter.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Locations Tab Content */}
      {activeTab === 'locations' && allLocations.length > 0 && (
        <>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 border-b border-white/10 pb-2 min-w-fit">
              {allLocations.map((location) => (
                <Button
                  key={location.id}
                  variant="ghost"
                  onClick={() => setSelectedId(location.id)}
                  className={cn(
                    "rounded-full transition-all whitespace-nowrap flex-shrink-0",
                    selectedId === location.id
                      ? "bg-red-900/50 text-white hover:bg-red-900/70"
                      : "hover:bg-white/10 text-foreground"
                  )}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {location.title || (location as any).name || `Scene ${location.scene}`}
                </Button>
              ))}
            </div>
          </div>

          {selectedLocation && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="backdrop-blur-xl bg-card/50 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Scene {selectedLocation.scene}
                    {selectedLocation.title && `: ${selectedLocation.title}`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* V8 Blocks 데이터 표시 */}
                  {(selectedLocation as any).blocks ? (
                    <>
                      {/* V8 프롬프트 표시 */}
                      {library && (() => {
                        try {
                          // 임시 promptBlock 생성 (장소 데이터만 있을 경우)
                          const tempPromptBlock: PromptBlock = {
                            base_character_id: '', // 빈 캐릭터
                            base_location_id: selectedLocation.id,
                            override: {}
                          }
                          const generatedPrompt = generateBlockPrompt(library as Library, tempPromptBlock)

                          return (
                            <div>
                              <label className="text-xs text-muted-foreground mb-2 block">생성된 프롬프트</label>
                              <div className="relative">
                                <div className="bg-background/50 border border-white/10 rounded-lg px-3 py-2 pr-10 text-sm font-mono min-h-[300px] overflow-y-auto">
                                  {generatedPrompt}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopy(generatedPrompt, `loc_prompt_${selectedLocation.id}`)}
                                  className="absolute top-2 right-2 h-8 w-8 p-0 rounded-md hover:bg-white/10 active:bg-white/20 transition-colors"
                                >
                                  {copiedId === `loc_prompt_${selectedLocation.id}` ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          )
                        } catch (e) {
                          console.error('프롬프트 생성 실패:', e)
                          return null
                        }
                      })()}
                    </>
                  ) : (
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">장소 프롬프트</label>
                      <div className="relative">
                        <div className="bg-background/50 border border-white/10 rounded-lg px-3 py-2 pr-10 text-sm font-mono min-h-[300px] overflow-y-auto">
                          {fullPromptOverrides[selectedLocation.id] || `${selectedLocation.location}${selectedLocation.timeOfDay ? `, ${selectedLocation.timeOfDay}` : ''}${selectedLocation.atmosphere ? `, ${selectedLocation.atmosphere}` : ''}`}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(
                            fullPromptOverrides[selectedLocation.id] ||
                            `${selectedLocation.location}${selectedLocation.timeOfDay ? `, ${selectedLocation.timeOfDay}` : ''}${selectedLocation.atmosphere ? `, ${selectedLocation.atmosphere}` : ''}`,
                            `loc_prompt_legacy_${selectedLocation.id}`
                          )}
                          className="absolute top-2 right-2 h-8 w-8 p-0 rounded-md hover:bg-white/10 active:bg-white/20 transition-colors"
                        >
                          {copiedId === `loc_prompt_legacy_${selectedLocation.id}` ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-card/50 border-white/10">
                <CardHeader>
                  <CardTitle>장소 이미지</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground">이미지 URL</label>
                    <Input
                      value={locationImages[selectedLocation.id] || ''}
                      onChange={(e) => handleImageUrlChange('location', selectedLocation.id, e.target.value)}
                      placeholder="https://..."
                      className="bg-background/50 border-white/10"
                    />
                  </div>
                  {locationImages[selectedLocation.id] && (
                    <div className="h-[300px] border border-white/10 rounded-lg overflow-hidden bg-black/50 flex items-center justify-center">
                      <img
                        src={locationImages[selectedLocation.id]}
                        alt={`Scene ${selectedLocation.scene}`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {/* KeyProps Tab Content */}
      {activeTab === 'keyProps' && allKeyProps.length > 0 && (
        <>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 border-b border-white/10 pb-2 min-w-fit">
              {allKeyProps.map((prop) => (
                <Button
                  key={prop.id}
                  variant="ghost"
                  onClick={() => setSelectedId(prop.id)}
                  className={cn(
                    "rounded-full transition-all whitespace-nowrap flex-shrink-0",
                    selectedId === prop.id
                      ? "bg-red-900/50 text-white hover:bg-red-900/70"
                      : "hover:bg-white/10 text-foreground"
                  )}
                >
                  <Package className="h-4 w-4 mr-2" />
                  {prop.name || '이름 없음'}
                </Button>
              ))}
            </div>
          </div>

          {selectedKeyProp && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="backdrop-blur-xl bg-card/50 border-white/10">
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Package className="h-5 w-5 text-primary flex-shrink-0" />
                    {editingId === selectedKeyProp.id ? (
                      <Input
                        value={selectedKeyProp.name}
                        onChange={(e) => handleUpdateKeyProp(selectedKeyProp.id, 'name', e.target.value)}
                        onBlur={() => setEditingId(null)}
                        placeholder="소품 이름"
                        className="h-8 max-w-[120px] sm:max-w-[160px] bg-background/50 border-white/10"
                      />
                    ) : (
                      <CardTitle className="cursor-pointer truncate" onClick={() => setEditingId(selectedKeyProp.id)}>
                        {selectedKeyProp.name || '이름 없음'}
                      </CardTitle>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteKeyProp(selectedKeyProp.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* V8 Blocks 데이터 표시 */}
                  {(selectedKeyProp as any).blocks ? (
                    <>
                      {/* V8 프롬프트 표시 (소품 blocks를 문자열로 조합) */}
                      {(() => {
                        try {
                          const blocks = (selectedKeyProp as any).blocks
                          // 소품 blocks를 문자열로 조합
                          const propPrompt = Object.entries(blocks)
                            .filter(([key]) => key.startsWith('prop_'))
                            .map(([_, value]) => value)
                            .filter(Boolean)
                            .join(', ')

                          if (!propPrompt) return null

                          return (
                            <div>
                              <label className="text-xs text-muted-foreground mb-2 block">생성된 프롬프트</label>
                              <div className="relative">
                                <div className="bg-background/50 border border-white/10 rounded-lg px-3 py-2 pr-10 text-sm font-mono min-h-[300px] overflow-y-auto">
                                  {propPrompt}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopy(propPrompt, `prop_prompt_${selectedKeyProp.id}`)}
                                  className="absolute top-2 right-2 h-8 w-8 p-0 rounded-md hover:bg-white/10 active:bg-white/20 transition-colors"
                                >
                                  {copiedId === `prop_prompt_${selectedKeyProp.id}` ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          )
                        } catch (e) {
                          console.error('프롬프트 생성 실패:', e)
                          return null
                        }
                      })()}
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-xs text-muted-foreground">설명</label>
                        <textarea
                          value={selectedKeyProp.description}
                          onChange={(e) => handleUpdateKeyProp(selectedKeyProp.id, 'description', e.target.value)}
                          placeholder="소품 설명"
                          className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">비주얼 프롬프트</label>
                        <div className="relative mt-1">
                          <textarea
                            value={selectedKeyProp.visualDescription}
                            onChange={(e) => handleUpdateKeyProp(selectedKeyProp.id, 'visualDescription', e.target.value)}
                            placeholder="A glowing blue energy katana..."
                            className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 pr-10 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                            rows={4}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(selectedKeyProp.visualDescription, `prop_visual_${selectedKeyProp.id}`)}
                            className="absolute top-2 right-2 h-8 w-8 p-0 rounded-md hover:bg-white/10 active:bg-white/20 transition-colors"
                          >
                            {copiedId === `prop_visual_${selectedKeyProp.id}` ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-card/50 border-white/10">
                <CardHeader>
                  <CardTitle>소품 이미지</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground">이미지 URL</label>
                    <Input
                      value={keyPropImages[selectedKeyProp.id] || ''}
                      onChange={(e) => handleImageUrlChange('keyprop', selectedKeyProp.id, e.target.value)}
                      placeholder="https://..."
                      className="bg-background/50 border-white/10"
                    />
                  </div>
                  {keyPropImages[selectedKeyProp.id] && (
                    <div className="h-[300px] border border-white/10 rounded-lg overflow-hidden bg-black/50 flex items-center justify-center">
                      <img
                        src={keyPropImages[selectedKeyProp.id]}
                        alt={selectedKeyProp.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Empty States */}
      {activeTab === 'characters' && allCharacters.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <User className="h-16 w-16 text-muted-foreground" />
          <p className="text-muted-foreground">등록된 캐릭터가 없습니다.</p>
          <Button onClick={handleAddCharacter} className="rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            캐릭터 추가
          </Button>
        </div>
      )}

      {activeTab === 'locations' && allLocations.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <MapPin className="h-16 w-16 text-muted-foreground" />
          <p className="text-muted-foreground">장소 정보가 없습니다.</p>
          <p className="text-sm text-muted-foreground">씬 데이터에서 장소 정보를 가져옵니다.</p>
        </div>
      )}

      {activeTab === 'keyProps' && allKeyProps.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <Package className="h-16 w-16 text-muted-foreground" />
          <p className="text-muted-foreground">등록된 소품이 없습니다.</p>
          <Button onClick={handleAddKeyProp} className="rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            소품 추가
          </Button>
        </div>
      )}
    </div>
  )
}