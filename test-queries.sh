#!/bin/bash

echo "=== LostLink Backend API 테스트 ==="
echo "Backend URL: http://localhost:5001"
echo "시작 시간: $(date)"
echo "=================================="

# 1. 서버 상태 확인
echo -e "\n🔍 1. 서버 상태 확인"
response=$(curl -s http://localhost:5001/test)
if [ $? -eq 0 ]; then
    echo "✅ 서버 연결 성공"
    echo "$response" | jq '.message' 2>/dev/null || echo "$response"
else
    echo "❌ 서버 연결 실패"
    exit 1
fi

# 2. 기본 아이템 조회
echo -e "\n📋 2. 기본 아이템 조회"
curl -w "응답 시간: %{time_total}s\n" -s http://localhost:5001/items | jq '.pagination' 2>/dev/null

# 3. 페이지네이션 테스트
echo -e "\n📄 3. 페이지네이션 테스트"
echo "페이지 1, 5개 제한:"
curl -s "http://localhost:5001/items?page=1&limit=5" | jq '.pagination' 2>/dev/null

# 4. 텍스트 검색 테스트
echo -e "\n🔎 4. 텍스트 검색 테스트"
echo "검색어: 'frog'"
curl -w "검색 시간: %{time_total}s\n" -s "http://localhost:5001/items?q=frog" | jq '.pagination' 2>/dev/null

# 5. 위치 필터 테스트
echo -e "\n📍 5. 위치 필터 테스트"
echo "위치: 'Library'"
curl -s "http://localhost:5001/items?location=Library" | jq '.pagination' 2>/dev/null

# 6. 복합 검색 테스트
echo -e "\n🔍+📍 6. 복합 검색 테스트"
echo "검색어: 'wallet' + 위치: 'Library'"
curl -s "http://localhost:5001/items?q=wallet&location=Library" | jq '.pagination' 2>/dev/null

# 7. 성능 테스트 (10회 반복)
echo -e "\n⚡ 7. 성능 테스트 (10회 반복)"
total_time=0
for i in {1..10}; do
    time=$(curl -w "%{time_total}" -s http://localhost:5001/items?limit=20 -o /dev/null)
    echo "요청 $i: ${time}s"
    total_time=$(echo "$total_time + $time" | bc -l 2>/dev/null || echo "$total_time")
done

if command -v bc &> /dev/null; then
    avg_time=$(echo "scale=3; $total_time / 10" | bc)
    echo "평균 응답 시간: ${avg_time}s"
fi

# 8. 다양한 검색어 테스트
echo -e "\n🎯 8. 다양한 검색어 테스트"
search_terms=("wallet" "phone" "keys" "laptop" "book")
for term in "${search_terms[@]}"; do
    echo -n "검색어 '$term': "
    curl -w "%{time_total}s\n" -s "http://localhost:5001/items?q=$term" -o /dev/null
done

# 9. 에러 케이스 테스트
echo -e "\n❌ 9. 에러 케이스 테스트"
echo "잘못된 페이지 번호 (page=0):"
curl -s "http://localhost:5001/items?page=0" | jq '.pagination.page' 2>/dev/null

echo "매우 큰 limit 값 (limit=1000):"
curl -s "http://localhost:5001/items?limit=1000" | jq '.pagination.limit' 2>/dev/null

echo -e "\n=================================="
echo "테스트 완료: $(date)"
echo "==================================" 