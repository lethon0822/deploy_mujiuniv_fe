// src/stores/account.js
import { reactive } from "vue";
import { defineStore } from "pinia";

export const useAccountStore = defineStore("account", () => {
  const state = reactive({
    checked: false,
    loggedIn: false,
  });

  const setChecked = (val) => {
    console.warn("[store] setChecked ->", !!val);
    console.trace(); // ★ 누가 호출했는지 스택 찍힘
    state.checked = !!val;
  };

  const setLoggedIn = (val) => {
    console.warn("[store] setLoggedIn ->", !!val);
    console.trace(); // ★ 여기서 호출 파일/줄 번호 나옴
    state.loggedIn = !!val;
  };

  return { state, setChecked, setLoggedIn };
}, {
  persist: true,
});

export const useUserStore = defineStore("user", {
  state: () => ({
    userName: "", 
    userId: 0, 
    loginId: "",
    userRole: "", 
    semesterId: 0, 
    deptName: "",
  }),
  persist: true,
});


// export const useUserStore = defineStore(
//   "authentication", 
//   () => {
//       const state = reactive({            
//           signedUser: {
//             userName: "", 
//             userId: 0, 
//             loginId: "",
//             userRole: "", 
//             semesterId: 0, 
//             deptName: "",
//             pic: null
//           },            
//           isSigned: false
//       });

//       const setSignedUser = signedUser => {
//           state.isSigned = true;
//           state.signedUser = signedUser                       
//       }

//       const setSigndUserPic = pic => {
//           state.signedUser.pic = pic;
//       }

//       const signOut = async () => {
//           console.log('signOut 처리')
//           state.isSigned = false;
//           state.signedUser = null;            
//           await router.push('/login')
//       }

//       return { state, setSignedUser, setSigndUserPic, signOut };
//   }, 
//   { persist: true }
// )