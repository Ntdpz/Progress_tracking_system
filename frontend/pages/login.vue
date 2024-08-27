<template>
  <v-app>
    <v-main>
      <v-container fluid fill-height class="">
        <v-layout align-center justify-center>
          <v-flex style="text-align: -webkit-center">
            <v-card class="elevation-12" max-width="1000px">
              <v-row>
                <v-col class="main-bg">
                  <v-img
                    lazy-src=""
                    max-height="500"
                    max-width="500"
                    src="/logomain.jpg"
                  ></v-img>
                </v-col>
                <v-col style="margin-top: 50px">
                  <v-container>
                    <v-toolbar style="display: initial">
                      <v-toolbar-title
                        class="font-weight-bold ml-2 mt-3"
                        style="
                          font-size: 30px;
                          text-align: center;
                          font-family: sans-serif;
                          align-self: center;
                          justify-self: center;
                        "
                        >Progress Tracking</v-toolbar-title
                      >
                    </v-toolbar>
                    <v-card-text>
                      <v-row>
                        <v-col class="ma-0 pa-0">
                          <v-card-subtitle
                            style="
                              text-align: left;
                              font-weight: bold;
                              color: black;
                            "
                            >รหัสพนักงาน</v-card-subtitle
                          >
                        </v-col>
                      </v-row>
                      <v-form @submit.prevent="handleLogin" ref="form">
                        <v-text-field
                          class="mb-2"
                          prepend-inner-icon="mdi-account-outline"
                          placeholder="กรุณาใส่รหัสพนักงานของคุณ"
                          v-model="form.user_id"
                          type="text"
                          outlined
                          dense
                          hide-details="auto"
                          :rules="rules"
                          style="border-radius: 15px"
                        >
                        </v-text-field>
                        <v-row>
                          <v-col class="ma-0 pa-0">
                            <v-card-subtitle
                              style="
                                text-align: left;
                                font-weight: bold;
                                color: black;
                              "
                              >รหัสผ่าน</v-card-subtitle
                            >
                          </v-col>
                        </v-row>
                        <v-text-field
                          class="mb-2"
                          placeholder="กรุณาใส่รหัสผ่านให้ถูกต้อง"
                          prepend-inner-icon="mdi-lock-outline"
                          v-model="form.user_password"
                          type="password"
                          outlined
                          dense
                          hide-details="auto"
                          :rules="rules"
                          style="border-radius: 15px"
                        >
                        </v-text-field>
                        <br />
                        <!-- <v-checkbox
                    v-model="checkbox"
                    class="mt-0"
                    :label="`Remember Me`"
                  ></v-checkbox> -->
                        <v-btn
                          class="mb-8"
                          style="color: white; font-weight: bold; height: 43px"
                          color="#009933"
                          type="submit"
                          rounded
                          block
                          >เข้าสู่ระบบ</v-btn
                        >
                      </v-form>
                    </v-card-text>
                  </v-container>
                </v-col>
              </v-row>
            </v-card>

            <!-- dialog -->
            <div height="600px">
              <v-dialog
                v-model="dialog"
                persistent
                max-width="400px"
                max-height="600px"
              >
                <v-card class="pt-4 pb-4">
                  <v-card-title
                    class="pt-4 pb-4"
                    style="
                      place-content: center;
                      font-size: 24px;
                      font-weight: bold;
                    "
                  >
                    บัญชีของคุณถูกล็อก
                  </v-card-title>
                  <div style="text-align-last: center">
                    <v-icon class="pb-8" style="color: red; font-size: 700%"
                      >mdi-alert-circle
                    </v-icon>
                  </div>
                  <v-card-text>
                    เนื่องจากการกรอกข้อมูลผิดมากกว่า 3 ครั้ง บัญชีจึงล็อก
                    กรุณาติดต่อแอดมินเพื่อทำการเปลี่ยนข้อมูล</v-card-text
                  >
                  <v-card-actions class="pb-4">
                    <v-btn
                      style="place-content: center; color: white"
                      color="red"
                      @click="dialog = false"
                      width="100%"
                    >
                      ติดต่อแอดมิน
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </div>
            <div height="600px">
              <v-dialog
                v-model="dialogWrong"
                persistent
                max-width="400px"
                max-height="600px"
              >
                <v-card class="pt-4 pb-4">
                  <v-card-title
                    class="pt-4 pb-4"
                    style="
                      place-content: center;
                      font-size: 24px;
                      font-weight: bold;
                    "
                  >
                    <h4>
                      คุณกรอกข้อมูลไม่ถูกต้อง <br />
                      กรุณากรอกใหม่อีกครั้ง
                    </h4>
                  </v-card-title>
                  <div style="text-align-last: center">
                    <v-icon class="pb-8" style="color: red; font-size: 700%"
                      >mdi-alert-circle
                    </v-icon>
                  </div>
                  <!-- <v-card-text>
                    เนื่องจากการกรอกข้อมูลผิดมากกว่า 3 ครั้ง บัญชีจึงล็อก
                    กรุณาติดต่อแอดมินเพื่อทำการเปลี่ยนข้อมูล</v-card-text
                  > -->
                  <v-card-actions class="pb-4">
                    <v-btn
                      style="place-content: center; color: white"
                      color="red"
                      @click="dialogWrong = false"
                      width="100%"
                    >
                      ตกลง
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </div>
          </v-flex>
        </v-layout>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Swal from 'sweetalert2';

export default {
  data() {
    return {
      form: {
        user_id: "",
        user_password: "",
      },
      checkbox: false,
      dialog: false,
      dialogWrong: false,
      countLogin: 0,

      rules: [(value) => !!value || "กรุณากรอกข้อมูลให้ครบถ้วน."],
    };
  },
  methods: {
    async handleLogin() {
      try {
        await this.$auth.loginWith("local", { data: this.form });
        this.$router.push("/"); // Redirect to a protected route
      } catch (error) {
        console.error(error);

        Swal.fire({
          icon: 'error',
          title: 'The information is incorrect.',
          text: 'Please check your employee ID and password.',
          confirmButtonText: 'OK',
           confirmButtonColor: "#009933",
        });
      }
    },
  },
};
</script>


<style scoped>
* {
  font-family: "Lato", sans-serif;
}
.main-bg {
  background-image: linear-gradient(to right, #08ff1c, #192d70);
}
</style>
