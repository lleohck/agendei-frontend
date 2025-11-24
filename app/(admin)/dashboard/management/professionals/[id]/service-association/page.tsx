// import { ProfessionalServicesForm } from "../../components/professional-services-form";
import { notFound } from "next/navigation";

// TODO: Você precisará implementar o ProfessionalDAO.getOne no seu backend/frontend.
const mockGetProfessionalData = async (professionalId: string) => {
  // Substitua este mock pela chamada real ao seu ProfessionalDAO
  // const professional = await ProfessionalDAO.getOne(professionalId);

  // Mock de exemplo para permitir o desenvolvimento
  return {
    id: professionalId,
    name: "Mock Professional",
    establishment_id: "76d34f0d-3596-4cac-b8d7-2e07e00a8ed3", // SUBSTITUA PELA LÓGICA DE BUSCA REAL
  };
};

export default async function ProfessionalServiceAssociationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Buscar o profissional para obter o ID do estabelecimento (necessário para listar serviços)
  const professionalData = await mockGetProfessionalData(id);

  if (!professionalData) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Manage Services for: {professionalData.name}
      </h1>
      <p className="text-gray-500 dark:text-gray-400">
        Select which services offered by the establishment are performed by this
        professional.
      </p>

      {/* <ProfessionalServicesForm
        professionalId={id}
        establishmentId={professionalData.establishment_id}
      /> */}
    </div>
  );
}
