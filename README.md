# web-snack-game

`web-snack-game`은 간단한 게임 모음 프로젝트!  
게임을 추가할 예정입니다.

## 포함된 게임

- **We Are One!**
  - 위치: `makeexo/makeexo.html`
  - 설명: 8x8 보드에서 `E`, `X`, `O` 블록을 쌓아 색상과 글자 조건에 맞는 매치를 만들어 점수를 올리는 퍼즐 게임입니다.
  - 매치: 동일 색상 서로 다른 글자 3종류, 또는 동일 글자 서로 다른 색상 3종류 이상
  - 매치할 때마다 소리가 재생됩니다.

- **Guess 시리즈**
  - 위치: `guess/angle.html`, `guess/length.html`, `guess/color.html`, `guess/note.html`
  - 설명: 정답과의 차이를 알려주는 추측형 문제 게임 4종입니다.
    - `angle.html` — 기준선을 보고 각도를 맞히기
    - `length.html` — 기준선을 보고 길이를 맞히기
    - `color.html` — 보여준 색의 RGB 값을 맞히기
    - `note.html` — 들려주는 음의 이름을 맞히기 (3옥타브 ~ 5옥타브)
  - 공통 기능: 다시하기, 메인으로 이동 버튼, 정답과 차이를 표시하는 피드백
