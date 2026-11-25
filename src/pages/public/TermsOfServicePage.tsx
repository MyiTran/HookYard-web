import { Link } from "react-router-dom";
import PublicPage from "../../components/public/PublicPage";

function TermsOfServicePage() {
  return (
    <PublicPage title="Terms of Service" updated="November 2026">
      <section>
        <h3 className="text-lg font-semibold text-[#1F2A24]">Acceptance of terms</h3>
        <p>
          By accessing or using HookYard, you agree to these terms. If you do not agree, do not use the
          service.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-[#1F2A24]">The service</h3>
        <p>
          HookYard is a webhook operations platform that lets you configure endpoints, monitor
          deliveries, investigate failures, and replay webhooks.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-[#1F2A24]">Accounts and security</h3>
        <p>
          You are responsible for maintaining the confidentiality of your account credentials and for
          all activity that occurs under your account.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-[#1F2A24]">Acceptable use</h3>
        <p>You agree not to:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Use the service in a way that violates applicable law.</li>
          <li>Attempt to gain unauthorized access to the service or its systems.</li>
          <li>Interfere with or disrupt the service or its infrastructure.</li>
          <li>Submit content that is unlawful, harmful, or infringes the rights of others.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-[#1F2A24]">Service availability</h3>
        <p>
          The service is provided on an "as is" and "as available" basis. Features may change, and the
          service may be interrupted or discontinued without notice.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-[#1F2A24]">Limitation of liability</h3>
        <p>
          To the maximum extent permitted by law, the operator of HookYard is not liable for indirect,
          incidental, or consequential damages arising from your use of the service.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-[#1F2A24]">Contact</h3>
        <p>
          Questions about these terms can be sent through the{" "}
          <Link to="/contact" className="font-semibold text-[#23613F] hover:underline">
            Contact
          </Link>{" "}
          page.
        </p>
      </section>
    </PublicPage>
  );
}

export default TermsOfServicePage;
