import { useCallback, useState } from "react";

export default function useForm({
  initialValues = {},
  validate,
  onSubmit,
} = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues((v) => ({ ...v, [name]: type === "checkbox" ? checked : value }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault?.();
      let nextErrors = {};
      if (typeof validate === "function") {
        nextErrors = validate(values) || {};
        setErrors(nextErrors);
      }
      if (
        Object.keys(nextErrors).length === 0 &&
        typeof onSubmit === "function"
      ) {
        await onSubmit(values);
      }
    },
    [values, validate, onSubmit]
  );

  return {
    values,
    setValues,
    errors,
    setErrors,
    handleChange,
    handleSubmit,
    reset,
  };
}
