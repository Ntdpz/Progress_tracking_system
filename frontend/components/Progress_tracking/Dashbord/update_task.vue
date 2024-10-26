<template>
  <div class="update-task-dialog">
    <h1 class="dialog-title">Update Task</h1>
    <p class="dialog-subtitle">task name : {{ task.task_name }}</p>
    <p class="dialog-subtitle">
      Last Update : {{ formatDateTime(task.task_date_update) }}
    </p>

    <v-form>
      <v-row>
        <!-- Input and Slider Rows -->
        <v-col cols="12" class="d-flex">
          <v-row class="flex-grow-1">
            <v-col cols="12" sm="4" class="task-progress-col">
              <v-text-field
                v-model="formattedTaskProgress"
                required
                @input="updateProgress"
                class="task-text-field"
                label="Task Progress"
                outlined
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="8" class="task-slider-col">
              <v-slider
                v-model="taskData.task_progress"
                min="0"
                max="100"
                step="1"
                thumb-label="always"
                required
                @input="updateProgress"
              ></v-slider>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-row class="row-Remark">
        <v-col cols="12">
          <v-textarea
            v-model="taskData.task_detail"
            outlined
            clearable
            label="Remark"
          ></v-textarea>
        </v-col>
      </v-row>

      <v-row class="row-Plan">
        <!-- Task Plan Start -->
        <v-col cols="12" sm="6" md="4">
          <v-menu
            v-model="menu.task_plan_start"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                :value="formattedTaskPlanStart"
                label="Task Plan Start"
                v-bind="attrs"
                v-on="on"
                prepend-icon="mdi-calendar"
                class="custom-text-field"
                outlined
              />
            </template>
            <v-date-picker
              v-model="taskData.task_plan_start"
              :max="taskData.task_plan_end || undefined"
              @input="updatePlanDates('start')"
            />
          </v-menu>
        </v-col>

        <!-- Task Plan End -->
        <v-col cols="12" sm="6" md="4">
          <v-menu
            v-model="menu.task_plan_end"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                :value="formattedTaskPlanEnd"
                label="Task Plan End"
                v-bind="attrs"
                v-on="on"
                prepend-icon="mdi-calendar"
                outlined
              />
            </template>
            <v-date-picker
              v-model="taskData.task_plan_end"
              :min="taskData.task_plan_start || undefined"
              @input="updatePlanDates('end')"
            />
          </v-menu>
        </v-col>

        <!-- Plan Manday -->
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            v-model="taskData.task_manday"
            label="Plan Manday"
            type="number"
            min="0"
            outlined
            @input="validatePlanManday"
          />
        </v-col>
      </v-row>

      <v-row class="row-Actual">
        <!-- Task Actual Start -->
        <v-col cols="12" sm="4">
          <v-menu
            v-model="menu.task_actual_start"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                :value="formattedTaskActualStart"
                label="Task Actual Start"
                v-bind="attrs"
                v-on="on"
                prepend-icon="mdi-calendar"
                outlined
                @click="checkTaskProgressActuatStart"
                @input="checkTaskProgressActuatStart"
              />
            </template>
            <v-date-picker
              v-model="taskData.task_actual_start"
              @input="menu.task_actual_start = false"
              :max="taskData.task_actual_end"
            />
          </v-menu>
        </v-col>
        <!-- Task Actual End -->
        <v-col cols="12" sm="4">
          <v-menu
            v-model="menu.task_actual_end"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                :value="formattedTaskActualEnd"
                label="Task Actual End"
                v-bind="attrs"
                v-on="on"
                prepend-icon="mdi-calendar"
                outlined
                :disabled="taskData.task_progress !== 100"
              />
            </template>
            <v-date-picker
              v-model="taskData.task_actual_end"
              @input="menu.task_actual_end = false"
              :min="taskData.task_actual_start"
            />
          </v-menu>
        </v-col>

        <!-- Actual Manday -->
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="taskData.task_actual_manday"
            label="Actual Manday"
            type="number"
            min="0"
            outlined
            @input="validatePlanActual"
          />
        </v-col>
      </v-row>
    </v-form>

    <!-- <history_task_table
      ref="historyTaskTable"
      :taskId="task.id"
      class="history_task_table-table"
    /> -->

    <div class="Pic-task">
      <task_pic :taskId="task.id" />
    </div>

    <div class="button-row">
      <v-btn class="history-btn" @click="dialoghistory = true">
        <v-icon left>mdi-history</v-icon>
        Show History
      </v-btn>

      <!-- Dialog for showing history task table -->
      <v-dialog v-model="dialoghistory" max-width="800px">
        <v-card>
          <v-card-title class="headline-history"
            >History : {{ task.task_name }}</v-card-title
          >

          <v-card-text class="no-padding">
            <!-- Insert your component to display the task history -->
            <history_task_table
              ref="historyTaskTable"
              :taskId="task.id"
              class="history_task_table-table"
            />
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="dialoghistory = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <v-row class="button-row">
      <v-btn class="save-btn" @click="updateTask">Save</v-btn>
      <v-btn class="close-btn" @click="$emit('close-dialog')">Close</v-btn>
    </v-row>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import history_task_table from "./history_task_table.vue";
import "./css/update_task.css";
import { EventBus } from "@/plugins/event-bus";
import task_pic from "./task_pic.vue";

export default {
  middleware: "auth",
  components: {
    history_task_table,
    task_pic,
  },
  props: {
    task: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      dialoghistory: false,
      user: this.$auth.user,
      task_manday: 0,
      task_actual_manday: 0,
      menu: {
        task_plan_start: false,
        task_plan_end: false,
        task_actual_start: false,
        task_actual_end: false,
      },
      isDisabled: false,
      taskData: {
        task_progress: 0,
        task_status: "",
        task_detail: "",
        task_plan_start: "",
        task_plan_end: "",
        task_manday: 0,
        task_actual_start: "",
        task_actual_end: "",
        task_actual_manday: 0,
      },
    };
  },

  computed: {
    isTaskActualEndDisabled() {
      return this.taskData.task_progress !== 100;
    },
    formattedTaskPlanStart() {
      return this.formatDateShow(this.taskData.task_plan_start);
    },
    formattedTaskPlanEnd() {
      return this.formatDateShow(this.taskData.task_plan_end);
    },

    formattedTaskActualStart() {
      return this.formatDateShow(this.taskData.task_actual_start);
    },
    formattedTaskActualEnd() {
      return this.formatDateShow(this.taskData.task_actual_end);
    },
    formattedTaskProgress: {
      get() {
        return this.taskData.task_progress !== undefined
          ? `${this.taskData.task_progress}%`
          : "0%"; // Default to "0%" if task_progress is undefined
      },
      set(value) {
        this.taskData.task_progress = value.replace("%", "").trim();
        this.calculateTaskStatus();
      },
    },
  },
  mounted() {
    // เรียกใช้ฟังก์ชันเมื่อคอมโพเนนต์ถูก mount
    this.calculateTaskStatus();
    this.updatePlanDates("start");
    this.updatePlanDates("end");
    this.updateActualDates();
  },
  watch: {
    "taskData.task_progress": function () {
      this.calculateTaskStatus();
    },
    "taskData.task_plan_start": function (newVal) {
      this.updatePlanDates("start");
    },
    "taskData.task_plan_end": function (newVal) {
      this.updatePlanDates("end");
    },

    "taskData.task_progress": function (newValue) {
      this.updateActualDates();
    },
    "taskData.task_actual_start": function () {
      this.updateActualDates();
    },
    "taskData.task_actual_end": function () {
      this.updateActualDates();
    },
    task: {
      handler(newTask) {
        this.taskData = {
          task_progress: newTask.task_progress || 0,
          task_detail: newTask.task_detail || "",
          task_plan_start: newTask.task_plan_start
            ? this.formatDate(newTask.task_plan_start)
            : "",
          task_plan_end: newTask.task_plan_end
            ? this.formatDate(newTask.task_plan_end)
            : "",
          task_manday: this.task_manday,
          task_actual_start: newTask.task_actual_start
            ? this.formatDate(newTask.task_actual_start)
            : "",
          task_actual_end: newTask.task_actual_end
            ? this.formatDate(newTask.task_actual_end)
            : "",
          task_actual_manday: this.task_actual_manday,
        };
        // เรียกใช้ฟังก์ชันเมื่อค่า task เปลี่ยนแปลง
        this.updatePlanDates("start");
        this.updatePlanDates("end");
        this.updateActualDates();
      },
      deep: true,
      immediate: true,
    },
  },

  methods: {
    formatDateShow(date) {
      if (!date) return "";
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, "0"); // วัน
      const month = String(d.getMonth() + 1).padStart(2, "0"); // เดือน (0-indexed)
      const year = d.getFullYear(); // ปี
      return `${day}-${month}-${year}`; // คืนค่าในรูปแบบ dd/mm/yyyy
    },
    formatDateTime(dateTime) {
      if (!dateTime) return "No dateTime";

      const date = new Date(dateTime);

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0"); // เดือนใน JavaScript เริ่มจาก 0
      const year = date.getFullYear();

      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");

      return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    },
    updateProgress() {
      this.taskData.task_progress =
        parseInt(this.taskData.task_progress, 10) || 0;
      this.calculateTaskStatus();
    },
    countBusinessDays(startDate, endDate) {
      let count = 0;
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          count++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return count;
    },

    checkTaskProgressActuatStart() {
      if (this.taskData.task_progress === 0) {
        // ปิด v-menu ของ v-date-picker ก่อนที่จะแสดงการแจ้งเตือน
        this.menu.task_actual_start = false;

        // เคลียร์ค่า task_actual_start
        this.taskData.task_actual_start = "";

        Swal.fire({
          icon: "warning",
          title: "Cannot Set Date",
          text: "You cannot set the Task Actual Start date when progress is 0.",
          confirmButtonText: "OK",
          confirmButtonColor: "#629859",
        });
      }
    },

    updateActualDates() {
      // ตรวจสอบว่า task_progress มีค่ามากกว่า 0 หรือไม่
      if (this.taskData.task_progress > 0) {
        // ถ้า task_actual_start มาจากฐานข้อมูล ให้ใช้ค่านั้น
        if (this.task.task_actual_start) {
          this.taskData.task_actual_start = this.formatDate(
            this.task.task_actual_start
          );
        } else {
          // ถ้า task_actual_start เป็น null ให้ใช้วันปัจจุบันใน timezone ของประเทศไทย
          if (!this.taskData.task_actual_start) {
            const today = new Date();
            const options = {
              timeZone: "Asia/Bangkok",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            };
            const formattedDate = new Intl.DateTimeFormat(
              "en-CA",
              options
            ).format(today);
            this.taskData.task_actual_start = formattedDate; // ใช้ format YYYY-MM-DD
          }
        }
      } else {
        // ถ้า task_progress <= 0 ให้ทำให้ทั้งสองช่องว่าง
        this.taskData.task_actual_start = null;
        this.taskData.task_actual_end = null;
        this.taskData.task_actual_manday = null; // รีเซ็ตค่า task_actual_manday
        return; // ออกจากฟังก์ชันทันที
      }

      // ถ้า task_progress เท่ากับ 100 ให้ตรวจสอบว่า task_actual_end มาจากฐานข้อมูลหรือไม่
      if (this.taskData.task_progress === 100) {
        if (this.task.task_actual_end) {
          this.taskData.task_actual_end = this.formatDate(
            this.task.task_actual_end
          );
        } else {
          // ถ้า task_actual_end เป็น null ให้ใช้วันปัจจุบันใน timezone ของประเทศไทย
          if (!this.taskData.task_actual_end) {
            const today = new Date();
            const options = {
              timeZone: "Asia/Bangkok",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            };
            const formattedDate = new Intl.DateTimeFormat(
              "en-CA",
              options
            ).format(today);
            this.taskData.task_actual_end = formattedDate; // ใช้ format YYYY-MM-DD
          }
        }
      } else {
        // ถ้า task_progress < 100 ให้ทำให้ task_actual_end เป็น null
        this.taskData.task_actual_end = null;
      }

      // ทำการคำนวณค่า task_actual_manday ทันทีหลังจากที่กำหนดวันแล้ว
      const startDate = new Date(this.taskData.task_actual_start);
      const endDate = new Date(this.taskData.task_actual_end);

      if (
        this.task.task_actual_manday === undefined ||
        this.task.task_actual_manday === null ||
        this.task.task_actual_manday <= 0
      ) {
        if (this.taskData.task_actual_start && this.taskData.task_actual_end) {
          const businessDays = this.countBusinessDays(startDate, endDate);
          this.taskData.task_actual_manday = Math.max(1, businessDays);
        }
      } else {
        this.taskData.task_actual_manday = this.task.task_actual_manday;
      }
    },

    validatePlanActual() {
      const maxManday = this.countBusinessDays(
        new Date(this.formatDate(this.taskData.task_actual_start)),
        new Date(this.formatDate(this.taskData.task_actual_end))
      );

      // ตรวจสอบค่าติดลบ
      if (this.taskData.task_actual_manday < 0) {
        this.taskData.task_actual_manday = 0; // ตั้งค่าให้เป็น 0
        Swal.fire({
          icon: "warning",
          title: "The number of days cannot be negative!",
          text: "Please enter a valid number of days.",
          confirmButtonText: "OK",
          confirmButtonColor: "#629859",
        });
        return;
      }

      if (this.taskData.task_actual_manday > maxManday) {
        this.taskData.task_actual_manday = maxManday;

        Swal.fire({
          icon: "warning",
          title: "The number of days is incorrect!",
          text: `The number of days cannot exceed ${maxManday} days`,
          confirmButtonText: "OK",
          confirmButtonColor: "#629859",
        });
      }
    },

    updatePlanDates(type) {
      const startDate = new Date(this.taskData.task_plan_start);
      const endDate = new Date(this.taskData.task_plan_end);

      if (type === "start" && startDate > endDate) {
        this.taskData.task_plan_start = this.taskData.task_plan_end;
      } else if (type === "end" && endDate < startDate) {
        this.taskData.task_plan_end = this.taskData.task_plan_start;
      }

      // ตรวจสอบว่าค่า task_manday (จากฐานข้อมูล) เป็น 0 หรือ null
      if (
        this.task.task_manday === undefined ||
        this.task.task_manday === null ||
        this.task.task_manday <= 0
      ) {
        if (this.taskData.task_plan_start && this.taskData.task_plan_end) {
          const businessDays = this.countBusinessDays(startDate, endDate);
          this.taskData.task_manday = Math.max(1, businessDays);
        }
      } else {
        // ถ้าค่าจากฐานข้อมูลไม่ใช่ 0 หรือ null
        this.taskData.task_manday = this.task.task_manday; // ให้แสดงค่าจากฐานข้อมูล
      }
    },

    validatePlanManday() {
      // ตรวจสอบให้ไม่เกินค่าที่คำนวณได้
      const maxManday = this.countBusinessDays(
        new Date(this.taskData.task_plan_start),
        new Date(this.taskData.task_plan_end)
      );

      // ตรวจสอบค่าติดลบ
      if (this.taskData.task_manday < 0) {
        this.taskData.task_manday = 0; // ตั้งค่าให้เป็น 0
        Swal.fire({
          icon: "warning",
          title: "The number of days cannot be negative!",
          text: "Please enter a valid number of days.",
          confirmButtonText: "OK",
          confirmButtonColor: "#629859",
        });
        return; // ออกจากฟังก์ชัน
      }

      if (this.taskData.task_manday > maxManday) {
        this.taskData.task_manday = maxManday; // ตั้งค่าให้เท่ากับค่าที่คำนวณได้

        // แสดง SweetAlert 2 แจ้งเตือน
        Swal.fire({
          icon: "warning",
          title: "The number of days is incorrect!",
          text: `The number of days cannot be exceeded ${maxManday} days`,
          confirmButtonText: "OK",
          confirmButtonColor: "#629859",
        });
      }
    },
    calculateTaskStatus() {
      const progress = this.taskData.task_progress;

      if (progress === 0) {
        this.taskData.task_status = "Not started yet";
      } else if (progress > 0 && progress < 100) {
        this.taskData.task_status = "In Progress";
      } else if (progress === 100) {
        this.taskData.task_status = "Completed";
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;
      return formattedDate;
    },
    async updateTask() {
      try {
        const formatDateValue = (value) => (value === "" ? null : value);

        // แปลงค่า task_progress
        const taskProgressValue =
          parseInt(this.taskData.task_progress, 10) || 0;

        // เรียก API เพื่ออัปเดตข้อมูลพื้นฐานของ task
        await this.$axios.put(`/tasks/save_history_tasks/${this.task.id}`, {
          task_name: this.task.task_name,
          task_detail: this.taskData.task_detail,
          task_progress: taskProgressValue,
          task_plan_start: formatDateValue(this.taskData.task_plan_start),
          task_plan_end: formatDateValue(this.taskData.task_plan_end),
          task_actual_start: formatDateValue(this.taskData.task_actual_start),
          task_actual_end: formatDateValue(this.taskData.task_actual_end),
          user_update: this.user.id,
          task_manday: this.taskData.task_manday,
          task_actual_manday: this.taskData.task_actual_manday,
          task_status: this.taskData.task_status,
        });

        // เช็คเงื่อนไข task_progress = 100 และ task_status = 'Completed'
        if (
          taskProgressValue === 100 &&
          this.taskData.task_status === "Completed"
        ) {
          Swal.fire({
            title: "Task Completed",
            text: "Would you like to close this task?",
            icon: "success",
            confirmButtonText: "OK",
            confirmButtonColor: "#629859",
            showCancelButton: true,
            cancelButtonText: "Cancel",
            html: `<input type="checkbox" id="archiveTask" checked /> 
               <label for="archiveTask">Close Task</label>`,
          }).then(async (result) => {
            if (result.isConfirmed) {
              const archiveTaskChecked =
                document.getElementById("archiveTask").checked;
              let is_archived = archiveTaskChecked ? true : false;

              // เรียก API เพื่ออัปเดตค่า is_archived
              await this.$axios.put(`/tasks/updateTasks/${this.task.id}`, {
                task_name: this.task.task_name,
                task_detail: this.taskData.task_detail,
                task_progress: taskProgressValue,
                task_plan_start: formatDateValue(this.taskData.task_plan_start),
                task_plan_end: formatDateValue(this.taskData.task_plan_end),
                task_actual_start: formatDateValue(
                  this.taskData.task_actual_start
                ),
                task_actual_end: formatDateValue(this.taskData.task_actual_end),
                user_update: this.user.id,
                task_manday: this.taskData.task_manday,
                task_actual_manday: this.taskData.task_actual_manday,
                task_status: this.taskData.task_status,
                is_archived: is_archived,
              });

              EventBus.$emit("refresh-data");
              this.$emit("task-updated");
              this.$emit("close-dialog");
              this.$refs.historyTaskTable.refreshTable();
            }
          });
        } else {
          // กรณี task_progress ไม่ครบ 100 หรือ status ไม่เป็น Completed
          await this.$axios.put(`/tasks/updateTasks/${this.task.id}`, {
            task_name: this.task.task_name,
            task_detail: this.taskData.task_detail,
            task_progress: taskProgressValue,
            task_plan_start: formatDateValue(this.taskData.task_plan_start),
            task_plan_end: formatDateValue(this.taskData.task_plan_end),
            task_actual_start: formatDateValue(this.taskData.task_actual_start),
            task_actual_end: formatDateValue(this.taskData.task_actual_end),
            user_update: this.user.id,
            task_manday: this.taskData.task_manday,
            task_actual_manday: this.taskData.task_actual_manday,
            task_status: this.taskData.task_status,
            is_archived: false,
          });

          Swal.fire({
            title: "Success",
            text: "Task updated successfully",
            icon: "success",
            confirmButtonText: "OK",
            confirmButtonColor: "#629859",
          }).then((result) => {
            if (result.isConfirmed) {
              EventBus.$emit("refresh-data");
              this.$emit("task-updated");
              this.$emit("close-dialog");
              this.$refs.historyTaskTable.refreshTable();
            }
          });
        }
      } catch (error) {
        console.error("Error updating task:", error);
        Swal.fire({
          title: "Error",
          text: "Error updating task",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#F67878",
        });
      }
    },
  },
};
</script>
