import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, User, Copy, Languages } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

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

interface VisualConceptProps {
  characters: Character[]
  onUpdate: (characters: Character[]) => void
}

export function VisualConcept({ characters, onUpdate }: VisualConceptProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null)
  const [characterImages, setCharacterImages] = useState<Record<string, string>>({})
  const [isKorean, setIsKorean] = useState<Record<string, boolean>>({})
  const [originalKorean, setOriginalKorean] = useState<Record<string, Character['consistency']>>({})

  // 첫 캐릭터 자동 선택
  useEffect(() => {
    console.log('VisualConcept - characters:', characters)
    if (characters.length > 0) {
      // selectedCharacterId가 현재 캐릭터 목록에 없으면 첫 번째 캐릭터 선택
      const exists = characters.find(c => c.id === selectedCharacterId)
      if (!exists) {
        console.log('첫 번째 캐릭터 선택:', characters[0].id)
        setSelectedCharacterId(characters[0].id)
      }
    }
  }, [characters, selectedCharacterId])

  // localStorage에서 이미지 로드 및 원본 한글 데이터 저장
  useEffect(() => {
    const images: Record<string, string> = {}
    const korean: Record<string, Character['consistency']> = {}
    const currentKoreanState = { ...originalKorean }

    characters.forEach(char => {
      const saved = localStorage.getItem(`character_image_${char.id}`)
      if (saved) images[char.id] = saved

      // 원본 한글 데이터 저장 (처음 로드시)
      if (!currentKoreanState[char.id] && typeof char.consistency === 'object') {
        korean[char.id] = { ...char.consistency }
      }
    })
    setCharacterImages(images)
    if (Object.keys(korean).length > 0) {
      setOriginalKorean(prev => ({ ...prev, ...korean }))
    }
  }, [characters, originalKorean])

  const selectedCharacter = characters.find(c => c.id === selectedCharacterId)

  const addCharacter = () => {
    const newCharacter: Character = {
      id: `char_${Date.now()}`,
      name: '',
      role: '',
      description: '',
      visualDescription: '',
      consistency: {
        age: '',
        gender: '',
        build: '',
        hair: '',
        eyes: '',
        outfit: '',
        equipment: '',
        features: ''
      }
    }
    onUpdate([...characters, newCharacter])
    setEditingId(newCharacter.id)
  }

  const deleteCharacter = (id: string) => {
    if (confirm('이 캐릭터를 삭제하시겠습니까?')) {
      onUpdate(characters.filter(c => c.id !== id))
      localStorage.removeItem(`character_image_${id}`)
      if (selectedCharacterId === id) {
        setSelectedCharacterId(characters[0]?.id || null)
      }
    }
  }

  const updateCharacter = (id: string, field: string, value: string) => {
    onUpdate(characters.map(char =>
      char.id === id ? { ...char, [field]: value } : char
    ))
  }

  const updateConsistency = (id: string, field: string, value: string) => {
    const character = characters.find(c => c.id === id)
    if (!character) return

    // consistency가 객체가 아니면 기본 객체 생성
    const currentConsistency = typeof character.consistency === 'object' ? character.consistency : {
      age: '',
      gender: '',
      build: '',
      hair: '',
      eyes: '',
      outfit: '',
      equipment: '',
      features: ''
    }

    const updatedConsistency = { ...currentConsistency, [field]: value }

    // consistency 필드들로 visualDescription 자동 생성 (영문 모드일 때만)
    const currentIsKorean = isKorean[id] ?? true
    let newVisualDescription = character.visualDescription

    if (!currentIsKorean) {
      // 영문 모드일 때: consistency 값들을 조합하여 visualDescription 생성
      const parts: string[] = []

      if (updatedConsistency.age) parts.push(`a ${updatedConsistency.age}`)
      if (updatedConsistency.gender) parts.push(updatedConsistency.gender)
      if (updatedConsistency.hair) parts.push(`with ${updatedConsistency.hair}`)
      if (updatedConsistency.eyes) parts.push(`${updatedConsistency.eyes}`)
      if (updatedConsistency.outfit) parts.push(`wearing ${updatedConsistency.outfit}`)
      if (updatedConsistency.features) parts.push(updatedConsistency.features)

      newVisualDescription = parts.join(', ')
    }

    onUpdate(characters.map(char =>
      char.id === id ? {
        ...char,
        consistency: updatedConsistency,
        visualDescription: newVisualDescription
      } : char
    ))
  }

  const handleImageUrlChange = (id: string, url: string) => {
    setCharacterImages(prev => ({ ...prev, [id]: url }))
    localStorage.setItem(`character_image_${id}`, url)
  }

  const handleCopyVisualDescription = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleToggleLanguage = (id: string) => {
    const character = characters.find(c => c.id === id)
    if (!character) return

    const currentIsKorean = isKorean[id] ?? true

    if (currentIsKorean) {
      // 한글 → 영문: 원본 한글 저장 후 consistency_tr 값을 consistency로 복사
      if (!originalKorean[id] && typeof character.consistency === 'object') {
        setOriginalKorean(prev => ({ ...prev, [id]: { ...character.consistency as any } }))
      }

      if (character.consistency_tr && typeof character.consistency_tr === 'object') {
        const tr = character.consistency_tr
        onUpdate(characters.map(char =>
          char.id === id ? {
            ...char,
            consistency: {
              age: tr.age,
              gender: tr.gender,
              build: tr.build,
              hair: tr.hair,
              eyes: tr.eyes,
              outfit: tr.outfit,
              equipment: tr.equipment,
              features: tr.features
            }
          } : char
        ))
        setIsKorean(prev => ({ ...prev, [id]: false }))
      }
    } else {
      // 영문 → 한글: 원본 한글 데이터로 복원
      if (originalKorean[id]) {
        onUpdate(characters.map(char =>
          char.id === id ? {
            ...char,
            consistency: { ...originalKorean[id] as any }
          } : char
        ))
        setIsKorean(prev => ({ ...prev, [id]: true }))
      }
    }
  }

  if (characters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <User className="h-16 w-16 text-muted-foreground" />
        <p className="text-muted-foreground">등록된 캐릭터가 없습니다.</p>
        <Button onClick={addCharacter} className="rounded-full">
          <Plus className="h-4 w-4 mr-2" />
          캐릭터 추가
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">비주얼 컨셉</h2>
        <Button onClick={addCharacter} size="sm" className="rounded-full">
          <Plus className="h-4 w-4 mr-2" />
          캐릭터 추가
        </Button>
      </div>

      {/* Character Tabs - 모바일 스크롤 가능 */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 border-b border-white/10 pb-2 min-w-fit">
          {characters.map((character) => (
            <Button
              key={character.id}
              variant="ghost"
              onClick={() => setSelectedCharacterId(character.id)}
              className={cn(
                "rounded-full transition-all whitespace-nowrap flex-shrink-0",
                selectedCharacterId === character.id
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

      {/* Character Content */}
      {selectedCharacter && (() => {
        // consistency를 안전하게 객체로 변환
        const consistency = typeof selectedCharacter.consistency === 'object' && selectedCharacter.consistency
          ? selectedCharacter.consistency
          : {
              age: '',
              gender: '',
              build: '',
              hair: '',
              eyes: '',
              outfit: '',
              equipment: '',
              features: ''
            }

        return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Character Info */}
          <Card className="backdrop-blur-xl bg-card/50 border-white/10">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <User className="h-5 w-5 text-primary flex-shrink-0" />
                {editingId === selectedCharacter.id ? (
                  <Input
                    value={selectedCharacter.name}
                    onChange={(e) => updateCharacter(selectedCharacter.id, 'name', e.target.value)}
                    placeholder="캐릭터 이름"
                    className="h-8 max-w-[120px] sm:max-w-[160px] bg-background/50 border-white/10"
                  />
                ) : (
                  <CardTitle className="cursor-pointer truncate" onClick={() => setEditingId(selectedCharacter.id)}>
                    {selectedCharacter.name || '이름 없음'}
                  </CardTitle>
                )}
                <Badge variant="secondary" className="flex-shrink-0 text-xs">{selectedCharacter.role || '역할'}</Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteCharacter(selectedCharacter.id)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Basic Info */}
              <div>
                <label className="text-xs text-muted-foreground">역할</label>
                <Input
                  value={selectedCharacter.role}
                  onChange={(e) => updateCharacter(selectedCharacter.id, 'role', e.target.value)}
                  placeholder="주인공, 조연 등"
                  className="bg-background/50 border-white/10"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs text-muted-foreground">설명</label>
                <textarea
                  value={selectedCharacter.description}
                  onChange={(e) => updateCharacter(selectedCharacter.id, 'description', e.target.value)}
                  placeholder="캐릭터 설명"
                  className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  rows={3}
                />
              </div>

              {/* Visual Description */}
              <div>
                <label className="text-xs text-muted-foreground">비주얼 설명 (프롬프트용)</label>
                <div className="relative mt-1">
                  <textarea
                    value={selectedCharacter.visualDescription}
                    onChange={(e) => updateCharacter(selectedCharacter.id, 'visualDescription', e.target.value)}
                    placeholder="a 12-year-old girl with long brown hair..."
                    className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 pr-10 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    rows={6}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyVisualDescription(selectedCharacter.visualDescription)}
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Consistency Details - 숨김 처리 (필요시 주석 해제) */}
              {/* <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-muted-foreground">일관성 유지 정보</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleLanguage(selectedCharacter.id)}
                    className="h-6 px-2"
                  >
                    <Languages className="h-3 w-3 mr-1" />
                    <span className="text-xs">
                      {isKorean[selectedCharacter.id] ?? true ? '영문번역' : '한글번역'}
                    </span>
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    value={consistency.age}
                    onChange={(e) => updateConsistency(selectedCharacter.id, 'age', e.target.value)}
                    placeholder="나이"
                    className="bg-background/50 border-white/10 text-sm"
                  />
                  <Input
                    value={consistency.gender}
                    onChange={(e) => updateConsistency(selectedCharacter.id, 'gender', e.target.value)}
                    placeholder="성별"
                    className="bg-background/50 border-white/10 text-sm"
                  />
                  <Input
                    value={consistency.build || ''}
                    onChange={(e) => updateConsistency(selectedCharacter.id, 'build', e.target.value)}
                    placeholder="체격"
                    className="sm:col-span-2 bg-background/50 border-white/10 text-sm"
                  />
                  <Input
                    value={consistency.hair}
                    onChange={(e) => updateConsistency(selectedCharacter.id, 'hair', e.target.value)}
                    placeholder="머리카락"
                    className="bg-background/50 border-white/10 text-sm"
                  />
                  <Input
                    value={consistency.eyes}
                    onChange={(e) => updateConsistency(selectedCharacter.id, 'eyes', e.target.value)}
                    placeholder="눈"
                    className="bg-background/50 border-white/10 text-sm"
                  />
                  <Input
                    value={consistency.outfit}
                    onChange={(e) => updateConsistency(selectedCharacter.id, 'outfit', e.target.value)}
                    placeholder="의상"
                    className="sm:col-span-2 bg-background/50 border-white/10 text-sm"
                  />
                  <Input
                    value={consistency.equipment || ''}
                    onChange={(e) => updateConsistency(selectedCharacter.id, 'equipment', e.target.value)}
                    placeholder="장비"
                    className="sm:col-span-2 bg-background/50 border-white/10 text-sm"
                  />
                  <Input
                    value={consistency.features}
                    onChange={(e) => updateConsistency(selectedCharacter.id, 'features', e.target.value)}
                    placeholder="특징"
                    className="sm:col-span-2 bg-background/50 border-white/10 text-sm"
                  />
                </div>
              </div> */}
            </CardContent>
          </Card>

          {/* Right: Image Preview */}
          <Card className="backdrop-blur-xl bg-card/50 border-white/10">
            <CardHeader>
              <CardTitle>캐릭터 이미지</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">이미지 URL</label>
                <Input
                  value={characterImages[selectedCharacter.id] || ''}
                  onChange={(e) => handleImageUrlChange(selectedCharacter.id, e.target.value)}
                  placeholder="https://..."
                  className="bg-background/50 border-white/10"
                />
              </div>
              {characterImages[selectedCharacter.id] && (
                <div className="border border-white/10 rounded-lg overflow-hidden bg-background/30">
                  <img
                    src={characterImages[selectedCharacter.id]}
                    alt={selectedCharacter.name}
                    className="w-full h-auto object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )
      })()}
    </div>
  )
}
