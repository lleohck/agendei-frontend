import { AppointmentWizard } from "../components/appointment-wizard";

export default function BookAppointmentPage() {
  return (
    <div className="container mx-auto p-8">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg">
        <AppointmentWizard />
      </div>
    </div>
  );
}
