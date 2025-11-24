import { AppointmentWizard } from "./components/appointment-wizard";

// Este ID deve ser obtido dinamicamente no seu sistema real (e.g., via URL params ou contexto do usuário logado)
// **SUBSTITUA ESTE VALOR PELO ID REAL DO ESTABELECIMENTO DE TESTE**
const MOCK_ESTABLISHMENT_ID = "76d34f0d-3596-4cac-b8d7-2e07e00a8ed3";

export default function BookAppointmentPage() {
  if (!MOCK_ESTABLISHMENT_ID) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl text-red-500">
          Error: Establishment ID not found.
        </h1>
        <p>Please select an establishment to book a service.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg">
        <AppointmentWizard establishmentId={MOCK_ESTABLISHMENT_ID} />
      </div>
    </div>
  );
}
