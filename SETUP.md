# 블로그 설정 가이드

## 1단계: Supabase 프로젝트 만들기

1. https://supabase.com 접속
2. "Start your project" 클릭
3. GitHub로 로그인
4. "New project" 클릭
5. Project name: `my-blog`
6. Database Password: 비밀번호 입력 (잊지 마세요!)
7. Region: Southeast Asia (Singapore) 선택
8. "Create new project" 클릭

## 2단계: 데이터베이스 테이블 만들기

1. Supabase Dashboard 왼쪽 메뉴에서 "SQL Editor" 클릭
2. "New query" 클릭
3. `supabase-schema.sql` 파일의 내용을 복사하여 붙여넣기
4. "Run" 버튼 클릭

## 3단계: 관리자 계정 만들기

1. Supabase Dashboard 왼쪽 메뉴에서 "Authentication" > "Users" 클릭
2. "Add user" 클릭
3. "Create new user" 선택
4. Email과 Password 입력
5. "Create user" 클릭

그 후 SQL Editor에서 다음을 실행하세요:
```sql
INSERT INTO profiles (id, email, name, role) 
VALUES ('위에서 만든 사용자의 UUID', '이메일', 'Admin', 'admin');
```

## 4단계: 환경 변수 설정

1. Supabase Dashboard 왼쪽 메뉴에서 "Settings" > "API" 클릭
2. "Project URL" 복사
3. "anon public" 키 복사

그 후 `.env.local` 파일을 수정하세요:
```
NEXT_PUBLIC_SUPABASE_URL=복사한 Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=복사한 anon public 키
NEXT_PUBLIC_BLOG_TITLE=내 블로그
NEXT_PUBLIC_BLOG_DESCRIPTION=개인 블로그
```

## 5단계: 로컬에서 실행

```bash
cd my-blog
npm run dev
```

http://localhost:3000 접속

## 6단계: 로그인

http://localhost:3000/login 접속
- Email: 3단계에서 만든 이메일
- Password: 3단계에서 만든 비밀번호

## 7단계: 배포 (Cloudflare Pages)

### GitHub에 푸시
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/본인아이디/my-blog.git
git push -u origin main
```

### Cloudflare Pages 연결
1. https://dash.cloudflare.com 접속
2. "Workers & Pages" 클릭
3. "Create application" 클릭
4. "Pages" 탭 선택
5. "Connect to Git" 클릭
6. GitHub 연결
7. `my-blog` 레포지토리 선택
8. Build settings:
   - Framework preset: Next.js
   - Build command: `npm run build`
   - Build output directory: `.next`
9. Environment variables 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon public 키
   - `NEXT_PUBLIC_BLOG_TITLE`: 블로그 제목
   - `NEXT_PUBLIC_BLOG_DESCRIPTION`: 블로그 설명
10. "Save and Deploy" 클릭

## 완료!

배포가 완료되면 `https://my-blog.pages.dev` 에서 블로그를 확인할 수 있습니다.

## 문제 해결

### CORS 에러
Supabase Dashboard > Settings > API > "Additional settings"에서:
- Site URL: `https://my-blog.pages.dev`
- Redirect URLs: `https://my-blog.pages.dev/**`

### 댓글이 안 보일 때
- Supabase Dashboard > Table Editor > comments 테이블 확인
- status가 'approved'인지 확인

### 글이 안 보일 때
- Supabase Dashboard > Table Editor > posts 테이블 확인
- status가 'published'인지 확인
