<template>
  <row justify="center">
    <v-dialog v-model="dialog" persistent max-width="70%">
      <v-card v-if="loading">
        <h1>Loading.....</h1>
      </v-card>
      <v-card v-else>
        <v-card-title class="pt-3" style="background-color: #009933">
          <h5 style="color: white">
            รายละเอียดปัญหาที่พบ | โครงการ : {{ ProjectName }} > ระบบ :
            {{ SystemName }}
            {{ this.IssueEndDate }} . {{ this.IssueAccepting }}
          </h5>

          <v-spacer></v-spacer>
          <v-btn color="white" :to="`/history/${id}`" v-if="history"
            >ประวัติ</v-btn
          >
        </v-card-title>
        <v-row class="ml-2 mr-2 mt-2">
          <v-col>
            <v-row>
              <v-col cols="12" sm="4" md="4" class="pb-0">
                <v-text-field
                  label="เลขที่ปัญหา"
                  placeholder="เลขที่ปัญหา"
                  disabled
                  outlined
                  dense
                  x-small
                  v-model="IssueId"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="8" md="8" class="pb-0">
                <v-text-field
                  label="ปัญหา"
                  placeholder="ปัญหา"
                  outlined
                  dense
                  :disabled="isIssueInProcess"
                  v-model="IssueName"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4" class="pb-0">
                <v-select
                  :items="type_select"
                  label="ประเภทปัญหา"
                  dense
                  outlined
                  :disabled="isIssueInProcess"
                  v-model="IssueType"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="8" class="pb-0">
                <v-select
                  @mousemove="getDefault()"
                  @change="getUserSystems(ScreenName.id)"
                  :items="screen_selectDefault"
                  label="เลขที่หน้าจอ : ชื่อหน้าจอ"
                  dense
                  outlined
                  v-model="ScreenName"
                  :disabled="isIssueInProcess"
                  item-text="screen_name"
                  item-value="screen_name"
                  return-object="false"
                >
                  <template #selection="{ item }">
                    {{ item.screen_id }}: {{ item.screen_name }}
                  </template>
                  <template v-slot:item="{ item }">
                    {{ item.screen_id }} : {{ item.screen_name }}
                  </template>
                </v-select>
              </v-col>
              <v-col cols="12" sm="6" md="4" class="pb-0">
                <v-text-field
                  label="ผู้จดแจ้ง"
                  placeholder="ผู้จดแจ้ง"
                  outlined
                  dense
                  :disabled="isIssueInProcess"
                  v-model="IssueInformer"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4" class="pb-0">
                <v-select
                  :items="priotity_select"
                  label="ความสำคัญ"
                  dense
                  outlined
                  :disabled="isIssueInProcess"
                  prepend-icon="mdi-flag-outline"
                  v-model="IssuePriority"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="4" class="pb-0">
                <v-select
                  :items="issue_status_default"
                  label="สถานะ"
                  disabled
                  placeholder="สถานะ"
                  dense
                  outlined
                  v-model="IssueStatus"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="6" class="pb-0">
                <v-text-field
                  label="วันที่สร้าง"
                  placeholder="วันที่สร้าง"
                  outlined
                  disabled
                  dense
                  v-model="createThai"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6" md="6" class="pb-0">
                <v-row>
                  <!-- IssueEnd date-->
                  <v-menu
                    v-model="endIssueMenu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="formattedDateEnd"
                        label="วันกำหนดส่ง"
                        prepend-icon="mdi-calendar"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                        :disabled="isIssueInProcess"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="IssueEndDate"
                      :min="IssueCreate"
                      no-title
                      scrollable
                      format="yyyy-MM-dd"
                      locale="th"
                      @input="endIssueMenu = false"
                      @change="changeDate()"
                    ></v-date-picker>
                  </v-menu>
                </v-row>
              </v-col>
              <v-col cols="12" sm="6" md="6" class="pb-0">
                <v-select
                  return-object="false"
                  :items="position_Developers"
                  label="ผู้พัฒนา"
                  dense
                  outlined
                  :disabled="isIssueInProcess"
                  menu-props="auto"
                  item-text="user_firstname"
                  v-model="IssueAssign"
                  @change="checkAssign()"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="6" class="pb-0">
                <v-select
                  return-object="false"
                  :items="position_Implementer"
                  label="ผู้ตรวจสอบ"
                  dense
                  outlined
                  menu-props="auto"
                  :disabled="isIssueInProcess"
                  item-text="user_firstname"
                  v-model="IssueQC"
                  @change="checkAssign2()"
                ></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" class="pb-0">
                <v-textarea
                  solo
                  name="input-7-4"
                  label="คำอธิบายปัญหา"
                  v-model="IssueDes"
                  :disabled="isIssueInProcess"
                  style=""
                ></v-textarea
              ></v-col>
            </v-row>
            <!-- Type PNC option -->
            <v-row v-if="IssueType == 'PNC'">
              <v-col cols="12" sm="4" md="6" class="pb-0">
                <v-text-field
                  label="เลขที่เอกสาร"
                  placeholder="เลขที่เอกสาร"
                  :disabled="isIssueInProcess"
                  outlined
                  dense
                  v-model="IssueDocId"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="8" md="6" class="pb-0">
                <v-text-field
                  label="ชื่อลูกค้า"
                  placeholder="ชื่อลูกค้า"
                  outlined
                  :disabled="isIssueInProcess"
                  dense
                  v-model="IssueCustomer"
                ></v-text-field>
              </v-col>
            </v-row>
            <!-- Type New Req option -->
            <v-row v-if="IssueType == 'New Req'">
              <v-col cols="6" class="pb-0">
                <v-row>
                  <p class="pa-2">ประเภทความต้องการใหม่</p>
                  <v-text-field
                    label="ประเภทความต้องการใหม่"
                    placeholder="ประเภทความต้องการใหม่"
                    :disabled="isIssueInProcess"
                    outlined
                    dense
                    v-model="IssueTypeSA"
                  ></v-text-field>
                </v-row>
              </v-col>
              <v-col cols="6" class="pb-0">
                <v-row>
                  <p class="pa-2">คำอธิบายถึง SA</p>
                  <v-textarea
                    solo
                    name="input-7-4"
                    :disabled="isIssueInProcess"
                    label="คำอธิบายถึง SA"
                    v-model="IssueDesSA"
                  ></v-textarea>
                </v-row>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6" class="pb-0">
                <v-row>
                  <p class="pa-2">Attachments</p>
                </v-row>
                <v-row>
                  <p class="pa-2">{{ pdf }}</p>
                  <!-- <a :href="pdf" download="pdf">ดาวน์โหลดไฟล์ PDF</a> -->
                  <!-- <a :href="`/issues/getpdf/${id}`">ดาวน์โหลดไฟล์ PDF</a> -->
                  <!-- <a href="#" target="_blank" @click="downloadPDF">ดาวน์โหลดไฟล์ PDF</a> -->
                  <v-btn @click="downloadPDF">ดาวน์โหลดไฟล์ </v-btn>
                  <div>
                    <embed
                      :src="pdf"
                      type="application/pdf"
                      width="100%"
                      height="600"
                    />
                  </div>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
          <!-- col ใหญ่ฝั่งขวา -->
          <v-col>
            <v-expansion-panels
              class="mb-2"
              v-model="panel"
              :disabled="disabledDev"
              multiple
            >
              <v-expansion-panel>
                <v-expansion-panel-header
                  disable-icon-rotate
                  class="pb-0 pt-0"
                  style="background-color: #009933"
                >
                  <h3 style="color: white">ส่วนของผู้พัฒนา</h3>
                  <template v-slot:actions>
                    <v-icon color="white"> $expand </v-icon>
                  </template>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-col class="pt-0">
                    <v-form ref="form" :disabled="NoAssginCheck">
                      <v-row class="mt-5">
                        <v-col cols="6" class="pb-0">
                          <p v-show="NoAssginCheck" style="color: red">
                            **โปรดเลือกผู้รับผิดชอบ
                          </p>
                          <!-- <p>
                            วันที่รับ -
                            {{ IssueAccepting }}
                          </p> -->
                          <v-row>
                            <!-- Date of accepting-->
                            <v-menu
                              v-model="acceptMenu"
                              :close-on-content-click="false"
                              :nudge-right="40"
                              transition="scale-transition"
                            >
                              <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                  v-model="formattedDateAccept"
                                  label="วันที่รับ"
                                  prepend-icon="mdi-calendar"
                                  readonly
                                  v-bind="attrs"
                                  v-on="on"
                                  :rules="rules"
                                ></v-text-field>
                              </template>
                              <v-date-picker
                                no-title
                                scrollable
                                format="yyyy-MM-dd"
                                locale="th"
                                v-model="IssueAccepting"
                                @input="acceptMenu = false"
                                @change="changeDate()"
                              ></v-date-picker>
                            </v-menu>
                          </v-row>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="6" class="mb-5">
                          <!-- <p>วันที่เริ่ม - {{ IssueStart }}</p> -->
                          <v-row>
                            <!-- Start date -->
                            <v-menu
                              v-model="startMenu"
                              :close-on-content-click="false"
                              :nudge-right="40"
                              transition="scale-transition"
                            >
                              <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                  v-model="formattedDateStart"
                                  label="วันที่เริ่ม"
                                  prepend-icon="mdi-calendar"
                                  readonly
                                  v-bind="attrs"
                                  v-on="on"
                                  :rules="rules"
                                ></v-text-field>
                              </template>
                              <v-date-picker
                                v-model="IssueStart"
                                no-title
                                scrollable
                                format="yyyy-MM-dd"
                                locale="th"
                                @input="startMenu = false"
                                @change="changeDate()"
                              ></v-date-picker>
                            </v-menu>
                            <!-- Expected completion Date -->
                            <!-- <p class="ml-4">
                              วันที่คาดว่าแก้ไขเสร็จ -
                              {{ IssueExpected }}
                            </p> -->
                            <v-menu
                              v-model="expectedMenu"
                              :close-on-content-click="false"
                              :nudge-right="40"
                              transition="scale-transition"
                            >
                              <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                  v-model="formattedDateExpected"
                                  label="วันที่คาดว่าแก้ไขเสร็จ"
                                  prepend-icon="mdi-calendar"
                                  readonly
                                  v-bind="attrs"
                                  v-on="on"
                                  :rules="rules"
                                ></v-text-field>
                              </template>
                              <v-date-picker
                                v-model="IssueExpected"
                                no-title
                                scrollable
                                format="yyyy-MM-dd"
                                locale="th"
                                @input="expectedMenu = false"
                                @change="changeDate()"
                              ></v-date-picker>
                            </v-menu>
                          </v-row>
                        </v-col>
                      </v-row>
                    </v-form>
                    <v-col cols="6">
                      <v-row v-if="mandayProps">
                        <p class="pa-2">Manday</p>
                        <v-text-field
                          label="Manday"
                          placeholder="Manday"
                          outlined
                          dense
                          v-model="IssueManday"
                          :disabled="NoAssginCheck"
                        ></v-text-field>
                      </v-row>
                    </v-col>
                    <v-divider></v-divider>
                    <v-row class="text-h6 mt-2 mb-2">
                      <h6>ส่วนของผู้พัฒนา</h6>
                    </v-row>
                    <v-row>
                      <v-col>
                        <v-row>
                          <v-col cols="4">
                            <!-- <p class="pa-2">สถานะ</p> -->
                            <v-select
                              :disabled="NoAssginCheck"
                              :items="issue_status_developer_default"
                              label="สถานะ"
                              placeholder="สถานะ"
                              dense
                              outlined
                              v-model="IssueDeveloperStatus"
                              @change="checkSendWork()"
                            ></v-select>
                          </v-col>
                          <v-col v-if="sendWork" cols="8">
                            <!-- <p class="pa-2">โปรดเลือกคนที่จะส่งต่องาน</p> -->
                            <v-select
                              return-object="false"
                              :items="position_Developers_System"
                              @change="getUserScreen(IssueAssign.id)"
                              label="โปรดเลือกคนที่จะส่งต่องาน"
                              dense
                              outlined
                              menu-props="auto"
                              item-text="user_firstname"
                              v-model="IssueAssign"
                            ></v-select>
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                    <v-form ref="formCom" :disabled="NoAssginCheck">
                      <v-row>
                        <v-col cols="6">
                          <v-row>
                            <!-- Completion date-->
                            <!-- <p class="pa-2">
                              วันที่เสร็จ - {{ IssueComplete }}
                            </p> -->
                            <v-menu
                              v-model="completionMenu"
                              :close-on-content-click="false"
                              :nudge-right="40"
                              transition="scale-transition"
                            >
                              <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                  v-model="formattedDateComplete"
                                  label="วันที่เสร็จ"
                                  prepend-icon="mdi-calendar"
                                  readonly
                                  v-bind="attrs"
                                  v-on="on"
                                  :rules="rules"
                                ></v-text-field>
                              </template>
                              <v-date-picker
                                v-model="IssueComplete"
                                no-title
                                scrollable
                                format="yyyy-MM-dd"
                                locale="th"
                                @input="completionMenu = false"
                                @change="changeDate()"
                              ></v-date-picker>
                            </v-menu>
                          </v-row>
                        </v-col>
                      </v-row>
                    </v-form>
                    <v-row>
                      <v-col cols="6">
                        <p class="">คำอธิบาย</p>
                        <v-textarea
                          solo
                          :disabled="NoAssginCheck"
                          name="input-7-4"
                          label="คำอธิบายของผู้พัฒนา"
                          v-model="IssueDesDev"
                        ></v-textarea>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
            <!-- End developer section 1 -->
            <v-expansion-panels v-if="ImpleSection">
              <v-expansion-panel>
                <v-expansion-panel-header
                  disable-icon-rotate
                  class="pb-0 pt-0"
                  style="background-color: #009933"
                >
                  <h3 style="color: white">ส่วนของผู้ตรวจสอบ</h3>
                  <template v-slot:actions>
                    <v-icon color="white"> $expand </v-icon>
                  </template>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-col>
                    <v-row>
                      <v-col cols="8">
                        <v-row>
                          <v-col>
                            <p class="pa-2">สถานะการตรวจสอบ</p>
                            <v-select
                              :items="issue_status_implement_default"
                              label="สถานะ"
                              placeholder="สถานะ"
                              dense
                              outlined
                              v-model="IssueImplementerStatus"
                            ></v-select>
                          </v-col>
                          <v-col>
                            <p class="pa-2">จำนวนการแก้ไข</p>
                            <v-text-field
                              label="จำนวนการแก้ไข"
                              placeholder="จำนวนการแก้ไข"
                              outlined
                              disabled
                              dense
                              v-model="IssueRound"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12" class="pt-0">
                        <p class="">คำอธิบายของผู้ตรวจสอบ</p>
                        <v-textarea
                          solo
                          name="input-7-4"
                          label="คำอธิบายของผู้ตรวจสอบ"
                          v-model="IssueDesImplementer"
                        ></v-textarea>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-col>
        </v-row>
        <v-card-actions>
          <v-btn
            v-show="this.HistoryCheck == false"
            color="error"
            @click="issueReject()"
            ><h4>ลบ</h4></v-btn
          >
          <v-spacer></v-spacer>
          <v-btn color="error" @click="handleClose()"><h4>ปิด</h4></v-btn>
          <v-btn
            v-show="this.HistoryCheck == false"
            color="primary"
            @click="saveIssue()"
            ><h4>อัปเดต</h4></v-btn
          >
        </v-card-actions>
      </v-card>

      <template>
        <v-dialog
          v-model="dialogSuccess"
          persistent
          max-width="400px"
          max-height="100%"
        >
          <v-card width="100%" max-height="100%">
            <v-row class="ma-0 pa-0" style="place-content: center">
              <v-card-title>
                <v-icon size="100px" color="success"
                  >mdi-check-circle-outline</v-icon
                >
              </v-card-title>
            </v-row>
            <v-row class="ma-0 pa-0" style="place-content: center">
              <v-card-title class="text-h4">
                อัปเดตเสร็จเรียบร้อย
              </v-card-title>
            </v-row>
            <v-card-actions style="place-content: center">
              <!-- <v-spacer></v-spacer> -->
              <v-btn
                color="success"
                dark
                @click="(dialogSuccess = false), handleClose()"
                rounded
              >
                Ok
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </template>
      <template>
        <v-dialog
          v-model="rejectSuccess"
          persistent
          max-width="400px"
          max-height="100%"
        >
          <v-card width="100%" max-height="100%">
            <v-row class="ma-0 pa-0" style="place-content: center">
              <v-card-title>
                <v-icon size="100px" color="success"
                  >mdi-check-circle-outline</v-icon
                >
              </v-card-title>
            </v-row>
            <v-row class="ma-0 pa-0" style="place-content: center">
              <v-card-title class="text-h4"> ลบเสร็จเรียบร้อย </v-card-title>
            </v-row>
            <v-card-actions style="place-content: center">
              <!-- <v-spacer></v-spacer> -->
              <v-btn
                color="success"
                dark
                @click="(rejectSuccess = false), handleClose()"
                rounded
              >
                Ok
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </template>
    </v-dialog>
  </row>
</template>
  
<script>
import moment from "moment";
export default {
  props: {
    ProjectName: String,
    ProjectId: Number,
    SystemName: String,
    SystemId: Number,
    id: {
      type: Number,
      required: true,
    },
    IssueUserAssignId: String,
    IssueUserQCId: String,
    IssueId: String,
    IssueType: String,
    IssueScreenId: Number,
    IssueStatus: String,
    IssuePriority: String,
    IssueEndDate: String,
    IssueName: String,
    IssueDesSA: String,
    IssueInformer: String,
    IssueAssign: String,
    IssueQC: String,
    IssueFilename: String,
    IssueAccepting: String,
    IssueManday: String,
    IssueStart: String,
    IssueExpected: String,
    IssueComplete: String,
    IssueDesImplementer: String,
    IssueDesDev: String,
    IssueDes: String,
    IssueDocId: String,
    IssueCustomer: String,
    IssueTypeSA: String,
    IssueCreate: String,
    ScreenName: String,
    IssueDeveloperStatus: String,
    IssueImplementerStatus: String,
    IssueRound: Number,
    ImpleSection: Boolean,
    UserId: Number,
    HistoryCheck: Boolean,
    NoAssginCheck: Boolean,
    dialog: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      rejectSuccess: false,
      panel: [0],
      disabledDev: false,
      loading: false,
      mandayProps: true,
      completionMenu: false,
      //menu
      acceptMenu: false,
      startMenu: false,
      expectedMenu: false,
      endIssueMenu: false,
      //date
      manday: null,
      screen_selectDefault: [],
      type_select: [],
      priotity_select: [],
      position_Developers: [],
      position_Developers_System: [],
      position_Implementer: [],
      issue_status_default: [],
      issue_status_developer_default: [],
      issue_status_implement_default: [],
      userInfo: [],
      sendWork: false,
      //user
      user_id: "",
      user_firstname: "",
      user_lastname: "",
      user_position: "",
      userSendWork: null,
      //history btn
      history: false,
      pdf: "",
      //validate
      rules: [(value) => !!value || "Required."],
      dialogSuccess: false,
      //datethai
      createThai: "",
      formattedDateEnd: new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .substr(0, 10),
      formattedDateAccept: new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .substr(0, 10),
      formattedDateStart: new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .substr(0, 10),
      formattedDateExpected: new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .substr(0, 10),
      formattedDateComplete: new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .substr(0, 10),
    };
  },
  created() {
    console.log(" pdf id :", this.id);
    this.getpdfs();
  },
  async mounted() {
    await this.getDefault();
    this.getpdfs();
    console.log(" pdf id :", this.id);
    //   const response = await this.$axios.get(`/issues/getpdf/${this.Id}`);
    //    if (response.status === 200) {
    //   this.pdf = response.data;
    // } else {
    //   this.pdf = "Failed to load PDF document.";
    //   }

    // const blob = new Blob([this.IssueFilename], { type: "application/pdf" });
    // this.pdf = URL.createObjectURL(blob);
  },
  // computed: {
  //   isIssueInProcess() {
  //     return this.IssueStatus !== "รอแก้ไข";
  //   },
  // },
  watch: {
    dialog(newVal) {
      if (newVal) {
        this.getUserSystemsOncreated();
        this.getUser();
        this.checkHistory();
        this.showDate();
      }
    },
  },
  methods: {
    async getpdfs() {
      const response = await this.$axios.get(`/issues/getpdf/${this.id}`);
      if (response.status === 200) {
        this.pdf = response.data;
      } else {
        this.pdf = "Failed to load PDF document.";
      }
    },
    async downloadPDF() {
      const response = await this.$axios.get(`/issues/getpdf/${this.id}`);
      if (response.status === 200) {
        const url = "http://localhost:7777/issues/getpdf/" + this.id;
        window.open(url, "_blank");
      } else {
        alert("ไม่มี PDF ไฟล์ในฐานข้อมูล");
      }
    },

    getUserScreen(selectedUserID) {
      this.userSendWork = selectedUserID;
    },
    checkSendWork() {
      if (this.IssueDeveloperStatus == "กำลังแก้ไข") {
        this.$refs.form.validate();
      }
      if (this.IssueDeveloperStatus == "แก้ไขเรียบร้อย") {
        this.$refs.formCom.validate();
      }
      if (this.IssueDeveloperStatus == "แก้ไขไม่ได้") {
        this.$axios
          .get("/user_systems/getOneScreenID/" + this.SystemId)
          .then((res) => {
            this.position_Developers_System = res.data.filter(
              (item) =>
                item.user_position === "Developer" &&
                item.user_firstname !== this.IssueAssign
            );
          });

        this.sendWork = true;
      } else {
        this.sendWork = false;
      }
    },
    checkStatus() {
      if (this.IssueDeveloperStatus != "แก้ไขเรียบร้อย") {
        this.ImpleSection = false;
      }
      if (this.IssueDeveloperStatus == "แก้ไขเรียบร้อย") {
        this.IssueStatus = "แก้ไขเรียบร้อย";
      }
      if (this.IssueDeveloperStatus == "กำลังแก้ไข") {
        this.IssueStatus = "กำลังแก้ไข";
        this.ImpleSection = false;
      }
      if (this.IssueDeveloperStatus == "รอแก้ไข") {
        this.IssueStatus = "รอแก้ไข";
        this.ImpleSection = false;
      }
      if (this.IssueDeveloperStatus == "แก้ไขไม่ได้") {
        this.sendWork = true;
        this.IssueStatus = "รอแก้ไข";
      } else {
        this.sendWork = false;
      }
    },
    checkAssign() {
      const dev = this.IssueAssign?.user_firstname ?? null;
      const devId = this.IssueAssign?.id ?? null;
      this.IssueAssign = dev;
      this.IssueUserAssignId = devId;
    },
    checkAssign2() {
      const qc = this.IssueQC?.user_firstname ?? null;
      const qcId = this.IssueQC?.id ?? null;
      this.IssueQC = qc;
      this.IssueUserQCId = qcId;
    },
    async saveIssue() {
      this.checkStatus();
      if (this.IssueManday == "") {
        this.IssueManday = 0;
      }
      //แอดคนเข้า screen
      if (this.userSendWork !== null) {
        try {
          const existingUserDevScreen = await this.$axios.get(
            "/user_screens/getOneUserID/" + this.userSendWork
          );
          if (existingUserDevScreen.data.length === 0) {
            await this.$axios.post("/user_screens/createUser_screen", {
              user_id: [this.userSendWork], //id new person
              screen_id: this.IssueScreenId,
              system_id: this.SystemId,
              project_id: this.ProjectId,
            });
            // alert("addUser_Screen Dev Success!!");
          } else {
            // alert("User already exists in user_screens");
          }
        } catch (error) {
          console.log("user_screen: " + error);
        }
      }
      //แก้ไขไม่ไ้ด ส่งต่อคนอื่น
      if (this.IssueDeveloperStatus == "แก้ไขไม่ได้") {
        const dataHistoryDev = {
          screen_id: this.IssueScreenId,
          system_id: this.SystemId,
          project_id: this.ProjectId,
          issues_id: this.id,
          user_assign_id: this.IssueAssign.id,
          user_qc_id: this.IssueAssign.id,
          issue_name: this.IssueName,
          issue_id: this.IssueId,
          issue_type: this.IssueType,
          issue_informer: this.IssueInformer,
          issue_priority: this.IssuePriority,
          issue_end: this.IssueEndDate,
          issue_assign: this.IssueAssign.user_firstname,
          issue_qc: this.IssueQC,
          issue_des: this.IssueDes,
          issue_des_sa: this.IssueDesSA,
          issue_type_sa: this.IssueTypeSA,
          issue_doc_id: this.IssueDocId,
          issue_customer: this.IssueCustomer,
          issue_filename: this.IssueFilename,
          issue_des_dev: this.IssueDesDev,
          issue_des_implementer: this.IssueDesImplementer,
          issue_start: this.IssueStart,
          issue_expected: this.IssueExpected,
          issue_status: this.IssueStatus,
          issue_accepting: this.IssueAccepting,
          issue_manday: this.IssueManday,
          issue_complete: this.IssueComplete,
          issue_status_developer: this.IssueDeveloperStatus,
          issue_status_implement: this.IssueImplementerStatus,
          issue_round: this.IssueRound,
          user_updated: this.user_firstname,
          user_position_updated: this.user_position,
          user_id_updated: this.user_id,
        };
        const data = {
          screen_id: this.IssueScreenId,
          system_id: this.SystemId,
          project_id: this.ProjectId,
          user_assign_id: this.IssueUserAssignId,
          user_qc_id: this.IssueUserQCId,
          issue_name: this.IssueName,
          issue_id: this.IssueId,
          issue_type: this.IssueType,
          issue_informer: this.IssueInformer,
          issue_priority: this.IssuePriority,
          issue_end: this.IssueEndDate,
          issue_assign: this.IssueAssign.user_firstname,
          issue_qc: this.IssueQC,
          issue_des: this.IssueDes,
          issue_des_sa: this.IssueDesSA,
          issue_type_sa: this.IssueTypeSA,
          issue_doc_id: this.IssueDocId,
          issue_customer: this.IssueCustomer,
          issue_filename: this.IssueFilename,
          issue_des_dev: this.IssueDesDev,
          issue_des_implementer: this.IssueDesImplementer,
          issue_start: this.IssueStart,
          issue_expected: this.IssueExpected,
          issue_status: this.IssueStatus,
          issue_accepting: this.IssueAccepting,
          issue_manday: this.IssueManday,
          issue_complete: this.IssueComplete,
          issue_status_developer: this.IssueDeveloperStatus,
          issue_status_implement: this.IssueImplementerStatus,
          issue_round: this.IssueRound,
        };
        try {
          await this.$axios.post(
            "/history_issues/createIssueHistory/",
            dataHistoryDev
          );
          await this.$axios.put("/issues/updateIssueAdmin/" + this.id, data);
          this.$emit("button-clicked");
          // this.handleClose();

          const promise = new Promise((resolve, reject) => {
            resolve();
            // this.close();
          });
          promise.then(() => {
            setTimeout(() => {
              // alert("success");
            }, 2000);
          });
        } catch (error) {
          console.error(error);
          alert("Error submitting form");
        }

        this.IssueDesDev = null;
        this.IssueDesImplementer = null;
        this.IssueStart = null;
        this.IssueExpected = null;
        this.IssueStatus = "รอแก้ไข";
        this.IssueAccepting = null;
        this.IssueManday = 0;
        this.IssueComplete = null;
        this.IssueDeveloperStatus = "รอแก้ไข";
        this.IssueImplementerStatus = null;
        this.IssueRound = 0;
        this.IssueAssign = this.IssueAssign.user_firstname;
        this.IssueUserAssignId = this.userSendWork;
      }
      //ตรวจสอบไม่ผ่านเริ่มใหม่ + เก็บรอบ
      if (this.IssueImplementerStatus == "ตรวจสอบไม่ผ่าน") {
        this.IssueRound += 1;
        this.IssueStatus = "รอแก้ไข";
        this.IssueDeveloperStatus = "รอแก้ไข";
        this.IssueAccepting = null;
        this.IssueStart = null;
        this.IssueExpected = null;
        this.IssueManday = 0;
        this.IssueDesDev = null;
        this.IssueComplete = null;
        this.IssueImplementerStatus = null;
        this.IssueStatus = "ตรวจสอบไม่ผ่าน";
      }
      //ตรวจสอบผ่านเก็บประวัติ ปิดจบ
      if (this.IssueImplementerStatus == "ตรวจสอบผ่าน") {
        this.IssueStatus = "ตรวจสอบผ่าน";
        const dataHistory = {
          screen_id: this.IssueScreenId,
          system_id: this.SystemId,
          project_id: this.ProjectId,
          issues_id: this.id,
          user_assign_id: this.IssueUserAssignId,
          user_qc_id: this.IssueUserQCId,
          issue_name: this.IssueName,
          issue_id: this.IssueId,
          issue_type: this.IssueType,
          issue_informer: this.IssueInformer,
          issue_priority: this.IssuePriority,
          issue_end: this.IssueEndDate,
          issue_assign: this.IssueAssign,
          issue_qc: this.IssueQC,
          issue_des: this.IssueDes,
          issue_des_sa: this.IssueDesSA,
          issue_type_sa: this.IssueTypeSA,
          issue_doc_id: this.IssueDocId,
          issue_customer: this.IssueCustomer,
          issue_filename: this.IssueFilename,
          issue_des_dev: this.IssueDesDev,
          issue_des_implementer: this.IssueDesImplementer,
          issue_start: this.IssueStart,
          issue_expected: this.IssueExpected,
          issue_status: this.IssueStatus,
          issue_accepting: this.IssueAccepting,
          issue_manday: this.IssueManday,
          issue_complete: this.IssueComplete,
          issue_status_developer: this.IssueDeveloperStatus,
          issue_status_implement: this.IssueImplementerStatus,
          issue_round: this.IssueRound,
          user_updated: this.user_firstname,
          user_position_updated: this.user_position,
          user_id_updated: this.user_id,
        };
        try {
          await this.$axios.post(
            "/history_issues/createIssueHistory/",
            dataHistory
          );
          this.$emit("button-clicked");
          // this.handleClose();
          this.dialogSuccess = true;
          const promise = new Promise((resolve, reject) => {
            resolve();
            // this.close();
          });
          promise.then(() => {
            setTimeout(() => {
              // alert("success");
            }, 2000);
          });
        } catch (error) {
          console.error(error);
          alert("Error submitting form");
        }

        const data = {
          screen_id: this.IssueScreenId,
          system_id: this.SystemId,
          project_id: this.ProjectId,
          user_assign_id: this.IssueUserAssignId,
          user_qc_id: this.IssueUserQCId,
          issue_name: this.IssueName,
          issue_id: this.IssueId,
          issue_type: this.IssueType,
          issue_informer: this.IssueInformer,
          issue_priority: this.IssuePriority,
          issue_end: this.IssueEndDate,
          issue_assign: this.IssueAssign,
          issue_qc: this.IssueQC,
          issue_des: this.IssueDes,
          issue_des_sa: this.IssueDesSA,
          issue_type_sa: this.IssueTypeSA,
          issue_doc_id: this.IssueDocId,
          issue_customer: this.IssueCustomer,
          issue_filename: this.IssueFilename,
          issue_des_dev: this.IssueDesDev,
          issue_des_implementer: this.IssueDesImplementer,
          issue_start: this.IssueStart,
          issue_expected: this.IssueExpected,
          issue_status: this.IssueStatus,
          issue_accepting: this.IssueAccepting,
          issue_manday: this.IssueManday,
          issue_complete: this.IssueComplete,
          issue_status_developer: this.IssueDeveloperStatus,
          issue_status_implement: this.IssueImplementerStatus,
          issue_round: this.IssueRound,
        };
        const dataHistoryUpdate = {
          screen_id: this.IssueScreenId,
          system_id: this.SystemId,
          project_id: this.ProjectId,
          issues_id: this.id,
          user_assign_id: this.IssueUserAssignId,
          user_qc_id: this.IssueUserQCId,
          issue_name: this.IssueName,
          issue_id: this.IssueId,
          issue_type: this.IssueType,
          issue_informer: this.IssueInformer,
          issue_priority: this.IssuePriority,
          issue_end: this.IssueEndDate,
          issue_assign: this.IssueAssign,
          issue_qc: this.IssueQC,
          issue_des: this.IssueDes,
          issue_des_sa: this.IssueDesSA,
          issue_type_sa: this.IssueTypeSA,
          issue_doc_id: this.IssueDocId,
          issue_customer: this.IssueCustomer,
          issue_filename: this.IssueFilename,
          issue_des_dev: this.IssueDesDev,
          issue_des_implementer: this.IssueDesImplementer,
          issue_start: this.IssueStart,
          issue_expected: this.IssueExpected,
          issue_status: this.IssueStatus,
          issue_accepting: this.IssueAccepting,
          issue_manday: this.IssueManday,
          issue_complete: this.IssueComplete,
          issue_status_developer: this.IssueDeveloperStatus,
          issue_status_implement: this.IssueImplementerStatus,
          issue_round: this.IssueRound,
          user_updated: this.user_firstname,
          user_position_updated: this.user_position,
          user_id_updated: this.user_id,
        };
        try {
          await this.$axios.put("/issues/updateIssueAdmin/" + this.id, data);
          await this.$axios.post(
            "/history_issues/createIssueHistory/",
            dataHistoryUpdate
          );
          this.$emit("button-clicked");
          // this.handleClose();
          this.dialogSuccess = true;
          const promise = new Promise((resolve, reject) => {
            resolve();
            // this.close();
          });
          promise.then(() => {
            setTimeout(() => {
              // alert("update success");
            }, 2000);
          });
        } catch (error) {
          console.error(error);
          alert("Error submitting form");
        }
      }
      //ใส่วันเสร็จแต่ไม่ยอมปรับสถานะ จะปรับอัตโนมัติ
      else if (this.IssueComplete !== null) {
        this.IssueDeveloperStatus = "แก้ไขเรียบร้อย";
        this.IssueStatus = "แก้ไขเรียบร้อย";
        // alert("แก้ไขเรียบร้อย");
        this.post(this.IssueStatus, this.IssueDeveloperStatus);
      }
      //ปรับสถานะเป็นแก้ไข้เรียบร้อย แต่ไม่ใส่วันที่ ให้กลับไปใส่
      else if (this.IssueDeveloperStatus === "แก้ไขเรียบร้อย") {
        if (this.IssueComplete === null) {
          this.$refs.form.validate();
          this.IssueStatus = "รอแก้ไข";
          alert("กรุณากรอกวันที่เสร็จด้วย");
        } else if (this.IssueComplete != null) {
          this.IssueStatus = "แก้ไขเรียบร้อยแล้ว";
          // alert("แก้ไขเรียบร้อย");
          this.post(this.IssueStatus, this.IssueDeveloperStatus);
        }
      }

      // เช็คว่ากำลังแก้ไข แล้วค่าวันที่ว่างมั้ย
      else if (this.IssueDeveloperStatus === "กำลังแก้ไข") {
        if (
          this.IssueAccepting === null ||
          this.IssueStart === null ||
          this.IssueExpected === null
        ) {
          this.$refs.form.validate();
          this.IssueStatus = "รอแก้ไข";
          alert("กรุณากรอกวันที่ให้ครบถ้วน");
        } else {
          this.IssueStatus = "กำลังแก้ไข";
          // alert(this.IssueDeveloperStatus);
          this.post(this.IssueStatus, this.IssueDeveloperStatus);
        }
      }
      // ถ้า dev กรอกวันที่ตัวใดตัวนึงและไม่ปรับสถานะต้องมากรอกสถานะก่อน
      else if (this.IssueDeveloperStatus === null) {
        if (
          this.IssueAccepting === null ||
          this.IssueStart === null ||
          this.IssueExpected === null
        ) {
          this.$refs.form.validate();
          this.IssueStatus = "รอแก้ไข";
          alert("กรุณากรอกวันที่ให้ครบถ้วนและมากรอกสถานะด้วย");
        }
      }

      // กรอกวันที่ครบ จะปรับสถานะเป็น กำลังแก้ไข อัติโนมัติ
      else if (
        this.IssueAccepting != null &&
        this.IssueStart != null &&
        this.IssueExpected != null
      ) {
        this.IssueDeveloperStatus = "กำลังแก้ไข";
        this.IssueStatus = "กำลังแก้ไข";
        // alert("กำลังแก้ไข");
        this.post(this.IssueStatus, this.IssueDeveloperStatus);
      }

      // ไม่กรอกวันที่ แต่มี สถานะ
      else if (this.IssueDeveloperStatus === "รอแก้ไข") {
        if (
          this.IssueAccepting != null ||
          this.IssueStart != null ||
          this.IssueExpected != null
        ) {
          this.IssueStatus = "กำลังแก้ไข";
          this.IssueDeveloperStatus = "กำลังแก้ไข";
          this.post(this.IssueStatus, this.IssueDeveloperStatus);
        } else {
          this.post(this.IssueStatus, this.IssueDeveloperStatus);
        }
      }
    },
    async post(status, statusdev) {
      const data = {
        screen_id: this.IssueScreenId,
        system_id: this.SystemId,
        project_id: this.ProjectId,
        user_assign_id: this.IssueUserAssignId,
        user_qc_id: this.IssueUserQCId,
        issue_name: this.IssueName,
        issue_id: this.IssueId,
        issue_type: this.IssueType,
        issue_informer: this.IssueInformer,
        issue_priority: this.IssuePriority,
        issue_end: this.IssueEndDate,
        issue_assign: this.IssueAssign,
        issue_qc: this.IssueQC,
        issue_des: this.IssueDes,
        issue_des_sa: this.IssueDesSA,
        issue_type_sa: this.IssueTypeSA,
        issue_doc_id: this.IssueDocId,
        issue_customer: this.IssueCustomer,
        issue_filename: this.IssueFilename,
        issue_des_dev: this.IssueDesDev,
        issue_des_implementer: this.IssueDesImplementer,
        issue_start: this.IssueStart,
        issue_expected: this.IssueExpected,
        issue_status: status,
        issue_accepting: this.IssueAccepting,
        issue_manday: this.IssueManday,
        issue_complete: this.IssueComplete,
        issue_status_developer: statusdev,
        issue_status_implement: this.IssueImplementerStatus,
        issue_round: this.IssueRound,
      };
      const dataHistoryUpdate = {
        screen_id: this.IssueScreenId,
        system_id: this.SystemId,
        project_id: this.ProjectId,
        issues_id: this.id,
        user_assign_id: this.IssueUserAssignId,
        user_qc_id: this.IssueUserQCId,
        issue_name: this.IssueName,
        issue_id: this.IssueId,
        issue_type: this.IssueType,
        issue_informer: this.IssueInformer,
        issue_priority: this.IssuePriority,
        issue_end: this.IssueEndDate,
        issue_assign: this.IssueAssign,
        issue_qc: this.IssueQC,
        issue_des: this.IssueDes,
        issue_des_sa: this.IssueDesSA,
        issue_type_sa: this.IssueTypeSA,
        issue_doc_id: this.IssueDocId,
        issue_customer: this.IssueCustomer,
        issue_filename: this.IssueFilename,
        issue_des_dev: this.IssueDesDev,
        issue_des_implementer: this.IssueDesImplementer,
        issue_start: this.IssueStart,
        issue_expected: this.IssueExpected,
        issue_status: status,
        issue_accepting: this.IssueAccepting,
        issue_manday: this.IssueManday,
        issue_complete: this.IssueComplete,
        issue_status_developer: statusdev,
        issue_status_implement: this.IssueImplementerStatus,
        issue_round: this.IssueRound,
        user_updated: this.user_firstname,
        user_position_updated: this.user_position,
        user_id_updated: this.user_id,
      };
      try {
        await this.$axios.put("/issues/updateIssueAdmin/" + this.id, data);
        await this.$axios.post(
          "/history_issues/createIssueHistory/",
          dataHistoryUpdate
        );
        this.$emit("button-clicked");
        this.$refs.form.resetValidation();
        this.$refs.formCom.resetValidation();
        // this.handleClose();
        this.dialogSuccess = true;
        const promise = new Promise((resolve, reject) => {
          resolve();
          // this.close();
        });
        promise.then(() => {
          setTimeout(() => {
            // alert("update success last version");
          }, 2000);
        });
      } catch (error) {
        console.error(error);
        alert("Error submitting form");
      }
    },
    handleClose() {
      this.$refs.form.resetValidation();
      this.panel = [0];
      this.disabled = false;
      this.history = false;
      this.sendWork = false;
      this.$emit("update:dialog", false);
    },
    async getDefault() {
      try {
        const resScreen = await this.$axios.get(
          "/screens/getAll?project_id=" +
            this.ProjectId +
            "&&system_id=" +
            this.SystemId
        );
        this.screen_selectDefault = resScreen.data;

        const resDefault = await this.$axios.get("/default_settings/getAll");
        this.default = resDefault.data;
        this.default.forEach((item) => {
          if (item.issue_type) {
            this.type_select.push(item.issue_type);
          }
          if (item.issue_priority) {
            this.priotity_select.push(item.issue_priority);
          }
          if (item.issue_status) {
            this.issue_status_default.push(item.issue_status);
          }
          if (item.developer_status) {
            this.issue_status_developer_default.push(item.developer_status);
          }
          if (item.implement_status) {
            this.issue_status_implement_default.push(item.implement_status);
          }
        });
      } catch (error) {
        console.error(error);
      }
    },
    async getUserSystemsOncreated() {
      await this.$axios
        .get("/user_screens/getOneScreenID/" + this.IssueScreenId)
        .then((data) => {
          this.position_Developers = data.data.filter(
            (item) => item.user_position === "Developer"
          );
          this.position_Implementer = data.data.filter(
            (item) => item.user_position === "Implementer"
          );
        });
    },
    async getUserSystems(selectedScreenID) {
      this.IssueScreenId = selectedScreenID;
      await this.$axios
        .get("/user_screens/getOneScreenID/" + selectedScreenID)
        .then((data) => {
          this.position_Developers = data.data.filter(
            (item) => item.user_position === "Developer"
          );
          this.position_Implementer = data.data.filter(
            (item) => item.user_position === "Implementer"
          );
          this.checkAssign();
          this.checkAssign2();
        });
    },
    async getUser() {
      await this.$axios.get("/users/getOne/" + this.UserId).then((res) => {
        this.userInfo = res.data;
        this.user_id = res.data[0].user_id;
        this.user_firstname = res.data[0].user_firstname;
        this.user_lastname = res.data[0].user_lastname;
        this.user_position = res.data[0].user_position;
      });
    },
    issueReject() {
      try {
        this.$axios.delete("/issues/delete/" + this.id).then((res) => {
          // alert("Reject Success!!");
          this.rejectSuccess = true;
          this.$emit("button-clicked");
          this.handleClose();
        });
      } catch (error) {
        console.log(error);
      }
    },
    checkHistory() {
      try {
        this.$axios
          .get("/history_issues/getAll?issues_id=" + this.id)
          .then((res) => {
            if (res.data.length > 0) {
              this.history = true;
            }
          });
      } catch (error) {
        console.log(error);
      }
    },
    showDate() {
      console.log("show data");
      //end date
      if (this.IssueEndDate != null) {
        this.formattedDateEnd = moment(this.IssueEndDate)
          .add(543, "years")
          .format("DD-MM-YYYY");
      } else {
        this.formattedDateEnd = "No day";
      }
      //Accepting date
      if (this.IssueAccepting != null) {
        this.formattedDateAccept = moment(this.IssueAccepting)
          .add(543, "years")
          .format("DD-MM-YYYY");
      } else {
        this.formattedDateAccept = "No day";
      }
      //Start date
      if (this.IssueStart != null) {
        this.formattedDateStart = moment(this.IssueStart)
          .add(543, "years")
          .format("DD-MM-YYYY");
      } else {
        this.formattedDateStart = "No day";
      }
      //Expected date
      if (this.IssueExpected != null) {
        this.formattedDateExpected = moment(this.IssueExpected)
          .add(543, "years")
          .format("DD-MM-YYYY");
      } else {
        this.formattedDateExpected = "No day";
      }
      //complete date
      if (this.IssueComplete != null) {
        this.formattedDateComplete = moment(this.IssueComplete)
          .add(543, "years")
          .format("DD-MM-YYYY");
      } else {
        this.formattedDateComplete = "No day";
      }
      //create date
      if (this.IssueCreate != null) {
        this.createThai = moment(this.IssueCreate, "YYYY-MM-DD")
          .add(543, "years")
          .format("DD-MM-YYYY");
      } else {
        this.createThai = "No day";
      }
    },
    changeDate() {
      const formattedDateEnd = moment(this.IssueEndDate)
        .add(543, "years")
        .format("DD-MM-YYYY");
      this.formattedDateEnd = formattedDateEnd;
      //Accepting date
      const formattedDateAccept = moment(this.IssueAccepting)
        .add(543, "years")
        .format("DD-MM-YYYY");
      this.formattedDateAccept = formattedDateAccept;
      //Start date
      const formattedDateStart = moment(this.IssueStart)
        .add(543, "years")
        .format("DD-MM-YYYY");
      this.formattedDateStart = formattedDateStart;
      //Expected date
      const formattedDateExpected = moment(this.IssueExpected)
        .add(543, "years")
        .format("DD-MM-YYYY");
      this.formattedDateExpected = formattedDateExpected;
      //complete date
      const formattedDateComplete = moment(this.IssueComplete)
        .add(543, "years")
        .format("DD-MM-YYYY");
      this.formattedDateComplete = formattedDateComplete;
    },
  },
};
</script>

<style scoped>
* {
  font-family: "Lato", sans-serif;
}

.v-text-field >>> .v-input__slot {
  min-height: 20px !important;
}
.v-btn:not(.v-btn--round).v-size--default {
  height: 36px;
  min-width: 147px;
  /* padding: 0 16px; */
}
</style>