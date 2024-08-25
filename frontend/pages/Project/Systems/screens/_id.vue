<template>
  <!-- Show screen detel -->
  <div class="screen-details">
    <v-row style="margin-bottom: 20px" align="center">
      <v-col cols="12" v-if="screenId">

        <!-- Card แสดงข้อมูล Screen -->
        <!--<v-card class="mx-auto align-start" max-width="none" hover>
    <v-img
      v-if="screen_pic"
      :src="screen_pic"
      alt="Screen PIC"
      width="100%"
      height="300px"
      @click="showImageDialog = true"
    ></v-img>-->

        <v-card>
          <v-card-item class="d-flex justify-space-between align-center" @click="showDetails = !showDetails">
            <div class="card-title">
              <v-card-title>Screen name : {{ screen_name }}</v-card-title>
            </div>
            <div class="text-center">
              <v-row justify="center" class="progress-row">
                <v-col cols="auto" class="progress-item">
                  <v-progress-circular class="my-progress" :rotate="360" :size="100" :width="15" :value="value"
                    color="purple">
                    {{ value }}
                  </v-progress-circular>
                  <div class="progress-label">Design</div>
                </v-col>

                <v-col cols="auto" class="progress-item">
                  <v-progress-circular class="my-progress" :rotate="-90" :size="100" :width="15" :value="value"
                    color="blue">
                    {{ value }}
                  </v-progress-circular>
                  <div class="progress-label">Develop</div>
                </v-col>

                <v-col cols="auto" class="progress-item">
                  <v-progress-circular class="my-progress" :rotate="90" :size="100" :width="15" :value="screen_progress"
                    color="green">
                    {{ Math.floor(screen_progress) }}%
                  </v-progress-circular>
                  <div class="progress-label">Total</div>
                </v-col>
              </v-row>
              <div style="margin-top: 20px;"></div> <!-- เพิ่มช่องว่างด้านบน -->
            </div>

            <div class="icon">
              <v-icon class="custom-btn" @click.stop="openUserListDialog" style="margin-right: 25px">
                mdi-account-multiple
              </v-icon>
            </div>
          </v-card-item>

          <!-- <v-card-subtitle @click="showDetails = !showDetails">
            <span style="font-weight: bold; color: black; font-size: 16px">Screen Progress</span>
            <v-progress-linear :color="getProgressColor(parseInt(screen_progress))" height="50"
              :value="parseInt(screen_progress)" striped>
              <strong :style="{ color: '#5E5E5E', fontSize: '20px' }">
                {{ Math.floor(screen_progress) }}%
              </strong>
            </v-progress-linear>
          </v-card-subtitle> -->

          <v-expand-transition>
            <div v-show="showDetails">
              <v-divider></v-divider>
              <v-card-text>
                <p>Plan Start: {{ screen_plan_start ? formatDate(screen_plan_start) : "Not determined" }}</p>
                <p>Plan End: {{ screen_plan_end ? formatDate(screen_plan_end) : "Not determined" }}</p>
                <p>Screen Manday: {{ screen_manday || 0 }}</p>
                <p>Screen Level: {{ screen_level }}</p>
                <p>Task Count: {{ task_count || 0 }}</p>
              </v-card-text>
            </div>
          </v-expand-transition>
        </v-card>
      </v-col>

      <!-- แสดงรูปภาพ Dialog -->
      <v-dialog v-model="showImageDialog" max-width="1000" max-height="800" fitscreen hide-overlay>
        <v-img :src="screen_pic" class="dialog-image" @click="closeImageDialog"></v-img>
      </v-dialog>

      <!-- แสดง ข้อมูลผู้ใช้ในระบบ Dialog -->
      <v-dialog v-model="userDialog" max-width="500" @keydown.stop>
        <v-card>
          <v-card-title>ข้อมูลผู้ใช้ในระบบ</v-card-title>
          <!-- เพิ่มช่องค้นหา User -->
          <v-card-actions>
            <v-row no-gutters>
              <v-col cols="12">
                <v-text-field v-model="searchUser" label="Search" clearable></v-text-field>
              </v-col>
            </v-row>
          </v-card-actions>
          <v-card-text>
            <v-list>
              <v-list-item v-for="user in paginatedUserList" :key="user.user_id">
                <v-list-item-avatar>
                  <v-img :src="user.user_pic" alt="User Profile"></v-img>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ user.user_firstname }} {{ user.user_lastname }}
                  </v-list-item-title>
                  <v-list-item-subtitle>{{
                    user.user_position
                    }}</v-list-item-subtitle>
                  <v-list-item-subtitle>{{
                    user.user_department
                    }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions class="pagination" style="display: flex; justify-content: space-between">
            <v-pagination v-if="totalPagesUser > 1" v-model="currentPageUser" :length="totalPagesUser"
              @input="paginateUserList"></v-pagination>
            <v-btn color="error" @click="closeUserListDialog">ปิด</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>

    <!-- Task list -->
    <div class="task-list">
      <!-- ScreenName and Progress -->
      <div class="topper">
        <h3>Task Management</h3>
        <v-divider vertical></v-divider>
      </div>

      <!-- Search bar -->
      <v-row no-gutters>
        <v-col cols="7">
          <v-text-field v-model="searchQuery" label="Search" clearable outlined
            style="width: 100%; border-radius: 20px;">
          </v-text-field>
        </v-col>
        <!-- open add task form -->
        <v-col cols="4" class="text-right">
          <v-btn class="rounded-btn" color="primary" @click="dialogAddTaskForm = true" style="width: 30%;">
            Add Task
          </v-btn>
          <v-btn class="rounded-btn" color="error" @click="handleDelete"
            style="width: 10%; margin-left: 16px; margin-right: 16px;">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-col>
      </v-row>

      <v-divider></v-divider>


      <!-- v-tabs for filtering tasks by status -->
      <v-tabs v-model="selectedStatus">
        <v-tab>All</v-tab>
        <v-tab v-for="(status, index) in statusOptions" :key="index">{{
          status
          }}</v-tab>
        <v-tab-item>
          <v-row>
            <!-- Dropdown for sorting -->
            <v-col cols="12" class="text-right">
              <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn text v-bind="attrs" v-on="on" class="text-right">
                    sort by <v-icon>mdi-menu-down</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="sortTasks('task_name')">Sort by Task Name A-Z</v-list-item>
                  <v-list-item @click="sortTasks('-task_name')">Sort by Task Name Z-A</v-list-item>
                  <v-list-item @click="sortTasks('task_progress')">Sort by Progress (Low to High)</v-list-item>
                  <v-list-item @click="sortTasks('-task_progress')">Sort by Progress (High to Low)</v-list-item>
                  <v-list-item @click="sortTasks('task_plan_start')">Sort by Plan Start first date</v-list-item>
                  <v-list-item @click="sortTasks('task_plan_start_last')">Sort by Plan Start last date</v-list-item>
                  <v-list-item @click="sortTasks('task_plan_end')">Sort by Plan End first date</v-list-item>
                  <v-list-item @click="sortTasks('task_plan_end_last')">Sort by Plan End last date</v-list-item>
                  <!-- Add more sorting options as needed -->
                </v-list>
              </v-menu>
            </v-col>

            <v-col v-for="(task, index) in paginatedTasks" :key="index" cols="12" md="6" lg="4">
              <v-card class="mb-3" style="overflow-y: auto" @click="openDialog(task)">
                <v-card-title><span style="margin-right: auto">ชื่องาน: {{ task.task_name }}</span></v-card-title>
                <v-card-text>
                  <!-- Row 1: Task Name and Progress -->
                  <div class="d-flex justify-space-between">
                    <v-row>
                      <v-col>
                        <span style="margin-right: auto; font-size: 17px">Progress :
                        </span>
                      </v-col>
                      <v-col>
                        <v-progress-linear :color="getProgressColorTask(parseInt(task.task_progress))
        " height="15" :value="parseInt(task.task_progress)" striped :style="{ width: '100%' }">
                          <strong :style="{ color: '#5E5E5E' }">{{ parseInt(task.task_progress) }}%</strong>
                        </v-progress-linear>
                      </v-col>
                    </v-row>
                  </div>

                  <!-- Row 2: Task Detail -->
                  <p class="clamp-text">
                    Task Detail:
                    {{ task.task_detail ? task.task_detail : "Not determined" }}
                  </p>

                  <!-- Row 3: User Details -->
                  <div style="height: 100px">
                    <v-divider></v-divider>
                    <v-list v-if="task.memberDetails">
                      <v-list-item>
                        <v-list-item-avatar>
                          <img :src="task.memberDetails.user_pic" alt="User Pic" />
                        </v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-title>First Name:
                            {{
                            task.memberDetails.user_firstname
                            }}</v-list-item-title>
                          <v-list-item-subtitle>Last Name:
                            {{
                            task.memberDetails.user_lastname
                            }}</v-list-item-subtitle>
                          <v-list-item-subtitle>Position:
                            {{
                            task.memberDetails.user_position
                            }}</v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                    <v-card-text v-else>
                      <div style="text-align: center; height: 70px">
                        <p>User not determined</p>
                      </div>
                    </v-card-text>
                    <v-divider></v-divider>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <!-- Row 4: Plan Start, Plan End, Buttons -->
                  <div style="display: flex; flex-direction: column">
                    <p>Status : {{ task.task_status }}</p>
                    <!-- Plan Start -->
                    <p>
                      Plan Start:
                      {{
                      task.task_plan_start
                      ? formatDate(task.task_plan_start)
                      : "Not determined"
                      }}
                    </p>

                    <!-- Plan End -->
                    <p>
                      Plan End:
                      {{
                      task.task_plan_end
                      ? formatDate(task.task_plan_end)
                      : "Not determined"
                      }}
                    </p>

                    <!-- Buttons -->
                    <div>
                      <v-btn v-if="user.user_role === 'Admin'" icon color="primary" @click.stop="
        dialogEditTaskForm = true;
      editedTask = task;
      ">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn v-if="(task.memberDetails &&
          task.memberDetails.id === user.id) ||
        user.user_role === 'Admin'
        " icon color="primary" @click.stop="openSaveHistoryDialog(task)">
                        <v-icon>mdi-content-save</v-icon>
                      </v-btn>
                      <v-btn v-if="(task.memberDetails &&
          task.memberDetails.id === user.id) ||
        user.user_role === 'Admin'
        " icon color="error" @click.stop="deleteTask(task)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                      <v-btn v-if="!task.memberDetails || !task.memberDetails.id" color="primary"
                        style="margin-left: 75px" @click.stop="takeTask(task)">
                        Take this task.
                      </v-btn>
                    </div>
                  </div>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>

          <!-- Pagination -->
          <v-pagination v-model="currentPage" :length="numberOfPages" @input="changePage" />
        </v-tab-item>

        <v-tab-item v-for="(status, index) in statusOptions" :key="index">
          <v-row>
            <v-col v-for="(task, index) in filteredTasksByStatus(status)" :key="index" cols="12" md="6" lg="4">
              <v-card class="mb-3" style="overflow-y: auto" @click="openDialog(task)">
                <v-card-title><span style="margin-right: auto">ชื่องาน: {{ task.task_name }}</span></v-card-title>
                <v-card-text>
                  <!-- Row 1: Task Name and Progress -->
                  <div class="d-flex justify-space-between">
                    <v-row>
                      <v-col>
                        <span style="margin-right: auto; font-size: 17px">Progress :
                        </span>
                      </v-col>
                      <v-col>
                        <v-progress-linear color="primary" height="15" :value="parseInt(task.task_progress)" striped
                          :style="{ width: '100%' }">
                          <strong :style="{ color: 'white' }">{{ parseInt(task.task_progress)
                            }}%</strong></v-progress-linear>
                      </v-col>
                    </v-row>
                  </div>

                  <!-- Row 2: Task Detail -->
                  <p style="font-size: 16px; line-height: 1.5em; height: 170px">
                    Task Detail:
                    {{ task.task_detail ? task.task_detail : "Not determined" }}
                  </p>

                  <!-- Row 3: User Details -->
                  <div style="height: 100px">
                    <v-divider></v-divider>
                    <v-list v-if="task.memberDetails">
                      <v-list-item>
                        <v-list-item-avatar>
                          <img :src="task.memberDetails.user_pic" alt="User Pic" />
                        </v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-title>First Name:
                            {{
                            task.memberDetails.user_firstname
                            }}</v-list-item-title>
                          <v-list-item-subtitle>Last Name:
                            {{
                            task.memberDetails.user_lastname
                            }}</v-list-item-subtitle>
                          <v-list-item-subtitle>Position:
                            {{
                            task.memberDetails.user_position
                            }}</v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                    <v-card-text v-else>
                      <div style="text-align: center; height: 70px">
                        <p>User not determined</p>
                      </div>
                    </v-card-text>
                    <v-divider></v-divider>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <!-- Row 4: Plan Start, Plan End, Buttons -->
                  <div style="display: flex; flex-direction: column">
                    <p>Status : {{ task.task_status }}</p>
                    <!-- Plan Start -->
                    <p>
                      Plan Start:
                      {{
                      task.task_plan_start
                      ? formatDate(task.task_plan_start)
                      : "Not determined"
                      }}
                    </p>

                    <!-- Plan End -->
                    <p>
                      Plan End:
                      {{
                      task.task_plan_end
                      ? formatDate(task.task_plan_end)
                      : "Not determined"
                      }}
                    </p>

                    <!-- Buttons -->
                    <div>
                      <v-btn icon color="primary" @click.stop="
      dialogEditTaskForm = true;
      editedTask = task;
      ">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn icon color="primary" @click.stop="openSaveHistoryDialog(task)">
                        <v-icon>mdi-content-save</v-icon>
                      </v-btn>

                      <v-btn icon color="error" @click.stop="deleteTask(task)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-tab-item>

        <v-tab>Task to day</v-tab>
        <v-tab-item>
          <v-row>
            <v-col v-for="(task, index) in tasksToday" :key="index" cols="12" md="6" lg="4">
              <v-card class="mb-3" style="overflow-y: auto" @click="openDialog(task)">
                <v-card-title><span style="margin-right: auto">ชื่องาน: {{ task.task_name }}</span></v-card-title>
                <v-card-text>
                  <!-- Row 1: Task Name and Progress -->
                  <div class="d-flex justify-space-between">
                    <v-row>
                      <v-col>
                        <span style="margin-right: auto; font-size: 17px">Progress :
                        </span>
                      </v-col>
                      <v-col>
                        <v-progress-linear color="primary" height="15" :value="parseInt(task.task_progress)" striped
                          :style="{ width: '100%' }">
                          <strong :style="{ color: 'white' }">{{ parseInt(task.task_progress)
                            }}%</strong></v-progress-linear>
                      </v-col>
                    </v-row>
                  </div>

                  <!-- Row 2: Task Detail -->
                  <p style="font-size: 16px; line-height: 1.5em; height: 170px">
                    Task Detail:
                    {{ task.task_detail ? task.task_detail : "Not determined" }}
                  </p>

                  <!-- Row 3: User Details -->
                  <div style="height: 100px">
                    <v-divider></v-divider>
                    <v-list v-if="task.memberDetails">
                      <v-list-item>
                        <v-list-item-avatar>
                          <img :src="task.memberDetails.user_pic" alt="User Pic" />
                        </v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-title>First Name:
                            {{
                            task.memberDetails.user_firstname
                            }}</v-list-item-title>
                          <v-list-item-subtitle>Last Name:
                            {{
                            task.memberDetails.user_lastname
                            }}</v-list-item-subtitle>
                          <v-list-item-subtitle>Position:
                            {{
                            task.memberDetails.user_position
                            }}</v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                    <v-card-text v-else>
                      <div style="text-align: center; height: 70px">
                        <p>User not determined</p>
                      </div>
                    </v-card-text>
                    <v-divider></v-divider>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <!-- Row 4: Plan Start, Plan End, Buttons -->
                  <div style="display: flex; flex-direction: column">
                    <p>Status : {{ task.task_status }}</p>
                    <!-- Plan Start -->
                    <p>
                      Plan Start:
                      {{
                      task.task_plan_start
                      ? formatDate(task.task_plan_start)
                      : "Not determined"
                      }}
                    </p>

                    <!-- Plan End -->
                    <p>
                      Plan End:
                      {{
                      task.task_plan_end
                      ? formatDate(task.task_plan_end)
                      : "Not determined"
                      }}
                    </p>

                    <!-- Buttons -->
                    <div>
                      <v-btn icon color="primary" @click.stop="
      dialogEditTaskForm = true;
      editedTask = task;
      ">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn icon color="primary" @click.stop="openSaveHistoryDialog(task)">
                        <v-icon>mdi-content-save</v-icon>
                      </v-btn>

                      <v-btn icon color="error" @click.stop="deleteTask(task)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-tab-item>
      </v-tabs>

      <!-- Dialog for Task Details -->
      <v-dialog v-model="dialog" width="9000px">
        <v-card class="task-details-card">
          <v-card-title class="task-title">
            Details of Task : {{ dialogTaskDetails.task_name }}
          </v-card-title>
          <v-card-text class="task-details">
            <v-row>
              <!-- Task Info -->
              <v-col cols="4">
                <div class="task-info">
                  <p>
                    <strong>Task ID:</strong> {{ dialogTaskDetails.task_id }}
                  </p>
                  <p>
                    <strong>Task Detail:</strong>
                    {{ dialogTaskDetails.task_detail }}
                  </p>
                  <p>
                    <strong>Status:</strong> {{ dialogTaskDetails.task_status }}
                  </p>
                  <p>
                    <strong>Manday:</strong>
                    {{ dialogTaskDetails.task_manday || 0 }} Days
                  </p>
                  <p>
                    <strong>Progress:</strong>
                    {{ dialogTaskDetails.task_progress || 0 }} %
                  </p>
                </div>
              </v-col>

              <!-- Responsible Person -->
              <v-col cols="4">
                <div class="responsible-person">
                  <p><strong>Responsible person:</strong></p>
                  <p v-if="dialogTaskDetails.memberDetails">
                    {{ dialogTaskDetails.memberDetails.user_firstname }}
                    {{ dialogTaskDetails.memberDetails.user_lastname }}
                  </p>
                  <p v-else>Not determined</p>
                </div>
              </v-col>

              <!-- Task Dates -->
              <v-col cols="4">
                <div class="task-dates">
                  <p>
                    <strong>Last updated date:</strong>
                    {{
                    formatDate(dialogTaskDetails.task_date_update) ||
                    "Not determined"
                    }}
                  </p>
                  <p>
                    <strong>Plan Start:</strong>
                    {{
                    formatDate(dialogTaskDetails.task_plan_start) ||
                    "Not determined"
                    }}
                  </p>
                  <p>
                    <strong>Plan End:</strong>
                    {{
                    formatDate(dialogTaskDetails.task_plan_end) ||
                    "Not determined"
                    }}
                  </p>
                  <p>
                    <strong>Actual Start:</strong>
                    {{
                    formatDate(dialogTaskDetails.task_actual_start) ||
                    "Not determined"
                    }}
                  </p>
                  <p>
                    <strong>Actual End:</strong>
                    {{
                    formatDate(dialogTaskDetails.task_actual_end) ||
                    "Not determined"
                    }}
                  </p>
                </div>
              </v-col>
            </v-row>
          </v-card-text>

          <div>
            <h3 style="padding-left: 20px">History tasks</h3>
          </div>
          <v-data-table :headers="historyHeaders" :items="historyTasks" item-key="id" class="table-with-border"
            :sort-by="[{ key: 'update_date', order: 'desc' }]">
            <template v-slot:item.task_detail="{ item }">
              {{ item.task_detail ? item.task_detail : "No determine" }}
            </template>

            <!-- โค้ดประสาทีนี้เรียงตาม update_date -->
            <template v-slot:item.user_update="{ item }">
              {{ item.user_update ? item.user_update : "No determine" }}
            </template>

            <!-- โค้ดประสาทีนี้เรียงตาม update_date -->
            <template v-slot:item.update_date="{ item }">
              {{
              item.update_date ? formatDate(item.update_date) : "No determine"
              }}
            </template>

            <!-- ส่วนที่เหลือจะใช้ formatDate ตามปกติ -->
            <template v-slot:item.task_plan_start="{ item }">
              {{
              item.task_plan_start
              ? formatDate(item.task_plan_start)
              : "No determine"
              }}
            </template>
            <template v-slot:item.task_plan_end="{ item }">
              {{
              item.task_plan_end
              ? formatDate(item.task_plan_end)
              : "No determine"
              }}
            </template>
            <template v-slot:item.task_actual_start="{ item }">
              {{
              item.task_actual_start
              ? formatDate(item.task_actual_start)
              : "No determine"
              }}
            </template>
            <template v-slot:item.task_actual_end="{ item }">
              {{
              item.task_actual_end
              ? formatDate(item.task_actual_end)
              : "No determine"
              }}
            </template>
            <!-- โค้ดประสาทีนี้เรียงตาม update_date -->
            <template v-slot:item.task_manday="{ item }">
              {{ item.task_manday !== null ? item.task_manday : 0 }} days
            </template>
          </v-data-table>

          <v-card-actions>
            <v-btn color="error" @click="dialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

<!-- Edit task dialog -->
    <v-dialog v-model="dialogEditTaskForm" max-width="600px">
  <v-card>
    <v-card-title>
      <h2>Edit Task</h2>
      <v-spacer></v-spacer>
      <v-btn icon @click="dialogEditTaskForm = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-form @submit.prevent="updateTask">
        <v-row>
          <v-col cols="6">
            <v-text-field v-model="editedTask.task_id" label="Task ID" readonly disabled ></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-text-field v-model="editedTask.task_name" label="Task Name" required></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="6">
            <v-menu v-model="planStartMenu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y>
              <template v-slot:activator="{ on }">
                <v-text-field :value="formatDate(editedTask.task_plan_start, 'DD-MM-YYYY')" label="Plan Start" prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
              </template>
              <v-date-picker v-model="editedTask.task_plan_start" no-title scrollable></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="6">
            <v-menu v-model="planEndMenu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y>
              <template v-slot:activator="{ on }">
                <v-text-field :value="formatDate(editedTask.task_plan_end, 'DD-MM-YYYY')" label="Plan End" prepend-icon="mdi-calendar" readonly v-on="on" :disabled="!editedTask.task_plan_start"></v-text-field>
              </template>
              <v-date-picker v-model="editedTask.task_plan_end" no-title scrollable :min="editedTask.task_plan_start"></v-date-picker>
            </v-menu>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="6">
            <v-menu v-if="editedTask.task_plan_start && editedTask.task_plan_end" v-model="actualStartMenu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y>
              <template v-slot:activator="{ on }">
                <v-text-field :value="formatDate(editedTask.task_actual_start, 'DD-MM-YYYY')" label="Actual Start" prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
              </template>
              <v-date-picker v-model="editedTask.task_actual_start" no-title scrollable></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="6">
            <v-menu v-if="editedTask.task_plan_start && editedTask.task_plan_end" v-model="actualEndMenu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y>
              <template v-slot:activator="{ on }">
                <v-text-field :value="formatDate(editedTask.task_actual_end, 'DD-MM-YYYY')" label="Actual End" prepend-icon="mdi-calendar" readonly v-on="on" :disabled="!editedTask.task_actual_start"></v-text-field>
              </template>
              <v-date-picker v-model="editedTask.task_actual_end" no-title scrollable :min="editedTask.task_actual_start"></v-date-picker>
            </v-menu>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="6">
            <v-text-field v-model="editedTask.task_manday" label="Plan Manday" required></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-select v-model="editedTask.task_status" :items="['Not started yet', 'Design', 'Develop']" label="Type of Task" required outlined dense></v-select>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-select v-model="editedTask.task_member_id" :items="userListCreate" item-value="user_id" item-text="user_name" label="Assign To" required>
              <template v-slot:item="{ item }">
                <v-list-item-avatar>
                  <v-img :src="item.user_pic" />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{ item.user_name }}</v-list-item-title>
                </v-list-item-content>
              </template>
            </v-select>
          </v-col>
        </v-row>

        <v-row justify="center">
          <v-col cols="auto">
            <v-btn color="success" type="submit" >Save</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn
              v-if="(editedTask.memberDetails && editedTask.memberDetails.id === user.id) || user.user_role === 'Admin'"
              color="error"
              @click.stop="deleteTask(editedTask)"
            >
              Delete
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</v-dialog>


    <!-- save task dialog -->
    <v-dialog v-model="dialogSaveTaskForm" max-width="600px">
  <v-card>
    <v-card-title>
      <h2>Update Task</h2>     
      <v-spacer></v-spacer>
      <v-btn icon @click="dialogSaveTaskForm = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
  
    </v-card-title>
    <v-card-text>
      <v-form @submit.prevent="saveHistory">
        <v-row align="center" justify="center" class="w-100">
        <v-col class="text-center">
          <h2>Task Name:{{ historyTaskData.task_name }}</h2>
        </v-col>
      </v-row>
        <!-- Progress -->
        <v-row align="center">
          <v-col cols="4">
            <v-text-field v-model="historyTaskData.task_progress" label="Task Progress" type="number" min="0" max="100" outlined dense></v-text-field>
          </v-col>
          <v-col cols="8">
            <v-slider v-model="historyTaskData.task_progress" :thumb-label="true" thumb-size="20" ticks="always" tick-size="2" tick-thickness="2" track-color="primary" :max="100" :min="0" step="1"></v-slider>
          </v-col>
        </v-row>

        <!-- Remark -->
        <v-text-field v-model="historyTaskData.task_remark" label="Remark" outlined dense></v-text-field>

        <!-- Dates and Mandays -->
        <v-row>
          <v-col cols="4">
            <v-menu v-model="planStartMenu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y>
              <template v-slot:activator="{ on }">
                <v-text-field :value="formatDate(historyTaskData.task_plan_start, 'DD/MM/YYYY')" label="Plan Start" prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
              </template>
              <v-date-picker v-model="historyTaskData.task_plan_start" no-title scrollable></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="4">
            <v-menu v-model="planEndMenu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y>
              <template v-slot:activator="{ on }">
                <v-text-field :value="formatDate(historyTaskData.task_plan_end, 'DD/MM/YYYY')" label="Plan End" prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
              </template>
              <v-date-picker v-model="historyTaskData.task_plan_end" no-title scrollable :min="historyTaskData.task_plan_start"></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="4">
            <v-text-field v-model="historyTaskData.plan_manday" label="Plan Manday" type="number" min="0" max="100" outlined dense></v-text-field>
          </v-col>
        </v-row>

        <!-- ติดไม่สามารถแสดงตัวเลือกวันของ actual ได้ -->
        <v-row>
          <v-col cols="4">
            <v-menu v-if="historyTaskData.task_plan_start && historyTaskData.task_plan_end" v-model="actualStartMenu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y>
              <template v-slot:activator="{ on }">
                <v-text-field :value="formatDate(historyTaskData.task_actual_start, 'DD/MM/YYYY')" label="Actual Start" prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
              </template>
              <v-date-picker v-model="historyTaskData.task_actual_start" no-title scrollable></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="4">
            <v-menu v-if="historyTaskData.task_plan_start && historyTaskData.task_plan_end" v-model="actualEndMenu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y>
              <template v-slot:activator="{ on }">
                <v-text-field :value="formatDate(historyTaskData.task_actual_end, 'DD/MM/YYYY')" label="Actual End" prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
              </template>
              <v-date-picker v-model="historyTaskData.task_actual_end" no-title scrollable :min="historyTaskData.task_actual_start"></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="4">
            <v-text-field v-model="historyTaskData.actual_manday" label="Actual Manday" type="number" min="0" max="100" outlined dense></v-text-field>
          </v-col>
        </v-row>

        <!-- Save and Cancel Buttons -->
        <v-row justify="center">
          <v-col cols="auto">
            <v-btn color="primary" type="submit">Save</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn color="error" @click="dialogSaveTaskForm = false">Cancel</v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</v-dialog>


      <!-- Create task dialog -->
    <v-dialog v-model="dialogAddTaskForm" max-width="600px">
      <v-card>
        <v-card-title>
          <h2>Create New Task</h2>
        </v-card-title>
        <v-card-text>
          <!-- Create task form -->
          <v-form @submit.prevent="createTask(newTask)">
            <!-- Task ID -->
            <v-text-field v-model="newTask.task_id" label="Task ID" required append-icon="mdi-alert-circle"
              pattern="[A-Za-z0-9@#$%^&*()-_+=!]+"></v-text-field>

            <!-- Task Name -->
            <v-text-field v-model="newTask.task_name" label="Task Name" required
              append-icon="mdi-alert-circle"></v-text-field>

            <!-- Detail -->
            <v-text-field v-model="newTask.task_detail" label="Detail"></v-text-field>

            <!-- Status -->
            <v-select v-model="newTask.task_status" :items="statusOptions" label="Status"></v-select>

            <!-- Plan Start -->
            <v-menu v-model="planStartMenu" :close-on-content-click="false" :nudge-right="40"
              transition="scale-transition" offset-y max-width="300px">
              <template v-slot:activator="{ on }">
                <v-text-field label="Plan Start" prepend-icon="mdi-calendar" readonly v-on="on"
                  :value="formatDate(newTask.task_plan_start)"></v-text-field>
              </template>
              <v-date-picker v-model="newTask.task_plan_start" no-title scrollable max-width="300px"></v-date-picker>
            </v-menu>

            <!-- Plan End -->
            <v-menu v-model="planEndMenu" :close-on-content-click="false" :nudge-right="40"
              transition="scale-transition" offset-y max-width="300px">
              <template v-slot:activator="{ on }">
                <v-text-field label="Plan End" prepend-icon="mdi-calendar" readonly v-on="on"
                  :min="newTask.task_plan_start" :value="formatDate(newTask.task_plan_end)"></v-text-field>
              </template>
              <v-date-picker v-model="newTask.task_plan_end" no-title scrollable max-width="300px"
                :min="newTask.task_plan_start"></v-date-picker>
            </v-menu>

            <v-text-field v-model="newTask.task_manday" label="Manday" :readonly="true"></v-text-field>

            <!-- Member ID -->
            <v-select v-model="newTask.task_member_id" :items="userListCreate" item-value="user_id"
              item-text="user_name" label="Member ID">
              <template v-slot:item="{ item }">
                <v-list-item-avatar>
                  <v-img :src="item.user_pic" />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{ item.user_name }}</v-list-item-title>
                </v-list-item-content>
              </template>
            </v-select>

            <!-- Submit button -->
            <v-btn color="primary" :disabled="!newTask.task_id || !newTask.task_name" type="submit">Create</v-btn>

            <!-- Cancel button -->
            <v-btn color="error" @click="cancel">Cancel</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";
import Breadcrumbs from "~/components/project/Breadcrumbs.vue";

export default {
  middleware: "auth",
  layout: "admin",
  layout: "admin",
  components: {
    Breadcrumbs,
  },
  data() {
    return {
      loggedIn: this.$auth.loggedIn,
      user: this.$auth.user,
      dialogSaveTaskForm: false, // Dialog status
      historyTaskData: {
        task_name: "",
        task_detail: "",
        task_status: "",
        task_progress: "",
        task_plan_start: "",
        task_plan_end: "",
        task_manday: "",
        task_actual_start: "",
        task_actual_end: "",
      },

      value: 0, // กำหนดค่าเริ่มต้นสำหรับ value
      interval: null, // สำหรับเก็บค่า interval

      dialogTaskDetails: {}, // ถ้าต้องการเก็บข้อมูล Task Details ให้ใช้ตัวแปรนี้
      historyTasks: [], // เก็บข้อมูล history tasks ที่ได้จาก API
      historyHeaders: [
        { text: "Update date", value: "update_date" },
        { text: "User update", value: "user_update" },
        { text: "Task Name", value: "task_name" },
        { text: "Task Detail", value: "task_detail" },
        { text: "Status", value: "task_status" },
        { text: "Progress", value: "task_progress" },
        { text: "Plan Start", value: "task_plan_start" },
        { text: "Plan End", value: "task_plan_end" },
        { text: "Actual Start", value: "task_actual_start" },
        { text: "Actual End", value: "task_actual_end" },
        { text: "Manday", value: "task_manday" },
      ],
      dialog: false,
      dialogTaskDetails: {},
      currentPageUser: 1,
      itemsPerPage: 3,
      filteredUsers: [],
      searchUser: "",
      rules: {
        required: (value) => !!value || "Field is required",
        maxManday: (value) =>
          (value && value <= 10) || "Manday must not exceed 10",
      },
      selectedStatus: "start",
      planStartMenu: false,
      planEndMenu: false,
      actualStartMenu: false,
      actualEndMenu: false,
      editedTask: {
        task_name: "",
        task_detail: "",
        task_status: "",
        task_manday: "",
        task_progress: "",
        task_plan_start: "",
        task_plan_end: "",
        task_actual_start: "",
        task_actual_end: "",
        task_member_id: "",
      },
      tasks: [],
      currentPage: 1,
      perPage: 12,
      statusOptions: ["Not started yet","Design", "Develop"],
      showImageDialog: false,
      screen_plan_start: "",
      screen_plan_end: "",
      screen_progress: "",
      screen_manday: "",
      screen_level: "",
      screen_pic: "",
      screenType: "",
      task_count: "",
      screen_name: "",
      userDialog: false,
      userList: [],
      userListCreate: [],
      screenId: "",
      system_id: "",
      project_id: "",

      showDetails: false,
      // Dialogs
      dialogEditTaskForm: false,
      dialogAddTaskForm: false,
      show: false,
      searchQuery: "",
      //Edited Task data

      //Task data
      tasks: [],
      //New Task data
      newTask: {
        task_id: "",
        task_name: "",
        task_status: "Not started yet",
        person_in_charge: "",
        task_plan_start: null,
        task_plan_end: null,
        task_manday: 0,
        task_detail: "",
      },
      isEditableManday: true,
      taskIDRules: [
        (v) => !!v || "Task ID is required",
        (v) =>
          (v && /^[A-Za-z0-9@#$%^&*()-_+=!]+$/.test(v)) ||
          "Invalid characters. Only English letters, numbers, and symbols are allowed",
      ],
      taskNameRules: [
        (v) => !!v || "Task Name is required",
        (v) =>
          (v && v.length <= 50) ||
          "Task Name must be less than or equal to 50 characters",
      ],
      value: 0, // ค่าที่จะอัปเดตทุก ๆ 1 วินาที
    };
  },
  mounted() {
    this.interval = setInterval(() => {
      if (this.value >= 100) {
        this.value = 0;
      } else {
        this.value += 10;
      }
    }, 1000);
  },
  beforeDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  },

  computed: {
    getProgressColorTask() {
      return function (progress) {
        if (progress >= 61) {
          return "green"; // สีเขียว
        } else if (progress >= 40) {
          return "#FC8705"; // สีเหลือง
        } else {
          return "red"; // สีแดง
        }
      };
    },
    numberOfPages() {
      return Math.ceil(this.filteredTasks.length / this.perPage);
    },
    paginatedTasks() {
      const startIndex = (this.currentPage - 1) * this.perPage;
      const endIndex = startIndex + this.perPage;
      return this.filteredTasks.slice(startIndex, endIndex);
    },
    paginatedUserList() {
      const start = (this.currentPageUser - 1) * this.itemsPerPage;
      const end = this.currentPageUser * this.itemsPerPage;
      return this.filteredUsers.slice(start, end);
    },
    totalPagesUser() {
      return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    },
    filteredUserList() {
      return this.userList.filter(
        (user) =>
          user.user_firstname
            .toLowerCase()
            .includes(this.searchUser.toLowerCase()) ||
          user.user_lastname
            .toLowerCase()
            .includes(this.searchUser.toLowerCase()) ||
          user.user_position
            .toLowerCase()
            .includes(this.searchUser.toLowerCase()) ||
          user.user_department
            .toLowerCase()
            .includes(this.searchUser.toLowerCase())
      );
    },
    calculatedManday() {
      // Check if both task_plan_start and task_plan_end are selected
      if (this.newTask.task_plan_start && this.newTask.task_plan_end) {
        const start = new Date(this.newTask.task_plan_start);
        const end = new Date(this.newTask.task_plan_end);
        const differenceInTime = end.getTime() - start.getTime();
        const differenceInDays = differenceInTime / (1000 * 3600 * 24);
        return differenceInDays;
      } else {
        // If task_plan_end is not selected, return null
        return null;
      }
    },
    filteredTasksByStatus() {
      return (status) => {
        if (this.tasks && Array.isArray(this.tasks)) {
          return this.tasks.filter(
            (task) => task.task_status.toLowerCase() === status.toLowerCase()
          );
        } else {
          return [];
        }
      };
    },

    // คำนวณจำนวนหน้าทั้งหมด
    totalPages() {
      return Math.ceil(this.tasks.length / this.pageSize);
    },
    filteredTasks() {
      if (this.tasks && Array.isArray(this.tasks)) {
        return this.tasks.filter((task) => {
          // ตรวจสอบว่า task_name, task_id มีค่าหรือไม่
          if (task.task_name && task.task_id) {
            // นำเนื้อหาของ task_name, task_id มาต่อกันเพื่อค้นหา
            const searchText =
              `${task.task_name} ${task.task_id}`.toLowerCase();
            // ค้นหาโดยใช้ searchQuery ที่ผูกกับ input และคืนค่า true เมื่อพบข้อความที่ค้นหา
            return searchText.includes(this.searchQuery.toLowerCase());
          } else {
            return false;
          }
        });
      } else {
        return [];
      }
    },
  },

  mounted() {
    this.fetchAllScreens()
      .then(() => this.fetchAllSystems())
      .then(() => this.fetchAllProjects())
      .then(() => this.fetchScreenDetail())
      .then(() => this.fetchUserList())
      .then(() => this.fetchTasks())
      .catch((error) => {
        console.error("Error:", error);
        // Handle error here
      });
  },

  created() {
    // เรียกใช้ฟังก์ชันเมื่อโหลดหน้า
    this.getTasksToday();
  },
  watch: {
    "historyTaskData.task_plan_start": function (newVal, oldVal) {
      this.calculateMandaySAVE();
    },
    "historyTaskData.task_plan_end": function (newVal, oldVal) {
      this.calculateMandaySAVE();
    },
    "newTask.task_plan_start": "calculateMandays",
    "newTask.task_plan_end": "calculateMandays",
    "editedTask.task_plan_start": function (newValue, oldValue) {
      if (this.editedTask.task_plan_start && this.editedTask.task_plan_end) {
        this.calculateMandayEdit();
      }
    },
    "editedTask.task_plan_end": function (newValue, oldValue) {
      if (this.editedTask.task_plan_start && this.editedTask.task_plan_end) {
        this.calculateMandayEdit();
      }
    },

    filteredTasks: {
      handler() {
        // เรียกใช้ฟังก์ชันเมื่อมีการเปลี่ยนแปลงใน Task ของคุณ
        this.getTasksToday();
      },
      deep: true,
    },
    // Watcher to update task_manday when task_plan_start or task_plan_end changes
  },
  methods: {
    calculateMandays() {
      // Check if both start and end dates are selected
      if (this.newTask.task_plan_start && this.newTask.task_plan_end) {
        // Calculate the difference in milliseconds between the two dates
        const diffMilliseconds =
          new Date(this.newTask.task_plan_end) -
          new Date(this.newTask.task_plan_start);
        // Convert milliseconds to days
        const days = Math.ceil(diffMilliseconds / (1000 * 60 * 60 * 24)) + 1; // Add 1 to count the end day
        // Update the manday field
        this.newTask.task_manday = days;
      } else {
        // If either start or end date is not selected, reset manday field
        this.newTask.task_manday = null;
      }
    },
    async takeTask(task) {
      try {
        // ตรวจสอบว่ามีข้อมูลผู้ใช้ที่เข้าสู่ระบบหรือไม่
        if (!this.$auth.user || !this.$auth.user.id) {
          throw new Error("User is not authenticated.");
        }

        // แสดง confirm dialog เพื่อยืนยันการ Take งาน
        const confirmResult = await Swal.fire({
          icon: "warning",
          title: "Are you sure?",
          text: "Do you want to take this task?",
          showCancelButton: true,
          confirmButtonColor: "#009933",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, take it!",
          cancelButtonText: "Cancel",
        });

        // ถ้าผู้ใช้กดปุ่มยืนยัน
        if (confirmResult.isConfirmed) {
          // อัปเดต task_member_id ด้วย ID ของผู้ใช้ที่เข้าสู่ระบบ
          const response = await fetch(
            `http://localhost:7777/tasks/updateTasks/${task.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ...task,
                task_member_id: this.$auth.user.id, // อัปเดต task_member_id ด้วย ID ของผู้ใช้ที่เข้าสู่ระบบ
              }),
            }
          );

          if (response.ok) {
            Swal.fire({
              icon: "success",
              title: "Task assigned successfully",
              confirmButtonColor: "#009933",
            });
            // อัปเดตรายการงาน
            this.fetchTasks();
          } else {
            throw new Error("Failed to assign task");
          }
        }
      } catch (error) {
        console.error("Error assigning task:", error);
        Swal.fire({
          icon: "error",
          title: "Error assigning task",
          text: error.message || "Please try again",
        });
      }
    },

    getProgressColor(progress) {
      if (progress >= 61 && progress <= 100) {
        return "green";
      } else if (progress >= 40 && progress <= 60) {
        return "#FC8705";
      } else if (progress >= 0 && progress <= 39) {
        return "red";
      }
      // เมื่อไม่ตรงกับเงื่อนไขใดๆ ให้คืนค่าเริ่มต้น
      return "primary";
    },
    async fetchAllScreens() {
      try {
        const response = await axios.get(
          "http://localhost:7777/screens/getAll"
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching screens:", error);
        throw error;
      }
    },
    async fetchAllSystems() {
      try {
        const response = await axios.get(
          "http://localhost:7777/systems/getAll"
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching systems:", error);
        throw error;
      }
    },
    async fetchAllProjects() {
      try {
        const response = await axios.get(
          "http://localhost:7777/projects/getAll"
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching projects:", error);
        throw error;
      }
    },
    formatDateHistory(historyTasks) {
      return historyTasks.map((task) => {
        // สร้างวัตถุใหม่ที่มีข้อมูลจาก task และแปลงรูปแบบวันที่
        return {
          ...task,
          // สมมติว่าวันที่อยู่ในคีย์ "date"
          date: new Date(task.date).toLocaleDateString("en-GB"), // ใช้ 'th-TH' หากต้องการให้เป็นภาษาไทย
        };
      });
    },
    openSaveHistoryDialog(task) {
      // Set task data for the form
      this.historyTaskData = {
        task_name: task.task_name,
        task_detail: task.task_detail,
        task_status: task.task_status,
        task_progress: task.task_progress,
        task_plan_start: task.task_plan_start,
        task_plan_end: task.task_plan_end,
        task_manday: task.task_manday,
        task_actual_start: task.task_actual_start,
        task_actual_end: task.task_actual_end,

        // Set other fields as per your API
      };
      // Set the task ID for the API endpoint
      this.taskId = task.id; // Assign task ID to a component data property
      // Open the save task dialog
      this.dialogSaveTaskForm = true;
    },
    formatDateSAVE(date) {
      // แปลงข้อความวันที่เป็นอ็อบเจ็ค Date
      const d = new Date(date);

      // ดึงค่าปี เดือน และวัน
      const year = d.getFullYear();
      let month = "" + (d.getMonth() + 1);
      let day = "" + d.getDate();

      // เติมเต็มเดือน และวันที่มีหลักเดียวด้วยเลขศูนย์ด้านหน้า
      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;

      // ส่งค่าวันที่ในรูปแบบ 'YYYY-MM-DD'
      return `${year}-${month}-${day}`;
    },

    calculateMandaySAVE() {
      // คำนวณจำนวนวันระหว่าง task_plan_start และ task_plan_end
      const start = new Date(this.historyTaskData.task_plan_start);
      const end = new Date(this.historyTaskData.task_plan_end);

      // ลบเวลาออกจากวันที่
      const startNoTime = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate()
      );
      const endNoTime = new Date(
        end.getFullYear(),
        end.getMonth(),
        end.getDate()
      );

      // หาความแตกต่างของวันแบบไม่คำนึงถึงเวลา
      const differenceInTime = endNoTime.getTime() - startNoTime.getTime();
      const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24)); // ใช้ Math.ceil() เพื่อปัดขึ้น

      // ตรวจสอบว่าไม่สามารถใส่ค่าลบหรือค่าเป็น NaN ได้
      if (isNaN(differenceInDays) || differenceInDays < 0) {
        this.historyTaskData.task_manday = "";
      } else {
        this.historyTaskData.task_manday = differenceInDays + 1; // เพิ่ม 1 เพื่อให้นับวันเริ่มต้นด้วย
      }
    },
    async saveHistory() {
      try {
        // ตรวจสอบค่า manday ที่ได้จากฟังก์ชัน calculateMandaySAVE()
        const manday = parseFloat(this.historyTaskData.task_manday);
        console.log(manday);
        const start = new Date(this.historyTaskData.task_plan_start);
        const end = new Date(this.historyTaskData.task_plan_end);
        const differenceInTime = end.getTime() - start.getTime();
        const differenceInDays = differenceInTime / (1000 * 3600 * 24) + 1;
        if (manday < 0 || manday > differenceInDays || isNaN(manday)) {
          // แสดง SweetAlert แจ้งเตือนเมื่อค่าไม่ถูกต้อง
          await Swal.fire({
            icon: "error",
            title: "Error",
            text:
              "Invalid manday value. Please enter a value between 0 and " +
              differenceInDays,
            confirmButtonColor: "#009933",
          });
          return; // ออกจากฟังก์ชันหลังจากแสดงข้อความแจ้งเตือน
        }

        if (this.historyTaskData.task_progress === 100) {
          // กำหนดค่า task_status เป็น "correct"
          this.historyTaskData.task_status = "correct";
        } else if (this.historyTaskData.task_progress === 0) {
          // ถ้า task_progress เป็น 0% ให้กำหนดค่า task_status เป็น 'Not started yet'
          this.historyTaskData.task_status = "Not started yet";
        } else {
          // ถ้า task_progress ไม่ใช่ 0 หรือ 100% หรือ task_progress ใหญ่กว่า 0 และน้อยกว่า 100%
          // ไม่ต้องทำอะไรเพิ่มเติม
          this.historyTaskData.task_status = "start";
        }

        // ตรวจสอบค่า task_manday และค่าอื่นๆ และบันทึกข้อมูล

        // ตรวจสอบว่าค่าวันที่ว่างเปล่าหรือไม่และกำหนดให้เป็น null
        if (this.historyTaskData.task_plan_start) {
          this.historyTaskData.task_plan_start = this.formatDateSAVE(
            this.historyTaskData.task_plan_start
          );
        } else {
          this.historyTaskData.task_plan_start = null;
        }
        if (this.historyTaskData.task_plan_end) {
          this.historyTaskData.task_plan_end = this.formatDateSAVE(
            this.historyTaskData.task_plan_end
          );
        } else {
          this.historyTaskData.task_plan_end = null;
        }
        if (this.historyTaskData.task_actual_start) {
          this.historyTaskData.task_actual_start = this.formatDateSAVE(
            this.historyTaskData.task_actual_start
          );
        } else {
          this.historyTaskData.task_actual_start = null;
        }
        if (this.historyTaskData.task_actual_end) {
          this.historyTaskData.task_actual_end = this.formatDateSAVE(
            this.historyTaskData.task_actual_end
          );
        } else {
          this.historyTaskData.task_actual_end = null;
        }

        // กำหนดค่า user_update
        this.historyTaskData.user_update = this.user.id;

        // เรียกใช้ API เพื่อบันทึกข้อมูลประวัติโดยใช้ task ID ที่กำหนด
        const response = await this.$axios.put(
          `http://localhost:7777/tasks/save_history_tasks/${this.taskId}`,
          this.historyTaskData
        );

        // จัดการการกระทำหลังจากบันทึกสำเร็จ
        console.log(response.data);
        // แสดงแจ้งเตือนเรื่องความสำเร็จ
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "History task has been saved successfully!",
          confirmButtonColor: "#009933",
        });
        // ปิด dialog หลังจากบันทึกสำเร็จ
        this.dialogSaveTaskForm = false;
        this.fetchTasks();
        this.fetchScreenDetail();
      } catch (error) {
        console.error("Error saving history task and updating task:", error);
        // แสดงแจ้งเตือนเรื่องข้อผิดพลาด
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while saving history task and updating task.",
          confirmButtonColor: "#009933",
        });
      }
    },

    cancelSaveHistory() {
      // Cancel save and close the dialog
      this.dialogSaveTaskForm = false;
    },
    async openDialog(taskId) {
      this.dialog = true;
      this.dialogTaskDetails = taskId;

      const task_Id = taskId.id;

      try {
        const response = await fetch(
          `http://localhost:7777/tasks/history_tasks/${task_Id}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        this.historyTasks = data;

        // เพิ่มส่วนนี้เพื่อดึงรายละเอียดของผู้ใช้และแทนที่ id ด้วยข้อมูลผู้ใช้
        for (let i = 0; i < this.historyTasks.length; i++) {
          const userId = this.historyTasks[i].user_update;
          const userDetails = await this.fetchMemberDetails(userId);
          if (userDetails) {
            const fullName =
              userDetails.user_firstname + " " + userDetails.user_lastname;
            this.historyTasks[i].user_update = fullName;
          }
        }
      } catch (error) {
        console.error("Error fetching history tasks:", error);
      }
    },

    sortTasks(criteria) {
      // Clone the tasks array to avoid mutating the original array
      let sortedTasks = [...this.tasks];

      // Sort the tasks based on the selected criteria
      switch (criteria) {
        case "task_name":
          sortedTasks.sort((a, b) => (a.task_name > b.task_name ? 1 : -1));
          break;
        case "-task_name":
          sortedTasks.sort((a, b) => (a.task_name < b.task_name ? 1 : -1));
          break;
        case "task_progress":
          sortedTasks.sort((a, b) => a.task_progress - b.task_progress);
          break;
        case "-task_progress":
          sortedTasks.sort((a, b) => b.task_progress - a.task_progress);
          break;
        case "task_plan_start":
          sortedTasks.sort(
            (a, b) => new Date(a.task_plan_start) - new Date(b.task_plan_start)
          );
          break;
        case "task_plan_start_last":
          sortedTasks.sort(
            (a, b) => new Date(b.task_plan_start) - new Date(a.task_plan_start)
          );
          break;
        case "task_plan_end":
          sortedTasks.sort(
            (a, b) => new Date(a.task_plan_end) - new Date(b.task_plan_end)
          );
          break;
        case "task_plan_end_last":
          sortedTasks.sort(
            (a, b) => new Date(b.task_plan_end) - new Date(a.task_plan_end)
          );
          break;
        default:
          // Do nothing if the criteria doesn't match any case
          break;
      }

      // Update the tasks with the sorted array
      this.tasks = sortedTasks;
    },

    changePage(page) {
      this.currentPage = page;
    },
    getTasksToday() {
      const currentDate = new Date(); // วันที่ปัจจุบัน
      currentDate.setHours(0, 0, 0, 0); // เซ็ตเวลาให้เป็นเที่ยงคืน
      this.tasksToday = this.filteredTasks.filter((task) => {
        const startDate = new Date(task.task_plan_start);
        const endDate = new Date(task.task_plan_end);
        startDate.setHours(0, 0, 0, 0); // เซ็ตเวลาให้เป็นเที่ยงคืน
        endDate.setHours(0, 0, 0, 0); // เซ็ตเวลาให้เป็นเที่ยงคืน
        // ตรวจสอบว่าเวลาของ Task อยู่ในช่วงเวลาปัจจุบันหรือไม่
        return (
          startDate.getTime() <= currentDate.getTime() &&
          endDate.getTime() >= currentDate.getTime()
        );
      });
    },

    paginateUserList(page) {
      this.currentPageUser = page;
    },
    closeUserListDialog() {
      this.userDialog = false;
    },
    onlyEnglishNumericSymbolRule(v) {
      return (
        (v && /^[A-Za-z0-9@#$%^&*()-_+=!]+$/.test(v)) ||
        "Invalid characters. Only English letters, numbers, and symbols are allowed"
      );
    },

    async deleteTask(task) {
      try {
        const result = await Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#009933",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
          const response = await fetch(
            `http://localhost:7777/tasks/deleteHistoryTasks/${task.id}`,
            {
              method: "DELETE",
            }
          );
          if (response.ok) {
            // ลบงานเรียบร้อย
            Swal.fire({
              icon: "success",
              title: "Task deleted successfully",
              confirmButtonColor: "#009933",
            });
            // รีเฟรชรายการงานหลังจากลบเสร็จ
            this.fetchTasks();
          } else {
            // แจ้งเตือนเมื่อเกิดข้อผิดพลาดในการลบงาน
            throw new Error("Failed to delete task");
          }
          this.fetchTasks();
          this.fetchScreenDetail();
          // ปิด dialog หลังจากลบเสร็จ
        this.dialogEditTaskForm = false;
        }
      } catch (error) {
        console.error("Error deleting task:", error);
        Swal.fire({
          icon: "error",
          title: "Error deleting task",
          text: "Please try again",
        });
      }
    },
    async fetchMemberDetails(memberId) {
      try {
        const response = await fetch(
          `http://localhost:7777/users/getOne/${memberId}`
        );
        const data = await response.json();
        return data[0]; // สมมติว่า API จะส่งข้อมูลผู้ใช้กลับมาเป็นอาเรย์ โดยมีข้อมูลผู้ใช้เพียงรายการเดียว
      } catch (error) {
        console.error("Error fetching member details:", error);
        return null;
      }
    },
    formatDatehistory(dateString) {
      if (!dateString) return null;
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${day}/${month}/${year}`;
    },

    formatDate(dateString) {
      if (!dateString) return null;
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${day}/${month}/${year}`;
    },

    paginate(page) {
      this.currentPage = page;
    },
    closeImageDialog() {
      this.showImageDialog = false;
    },
    async fetchScreenDetail() {
      try {
        const screenId = this.$route.params.id;
        const response = await fetch(
          `http://localhost:7777/screens/getOne/${screenId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch screen");
        }
        const screenData = await response.json();

        if (screenData.length === 0) {
          throw new Error("No screen data found");
        }

        const screen = screenData[0];
        this.screenId = screen.id; // Set the Screen Id
        this.system_id = screen.system_id; // Set the System Id
        this.project_id = screen.project_id; // Set the Project Id
        this.screen_name = screen.screen_name; // Set the ScreenName
        this.screen_level = screen.screen_level; // Set the Screen Level
        this.screen_manday = screen.screen_manday; // Set the Screen Manday
        this.screen_pic = await this.convertBase64ToURL(screen.screen_pic); // Convert Base64 to URL
        this.screen_progress = screen.screen_progress; // Set the Screen Progress
        this.task_count = screen.task_count; // Set the Task Count
        this.screen_plan_start = screen.screen_plan_start; // Set the Plan Start
        this.screen_plan_end = screen.screen_plan_end; // Set the Plan End
      } catch (error) {
        console.error("Error fetching screen:", error);
      }
    },

    async convertBase64ToURL(base64String) {
      try {
        const response = await fetch(`data:image/jpeg;base64,${base64String}`);
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      } catch (error) {
        console.error("Error converting Base64 to URL:", error);
        return ""; // Return empty string if conversion fails
      }
    },
    async fetchUserList() {
      try {
        await this.fetchScreenDetail();
        const { project_id, system_id, screenId } = this;

        const response = await fetch(
          `http://localhost:7777/user_screens/checkUsersINScreen/${project_id}/${system_id}/${screenId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user list");
        }
        const userList = await response.json();

        // Set the userList data
        this.userList = userList;
        this.filteredUsers = userList; // ตรวจสอบว่า filteredUsers ถูกตั้งค่าให้เป็น userList หรือไม่
        this.userListCreate = userList.map((user) => ({
          user_id: user.id,
          user_name: `${user.user_position} : ${user.user_firstname} ${user.user_lastname}`,
          user_pic: user.user_pic,
        }));
      } catch (error) {
        console.error("Error fetching user list:", error);
      }
    },

    openUserListDialog() {
      this.fetchUserList();
      this.userDialog = true;
    },

    closeUserListDialog() {
      this.userDialog = false; // ปิด Dialog
    },
    toggleDetails(task) {
      task.showDetails = !task.showDetails; // เปลี่ยนสถานะ showDetails เมื่อปุ่มถูกคลิก
    },
    //Fetch screen detail

    //Cancel create task
    cancel() {
      this.dialogAddTaskForm = false;
    },
    //fetch task
    async fetchTasks() {
      try {
        const screenId = this.$route.params.id;
        const response = await fetch(
          `http://localhost:7777/tasks/searchByScreenId/${screenId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const tasks = await response.json();

        // แก้ไขโค้ดเพิ่มเติมในการกำหนดค่า showDetails เข้าไปในข้อมูลของแต่ละ task
        this.tasks = await Promise.all(
          tasks.map(async (task) => {
            // เรียกใช้ fetchMemberDetails เพื่อดึงข้อมูลของสมาชิกที่เกี่ยวข้องกับแต่ละงาน
            const memberDetails = await this.fetchMemberDetails(
              task.task_member_id
            );
            // เพิ่มข้อมูลผู้ใช้ใน memberDetails ของแต่ละงาน
            return {
              ...task,
              showDetails: false,
              memberDetails: memberDetails, // เก็บข้อมูลผู้ใช้ใน memberDetails
            };
          })
        );
        this.fetchScreenDetail();
      } catch (error) {
        console.error("Error fetching tasks:", error);
        // Handle error fetching tasks
      }
    },

    // Open add task form
    openAddTaskForm() {
      this.$router.push({
        name: "task-add",
        params: { id: this.$route.params.id },
      });
    },
    //Create new task
    async createTask() {
      try {
        const {
          task_id,
          task_name,
          task_detail = "",
          task_status = "",
          task_plan_start = "",
          task_plan_end = "",
          task_member_id,
          task_manday = "",
        } = this.newTask;

        if (!task_id || !task_name) {
          throw new Error("Task ID and Task Name are required.");
        }

        const response = await fetch(
          `http://localhost:7777/tasks/createTasks`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              task_id,
              task_name,
              task_detail,
              task_status,
              screen_id: this.screenId,
              project_id: this.project_id,
              system_id: this.system_id,
              task_plan_start,
              task_plan_end,
              task_member_id,
              task_manday,
            }),
          }
        );

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Task created successfully",
          });
          this.dialogAddTaskForm = false;
          this.fetchTasks();
          this.fetchScreenDetail();

          // Reset form after creating the task
          this.newTask = {
            task_id: "",
            task_name: "",
            task_detail: "",
            task_status: "",
            task_plan_start: "",
            task_plan_end: "",
            task_member_id: "",
            task_manday: "",
          };
        } else {
          throw new Error("Failed to create new task");
        }
      } catch (error) {
        console.error("Error creating new task:", error);
        Swal.fire({
          icon: "error",
          title: "Error creating new task",
          text: "Please try again",
        });
      }
    },

    formatDisplayDate(dateString) {
      if (!dateString) return null;
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${day}/${month}/${year}`;
    },
    // Update task
    async updateTask() {
      try {
        const taskData = { ...this.editedTask }; // Clone the editedTask object
        taskData.task_plan_start = this.formatAPIDate(
          this.editedTask.task_plan_start
        );
        taskData.task_plan_end = this.formatAPIDate(
          this.editedTask.task_plan_end
        );
        taskData.task_actual_start = this.formatAPIDate(
          this.editedTask.task_actual_start
        );
        taskData.task_actual_end = this.formatAPIDate(
          this.editedTask.task_actual_end
        );

        // เพิ่มเงื่อนไขเพื่อตรวจสอบ task_manday ให้ไม่มากกว่าจำนวนวันที่คำนวณและไม่เป็นค่าลบ
        if (parseFloat(taskData.task_manday) < 0) {
          // เปลี่ยนจาก taskData.task_manday < 0 เป็น parseFloat(taskData.task_manday) < 0
          throw new Error("Task manday must be greater than or equal to 0");
        }

        // คำนวณ Manday โดยใช้วันที่ที่กำหนดและวันที่สิ้นสุดของงาน
        const start = new Date(taskData.task_plan_start);
        const end = new Date(taskData.task_plan_end);

        // เช็คว่าวันที่เริ่มและสิ้นสุดเหมือนกัน
        const manday = parseFloat(taskData.task_manday); // เปลี่ยนจาก parseInt(taskData.task_manday) เป็น parseFloat(taskData.task_manday)

        // ตรวจสอบว่า Manday มีค่ามากกว่าหรือเท่ากับ 0
        if (manday < 0) {
          throw new Error("Manday must be greater than or equal to 0");
        }

        // ตรวจสอบว่า task_manday มีค่าน้อยกว่าหรือเท่ากับ Manday ที่คำนวณได้
        if (manday > manday + 1) {
          throw new Error(`Task manday must be between 0 and ${manday + 1}`);
        }

        // เพิ่มเงื่อนไขเพื่อตั้งค่า task_status เป็น "correct" เมื่อ Progress เท่ากับ 100
        if (taskData.task_progress === 100) {
          taskData.task_status = "correct";
        } else if (taskData.task_progress === 0) {
          taskData.task_status = "Not started yet";
        } else {
          taskData.task_status = "start";
        }

        taskData.task_manday = manday;

        const response = await fetch(
          `http://localhost:7777/tasks/updateTasks/${taskData.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(taskData),
          }
        );

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Task updated successfully",
            confirmButtonColor: "#009933",
          });
          this.dialogEditTaskForm = false;
          this.fetchTasks();
        } else {
          throw new Error("Failed to update task");
        }
        this.fetchScreenDetail();
      } catch (error) {
        console.error("Error updating task:", error);
        Swal.fire({
          icon: "error",
          title: "Error updating task",
          text: error.message || "Please try again",
        });
      }
    },

    calculateMandayEdit() {
      const start = new Date(this.editedTask.task_plan_start);
      const end = new Date(this.editedTask.task_plan_end);
      if (start > end) {
        // Handle error when start date is after end date
        return;
      }
      const manday = Math.round((end - start) / (1000 * 60 * 60 * 24) + 1);
      this.editedTask.task_manday = manday;
    },

    formatAPIDate(dateString) {
      if (!dateString) return null;
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    cancelEdit() {
      this.dialogEditTaskForm = false;
    },
  },
};
</script>

<style scoped>

.progress-row {
  margin-top: 20px; /* ปรับขนาดตามที่ต้องการ */
}

.my-progress {
  margin: 0 1rem; /* เพิ่มระยะห่างด้านซ้ายและขวา */
}

.progress-item {
  text-align: center;
}

.progress-label {
  margin-top: 0.5rem;
  font-size: 1rem;
}

.task-card {
  margin-bottom: 10px;
}

.topper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.dialog-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border: 3px solid #0000002d;
}

.custom-expansion-panels {
  border: 1px solid #ccc;
  /* ใส่ขอบ */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  /* เพิ่มเงา */
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.text-right {
  text-align: right;
}

.user-picture {
  width: 50px;
  /* ปรับขนาดความกว้าง */
  height: 50px;
  /* ปรับขนาดความสูง */
  /* border-radius: 5%; ทำให้มันเป็นวงกลม */
}

.table-with-border {
  border: 1px solid #ccc;
  border-collapse: collapse;
}

.table-with-border th,
.table-with-border td {
  border: 1px solid #ccc;
  padding: 8px;
  /* ปรับค่าตามที่ต้องการ */
}

.clamp-text {
  font-size: 16px;
  line-height: 1.5em;
  height: 50px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  /* จำนวนบรรทัดที่ต้องการให้แสดง */
  -webkit-box-orient: vertical;
}

.rounded-btn {
  width: 40px;
  /* กำหนดขนาดของปุ่ม */
  height: 40px;
  /* กำหนดขนาดของปุ่ม */
  min-width: 40px;
  /* กำหนดขนาดของปุ่ม */
  min-height: 40px;
  /* กำหนดขนาดของปุ่ม */
  padding: 0;
  /* ลบ Padding เพื่อป้องกันการขยับของปุ่ม */
}
</style>