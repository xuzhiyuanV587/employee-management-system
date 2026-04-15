export interface Placeholder {
  key: string
  label: string
  type: 'underscore' | 'custom'
  index: number
}

export interface ContractTemplate {
  id: number
  name: string
  original_filename: string
  placeholders: Placeholder[]
  placeholder_rule: 'underscore' | 'custom'
  custom_pattern?: string
  upload_by?: string
  created_at: string
  updated_at: string
}

export interface ContractRecord {
  id: number
  template_id: number
  fill_data: Record<string, string>
  filled_by?: string
  file_path?: string
  created_at: string
}

export interface ContractQuery {
  page: number
  pageSize: number
  keyword?: string
}
