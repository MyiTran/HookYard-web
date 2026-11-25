import PublicPage from "../../components/public/PublicPage";

function ContactPage() {
  return (
    <PublicPage title="Contact">
      <section>
        <h3 className="text-lg font-semibold text-[#1F2A24]">Contact the HookYard team</h3>
        <p>
          For questions about your account, security, privacy, or the service, reach the team using the
          contact details below.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-[#1F2A24]">Email</h3>
        <p className="text-[#8A9990]">[owner contact email]</p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-[#1F2A24]">Response times</h3>
        <p>
          The team reviews messages regularly and responds as capacity allows. Please include enough
          detail to help identify the account or issue you are writing about.
        </p>
      </section>
    </PublicPage>
  );
}

export default ContactPage;
