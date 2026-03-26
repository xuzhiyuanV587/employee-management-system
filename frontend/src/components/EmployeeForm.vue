<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="100px"
    :disabled="readonly"
  >
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="工号" v-if="form.employeeId">
          <el-input :model-value="form.employeeId" disabled />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="部门" prop="department">
          <el-select v-model="form.department" placeholder="请选择部门" style="width: 100%">
            <el-option v-for="d in DEPARTMENTS" :key="d" :label="d" :value="d" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="职位" prop="position">
          <el-input v-model="form.position" placeholder="请输入职位" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="入职日期" prop="hireDate">
          <el-date-picker
            v-model="form.hireDate"
            type="date"
            placeholder="请选择入职日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
            <el-option v-for="s in EMPLOYEE_STATUSES" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio v-for="g in GENDERS" :key="g" :value="g">{{ g }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="生日" prop="birthday">
          <el-date-picker
            v-model="form.birthday"
            type="date"
            placeholder="请选择生日"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="地址" prop="address">
      <el-input v-model="form.address" placeholder="请输入地址" />
    </el-form-item>

    <el-form-item label="备注" prop="remark">
      <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
    </el-form-item>

    <el-form-item v-if="!readonly">
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        {{ submitText }}
      </el-button>
      <el-button @click="handleCancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Employee } from '../types/employee'
import { DEPARTMENTS, EMPLOYEE_STATUSES, GENDERS } from '../types/employee'
import { phoneRule, emailRule } from '../utils/validation'

const props = withDefaults(defineProps<{
  initialData?: Partial<Employee>
  submitText?: string
  readonly?: boolean
}>(), {
  submitText: '提交',
  readonly: false
})

const emit = defineEmits<{
  submit: [data: Partial<Employee>]
  cancel: []
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)

const form = ref<Partial<Employee>>({
  name: '',
  department: undefined,
  position: '',
  phone: '',
  email: '',
  hireDate: '',
  status: undefined,
  gender: undefined,
  birthday: '',
  address: '',
  remark: '',
  ...props.initialData
})

watch(() => props.initialData, (val) => {
  if (val) {
    form.value = { ...form.value, ...val }
  }
}, { deep: true })

const rules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  position: [{ required: true, message: '请输入职位', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    phoneRule
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    emailRule
  ],
  hireDate: [{ required: true, message: '请选择入职日期', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate()
  submitting.value = true
  try {
    emit('submit', { ...form.value })
  } finally {
    submitting.value = false
  }
}

function handleCancel() {
  emit('cancel')
}
</script>
