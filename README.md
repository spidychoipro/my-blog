# 블로그 관리 시스템

무료로 운영할 수 있는 관리자 블로그 시스템입니다.

## 기능

- 관리자 대시보드
- 글 관리 (작성, 수정, 삭제, 발행/초안)
- 카테고리 관리
- 댓글 시스템 (승인/거부)
- 블로그 설정 커스터마이징
- 다크/라이트 모드
- 검색 기능
- 반응형 디자인

## 기술 스택

- **프론트엔드**: Next.js 14+, TypeScript, Tailwind CSS
- **백엔드**: bkend.ai BaaS (무료)
- **배포**: Vercel (무료)

## 설정 방법

### 1. bkend.ai 프로젝트 생성

1. [bkend.ai](https://bkend.ai)에 접속합니다
2. 회원가입 후 로그인합니다
3. "New Project"를 클릭하여 새 프로젝트를 만듭니다
4. 프로젝트 ID를 복사합니다

### 2. 환경 변수 설정

`.env.local` 파일을 열고 `NEXT_PUBLIC_BKEND_PROJECT_ID`에 프로젝트 ID를 입력합니다:

```
NEXT_PUBLIC_BKEND_PROJECT_ID=your-project-id-here
```

### 3. bkend.ai에서 테이블 생성

bkend.ai 대시보드에서 다음 테이블을 생성합니다:

#### posts 테이블
- title (string, 필수)
- slug (string, 필수)
- body (text, 필수)
- excerpt (text)
- status (enum: draft, published)
- category_id (reference)
- author_id (reference)
- featured_image (string)
- tags (json)
- created_at (datetime)
- updated_at (datetime)

#### categories 테이블
- name (string, 필수)
- slug (string, 필수)
- description (text)
- color (string)
- created_at (datetime)

#### comments 테이블
- post_id (reference, 필수)
- author_name (string, 필수)
- author_email (string, 필수)
- body (text, 필수)
- status (enum: pending, approved, rejected)
- created_at (datetime)

#### settings 테이블
- blog_title (string)
- blog_description (text)
- logo_url (string)
- primary_color (string)
- secondary_color (string)
- footer_text (text)
- posts_per_page (number)
- enable_comments (boolean)
- enable_dark_mode (boolean)

#### users 테이블 (기본 제공)
- email (string)
- name (string)
- role (string)
- created_at (datetime)

### 4. 관리자 계정 생성

1. bkend.ai 대시보드에서 사용자를 생성합니다
2. 역할(role)을 "admin"으로 설정합니다

### 5. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 블로그를 확인할 수 있습니다.

### 6. 관리자 로그인

http://localhost:3000/login 에서 관리자 계정으로 로그인합니다.

## 배포

### Vercel 배포

1. GitHub에 레포지토리를 만듭니다
2. [Vercel](https://vercel.com)에 접속합니다
3. "New Project"를 클릭합니다
4. GitHub 레포지토리를 연결합니다
5. 환경 변수를 설정합니다:
   - `NEXT_PUBLIC_BKEND_API_URL`: https://api.bkend.ai/v1
   - `NEXT_PUBLIC_BKEND_PROJECT_ID`:你的项目ID
   - `NEXT_PUBLIC_BKEND_ENV`: production
6. "Deploy"를 클릭합니다

## 블로그 사용법

### 글 작성

1. 관리자 로그인 후 `/admin/posts`로 이동합니다
2. "새 글 작성" 버튼을 클릭합니다
3. 제목, 본문, 카테고리, 태그를 입력합니다
4. "발행" 버튼으로 글을 게시합니다

### 카테고리 관리

1. `/admin/categories`로 이동합니다
2. "새 카테고리" 버튼으로 카테고리를 추가합니다
3. 이름, 슬러그, 색상을 설정합니다

### 댓글 관리

1. `/admin/comments`로 이동합니다
2. 대기 중인 댓글을 확인합니다
3. "승인" 또는 "거부" 버튼으로 댓글을 관리합니다

### 블로그 설정

1. `/admin/settings`로 이동합니다
2. 블로그 제목, 설명, 색상 등을 변경합니다
3. "설정 저장" 버튼을 클릭합니다

## 문제 해결

### CORS 에러

bkend.ai 대시보드에서 도메인을 등록해야 합니다:
1. 프로젝트 설정으로 이동
2. "Domains" 섹션에서 도메인 추가

### 인증 에러

- 토큰이 만료되었을 수 있습니다
- 로그아웃 후 다시 로그인하세요

### 데이터가 안 보일 때

- 테이블 이름이 올바른지 확인
- 환경 변수가 올바르게 설정되었는지 확인
- 브라우저 개발자 도구에서 네트워크 요청 확인

## 라이선스

MIT License
