import React, { FunctionComponent } from "react"
import { Modal, ModalProps } from "antd"
import './index.css'

interface ContentProps {
  resolve: (value: any) => void
  reject: () => void
}

interface DialogFormProps {
  title: string
  content: FunctionComponent<ContentProps>
  config?: ModalProps
  width?: number
  props?: any
}

export const DialogForm  = ({ config = {}, title, width = 800, content, props = {} }: DialogFormProps) => {
  let modal: any = null
  const El = content
  return new Promise((resolve, reject) => {
    modal = Modal.info({
      keyboard: false,
      ...config,
      title,
      width,
      okButtonProps: { style: { display: 'none' } },
      centered: true,
      className: 'dialog_form_2',
      content: <El resolve={resolve} reject={reject} {...props} />
    })
  }).then((res: any) => {
    modal.destroy()
    return res
  }).catch(() => {
    modal.destroy()
    return Promise.reject()
  })
}
