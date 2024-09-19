<template>
  <div class="body">
    <!-- <Searchbar title="รายการปัญหา " /> -->
    <Searchbar :title="'รายการปัญหา'" :search="yourSearchData" />
    <v-divider></v-divider>
    <!-- *Header* -->
    <v-row class="mt-4 ml-2 mb-2">
      <h3>
        {{ project_id }} : {{ project_name_ENG }} ({{ project_shortname }})
      </h3>
      <p style="color: #b6b5b5; font-size: 16px" class="ml-2">
        {{ systemslength }} ระบบ
      </p>
    </v-row>
    <!-- * box -->
    <v-expansion-panels>
      <v-expansion-panel
        class="mb-4"
        v-for="(system, index) in systemsList"
        :key="index"
      >
        <v-expansion-panel-header style="background-color: #009933">
          <template v-slot:actions>
            <v-icon color="white"> $expand </v-icon>
          </template>
          <template>
            <v-row no-gutters>
              <v-col cols="12">
                <v-row style="margin-top: 1px">
                  <h3 style="color: white; margin-bottom: 10px">
                    {{ system.system_shortname }} &nbsp;
                    {{ system.system_nameTH }}
                  </h3>
                  <!-- <p style="color: #b6b5b5; font-size: 16px; margin-left: 5%">
                    3 Issue
                  </p> -->
                </v-row>
              </v-col>
            </v-row>
          </template>
        </v-expansion-panel-header>

        <!-- *content -->
        <v-expansion-panel-content class="mt-2">
          <v-row justify="center" align="center">
            <v-row class="mt-5 ml-5">
              <v-col>
                <v-btn
                  v-if="user_role == 'Admin' || user_position == 'Implementer'"
                  class="new-btn"
                  color="primary"
                  dark
                  v-bind="attrs"
                  v-on="on"
                  block
                  style="width: 400px"
                  large
                  @click="
                    showIssueCreateDialog(
                      system.system_nameTH,
                      system.id,
                      system.system_id,
                      system.system_shortname
                    )
                  "
                >
                  <span
                    class="mdi mdi-plus-circle-outline"
                    style="font-size: 25px; color: white"
                  ></span>
                  <h3 style="color: white; font-weight: bolder">
                    สร้างปัญหาใหม่
                  </h3>
                </v-btn>
              </v-col>
              <v-spacer></v-spacer>
              <v-col>
                <v-text-field
                  v-model="searchText"
                  placeholder="Search"
                  filled
                  rounded
                  outlinde
                  prepend-inner-icon="mdi-magnify"
                  dense
                  style="width: 500px"
                ></v-text-field>
              </v-col>
            </v-row>
            <!-- *dialog -->
            <dialog-issue
              :dialog.sync="dialog"
              :projectName="projectName"
              :systemName="infoCreate.systemName"
              :systemids="infoCreate.system_id"
              :projectId="projectId"
              :projectids="project_id"
              :systemId="infoCreate.systemId"
              :systemShortname="infoCreate.systemShortname"
              mode="create"
              :userFirstname="user_firstname"
              :userLastname="user_lastname"
              :userId="userId"
              :runningNumber="runningNumber"
              @button-clicked="getIssue()"
            />
          </v-row>
          <!-- *tabs -->
          <v-tabs
            fixed-tabs
            v-model="tab"
            next-icon="mdi-menu-right-outline"
            prev-icon="mdi-menu-left-outline"
            show-arrows
            color="#454545"
            class="mt-5 mb-3"
          >
            <v-tab
              :style="tab1 ? 'background-color:#454545;' : null"
              @click="
                (tab1 = true),
                  (tab2 = false),
                  (tab3 = false),
                  (tab4 = false),
                  (tab5 = false)
              "
            >
              <h3 :style="tab1 ? 'color:#ffff;' : 'color:#000;'">My issue</h3>
            </v-tab>
            <v-tab
              :style="tab2 ? 'background-color: #454545;' : null"
              @click="
                (tab1 = false),
                  (tab2 = true),
                  (tab3 = false),
                  (tab4 = false),
                  (tab5 = false)
              "
            >
              <h3 :style="tab2 ? 'color:#ffff;' : 'color:#000;'">PNI</h3>
            </v-tab>
            <v-tab
              :style="tab3 ? 'background-color:#454545;' : null"
              @click="
                (tab1 = false),
                  (tab2 = false),
                  (tab3 = true),
                  (tab4 = false),
                  (tab5 = false)
              "
            >
              <h3 :style="tab3 ? 'color:#ffff;' : 'color:#000;'">PNC</h3>
            </v-tab>
            <v-tab
              :style="tab4 ? 'background-color:#454545;' : null"
              @click="
                (tab1 = false),
                  (tab2 = false),
                  (tab3 = false),
                  (tab4 = true),
                  (tab5 = false)
              "
            >
              <h3 :style="tab4 ? 'color:#ffff;' : 'color:#000;'">NewReq</h3>
            </v-tab>
            <v-tab
              :style="tab5 ? 'background-color:#454545;' : null"
              @click="
                (tab1 = false),
                  (tab2 = false),
                  (tab3 = false),
                  (tab4 = false),
                  (tab5 = true)
              "
            >
              <h3 :style="tab5 ? 'color:#ffff;' : 'color:#000;'">
                เเก้ไขเสร็จเเล้ว
              </h3>
            </v-tab>
          </v-tabs>
          <!-- Dialog Admin Dev Implementer -->
          <dialog-issue-detail
            :dialog.sync="dialogIssueDetail"
            :ProjectName="projectName"
            :ProjectId="projectId"
            :SystemName="system.system_nameTH"
            :SystemId="system.id"
            :id="selected.Id"
            :IssueUserAssignId="selected.user_assign_id"
            :IssueUserQCId="selected.user_qc_id"
            :IssueId="selected.issue_id"
            :IssueType="selected.issue_type"
            :IssueScreenId="selected.screen_id"
            :IssueStatus="selected.issue_status"
            :IssuePriority="selected.issue_priority"
            :IssueEndDate="selected.formattedDateEnd"
            :IssueName="selected.issue_name"
            :IssueDesSA="selected.issue_des_sa"
            :IssueInformer="selected.issue_informer"
            :IssueAssign="selected.issue_assign"
            :IssueQC="selected.issue_qc"
            :IssueFilename="selected.issue_filename"
            :IssueAccepting="selected.formattedDateAccepting"
            :IssueManday="selected.issue_manday"
            :IssueStart="selected.formattedDateStart"
            :IssueExpected="selected.formattedDateExpected"
            :IssueComplete="selected.issue_complete"
            :IssueDesImplementer="selected.issue_des_implementer"
            :IssueDesDev="selected.issue_des_dev"
            :IssueDes="selected.issue_des"
            :IssueDocId="selected.issue_doc_id"
            :IssueCustomer="selected.issue_customer"
            :IssueTypeSA="selected.issue_type_sa"
            :IssueCreate="selected.created_at"
            :ScreenName="selected.screenName"
            :IssueDeveloperStatus="selected.issue_status_developer"
            :IssueImplementerStatus="selected.issue_status_implement"
            :IssueRound="selected.issue_round"
            :ImpleSection="selected.impleSection"
            :UserId="selected.userId"
            :HistoryCheck="selected.history"
            :NoAssginCheck="selected.no_assign"
            @button-clicked="getIssue()"
          />
          <dialog-issue-imple
            :dialog.sync="dialogIssueImple"
            :ProjectName="projectName"
            :ProjectId="projectId"
            :SystemName="system.system_nameTH"
            :SystemId="system.id"
            :id="selected.Id"
            :IssueUserAssignId="selected.user_assign_id"
            :IssueUserQCId="selected.user_qc_id"
            :IssueId="selected.issue_id"
            :IssueType="selected.issue_type"
            :IssueScreenId="selected.screen_id"
            :IssueStatus="selected.issue_status"
            :IssuePriority="selected.issue_priority"
            :IssueEndDate="selected.formattedDateEnd"
            :IssueName="selected.issue_name"
            :IssueDesSA="selected.issue_des_sa"
            :IssueInformer="selected.issue_informer"
            :IssueAssign="selected.issue_assign"
            :IssueQC="selected.issue_qc"
            :IssueFilename="selected.issue_filename"
            :IssueAccepting="selected.formattedDateAccepting"
            :IssueManday="selected.issue_manday"
            :IssueStart="selected.formattedDateStart"
            :IssueExpected="selected.formattedDateExpected"
            :IssueComplete="selected.issue_complete"
            :IssueDesImplementer="selected.issue_des_implementer"
            :IssueDesDev="selected.issue_des_dev"
            :IssueDes="selected.issue_des"
            :IssueDocId="selected.issue_doc_id"
            :IssueCustomer="selected.issue_customer"
            :IssueTypeSA="selected.issue_type_sa"
            :IssueCreate="selected.created_at"
            :ScreenName="selected.screenName"
            :IssueDeveloperStatus="selected.issue_status_developer"
            :IssueImplementerStatus="selected.issue_status_implement"
            :IssueRound="selected.issue_round"
            :ImpleSection="selected.impleSection"
            :UserId="selected.userId"
            :HistoryCheck="selected.history"
            :NoAssginCheck="selected.no_assign"
            @button-clicked="getIssue()"
          />
          <dialog-issue-dev
            :dialog.sync="dialogIssueDev"
            :ProjectName="projectName"
            :ProjectId="projectId"
            :SystemName="system.system_nameTH"
            :SystemId="system.id"
            :id="selected.Id"
            :IssueUserAssignId="selected.user_assign_id"
            :IssueUserQCId="selected.user_qc_id"
            :IssueId="selected.issue_id"
            :IssueType="selected.issue_type"
            :IssueScreenId="selected.screen_id"
            :IssueStatus="selected.issue_status"
            :IssuePriority="selected.issue_priority"
            :IssueEndDate="selected.formattedDateEnd"
            :IssueName="selected.issue_name"
            :IssueDesSA="selected.issue_des_sa"
            :IssueInformer="selected.issue_informer"
            :IssueAssign="selected.issue_assign"
            :IssueQC="selected.issue_qc"
            :IssueFilename="selected.issue_filename"
            :IssueAccepting="selected.formattedDateAccepting"
            :IssueManday="selected.issue_manday"
            :IssueStart="selected.formattedDateStart"
            :IssueExpected="selected.formattedDateExpected"
            :IssueComplete="selected.issue_complete"
            :IssueDesImplementer="selected.issue_des_implementer"
            :IssueDesDev="selected.issue_des_dev"
            :IssueDes="selected.issue_des"
            :IssueDocId="selected.issue_doc_id"
            :IssueCustomer="selected.issue_customer"
            :IssueTypeSA="selected.issue_type_sa"
            :IssueCreate="selected.created_at"
            :ScreenName="selected.screenName"
            :IssueDeveloperStatus="selected.issue_status_developer"
            :IssueImplementerStatus="selected.issue_status_implement"
            :IssueRound="selected.issue_round"
            :ImpleSection="selected.impleSection"
            :UserId="selected.userId"
            :HistoryCheck="selected.history"
            :NoAssginCheck="selected.no_assign"
            @button-clicked="getIssue()"
          />
          <v-tabs-items v-model="tab">
            <v-tab-item>
              <!-- *cardAll -->
              <!-- *Table assignedIssues -->
              <v-data-table
                :headers="headers"
                :items="system.assignedIssues"
                :sort-by="['created_at']"
                :sort-desc="[true]"
                class="v-data-table elevation-1 mb-2"
                :search="search"
                :style="{ 'background-color': tableColor }"
              >
                <template v-slot:top>
                  <v-toolbar
                    flat
                    class="mb-5"
                    style="background-color: #90f28e"
                  >
                    <v-toolbar-title>
                      <h5 class="pa-1" style="text-align: left">
                        ปัญหาที่มีคนรับผิดชอบ
                      </h5>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-text-field
                      class="pa-2"
                      style="background-color: white"
                      v-model="search"
                      append-icon="mdi-magnify"
                      label="Search"
                      single-line
                      hide-details
                      rounded
                    ></v-text-field>
                  </v-toolbar>
                </template>
                <template v-slot:item="{ item }">
                  <tr>
                    <td>
                      {{ item.issue_id }}
                    </td>
                    <td>
                      {{ item.issue_name }}
                    </td>
                    <td>
                      {{ item.issue_type }}
                    </td>
                    <td>{{ item.formattedDateEnd }}</td>
                    <td>{{ item.issue_status }}</td>
                    <td>
                      <v-icon
                        v-show="item.issue_priority == 'Critical'"
                        style="color: #ff0000"
                        >mdi-flag</v-icon
                      >
                      <v-icon
                        v-show="item.issue_priority == 'Hight'"
                        style="color: #ffa500"
                        >mdi-flag</v-icon
                      >
                      <v-icon
                        v-show="item.issue_priority == 'Medium'"
                        style="color: #ffff00"
                        >mdi-flag</v-icon
                      >
                      <v-icon
                        v-show="item.issue_priority == 'Low'"
                        style="color: #00ff00"
                        >mdi-flag</v-icon
                      >
                      {{ item.issue_priority }}
                    </td>
                    <td>
                      <span
                        v-if="
                          item.issue_assign == null || item.issue_assign == ''
                        "
                        >N/A</span
                      >
                      {{ item.issue_assign }}
                    </td>
                    <td>
                      {{ item.issue_qc }}
                      <span v-if="item.issue_qc == null || item.issue_qc == ''">
                        No assign
                      </span>
                    </td>
                    <td>
                      <v-icon
                        class="mr-2"
                        v-if="
                          user_position === 'Implementer' &&
                          user_role !== 'Admin' &&
                          item.issue_qc !== user_firstname &&
                          item.issue_informer !== user_firstname
                        "
                        :disabled="true"
                        size="20"
                        color="primary"
                      >
                        mdi-information
                      </v-icon>
                      <v-icon
                        class="mr-2"
                        v-else-if="
                          user_position === 'Developer' &&
                          user_role !== 'Admin' &&
                          item.issue_assign !== user_firstname
                        "
                        :disabled="true"
                        size="20"
                        color="primary"
                      >
                        mdi-information
                      </v-icon>
                      <v-icon
                        class="mr-2"
                        v-else
                        @click="
                          showIssueDetailDialog(
                            item.id,
                            item.issue_id,
                            item.issue_type,
                            item.screen_id,
                            item.issue_status,
                            item.issue_priority,
                            item.formattedDateEnd,
                            item.issue_name,
                            item.issue_des_sa,
                            item.issue_informer,
                            item.issue_assign,
                            item.issue_qc,
                            item.issue_filename,
                            item.formattedDateAccepting,
                            item.issue_manday,
                            item.formattedDateStart,
                            item.formattedDateExpected,
                            item.formattedDateComplete,
                            item.issue_des_implementer,
                            item.issue_des_dev,
                            item.issue_des,
                            item.issue_customer,
                            item.issue_doc_id,
                            item.issue_type_sa,
                            item.created_at,
                            item.issue_status_developer,
                            item.issue_status_implement,
                            item.issue_round,
                            item.user_assign_id,
                            item.user_qc_id
                          )
                        "
                        size="20"
                        color="primary"
                      >
                        mdi-information
                      </v-icon>
                    </td>
                  </tr>
                </template>
              </v-data-table>

              <!-- *Table 2 unassignedIssues-->
              <v-data-table
                :headers="headers"
                :items="system.unassignedIssues"
                :sort-by="['created_at']"
                :sort-desc="[true]"
                class="v-data-table elevation-1"
                :style="{ 'background-color': tableColor }"
              >
                <template v-slot:top>
                  <v-toolbar
                    flat
                    class="mb-5"
                    style="background-color: #aaaaaa"
                  >
                    <v-toolbar-title>
                      <h5 class="pa-1" style="text-align: left">
                        ปัญหาที่ไม่มีคนรับผิดชอบ
                      </h5>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-text-field
                      class="pa-2"
                      style="background-color: white"
                      v-model="search"
                      append-icon="mdi-magnify"
                      label="Search"
                      single-line
                      hide-details
                      rounded
                    ></v-text-field>
                  </v-toolbar>
                </template>
                <template v-slot:item="{ item }">
                  <tr>
                    <td>
                      {{ item.issue_id }}
                    </td>
                    <td>
                      {{ item.issue_name }}
                    </td>
                    <td>
                      {{ item.issue_type }}
                    </td>
                    <td>{{ item.formattedDateEnd }}</td>
                    <td>{{ item.issue_status }}</td>
                    <td>
                      <v-icon
                        v-show="item.issue_priority == 'Critical'"
                        style="color: #ff0000"
                        >mdi-flag</v-icon
                      >
                      <v-icon
                        v-show="item.issue_priority == 'Hight'"
                        style="color: #ffa500"
                        >mdi-flag</v-icon
                      >
                      <v-icon
                        v-show="item.issue_priority == 'Medium'"
                        style="color: #ffff00"
                        >mdi-flag</v-icon
                      >
                      <v-icon
                        v-show="item.issue_priority == 'Low'"
                        style="color: #00ff00"
                        >mdi-flag</v-icon
                      >
                      {{ item.issue_priority }}
                    </td>
                    <td>
                      <span
                        v-if="
                          item.issue_assign == null || item.issue_assign == ''
                        "
                        >N/A</span
                      >
                      {{ item.issue_assign }}
                    </td>
                    <td>
                      {{ item.issue_qc }}
                      <span v-if="item.issue_qc == null || item.issue_qc == ''">
                        No assign
                      </span>
                    </td>
                    <td>
                      <v-icon
                        class="mr-2"
                        v-if="
                          user_position === 'Implementer' &&
                          user_role !== 'Admin' &&
                          item.issue_qc !== user_firstname &&
                          item.issue_informer !== user_firstname
                        "
                        :disabled="true"
                        size="20"
                        color="primary"
                      >
                        mdi-information
                      </v-icon>
                      <v-icon
                        class="mr-2"
                        v-else-if="
                          user_position === 'Developer' &&
                          user_role !== 'Admin' &&
                          item.issue_assign !== user_firstname
                        "
                        :disabled="true"
                        size="20"
                        color="primary"
                      >
                        mdi-information
                      </v-icon>
                      <v-icon
                        class="mr-2"
                        v-else
                        @click="
                          showIssueDetailDialog(
                            item.id,
                            item.issue_id,
                            item.issue_type,
                            item.screen_id,
                            item.issue_status,
                            item.issue_priority,
                            item.formattedDateEnd,
                            item.issue_name,
                            item.issue_des_sa,
                            item.issue_informer,
                            item.issue_assign,
                            item.issue_qc,
                            item.issue_filename,
                            item.formattedDateAccepting,
                            item.issue_manday,
                            item.formattedDateStart,
                            item.formattedDateExpected,
                            item.formattedDateComplete,
                            item.issue_des_implementer,
                            item.issue_des_dev,
                            item.issue_des,
                            item.issue_customer,
                            item.issue_doc_id,
                            item.issue_type_sa,
                            item.created_at,
                            item.issue_status_developer,
                            item.issue_status_implement,
                            item.issue_round,
                            item.user_assign_id,
                            item.user_qc_id
                          )
                        "
                        size="20"
                        color="primary"
                      >
                        mdi-information
                      </v-icon>
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </v-tab-item>
            <v-tab-item>
              <!-- *card PNI -->
              <!-- *Table assignedIssues -->
              <v-data-table
                :headers="headers"
                :items="system.assignedIssuesPNI"
                :sort-by="['created_at']"
                :sort-desc="[true]"
                class="v-data-table elevation-1 mb-2"
                :style="{ 'background-color': tableColor }"
              >
                <template v-slot:top>
                  <v-toolbar
                    flat
                    class="mb-5"
                    style="background-color: #90f28e"
                  >
                    <v-toolbar-title>
                      <h5 class="pa-1" style="text-align: left">
                        ปัญหาที่มีคนรับผิดชอบ
                      </h5>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-text-field
                      class="pa-2"
                      style="background-color: white"
                      v-model="search"
                      append-icon="mdi-magnify"
                      label="Search"
                      single-line
                      hide-details
                      rounded
                    ></v-text-field>
                  </v-toolbar>
                </template>
                <template v-slot:item="{ item }">
                  <tr>
                    <td>
                      {{ item.issue_id }}
                    </td>
                    <td>
                      {{ item.issue_name }}
                    </td>
                    <td>
                      {{ item.issue_type }}
                    </td>
                    <td>{{ item.formattedDateEnd }}</td>
                    <td>{{ item.issue_status }}</td>
                    <td>
                      <v-icon
                        v-show="item.issue_priority == 'Critical'"
                        style="color: #ff0000"
                        >mdi-flag</v-icon
                      >
                      <v-icon
                        v-show="item.issue_priority == 'Hight'"
                        style="color: #ffa500"
                        >mdi-flag</v-icon
                      >
                      <v-icon
                        v-show="item.issue_priority == 'Medium'"
                        style="color: #ffff00"
                        >mdi-flag</v-icon
                      >
                      <v-icon
                        v-show="item.issue_priority == 'Low'"
                        style="color: #00ff00"
                        >mdi-flag</v-icon
                      >
                      {{ item.issue_priority }}
                    </td>
                    <td>
                      <span
                        v-if="
                          item.issue_assign == null || item.issue_assign == ''
                        "
                        >N/A</span
                      >
                      {{ item.issue_assign }}
                    </td>
                    <td>
                      {{ item.issue_qc }}
                      <span v-if="item.issue_qc == null || item.issue_qc == ''">
                        No assign
                      </span>
                    </td>
                    <td>
                      <v-icon
                        class="mr-2"
                        v-if="
                          user_position === 'Implementer' &&
                          user_role !== 'Admin' &&
                          item.issue_qc !== user_firstname &&
                          item.issue_informer !== user_firstname
                        "
                        :disabled="true"
                        size="20"
                        color="primary"
                      >
                        mdi-information
                      </v-icon>
                      <v-icon
                        class="mr-2"
                        v-else-if="
                          user_position === 'Developer' &&
                          user_role !== 'Admin' &&
                          item.issue_assign !== user_firstname
                        "
                        :disabled="true"
                        size="20"
                        color="primary"
                      >
                        mdi-information
                      </v-icon>
                      <v-icon
                        class="mr-2"
                        v-else
                        @click="
                          showIssueDetailDialog(
                            item.id,
                            item.issue_id,
                            item.issue_type,
                            item.screen_id,
                            item.issue_status,
                            item.issue_priority,
                            item.formattedDateEnd,
                            item.issue_name,
                            item.issue_des_sa,
                            item.issue_informer,
                            item.issue_assign,
                            item.issue_qc,
                            item.issue_filename,
                            item.formattedDateAccepting,
                            item.issue_manday,
                            item.formattedDateStart,
                            item.formattedDateExpected,
                            item.formattedDateComplete,
                            item.issue_des_implementer,
                            item.issue_des_dev,
                            item.issue_des,
                            item.issue_customer,
                            item.issue_doc_id,
                            item.issue_type_sa,
                            item.created_at,
                            item.issue_status_developer,
                            item.issue_status_implement,
                            item.issue_round,
                            item.user_assign_id,
                            item.user_qc_id
                          )
                        "
                        size="20"
                        color="primary"
                      >
                        mdi-information
                      </v-icon>
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </v-tab-item>
            <v-tab-item>
              <!-- *card PNC -->
              <!-- *Table assignedIssues -->
              <v-data-table
                :headers="headers"
                :items="system.assignedIssuesPNC"
                :sort-by="['created_at']"
                :sort-desc="[true]"
                class="v-data-table elevation-1 mb-2"
                :style="{ 'background-color': tableColor }"
              >
                <template v-slot:top>
                  <v-toolbar
                    flat
                    class="mb-5"
                    style="background-color: #90f28e"
                  >
                    <v-toolbar-title>
                      <h5 class="pa-1" style="text-align: left">
                        ปัญหาที่มีคนรับผิดชอบ
                      </h5>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-text-field
                      class="pa-2"
                      style="background-color: white"
                      v-model="search"
                      append-icon="mdi-magnify"
                      label="Search"
                      single-line
                      hide-details
                      rounded
                    ></v-text-field>
                  </v-toolbar>
                </template>
                <template v-slot:item="{ item }">
                  <tr>
                    <td>
                      {{ item.issue_id }}
                    </td>
                    <td>
                      {{ item.issue_name }}
                    </td>
                    <td>
                      {{ item.issue_type }}
                    </td>
                    <td>{{ item.formattedDateEnd }}</td>
                    <td>{{ item.issue_status }}</td>
                    <td>
                      <v-icon
                        v-show="item.issue_priority == 'Critical'"
                        style="color: #ff0000"
                        >mdi-flag</v-icon
                      >
                      <v-icon
                        v-show="item.issue_priority == 'Hight'"
                        style="color: #ffa500"
                        >mdi-flag</v-icon
                      >
                      <v-icon
                        v-show="item.issue_priority == 'Medium'"
                        style="color: #ffff00"
                        >mdi-flag</v-icon
                      >
                      <v-icon
                        v-show="item.issue_priority == 'Low'"
                        style="color: #00ff00"
                        >mdi-flag</v-icon
                      >
                      {{ item.issue_priority }}
                    </td>
                    <td>
                      <span
                        v-if="
                          item.issue_assign == null || item.issue_assign == ''
                        "
                        >N/A</span
                      >
                      {{ item.issue_assign }}
                    </td>
                    <td>
                      {{ item.issue_qc }}
                      <span v-if="item.issue_qc == null || item.issue_qc == ''">
                        No assign
                      </span>
                    </td>
                    <td>
                      <v-icon
                        class="mr-2"
                        v-if="
                          user_position === 'Implementer' &&
                          user_role !== 'Admin' &&
                          item.issue_qc !== user_firstname &&
                          item.issue_informer !== user_firstname
                        "
                        :disabled="true"
                        size="20"
                        color="primary"
                      >
                        mdi-information
                      </v-icon>
                      <v-icon
                        class="mr-2"
                        v-else-if="
                          user_position === 'Developer' &&
                          user_role !== 'Admin' &&
                          item.issue_assign !== user_firstname
                        "
                        :disabled="true"
                        size="20"
                        color="primary"
                      >
                        mdi-information
                      </v-icon>
                      <v-icon
                        class="mr-2"
                        v-else
                        @click="
                          showIssueDetailDialog(
                            item.id,
                            item.issue_id,
                            item.issue_type,
                            item.screen_id,
                            item.issue_status,
                            item.issue_priority,
                            item.formattedDateEnd,
                            item.issue_name,
                            item.issue_des_sa,
                            item.issue_informer,
                            item.issue_assign,
                            item.issue_qc,
                            item.issue_filename,
                            item.formattedDateAccepting,
                            item.issue_manday,
                            item.formattedDateStart,
                            item.formattedDateExpected,
                            item.formattedDateComplete,
                            item.issue_des_implementer,
                            item.issue_des_dev,
                            item.issue_des,
                            item.issue_customer,
                            item.issue_doc_id,
                            item.issue_type_sa,
                            item.created_at,
                            item.issue_status_developer,
                            item.issue_status_implement,
                            item.issue_round,
                            item.user_assign_id,
                            item.user_qc_id
                          )
                        "
                        size="20"
                        color="primary"
                      >
                        mdi-information
                      </v-icon>
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </v-tab-item>
            <v-tab-item>
              <!-- *card New req -->
              <!-- *Table assignedIssues -->
              <v-data-table
                :headers="headers"
                :items="system.assignedIssuesNewReq"
                :sort-by="['created_at']"
                :sort-desc="[true]"
                class="v-data-table elevation-1 mb-2"
                :style="{ 'background-color': tableColor }"
              >
                <template v-slot:top>
                  <v-toolbar
                    flat
                    class="mb-5"
                    style="background-color: #90f28e"
                  >
                    <v-toolbar-title>
                      <h5 class="pa-1" style="text-align: left">
                        ปัญหาที่มีคนรับผิดชอบ
                      </h5>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-text-field
                      class="pa-2"
                      style="background-color: white"
                      v-model="search"
                      append-icon="mdi-magnify"
                      label="Search"
                      single-line
                      hide-details
                      rounded
                    ></v-text-field>
                  </v-toolbar>
                </template>
                <template v-slot:item="{ item }">
                  <tr>
                    <td>
                      {{ item.issue_id }}
                    </td>
                    <td>
                      {{ item.issue_name }}
                    </td>
                    <td>
                      {{ item.issue_type }}
                    </td>
                    <td>{{ item.formattedDateEnd }}</td>
                    <td>{{ item.issue_status }}</td>
                    <td>
                      <v-icon
                        v-show="item.issue_priority == 'Critical'"
                        style="color: #ff0000"
                        >mdi-flag</v-icon
                      >
                      <v-icon
                        v-show="item.issue_priority == 'Hight'"
                        style="color: #ffa500"
                        >mdi-flag</v-icon
                      >
                      <v-icon
                        v-show="item.issue_priority == 'Medium'"
                        style="color: #ffff00"
                        >mdi-flag</v-icon
                      >
                      <v-icon
                        v-show="item.issue_priority == 'Low'"
                        style="color: #00ff00"
                        >mdi-flag</v-icon
                      >
                      {{ item.issue_priority }}
                    </td>
                    <td>
                      <span
                        v-if="
                          item.issue_assign == null || item.issue_assign == ''
                        "
                        >N/A</span
                      >
                      {{ item.issue_assign }}
                    </td>
                    <td>
                      {{ item.issue_qc }}
                      <span v-if="item.issue_qc == null || item.issue_qc == ''">
                        No assign
                      </span>
                    </td>
                    <td>
                      <v-icon
                        class="mr-2"
                        v-if="
                          user_position === 'Implementer' &&
                          user_role !== 'Admin' &&
                          item.issue_qc !== user_firstname &&
                          item.issue_informer !== user_firstname
                        "
                        :disabled="true"
                        size="20"
                        color="primary"
                      >
                        mdi-information
                      </v-icon>
                      <v-icon
                        class="mr-2"
                        v-else-if="
                          user_position === 'Developer' &&
                          user_role !== 'Admin' &&
                          item.issue_assign !== user_firstname
                        "
                        :disabled="true"
                        size="20"
                        color="primary"
                      >
                        mdi-information
                      </v-icon>
                      <v-icon
                        class="mr-2"
                        v-else
                        @click="
                          showIssueDetailDialog(
                            item.id,
                            item.issue_id,
                            item.issue_type,
                            item.screen_id,
                            item.issue_status,
                            item.issue_priority,
                            item.formattedDateEnd,
                            item.issue_name,
                            item.issue_des_sa,
                            item.issue_informer,
                            item.issue_assign,
                            item.issue_qc,
                            item.issue_filename,
                            item.formattedDateAccepting,
                            item.issue_manday,
                            item.formattedDateStart,
                            item.formattedDateExpected,
                            item.formattedDateComplete,
                            item.issue_des_implementer,
                            item.issue_des_dev,
                            item.issue_des,
                            item.issue_customer,
                            item.issue_doc_id,
                            item.issue_type_sa,
                            item.created_at,
                            item.issue_status_developer,
                            item.issue_status_implement,
                            item.issue_round,
                            item.user_assign_id,
                            item.user_qc_id
                          )
                        "
                        size="20"
                        color="primary"
                      >
                        mdi-information
                      </v-icon>
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </v-tab-item>
            <v-tab-item>
              <!-- *card History -->
              <!-- *Table assignedIssues -->
              <v-data-table
                :headers="headers"
                :items="system.assignedIssuesHistory"
                :sort-by="['created_at']"
                :sort-desc="[true]"
                class="v-data-table elevation-1 mb-2"
                :style="{ 'background-color': tableColor }"
              >
                <template v-slot:item="{ item }">
                  <tr>
                    <td>
                      {{ item.issue_id }}
                    </td>
                    <td>
                      {{ item.issue_name }}
                    </td>
                    <td>
                      {{ item.issue_type }}
                    </td>
                    <td>{{ item.formattedDateEnd }}</td>
                    <td>{{ item.issue_status }}</td>
                    <td>
                      <v-icon
                        v-show="item.issue_priority == 'Critical'"
                        style="color: #ff0000"
                        >mdi-flag</v-icon
                      >
                      <v-icon
                        v-show="item.issue_priority == 'Hight'"
                        style="color: #ffa500"
                        >mdi-flag</v-icon
                      >
                      <v-icon
                        v-show="item.issue_priority == 'Medium'"
                        style="color: #ffff00"
                        >mdi-flag</v-icon
                      >
                      <v-icon
                        v-show="item.issue_priority == 'Low'"
                        style="color: #00ff00"
                        >mdi-flag</v-icon
                      >
                      {{ item.issue_priority }}
                    </td>
                    <td>
                      <span
                        v-if="
                          item.issue_assign == null || item.issue_assign == ''
                        "
                        >N/A</span
                      >
                      {{ item.issue_assign }}
                    </td>
                    <td>
                      {{ item.issue_qc }}
                      <span v-if="item.issue_qc == null || item.issue_qc == ''">
                        No assign
                      </span>
                    </td>
                    <td>
                      <v-icon
                        class="mr-2"
                        v-if="
                          user_position === 'Implementer' &&
                          user_role !== 'Admin' &&
                          item.issue_qc !== user_firstname &&
                          item.issue_informer !== user_firstname
                        "
                        :disabled="true"
                        size="20"
                        color="primary"
                      >
                        mdi-information
                      </v-icon>
                      <v-icon
                        class="mr-2"
                        v-else-if="
                          user_position === 'Developer' &&
                          user_role !== 'Admin' &&
                          item.issue_assign !== user_firstname
                        "
                        :disabled="true"
                        size="20"
                        color="primary"
                      >
                        mdi-information
                      </v-icon>
                      <v-icon
                        class="mr-2"
                        v-else
                        @click="
                          (history = true),
                            (no_assign = false),
                            showIssueDetailDialog(
                              item.id,
                              item.issue_id,
                              item.issue_type,
                              item.screen_id,
                              item.issue_status,
                              item.issue_priority,
                              item.formattedDateEnd,
                              item.issue_name,
                              item.issue_des_sa,
                              item.issue_informer,
                              item.issue_assign,
                              item.issue_qc,
                              item.issue_filename,
                              item.formattedDateAccepting,
                              item.issue_manday,
                              item.formattedDateStart,
                              item.formattedDateExpected,
                              item.formattedDateComplete,
                              item.issue_des_implementer,
                              item.issue_des_dev,
                              item.issue_des,
                              item.issue_customer,
                              item.issue_doc_id,
                              item.issue_type_sa,
                              item.created_at,
                              item.issue_status_developer,
                              item.issue_status_implement,
                              item.issue_round,
                              item.user_assign_id,
                              item.user_qc_id
                            )
                        "
                        size="20"
                        color="primary"
                      >
                        mdi-information
                      </v-icon>
                    </td>
                  </tr>
                </template>
                <!--  -->
              </v-data-table>
            </v-tab-item>
          </v-tabs-items>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <!-- * box2 -->
  </div>
</template>
  
<script>
import Vue from "vue";
import Searchbar from "~/components/Searchbar.vue";
import DialogIssue from "@/components/DialogIssue.vue";
import moment from "moment";
import DialogIssueDetail from "@/components/DialogIssueDetail.vue";
import DialogIssueImple from "@/components/DialogIssueImple.vue";
export default {
  components: { Searchbar, DialogIssue, DialogIssueDetail, DialogIssueImple },
  layout: "admin",
  directives: {
    "remove-row-borders": {
      inserted(el) {
        const trs = el.querySelectorAll("td");
        trs.forEach((tr) => {
          tr.style.borderBottom = "none";
        });
      },
    },
  },
  data() {
    return {
      project_name_ENG: "",
      yourSearchData: "",
      //auth
      user: this.$auth.user,
      loggedIn: this.$auth.loggedIn,
      id: this.$route.params.id,
      tab1: true,
      tab2: false,
      tab3: false,
      tab4: false,
      tab5: false,
      tab_assign: true,
      tab_unassign: false,
      search: "",
      searchText: "",
      tab: null,
      tab_issue: null,
      dialog: false,
      date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .substr(0, 10),
      menu: false,
      dialogInfo: false,
      dialogIssueDetail: false,
      dialogIssueImple: false,
      dialogIssueDev: false,
      history: false,
      no_assign: false,
      selected: {
        Id: "",
        screen_id: "",
        system_id: "",
        project_id: "",
        issue_name: "",
        issue_id: "",
        issue_type: "",
        issue_informer: "",
        issue_priority: "",
        issue_end: "",
        issue_assign: "",
        issue_qc: "",
        issue_des: "",
        issue_des_sa: "",
        issue_type_sa: "",
        issue_doc_id: "",
        issue_customer: "",
        issue_filename: "",
        issue_des_dev: "",
        issue_des_implementer: "",
        issue_start: "",
        issue_expected: "",
        issue_status: "",
        issue_accepting: "",
        issue_manday: "",
        issue_complete: "",
        created_at: "",
        screenName: "",
        formattedDateEnd: "",
        formattedDateAccepting: "",
        formattedDateExpected: "",
        formattedDateStart: "",
        issue_status_developer: "",
        issue_status_implement: "",
        user_assign_id: "",
        user_qc_id: "",
        issue_round: "",
        impleSection: false,
        userId: "",
        history: "",
        no_assign: "",
      },
      infoCreate: {
        systemName: "",
        systemId: "",
        system_id: "",
        systemShortname: "",
      },
      headers: [
        {
          text: "ID",
          align: "start",
          value: "id",
          class: "blue-grey darken-4 white--text",
        },
        {
          text: "Project ID",
          value: "project_id",
          class: "blue-grey darken-4 white--text",
        },
        {
          text: "Project Name (TH)",
          value: "project_name_TH",
          class: "blue-grey darken-4 white--text",
        },
        {
          text: "Project Name (ENG)",
          value: "project_name_ENG",
          class: "blue-grey darken-4 white--text",
        },
        {
          text: "Project Shortname",
          value: "project_shortname",
          class: "blue-grey darken-4 white--text",
        },
        {
          text: "Agency",
          value: "project_agency",
          class: "blue-grey darken-4 white--text",
        },
        {
          text: "Progress",
          value: "project_progress",
          class: "blue-grey darken-4 white--text",
        },
        {
          text: "Manday",
          value: "project_manday",
          class: "blue-grey darken-4 white--text",
        },
        {
          text: "System Count",
          value: "system_count",
          class: "blue-grey darken-4 white--text",
        },
        {
          text: "Plan Start",
          value: "project_plan_start",
          class: "blue-grey darken-4 white--text",
        },
        {
          text: "Plan End",
          value: "project_plan_end",
          class: "blue-grey darken-4 white--text",
        },
        {
          text: "Is Deleted",
          value: "is_deleted",
          class: "blue-grey darken-4 white--text",
        },
      ],
      issue: [],
      issueDev: [],
      issueImple: [],
      project: [],
      projectDev: [],
      projectImple: [],
      systems: [],
      systemsDev: [],
      systemsImple: [],
      default: [],
      projectName: "",
      projectId: "",
      project_id: "",
      project_shortname: "",
      systemslength: "",
      user_id: "",
      user_firstname: "",
      user_lastname: "",
      user_position: "",
      user_role: "",
      runningNumber: "",
      tableColor: "#ffff",
    };
  },
  async created() {
    await this.getUser();
    await this.getProject();
    await this.getProjectDev();
    await this.getProjectImple();
    await this.getSystems();
    await this.getSystemsDev();
    await this.getSystemsImple();
    await this.getIssue();
  },
  async mounted() {
    await this.getUser();
    await this.getProject();
    await this.getProjectDev();
    await this.getProjectImple();
    await this.getSystems();
    await this.getSystemsDev();
    await this.getSystemsImple();
    await this.getIssue();
  },
  computed: {
    systemsList() {
      if (this.user_role === "Admin" || this.user_position === "Implementer") {
        return this.systems;
      } else if (
        this.user_role === "User" &&
        this.user_position === "Developer"
      ) {
        return this.systems;
        // return this.systemsDev; // Dev ถ้าต้องการดูของตัวเองให้เปิด
      } else {
        return [];
      }
    },
  },

  methods: {
    async getpdf() {
      const response = await this.$axios.get(`/issues/getpdf/${this.issue.id}`);
      if (response.status === 200) {
        const pdf = response.data;
        console.log(pdf);
      } else {
        // this.pdf = "Failed to load PDF document.";
        console.log("PDF err or No have");
      }
    },

    showIssueDetailDialog(
      issueid,
      issueId,
      issueType,
      issueScreenid,
      issueStatus,
      issuePriority,
      issueFormattedDateEnd,
      issueName,
      issueDesSA,
      issueInformer,
      issueAssign,
      issueQc,
      issueFilename,
      issueformattedDateAccepting,
      issueManday,
      issueformattedDateStart,
      issueformattedDateExpected,
      issueComplete,
      issueDesImplementer,
      issueDesDev,
      issueDes,
      issueCustomer,
      issueDocId,
      issueTypeSA,
      issueCreate,
      issueDeveloperStatus,
      issueImplementerStatus,
      issueRound,
      issueUserAssignId,
      issueUserQCId
    ) {
      this.selected.userId = this.$auth.user.id;
      //formattedDateAccepting
      this.selected.formattedDateAccepting =
        issueformattedDateAccepting == null ||
        issueformattedDateAccepting == "Invalid date" ||
        issueformattedDateAccepting == undefined
          ? null
          : issueformattedDateAccepting;
      //formattedDateStart
      this.selected.formattedDateStart =
        issueformattedDateStart == null ||
        issueformattedDateStart == "Invalid date" ||
        issueformattedDateStart == undefined
          ? null
          : issueformattedDateStart;
      //formattedDateExpected
      this.selected.formattedDateExpected =
        issueformattedDateExpected == null ||
        issueformattedDateExpected == "Invalid date" ||
        issueformattedDateExpected == undefined
          ? null
          : issueformattedDateExpected;
      //formattedDateComplete
      this.selected.issue_complete =
        issueComplete == null ||
        issueComplete == "Invalid date" ||
        issueComplete == undefined
          ? null
          : issueComplete;
      //formattedDateEnd
      this.selected.formattedDateEnd =
        issueFormattedDateEnd == null ||
        issueFormattedDateEnd == "Invalid date" ||
        issueFormattedDateEnd == undefined
          ? null
          : issueFormattedDateEnd;

      this.selected.Id = issueid;
      this.selected.issue_id = issueId;
      this.selected.issue_type = issueType;
      this.selected.screen_id = issueScreenid;
      this.selected.issue_status = issueStatus;
      this.selected.issue_priority = issuePriority;
      this.selected.issue_name = issueName;
      this.selected.issue_des_sa = issueDesSA;
      this.selected.issue_informer = issueInformer;
      this.selected.issue_assign = issueAssign;
      this.selected.issue_qc = issueQc;
      this.selected.issue_filename = issueFilename;
      this.selected.issue_manday = issueManday;
      this.selected.issue_des_implementer = issueDesImplementer;
      this.selected.issue_des_dev = issueDesDev;
      this.selected.issue_des = issueDes;
      this.selected.issue_customer = issueCustomer;
      this.selected.issue_doc_id = issueDocId;
      this.selected.issue_type_sa = issueTypeSA;
      this.selected.user_assign_id = issueUserAssignId;
      this.selected.user_qc_id = issueUserQCId;
      //created at
      const dateCreate = moment(issueCreate).format("YYYY-MM-DD");
      this.selected.created_at = dateCreate;
      //get screen name
      this.$axios.get("/screens/getOne/" + issueScreenid).then((res) => {
        const screen = res.data[0].screen_name;
        this.selected.screenName = screen;
      });
      this.selected.issue_status_developer = issueDeveloperStatus;
      if (issueDeveloperStatus === "แก้ไขเรียบร้อย") {
        this.selected.impleSection = true;
      } else {
        this.selected.impleSection = false;
      }
      this.selected.issue_status_implement = issueImplementerStatus;
      this.selected.issue_round = issueRound;
      this.selected.history = this.history;
      this.selected.no_assign = this.no_assign;
      //check role
      if (this.user_role == "Admin") {
        this.dialogIssueDetail = true;
      } else if (
        this.user_position == "Implementer" &&
        this.user_role == "User"
      ) {
        this.dialogIssueImple = true;
      } else if (
        this.user_position == "Developer" &&
        this.user_role == "User"
      ) {
        this.dialogIssueDev = true;
      }
      //check role
    },
    async getUser() {
      await this.$axios
        .get("/users/getOne/" + this.$auth.user.id)
        .then((res) => {
          this.user_id = res.data[0].user_id;
          this.user_firstname = res.data[0].user_firstname;
          this.user_lastname = res.data[0].user_lastname;
          this.user_position = res.data[0].user_position;
          this.user_role = res.data[0].user_role;
        });
    },
    async getProjectDev() {
      try {
        const response = await this.$axios.get("/projects/getOne/" + this.id);
        const projectData = response.data;

        // Check if projectData is an object
        if (projectData && typeof projectData === "object") {
          // Assuming projectData is an array of projects, take the first one
          this.projectDev = [projectData]; // Wrap projectData in an array
        } else {
          console.error("Error: Invalid project data");
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
      }
    },

    async getSystemsDev() {
      try {
        const response = await this.$axios.get("/systems/getAll");
        const systemsData = response.data;

        // Check if systemsData is an array
        if (Array.isArray(systemsData)) {
          if (Array.isArray(this.projectDev) && this.projectDev.length > 0) {
            this.projectDev.forEach((projectDev) => {
              Vue.set(
                projectDev,
                "systemsDevs",
                systemsData.filter(
                  (system) => system.project_id === projectDev.id
                )
              );
            });

            // Check if systemsDevs is available in the first projectDev
            if (
              this.projectDev[0] &&
              this.projectDev[0].hasOwnProperty("systemsDevs")
            ) {
              this.systemsDev = this.projectDev[0].systemsDevs;
            } else {
              console.error(
                "Error: systemsDevs is not available in the first projectDev"
              );
            }
          } else {
            console.error("Error: this.projectDev is not an array or empty");
          }
        } else {
          console.error("Error: Invalid systems data");
        }
      } catch (error) {
        console.error("Error fetching systems data:", error);
      }
    },

    async getProjectImple() {
      try {
        const response = await this.$axios.get("/projects/getOne/" + this.id);
        const projectData = response.data;

        // Check if projectData is an object
        if (projectData && typeof projectData === "object") {
          // Assuming projectData is an array of projects, take the first one
          this.projectImple = [projectData]; // Wrap projectData in an array
        } else {
          console.error("Error: Invalid project data");
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
      }
    },
    async getSystemsImple() {
      try {
        const response = await this.$axios.get("/systems/getAll");
        const systemsData = response.data;

        // Make sure this.projectImple is an array
        if (Array.isArray(this.projectImple)) {
          // Loop through each project and assign the associated systems
          this.projectImple.forEach((projectImple) => {
            Vue.set(
              projectImple,
              "systemsImples",
              systemsData.filter(
                (system) => system.project_id === projectImple.id
              )
            );
          });

          this.systemsImple = this.projectImple[0].systemsImples;
        } else {
          console.error("Error: this.projectImple is not an array");
        }
      } catch (error) {
        console.error("Error fetching systems data:", error);
      }
    },

    async getProject() {
      try {
        const response = await this.$axios.get("/projects/getOne/" + this.id);
        const projectData = response.data;
        if (projectData) {
          // Convert object to array
          this.project = [projectData];
          this.projectName = projectData.project_name;
          this.project_shortname = projectData.project_shortname;
          this.projectId = projectData.id;
          this.project_id = projectData.project_id;
        } else {
          console.error("No project data found");
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
      }
    },

    async getSystems() {
      try {
        const res = await this.$axios.get("/systems/getAll");
        const systemsData = res.data;

        // Convert systemsData to array if it's an object
        const dataArray = Array.isArray(systemsData)
          ? systemsData
          : [systemsData];

        // Assign systems to each project if project is an array
        if (Array.isArray(this.project)) {
          this.project.forEach((project) => {
            project.systems = dataArray.filter(
              (system) => system.project_id === project.id
            );
          });

          // Set the systems and systems length for the first project
          if (this.project.length > 0) {
            this.systems = this.project[0].systems;
            this.systemsLength = this.project[0].systems.length;
          }
        } else {
          console.error("Project data is not an array:", this.project);
          // Additional error handling or debugging steps can be added here
        }
      } catch (error) {
        console.error("Error fetching systems:", error);
      }
    },

    async getIssue() {
      try {
        const res = await this.$axios.get(
          "/issues/getAll?project_id=" + this.id
        );
        this.issue = res.data;
        this.runningNumber = this.issue.length + 1;
        this.issue.forEach((issue) => {
          const dateEnd = moment(issue.issue_end, "YYYY-MM-DDTHH:mm:ss.SSSZ");
          issue.formattedDateEnd = dateEnd.format("YYYY-MM-DD");
          issue.formattedDateEndTH = moment(dateEnd)
            .add(543, "years")
            .format("DD-MM-YYYY");

          const dateAccepting = moment(
            issue.issue_accepting,
            "YYYY-MM-DDTHH:mm:ss.SSSZ"
          );
          issue.formattedDateAccepting = dateAccepting.format("YYYY-MM-DD");

          const dateStart = moment(
            issue.issue_start,
            "YYYY-MM-DDTHH:mm:ss.SSSZ"
          );
          issue.formattedDateStart = dateStart.format("YYYY-MM-DD");

          const dateExpected = moment(
            issue.issue_expected,
            "YYYY-MM-DDTHH:mm:ss.SSSZ"
          );
          issue.formattedDateExpected = dateExpected.format("YYYY-MM-DD");

          const dateComplete = moment(
            issue.issue_complete,
            "YYYY-MM-DDTHH:mm:ss.SSSZ"
          );
          issue.formattedDateComplete = dateComplete.format("YYYY-MM-DD");
        });

        this.systems.forEach((system) => {
          Vue.set(
            system,
            "assignedIssues",
            this.issue.filter(
              (issue) =>
                issue.system_id === system.id &&
                issue.issue_assign !== "" &&
                issue.issue_assign !== null &&
                issue.issue_status_implement !== "ตรวจสอบผ่าน"
            )
          );
          Vue.set(
            system,
            "unassignedIssues",
            this.issue.filter(
              (issue) =>
                issue.system_id === system.id &&
                (issue.issue_assign === "" || issue.issue_assign === null) &&
                issue.issue_status_implement !== "ตรวจสอบผ่าน"
            )
          );
          Vue.set(
            system,
            "assignedIssuesPNI",
            this.issue.filter(
              (issue) =>
                issue.system_id === system.id &&
                issue.issue_assign !== "" &&
                issue.issue_assign !== null &&
                issue.issue_type === "PNI" &&
                issue.issue_status_implement !== "ตรวจสอบผ่าน"
            )
          );
          Vue.set(
            system,
            "unassignedIssuesPNI",
            this.issue.filter(
              (issue) =>
                issue.system_id === system.id &&
                (issue.issue_assign === "" || issue.issue_assign === null) &&
                issue.issue_type === "PNI" &&
                issue.issue_status_implement !== "ตรวจสอบผ่าน"
            )
          );
          Vue.set(
            system,
            "assignedIssuesPNC",
            this.issue.filter(
              (issue) =>
                issue.system_id === system.id &&
                issue.issue_assign !== "" &&
                issue.issue_assign !== null &&
                issue.issue_type === "PNC" &&
                issue.issue_status_implement !== "ตรวจสอบผ่าน"
            )
          );
          Vue.set(
            system,
            "unassignedIssuesPNC",
            this.issue.filter(
              (issue) =>
                issue.system_id === system.id &&
                (issue.issue_assign === "" || issue.issue_assign === null) &&
                issue.issue_type === "PNC" &&
                issue.issue_status_implement !== "ตรวจสอบผ่าน"
            )
          );
          Vue.set(
            system,
            "assignedIssuesNewReq",
            this.issue.filter(
              (issue) =>
                issue.system_id === system.id &&
                issue.issue_assign !== "" &&
                issue.issue_assign !== null &&
                issue.issue_type === "New Req" &&
                issue.issue_status_implement !== "ตรวจสอบผ่าน"
            )
          );
          Vue.set(
            system,
            "unassignedIssuessNewReq",
            this.issue.filter(
              (issue) =>
                issue.system_id === system.id &&
                (issue.issue_assign === "" || issue.issue_assign === null) &&
                issue.issue_type === "New Req" &&
                issue.issue_status_implement !== "ตรวจสอบผ่าน"
            )
          );
          Vue.set(
            system,
            "assignedIssuesHistory",
            this.issue.filter(
              (issue) =>
                issue.system_id === system.id &&
                issue.issue_status_implement === "ตรวจสอบผ่าน"
            )
          );
        });

        this.systemsDev.forEach((system) => {
          Vue.set(
            system,
            "assignedIssues",
            this.issue.filter(
              (issue) =>
                issue.system_id === system.id &&
                issue.issue_assign == this.user_firstname &&
                issue.issue_assign !== null &&
                issue.issue_status_implement !== "ตรวจสอบผ่าน"
            )
          );
          Vue.set(
            system,
            "unassignedIssues",
            this.issue.filter(
              (issue) =>
                issue.system_id === system.id &&
                (issue.issue_assign === "" || issue.issue_assign === null) &&
                issue.issue_status_implement !== "ตรวจสอบผ่าน"
            )
          );
          Vue.set(
            system,
            "assignedIssuesPNI",
            this.issue.filter(
              (issue) =>
                issue.system_id === system.id &&
                issue.issue_assign == this.user_firstname &&
                issue.issue_assign !== null &&
                issue.issue_type === "PNI" &&
                issue.issue_status_implement !== "ตรวจสอบผ่าน"
            )
          );
          Vue.set(
            system,
            "unassignedIssuesPNI",
            this.issue.filter(
              (issue) =>
                issue.system_id === system.id &&
                (issue.issue_assign === "" || issue.issue_assign === null) &&
                issue.issue_type === "PNI" &&
                issue.issue_status_implement !== "ตรวจสอบผ่าน"
            )
          );
          Vue.set(
            system,
            "assignedIssuesPNC",
            this.issue.filter(
              (issue) =>
                issue.system_id === system.id &&
                issue.issue_assign == this.user_firstname &&
                issue.issue_assign !== null &&
                issue.issue_type === "PNC" &&
                issue.issue_status_implement !== "ตรวจสอบผ่าน"
            )
          );
          Vue.set(
            system,
            "unassignedIssuesPNC",
            this.issue.filter(
              (issue) =>
                issue.system_id === system.id &&
                (issue.issue_assign === "" || issue.issue_assign === null) &&
                issue.issue_type === "PNC" &&
                issue.issue_status_implement !== "ตรวจสอบผ่าน"
            )
          );
          Vue.set(
            system,
            "assignedIssuesNewReq",
            this.issue.filter(
              (issue) =>
                issue.system_id === system.id &&
                issue.issue_assign == this.user_firstname &&
                issue.issue_assign !== null &&
                issue.issue_type === "New Req" &&
                issue.issue_status_implement !== "ตรวจสอบผ่าน"
            )
          );
          Vue.set(
            system,
            "unassignedIssuessNewReq",
            this.issue.filter(
              (issue) =>
                issue.system_id === system.id &&
                (issue.issue_assign === "" || issue.issue_assign === null) &&
                issue.issue_type === "New Req" &&
                issue.issue_status_implement !== "ตรวจสอบผ่าน"
            )
          );
          Vue.set(
            system,
            "assignedIssuesHistory",
            this.issue.filter(
              (issue) =>
                issue.system_id === system.id &&
                (issue.issue_assign === "" || issue.issue_assign === null) &&
                issue.issue_status_implement === "ตรวจสอบผ่าน"
            )
          );
        });

        this.systemsImple.forEach((system) => {
          Vue.set(
            system,
            "assignedIssues",
            this.issue.filter(
              (issue) =>
                (issue.system_id === system.id &&
                  issue.issue_assign != "" &&
                  issue.issue_assign !== null &&
                  issue.issue_status_implement !== "ตรวจสอบผ่าน" &&
                  issue.issue_informer == this.user_firstname) ||
                issue.issue_qc == this.user_firstname
            )
          );
          Vue.set(
            system,
            "unassignedIssues",
            this.issue.filter(
              (issue) =>
                issue.system_id === system.id &&
                (issue.issue_assign != "" || issue.issue_assign === null) &&
                issue.issue_status_implement !== "ตรวจสอบผ่าน"
            )
          );
          Vue.set(
            system,
            "assignedIssuesPNI",
            this.issue.filter(
              (issue) =>
                (issue.system_id === system.id &&
                  issue.issue_assign != "" &&
                  issue.issue_assign !== null &&
                  issue.issue_type === "PNI" &&
                  issue.issue_status_implement !== "ตรวจสอบผ่าน" &&
                  issue.issue_informer == this.user_firstname) ||
                issue.issue_qc == this.user_firstname
            )
          );
          Vue.set(
            system,
            "unassignedIssuesPNI",
            this.issue.filter(
              (issue) =>
                issue.system_id === system.id &&
                (issue.issue_assign === "" || issue.issue_assign === null) &&
                issue.issue_type === "PNI" &&
                issue.issue_status_implement !== "ตรวจสอบผ่าน"
            )
          );
          Vue.set(
            system,
            "assignedIssuesPNC",
            this.issue.filter(
              (issue) =>
                (issue.system_id === system.id &&
                  issue.issue_assign != "" &&
                  issue.issue_assign !== null &&
                  issue.issue_type === "PNC" &&
                  issue.issue_status_implement !== "ตรวจสอบผ่าน" &&
                  issue.issue_informer == this.user_firstname) ||
                issue.issue_qc == this.user_firstname
            )
          );
          Vue.set(
            system,
            "unassignedIssuesPNC",
            this.issue.filter(
              (issue) =>
                issue.system_id === system.id &&
                (issue.issue_assign === "" || issue.issue_assign === null) &&
                issue.issue_type === "PNC" &&
                issue.issue_status_implement !== "ตรวจสอบผ่าน"
            )
          );
          Vue.set(
            system,
            "assignedIssuesNewReq",
            this.issue.filter(
              (issue) =>
                (issue.system_id === system.id &&
                  issue.issue_assign != "" &&
                  issue.issue_assign !== null &&
                  issue.issue_type === "New Req" &&
                  issue.issue_status_implement !== "ตรวจสอบผ่าน" &&
                  issue.issue_informer == this.user_firstname) ||
                issue.issue_qc == this.user_firstname
            )
          );
          Vue.set(
            system,
            "unassignedIssuessNewReq",
            this.issue.filter(
              (issue) =>
                issue.system_id === system.id &&
                (issue.issue_assign != "" || issue.issue_assign === null) &&
                issue.issue_type === "New Req" &&
                issue.issue_status_implement !== "ตรวจสอบผ่าน"
            )
          );
          Vue.set(
            system,
            "assignedIssuesHistory",
            this.issue.filter(
              (issue) =>
                (issue.system_id === system.id &&
                  (issue.issue_assign != "" || issue.issue_assign === null) &&
                  issue.issue_status_implement === "ตรวจสอบผ่าน" &&
                  issue.issue_informer == this.user_firstname) ||
                issue.issue_qc == this.user_firstname
            )
          );
        });
      } catch (err) {
        console.error(err);
      }
    },
    showIssueCreateDialog(systemName, systemId, systemids, systemShortname) {
      this.infoCreate.systemName = systemName;
      this.infoCreate.systemId = systemId;
      this.infoCreate.system_id = systemids;
      this.infoCreate.systemShortname = systemShortname;
      this.dialog = true;
    },
    editProject(item) {
      this.dialog = true;
      this.selected = Object.assign({}, item);
    },
    updateProject() {
      const id = this.selected.id;
      this.$axios.put("/projects/update/" + id, this.selected).then((res) => {
        this.getProject();
      });
      this.dialog = false;
    },
    deleteProject(item) {
      this.$axios
        .put("/projects/delete/" + item.id, { is_deleted: "Yes" })
        .then((res) => {
          this.getProject();
        });
    },
    addIssue() {
      this.$router.push({
        path: "/issues/add",
        query: { project_id: this.id },
      });
    },
    async viewDetail(item) {
      this.dialogIssueDetail = true;
      this.selected = Object.assign({}, item);
    },
    async viewDetailImple(item) {
      this.dialogIssueImple = true;
      this.selected = Object.assign({}, item);
    },
    async viewDetailDev(item) {
      this.dialogIssueDev = true;
      this.selected = Object.assign({}, item);
    },
    async close() {
      this.dialogIssueDetail = false;
      this.dialogIssueImple = false;
      this.dialogIssueDev = false;
    },
  },
};
</script>


<style scoped>
* {
  font-family: "Lato", sans-serif;
}

.new-btn {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 8px 16px;
}

.row-even {
  background-color: rgba(233, 203, 243, 0.788);
  color: black;
}
.row-odd {
  background-color: rgba(247, 229, 191, 0.788);
  color: black;
}
</style>