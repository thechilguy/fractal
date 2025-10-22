"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { registerUser } from "@/actions/register";
import styles from "@/app/component/Auth/Auth.module.scss";
import Link from "next/link";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { useRouter } from "next/navigation";

type RegisterFormInputs = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const schema = yup.object({
  name: yup
    .string()
    .min(2, "Minimum 2 characters")
    .required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Minimum 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

const Register = () => {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInputs>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    setServerError(null);
    const res = await registerUser(data.name, data.email, data.password);

    if (!res.success) {
      setServerError(res.error);
      return;
    }

    router.push("/login");
  };

  return (
    <div className={styles.Container}>
      <h1 className={styles.Title}>Create your account</h1>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.Form}>
        {serverError && <p className={styles.Error}>{serverError}</p>}

        <div className={styles.Field}>
          <label>Name</label>
          <div className={styles.InputWrapper}>
            <FaUser className={styles.Icon} />
            <input type="text" {...register("name")} placeholder="Your name" />
          </div>
          {errors.name && <p className={styles.Error}>{errors.name.message}</p>}
        </div>

        <div className={styles.Field}>
          <label>Email</label>
          <div className={styles.InputWrapper}>
            <FaEnvelope className={styles.Icon} />
            <input
              type="email"
              {...register("email")}
              placeholder="you@example.com"
            />
          </div>
          {errors.email && (
            <p className={styles.Error}>{errors.email.message}</p>
          )}
        </div>

        <div className={styles.Field}>
          <label>Password</label>
          <div className={styles.InputWrapper}>
            <FaLock className={styles.Icon} />
            <input
              type="password"
              {...register("password")}
              placeholder="Create a password"
            />
          </div>
          {errors.password && (
            <p className={styles.Error}>{errors.password.message}</p>
          )}
        </div>

        <div className={styles.Field}>
          <label>Confirm password</label>
          <div className={styles.InputWrapper}>
            <FaLock className={styles.Icon} />
            <input
              type="password"
              {...register("confirmPassword")}
              placeholder="Repeat your password"
            />
          </div>
          {errors.confirmPassword && (
            <p className={styles.Error}>{errors.confirmPassword.message}</p>
          )}
        </div>

        <button type="submit" className={styles.Submit} disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create account"}
        </button>

        <div className={styles.RegisterBlock}>
          <p>Already have an account?</p>
          <Link href="/login">Sign in</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
