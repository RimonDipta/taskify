import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { showIcon, hideIcon } from "../assets/icons";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        form
      );
      console.log("Login Success", res.data);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response.data.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center bg-background min-h-screen text-center">
      <form
        onSubmit={handleSubmit}
        className="bg-background-light p-10 rounded-lg shadow-amber-50 w-96"
      >
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded-xl"
          required
        />
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full mb-4 p-2 border rounded-xl pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/3 transform -translate-y-1/2 text-sm tex-gray-600"
          >
            <img
              src={showPassword ? hideIcon : showIcon}
              alt={showPassword ? "Hide Password" : "Show Password"}
              className="w-5 h-5"
            />
          </button>
        </div>
        <button
          type="submit"
          className="w-full bg-oxford-blue text-white py-3 rounded-xl"
        >
          Login
        </button>
        <p className="mt-4 text-sm text-gray-600">
          Don't have an account?{""}{" "}
          <Link to="/signup" className="text-cerulean-blue hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
