/* load standalone script from CDN */
importScripts("https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js");
importScripts('https://unpkg.com/mathjs@11.11.0/lib/browser/math.js');

function getAoARow(origin) {
  const arr = []
  for (let col = 0; col < origin.length; ++col) {
    const v = origin[col].v || ''
    arr.push(v.trim ? v.trim() : v)
  }
  return arr
}

let wb
let titleRow
// 建立 aoa 与原 data 索引映射
const distinct = new Map()

function handleCombine(data, aoa, distinct_col, sum_cols) {
  for (let rowIndex = 0; rowIndex < aoa.length; rowIndex++) {
    // 第一行是标题，不做处理
    if (rowIndex === 0) continue

    const row = aoa[rowIndex]
    const wsRowsIndexes = distinct.get(row[distinct_col].trim())
    if (!wsRowsIndexes) continue

    sum_cols.map(col_index => {
      row[col_index] = wsRowsIndexes.reduce((sum, wsRowIndex) => {
        const wsRow = data[wsRowIndex]
        const num = wsRow[col_index].v
        return sum.add(num)
      }, self.math.chain(0)).done()
    })
  }
  distinct.clear()
}

function handleUpload(e) {
  /* Read file data */
  const ab = new FileReaderSync().readAsArrayBuffer(e.data.file);
  /* Parse file */
  wb = XLSX.read(ab, { dense: true });
  const ws = wb.Sheets[wb.SheetNames[0]];

  // 第一行是标题
  titleRow = getAoARow(ws["!data"][0])
  postMessage({ event: 'title-info', data: titleRow })
}

function handleParse(e) {
  // 需要去重和合并的列
  // 需要合并的列可能有多个
  const { distinct_col, sum_cols } = e.data.options

  const ws = wb.Sheets[wb.SheetNames[0]];
  // 去重过的 sheet原始数据
  const aoa2 = [titleRow]

  const range = XLSX.utils.decode_range(ws["!ref"])
  // 去重
  for (let R = 1; R <= range.e.r; ++R) {
    const row = ws["!data"][R]
    const col = row[distinct_col]
    if (!col) {
      continue
    }
    const v = col.v.trim()
    if (distinct.has(v)) {
      const values = distinct.get(v)
      distinct.set(v, [...values, R])
      continue
    }
    distinct.set(v, [R])
    const arr = getAoARow(row)
    aoa2.push(arr)
  }

  postMessage({ event: 'distinct' })

  // 处理合并
  handleCombine(ws['!data'], aoa2, distinct_col, sum_cols)

  // 根据原始数据创建新的 sheet
  const wb2 =  XLSX.utils.book_new();
  const ws2 = XLSX.utils.aoa_to_sheet(aoa2)
  XLSX.utils.book_append_sheet(wb2, ws2, 'Sheet1', true)
  postMessage({ event: 'download', wb: wb2 })
}

/* this callback will run once the main context sends a message */
self.addEventListener('message', (e) => {
  /* Pass the version string back  */
  // postMessage({ event: 'version', version: XLSX.version });
  switch (e.data.event) {
    case 'upload': {
      handleUpload(e)
      break
    }
    case 'parse': {
      handleParse(e)
      break
    }
    default:
      console.log('on message', e)
  }
}, false);