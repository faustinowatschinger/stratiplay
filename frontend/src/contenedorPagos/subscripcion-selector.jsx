import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useUserPlan } from '../context/userPlanContext';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const SubscripcionSelector = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { userPlan, loading } = useUserPlan();
  const [canceling, setCanceling] = useState(false);
  const [message, setMessage] = useState('');
  const [showPaypalButton, setShowPaypalButton] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState(null);

  // Escucha el auth para obtener el usuario actual
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user ? user : null);
    });
    return () => unsubscribe();
  }, []);

  // Actualiza el plan del usuario en Firestore
  const updateUserPlan = async (plan) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'usuarios', user.uid), { plan });
      console.log('Plan actualizado a:', plan);
    } catch (error) {
      console.error('Error actualizando el plan en Firestore:', error);
    }
  };

  // Al seleccionar un plan, se muestra el contenedor del botón de PayPal
  const handleSubscription = (planType) => {
    if (userPlan && userPlan !== 'gratuito' && userPlan !== planType) {
      alert('Debes cancelar tu plan actual antes de seleccionar uno nuevo.');
      return;
    }
    setSelectedPlanType(planType);
    setShowPaypalButton(true);
  };

  // Cancela la suscripción llamando a un endpoint de cancelación (debes implementarlo en tu servidor)
  const handleCancelSubscription = async () => {
    setCanceling(true);
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("No estás autenticado. Por favor, inicia sesión.");
      }
      // Obtén el token de autenticación
      const token = await currentUser.getIdToken();
      // Se asume que en currentUser tienes guardado el subscriptionID
      // Asegúrate de que esta propiedad esté configurada correctamente o recupérala desde tu base de datos.
      const subscriptionID = currentUser.subscriptionID;
      if (!subscriptionID) {
        throw new Error("No se encontró el ID de la suscripción.");
      }
      const response = await fetch('https://api.stratiplay.com/api/paypal/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ subscriptionID }),
      });
      if (!response.ok) {
        throw new Error("Error al cancelar la suscripción en el servidor.");
      }
      setMessage('Suscripción cancelada con éxito.');
    } catch (error) {
      console.error('Error al cancelar la suscripción:', error);
      setMessage('Hubo un error al cancelar la suscripción.');
    } finally {
      setCanceling(false);
    }
  };

  // Renderiza el botón de PayPal usando Smart Payment Buttons
  useEffect(() => {
    if (showPaypalButton && window.paypal && selectedPlanType) {
      // Mapeo de tipo de plan a ID de plan en PayPal (actualiza estos valores según tu configuración)
      const planIdMapping = {
        'basic': 'P-6M57844475618820RM6X3SNY',
        'pro': 'P-2FF80042J5749983XM6X3R6Q'
      };
      const planId = planIdMapping[selectedPlanType];
      window.paypal.Buttons({
        createSubscription: function(data, actions) {
          return actions.subscription.create({
            'plan_id': planId
          });
        },
        onApprove: function(data, actions) {
          // Actualiza el plan en Firestore al aprobar la suscripción
          updateUserPlan(selectedPlanType);
          alert('Suscripción completada. ID: ' + data.subscriptionID);
          setShowPaypalButton(false);
        },
        onError: function(err) {
          console.error('Error en la suscripción:', err);
          setMessage("Error en el proceso de suscripción.");
        }
      }).render('#paypal-button-container');
    }
  }, [showPaypalButton, selectedPlanType]);

  if (loading) {
    return (
      <div className="w-20 h-20 border-4 border-white m-auto border-t-black rounded-full animate-spin"></div>
    );
  }

  return (
    <article className="flex flex-col h-full items-center justify-center p-4 sm:p-6 md:p-10">
      {user ? (
        <>
          <div className="flex flex-col bg-[#4D4D4D] rounded-lg w-full p-3 lg:flex-row flex-wrap gap-1 items-stretch">
            {/* Sección "Incluye" */}
            <div className="bg-[#4D4D4D] rounded-lg flex flex-col items-center justify-center text-white flex-1 w-auto">
              <h3 className="text-xl bg-[#252525] p-2 w-full flex items-center justify-center rounded-lg">
                Incluye
              </h3>
              <ol className="flex-grow list-disc list-inside">
                <li className="border-b border-[#252525]">Planes activos:</li>
                <li className="border-b border-[#252525]">Anuncios:</li>
                <li className="border-b border-[#252525]">Progresar plan:</li>
                <li className="border-b border-[#252525]">Información al progresar:</li>
                <li className="border-b border-[#252525]">Costo:</li>
              </ol>
            </div>
            {/* Sección Gratuito */}
            <div className="bg-[#4D4D4D] rounded-lg flex flex-col items-center justify-center text-white flex-1 w-auto">
              <h3 className="text-xl bg-[#252525] p-2 w-full flex items-center justify-center rounded-lg">
                Gratuito
              </h3>
              <ol className="flex-grow list-inside">
                <li className="border-b border-[#252525]">1 plan</li>
                <li className="border-b border-[#252525]">Con anuncios</li>
                <li className="border-b border-[#252525]">3 veces</li>
                <li className="border-b border-[#252525]">No</li>
                <li className="border-b border-[#252525]">$0,00/mes</li>
              </ol>
            </div>
            {/* Sección Plan Básico */}
            {(userPlan === 'gratuito' || userPlan === 'pro') && (
              <div className="bg-[#4D4D4D] rounded-lg flex flex-col items-center justify-center text-white flex-1 w-auto">
                <h3 className="text-xl bg-[#252525] p-2 w-full flex items-center justify-center rounded-lg">
                  Plan Básico
                </h3>
                <ol className="flex-grow list-inside">
                  <li className="border-b border-[#252525]">2 planes</li>
                  <li className="border-b border-[#252525]">Sin anuncios</li>
                  <li className="border-b border-[#252525]">Ilimitadas veces</li>
                  <li className="border-b border-[#252525]">No</li>
                  <li className="border-b border-[#252525]">$3.000/mes</li>
                </ol>
                <div>
                  <button
                    onClick={() => handleSubscription("basic")}
                    className="p-1 bg-[#252525] text-white rounded-lg"
                  >
                    Suscribirme
                  </button>
                </div>
              </div>
            )}
            {/* Sección Plan Pro */}
            {(userPlan === 'gratuito' || userPlan === 'basic') && (
              <div className="bg-[#4D4D4D] rounded-lg flex flex-col items-center justify-center text-white flex-1 w-auto">
                <h3 className="text-xl bg-[#252525] p-2 w-full flex items-center justify-center rounded-lg">
                  Plan Pro
                </h3>
                <ol className="flex-grow list-inside">
                  <li className="border-b border-[#252525]">4 planes</li>
                  <li className="border-b border-[#252525]">Sin anuncios</li>
                  <li className="border-b border-[#252525]">Ilimitadas veces</li>
                  <li className="border-b border-[#252525]">Si</li>
                  <li className="border-b border-[#252525]">$5.000/mes</li>
                </ol>
                <div>
                  <button
                    onClick={() => handleSubscription("pro")}
                    className="p-1 bg-[#252525] text-white rounded-lg"
                  >
                    Suscribirme
                  </button>
                </div>
              </div>
            )}
          </div>
          {(userPlan === 'basic' || userPlan === 'pro') && (
            <div className="mt-5">
              <button
                className="text-lg bg-red-600 text-white p-2 rounded-lg"
                onClick={handleCancelSubscription}
                disabled={canceling}
              >
                {canceling ? 'Cancelando...' : 'Cancelar Suscripción'}
              </button>
              {message && <p className="mt-2">{message}</p>}
            </div>
          )}
          {/* Contenedor para el botón de PayPal */}
          {showPaypalButton && (
            <div className="mt-5">
              <div id="paypal-button-container"></div>
              <button 
                className="mt-2 p-2 bg-gray-500 text-white rounded-lg"
                onClick={() => setShowPaypalButton(false)}
              >
                Cancelar Pago
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-xl text-white">
          Tienes que iniciar sesión para suscribirte a un plan
        </p>
      )}
    </article>
  );
};

export default SubscripcionSelector;
