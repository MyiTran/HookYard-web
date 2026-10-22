function SigningSecretHelp() {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium leading-6 text-[#405348]">
        Verify each incoming request on your server before processing it.
      </p>

      <ol className="list-decimal space-y-2 pl-4 text-xs font-medium leading-5 text-[#607267]">
        <li>Receive the incoming request on your receiver server.</li>
        <li>
          Read <code>webhook-id</code>, <code>webhook-timestamp</code>, and <code>webhook-signature</code> from the
          request headers. HookYard sends these header names in lowercase.
        </li>
        <li>Reject the request if any of the three headers is missing.</li>
        <li>
          Verify the exact raw request body bytes. Do not parse and re-serialize the JSON before verification.
        </li>
        <li>Reject the request when the signature is invalid. Only process the webhook after verification succeeds.</li>
      </ol>

      <dl className="divide-y divide-[#E4EBE6] rounded-xl border border-[#E4EBE6] bg-white">
        <div className="px-3 py-2.5">
          <dt className="text-xs font-semibold text-[#1F2A24]">Signature header</dt>
          <dd className="mt-1 text-xs font-medium leading-5 text-[#607267]">
            <code>webhook-signature</code> has the form <code>{"v1,<Base64 HMAC-SHA256 digest>"}</code>.
          </dd>
        </div>

        <div className="px-3 py-2.5">
          <dt className="text-xs font-semibold text-[#1F2A24]">Signed content</dt>
          <dd className="mt-1 text-xs font-medium leading-5 text-[#607267]">
            <code className="break-all">
              {"${webhook-id}.${webhook-timestamp}.${raw request body}"}
            </code>
          </dd>
        </div>

        <div className="px-3 py-2.5">
          <dt className="text-xs font-semibold text-[#1F2A24]">Algorithm</dt>
          <dd className="mt-1 text-xs font-medium leading-5 text-[#607267]">
            HMAC-SHA256 using the secret's decoded key bytes. Encode the digest with standard Base64, not URL-safe
            Base64.
          </dd>
        </div>

        <div className="px-3 py-2.5">
          <dt className="text-xs font-semibold text-[#1F2A24]">Secret encoding</dt>
          <dd className="mt-1 text-xs font-medium leading-5 text-[#607267]">
            The signing secret is <code>whsec_</code> followed by standard Base64 of 32 random bytes. Decode it before
            using it as the HMAC key.
          </dd>
        </div>

        <div className="px-3 py-2.5">
          <dt className="text-xs font-semibold text-[#1F2A24]">Timestamp</dt>
          <dd className="mt-1 text-xs font-medium leading-5 text-[#607267]">
            <code>webhook-timestamp</code> is Unix seconds and is part of the signed content. Reject timestamps more
            than 5 minutes old or 5 minutes in the future.
          </dd>
        </div>

        <div className="px-3 py-2.5">
          <dt className="text-xs font-semibold text-[#1F2A24]">Payload</dt>
          <dd className="mt-1 text-xs font-medium leading-5 text-[#607267]">
            The signed body is the exact JSON sent for the event, with <code>id</code>, <code>type</code>,{" "}
            <code>created_at</code>, and <code>data</code>. Verify the bytes before parsing.
          </dd>
        </div>

        <div className="px-3 py-2.5">
          <dt className="text-xs font-semibold text-[#1F2A24]">Tracing header</dt>
          <dd className="mt-1 text-xs font-medium leading-5 text-[#607267]">
            <code>webhook-request-id</code> may also be present for tracing and is not part of the signature.
          </dd>
        </div>
      </dl>

      <div className="rounded-xl border border-[#D8E3DB] bg-white px-4 py-3">
        <p className="text-xs font-semibold text-[#1F2A24]">Rotation</p>
        <p className="mt-2 text-xs font-medium leading-5 text-[#607267]">
          After rotation succeeds, newly started delivery attempts use the new secret immediately. An attempt that
          already started before rotation keeps the secret captured when it started.
        </p>
        <p className="mt-2 text-xs font-medium leading-5 text-[#607267]">
          Update your receiver promptly. There is no grace period, dual-secret acceptance, or fallback secret.
        </p>
      </div>
    </div>
  );
}

export default SigningSecretHelp;
