import { useMemo, useState, type FormEvent } from "react";

interface FormValues {
  name: string;
  email: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = "请填写您的姓名。";
  if (!values.email.trim()) {
    errors.email = "请填写邮箱地址。";
  } else if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = "邮箱格式不正确，请检查后重试。";
  }
  if (!values.message.trim()) errors.message = "请填写留言内容。";
  return errors;
}

const EMPTY: FormValues = { name: "", email: "", message: "" };

export function Contact() {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const errors = useMemo(() => validate(values), [values]);
  const isValid = Object.keys(errors).length === 0;
  // 首次提交尝试后，校验未通过时禁用提交按钮；首次点击始终允许，以便展示行内错误
  const submitDisabled = status === "sending" || (attempted && !isValid);

  const update = (field: keyof FormValues) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [field]: e.target.value }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (!isValid || status === "sending") return;
    setStatus("sending");
    // 前端模拟提交，无真实后端
    window.setTimeout(() => setStatus("sent"), 800);
  };

  if (status === "sent") {
    return (
      <div className="contact-wrap">
        <div className="contact-success" role="status">
          <h2>感谢你的来信</h2>
          <p>
            你的留言已经收到。我会尽快回复你——如果正好是拍摄季在外，
            可能会慢一些，但一定不会漏掉。
          </p>
          <button
            type="button"
            className="submit-btn"
            onClick={() => {
              setValues(EMPTY);
              setAttempted(false);
              setStatus("idle");
            }}
          >
            再写一封
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-wrap">
      <p className="eyebrow">联系</p>
      <h1>预约拍摄或聊聊合作</h1>
      <p className="contact-intro">
        无论是人像约拍、图片授权，还是高原同行的拍摄计划，都欢迎来信。
      </p>

      <form noValidate onSubmit={onSubmit}>
        <div className={`form-field${attempted && errors.name ? " invalid" : ""}`}>
          <label htmlFor="contact-name">姓名</label>
          <input
            id="contact-name"
            name="name"
            type="text"
            value={values.name}
            onChange={update("name")}
            aria-invalid={attempted && !!errors.name}
          />
          {attempted && errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div className={`form-field${attempted && errors.email ? " invalid" : ""}`}>
          <label htmlFor="contact-email">邮箱</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            value={values.email}
            onChange={update("email")}
            aria-invalid={attempted && !!errors.email}
          />
          {attempted && errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className={`form-field${attempted && errors.message ? " invalid" : ""}`}>
          <label htmlFor="contact-message">留言</label>
          <textarea
            id="contact-message"
            name="message"
            value={values.message}
            onChange={update("message")}
            aria-invalid={attempted && !!errors.message}
          />
          {attempted && errors.message && <span className="field-error">{errors.message}</span>}
        </div>

        <button type="submit" className="submit-btn" disabled={submitDisabled}>
          {status === "sending" ? "发送中…" : "发送"}
        </button>
      </form>
    </div>
  );
}
