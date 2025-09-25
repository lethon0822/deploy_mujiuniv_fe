import { createRouter, createWebHistory } from "vue-router";


import { useUserStore } from "@/stores/account";
import { FreeMode } from "swiper/modules";

const professor = "/pro";
const student = "/ent";
const staff = "/aff"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [

    // 로그인 관련 공개 라우트
    { path: "/login",   component: () => import("@/views/login/LoginPage.vue") },
    { path: "/id",      component: () => import("@/views/login/Id.vue") },
    { path: "/renewal", component: () => import("@/views/login/RenewalPwd.vue") },

    // 홈 (보호 라우트)
    {
      path: "/",
      component: () => import("@/views/Home.vue"),
      children: [
        { path: "", redirect: "/main" }, // 기본 진입시 공지로
        //메인화면
        {
          path: "/main",
          component: () => import("@/views/Main.vue"),
        },

        // components/common
        { path: "/notice", component: () => import("@/components/common/Notices.vue") },
        { path: "/notice/:id", component: () => import("@/components/common/Notices.vue") },

        // course
        { path: `${professor}/attendance`, component: () => import("@/components/course/Attendance.vue") },
        { path: `${professor}/enrollmentgrade`, component: () => import("@/components/course/EnrollmentGrade.vue") },
        { path: `${professor}/course/registration`, name: "RegistrationCourse", component: () => import("@/components/course/RegistrationCourse.vue") },
        { path: `${professor}/course/registration/:id`, name: "ModifyCourse", props: true, component: () => import("@/components/course/RegistrationCourse.vue") },


        // views
        { path: "/application", component: () => import("@/views/Application.vue") },
        { path: "/course/history", component: () => import("@/views/course/CourseList.vue") },
        { path: `${professor}/course/management`, component: () => import("@/views/course/ProfessorCourseManagement.vue") },
        { path: `${professor}/course/state`, component: () => import("@/views/course/ProfessorCourseStatus.vue") },
        { path: `${professor}/survey/check`, component: () => import("@/views/course/SurveyResultCheck.vue") },

        // enrollment
        { path: `${student}/enrollment`, component: () => import("@/views/enrollment/Enrollment.vue") },

        //graduation
        { path: `${student}/graduation`, component: () => import("@/views/graduation/Graduation.vue") },


        // management
        { path: `${staff}/schedule`, component: () => import("@/views/management/SchedulePage.vue") },
        { path: `${staff}/deptmanage`, component: () => import("@/views/management/DepartmentManage.vue") },

        // staff
        { path: `${staff}/member`, component: () => import("@/views/staff/MemberListPage.vue") },
        { path: `${staff}/approval`, component: () => import("@/views/staff/ManageApproval.vue") },
        { path: `${staff}/approval/course`, component: () => import("@/views/staff/CourseApproval.vue") },

        // profile (학생)
        { path: `${student}/course/survey`, name: "CourseEvaluation", component: () => import("@/views/profile/CourseEvaluation.vue") },
        { path: `${student}/grade/permanent`, component: () => import("@/views/profile/GetAllGrades.vue") },
        { path: "/renewal/privacy", component: () => import("@/views/profile/RenewalPrivacy.vue") },
        { path: `${student}/grade/current`, component: () => import("@/views/profile/StudentTranscriptHistory.vue") },
        { path: "/profile", component: () => import("@/views/profile/Profile.vue") },
      ],

    },
  ],
});

// 공개 라우트
const openPaths = ["/login", "/id", "/renewal"];

// 동시 네비게이션에서 check 중복 실행 방지
let checkingPromise = null;

router.beforeEach(async (to, from) => {
  const userStore = useUserStore();

  if (openPaths.includes(to.path) && userStore.state.isSigned) {
    await checkingPromise;
    checkingPromise = null;
    return {path: '/'}
  }else if(!userStore.state.isSigned && !openPaths.includes(to.path)){
    return {path:'/login'}
  }

  if (
    to.path.startsWith(professor) &&
    userStore.state.signedUser.userRole !== "professor"
  ) {
    return { path: from.path };
  } else if (
    to.path.startsWith(student) &&
    userStore.state.signedUser.userRole !== "student"
  ) {
    return { path: from.path };
  } else if (
    to.path.startsWith(staff) &&
    userStore.state.signedUser.userRole !== "staff"
  )
    return;
});

export default router;