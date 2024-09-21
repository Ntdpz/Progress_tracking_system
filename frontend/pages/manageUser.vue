<template>
  <div class="body">
    <v-row class="mb-3">
      <v-text-title
        class="center ml-4 mr-4 mt-3 mb-1"
        style="font-weight: bold; font-size: 20px"
      >
        จัดการผู้ใช้งานระบบ
      </v-text-title>
      <v-divider
        class="mt-3 mb-1"
        inset
        vertical
        style="background-color: black"
      ></v-divider>
      <!-- <v-card class="card ml-5 mt-2" style="height: 40px; border-radius: 60px">
        <v-card-text class="pa-0">
          <v-text-field
            v-model="searchKeyword"
            prepend-inner-icon="mdi-magnify"
            rounded
            color="primary"
            placeholder="search"
          ></v-text-field>
        </v-card-text>
      </v-card> -->

      <v-col>
        <v-btn
          v-if="check_role == 'Admin'"
          @click="dialog = true"
          class="mr-10"
          elevation="2"
          color="primary"
          right
          absolute
          style="color: white; border-radius: 10px"
        >
          <v-icon left> mdi-plus-circle-outline </v-icon>
          <h4>สร้างผู้ใช้ใหม่</h4>
        </v-btn>
        <v-btn
          v-else
          class="mr-10"
          elevation="2"
          right
          absolute
          style="color: white; border-radius: 10px"
          disabled
        >
          Addmin Only
        </v-btn>
      </v-col>
    </v-row>
    <v-divider></v-divider>
    <!-- class="green lighten-5" -->
    <v-container>
      <v-row no-gutters>
        <!-- -เอาเส้นออกใส่ border: none; -->
        <v-card
          class="pa-2"
          tile
          outlined
          style="
            border: none;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
          "
        >
          <v-col class="mb-6" col="12" sm="12" md="12">
            <!-- หมวดหมู่ หัวข้อใหญ่ -->
            <v-toolbar class="mb-4 pt-0" style="height: 50px">
              <v-tabs
                fixed-tabs
                v-model="tab"
                next-icon="mdi-menu-right-outline"
                prev-icon="mdi-menu-left-outline"
                show-arrows
                style="height: 40px"
              >
                <v-tabs-slider color="primary"></v-tabs-slider>
                <v-tab
                  v-for="item in items"
                  :key="item"
                  style="font-weight: bold; color: black"
                >
                  {{ item }}
                </v-tab>
              </v-tabs>
            </v-toolbar>
            <!-- ตารางย่อยในหัวข้อ -->
            <v-tabs-items v-model="tab">
              <!-- Tab1 All -->
              <v-tab-item>
                <v-card flat>
                  <!-- hide-default-footer ซ่อน footer-->
                  <v-data-table
                    :headers="headers"
                    :items="data"
                    :search="search"
                    class="elevation-1"
                    style="text-align: center"
                  >
                    <template v-slot:item="{ item, index }">
                      <!-- :class="index % 2 === 0 ? 'row-even' : 'row-odd'" -->
                      <tr>
                        <td style="">
                          {{ index + 1 }}
                        </td>
                        <td>
                          <v-avatar>
                            <!-- <img
                              :src="getImageUrl(item.user_pic)"
                              alt="User avatar"
                              class="mx-auto"
                              style="width: 35px; height: 35px"
                            /> -->
                            <v-img
                              :src="item.user_pic"
                              alt="Selected Image"
                              v-if="item.user_pic"
                            />
                          </v-avatar>
                        </td>
                        <td>
                          {{ item.user_firstname }}
                        </td>
                        <td>
                          {{ item.user_lastname }}
                        </td>
                        <td>
                          {{ item.user_id }}
                        </td>
                        <td>
                          {{ item.user_position }}
                        </td>
                        <td>
                          {{ item.user_department }}
                        </td>
                        <td>
                          <v-icon
                            v-if="item.user_status == 'Active'"
                            color="success"
                            small
                            >mdi-circle</v-icon
                          >
                          <v-icon v-else color="error">mdi-circle</v-icon>
                          {{ item.user_status }}
                        </td>
                        <td>
                          {{ item.user_role }}
                        </td>
                        <td>
                          <v-btn
                            @click="(dialog_manage = true), editItem(item)"
                            color="primary"
                            style="color: white; border-radius: 20px"
                            small
                          >
                            {{ manage }}
                          </v-btn>
                        </td>
                      </tr>
                    </template>
                    <template v-slot:no-data>
                      <v-col>No Data</v-col>
                      <v-btn class="mb-4" color="primary" @click="initialize">
                        {{ reset }}
                      </v-btn>
                    </template>
                    <!--  -->
                  </v-data-table>
                  <!--  -->
                </v-card>
              </v-tab-item>
              <!-- Tab2 Developer -->
              <v-tab-item>
                <v-card flat>
                  <!-- hide-default-footer ซ่อน footer-->
                  <v-data-table
                    :headers="headers"
                    :items="data_position_Developer"
                    :search="search"
                    class="elevation-1"
                    style="text-align: center"
                  >
                    <template v-slot:item="{ item, index }">
                      <tr>
                        <td>
                          {{ index + 1 }}
                        </td>
                        <td>
                          <v-avatar>
                            <!-- <img
                              :src="getImageUrl(item.user_pic)"
                              alt="User avatar"
                              class="mx-auto"
                              style="width: 35px; height: 35px"
                            /> -->
                            <v-img
                              :src="item.user_pic"
                              alt="Selected Image"
                              v-if="item.user_pic"
                            />
                          </v-avatar>
                        </td>
                        <td>
                          {{ item.user_firstname }}
                        </td>
                        <td>
                          {{ item.user_lastname }}
                        </td>
                        <td>
                          {{ item.user_id }}
                        </td>
                        <td>
                          {{ item.user_position }}
                        </td>
                        <td>
                          {{ item.user_department }}
                        </td>
                        <td>
                          <v-icon
                            v-if="item.user_status == 'Active'"
                            color="success"
                            small
                            >mdi-circle</v-icon
                          >
                          <v-icon v-else color="error">mdi-circle</v-icon>
                          {{ item.user_status }}
                        </td>
                        <td>
                          {{ item.user_role }}
                        </td>
                        <td>
                          <v-btn
                            @click="(dialog_manage = true), editItem(item)"
                            color="primary"
                            style="color: white; border-radius: 20px"
                            small
                          >
                            {{ manage }}
                          </v-btn>
                        </td>
                      </tr>
                    </template>
                    <template v-slot:no-data>
                      <v-col>No Data</v-col>
                      <v-btn class="mb-4" color="primary" @click="initialize">
                        {{ reset }}
                      </v-btn>
                    </template>
                    <!--  -->
                  </v-data-table>
                  <!--  -->
                </v-card>
              </v-tab-item>
              <!-- Tab3 Implementer -->
              <v-tab-item>
                <v-card flat>
                  <!-- hide-default-footer ซ่อน footer-->
                  <v-data-table
                    :headers="headers"
                    :items="data_position_Implementer"
                    :search="search"
                    class="elevation-1"
                    style="text-align: center"
                  >
                    <template v-slot:item="{ item, index }">
                      <!-- :class="index % 2 === 0 ? 'row-even' : 'row-odd'" -->
                      <tr>
                        <td>
                          {{ index + 1 }}
                        </td>
                        <td>
                          <v-avatar>
                            <!-- <img
                              :src="getImageUrl(item.user_pic)"
                              alt="User avatar"
                              class="mx-auto"
                              style="width: 35px; height: 35px"
                            /> -->
                            <v-img
                              :src="item.user_pic"
                              alt="Selected Image"
                              v-if="item.user_pic"
                            />
                          </v-avatar>
                        </td>
                        <td>
                          {{ item.user_firstname }}
                        </td>
                        <td>
                          {{ item.user_lastname }}
                        </td>
                        <td>
                          {{ item.user_id }}
                        </td>
                        <td>
                          {{ item.user_position }}
                        </td>
                        <td>
                          {{ item.user_department }}
                        </td>
                        <td>
                          <v-icon
                            v-if="item.user_status == 'Active'"
                            color="success"
                            small
                            >mdi-circle</v-icon
                          >
                          <v-icon v-else color="error">mdi-circle</v-icon>
                          {{ item.user_status }}
                        </td>
                        <td>
                          {{ item.user_role }}
                        </td>
                        <td>
                          <v-btn
                            @click="(dialog_manage = true), editItem(item)"
                            color="primary"
                            style="color: white; border-radius: 20px"
                            small
                          >
                            {{ manage }}
                          </v-btn>
                        </td>
                      </tr>
                    </template>
                    <template v-slot:no-data>
                      <v-col>No Data</v-col>
                      <v-btn class="mb-4" color="primary" @click="initialize">
                        {{ reset }}
                      </v-btn>
                    </template>
                    <!--  -->
                  </v-data-table>
                  <!--  -->
                </v-card>
              </v-tab-item>
              <!-- Tab4 Program Management-->
              <v-tab-item>
                <v-card flat>
                  <!-- hide-default-footer ซ่อน footer-->
                  <v-data-table
                    :headers="headers"
                    :items="data_position_ProgramManagement"
                    :search="search"
                    class="elevation-1"
                    style="text-align: center"
                  >
                    <template v-slot:item="{ item, index }">
                      <!-- :class="index % 2 === 0 ? 'row-even' : 'row-odd'" -->
                      <tr>
                        <td>
                          {{ index + 1 }}
                        </td>
                        <td>
                          <v-avatar>
                            <!-- <img
                              :src="getImageUrl(item.user_pic)"
                              alt="User avatar"
                              class="mx-auto"
                              style="width: 35px; height: 35px"
                            /> -->
                            <v-img
                              :src="item.user_pic"
                              alt="Selected Image"
                              v-if="item.user_pic"
                            />
                          </v-avatar>
                        </td>
                        <td>
                          {{ item.user_firstname }}
                        </td>
                        <td>
                          {{ item.user_lastname }}
                        </td>
                        <td>
                          {{ item.user_id }}
                        </td>
                        <td>
                          {{ item.user_position }}
                        </td>
                        <td>
                          {{ item.user_department }}
                        </td>
                        <td>
                          <v-icon
                            v-if="item.user_status == 'Active'"
                            color="success"
                            small
                            >mdi-circle</v-icon
                          >
                          <v-icon v-else color="error">mdi-circle</v-icon>
                          {{ item.user_status }}
                        </td>
                        <td>
                          {{ item.user_role }}
                        </td>
                        <td>
                          <v-btn
                            @click="(dialog_manage = true), editItem(item)"
                            color="primary"
                            small
                            style="color: white; border-radius: 20px"
                          >
                            {{ manage }}
                          </v-btn>
                        </td>
                      </tr>
                    </template>
                    <template v-slot:no-data>
                      <v-col>No Data</v-col>
                      <v-btn class="mb-4" color="primary" @click="initialize">
                        {{ reset }}
                      </v-btn>
                    </template>
                    <!--  -->
                  </v-data-table>
                  <!--  -->
                </v-card>
              </v-tab-item>
              <!-- Tab5 System Analyst-->
              <v-tab-item>
                <v-card flat>
                  <!-- hide-default-footer ซ่อน footer-->
                  <v-data-table
                    :headers="headers"
                    :items="data_position_SystemAnalyst"
                    :search="search"
                    class="elevation-1"
                    style="text-align: center"
                  >
                    <template v-slot:item="{ item, index }">
                      <!-- :class="index % 2 === 0 ? 'row-even' : 'row-odd'" -->
                      <tr>
                        <td>
                          {{ index + 1 }}
                        </td>
                        <td>
                          <v-avatar>
                            <!-- <img
                              :src="getImageUrl(item.user_pic)"
                              alt="User avatar"
                              class="mx-auto"
                              style="width: 35px; height: 35px"
                            /> -->
                            <v-img
                              :src="item.user_pic"
                              alt="Selected Image"
                              v-if="item.user_pic"
                            />
                          </v-avatar>
                        </td>
                        <td>
                          {{ item.user_firstname }}
                        </td>
                        <td>
                          {{ item.user_lastname }}
                        </td>
                        <td>
                          {{ item.user_id }}
                        </td>
                        <td>
                          {{ item.user_position }}
                        </td>
                        <td>
                          {{ item.user_department }}
                        </td>
                        <td>
                          <v-icon
                            v-if="item.user_status == 'Active'"
                            color="success"
                            small
                            >mdi-circle</v-icon
                          >
                          <v-icon v-else color="error">mdi-circle</v-icon>
                          {{ item.user_status }}
                        </td>
                        <td>
                          {{ item.user_role }}
                        </td>
                        <td>
                          <v-btn
                            @click="(dialog_manage = true), editItem(item)"
                            color="primary"
                            style="color: white; border-radius: 20px"
                            small
                          >
                            {{ manage }}
                          </v-btn>
                        </td>
                      </tr>
                    </template>
                    <template v-slot:no-data>
                      <v-col>No Data</v-col>
                      <v-btn class="mb-4" color="primary" @click="initialize">
                        {{ reset }}
                      </v-btn>
                    </template>
                    <!--  -->
                  </v-data-table>
                  <!--  -->
                </v-card>
              </v-tab-item>
              <!-- Tab6 -->
              <v-tab-item>
                <v-card flat>
                  <!-- hide-default-footer ซ่อน footer-->
                  <v-data-table
                    :headers="headers"
                    :items="data_position_ReportDeveloper"
                    :search="search"
                    class="elevation-1"
                    style="text-align: center"
                  >
                    <template v-slot:item="{ item, index }">
                      <!-- :class="index % 2 === 0 ? 'row-even' : 'row-odd'" -->
                      <tr>
                        <td>
                          {{ index + 1 }}
                        </td>
                        <td>
                          <v-avatar>
                            <!-- <img
                              :src="getImageUrl(item.user_pic)"
                              alt="User avatar"
                              class="mx-auto"
                              style="width: 35px; height: 35px"
                            /> -->
                            <v-img
                              :src="item.user_pic"
                              alt="Selected Image"
                              v-if="item.user_pic"
                            />
                          </v-avatar>
                        </td>
                        <td>
                          {{ item.user_firstname }}
                        </td>
                        <td>
                          {{ item.user_lastname }}
                        </td>
                        <td>
                          {{ item.user_id }}
                        </td>
                        <td>
                          {{ item.user_position }}
                        </td>
                        <td>
                          {{ item.user_department }}
                        </td>
                        <td>
                          <v-icon
                            v-if="item.user_status == 'Active'"
                            color="success"
                            small
                            >mdi-circle</v-icon
                          >
                          <v-icon v-else color="error">mdi-circle</v-icon>
                          {{ item.user_status }}
                        </td>
                        <td>
                          {{ item.user_role }}
                        </td>
                        <td>
                          <v-btn
                            @click="(dialog_manage = true), editItem(item)"
                            color="primary"
                            style="color: white; border-radius: 20px"
                            small
                          >
                            {{ manage }}
                          </v-btn>
                        </td>
                      </tr>
                    </template>
                    <template v-slot:no-data>
                      <v-col>No Data</v-col>
                      <v-btn class="mb-4" color="primary" @click="initialize">
                        {{ reset }}
                      </v-btn>
                    </template>
                    <!--  -->
                  </v-data-table>
                  <!--  -->
                </v-card>
              </v-tab-item>
              <!-- จบ Tab ทั้ง 6 -->
            </v-tabs-items>
            <!-- ปุ่มสร้าง User + Dialog -->
            <v-dialog v-model="dialog" width="900px" max-height="100%">
              <v-card class="mx-auto" height="580px" max-height="100%">
                <v-card-title style="background-color: #009933">
                  <span class="text-h5">
                    <h4 style="color: white">สร้างผู้ใช้ใหม่</h4>
                  </span>
                </v-card-title>
                <!-- Form -->
                <v-form ref="formCreate" @submit.prevent="createUser2">
                  <v-row class="mb-2 pt-5" no-gutters>
                    <!-- Upload image -->
                    <v-col class="col-12" col="12" sm="12" md="2">
                      <v-card
                        style="border: none"
                        class="mx-auto text-center"
                        outlined
                        tile
                        height="100%"
                      >
                        <!--  -->
                        <template>
                          <div>
                            <form>
                              <label class="mt-10 avatar-upload">
                                <input
                                  type="file"
                                  ref="fileInput"
                                  @change="uploadFile"
                                />
                                <v-icon
                                  class="center mt-7"
                                  color="black"
                                  size="30px"
                                  v-if="!base64"
                                  >mdi-cloud-upload-outline</v-icon
                                >
                                <img v-if="base64" :src="base64" />
                              </label>
                            </form>
                          </div>
                        </template>
                        <!--  -->
                      </v-card>
                    </v-col>
                    <!-- Input Form -->
                    <v-col col="12" sm="12" md="10">
                      <v-card
                        style="border: none"
                        class="pa-2"
                        outlined
                        tile
                        height="100%"
                      >
                        <div>
                          <v-row
                            class="mr-2"
                            style="margin-bottom: -2%; font-size: 14px"
                          >
                            <v-col
                              class="hidden-xs-only"
                              cols="12"
                              xs="4"
                              sm="4"
                              md="4"
                            >
                              คำนำหน้าชื่อ
                            </v-col>
                            <v-col
                              class="hidden-xs-only"
                              cols="12"
                              xs="4"
                              sm="4"
                              md="4"
                            >
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

                          <v-row class="mr-2 mt-0" style="margin-bottom: -8%">
                            <v-col
                              cols="12"
                              xs="4"
                              sm="4"
                              md="4"
                              style="margin-right: -1%; padding-right: 0%"
                            >
                              <v-select
                                :rules="[rules.required]"
                                v-model="name"
                                :items="dataDefault_nametitle"
                                dense
                                rounded
                                outlined
                              ></v-select>
                            </v-col>
                            <v-col cols="12" xs="4" sm="4" md="4">
                              <v-text-field
                                :rules="[rules.required]"
                                v-model="firstname"
                                dense
                                rounded
                                outlined
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" xs="4" sm="4" md="4">
                              <v-text-field
                                :rules="[rules.required]"
                                v-model="lastname"
                                dense
                                rounded
                                outlined
                              ></v-text-field>
                            </v-col>
                          </v-row>

                          <v-row
                            class="mr-2 mt-6"
                            style="margin-bottom: -2%; font-size: 14px"
                          >
                            <v-col
                              class="hidden-xs-only"
                              cols="12"
                              xs="4"
                              sm="4"
                              md="4"
                            >
                              รหัสพนักงาน
                            </v-col>
                            <v-col
                              class="hidden-xs-only"
                              cols="12"
                              xs="4"
                              sm="4"
                              md="4"
                            >
                              ตำแหน่ง
                            </v-col>
                            <v-col
                              class="hidden-xs-only"
                              cols="12"
                              xs="4"
                              sm="4"
                              md="4"
                              style="margin-right: -1%; padding-right: 0%"
                            >
                              แผนก
                            </v-col>
                          </v-row>
                          <!--  -->
                          <v-row class="mr-2 mt-0" style="margin-bottom: -6%">
                            <v-col cols="12" xs="4" sm="4" md="4">
                              <v-text-field
                                :rules="[rules.required]"
                                v-model="code"
                                label="รหัสพนักงาน"
                                dense
                                rounded
                                outlined
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" xs="4" sm="4" md="4">
                              <v-select
                                :rules="[rules.required]"
                                v-model="position"
                                :items="dataDefault_position"
                                label="ตำแหน่ง"
                                dense
                                rounded
                                outlined
                              ></v-select>
                            </v-col>
                            <v-col cols="12" xs="4" sm="4" md="4">
                              <v-select
                                :rules="[rules.required]"
                                v-model="department"
                                :items="dataDefault_department"
                                label="แผนก"
                                dense
                                rounded
                                outlined
                              ></v-select>
                            </v-col>
                          </v-row>
                          <!--  -->
                          <v-row
                            class="mr-2 mt-2"
                            style="margin-bottom: -2%; font-size: 14px"
                          >
                            <v-col class="hidden-xs-only" cols="12" sm="12">
                              อีเมลล์
                            </v-col>
                          </v-row>
                          <!--  -->
                          <v-row class="mr-2 mt-0" style="margin-bottom: -6%">
                            <v-col cols="12" sm="12">
                              <v-text-field
                                :rules="[rules.required, rules.email]"
                                v-model="email"
                                label="อีเมลล์"
                                dense
                                rounded
                                outlined
                              ></v-text-field>
                            </v-col>
                          </v-row>
                          <!--  -->
                          <v-row
                            class="mr-2 mt-2"
                            style="margin-bottom: -2%; font-size: 14px"
                          >
                            <v-col class="hidden-xs-only" cols="12" sm="12">
                              รหัสผ่าน
                            </v-col>
                          </v-row>
                          <!--  -->
                          <v-row class="mr-2 mt-0" style="margin-bottom: -4%">
                            <v-col class="" cols="12" sm="12">
                              <v-text-field
                                :rules="[rules.required, rules.counter]"
                                v-model="password"
                                label="รหัสผ่าน"
                                :append-icon="
                                  showpassword_newbt ? 'mdi-eye' : 'mdi-eye-off'
                                "
                                @click:append="
                                  showpassword_newbt = !showpassword_newbt
                                "
                                :type="showpassword_newbt ? 'text' : 'password'"
                                dense
                                rounded
                                outlined
                              ></v-text-field>
                            </v-col>
                          </v-row>
                          <!--  -->
                          <v-row
                            class="mr-2 mt-0"
                            style="margin-bottom: -2%; font-size: 14px"
                          >
                            <v-col class="hidden-xs-only" cols="12" sm="6">
                              สถานะ
                            </v-col>
                            <v-col class="hidden-xs-only" cols="12" sm="6">
                              บทบาท
                            </v-col>
                          </v-row>
                          <!--  -->
                          <v-row class="mr-2 mt-0">
                            <v-col cols="12" sm="6">
                              <v-select
                                :rules="[rules.required]"
                                v-model="stratiform"
                                :items="dataDefault_status_user"
                                dense
                                rounded
                                outlined
                              ></v-select>
                            </v-col>

                            <v-col cols="12" sm="6">
                              <v-select
                                :rules="[rules.required]"
                                v-model="role"
                                :items="dataDefault_role_user"
                                dense
                                rounded
                                outlined
                              >
                              </v-select>
                            </v-col>
                          </v-row>

                          <v-row
                            class="mr-6 mt-0 mb-1"
                            style="justify-content: right"
                          >
                            <v-btn
                              class="mr-4"
                              elevation="2"
                              color="error"
                              style="color: white; border-radius: 10px"
                              @click="(dialog = false), clearInfoNewUser()"
                            >
                              ยกเลิก
                            </v-btn>
                            <v-btn
                              elevation="2"
                              color="primary"
                              type="submit"
                              style="color: white; border-radius: 10px"
                            >
                              สร้างผู้ใช้
                            </v-btn>
                          </v-row>
                        </div>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-form>
                <dialog-success
                  :dialog.sync="dialogSuccess"
                  title="สร้างเสร็จเรียบร้อยแล้ว"
                />
                <!-- End Form -->
              </v-card>
            </v-dialog>
            <!-- Dialog for button manage -->
            <v-dialog v-model="dialog_manage" width="900px" max-height="100%">
              <v-card class="mx-auto" height="580px" max-height="100%">
                <v-card-title style="background-color: #009933">
                  <span class="text-h6">
                    <h4 style="color: white">จัดการผู้ใช้งานระบบ</h4>
                  </span>
                </v-card-title>
                <!-- Form -->
                <v-form ref="form">
                  <v-row class="mb-2" no-gutters>
                    <!-- Upload image -->
                    <v-col class="col-12" col="12" sm="12" md="2">
                      <v-card
                        style="border: none"
                        class="mx-auto text-center"
                        outlined
                        tile
                        height="100%"
                      >
                        <template>
                          <div>
                            <form>
                              <label class="mt-10 avatar-upload">
                                <input
                                  type="file"
                                  ref="fileInput"
                                  @change="uploadFile_manage"
                                />
                                <v-icon
                                  class="center mt-7"
                                  color="black"
                                  size="30px"
                                  v-if="imageManage == null && base64 == ''"
                                  >mdi-cloud-upload-outline</v-icon
                                >
                                <img
                                  :src="base64"
                                  alt="Selected Image"
                                  v-if="base64"
                                />
                                <img
                                  v-else-if="imageManage != null"
                                  :src="imageManage"
                                />
                              </label>
                            </form>
                          </div>
                        </template>
                      </v-card>
                    </v-col>
                    <!-- Input Form -->
                    <v-col col="12" sm="12" md="10">
                      <v-form ref="formUpdate" @submit.prevent="updateUser2">
                        <v-card
                          style="border: none"
                          class="pa-2"
                          outlined
                          tile
                          height="100%"
                        >
                          <div>
                            <v-row
                              class="mr-2"
                              style="margin-bottom: -2%; font-size: 14px"
                            >
                              <v-col
                                class="hidden-xs-only"
                                cols="12"
                                xs="4"
                                sm="4"
                                md="4"
                              >
                                คำนำหน้าชื่อ
                              </v-col>
                              <v-col
                                class="hidden-xs-only"
                                cols="12"
                                xs="4"
                                sm="4"
                                md="4"
                              >
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
                            <!--  -->

                            <v-row class="mr-2 mt-0" style="margin-bottom: -8%">
                              <v-col
                                cols="12"
                                xs="4"
                                sm="4"
                                md="4"
                                style="margin-right: -1%; padding-right: 0%"
                              >
                                <v-select
                                  :rules="[rules.required]"
                                  v-model="editedItem.misname"
                                  :items="dataDefault_nametitle"
                                  dense
                                  rounded
                                  outlined
                                ></v-select>
                              </v-col>
                              <v-col cols="12" xs="4" sm="4" md="4">
                                <v-text-field
                                  :rules="[rules.required]"
                                  v-model="editedItem.user_firstname"
                                  dense
                                  rounded
                                  outlined
                                ></v-text-field>
                              </v-col>
                              <v-col cols="12" xs="4" sm="4" md="4">
                                <v-text-field
                                  :rules="[rules.required]"
                                  v-model="editedItem.user_lastname"
                                  dense
                                  rounded
                                  outlined
                                ></v-text-field>
                              </v-col>
                            </v-row>
                            <!--  -->
                            <v-row
                              class="mr-2 mt-6"
                              style="margin-bottom: -2%; font-size: 14px"
                            >
                              <v-col
                                class="hidden-xs-only"
                                cols="12"
                                xs="4"
                                sm="4"
                                md="4"
                              >
                                รหัสพนักงาน
                              </v-col>
                              <v-col
                                class="hidden-xs-only"
                                cols="12"
                                xs="4"
                                sm="4"
                                md="4"
                              >
                                ตำแหน่ง
                              </v-col>
                              <v-col
                                class="hidden-xs-only"
                                cols="12"
                                xs="4"
                                sm="4"
                                md="4"
                                style="margin-right: -1%; padding-right: 0%"
                              >
                                แผนก
                              </v-col>
                            </v-row>
                            <!--  -->
                            <v-row class="mr-2 mt-0" style="margin-bottom: -6%">
                              <v-col cols="12" xs="4" sm="4" md="4">
                                <v-text-field
                                  :rules="[rules.required]"
                                  v-model="editedItem.user_id"
                                  dense
                                  rounded
                                  outlined
                                ></v-text-field>
                              </v-col>
                              <v-col cols="12" xs="4" sm="4" md="4">
                                <v-select
                                  :rules="[rules.required]"
                                  v-model="editedItem.user_position"
                                  :items="dataDefault_position"
                                  dense
                                  rounded
                                  outlined
                                ></v-select>
                              </v-col>
                              <v-col cols="12" xs="4" sm="4" md="4">
                                <v-select
                                  :rules="[rules.required]"
                                  v-model="editedItem.user_department"
                                  :items="dataDefault_department"
                                  dense
                                  rounded
                                  outlined
                                ></v-select>
                              </v-col>
                            </v-row>
                            <!--  -->
                            <v-row
                              class="mr-2 mt-2"
                              style="margin-bottom: -2%; font-size: 14px"
                            >
                              <v-col class="hidden-xs-only" cols="12" sm="12">
                                อีเมลล์
                              </v-col>
                            </v-row>

                            <v-row class="mr-2 mt-0" style="margin-bottom: -6%">
                              <v-col cols="12" sm="12">
                                <v-text-field
                                  :rules="[rules.required, rules.email]"
                                  v-model="editedItem.user_email"
                                  dense
                                  rounded
                                  outlined
                                ></v-text-field>
                              </v-col>
                            </v-row>
                            <!--  -->
                            <v-row
                              class="mr-2 mt-2"
                              style="margin-bottom: -2%; font-size: 14px"
                            >
                              <v-col class="hidden-xs-only" cols="12" sm="12">
                                รหัสผ่าน
                              </v-col>
                            </v-row>
                            <!--  -->
                            <v-row class="mr-2 mt-0" style="margin-bottom: -4%">
                              <v-col class="" cols="12" sm="12">
                                <v-text-field
                                  :rules="[rules.required, rules.counter]"
                                  v-model="editedItem.user_password"
                                  :append-icon="
                                    showpassword_managebt
                                      ? 'mdi-eye'
                                      : 'mdi-eye-off'
                                  "
                                  @click:append="
                                    showpassword_managebt =
                                      !showpassword_managebt
                                  "
                                  :type="
                                    showpassword_managebt ? 'text' : 'password'
                                  "
                                  dense
                                  rounded
                                  outlined
                                >
                                </v-text-field>
                              </v-col>
                            </v-row>
                            <!--  -->
                            <v-row
                              class="mr-2 mt-0"
                              style="margin-bottom: -2%; font-size: 14px"
                            >
                              <v-col class="hidden-xs-only" cols="12" sm="6">
                                สถานะ
                              </v-col>
                              <v-col class="hidden-xs-only" cols="12" sm="6">
                                บทบาท
                              </v-col>
                            </v-row>

                            <v-row class="mr-2 mt-0">
                              <v-col cols="12" sm="6">
                                <v-select
                                  :rules="[rules.required]"
                                  v-model="editedItem.user_status"
                                  :items="dataDefault_status_user"
                                  dense
                                  rounded
                                  outlined
                                ></v-select>
                              </v-col>
                              <v-col cols="12" sm="6">
                                <v-select
                                  :rules="[rules.required]"
                                  v-model="editedItem.user_role"
                                  :items="dataDefault_role_user"
                                  dense
                                  rounded
                                  outlined
                                ></v-select>
                              </v-col>
                            </v-row>
                            <v-row class="mr-6 mt-0 mb-1">
                              <v-btn color="error" @click="deleteUser()">
                                <h4>ลบผู้ใช้</h4>
                              </v-btn>
                              <v-spacer></v-spacer>
                              <v-btn
                                color="error"
                                @click="dialog_manage = false"
                              >
                                <h4>ปิด</h4>
                              </v-btn>
                              <!-- @click="updateUser2()" -->
                              <v-btn
                                color="primary"
                                dark
                                type="submit"
                                class="ml-3"
                              >
                                <h4>อัปเดต</h4>
                              </v-btn>
                            </v-row>
                          </div>
                          <dialog-success
                            :dialog.sync="dialogDeleteSuccess"
                            title="ลบเสร็จเรียบร้อยแล้ว"
                          />
                          <dialog-success
                            :dialog.sync="dialogUpdateSuccess"
                            title="อัปเดตเสร็จเรียบร้อยแล้ว"
                          />
                        </v-card>
                      </v-form>
                    </v-col>
                  </v-row>
                </v-form>
                <!-- End Form -->
              </v-card>
            </v-dialog>
            <!--  -->
          </v-col>
        </v-card>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import DialogFail from "../components/DialogFail.vue";
import Searchbar from "../components/Searchbar.vue";
export default {
  head() {
    return {
      title: "ManageUser",
    };
  },
  components: { Searchbar, DialogFail },
  layout: "admin",
  data() {
    return {
      //auth
      user: this.$auth.user,
      loggedIn: this.$auth.loggedIn,
      search: "",

      titleFirstname: "",
      imageManageUpload: null,
      imageFileUpload: "",
      imageManage: null,
      photo: "",
      avatar: null,
      name: "Mr.",
      firstname: "",
      lastname: "",
      code: "",
      position: "",
      department: "",
      email: "",
      password: "",
      role: "User",
      stratiform: "Active",
      query: "",
      editedIndex: -1,
      editedItem: {
        id: "",
        user_pic: null,
        misname: "",
        user_firstname: "",
        user_lastname: "",
        user_id: "",
        user_position: "",
        user_department: "",
        user_email: "",
        user_password: "",
        user_status: "",
        user_role: "",
        imageFile: "",
      },

      tab: null,
      items: [
        "All",
        "Developer",
        "Implementer",
        "Program Management",
        "System Analyst",
        "report developer",
      ],
      departments: ["DD"],
      rules: {
        required: (value) => !!value || "*กรุณาใส่ข้อมูล*",
        counter: (value) => value.length >= 8 || "ใส่ขั้นต่ำ 8 ตัวอักษร",
        email: (value) => {
          const pattern =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "ใส่อีเมลล์ให้ถูกต้อง";
        },
      },
      dialog: false,
      dialogDelete: false,
      dialog_manage: false,
      headers: [
        {
          text: "No.",
          align: "center",
          sortable: false,
          value: "id",
        },
        {
          text: "รูป",
          align: "center",
          sortable: false,
          value: "photo",
        },
        { text: "ชื่อ", align: "center", value: "name" },
        { text: "นามสกุล", align: "center", value: "lastname" },
        { text: "รหัสพนักงาน", align: "center", value: "code" },
        { text: "ตำแหน่ง", align: "center", value: "position" },
        { text: "แผนก", align: "center", value: "department" },
        { text: "สถานะ", align: "center", value: "status" },
        { text: "บทบาท", align: "center", value: "role" },
        { text: "จัดการ", align: "center", value: "actions", sortable: false },
      ],
      manage: "จัดการ",
      reset: "รีเซ็ต",
      all: [],
      developer: [],
      implementer: [],
      // For Api
      data: [],
      data_position_Developer: [],
      data_position_Implementer: [],
      data_position_ProgramManagement: [],
      data_position_SystemAnalyst: [],
      data_position_ReportDeveloper: [],
      imageALL: [],
      imageDeveloper: [],
      imageImplementer: [],
      imageProgramManagement: [],
      imageSystemAnalyst: [],
      imageReportDeveloper: [],
      showpassword_newbt: false,
      showpassword_managebt: false,
      dataDefault: [],
      dataDefault_role_user: [],
      dataDefault_nametitle: [],
      dataDefault_position: [],
      dataDefault_department: [],
      dataDefault_status_user: [],
      dataDefault_issue_type: [],
      dataDefault_issue_priotity: [],
      check_role: "",
      //
      qcInissue: [],
      assignInissue: [],
      backgroundColor: "#bb96f1a6",
      tableColor: "#caadf4",
      dialogSuccess: false,
      dialogDeleteSuccess: false,
      dialogfail: false,
      dialogUpdateSuccess: false,
      base64: "",
    };
  },
  created() {
    this.getUser();
    this.initialize();
  },
  mounted() {
    this.getUser();
  },
  methods: {
    initialize() {
      this.getUser();
      this.getAll();
      this.getPosition_Developer();
      this.getPosition_Implementer();
      this.getPosition_ProgramManagement();
      this.getPosition_SystemAnalyst();
      this.getPosition_ReportDeveloper();
      this.getAllDefault();
    },
    async getUser() {
      await this.$axios
        .get("/users/getOne/" + this.$auth.user.id)
        .then((res) => {
          this.check_role = res.data[0].user_role;
        });
    },
    async getAll() {
      await this.$axios.get("/users/getAll").then((data) => {
        this.data = data.data;
        this.splitImage(this.data, this.imageALL);
        // console.log(this.data, this.imageALL);
      });
    },
    async getPosition_Developer() {
      await this.$axios
        .get("/users/getAll?user_position=Developer")
        .then((data) => {
          this.data_position_Developer = data.data;
          this.splitImage(this.data_position_Developer, this.imageDeveloper);
        });
    },
    async getPosition_Implementer() {
      await this.$axios
        .get("/users/getAll?user_position=Implementer")
        .then((data) => {
          this.data_position_Implementer = data.data;
          this.splitImage(
            this.data_position_Implementer,
            this.imageImplementer
          );
        });
    },
    async getPosition_ProgramManagement() {
      await this.$axios
        .get("/users/getAll?user_position=Program%20Management")
        .then((data) => {
          this.data_position_ProgramManagement = data.data;
          this.splitImage(
            this.data_position_ProgramManagement,
            this.imageProgramManagement
          );
        });
    },
    async getPosition_SystemAnalyst() {
      await this.$axios
        .get("/users/getAll?user_position=System%20Analyst")
        .then((data) => {
          this.data_position_SystemAnalyst = data.data;
          this.splitImage(
            this.data_position_SystemAnalyst,
            this.imageSystemAnalyst
          );
        });
    },
    async getPosition_ReportDeveloper() {
      await this.$axios
        .get("/users/getAll?user_position=Report%20Developer")
        .then((data) => {
          this.data_position_ReportDeveloper = data.data;
          this.splitImage(
            this.data_position_ReportDeveloper,
            this.imageReportDeveloper
          );
        });
    },
    getImageUrl(fileName) {
      return require(`@/static/uploads/${fileName}`);
      // return require(`../../backend/static/uploads/${fileName}`);
    },

    editItem(item) {
      this.editedItem = Object.assign({}, item);
      const parts = item.user_pic.split("\\");
      const directory = parts[1];
      this.imageManage = parts[parts.length - 1];
      const regex = /^(Mr\.|Miss\.|นาย|นาง|นางสาว)\s+(.*)$/; // Regular expression to match title and name
      const matches = item.user_firstname.match(regex);
      if (matches) {
        this.editedItem.misname = matches[1];
        const name2 = matches[2].trim();
        const nameParts = name2.split(" ");
        this.editedItem.user_firstname = nameParts[0];
      }
      this.dialog_manage = true;
      // console.log(this.imageManage);
    },

    async createUser2() {
      if (
        this.email.trim() == "" ||
        this.name.trim() == "" ||
        this.firstname.trim() == "" ||
        this.lastname.trim() == "" ||
        this.code.trim() == "" ||
        this.position.trim() == "" ||
        this.department.trim() == "" ||
        this.password.trim() == "" ||
        this.stratiform.trim() == "" ||
        this.role.trim() == ""
      ) {
        await this.$refs.formCreate.validate();
        // alert("Please fill in all required fields.");
        return;
      }

      try {
        await this.$refs.formCreate.validate();
        const formdatas = {
          user_firstname: this.name + " " + this.firstname,
          user_lastname: this.lastname,
          user_id: this.code,
          user_position: this.position,
          user_department: this.department,
          user_email: this.email,
          user_password: this.password,
          user_status: this.stratiform,
          user_role: this.role,
          user_pic: this.base64,
        };
        await this.$axios.post("/users/createUser", formdatas);
        const promise = new Promise((resolve, reject) => {
          this.dialogSuccess = true;
          this.dialog = false;
          this.getUser();
          this.getAll();
          this.getPosition_Developer();
          this.getPosition_Implementer();
          this.getPosition_ProgramManagement();
          this.getPosition_SystemAnalyst();
          this.getPosition_ReportDeveloper();
          this.getAllDefault();
          this.initialize();
          this.clearInfoNewUser();
          resolve();
        });
        promise.then(() => {
          setTimeout(() => {
            this.getUser();
            this.getAll();
            this.getPosition_Developer();
            this.getPosition_Implementer();
            this.getPosition_ProgramManagement();
            this.getPosition_SystemAnalyst();
            this.getPosition_ReportDeveloper();
            this.getAllDefault();
            this.initialize();
            this.clearInfoNewUser();
          }, 2000);
        });
      } catch (error) {
        // If an error occurs, display an error message
        console.error(error);
        alert("Error submitting form");
      }
    },

    splitImage(data, image) {
      data.forEach((file) => {
        const parts = file.user_pic.split("\\");
        const directory = parts[1];
        const fileName = parts[parts.length - 1];
        const extractedFile = { id: file.id, directory, fileName };
        image.push(extractedFile);
      });
    },

    uploadFile() {
      const input2 = this.$refs.fileInput;
      this.imageFileUpload = input2.files[0];
      console.log(this.imageFileUpload);

      const selectedFile = this.imageFileUpload;
      if (selectedFile) {
        const reader = new FileReader();
        reader.onload = (event) => {
          this.base64 = event.target.result;
          console.log(this.base64);
        };
        reader.readAsDataURL(selectedFile);
      }
      // try {
      //   this.photo = URL.createObjectURL(this.imageFileUpload);
      // } catch (error) {
      //   console.error(error);
      //   this.photo = null;
      //   this.imageFileUpload = "";
      // }
    },
    uploadFile_manage() {
      const input = this.$refs.fileInput;
      this.imageManageUpload = input.files[0];
      console.log(this.imageManageUpload);
      const selectedFile = this.imageManageUpload;
      if (selectedFile) {
        const reader = new FileReader();
        reader.onload = (event) => {
          this.base64 = event.target.result;
          console.log(this.base64);
        };
        reader.readAsDataURL(selectedFile);
      }
    },
    async updateUser2() {
      if (
        this.editedItem.misname.trim() == "" ||
        this.editedItem.user_firstname.trim() == "" ||
        this.editedItem.user_lastname.trim() == "" ||
        this.editedItem.user_id.trim() == "" ||
        this.editedItem.user_position.trim() == "" ||
        this.editedItem.user_department.trim() == "" ||
        this.editedItem.user_email.trim() == "" ||
        this.editedItem.user_password.trim() == "" ||
        this.editedItem.user_status.trim() == "" ||
        this.editedItem.user_role.trim() == ""
      ) {
        await this.$refs.formUpdate.validate();
        // alert("Please fill in all required fields.");
        return;
      }
      try {
        this.$refs.formUpdate.validate();
        const formdatas = {
          user_firstname:
            this.editedItem.misname + " " + this.editedItem.user_firstname,
          user_lastname: this.editedItem.user_lastname,
          user_id: this.editedItem.user_id,
          user_position: this.editedItem.user_position,
          user_department: this.editedItem.user_department,
          user_email: this.editedItem.user_email,
          user_password: this.editedItem.user_password,
          user_status: this.editedItem.user_status,
          user_role: this.editedItem.user_role,
          user_pic: this.base64 ? this.base64 : this.imageManage,
        };
        await this.$axios
          .put(`/users/updateUsers/${this.editedItem.id}`, formdatas)
          .then((response) => {
            this.getUser();
            this.getAll();
            this.getPosition_Developer();
            this.getPosition_Implementer();
            this.getPosition_ProgramManagement();
            this.getPosition_SystemAnalyst();
            this.getPosition_ReportDeveloper();
            this.getAllDefault();
            // alert("Update success");
            this.dialogUpdateSuccess = true;
            this.dialog_manage = false;
          })
          .catch((err) => {
            console.log(err);
            alert(err);
          });
      } catch (error) {
        console.log(error);
      }
    },

    async deleteUser() {
      //check จากid
      await this.$axios
        .get("/issues/getAll?user_qc_id=" + this.editedItem.id)
        .then((response) => {
          this.qcInissue = response.data;
        })
        .catch((err) => {
          console.log(err);
          alert(err);
        });
      await this.$axios
        .get("/issues/getAll?user_assign_id=" + this.editedItem.id)
        .then((response) => {
          this.assignInissue = response.data;
        })
        .catch((err) => {
          console.log(err);
          alert(err);
        });
      if (this.qcInissue.length > 0) {
        // alert("ผู้ใช้รายนี้มีรายการปัญหาที่ต้องจัดการก่อน");
        this.dialogfail = true;
      } else if (this.assignInissue.length > 0) {
        // alert("ผู้ใช้รายนี้มีรายการปัญหาที่ต้องจัดการก่อน");
        this.dialogfail = true;
      } else {
        await this.deleteUser_screens();
        console.log("1");
        await this.deleteUserSystem();
        console.log("2");
        await this.deleteUserProject();
        console.log("3");
        await this.deleteUserLast();
        console.log("4");
        // this.initialize();
      }
    },

    async deleteUserLast() {
      try {
        const response = await this.$axios.delete(
          "/users/deleteUser/" + this.editedItem.id
        );
        if (response.status === 200 || response.status === 404) {
          this.dialog_manage = false;
          this.initialize();
          this.dialogDeleteSuccess = true;
        }
      } catch (error) {
        alert(error + "Error");
      }
    },

    async deleteUser_screens() {
      try {
        const response = await this.$axios.delete(
          "/user_screens/deleteUserID/" + this.editedItem.id
        );
        // console.log("delete success");
        if (response.status === 200) {
          this.initialize();
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          console.log(err.response);
        }
        console.log(err);
      }
    },
    async deleteUserSystem() {
      try {
        const response = await this.$axios.delete(
          "/user_systems/deleteUserID/" + this.editedItem.id
        );
        if (response.status === 200) {
        } else if (response.status === 404) {
          const responseData = response.data;
          if (responseData) {
            // alert("user_system no have data");
          } else if (responseData.error && response.status != 404) {
            // alert(responseData.error);
          }
          // window.location.reload();
        }
      } catch (err) {
        console.log(err);
      }
    },
    async deleteUserProject() {
      try {
        const response = await this.$axios.delete(
          "/user_projects/deleteUserID/" + this.editedItem.id
        );
        if (response.status === 200) {
        } else if (response.status === 404) {
          const responseData = response.data;
          if (responseData) {
            // alert("user_system no have data");
          } else if (responseData.error && response.status != 404) {
            // alert(responseData.error);
            console.log(responseData.error);
          }
          // window.location.reload();
        }
      } catch (err) {
        console.log(err);
      }
    },

    clearInfoNewUser() {
      this.photo = "";
      this.name = "";
      this.firstname = "";
      this.lastname = "";
      this.code = "";
      this.position = "";
      this.department = "";
      this.email = "";
      this.password = "";
    },
    async getAllDefault() {
      await this.$axios.get("/default_settings/getAll").then((data) => {
        this.dataDefault = data.data;
        console.clear();
        // console.log(this.dataDefault);
        this.dataDefault.forEach((item) => {
          if (item.role_user) {
            this.dataDefault_role_user.push(item.role_user);
          }
          if (item.nametitle) {
            this.dataDefault_nametitle.push(item.nametitle);
          }
          if (item.position) {
            this.dataDefault_position.push(item.position);
          }
          if (item.department) {
            this.dataDefault_department.push(item.department);
          }
          if (item.status_user) {
            this.dataDefault_status_user.push(item.status_user);
          }
          if (item.issue_type) {
            this.dataDefault_issue_type.push(item.issue_type);
          }
          if (item.issue_priotity) {
            this.dataDefault_issue_priotity.push(item.issue_priotity);
          }
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

input[type="text"] {
  border: black;
  font-size: 16px;
  padding-left: 10px;
  outline: black;
}

.center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-upload {
  display: inline-block;
  width: 100px;
  height: 100px;
  border-radius: 50px;
  text-align: center;
  background-color: #a1a1a1;
  text-align: center;
  cursor: pointer;
}

.avatar-upload input[type="file"] {
  display: none;
}

.avatar-upload img {
  width: 100%;
  height: 100%;
  border-radius: 50px;
  object-fit: cover;
}

.avatar-upload i {
  font-size: 16px;
  line-height: 40px;
  color: #bbbbbb;
}

::v-deep .v-data-table-header {
  background-color: #5c5c5c;
  color: white;
}

::v-deep .v-data-table-header span {
  color: white;
  font-size: 14px;
}

.card >>> .v-input {
  padding-top: 0% !important;
}
</style>