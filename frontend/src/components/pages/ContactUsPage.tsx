import { useState, type FormEvent } from 'react';
import { TextField } from '../ui/TextField';
import { TextAreaField } from '../ui/TextAreaField';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { AlertVariant } from '../../types/ui';
import type { ContactFormValues } from '../../types/contact';

const initialValues: ContactFormValues = { name: '', email: '', message: '' };

export function ContactUsPage() {
  const [values, setValues] = useState<ContactFormValues>(initialValues);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    setValues(initialValues);
  };

  return (
    <section className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-3xl font-bold text-ink">Contact Us</h1>
      <p className="mt-2 text-ink-soft">Placeholder contact form — wire this up to a real endpoint.</p>

      {submitted && (
        <div className="mt-4">
          <Alert variant={AlertVariant.Success}>Thanks for reaching out — we'll get back to you soon.</Alert>
        </div>
      )}

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        <TextField
          label="Name"
          name="name"
          value={values.name}
          onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
          required
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={(event) => setValues((prev) => ({ ...prev, email: event.target.value }))}
          required
        />
        <TextAreaField
          label="Message"
          name="message"
          value={values.message}
          onChange={(event) => setValues((prev) => ({ ...prev, message: event.target.value }))}
          required
        />
        <Button type="submit">Send message</Button>
      </form>
    </section>
  );
}
