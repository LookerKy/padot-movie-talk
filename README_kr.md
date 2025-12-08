# 🐛 송충이 어워즈 (Padot Movie Awards)

**송충이 어워즈**는 Next.js 15로 구축된 시각적으로 풍부하고 인터랙티브한 영화 리뷰 아카이브 애플리케이션입니다. 사용자는 상세한 리뷰, 평점, 그리고 개인화된 그래픽 인터페이스를 통해 자신의 영화 감상 여정을 기록할 수 있습니다.

![프로젝트 미리보기](/placeholder-poster.png) *<!-- 실제 스크린샷이 있다면 교체해주세요 -->*

## ✨ 주요 기능

### 🎬 리뷰 관리
-   **리치 텍스트 에디터**: 커스텀 **글래스모피즘(Glassmorphism) Tiptap 에디터**를 사용하여 서식이 포함된 상세 리뷰를 작성할 수 있습니다.
-   **별점 및 배지**: 0.0에서 5.0까지 영화를 평가하고, 특별한 **"돇슐랭" (필수 관람)** 배지를 부여할 수 있습니다.
-   **한줄평**: 각 영화에 대해 임팩트 있는 한 줄 요약을 추가할 수 있습니다.
-   **태그 시스템**: 다채로운 커스텀 태그(예: "공포", "코미디", "인생작")로 영화를 체계적으로 정리할 수 있습니다.

### 🎨 몰입감 있는 UI/UX
-   **글래스모피즘 디자인**: 카드, 툴바, 에디터 전반에 적용된 프리미엄 반투명 디자인.
-   **다이내믹 뷰**:
    -   **그리드 뷰**: 포스터 중심의 갤러리 뷰.
    -   **리스트 뷰**: **별점별**로 그룹화되고 접을 수 있는 헤더가 적용된 정리된 뷰.
-   **인터랙티브 요소**: 부드러운 호버 효과 (포스터 블러), 애니메이션 전환, 커스텀 커서.
-   **다크 모드**: 영화 관람 경험에 최적화된 다크 테마.

### 🔍 강력한 필터링
-   **멀티 태그 검색**: 여러 태그를 선택하여 리뷰를 필터링할 수 있습니다 (OR 로직).
-   **평점 필터**: 높은 평점의 영화를 빠르게 찾을 수 있습니다.
-   **무한 스크롤**: 대량의 리뷰 컬렉션을 끊김 없이 탐색할 수 있습니다.

## 🛠️ 기술 스택 (Tech Stack)

-   **프레임워크**: [Next.js 15 (App Router)](https://nextjs.org/)
-   **언어**: [TypeScript](https://www.typescriptlang.org/)
-   **데이터베이스**: [PostgreSQL](https://www.postgresql.org/) & [Prisma ORM](https://www.prisma.io/)
-   **스타일링**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn/UI](https://ui.shadcn.com/)
-   **상태 관리**: [Zustand](https://github.com/pmndrs/zustand)
-   **에디터**: [Tiptap](https://tiptap.dev/)
-   **아이콘**: [Lucide React](https://lucide.dev/)
-   **인증**: [NextAuth.js](https://next-auth.js.org/) (예정/진행 중)

## 🚀 시작하기 (Getting Started)

### 필수 요구사항
-   Node.js 18+
-   PostgreSQL 데이터베이스

### 설치 방법

1.  **저장소 복제 (Clone)**
    ```bash
    git clone https://github.com/LookerKy/padot-movie-talk.git
    cd padot-movie-talk
    ```

2.  **의존성 설치**
    ```bash
    npm install
    # 또는
    yarn install
    ```

3.  **환경 변수 설정**
    루트 디렉토리에 `.env` 파일을 생성하세요:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/padot_movie_awards"
    NEXTAUTH_SECRET="your-secret-key"
    NEXTAUTH_URL="http://localhost:3000"
    ```

4.  **데이터베이스 설정**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **개발 서버 실행**
    ```bash
    npm run dev
    ```

    [http://localhost:3000](http://localhost:3000)을 열어 앱을 확인하세요.

## 📂 프로젝트 구조

```bash
├── app/                  # Next.js App Router
│   ├── (main)/           # 퍼블릭 레이아웃 및 페이지
│   ├── actions/          # 서버 액션 (백엔드 로직)
│   └── api/              # API 라우트
├── components/           # React 컴포넌트
│   ├── reviews/          # 리뷰 기능 관련 컴포넌트
│   ├── movies/           # 영화 카드 및 리스트 아이템
│   ├── editor/           # Tiptap 에디터 설정
│   └── ui/               # 재사용 가능한 UI 컴포넌트 (Shadcn)
├── lib/                  # 유틸리티, DB 클라이언트, 인증 설정
├── prisma/               # 데이터베이스 스키마
└── store/                # 전역 상태 관리 (Zustand)
```

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.
