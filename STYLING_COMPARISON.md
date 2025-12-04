# 스타일링 방식 비교 및 개선 가이드

## 현재 스타일링 방식 (Before)

### 1. **React Native Paper**
- Material Design 기반 UI 라이브러리
- 컴포넌트: `Card`, `Text`, `Button`, `TextInput`, `Appbar` 등
- 장점: 빠른 프로토타이핑, 일관된 디자인
- 단점: 커스터마이징 제한적, 번들 크기 큼

### 2. **StyleSheet.create()**
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
});
```
- 장점: 타입 안정성, 성능 최적화
- 단점: 반복적인 코드, 유지보수 어려움

### 3. **React Context API**
```typescript
const AuthContext = createContext<AuthContextType | undefined>(undefined);
```
- 장점: React 내장, 간단한 상태 관리
- 단점: 리렌더링 최적화 어려움, 복잡한 상태 관리 시 비효율적

---

## 개선된 스타일링 방식 (After)

### 1. **Tailwind CSS + NativeWind**
- 유틸리티 퍼스트 CSS 프레임워크
- React Native와 웹 모두 지원 (NativeWind)
- 장점:
  - 빠른 개발 속도
  - 일관된 디자인 시스템
  - 작은 번들 크기 (사용한 클래스만 포함)
  - 반응형 디자인 쉬움

**예시:**
```tsx
// Before
<View style={styles.container}>
  <Card style={styles.card}>
    <Text style={styles.title}>Hello</Text>
  </Card>
</View>

// After
<View className="flex-1 bg-gray-50 p-4">
  <View className="mb-4 rounded-xl bg-white shadow-md">
    <Text className="text-xl font-bold text-gray-900">Hello</Text>
  </View>
</View>
```

### 2. **shadcn/ui**
- 복사-붙여넣기 방식의 컴포넌트 라이브러리
- Tailwind CSS 기반
- 장점:
  - 완전한 커스터마이징 가능
  - 접근성(A11y) 내장
  - 모던한 디자인
  - 웹 전용 (React DOM)

**예시:**
```tsx
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

<Card className="p-6">
  <Button variant="default" size="lg">
    Click me
  </Button>
</Card>
```

### 3. **Zustand**
- 경량 상태 관리 라이브러리 (1KB 미만)
- 장점:
  - 간단한 API
  - 불필요한 리렌더링 방지
  - TypeScript 완벽 지원
  - 미들웨어 지원 (persist, devtools 등)

**예시:**
```typescript
// Before (Context API)
const AuthContext = createContext<AuthContextType | undefined>(undefined);
// 복잡한 Provider 설정, 리렌더링 최적화 어려움

// After (Zustand)
import { create } from 'zustand'

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: async () => { /* ... */ },
  logout: () => set({ user: null }),
}))
```

---

## 주요 차이점 요약

| 항목 | 현재 (Before) | 개선 (After) |
|------|--------------|-------------|
| **UI 라이브러리** | React Native Paper | shadcn/ui (웹) + NativeWind |
| **스타일링** | StyleSheet.create() | Tailwind CSS 클래스 |
| **상태 관리** | Context API | Zustand |
| **번들 크기** | 큼 (~500KB+) | 작음 (~50KB) |
| **커스터마이징** | 제한적 | 완전한 제어 |
| **개발 속도** | 보통 | 빠름 |
| **타입 안정성** | 좋음 | 매우 좋음 |

---

## 마이그레이션 전략

1. **플랫폼 분기**: 웹은 shadcn/ui, 모바일은 NativeWind 유지
2. **점진적 마이그레이션**: 한 화면씩 순차적으로 변경
3. **호환성 유지**: 기존 기능은 그대로 동작하도록 보장

---

## 인턴-주니어 레벨 구현

- 간단하고 명확한 코드 구조
- 주석과 문서화 충실
- 재사용 가능한 컴포넌트
- 일관된 네이밍 컨벤션
- 에러 핸들링 포함

