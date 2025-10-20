import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, User, Copy, Check } from 'lucide-react'
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
  const [copiedId, setCopiedId] = useState<string | null>(null)
  // isKorean과 originalKorean state 제거 (사용하지 않음)

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

  // localStorage에서 이미지 로드
  useEffect(() => {
    const images: Record<string, string> = {}

    characters.forEach(char => {
      const saved = localStorage.getItem(`character_image_${char.id}`)
      if (saved) images[char.id] = saved
    })
    setCharacterImages(images)
  }, [characters])

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

  // updateConsistency 함수 제거 (사용하지 않음)

  const handleImageUrlChange = (id: string, url: string) => {
    setCharacterImages(prev => ({ ...prev, [id]: url }))
    localStorage.setItem(`character_image_${id}`, url)
  }

  const handleCopyVisualDescription = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // handleToggleLanguage 함수 제거 (사용하지 않음)

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
        // consistency 변수 제거 (사용하지 않음)

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
                    onClick={() => handleCopyVisualDescription(selectedCharacter.visualDescription, `char_${selectedCharacter.id}`)}
                    className="absolute top-2 right-2 h-8 w-8 p-0 rounded-md hover:bg-white/10 active:bg-white/20 transition-colors"
                  >
                    {copiedId === `char_${selectedCharacter.id}` ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Consistency Details - 완전히 제거됨 */}
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
        )
      })()}
    </div>
  )
}
