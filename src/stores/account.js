// src/stores/account.js
import { reactive } from "vue";
import { defineStore } from "pinia";
import router from '@/router'

export const useUserStore = defineStore(
  "authentication", 
  () => {
      const state = reactive({            
          signedUser: {
            userName: "", 
            userId: 0, 
            loginId: "",
            userRole: "", 
            semesterId: 0, 
            deptName: "",
          },            
          isSigned: false
      });

        // reactive 객체를 유지한 채로 값 덮어쓰기
        const setSignedUser = (signedUser) => {
        state.isSigned = true;
        Object.assign(state.signedUser, signedUser); 
    };

      const setSigndUserPic = pic => {
          state.signedUser.pic = pic;
      }

      // null 대입 대신 초기값으로 reset
      const signOut = async () => {
        console.log('signOut 처리');
        state.isSigned = false;
        Object.assign(state.signedUser, {
          userName: "", 
          userId: 0, 
          loginId: "",
          userRole: "", 
          semesterId: 0, 
          deptName: "",
          pic: null
        });
        await router.push('/login');
    };

    return { state, setSignedUser, setSigndUserPic, signOut };
  }, 
  { persist: true }
)