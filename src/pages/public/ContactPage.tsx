import PublicPage from "../../components/public/PublicPage";

function ContactPage() {
  return (
    <PublicPage title="Contact">
      <section>
        <h3 className="text-lg font-semibold text-[#1F2A24]">Contact the HookYard team</h3>
        <p>
          For questions about your account, security, privacy, or the service, reach out to the team
          that operates HookYard.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-[#1F2A24]">What to include</h3>
        <p>
          When you write, include enough detail to help identify the account or issue you are asking
          about, without sharing passwords or other secrets.
        </p>
      </section>
    </PublicPage>
  );
}

export default ContactPage;
