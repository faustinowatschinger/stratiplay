import { Link, Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { useState } from 'react';

import Catalogo from './components/catalogo-campos';
import AgregarCampo from './components/agregar-campo';
import InformacionCampo from './components/informacion-campo';
import AuthForm from './components/registro/auth-form';

function App() {
  return (
    <>
      <Router>
        {/* Header */}
        <header className='flex justify-between bg-black py-5 px-4 h-20'>
          <Link to="/"><img className='h-10' src="/imagenes/1.png" alt="Logo" /></Link>
          
          <nav className='flex space-x-4'>
            <Link to="/auth-form"><img className='w-10 h-auto' src="/imagenes/iniciar-sesion.png" alt="Login" /></Link>
          </nav>
        </header>

        <div className='flex h-[calc(100vh-80px)]'> {/* Ajusta la altura restando el header */}
          {/* Sidebar */}
          <nav className='flex flex-col bg-black w-16 h-full p-4 space-y-6'>
            <Link to="/"><img className='w-20 h-auto' src="/imagenes/casa.png" alt="Home" /></Link>
            <Link to="/catalogo-campos"><img className='w-20 h-auto' src="/imagenes/categoria.png" alt="Campos" /></Link>
          </nav>

          {/* Main Content */}
          <main className='bg-[#4D4D4D] flex-1 overflow-auto'>
    <Routes>
        <Route path="/" element={
          <>
          <article className='flex flex-col h-full items-center justify-center'>
                <div className="w-1/2 text-white flex flex-col items-start justify-center">
                    <h1 className="text-2xl">¿Porque usar Stratiplay?</h1>
                    <p className="text-xl">
                    Stratiplay es una plataforma innovadora para el aprendizaje de juegos de estrategia. Te ofrece un plan de estudio personalizado basado en la información que proporcionas, optimizando tu progreso y garantizando una experiencia de usuario fluida e intuitiva.
                    </p>
                    <Link to="/agregar-campo" className="text-lg bg-black p-1 rounded-lg">Empieza a aprender</Link>
                </div>
              </article>
          </>

        } />
        <Route path="/catalogo-campos" element={<Catalogo />} />
        <Route path="/agregar-campo" element={<AgregarCampo />} />
        <Route path="/informacion-campo" element={<InformacionCampo />} />
        <Route path="/auth-form" element={<AuthForm />} />
    </Routes>
</main>
        </div>
      </Router>
    </>
  );
}

export default App;