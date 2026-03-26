import type { Employee } from '../types/employee'

export function printResignCertificate(employee: Employee) {
  const today = new Date()
  const printDate = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`

  const hireDate = formatChineseDate(employee.hireDate)
  const resignDate = formatChineseDate(employee.resignDate || '')
  const reason = employee.resignReason || '个人原因'

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>离职证明 - ${employee.name}</title>
<style>
  @page { size: A4; margin: 60px 80px; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: "SimSun", "宋体", serif; font-size: 16px; line-height: 2; color: #000; }
  .container { max-width: 680px; margin: 0 auto; padding: 40px 0; }
  .title { text-align: center; font-size: 26px; font-weight: bold; letter-spacing: 8px; margin-bottom: 50px; }
  .content { text-indent: 2em; margin-bottom: 20px; font-size: 16px; line-height: 2.2; }
  .info-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
  .info-table td { padding: 8px 16px; border: 1px solid #000; font-size: 15px; }
  .info-table td.label { width: 120px; text-align: center; background: #f5f5f5; font-weight: bold; }
  .seal-area { margin-top: 80px; text-align: right; padding-right: 40px; }
  .seal-area p { margin-bottom: 10px; }
  .note { margin-top: 60px; font-size: 13px; color: #666; border-top: 1px solid #ccc; padding-top: 15px; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none !important; }
  }
</style>
</head>
<body>
<div class="container">
  <h1 class="title">离 职 证 明</h1>

  <p class="content">
    兹证明 <b>${employee.name}</b>（工号：${employee.employeeId}），${employee.gender ? employee.gender + '，' : ''}
    自 <b>${hireDate}</b> 起在我公司 <b>${employee.department}</b> 担任 <b>${employee.position}</b> 职务。
  </p>

  <p class="content">
    因 <b>${reason}</b>，该员工于 <b>${resignDate}</b> 正式离职。
    在职期间，该员工工作认真负责，现已办理完毕全部离职交接手续。
  </p>

  <table class="info-table">
    <tr><td class="label">姓名</td><td>${employee.name}</td><td class="label">工号</td><td>${employee.employeeId}</td></tr>
    <tr><td class="label">部门</td><td>${employee.department}</td><td class="label">职位</td><td>${employee.position}</td></tr>
    <tr><td class="label">入职日期</td><td>${hireDate}</td><td class="label">离职日期</td><td>${resignDate}</td></tr>
    <tr><td class="label">离职原因</td><td colspan="3">${reason}</td></tr>
  </table>

  <p class="content">
    特此证明。
  </p>

  <div class="seal-area">
    <p>公司名称：___________________（盖章）</p>
    <p>日期：${printDate}</p>
  </div>

  <div class="note">
    <p>备注：本证明仅用于证明该员工的离职事实，不作为其他用途的凭证。</p>
    <p>本证明一式两份，公司与离职员工各持一份。</p>
  </div>
</div>

<script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
  }
}

function formatChineseDate(dateStr: string): string {
  if (!dateStr) return '____年__月__日'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}
