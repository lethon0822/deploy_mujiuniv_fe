import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/account";

const professor = "/pro";
const student = "/ent";
const staff = "/aff";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 로그인 관련 공개 라우트
    { path: "/login", component: () => import("@/views/login/LoginPage.vue") },
    { path: "/id", component: () => import("@/views/login/Id.vue") },
    {
      path: "/renewal",
      component: () => import("@/views/login/RenewalPwd.vue"),
    },

    // 홈 (보호 라우트)
    {
      path: "/",
      component: () => import("@/views/Home.vue"),
      children: [
        // 🔧 수정: 기본 경로를 공지사항으로 리다이렉트
        { path: "", redirect: "/notice" },

        // components/common
        {
          path: "/notice",
          component: () => import("@/components/common/Notices.vue"),
        },
        {
          path: "/notice/:id",
          component: () => import("@/components/common/Notices.vue"),
        },

        // course
        {
          path: `${professor}/attendance`,
          component: () => import("@/components/course/Attendance.vue"),
        },
        {
          path: `${professor}/enrollmentgrade`,
          component: () => import("@/components/course/EnrollmentGrade.vue"),
        },
        {
          path: `${professor}/course/registration`,
          name: "RegistrationCourse",
          component: () => import("@/components/course/RegistrationCourse.vue"),
        },
        {
          path: `${professor}/course/registration/:id`,
          name: "ModifyCourse",
          props: true,
          component: () => import("@/components/course/RegistrationCourse.vue"),
        },

        // views
        {
          path: "/application",
          component: () => import("@/views/Application.vue"),
        },
        {
          path: "/course/history",
          component: () => import("@/views/course/CourseList.vue"),
        },
        {
          path: `${professor}/course/management`,
          component: () =>
            import("@/views/course/ProfessorCourseManagement.vue"),
        },
        {
          path: `${professor}/course/state`,
          component: () => import("@/views/course/ProfessorCourseStatus.vue"),
        },
        {
          path: `${professor}/survey/check`,
          component: () => import("@/views/course/SurveyResultCheck.vue"),
        },

        // enrollment
        {
          path: `${student}/enrollment`,
          component: () => import("@/views/enrollment/Enrollment.vue"),
        },

        //graduation
        {
          path: `${student}/graduation`,
          component: () => import("@/views/graduation/Graduation.vue"),
        },

        // management
        {
          path: `${staff}/schedule`,
          component: () => import("@/views/management/SchedulePage.vue"),
        },
        {
          path: `${staff}/deptmanage`,
          component: () => import("@/views/management/DepartmentManage.vue"),
        },

        // staff
        {
          path: `${staff}/member`,
          component: () => import("@/views/staff/MemberListPage.vue"),
        },
        {
          path: `${staff}/approval`,
          component: () => import("@/views/staff/ManageApproval.vue"),
        },
        {
          path: `${staff}/approval/course`,
          component: () => import("@/views/staff/CourseApproval.vue"),
        },

        // profile (학생)
        {
          path: `${student}/course/survey`,
          name: "CourseEvaluation",
          component: () => import("@/views/profile/CourseEvaluation.vue"),
        },
        {
          path: `${student}/grade/permanent`,
          component: () => import("@/views/profile/GetAllGrades.vue"),
        },
        {
          path: "/renewal/privacy",
          component: () => import("@/views/profile/RenewalPrivacy.vue"),
        },
        {
          path: `${student}/grade/current`,
          component: () =>
            import("@/views/profile/StudentTranscriptHistory.vue"),
        },
        {
          path: "/profile",
          component: () => import("@/views/profile/Profile.vue"),
        },
      ],
    },
  ],
});

// 공개 라우트 (로그인 불필요)
const openPaths = ["/login", "/id", "/renewal"];

const professorOnlyPaths = [
  `${professor}/attendance`,
  `${professor}/course/management`,
  `${professor}/course/state`,
  `${professor}/survey/check`,
  `${professor}/enrollmentgrade`,
  `${professor}/course/registration`,
];

const studentOnlyPaths = [
  `${student}/course/survey`,
  `${student}/enrollment`,
  `${student}/graduation`,
  `${student}/grade/permanent`,
  `${student}/grade/current`,
];

const staffOnlyPaths = [
  `${staff}/member`,
  `${staff}/approval`,
  `${staff}/approval/course`,
  `${staff}/schedule`,
  `${staff}/deptmanage`,
];

let checkingPromise = null;

router.beforeEach(async (to, from) => {
  const userStore = useUserStore();

  const PROFESSOR = "professor";
  const STUDENT = "student";
  const STAFF = "staff";

  const isPublicPath = openPaths.includes(to.path);
  const isSignedIn = userStore.state.isSigned;
  const userRole = userStore.state.signedUser?.userRole;

  if (isPublicPath && isSignedIn) {
    if (checkingPromise) {
      await checkingPromise;
      checkingPromise = null;
    }
    return { path: "/notice" }; // 공지사항으로 리다이렉트
  }

  if (!isPublicPath && !isSignedIn) {
    return { path: "/login" };
  }

  //역할별 접근 권한
  if (isSignedIn && userRole) {
    // 교수 전용
    if (
      professorOnlyPaths.some((path) => to.path.startsWith(path)) &&
      userRole !== PROFESSOR
    ) {
      console.warn(`교수 전용 경로 접근 거부: ${to.path}`);
      return { path: from.path || "/notice" };
    }

    // 학생 전용
    if (
      studentOnlyPaths.some((path) => to.path.startsWith(path)) &&
      userRole !== STUDENT
    ) {
      console.warn(`학생 전용 경로 접근 거부: ${to.path}`);
      return { path: from.path || "/notice" };
    }

    // 교직원
    if (
      staffOnlyPaths.some((path) => to.path.startsWith(path)) &&
      userRole !== STAFF
    ) {
      console.warn(`교직원 전용 경로 접근 거부: ${to.path}`);
      return { path: from.path || "/notice" };
    }
  }

  return true;
});

export default router;
