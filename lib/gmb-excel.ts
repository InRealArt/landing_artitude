import ExcelJS from 'exceljs'
import path from 'path'
import fs from 'fs'

export interface GmbExcelData {
  storeCode: string
  businessName: string
  addressLine: string
  locality: string
  regionCode: string
  postalCode: string
  phone: string
  websiteUri?: string
  hours: Array<{ day: string; open: boolean; openTime: string; closeTime: string }>
  latitude?: number
  longitude?: number
  photoCoverUrl: string
  photoOtherUrls: string
}

const TEMPLATE_PATH = path.join(process.cwd(), 'templates/GMB/Google-Business-Profile-Template-fr.xlsx')

const DAY_TO_COL: Record<string, string> = {
  SUNDAY: 'T',
  MONDAY: 'U',
  TUESDAY: 'V',
  WEDNESDAY: 'W',
  THURSDAY: 'X',
  FRIDAY: 'Y',
  SATURDAY: 'Z',
}

function formatHours(day: string, hours: GmbExcelData['hours']): string {
  const entry = hours.find((h) => h.day === day)
  if (!entry || !entry.open) return 'Closed'
  return `${entry.openTime}-${entry.closeTime}`
}

export async function generateGmbExcel(data: GmbExcelData): Promise<Buffer> {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(`GMB template not found at ${TEMPLATE_PATH}`)
  }
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(TEMPLATE_PATH)

  const sheet = workbook.worksheets[0]

  // Row 2 = data row (row 1 = headers)
  const row = sheet.getRow(2)

  row.getCell('A').value = data.storeCode
  row.getCell('B').value = data.businessName
  row.getCell('C').value = data.addressLine
  row.getCell('I').value = data.locality
  row.getCell('K').value = data.regionCode
  row.getCell('L').value = data.postalCode
  if (data.latitude != null) row.getCell('M').value = data.latitude
  if (data.longitude != null) row.getCell('N').value = data.longitude
  row.getCell('O').value = data.phone
  if (data.websiteUri) row.getCell('Q').value = data.websiteUri
  row.getCell('R').value = 'gcid:art_studio'

  for (const day of Object.keys(DAY_TO_COL)) {
    row.getCell(DAY_TO_COL[day]).value = formatHours(day, data.hours)
  }

  row.getCell('AE').value = data.photoCoverUrl
  row.getCell('AF').value = data.photoOtherUrls

  row.commit()

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
