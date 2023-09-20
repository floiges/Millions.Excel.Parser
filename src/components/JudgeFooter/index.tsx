import { Button } from "antd"

interface JudgeFooterProps {
  onOk: VoidFunction
  onCancel: VoidFunction
  loading?: boolean
}
const JudgeFooter: React.FC<JudgeFooterProps> = ({ loading, onCancel, onOk }) => {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
    <Button onClick={onCancel}>取消</Button>
    <Button style={{ marginLeft: 24 }} onClick={onOk} loading={loading} type="primary">确定</Button>
  </div>
}

export default JudgeFooter