import { useMemo, useState } from 'react'

interface FormValues {
  name: string
  email: string
  message: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const EMPTY: FormValues = { name: '', email: '', message: '' }

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}
  if (!values.name.trim()) errors.name = '请填写您的姓名'
  if (!values.email.trim()) errors.email = '请填写邮箱地址'
  else if (!EMAIL_PATTERN.test(values.email.trim()))
    errors.email = '请输入有效的邮箱地址'
  if (!values.message.trim()) errors.message = '请写下您想告诉我的内容'
  return errors
}

export default function ContactPage() {
  const [values, setValues] = useState<FormValues>(EMPTY)
  // 字段被触碰过才显示错误，避免初始进入即满屏报错
  const [touched, setTouched] = useState<Record<keyof FormValues, boolean>>({
    name: false,
    email: false,
    message: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const errors = useMemo(() => validate(values), [values])
  const isValid = Object.keys(errors).length === 0

  const update = (field: keyof FormValues, value: string) => {
    setValues((v) => ({ ...v, [field]: value }))
  }

  const blur = (field: keyof FormValues) => {
    setTouched((t) => ({ ...t, [field]: true }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || submitting) return
    setTouched({ name: true, email: true, message: true })
    setSubmitting(true)
    // 无后端：模拟一次提交延时后进入感谢画面
    window.setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
    }, 800)
  }

  if (submitted) {
    return (
      <div className="container section contact-page">
        <div className="contact-card contact-success" role="status">
          <span className="success-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="34" height="34">
              <path d="M4 12.5l5 5L20 6.5" />
            </svg>
          </span>
          <h1 className="page-title">谢谢你的来信</h1>
          <p>
            {values.name}，你的消息已经收到。
            我通常会在两个工作日内通过 {values.email} 回复你。
          </p>
          <button
            type="button"
            className="button button-outline"
            onClick={() => {
              setValues(EMPTY)
              setTouched({ name: false, email: false, message: false })
              setSubmitted(false)
            }}
          >
            再写一封
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container section contact-page">
      <header className="page-head">
        <p className="eyebrow">Contact</p>
        <h1 className="page-title">联系</h1>
        <p className="page-lede">
          拍摄合作、作品授权或只是聊聊高原上的天气，都可以从这里写信给我。
        </p>
      </header>

      <form className="contact-form" noValidate onSubmit={handleSubmit}>
        <Field
          id="name"
          label="姓名"
          value={values.name}
          error={touched.name ? errors.name : undefined}
          onChange={(v) => update('name', v)}
          onBlur={() => blur('name')}
          autoComplete="name"
        />
        <Field
          id="email"
          label="邮箱"
          type="email"
          value={values.email}
          error={touched.email ? errors.email : undefined}
          onChange={(v) => update('email', v)}
          onBlur={() => blur('email')}
          autoComplete="email"
        />
        <Field
          id="message"
          label="留言"
          as="textarea"
          value={values.message}
          error={touched.message ? errors.message : undefined}
          onChange={(v) => update('message', v)}
          onBlur={() => blur('message')}
        />

        <button
          type="submit"
          className="button button-gold contact-submit"
          disabled={!isValid || submitting}
        >
          {submitting ? '发送中…' : '发送消息'}
        </button>
        <p className="form-hint">三项内容均填写且邮箱格式正确后，即可发送。</p>
      </form>
    </div>
  )
}

interface FieldProps {
  id: string
  label: string
  value: string
  error?: string
  onChange: (v: string) => void
  onBlur: () => void
  type?: string
  as?: 'input' | 'textarea'
  autoComplete?: string
}

function Field({
  id,
  label,
  value,
  error,
  onChange,
  onBlur,
  type = 'text',
  as = 'input',
  autoComplete,
}: FieldProps) {
  return (
    <div className={`field ${error ? 'field-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {as === 'textarea' ? (
        <textarea
          id={id}
          rows={5}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      )}
      {error && (
        <p className="field-error-text" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
