import React from "react"
import { Card } from "antd"
import BatchImportEditor from "../components/BatchImportEditor"

const Home: React.FC<any> = () => {
  return <Card title='Excel 数据处理' style={{ minWidth: 1000, minHeight: 800 }}>
    <BatchImportEditor />
  </Card>
}

export default Home