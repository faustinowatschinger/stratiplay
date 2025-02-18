import React, { useState } from "react";
import { useAuth } from "./auth-context";
import { useNavigate } from "react-router-dom";

const AuthForm = () => {
  const { register, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(true);

  const navigate = useNavigate();

  const plan = "gratuito";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await register(email, password, name, plan); // Pasar el plan como parámetro
      } else {
        await login(email, password);
      }
      navigate("/", { state: { estadoRegistro: isRegister } });
    } catch (error) {
      alert(error.message);
      console.error("Error en autenticación:", error);
    }
  };

  return (
    <article className='flex flex-col items-center justify-center min-h-screen'>
      <section className="flex flex-col items-center bg-[#4D4D4D] justify-center w-max text-white p-6 rounded-lg">
        <form className="flex flex-col items-center rounded-lg justify-center gap-4" onSubmit={handleSubmit}>
          {isRegister && (
            <input
              type="text"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="style-input"
              required
            />
          )}
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="style-input"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="style-input"
            required
          />
          <button className="bg-black w-max p-2 rounded-lg mt-4 m-auto" type="submit">
            {isRegister ? "Registrarse" : "Iniciar Sesión"}
          </button>
        </form>
        <button onClick={() => setIsRegister(!isRegister)} className="mt-2">
          Cambiar a {isRegister ? "Iniciar Sesión" : "Registrarse"}
        </button>
      </section>
    </article>
  );
};

export default AuthForm;