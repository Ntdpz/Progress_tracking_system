<template>
  <div class="mx-auto pt-10">
    <v-card max-width="1200" outlined class="mx-auto">
      <v-toolbar color="primary" dark>
        <v-app-bar-nav-icon><v-icon>mdi-account</v-icon></v-app-bar-nav-icon>

        <v-toolbar-title>My Profile</v-toolbar-title>
      </v-toolbar>
      <v-row class="mb-6" no-gutters>
        <v-col class="col-12" col="12" xs="12" sm="12" md="3">
          <!-- เอาเส้นออกใส่ border: none; -->
          <v-card
            class="pa-2 mx-auto"
            tile
            outlined
            style="
              border: none;
              height: 200px;
              display: flex;
              justify-content: center;
            "
          >
            <div>
              <v-avatar
                class="mt-6 mx-auto"
                style="width: 150px; height: 150px"
              >
                <!-- แสดงรูป default เมื่อไม่มี base64 -->
                <img
                  v-if="base64 == null || base64 === ''"
                  src="/images/default_user.jpg"
                  alt="User default"
                  style="
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center;
                  "
                />
                <!-- แสดงรูป base64 ถ้ามีค่า -->
                <img
                  v-else
                  :src="base64"
                  alt="User Image"
                  style="
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center;
                  "
                />
              </v-avatar>
              <v-btn
                color="white"
                icon
                style="
                  background-color: #5c3efe;
                  float: right;
                  margin-left: -42px;
                  margin-top: 131px;
                  position: absolute;
                "
              >
                <v-icon @click="$refs.fileInput.click()">mdi-pencil</v-icon>
                <input
                  ref="fileInput"
                  type="file"
                  style="display: none"
                  @change="uploadFile"
                />
              </v-btn>
            </div>
          </v-card>
        </v-col>
        <v-col col="12" xs="12" sm="12" md="9">
          <!-- เอาเส้นออกใส่ border: none; -->
          <v-card
            class="pa-2"
            tile
            outlined
            style="border: none; height: 600px"
          >
            <div class="mt-6 ml-2">
              <!-- form -->
              <v-form @submit.prevent="updateUser" ref="form">
                <v-row
                  class="mr-2"
                  style="margin-bottom: -2%; font-weight: bold; color: black"
                >
                  <v-col class="hidden-xs-only" cols="12" xs="4" sm="4" md="4">
                    คำนำหน้าชื่อ
                  </v-col>
                  <v-col class="hidden-xs-only" cols="12" xs="4" sm="4" md="4">
                    ชื่อจริง
                  </v-col>
                  <v-col
                    class="hidden-xs-only"
                    cols="12"
                    xs="4"
                    sm="4"
                    md="4"
                    style="margin-right: -1%; padding-right: 0%"
                  >
                    นามสกุล
                  </v-col>
                </v-row>

                <v-row
                  class="mr-2"
                  style="margin-bottom: -4%; font-weight: bold; color: black"
                >
                  <v-col
                    class=""
                    cols="12"
                    xs="4"
                    sm="4"
                    md="4"
                    style="margin-right: -1%; padding-right: 1%"
                  >
                    <v-select
                      v-model="name"
                      :items="dataDefault_nametitle"
                      :rules="rules"
                      outlined
                      dense
                      rounded
                      item-text="text"
                      item-value="value"
                    >
                      <template #item="{ item, on }">
                        <v-list-item :value="item.value" v-on="on">
                          <v-list-item-content>
                            <v-list-item-title class="my-bold-item">{{
                              item
                            }}</v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                      </template>
                    </v-select>
                  </v-col>
                  <v-col class="" cols="12" xs="4" sm="4" md="4">
                    <v-text-field
                      v-model="firstname"
                      :rules="rules"
                      dense
                      rounded
                      outlined
                    ></v-text-field>
                  </v-col>
                  <v-col class="" cols="12" xs="4" sm="4" md="4">
                    <v-text-field
                      v-model="user_lastname"
                      :rules="rules"
                      outlined
                      dense
                      rounded
                    ></v-text-field>
                  </v-col>
                </v-row>
                <!-- คั่น -->
                <div class="pa-2"></div>
                <v-row
                  class="mr-2 mt-0"
                  style="margin-bottom: -2%; font-weight: bold; color: black"
                >
                  <v-col class="hidden-xs-only" cols="12" xs="4" sm="4" md="4">
                    รหัสพนักงาน
                  </v-col>
                  <v-col class="hidden-xs-only" cols="12" xs="4" sm="4" md="4">
                    ตำแหน่ง
                  </v-col>
                  <v-col class="hidden-xs-only" cols="12" xs="4" sm="4" md="4">
                    แผนก
                  </v-col>
                </v-row>
                <v-row
                  class="mr-2 mt-0"
                  style="margin-bottom: -4%; font-weight: bold; color: black"
                >
                  <v-col cols="12" xs="4" sm="4" md="4">
                    <v-text-field
                      v-model="user_id"
                      :rules="rules"
                      outlined
                      dense
                      rounded
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" xs="4" sm="4" md="4">
                    <v-text-field
                      v-model="user_position"
                      :rules="rules"
                      outlined
                      dense
                      readonly
                      rounded
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" xs="4" sm="4" md="4">
                    <v-text-field
                      v-model="user_department"
                      :rules="rules"
                      outlined
                      dense
                      readonly
                      rounded
                    ></v-text-field>
                  </v-col>
                </v-row>
                <!-- คั่น -->
                <div class="pa-2"></div>
                <v-row
                  class="mr-2 mt-0"
                  style="margin-bottom: -2%; font-weight: bold; color: black"
                >
                  <v-col class="hidden-xs-only" cols="6" sm="6">
                    อีเมลล์
                  </v-col>
                  <v-col class="hidden-xs-only" cols="6" sm="6">
                    รหัสผ่าน
                  </v-col>
                </v-row>
                <v-row
                  class="mr-2 mt-0"
                  style="margin-bottom: -4%; font-weight: bold; color: black"
                >
                  <v-col cols="6" sm="6">
                    <v-text-field
                      v-model="user_email"
                      :rules="rules"
                      outlined
                      dense
                      rounded
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6" sm="6">
                    <v-text-field
                      :append-icon="show3 ? 'mdi-pencil' : 'mdi-pencil'"
                      :type="show3 ? 'Password' : 'Password'"
                      @click:append="show3 = !show3"
                      v-model="user_password"
                      :rules="rules"
                      outlined
                      dense
                      readonly
                      rounded
                    ></v-text-field>
                  </v-col>
                </v-row>
                <!-- คั่น -->
                <div class="pa-2"></div>
                <v-row
                  class="mr-2 mt-0"
                  style="margin-bottom: -2%; font-weight: bold; color: black"
                >
                  <v-col class="hidden-xs-only" cols="6" sm="6"> สถานะ </v-col>
                  <v-col class="hidden-xs-only" cols="6" sm="6"> บทบาท </v-col>
                </v-row>
                <v-row
                  class="mr-2 mt-0"
                  style="margin-bottom: -4%; font-weight: bold; color: black"
                >
                  <v-col class="" cols="6" sm="6">
                    <v-text-field
                      v-model="user_status"
                      :rules="rules"
                      outlined
                      dense
                      readonly
                      rounded
                    >
                      <template v-slot:prepend-inner>
                        <v-icon v-if="online === true" color="green"
                          >mdi-circle</v-icon
                        >
                        <v-icon v-else color="red">mdi-circle</v-icon>
                      </template>
                    </v-text-field>
                  </v-col>
                  <v-col class="" cols="6" sm="6">
                    <v-text-field
                      v-model="user_role"
                      :rules="rules"
                      outlined
                      dense
                      readonly
                      rounded
                    ></v-text-field>
                  </v-col>
                </v-row>
                <!-- คั่น -->
                <div class="pa-2"></div>
                <v-row
                  class="mr-2 mt-0 mt-lg-6"
                  style="
                    justify-content: right;
                    font-weight: bold;
                    color: black;
                  "
                >
                  <v-btn
                    class="mr-2"
                    elevation="2"
                    color="error"
                    :to="`/`"
                    style="color: white; border-radius: 10px"
                    >ย้อนกลับ
                  </v-btn>
                  <v-btn
                    class="mr-2"
                    elevation="2"
                    color="primary"
                    type="submit"
                    style="color: white; border-radius: 10px"
                    >อัปเดต
                  </v-btn>
                </v-row>
              </v-form>
            </div>
            <!-- dialog password persistent -->
            <v-dialog v-model="show3" max-width="500px" persistent>
              <v-card width="100%" height="100%">
                <v-card-title style="background-color: #5c3efe">
                  <span class="text-h5" style="font-weight: bold; color: white"
                    >เปลี่ยนรหัสผ่าน</span
                  >
                </v-card-title>
                <v-container>
                  <v-col
                    class="mr-2 mt-0 hidden-xs-only"
                    cols="12"
                    sm="12"
                    style="
                      margin-bottom: -2%;
                      font-weight: bold;
                      font-size: 16px;
                    "
                  >
                    รหัสผ่านปัจจุบัน
                  </v-col>
                  <v-col class="mt-0 mb-0 pb-0" cols="12">
                    <v-text-field
                      v-model="o_password"
                      outlined
                      dense
                      label="รหัสผ่านปัจจุบัน"
                      type="password"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    class="mr-2 mt-0 pt-0 hidden-xs-only"
                    cols="12"
                    sm="12"
                    style="margin-bottom: -2%; font-weight: bold"
                  >
                    รหัสผ่านใหม่
                  </v-col>
                  <v-col class="mt-0 mb-0 pb-0" cols="12">
                    <v-text-field
                      v-model="n_password"
                      :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
                      :type="show2 ? 'text' : 'password'"
                      @click:append="show2 = !show2"
                      outlined
                      dense
                      label="รหัสผ่านใหม่"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    class="mr-2 mt-0 pt-0 hidden-xs-only"
                    cols="12"
                    sm="12"
                    style="margin-bottom: -2%; font-weight: bold"
                  >
                    ยืนยันรหัสผ่านใหม่
                  </v-col>
                  <v-col class="mt-0 mb-0 pb-0" cols="12">
                    <v-text-field
                      v-model="cf_password"
                      :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                      :type="show1 ? 'text' : 'password'"
                      @click:append="show1 = !show1"
                      outlined
                      dense
                      label="ยืนยันรหัสผ่านใหม่"
                    ></v-text-field>
                  </v-col>
                  <!--  -->
                  <v-row
                    class="mr-2 mt-0 mb-4 pt-0"
                    style="
                      justify-content: right;
                      font-weight: bold;
                      color: black;
                    "
                  >
                    <v-btn
                      class="mr-2"
                      elevation="2"
                      color="error"
                      @click="(show3 = false), clearChangePassword()"
                      style="color: white; border-radius: 10px"
                      >ยกเลิก
                    </v-btn>
                    <v-btn
                      class="mr-2"
                      elevation="2"
                      color="primary"
                      @click="checkPassword()"
                      style="color: white; border-radius: 10px"
                      >ยืนยัน
                    </v-btn>
                  </v-row>
                </v-container>
              </v-card>
            </v-dialog>
            <dialog-success
              :dialog.sync="dialogSuccess"
              title="อัปเดตเสร็จเรียบร้อยแล้ว"
            />
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script>
export default {
  layout: "admin",
  data() {
    return {
      //auth
      user: this.$auth.user,
      loggedIn: this.$auth.loggedIn,
      rules: [(value) => !!value || "กรุณากรอกข้อมูลให้ครบถ้วน."],
      show1: false,
      show2: false,
      show3: false,
      o_password: "",
      n_password: "",
      cf_password: "",
      id: "",
      user_id: "",
      user_firstname: "",
      user_lastname: "",
      user_status: "",
      user_role: "",
      user_position: "",
      user_password: "",
      user_email: "",
      user_department: "",
      online: "true",
      name: "",
      firstname: "",
      online: true,
      user_pic: "",
      imageUpload: null,
      avatar: null,
      dataDefault: [],
      dataDefault_role_user: [],
      dataDefault_nametitle: [],
      dataDefault_position: [],
      dataDefault_department: [],
      dataDefault_status_user: [],
      dataDefault_issue_type: [],
      dataDefault_issue_priotity: [],
      dialogSuccess: false,
      base64: "",
    };
  },
  mounted() {
    this.titleName();
  },
  created() {
    this.getUser();
    this.getAllDefault();
  },
  methods: {
    async getUser() {
      await this.$axios
        .get("/users/getOne/" + this.$auth.user.id)
        .then((res) => {
          this.id = res.data[0].id;
          this.user_id = res.data[0].user_id;
          this.user_firstname = res.data[0].user_firstname;
          this.user_lastname = res.data[0].user_lastname;
          this.user_status = res.data[0].user_status;
          this.user_role = res.data[0].user_role;
          this.user_position = res.data[0].user_position;
          this.user_password = res.data[0].user_password;
          this.user_email = res.data[0].user_email;
          this.user_department = res.data[0].user_department;
          this.base64 = res.data[0].user_pic;
          this.titleName();
          // console.log(this.user_pic);
        });
    },
    titleName() {
      const regex = /^(Mr\.|Miss\.|นาย|นาง|นางสาว)\s+(.*)$/; // Regular expression to match title and name
      const matches = this.user_firstname.match(regex);
      if (matches) {
        this.name = matches[1];
        this.firstname = matches[2].trim();
      }
    },
    clearChangePassword() {
      this.o_password = "";
      this.n_password = "";
      this.cf_password = "";
    },
    getImageUrl(fileName) {
      return require(`@/static/uploads/DefaultAvatar.jpg`);
    },
    getdefaultImageUrl(fileName) {
      return require(`@/static/uploads/DefaultAvatar.jpg`);
    },
    uploadFile() {
      const input = this.$refs.fileInput;
      this.imageUpload = input.files[0];

      const selectedFile = this.imageUpload;
      if (selectedFile) {
        const reader = new FileReader();
        reader.onload = (event) => {
          this.base64 = event.target.result;
          console.log(this.base64);
        };
        reader.readAsDataURL(selectedFile);
      }

      // try {
      //   // editedItem.photo
      //   this.avatar = URL.createObjectURL(this.imageUpload);
      //   // Do something with the file, for example upload to a server
      // } catch (error) {
      //   console.error(error);
      //   // this.avatar = null;
      // }
    },

    checkPassword() {
      // Check old password
      if (
        this.o_password != "" ||
        this.n_password != "" ||
        this.cf_password != ""
      ) {
        if (this.o_password == this.user_password) {
          if (this.n_password == this.cf_password) {
            this.user_password = this.cf_password;
            alert("Change password successfully!");
            this.clearChangePassword();
            this.show3 = false;
          } else {
            alert("New Password and confirm password are not the same");
          }
        } else {
          alert("Old password is wrong");
        }
      } else {
        alert("Password must not be null.");
      }
    },

    async updateUser() {
      try {
        const requiredFields = [
          "name",
          "user_lastname",
          "user_id",
          "user_position",
          "user_department",
          "user_email",
          "user_password",
          "user_status",
          "user_role",
        ];
        const isFormValid = requiredFields.every((field) => !!this[field]);
        if (!isFormValid) {
          alert("Please fill in all required fields.");
          return;
        }

        await this.$refs.form.validate();
        // const formData = new FormData();
        // formData.append("image", this.imageUpload);
        // formData.append("user_firstname", this.name + " " + this.firstname);
        // formData.append("user_lastname", this.user_lastname);
        // formData.append("user_id", this.user_id);
        // formData.append("user_position", this.user_position);
        // formData.append("user_department", this.user_department);
        // formData.append("user_email", this.user_email);
        // formData.append("user_password", this.user_password);
        // formData.append("user_status", this.user_status);
        // formData.append("user_role", this.user_role);

        const formdatas = {
          user_firstname: this.name + " " + this.firstname,
          user_lastname: this.user_lastname,
          user_id: this.user_id,
          user_position: this.user_position,
          user_department: this.user_department,
          user_email: this.user_email,
          user_password: this.user_password,
          user_status: this.user_status,
          user_role: this.user_role,
          user_pic: this.base64,
        };

        await this.$axios
          .put(`/users/updateUsers/${this.id}`, formdatas)
          .then((response) => {
            // console.log(response);
            // alert("Update success");
            this.dialogSuccess = true;
            // ดัก error รูปภาพโหลดไม่ทัน
            const promise = new Promise((resolve, reject) => {
              this.getUser();
              resolve();
            });
            promise.then(() => {
              setTimeout(() => {
                this.$router.push({ name: "index" });
                window.location.reload();
              }, 2000);
            });
          })
          .catch((err) => {
            console.log(err);
            alert(err);
          });
      } catch (error) {
        alert(error);
      }
    },

    async getAllDefault() {
      await this.$axios.get("/default_settings/getAll").then((data) => {
        this.dataDefault = data.data;
        // console.clear();
        this.dataDefault.forEach((item) => {
          this.dataDefault_role_user.push(item.role_user || null);
          this.dataDefault_nametitle.push(item.nametitle || null);
          this.dataDefault_position.push(item.position || null);
          this.dataDefault_department.push(item.department || null);
          this.dataDefault_status_user.push(item.status_user || null);
          this.dataDefault_issue_type.push(item.issue_type || null);
          this.dataDefault_issue_priotity.push(item.issue_priotity || null);
        });
      });
    },
  },
};
</script>

<style scoped>
* {
  font-family: "Lato", sans-serif;
}

.center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.my-bold-item {
  font-weight: bold;
}

.card {
}
</style>
