import { Link } from "react-router-dom";
import PublicPage from "../../components/public/PublicPage";

function PrivacyPolicyPage() {
  return (
    <PublicPage title="Privacy Policy" updated="November 2026">
      <section>
        <h3 className="text-lg font-semibold text-[#1F2A24]">Overview</h3>
        <p>
          HookYard is a webhook operations platform for monitoring deliveries, investigating failures,
          and replaying webhooks. This policy describes the information the service processes.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-[#1F2A24]">Account information</h3>
        <p>When you create an account, you provide:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>First name and last name.</li>
          <li>Email address.</li>
          <li>Password.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-[#1F2A24]">Service data</h3>
        <p>The service processes the data you configure and generate, including:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Webhook endpoint URLs.</li>
          <li>Delivery records, including request and response payloads and headers.</li>
          <li>Project, endpoint, and collaborator information.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-[#1F2A24]">How information is used</h3>
        <ul className="list-disc space-y-1 pl-6">
          <li>To authenticate you and provide access to the workspace.</li>
          <li>To deliver, monitor, and replay webhooks.</li>
          <li>To manage projects, endpoints, and collaboration.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-[#1F2A24]">Authentication and storage</h3>
        <p>
          A session token is stored in your browser's local storage and is sent with requests to the
          HookYard backend service. Account and service data are stored and processed by that backend
          service and its hosting providers.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-[#1F2A24]">Cookies and tracking</h3>
        <p>
          The HookYard frontend does not load third-party advertising or analytics trackers. Browser
          local storage is used for the signed-in session token.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-[#1F2A24]">Contact</h3>
        <p>
          Questions about this policy can be sent through the{" "}
          <Link to="/contact" className="font-semibold text-[#23613F] hover:underline">
            Contact
          </Link>{" "}
          page.
        </p>
      </section>
    </PublicPage>
  );
}

export default PrivacyPolicyPage;
