import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Form, Select, Spin, message, Card } from 'antd'
import Dragger from 'antd/es/upload/Dragger'
import './index.css'
import { UploadOutlined } from '@ant-design/icons'

const BatchImportEditor: React.FC<any> = () => {
  const [titles, setTitles] = useState([])
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const worker = useRef<Worker>()
  const filename = useRef('')

  const onmessage = useCallback((e: any) => {
    switch (e.data.event) {
      case 'version':
        console.log('version = ', e.data.version)
        break
      case 'title-info': {
        setTitles(e.data.data)
        message.success('导入成功，请选择需要去重和合并的列')
        setLoading(false)
        break
      }
      case 'distinct': {
        message.success('去重成功，正在进行数据合并')
        break
      }
      case 'download':
        setLoading(false)
        message.success('处理成功，正在下载')
        const wb = e.data.wb
        worker.current?.terminate()
        worker.current = undefined

        window.XLSX.writeFile(wb, `${filename.current}（已去重合并）.xlsx`)
        filename.current = ''
        break
      default:
        console.log(e.data)
    }
  }, [])

  useEffect(() => {
    return () => {
      worker.current?.removeEventListener('message', onmessage)
    }
  }, [])

  const onLocalBeforeUpload = async  (file: any) => {
    setLoading(true)
    filename.current = file.name
    worker.current = new Worker('/workers/excel.worker.js')
    worker.current.onmessage = onmessage
    worker.current?.postMessage({ event: 'upload', file })
    return false
  }

  const handleParse = () => {
    form.validateFields().then(values => {
      const { distinct_col, sum_cols } = values
      if (sum_cols.includes(distinct_col)) {
        message.warning('需要去重和合并的列名不能相同')
        return
      }

      setLoading(true)
      worker.current?.postMessage({ event: 'parse', options: values })
    })
  }

  return (
    <Spin spinning={loading} tip='正在处理中，请稍后...' style={{ minHeight: 752 }}>
      <Card title='Step1：选择文件上传'>
        <div className="dragger">
          <Dragger
            showUploadList
            listType="text"
            accept={'.xlsx'}
            name="file"
            beforeUpload={onLocalBeforeUpload}>
              <div className="ant-upload-drag-icon">
                <UploadOutlined />
              </div>
              <p className='text'>
                选择文件上传,可拖入
              </p>
          </Dragger>
        </div>
      </Card>
      {titles.length > 0 && (
        <Card title='Step2：选择需要处理的数据' style={{ marginTop: 24 }}>
          <Form style={{ marginTop: 24 }} form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 10 }}>
            <Form.Item name='distinct_col' label='需要去重的列名' rules={[{ required: true, message: '请选择需要去重的列名' }]}>
              <Select placeholder='请选择'>
                {titles.map((it, index) => (<Select.Option key={it} value={index}>{it}</Select.Option>))}
              </Select>
            </Form.Item>
            <Form.Item name='sum_cols' label='需要合并的列名' rules={[{ required: true, message: '请选择需要合并的列名' }]}>
              <Select mode='multiple' placeholder='请选择，可多选'>
                {titles.map((it, index) => (<Select.Option key={it} value={index}>{it}</Select.Option>))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type='primary' onClick={handleParse}>开始处理</Button>
            </Form.Item>
          </Form>
        </Card>
      )}
    </Spin>
  )
}

export default BatchImportEditor