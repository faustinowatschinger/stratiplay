import { Link, Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { useContext, useRef, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

import Catalogo from "./contenedorPlanes/catalogo-planes-de-estudio";
import AgregarCampo from "./contenedorPlanes/agregar-plan-de-estudio";
import InformacionCampo from "./contenedorPlanes/informacion-plan-de-estudio";
import AuthForm from './registro/auth-form';
import { TemasContext } from './context/temasContext';
import SubscripcionSelector from "./contenedorPagos/subscripcion-selector";

import PoliticaDePrivacidad from "./seccionesLegales/politica-de-privacidad";
import TerminosYCondiciones from "./seccionesLegales/terminos-y-condiciones";
import ProveedoresExternosDePago from "./seccionesLegales/proveedoresExternosDePago";
import MecanismosParaDerechosDelUsuario from "./seccionesLegales/mecanismos-para-derechos-de-usuario";
import ConsentimientoExplicito from "./seccionesLegales/concentimiento-explicito";
import ControlDeCambiosYNotificacionesLegales from "./seccionesLegales/control-de-cambios-y-notificaciones-legales";
import SeguridadDeDatos from "./seccionesLegales/seguridad-de-datos";
import CumplimientoDeRegulaciones from "./seccionesLegales/cumplimiento-de-regulaciones";
import Contacto from "./seccionesLegales/contacto";
import CookieConsent from "./seccionesLegales/cookieConsent";
import SobreNosotros from "./seccionesLegales/sobre-nosotros";
import AperturaPrincipiantes from "./articulosDeportes/articulosAjedrez/apreturas-para-principiantes";
import ErroresComunes from "./articulosDeportes/articulosAjedrez/errores-comunes";
import ImpactoCognitivoAjedrez from "./articulosDeportes/articulosAjedrez/impacto-cognitivo-del-ajedrez";
import AnalizarPartidasAjedrez from "./articulosDeportes/articulosAjedrez/analizar-partidas-ajedrez";
import GestionBankroll from "./articulosDeportes/articulosPoker/gestion-bankroll-poker";
import EstrategiasBasicas from "./articulosDeportes/articulosPoker/estrategias-basicas-texas-holdem";
import EstrategiasAvanzadas from "./articulosDeportes/articulosPoker/estrategias-avanzadas-texas-holdem";
import ErroresComunesEnElPoker from "./articulosDeportes/articulosPoker/errores-en-el-poker";
import PsicologiaDelPoker from "./articulosDeportes/articulosPoker/psicologia-del-poker";
import MejorarEloEnAjedrez from "./articulosDeportes/articulosAjedrez/mejorar-elo-en-ajedrez";

function App() {
  const { user } = useContext(TemasContext);
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });

    return () => unsubscribe();
  }, []);
  

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };
  
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <header className="flex justify-between bg-[#4D4D4D] py-5 px-4 h-20">
          <Link to="/"><img className="h-12" src="/imagenes/1.webp" alt="Logo" /></Link>
          <nav className="flex space-x-4">
            {authUser ? (
              <button onClick={handleLogout} className="text-white">Cerrar sesión</button>
            ) : (
              <Link to="/auth-form"><img className="w-12 h-auto" src="/imagenes/iniciar-sesion.webp" alt="Login" /></Link>
            )}
          </nav>
        </header>

        <div className="flex flex-1">
        <nav
      className="relative flex flex-col bg-[#4D4D4D] w-max h-auto space-y-6"
    >
      <Link className="m-2" to="/"><img className="w-12 h-auto" src="/imagenes/casa.webp" alt="Home" /></Link>
      <Link className="m-2" to="/catalogo-planes-de-estudio">
        <img className="w-12 h-auto" src="/imagenes/categoria.webp" alt="Campos" />
      </Link>
      <Link className="m-2" to="/subscripcion-selector">
        <img className="w-12 h-auto" src="/imagenes/moneda.webp" alt="Moneda" />
      </Link>
      <div className="flex flex-col space-y-4">
      {/* Póker */}
      <ol className="relative group">
        <li className="flex flex-col items-start">
          <img
            className="w-12 h-auto m-2 cursor-pointer"
            src="/imagenes/as-de-espadas.webp"
            alt="Poker"
          />
          <ol className="absolute left-full top-0 hidden group-hover:block bg-[#4D4D4D] p-2">
            <li className="p-2 text-white w-max hover:bg-[#252525] rounded-lg">
              <Link to="/gestion-bankroll-poker">Gestión de bankroll</Link>
            </li>
            <li className="p-2 text-white w-max hover:bg-[#252525] rounded-lg">
              <Link to="/estrategias-basicas-texas-holdem">
                Estrategias básicas de Texas Holdem
              </Link>
            </li>
            <li className="p-2 text-white w-max hover:bg-[#252525] rounded-lg">
              <Link to="/estrategias-avanzadas-texas-holdem">
                Estrategias avanzadas de Texas Holdem
              </Link>
            </li>
            <li className="p-2 text-white w-max hover:bg-[#252525] rounded-lg">
              <Link to="/errores-en-el-poker">Errores comunes en el poker</Link>
            </li>
            <li className="p-2 text-white w-max hover:bg-[#252525] rounded-lg">
              <Link to="/psicologia-del-poker">Psicología del poker</Link>
            </li>
          </ol>
        </li>
      </ol>

      {/* Ajedrez */}
      <ol className="relative group">
        <li className="flex flex-col items-start">
          <img
            className="w-12 h-auto m-2 cursor-pointer"
            src="/imagenes/peon.webp"
            alt="Peon"
          />
          <ol className="absolute left-full top-0 hidden group-hover:block bg-[#4D4D4D] p-2">
            <li className="p-2 text-white w-max hover:bg-[#252525] rounded-lg">
              <Link to="/mejorar-elo-en-ajedrez">
                Mejorar elo en ajedrez
              </Link>
            </li>
            <li className="p-2 text-white w-max hover:bg-[#252525] rounded-lg">
              <Link to="/aperturas-para-principiantes">
                Mejores aperturas de ajedrez para principiantes
              </Link>
            </li>
            <li className="p-2 text-white w-max hover:bg-[#252525] rounded-lg">
              <Link to="/errores-comunes">Errores comunes en ajedrez</Link>
            </li>
            <li className="p-2 text-white w-max hover:bg-[#252525] rounded-lg">
              <Link to="/impacto-cognitivo-del-ajedrez">
                El impacto cognitivo del ajedrez
              </Link>
            </li>
            <li className="p-2 text-white w-max hover:bg-[#252525] rounded-lg">
              <Link to="/analizar-partidas-ajedrez">
                Analizar partidas de ajedrez
              </Link>
            </li>
          </ol>
        </li>
      </ol>
    </div>
    </nav>


          <main className="bg-[#252525] flex-1 overflow-auto p-4">
            <Routes>
              <Route path="/" element={
                <article className="flex flex-col items-center gap-10 p-4 md:p-10">
                  <section className="flex flex-col items-center justify-center w-full xl:w-1/2 bg-[#4D4D4D] rounded-lg p-5 shadow-lg">
                    <div className="text-white flex flex-col items-center justify-center p-2">
                      <h1 className="text-2xl md:text-3xl font-bold mb-4">Cómo mejorar en juegos estratégicos paso a paso</h1>
                      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                        <p className="text-base md:text-lg leading-relaxed">
                          Stratiplay es una plataforma adaptativa para juegos estratégicos. Te ofrece un plan de estudios personalizado para ajedrez y póker, optimizando tu tiempo de estudio y garantizando una experiencia de usuario fluida e intuitiva.
                        </p>
                        <img className="w-32 md:w-48 rounded-lg shadow-md" src="/imagenes/estrategia.webp" alt="Estrategia" />
                      </div>
                      <Link to="/catalogo-planes-de-estudio" className="mt-4 text-base md:text-lg bg-[#252525] text-white py-2 px-4 rounded-lg shadow-md hover:bg-[#1a1a1a] transition duration-300">Empieza a aprender</Link>
                    </div>
                  </section>
                  <section className="flex flex-col items-center justify-center w-full bg-transparent rounded-lg p-5">
                    <div className="flex flex-col w-full items-center justify-center">
                      <ul className="gap-10 w-full flex flex-wrap items-stretch justify-center text-white">
                        {[
                          {
                            title: "Planes de estudio personalizados",
                            subtitles: [
                              "Adaptados a tu nivel",
                              "Escalable"
                            ],
                            description: [
                              "Ya seas principiante, intermedio o avanzado, Stratiplay genera un plan específico para ti",
                              "Actualiza tu plan automáticamente según tus avances para mantenerte en constante mejora"
                            ],
                            imgSrc: "/imagenes/cuaderno.webp"
                          },
                          {
                            title: "Entrenamiento estratégico automatizado",
                            subtitles: [
                              "Optimización del tiempo de estudio",
                              "Reevaluación semanal"
                            ],
                            description: [
                              "Recibes tareas y objetivos claros para cada sesión, eliminando la necesidad de investigar qué estudiar",
                              "Ajusta las metas y ejercicios según tus resultados, asegurando progreso continuo"
                            ],
                            imgSrc: "/imagenes/automatizacion.webp"
                          },
                          {
                            title: "Rutinas personalizadas de aprendizaje",
                            subtitles: [
                              "Enfoque estratégico",
                              "Diferentes intensidades",
                              "Flexibilidad de horarios"
                            ],
                            description: [
                              "Funciona para juegos como ajedrez, póker y otros deportes mentales, optimizando el aprendizaje en diversas áreas",
                              "Elige entre planes intensivos o relajados según tu disponibilidad de tiempo",
                              "Programa los días y la cantidad de horas que puedes dedicar al estudio"
                            ],
                            imgSrc: "/imagenes/adaptabilidad.webp"
                          },
                        ].map((item, index) => (
                          <li key={index} className="flex flex-col gap-3 items-center justify-start w-full xl:w-1/2 text-xl md:text-2xl bg-[#4D4D4D] p-5 rounded-lg shadow-lg">
                            <h2 className="font-bold mb-2">{item.title}</h2>
                            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                              <ul className="flex flex-col gap-3">
                                {item.subtitles.map((subtitle, i) => (
                                  <li key={i}>
                                    <h3 className="text-lg font-semibold">{subtitle}</h3>
                                    <p className="text-base md:text-lg leading-relaxed">{item.description[i]}</p>
                                  </li>
                                ))}
                              </ul>
                              <img className="w-32 md:w-48 rounded-lg shadow-md" src={item.imgSrc} alt={item.title} />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>
                </article>
              } />
              <Route path="/catalogo-planes-de-estudio" element={<Catalogo />} />
              <Route path="/agregar-plan-de-estudio" element={<AgregarCampo />} />
              <Route path="/informacion-plan-de-estudio" element={<InformacionCampo />} />
              <Route path="/auth-form" element={<AuthForm />} />
              <Route path="/subscripcion-selector" element={<SubscripcionSelector />} />
              <Route path="/politica-de-privacidad" element={<PoliticaDePrivacidad />} />
              <Route path="/terminos-y-condiciones" element={<TerminosYCondiciones />} />
              <Route path="/proveedores-externos-de-pago" element={<ProveedoresExternosDePago />} />
              <Route path="/mecanismos-para-derechos-de-usuario" element={<MecanismosParaDerechosDelUsuario />} />
              <Route path="/consentimiento-explicito" element={<ConsentimientoExplicito />} />
              <Route path="/control-de-cambios-y-notificaciones-legales" element={<ControlDeCambiosYNotificacionesLegales />} />
              <Route path="/seguridad-de-datos" element={<SeguridadDeDatos />} />
              <Route path="/cumplimiento-de-regulaciones" element={<CumplimientoDeRegulaciones />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/sobre-nosotros" element={<SobreNosotros />} />
              <Route path="/aperturas-para-principiantes" element={<AperturaPrincipiantes />} />
              <Route path="/errores-comunes" element={<ErroresComunes />} />
              <Route path="/impacto-cognitivo-del-ajedrez" element={<ImpactoCognitivoAjedrez />} />
              <Route path="/analizar-partidas-ajedrez" element={<AnalizarPartidasAjedrez />} />
              <Route path="/gestion-bankroll-poker" element={<GestionBankroll />} />
              <Route path="/estrategias-basicas-texas-holdem" element={<EstrategiasBasicas />} />
              <Route path="/estrategias-avanzadas-texas-holdem" element={<EstrategiasAvanzadas />} />
              <Route path="/errores-en-el-poker" element={<ErroresComunesEnElPoker />} />
              <Route path="/psicologia-del-poker" element={<PsicologiaDelPoker />} />
              <Route path="/mejorar-elo-en-ajedrez" element={<MejorarEloEnAjedrez />} />
            </Routes>
          </main>
        </div>
        <footer className="bg-[#4D4D4D] flex flex-col items-center justify-center text-white p-4 mt-auto">
          <p>© 2025 Stratiplay. Todos los derechos reservados.</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-10">
            <div className="flex flex-col items-center justify-center">
              <h4>Seccion legal</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <li><Link to="/contacto"><h5>Contacto</h5></Link></li>
                <li><Link to="/sobre-nosotros"><h5>Sobre nosotros</h5></Link></li>
                <li><Link to="/politica-de-privacidad"><h5>Politica de privacidad</h5></Link></li>
                <li><Link to="/terminos-y-condiciones"><h5>Terminos y condiciones</h5></Link></li>
                <li><Link to="/proveedores-externos-de-pago"><h5>Proveedores externos de pago</h5></Link></li>
                <li><Link to="/mecanismos-para-derechos-de-usuario"><h5>Mecanismos para derechos de usuario</h5></Link></li>
                <li><Link to="/consentimiento-explicito"><h5>Consentimiento explicito</h5></Link></li>
                <li><Link to="/control-de-cambios-y-notificaciones-legales"><h5>Control de cambios y notificaciones legales</h5></Link></li>
                <li><Link to="/seguridad-de-datos"><h5>Seguridad de datos</h5></Link></li>
                <li><Link to="/cumplimiento-de-regulaciones"><h5>Cumplimiento de regulaciones</h5></Link></li>
              </ul>
            </div>
            <div className="flex flex-col items-center justify-center">
              <h4>Contacto</h4>
              <ul>
                <li className="flex flex-row items-center justify-center gap-2"><img className="w-10" src="/imagenes/correo-electronico.webp" alt="Correo electrónico" /><h5>stratiplay@stratiplay.com</h5></li>
              </ul>
            </div>
          </div>
        </footer>
        <CookieConsent /> {/* Incluye el componente de aviso de cookies */}
      </div>
    </Router>
  );
}

export default App;