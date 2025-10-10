/**
 * 강의를 학과별 오름차순으로 정렬하기 위해 사용하는 함수 
 * @param {string} time - 정렬할 배열(강의 목록)
 */ 
export const changeCodeToTime = (code) =>{
      let str = code;
      let splitStr = [...str];
      let day;
      let time;

      switch (splitStr[0]) {
        case "A": day = "월"
        break;
        case "B": day = "화"
        break;
        case "C": day = "수"
        break;
        case "D": day = "목"
        break;
        case "E": day = "금"
        break;
        default: day = "오류"
          break;
      }
      switch (splitStr[1]) {
        case "1": time = "09:00 ~ 10:20"
        break;
        case "2": time = "10:30 ~ 11:50"
        break;
        case "3": time = "12:00 ~ 13:20"
        break;
        case "4": time = "13:30 ~ 14:50"
        break;
        case "5": time = "15:00 ~ 16:20"
        break;
        case "6": time = "16:30 ~ 17:50"
        break;
        case "7": time = "18:00 ~ 19:20"
        break;
        default: time = "오류"
          break;
      }
      const courseTime = day+" "+time
      return courseTime;
}

/**
 * 강의를 학과별 오름차순으로 정렬하기 위해 사용하는 함수 
 * @param {Array<object>} arr - 정렬할 배열(강의 목록)
 */ 
export const sortArrayByDeptName = (courseList) =>
  courseList.toSorted((a, b) => {
    /*교양학부라면 가장 뒤에 정렬*/
    if(a.deptName === "교양학부" && b.deptName !== "교양학부") return 1;
    if(b.deptName === "교양학부" && a.deptName !== "교양학부") return -1;
    return a.deptName.localeCompare(b.deptName);
  })
  

/**
 * 강의를 강의명별 오름차순으로 정렬하기 위해 사용하는 함수 
 * @param {Array<object>} arr - 정렬할 배열(강의 목록)
 */ 
export const sortArrayByTitle = (courseList) =>
  courseList.toSorted((a, b) => a.title.localeCompare(b.title));