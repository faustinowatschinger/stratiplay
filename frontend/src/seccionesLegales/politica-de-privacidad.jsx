import React from 'react';

const PoliticaDePrivacidad = () => {
  return (
    <article className='flex flex-col items-center justify-center min-h-screen p-4'>
      <div className='bg-[#4D4D4D] text-white shadow-md rounded-lg p-6 max-w-4xl w-full'>
      <h1 className='text-3xl font-bold mb-4 text-center'>POLÍTICA DE PRIVACIDAD</h1>
      <p>Última actualización: 1/4/2025</p>
      <ol className='flex flex-col items-start justify-center gap-4'>
        <li>
          <h3 className='text-xl'>Información que recopilamos</h3>       
          <ol>
            <li>Información personal proporcionada por el usuario: Nombre, correo electrónico, dirección, datos de pago (PayPal, tarjeta de crédito o débito).</li>
            <li>Información recopilada automáticamente: Dirección IP, tipo de navegador, cookies y datos de uso del servicio.</li>
          </ol>
        </li>
        <li>
          <h3 className='text-xl'>Finalidad del uso de la información</h3>
          
          <ol>
            <li>Procesar pagos y suscripciones.</li>
            <li>Enviar notificaciones importantes y actualizaciones.</li>
            <li>Mejorar nuestros servicios y personalizar la experiencia del usuario.</li>
            <li>Cumplir con obligaciones legales y regulatorias.</li>
          </ol>
        </li>
        <li>
          <h3 className='text-xl'>Base legal para el procesamiento de datos</h3>
          
          <ol>
            <li>Consentimiento explícito del usuario.</li>
            <li>Necesidad contractual (procesamiento de pagos).</li>
            <li>Obligaciones legales y regulatorias.</li>
          </ol>
        </li>
        <li>
          <h3 className='text-xl'>Almacenamiento y seguridad</h3>
          <ol>
            <li>Los datos se almacenan en servidores seguros con cifrado SSL/TLS.</li>
            <li>No almacenamos directamente los datos financieros; usamos proveedores certificados PCI DSS.</li>
            <li>Implementamos medidas como 2FA (autenticación en dos pasos) para proteger las cuentas.</li>
          </ol>
        </li>
        <li>
          <h3 className='text-xl'>Compartición de datos</h3>
          
          <ol>
            <li>Proveedores de pago como PayPal.</li>
            <li>Servicios de almacenamiento en la nube.</li>
            <li>Autoridades legales cuando sea necesario.</li>
          </ol>
        </li>
        <li>
          <h3 className='text-xl'>Derechos del usuario</h3>
          
          <ol>
            <li>Acceder a sus datos personales.</li>
            <li>Solicitar correcciones o eliminación de datos.</li>
            <li>Retirar el consentimiento para el procesamiento de datos.</li>
            <li>Solicitar la portabilidad de los datos.</li>
          </ol>
        </li>
        <li>
          <h3 className='text-xl'>Retención de datos</h3>
          
          <ol>
            <li>Conservamos los datos solo durante el tiempo necesario para cumplir los propósitos mencionados, salvo que la ley exija lo contrario.</li>
          </ol>
        </li>
      </ol>
      </div>
    </article>
  );
};

export default PoliticaDePrivacidad;