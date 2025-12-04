# 웹 Tailwind CSS 문제 해결

## 문제
- React Native Web은 `className` prop을 기본 지원하지 않음
- NativeWind를 제거했지만 코드에 `className`이 남아있음
- 웹 빌드 실패

## 해결 방법

웹에서는 `className` 대신:
1. **기존 StyleSheet 사용** (가장 안전)
2. **웹 전용 컴포넌트 생성** (복잡함)
3. **react-native-web의 className 지원 활성화** (설정 필요)

## 권장: 웹에서는 기존 방식 유지

웹 빌드가 작동하도록 하려면:
- 웹에서는 `className` 제거
- 기존 `StyleSheet` 방식 사용
- 또는 웹 전용으로만 Tailwind CSS 클래스를 HTML 요소에 적용

