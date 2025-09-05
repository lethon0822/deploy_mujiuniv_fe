import { createRouter, createWebHistory } from "vue-router";

import { useAccountStore } from "@/stores/account";
import { check } from "@/services/accountService";


const router = createRouter({
  history: createWebHistory(),
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

        { path: "", redirect: "/notice" }, // 기본 진입시 공지로
        // components/common
        { path: "/notice", component: () => import("@/components/common/Notices.vue") },

        // course
        { path: "/professor/attendance", component: () => import("@/components/course/Attendance.vue") },
        { path: "/enrollmentgrade", component: () => import("@/components/course/EnrollmentGrade.vue") },
        { path: "/professor/course/registration", name: "RegistrationCourse", component: () => import("@/components/course/RegistrationCourse.vue") },
        { path: "/professor/course/registration/:id", name: "ModifyCourse", props: true, component: () => import("@/components/course/RegistrationCourse.vue") },

       

        // views
        { path: "/application", component: () => import("@/views/Application.vue") },
        { path: "/course/history", component: () => import("@/views/course/CourseList.vue") },
        { path: "/professor/course/management", component: () => import("@/views/course/ProfessorCourseManagement.vue") },
        { path: "/professor/course/state", component: () => import("@/views/course/ProfessorCourseStatus.vue") },
        { path: "/professor/survey/check", component: () => import("@/views/course/SurveyResultCheck.vue") },

        // enrollment
        { path: "/enrollment", component: () => import("@/views/enrollment/Enrollment.vue") },

        //graduation
        { path: "/graduation", component: () => import("@/views/graduation/Graduation.vue") },


        // management
        { path: "/schedule", component: () => import("@/views/management/SchedulePage.vue") },
        { path: "/deptmanage", component: () => import("@/views/management/DepartmentManage.vue") },

        // staff
        { path: "/staff", component: () => import("@/views/staff/MemberListPage.vue") },
        { path: "/staff/approval", component: () => import("@/views/staff/ManageApproval.vue") },

        // profile (학생)
        { path: "/course/survey", name: "CourseEvaluation", component: () => import("@/views/profile/CourseEvaluation.vue") },
        { path: "/grade/permanent", component: () => import("@/views/profile/GetAllGrades.vue") },
        { path: "/renewal/privacy", component: () => import("@/views/profile/RenewalPrivacy.vue") },
        { path: "/grade/current", component: () => import("@/views/profile/StudentTranscriptHistory.vue") },
        { path: "/profile", component: () => import("@/views/profile/Profile.vue") },
      ],
    },
  ],
});

// 공개 라우트
const openPaths = new Set(["/login", "/id", "/renewal"]);

// 동시 네비게이션에서 check 중복 실행 방지
let checkingPromise = null;

router.beforeEach(async (to, from, next) => {
  const account = useAccountStore();
  const isOpen = openPaths.has(to.path);

  

  if (!account.state.checked) {
    if (!checkingPromise) {
      checkingPromise = (async () => {
        try {
          const r = await check();              // GET /api/account/check (withCredentials)
          account.setLoggedIn(r?.status === 200);
        } catch {
          account.setLoggedIn(false);
        } finally {
          account.setChecked(true);
        }
      })();
    }
    await checkingPromise;
    checkingPromise = null;
  }

  
  if (!isOpen && !account.state.loggedIn) return next("/login");
  if (isOpen && account.state.loggedIn)   return next("/");
  return next();
});

export default router;