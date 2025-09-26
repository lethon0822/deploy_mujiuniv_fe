// 보여줄 타입과 색상(원하는 대로 추가/수정 가능)
export const TYPE_ORDER = [
  "수강신청",
  "휴학신청",
  "휴직신청",
  "복학신청",
  "자퇴신청",
  "성적조회",
  "수강정정",
  "강의개설",
];

export const TYPE_META = {
  수강신청: { color: "#BED9F4" }, // 스카이블루
  휴학신청: { color: "#FFD3DD" }, // 코튼캔디 : 핑크
  휴직신청: { color: "#FFE7AB" }, // 버터 : 옐로우
  복학신청: { color: "#CFDF8D" }, // 세이지 : 그린
  자퇴신청: { color: "#CFD1D4" }, // gray
  성적조회: { color: "#EDE4F8" }, // 라일락
  수강정정: { color: "#f4cfc7" }, // 우드
  강의개설: { color: "#FFCB7C" }, // orange
};
