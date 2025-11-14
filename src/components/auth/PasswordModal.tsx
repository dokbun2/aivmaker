import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface PasswordModalProps {
  onSuccess: () => void
  correctPassword?: string
}

export function PasswordModal({ onSuccess, correctPassword = '1004' }: PasswordModalProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // 비밀번호 검증 (약간의 딜레이 추가로 사용자 경험 개선)
    setTimeout(() => {
      if (password === correctPassword) {
        // localStorage에 인증 상태 저장
        localStorage.setItem('passwordAuthenticated', 'true')
        onSuccess()
      } else {
        setError('비밀번호가 틀렸습니다.')
        setPassword('')
      }
      setIsLoading(false)
    }, 300)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e as any)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-8 w-96 border border-gray-800 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">AI툴비</h1>
        <p className="text-gray-400 text-center mb-8">비밀번호를 입력해주세요</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              autoFocus
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 text-center text-lg tracking-widest"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !password}
            className="w-full bg-red-900 hover:bg-red-800 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            {isLoading ? '확인 중...' : '입장'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-800">
          <p className="text-gray-500 text-xs text-center">
            © 2024 AI툴비. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
