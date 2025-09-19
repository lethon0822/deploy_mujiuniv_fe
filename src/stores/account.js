// src/stores/account.js
import { reactive } from "vue";
import { defineStore } from "pinia";

export const useAccountStore = defineStore("account", () => {
  const state = reactive({
    checked: false,
    loggedIn: false,
  });

  const setChecked = (val) => {
    state.checked = !!val;
  };

  const setLoggedIn = (val) => {
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