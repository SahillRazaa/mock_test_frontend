import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { useForm } from "react-hook-form";
import { Mail, Lock, Loader2 } from "lucide-react";
import axios from "axios";
import { Toaster } from "../utils/Toaster";
import { useNavigate } from "react-router-dom";

const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg,rgb(106, 173, 236),rgb(154, 166, 177));
  padding: 2rem;
`;

const FormWrapper = styled.div`
  background: white;
  padding: 3rem 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 420px;
  text-align: center;
  animation: fadeIn 0.4s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Title = styled.h2`
  font-size: 2rem;
  color: #222;
  margin-bottom: 2rem;
  font-family: "Inter", sans-serif;
  font-weight: 700;
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 1.2rem;

  svg {
    position: absolute;
    top: 50%;
    left: 14px;
    transform: translateY(-50%);
    color: #888;
  }
`;

const Input = styled.input`
  width: calc(100% - 60px);
  padding: 0.8rem 0.8rem 0.8rem 42px;
  border: 1px solid ${({ error }) => (error ? "#ff4d4d" : "#ddd")};
  border-radius: 10px;
  font-size: 1rem;
  font-family: "Inter", sans-serif;
  transition: all 0.3s;
  background-color: ${({ error }) => (error ? "#fff6f6" : "white")};

  &:focus {
    outline: none;
    border-color: #007bff;
    background-color: white;
  }
`;

const ErrorText = styled.p`
  font-size: 0.85rem;
  color: #ff4d4d;
  text-align: left;
  margin-top: -0.8rem;
  margin-bottom: 0.8rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.85rem;
  border: none;
  border-radius: 10px;
  background-color: ${({ disabled }) => (disabled ? "#9dc6ff" : "#007bff")};
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: background-color 0.3s;
  font-family: "Inter", sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background-color: ${({ disabled }) => (disabled ? "#9dc6ff" : "#0056b3")};
  }
`;

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {  
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        data
      );

      const { token } = response.data;

      if (token) {
        sessionStorage.setItem("token", token);
        Toaster({
          title: "Success",
          type: "success",
          message: "Successfully Logged In",
        });
        navigate("/my-test");
      }
      
    } catch (error) {
      Toaster({
        title: "Error",
        type: "error",
        message: `${error.response.data.message || 'Error during login!!'}`
      })
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <FormWrapper>
        <Title>Welcome Back</Title>
        <form onSubmit={handleSubmit(onSubmit)}>
          <InputGroup>
            <Mail size={20} />
            <Input
              type="email"
              placeholder="Email Address"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email format",
                },
              })}
              error={errors.email}
            />
          </InputGroup>
          {errors.email && <ErrorText>{errors.email.message}</ErrorText>}

          <InputGroup>
            <Lock size={20} />
            <Input
              type="password"
              placeholder="Password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              error={errors.password}
            />
          </InputGroup>
          {errors.password && <ErrorText>{errors.password.message}</ErrorText>}

          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="spin" /> Logging in...
              </>
            ) : (
              "Log In"
            )}
          </Button>
        </form>
      </FormWrapper>
    </PageContainer>
  );
}

export default Login;
