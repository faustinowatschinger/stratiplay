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
        <header className='flex justify-between bg-[#4D4D4D] py-5 px-4 h-20'>
          <Link to="/"><img className='h-10' src="/imagenes/1.png" alt="Logo" /></Link>
          
          <nav className='flex space-x-4'>
            <Link to="/auth-form"><img className='w-10 h-auto' src="/imagenes/iniciar-sesion.png" alt="Login" /></Link>
          </nav>
        </header>

        <div className='flex h-[calc(100vh-80px)]'> {/* Ajusta la altura restando el header */}
          {/* Sidebar */}
          <nav className='flex flex-col bg-[#4D4D4D] w-16 h-full p-4 space-y-6'>
            <Link to="/"><img className='w-20 h-auto' src="/imagenes/casa.png" alt="Home" /></Link>
            <Link to="/catalogo-campos"><img className='w-20 h-auto' src="/imagenes/categoria.png" alt="Campos" /></Link>
          </nav>

          {/* Main Content */}
          <main className='bg-[#252525] flex-1 overflow-auto'>
            <Routes>
              <Route path="/" element={
                <article className='flex flex-col items-center gap-10 p-10'>
                  <section className="flex flex-col items-center justify-center w-1/2 bg-[#4D4D4D] rounded-lg p-5">
                    <div className="text-white flex flex-col items-center justify-center p-2">
                      <h1 className="text-2xl">Aprendisaje de juegos de estrategia</h1>
                      <p className="text-xl">
                        Stratiplay es una plataforma innovadora para el aprendizaje de juegos de estrategia. Te ofrece un plan de estudio personalizado basado en la información que proporcionas, optimizando tu progreso y garantizando una experiencia de usuario fluida e intuitiva.
                      </p>
                      <Link to="/agregar-campo" className="text-lg bg-[#252525] text-white p-1 rounded-lg">Empieza a aprender</Link>
                    </div>
                  </section>
                  <section className="flex flex-col items-center justify-center w-1/2 bg-[#4D4D4D] rounded-lg p-5">
                    <div className="flex flex-col items-center justify-center">
                      <h3 className="text-white text-2xl mb-5">Ventajas de usar Stratiplay</h3>
                      <ul className="gap-10 flex flex-col items-center justify-center text-white">
                        <li className="flex flex-col items-center justify-center text-xl">Planes de estudio personalizados
                          <ul className="flex flex-col gap-3">
                            <li>Adaptados a tu nivel: Ya seas principiante, intermedio o avanzado, Stratiplay genera un plan específico para ti</li>
                            <li>Análisis basado en datos: Utiliza información como partidas de ajedrez o manos de póker para identificar fortalezas, debilidades y errores comunes</li>
                            <li>Escalable: Actualiza tu plan automáticamente según tus avances para mantenerte en constante mejora</li>
                          </ul>
                        </li>
                        <li className="flex flex-col items-center justify-center text-xl bg-[#4D4D4D] p-2 rounded-lg">Automatización inteligente
                          <ul className="flex flex-col gap-3">
                            <li>Optimización del tiempo: Recibes tareas y objetivos claros para cada sesión, eliminando la necesidad de investigar qué estudiar</li>
                            <li>Recomendaciones basadas en IA: Proporciona recursos para estudiar o practicar y explica conceptos clave</li>
                            <li>Reevaluación semanal: Ajusta las metas y ejercicios según tus resultados, asegurando progreso continuo</li>
                          </ul>
                        </li>
                        <li className="flex flex-col items-center justify-center text-xl bg-[#4D4D4D] p-2 rounded-lg">Multidisciplinaria y adaptable
                          <ul className="flex flex-col gap-3">
                            <li>Enfoque estratégico: Funciona para juegos como ajedrez, póker y otros deportes mentales, optimizando el aprendizaje en diversas áreas</li>
                            <li>Diferentes intensidades: Elige entre planes intensivos o relajados según tu disponibilidad de tiempo</li>
                            <li>Flexibilidad de horarios: Programa los días y la cantidad de horas que puedes dedicar al estudio</li>
                          </ul>
                        </li>
                        <li className="flex flex-col items-center justify-center text-xl bg-[#4D4D4D] p-2 rounded-lg">Análisis detallado del rendimiento
                          <ul className="flex flex-col gap-3">
                            <li>Estilo de juego: Identifica si eres más táctico, agresivo o defensivo</li>
                            <li>Errores comunes: Te muestra patrones de errores para corregirlos rápidamente</li>
                            <li>Seguimiento de progreso: Evalúa mejoras en métricas como el ELO en ajedrez o ganancias en póker</li>
                          </ul>
                        </li>
                        <li className="flex flex-col items-center justify-center text-xl bg-[#4D4D4D] p-2 rounded-lg">Enfoque Freemium
                          <ul className="flex flex-col gap-3">
                            <li>Acceso gratuito: Prueba dos juegos sin costo para explorar la plataforma</li>
                            <li>Actualizaciones económicas: Modelos accesibles para planes avanzados con análisis más profundos</li>
                            <li>Publicidad limitada: Uso gratuito con anuncios ligeros para financiar el desarrollo continuo</li>
                          </ul>
                        </li>
                        <li className="flex flex-col items-center justify-center text-xl bg-[#4D4D4D] p-2 rounded-lg">Ideal para mejorar rápido y eficiente
                          <ul className="flex flex-col gap-3">
                            <li>Resultados medibles: Define objetivos claros como aumentar tu ELO o mejorar el ROI en póker</li>
                            <li>Progreso constante: Actualiza tu plan según tus resultados y rendimiento en partidas o sesiones previas</li>
                            <li>Práctica guiada: Tareas específicas para aplicar lo aprendido en escenarios reales.</li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                  </section>
                </article>
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