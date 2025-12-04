# UI 마이그레이션 가이드

## 개요

프론트엔드 UI를 **shadcn/ui**, **Tailwind CSS**, **Zustand**로 개선했습니다.

## 주요 변경사항

### 1. 상태 관리: Context API → Zustand

**Before:**
```typescript
import { useAuth } from '@/context/AuthContext';
const { user, login, logout } = useAuth();
```

**After:**
```typescript
import { useAuthStore } from '@/store/authStore';
const { user, login, logout } = useAuthStore();
```

### 2. 스타일링: StyleSheet → Tailwind CSS

**Before:**
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
});

<View style={styles.container}>
```

**After:**
```typescript
<View className="flex-1 bg-gray-50 p-4">
```

### 3. UI 컴포넌트: React Native Paper → shadcn/ui (웹)

**Before:**
```typescript
import { Card, Button, Text } from 'react-native-paper';

<Card>
  <Text>Hello</Text>
  <Button>Click</Button>
</Card>
```

**After (웹):**
```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

<Card>
  <CardHeader>
    <CardTitle>Hello</CardTitle>
  </CardHeader>
  <CardContent>
    <Button>Click</Button>
  </CardContent>
</Card>
```

## 플랫폼 분기

웹과 모바일을 구분하여 사용:

```typescript
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

// 웹: shadcn/ui + Tailwind
{isWeb && (
  <Card className="p-4">
    <Button>Web Button</Button>
  </Card>
)}

// 모바일: React Native Paper (기존 방식)
{!isWeb && (
  <Card style={styles.card}>
    <Button>Mobile Button</Button>
  </Card>
)}
```

## 사용 가능한 컴포넌트

### Button
```typescript
import { Button } from '@/components/ui/button';

<Button variant="default" size="lg" loading={isLoading}>
  Submit
</Button>

// Variants: default, destructive, outline, secondary, ghost, link
// Sizes: default, sm, lg, icon
```

### Card
```typescript
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter>
    Footer
  </CardFooter>
</Card>
```

### Input
```typescript
import { Input } from '@/components/ui/input';

<Input
  placeholder="Enter text..."
  value={value}
  onChangeText={setValue}
/>
```

### Badge
```typescript
import { Badge } from '@/components/ui/badge';

<Badge variant="outline">Tag</Badge>
// Variants: default, secondary, destructive, outline
```

## Tailwind CSS 클래스

주요 유틸리티 클래스:

- **Layout**: `flex`, `flex-row`, `flex-col`, `items-center`, `justify-between`
- **Spacing**: `p-4`, `px-6`, `py-2`, `m-4`, `gap-2`
- **Colors**: `bg-white`, `text-gray-900`, `border-gray-200`
- **Typography**: `text-lg`, `font-bold`, `text-center`
- **Borders**: `rounded-lg`, `border`, `border-b`
- **Effects**: `shadow-md`, `hover:shadow-lg`

## Zustand 스토어 사용법

### Auth Store
```typescript
import { useAuthStore } from '@/store/authStore';

function MyComponent() {
  const { user, login, logout, ready } = useAuthStore();
  
  // 직접 접근 (리렌더링 없음)
  const user = useAuthStore.getState().user;
  
  return (
    <View>
      {user ? (
        <Text>Welcome, {user.name}</Text>
      ) : (
        <Button onPress={login}>Login</Button>
      )}
    </View>
  );
}
```

### 새 스토어 만들기
```typescript
import { create } from 'zustand';

interface MyStore {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useMyStore = create<MyStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
```

## 개발 팁

1. **웹에서만 테스트**: `npm run web`으로 웹 버전 실행
2. **Tailwind 클래스 자동완성**: VS Code 확장 프로그램 설치 권장
3. **컴포넌트 재사용**: `components/ui/` 폴더에 공통 컴포넌트 추가
4. **반응형 디자인**: `md:`, `lg:` 프리픽스 사용 (웹 전용)

## 다음 단계

1. ✅ Zustand 스토어 설정 완료
2. ✅ shadcn/ui 컴포넌트 기본 세트 완료
3. ✅ Tailwind CSS 설정 완료
4. ⏳ 나머지 화면들 (search, report, profile) 마이그레이션
5. ⏳ 다크 모드 지원 추가
6. ⏳ 애니메이션 및 트랜지션 추가

## 문제 해결

### NativeWind가 작동하지 않을 때
1. `babel.config.js` 확인
2. Metro bundler 재시작: `npx expo start --clear`
3. `tailwind.config.js` content 경로 확인

### 웹에서 스타일이 적용되지 않을 때
1. `global.css` import 확인
2. 브라우저 캐시 클리어
3. `app/_layout.tsx`에서 CSS import 확인

